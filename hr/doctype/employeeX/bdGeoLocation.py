#	Author:Minhaz Uddin
#	Date:17/08/2019
#	Author:Shariful Islam
#	Date:17/08/2019



import frappe
@frappe.whitelist()
@frappe.whitelist()
def get_all_divisions():
    divisions_name = frappe.db.sql("SELECT  id, name FROM divisions ORDER BY name")
    return divisions_name

@frappe.whitelist()
def get_all_district(division_id):
    districts = frappe.db.sql("SELECT * FROM districts where division_id=%s order by name", division_id)
    return districts

@frappe.whitelist() 
def get_all_thana(district):
    thanas = frappe.db.sql("SELECT * FROM allthana WHERE district=%s order by thana ",district)
    return thanas

@frappe.whitelist()
def get_all_postal_info(thana):
    postalInfo = frappe.db.sql("SELECT * FROM allpostlinfo WHERE thana=%s order by postoffice ",thana)
    return postalInfo


#	Author:Shariful Islam
#	Date:09/10/2019


@frappe.whitelist()
def get_all_parent():
	parentInfo = frappe.db.sql("SELECT DISTINCT parent_department,department_name FROM tabDepartment")
	return parentInfo


@frappe.whitelist()
def get_all_branch():
	branchInfo = frappe.db.sql("SELECT DISTINCT name FROM tabBranch")
	return branchInfo


@frappe.whitelist()
def get_all_department(bname):
	department = bname.strip()
	departmentInfo = frappe.db.sql("SELECT department_name from tabDepartment where parent_department LIKE '%"+department+"%'")
	return departmentInfo

@frappe.whitelist()
def get_all_group(pname):
	group = pname.strip()
	groupInfo = frappe.db.sql("SELECT department_name from tabDepartment where parent_department LIKE '%"+group+"%'")
	return groupInfo


@frappe.whitelist()
def get_all_division(dname):
	division = dname.strip()
	divisionInfo = frappe.db.sql("SELECT department_name from tabDepartment where parent_department LIKE '%"+division+"%'")
	return divisionInfo

@frappe.whitelist()
def load_child(parentName):
	parent = parentName.strip()
	childInfo = frappe.db.sql("SELECT department_name from tabDepartment where parent_department LIKE '%"+parent+"%'")
	return childInfo

@frappe.whitelist()
def load_child_equal(parentName):
        parent = parentName.strip()
	print(parent)
#        childInfo = frappe.db.sql("SELECT department_name from tabDepartment where parent_department LIKE '%"+parent+"%'")
	childInfo = frappe.db.sql("SELECT department_name from tabDepartment where parent_department = '"+parent+"'")
        return childInfo

#	Author:Md Kamrul Hasan
#	10th December 2019


@frappe.whitelist()
def get_all_divisions_address():
    divisions = frappe.db.sql("SELECT DISTINCT location_name FROM tabLocation where parent_location is null")
    return divisions

@frappe.whitelist()
def get_all_district_address(parentName):
    childInfo = frappe.db.sql("SELECT location_name from tabLocation where parent_location = '"+parentName+"'")
    return childInfo

@frappe.whitelist()
def get_all_divisions_address2():
    divisions = frappe.db.sql("SELECT DISTINCT location_name FROM tabLocation where parent_location is null")
    return divisions
