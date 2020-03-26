#   Author:Minhaz Uddin
#   Date:25/09/2019
#   Author:Shariful Islam
#   Date:25/09/2019
import frappe
@frappe.whitelist()
def get_all_department_tree():
	department_tree = frappe.db.sql("SELECT parent, name FROM tabDepartment")
	return department_tree
