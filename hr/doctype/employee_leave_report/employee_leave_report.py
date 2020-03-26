# -*- coding: utf-8 -*-
# Copyright (c) 2020, Frappe Technologies Pvt. Ltd. and contributors
# For license information, please see license.txt



from __future__ import unicode_literals
import frappe

from frappe import _
from frappe.utils import cint, cstr, date_diff, flt, formatdate, getdate, get_link_to_form, \
	comma_or, get_fullname, add_days, nowdate
from erpnext.hr.utils import set_employee_name, get_leave_period
from erpnext.hr.doctype.leave_block_list.leave_block_list import get_applicable_block_dates
from erpnext.hr.doctype.employee.employee import get_holiday_list_for_employee
from erpnext.buying.doctype.supplier_scorecard.supplier_scorecard import daterange

class LeaveDayBlockedError(frappe.ValidationError): pass
class OverlapError(frappe.ValidationError): pass
class AttendanceAlreadyMarkedError(frappe.ValidationError): pass
class NotAnOptionalHoliday(frappe.ValidationError): pass

from frappe.model.document import Document

class EmployeeLeaveReport(Document):



	def get_feed(self):
		return _("{0}: From {0} of type {1}").format(self.employee_name, self.leave_type)


	def validate_balance_leaves(self):
		if self.from_date and self.to_date:
			self.total_leave_days = get_number_of_leave_days(self.employee, self.leave_type,
				self.from_date, self.to_date, self.half_day, self.half_day_date)

			if self.total_leave_days <= 0:
				frappe.throw(_("The day(s) on which you are applying for leave are holidays. You need not apply for leave."))

			if not is_lwp(self.leave_type):
				self.leave_balance = get_leave_balance_on(self.employee, self.leave_type, self.from_date, docname=self.name,
					consider_all_leaves_in_the_allocation_period=True)
				if self.status != "Rejected" and self.leave_balance < self.total_leave_days:
					if frappe.db.get_value("Leave Type", self.leave_type, "allow_negative"):
						frappe.msgprint(_("Note: There is not enough leave balance for Leave Type {0}")
							.format(self.leave_type))
					else:
						frappe.throw(_("There is not enough leave balance for Leave Type {0}")
							.format(self.leave_type))



@frappe.whitelist()
def get_leave_details(employee, date):
	allocation_records = get_leave_allocation_records(date, employee).get(employee, frappe._dict())
	leave_allocation = {}
	for d in allocation_records:
		allocation = allocation_records.get(d, frappe._dict())
		date = allocation.to_date
		leaves_taken = get_leaves_for_period(employee, d, allocation.from_date, date, status="Approved")
		leaves_pending = get_leaves_for_period(employee, d, allocation.from_date, date, status="Open")
		remaining_leaves = allocation.total_leaves_allocated - leaves_taken - leaves_pending
		leave_allocation[d] = {
			"total_leaves": allocation.total_leaves_allocated,
			"leaves_taken": leaves_taken,
			"pending_leaves": leaves_pending,
			"remaining_leaves": remaining_leaves}


	ret = {
		'leave_allocation': leave_allocation,
		'leave_approver': get_leave_approver(employee)
	}


	return ret

@frappe.whitelist()
def get_leave_balance_on(employee, leave_type, date, allocation_records=None, docname=None,
		consider_all_leaves_in_the_allocation_period=False, consider_encashed_leaves=True):

	if allocation_records == None:
		allocation_records = get_leave_allocation_records(date, employee).get(employee, frappe._dict())
	allocation = allocation_records.get(leave_type, frappe._dict())
	if consider_all_leaves_in_the_allocation_period:
		date = allocation.to_date
	leaves_taken = get_leaves_for_period(employee, leave_type, allocation.from_date, date, status="Approved", docname=docname)
	leaves_encashed = 0
	if frappe.db.get_value("Leave Type", leave_type, 'allow_encashment') and consider_encashed_leaves:
		leaves_encashed = flt(allocation.total_leaves_encashed)

	return flt(allocation.total_leaves_allocated) - (flt(leaves_taken) + flt(leaves_encashed))

def get_leaves_for_period(employee, leave_type, from_date, to_date, status, docname=None):
	leave_applications = frappe.db.sql("""
		select name, employee, leave_type, from_date, to_date, total_leave_days
		from `tabLeave Application`
		where employee=%(employee)s and leave_type=%(leave_type)s
			and status = %(status)s and docstatus != 2
			and (from_date between %(from_date)s and %(to_date)s
				or to_date between %(from_date)s and %(to_date)s
				or (from_date < %(from_date)s and to_date > %(to_date)s))
	""", {
		"from_date": from_date,
		"to_date": to_date,
		"employee": employee,
		"status": status,
		"leave_type": leave_type
	}, as_dict=1)
	leave_days = 0
	for leave_app in leave_applications:
		if docname and leave_app.name == docname:
			continue
		if leave_app.from_date >= getdate(from_date) and leave_app.to_date <= getdate(to_date):
			leave_days += leave_app.total_leave_days
		else:
			if leave_app.from_date < getdate(from_date):
				leave_app.from_date = from_date
			if leave_app.to_date > getdate(to_date):
				leave_app.to_date = to_date

			leave_days += get_number_of_leave_days(employee, leave_type,
				leave_app.from_date, leave_app.to_date)

	return leave_days

def get_leave_allocation_records(date, employee=None):
	conditions = (" and employee='%s'" % employee) if employee else ""

	leave_allocation_records = frappe.db.sql("""
		select employee, leave_type, total_leaves_allocated, total_leaves_encashed, from_date, to_date
		from `tabLeave Allocation`
		where %s between from_date and to_date and docstatus=1 {0}""".format(conditions), (date), as_dict=1)

	allocated_leaves = frappe._dict()
	for d in leave_allocation_records:
		allocated_leaves.setdefault(d.employee, frappe._dict()).setdefault(d.leave_type, frappe._dict({
			"from_date": d.from_date,
			"to_date": d.to_date,
			"total_leaves_allocated": d.total_leaves_allocated,
			"total_leaves_encashed":d.total_leaves_encashed
		}))
	return allocated_leaves



@frappe.whitelist()
def get_number_of_leave_days(employee, leave_type, from_date, to_date, half_day = None, half_day_date = None):
	number_of_days = 0
	if cint(half_day) == 1:
		if from_date == to_date:
			number_of_days = 0.5
		else:
			number_of_days = date_diff(to_date, from_date) + .5
	else:
		number_of_days = date_diff(to_date, from_date) + 1

	if not frappe.db.get_value("Leave Type", leave_type, "include_holiday"):
		number_of_days = flt(number_of_days) - flt(get_holidays(employee, from_date, to_date))
	return number_of_days


