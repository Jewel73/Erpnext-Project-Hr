import frappe
@frappe.whitelist()
@frappe.whitelist()
def get_all_assign_ip(parent):
    ip = frappe.db.sql("SELECT tabEmployee.employee, `tabIn Device`.ip_address from tabEmployee , `tabIn Device` where tabEmployee.employee = '"+parent+"'")
    return ip
