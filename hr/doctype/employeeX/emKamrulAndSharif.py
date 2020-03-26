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

