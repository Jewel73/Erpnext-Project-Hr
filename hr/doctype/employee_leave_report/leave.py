from __future__ import unicode_literals

import frappe
import random


@frappe.whitelist()
def insertLeave(employee,parent,leaveType,totalAllocated,usedLeaves,pending,available):
	frappe.db.sql("DELETE FROM `tabAllocated Leaves` where leave_type = '"+str(leaveType)+"' AND parent IN ('"+str(parent)+"', 'New Employee Leave Report 1')")
	parentInfo = frappe.db.sql("INSERT INTO `tabAllocated Leaves` (name, parent, parentfield, parenttype, docstatus, leave_type, total_allocated_leaves, used_leaves, pending_leaves, available_leaves) VALUES('"+str(random.randint(1,10000000))+"','"+str(parent)+"','allocated_leaves','Employee Leave Report',1,'"+str(leaveType)+"','"+str(totalAllocated)+"','"+str(usedLeaves)+"','"+str(pending)+"','"+str(available)+"') ")
	return parentInfo


