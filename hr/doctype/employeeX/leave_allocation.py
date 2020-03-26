from __future__ import unicode_literals
import frappe
import json


@frappe.whitelist()
def leave_allocate(employee,leave_allocation):
	empl = frappe.get_doc("Employee", employee)

	print("***************************empl*******************************")
	print(empl)

	print("***************************leave_allocation*******************************")
	print(leave_allocation)

	print("***************************Leave Type*******************************")
	la = json.loads(leave_allocation)
	print(la['leave_type'])


	employee_name = empl.employee_name.split(" ")
	middle_name = last_name = ""

	if len(employee_name) >= 3:
		last_name = " ".join(employee_name[2:])
		middle_name = employee_name[1]
	elif len(employee_name) == 2:
		last_name = employee_name[1]

	first_name = employee_name[0]

	assign = frappe.new_doc("Leave Allocation")

	assign.update({
		"employee": empl.employee,
		"employee_name": empl.employee_name,
		"department": empl.department,
		"leave_type": la['leave_type'],
		"from_date": la['from_date'],
		"to_date": la['to_date'],
		"new_leaves_allocated": la['new_leaves_allocated'],
		"docstatus": 1
	})
	assign.insert()
	return assign.name

