# -*- coding: utf-8 -*-
# Copyright (c) 2019, Frappe Technologies Pvt. Ltd. and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe


@frappe.whitelist()
def get_all_parent():
	parent = "All Departments"
	parentInfo = frappe.db.sql("SELECT DISTINCT department_name FROM tabDepartment where parent_department='"+parent+"'")
	return parentInfo

