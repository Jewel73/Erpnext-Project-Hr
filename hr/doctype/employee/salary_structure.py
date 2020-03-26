from __future__ import unicode_literals
import frappe

@frappe.whitelist()
def salary_assign(employee,salary,salary_structure,effective_date):
	empl = frappe.get_doc("Employee", employee)

	employee_name = empl.employee_name.split(" ")
	middle_name = last_name = ""

	if len(employee_name) >= 3:
		last_name = " ".join(employee_name[2:])
		middle_name = employee_name[1]
	elif len(employee_name) == 2:
		last_name = employee_name[1]

	first_name = employee_name[0]

	assign = frappe.new_doc("Salary Structure Assignment")

	assign.update({
		"employee": employee,
		"employee_name": empl.employee_name,
		"department": empl.department,
		"designation": empl.designation,
		"salary_structure": salary_structure,
		"from_date": effective_date,
		"company": empl.company,
		"base": salary,
		"docstatus":1
	})
	assign.insert()
	return assign.name


@frappe.whitelist()
def delete_salary(employee):
    salary = frappe.db.sql("DELETE FROM `tabSalary Structure Assignment` WHERE employee = '"+employee+"'")
    return salary;
