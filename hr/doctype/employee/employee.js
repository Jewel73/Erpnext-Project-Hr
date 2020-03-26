// Copyright (c) 2015, Frappe Technologies Pvt. Ltd. and Contributors
// License: GNU General Public License v3. See license.txt

frappe.provide("erpnext.hr");
erpnext.hr.EmployeeController = frappe.ui.form.Controller.extend({
	setup: function() {
		this.frm.fields_dict.user_id.get_query = function(doc, cdt, cdn) {
			return {
				query: "frappe.core.doctype.user.user.user_query",
				filters: {ignore_user_type: 1}
			}
		}
		this.frm.fields_dict.reports_to.get_query = function(doc, cdt, cdn) {
			return { query: "erpnext.controllers.queries.employee_query"} }
		},

		refresh: function() {
			var me = this;
			erpnext.toggle_naming_series();
		},

		date_of_birth: function() {
			return cur_frm.call({
				method: "get_retirement_date",
				args: {date_of_birth: this.frm.doc.date_of_birth}
			});
		},

		salutation: function() {
			if(this.frm.doc.salutation) {
				this.frm.set_value("gender", {
					"Mr": "Male",
					"Ms": "Female"
				}[this.frm.doc.salutation]);
			}
		},

	});
frappe.ui.form.on('Employee',{
	setup: function(frm) {
		frm.set_query("leave_policy", function() {
			return {
				"filters": {
					"docstatus": 1
				}
			};
		});
	},
	onload:function(frm) {
		frm.set_query("department", function() {
			return {
				"filters": {
					"company": frm.doc.company,
				}
			};
		});
	},

	prefered_contact_email:function(frm){		
		frm.events.update_contact(frm)		
	},
	personal_email:function(frm){
		frm.events.update_contact(frm)
	},
	company_email:function(frm){
		frm.events.update_contact(frm)
	},
	user_id:function(frm){
		frm.events.update_contact(frm)
	},
	update_contact:function(frm){
		var prefered_email_fieldname = frappe.model.scrub(frm.doc.prefered_contact_email) || 'user_id';
		frm.set_value("prefered_email",
			frm.fields_dict[prefered_email_fieldname].value)
	},
	status: function(frm) {
		return frm.call({
			method: "deactivate_sales_person",
			args: {
				employee: frm.doc.employee,
				status: frm.doc.status
			}
		});
	},

/*

----------------------------------
		Preferred Mobile no
----------------------------------


*/
select_preferred_mobile_no:function(frm){		
	frm.events.update_contact_no(frm)		
},
personal_mobile_no:function(frm){
	frm.events.update_contact_no(frm)
},
official_mobile_no:function(frm){
	frm.events.update_contact_no(frm)
},

update_contact_no:function(frm){
	var select_preferred_mobile_no_fieldname = frappe.model.scrub(frm.doc.select_preferred_mobile_no);
	frm.set_value("preferred_mobile_no",
		frm.fields_dict[select_preferred_mobile_no_fieldname].value)
},

create_user: function(frm) {
	if (!frm.doc.prefered_email)
	{
		frappe.throw(__("Please enter Preferred Contact Email"))
	}
	frappe.call({
		method: "erpnext.hr.doctype.employee.employee.create_user",
		args: { employee: frm.doc.name, email: frm.doc.prefered_email },
		callback: function(r)
		{
			frm.set_value("user_id", r.message)
		}
	});
},

});
cur_frm.cscript = new erpnext.hr.EmployeeController({frm: cur_frm});


/*-----------------------Leave Allocated Method-----------------------------*/
/*
												Author Md Kamrul Hasan
												23th December,2019
												*/
/*--------------------------------------------------------------------------
*/

function allocatedLeave(employee,leave_allocation){
	console.log(leave_allocation);
	console.log("EMPLOYEE" +employee);
	for(var i = 0; i < leave_allocation.length; i++){

		frappe.call({
			method: "erpnext.hr.doctype.employee.leave_allocation.leave_allocate",
			args: {"employee":employee,"leave_allocation": leave_allocation[i]},
			callback: function(r, rt) {
				console.log("Saved method: allocatedLeave");
				console.log('callback-'+leave_allocation[i]);
				frappe.msgprint("Leave Allocation Successfully Saved");
			}
		}); 
	}
}
frappe.ui.form.on("Employee", {
	assign_leave_allocated: function(frm) {
		console.log(frm.doc.employee+'-'+frm.doc.leave_allocation); 
		allocatedLeave(frm.doc.employee,frm.doc.leave_allocation);
	}
});


/*======================================================================*/
/*------------Dependent Brunch Section--------------------*/

/*
	 Author:Shariful Islam
	 Date:09/10/2019


	 */

	 frappe.ui.form.on('Employee', {
	 	refresh: function(frm) {

	 		loadBranch(frm,"branch_name");

	 		var doc = frm.doc;

	 		if (doc.branch_name != null) {

	 			loadDept(frm);

	 		}

	 		if(doc.department_name != null){
	 			loadChild(frm, 'section', doc.department_name);
	 		}

	 		if(doc.section != null){
	 			loadChild(frm, 'sub_section', doc.section);
	 		}

	 		if(doc.division_name != null){
	 			newLoadChild(frm,"area_name",doc.division_name);

	 		}

	 		if(doc.area_name != null){
	 			newLoadChild(frm,"territory_name",doc.area_name);

	 		}

	 		if(doc.area_name != null){
	 			loadDivisionGroup(frm, 'Division');
	 			loadDivisionGroup(frm, 'Group');
	 		}
	 	}
	 });

	 function loadBranch(frm,b_name){
	 	var branchName=[];

	 	frappe.call({
	 		method: "erpnext.hr.doctype.employee.dtree.get_all_parent",
	 		callback: function(r, rt) {
	 			if(r.message) {
	 				var branchs=r.message;
	 				for(var i=0;i<branchs.length;i++ ){
	 					branchName.push(branchs[i][0]);
	 				}

	 				frm.set_df_property(b_name, 'options',branchName);
	 			}
	 		}
	 	}); 
	 }

	 function loadDept(frm){
	 	var deptName=[];

	 	frappe.call({
	 		method: "erpnext.hr.doctype.employee.bdGeoLocation.load_child_equal",

	 		args: {"parentName": frm.doc.branch_name},
	 		callback: function(r, rt) {

	 			if(r.message) {
	 				var dept=r.message;

	 				for(var i=0;i<dept.length;i++ ){
	 					deptName.push(dept[i][0]);
	 				}

	 				frm.set_df_property('department_name', 'options',deptName);
	 			}
	 		}
	 	}); 
	 }

	 var departmentName=[];
	 function loadDepartment(frm,d_name,branch_value){
	 	departmentName=[];
	 	frappe.call({
	 		method: "erpnext.hr.doctype.employee.bdGeoLocation.get_all_department",
	 		args: {"bname":branch_value},
	 		callback: function(r, rt) {
	 			if(r.message) {
	 				var departments=r.message;
	 				for(var i=0;i<departments.length;i++ ){
	 					departmentName.push(departments[i][0]);
	 				}

	 				if (branch_value=="Sales & Marketing") {

	 					loadSalesChild(frm.doc.branch_name);
					//MIH2020115                  
					loadDivisionGroup(frm, 'Division');
					loadDivisionGroup(frm, 'Group');
				}
				else{
					frm.set_df_property(d_name, 'options',departmentName);

				}
			}
		}
	}); 
	 }


	 var salesChildName=[];
	 function loadSalesChild(d_name){
	 	salesChildName=[];
	 	frappe.call({
	 		method: "erpnext.hr.doctype.employee.bdGeoLocation.load_child",
	 		async: false,
	 		args: {"parentName":d_name},
	 		callback: function(r, rt) {
	 			if(r.message) {
	 				var childs=r.message;
	 				for(var i=0;i<childs.length;i++ ){
	 					salesChildName.push(childs[i][0]);
	 				}
	 			}        
	 		}
	 	}); 
	 }

	 function loadDivisionGroup(frm, branchChild){

	 	var args = null, methodName = null, fieldName = null;

	 	if(branchChild == 'Division'){
	 		args 		= {'dname':branchChild};
	 		methodName 	= 'get_all_division';
	 		fieldName 	= 'division_name';
	 	}
	 	else if(branchChild == 'Group'){
	 		args 		= {'pname':branchChild};
	 		methodName 	= 'get_all_group';
	 		fieldName 	= 'group_name';
	 	}

	 	var childName=[];
	 	frappe.call({
	 		method: "erpnext.hr.doctype.employee.bdGeoLocation." + methodName,
	 		async: false,
	 		args: args,
	 		callback: function(r, rt) {
	 			if(r.message) {
	 				var childs=r.message;

	 				for(var i=0;i<childs.length;i++ ){
	 					childName.push(childs[i]);
	 				}
	 				frm.set_df_property(fieldName, 'options',childName);
	 			}        
	 		}
	 	}); 
	 }



	 var childName=[];
	 function loadChild(frm,field_name,parentName){

	 	console.log(field_name + '  '+ parentName);

	 	childName=[];
	 	frappe.call({
	 		method: "erpnext.hr.doctype.employee.bdGeoLocation.load_child",
	 		async: false,
	 		args: {"parentName":parentName},
	 		callback: function(r, rt) {
	 			if(r.message) {
	 				var childs=r.message;
	 				for(var i=0;i<childs.length;i++ ){
	 					childName.push(childs[i][0]);
	 				}
	 				if(childName.length== 0){

	 				}
	 				else{
	 					frm.toggle_display(field_name, true);
	 				}

	 				frm.set_df_property(field_name, 'options',childName);
	 			}        
	 		}
	 	}); 
	 }


	 var nChildArray=[];
	 function newLoadChild(frm,field_name,d_name){

	 	nChildArray=[];
	 	console.log(d_name);
	 	frappe.call({
	 		method: "erpnext.hr.doctype.employee.bdGeoLocation.load_child_equal",
	 		async: false,
	 		args: {"parentName":d_name},
	 		callback: function(r, rt) {

	 			if(r.message) {
	 				var childs=r.message;

	 				for(var i=0;i<childs.length;i++ ){
	 					nChildArray.push(childs[i][0]);
	 				}

	 				console.log(nChildArray);
	 				frm.set_df_property(field_name, 'options',nChildArray);
	 			}
	 		}
	 	}); 
	 }

	 var territoryName=[];
	 function loadTerritory(frm,field_name,d_name){

	 	territoryName=[];
	 	frappe.call({
	 		method: "erpnext.hr.doctype.employee.bdGeoLocation.load_child",
	 		async: false,
	 		args: {"parentName":d_name},
	 		callback: function(r, rt) {

	 			if(r.message) {
	 				var childs=r.message;
	 				for(var i=0;i<childs.length;i++ ){
	 					territoryName.push(childs[i][0]);
	 				}

	 				frm.set_df_property(field_name, 'options',territoryName);
	 			}
	 		}
	 	});
	 }

	 frappe.ui.form.on("Employee", {

	 	branch_name: function(frm) {

	 		frm.toggle_display('sub_section', false);

	 		loadDepartment(frm,"department_name",frm.doc.branch_name);

	 		var value =frm.doc.branch_name;

	 		if(value.includes("Sales & Marketing") || value.includes("Management")){

	 			frm.set_value("branch",frm.doc.branch_name);
	 			frm.set_value("department",frm.doc.branch_name);
	 		}
	 		else{

	 			frm.set_value("branch",frm.doc.branch_name);
	 		}
	 	}
	 });

	 frappe.ui.form.on("Employee", {

	 	department_name: function(frm) {

	 		frm.toggle_display('sub_section', false);

	 		frm.set_value("department",frm.doc.department_name);
	 		frm.set_value("section",frm.doc.section);


	 		loadChild(frm,"section",frm.doc.department_name);

	 	}
	 });

	 frappe.ui.form.on("Employee", {

	 	section: function(frm) {

	 		loadChild(frm,"sub_section",frm.doc.section);

	 		frm.toggle_display('sub_section', true);
	 	}
	 });

	 frappe.ui.form.on("Employee", {

	 	division_name: function(frm) {	

	 		newLoadChild(frm,"area_name",frm.doc.division_name);

	 		frm.set_value('territory_name', null);
	 	}
	 });

	 frappe.ui.form.on("Employee", {

	 	area_name: function(frm) { 

	 		loadTerritory(frm,"territory_name",frm.doc.area_name);
	 	}
	 });


//***************************Address Tree**********
/*
Author:Md Kamrul hasan
10th December 2019
*/


frappe.ui.form.on('Employee', {
	refresh: function(frm) {

		var doc = frm.doc;

		loadDivisionAddress2(frm, 'division2');

		if (doc.division2 != null) {
			loadChildAddress(frm,'district_name_2',doc.division2);
		}

		if (doc.district_name_2 != null) {
			loadChildAddress(frm,'thana_name_2',doc.district_name_2);
		}

		if (doc.thana_name_2 != null) {
			loadChildAddress(frm,'post_office_name_2',doc.thana_name_2);
		}


		if (doc.post_office_name_2 != null) {
			loadChildAddress(frm,'post_code_2',doc.post_office_name_2);
		}



		loadDivisionAddress(frm, 'division');

		if (doc.division != null) {
			loadChildAddress(frm,'district_name',doc.division);
		}

		if (doc.district_name_2 != null) {
			loadChildAddress(frm,'thana_name',doc.district_name);
		}

		if (doc.thana_name_2 != null) {
			loadChildAddress(frm,'post_office_name',doc.thana_name);
		}


		if (doc.post_office_name_2 != null) {
			loadChildAddress(frm,'post_code',doc.post_office_name);
		}

	}
});

var divisionName=[];
function loadDivisionAddress(frm,field_name){
	divisionName=[];
	frappe.call({
		method: "erpnext.hr.doctype.employee.bdGeoLocation.get_all_divisions_address",
		callback: function(r, rt) {
			if(r.message) {
				var childs=r.message;
				for(var i=0;i<childs.length;i++ ){
					divisionName.push(childs[i][0]);
				}
				frm.set_df_property(field_name, 'options',divisionName);    
			}        
		}
	}); 
}

var divisionName2=[];
function loadDivisionAddress2(frm,field_name){
	divisionName2=[];
	frappe.call({
		method: "erpnext.hr.doctype.employee.bdGeoLocation.get_all_divisions_address2",
		callback: function(r, rt) {
			if(r.message) {
				var childs=r.message;
				for(var i=0;i<childs.length;i++ ){
					divisionName2.push(childs[i][0]);
				}
				frm.set_df_property(field_name, 'options',divisionName2);   
			}        
		}
	}); 
}

var childName=[];
function loadChildAddress(frm,field_name,d_name){
	childName=[];
	frappe.call({
		method: "erpnext.hr.doctype.employee.bdGeoLocation.get_all_district_address",
		async: false,
		args: {"parentName":d_name},
		callback: function(r, rt) {
			if(r.message) {
				var childs=r.message;
				for(var i=0;i<childs.length;i++ ){
					childName.push(childs[i][0]);
				}
				frm.set_df_property(field_name, 'options',childName);
			}        
		}
	}); 
}

frappe.ui.form.on("Employee", {
	division: function(frm) {
		frm.toggle_display('district_name', true);
		frm.toggle_display('thana_name', false);
		frm.toggle_display('post_office_name', false);
		frm.toggle_display('post_code', false);
		loadChildAddress(frm,'district_name', frm.doc.division);
	}
});

frappe.ui.form.on("Employee", {
	district_name: function(frm) {
		frm.toggle_display('thana_name', true);
		loadChildAddress(frm,'thana_name', frm.doc.district_name);
	}
});

frappe.ui.form.on("Employee", {
	thana_name: function(frm) {
		frm.toggle_display('post_office_name', true);
		loadChildAddress(frm,'post_office_name', frm.doc.thana_name);
	}
});

frappe.ui.form.on("Employee", {
	post_office_name: function(frm) {
		frm.toggle_display('post_code', true);
		loadChildAddress(frm,'post_code', frm.doc.post_office_name);
	}
});


/***********************Division 02**************************/


frappe.ui.form.on("Employee", {
	division2: function(frm) {
		frm.toggle_display('district_name_2', true);
		frm.toggle_display('thana_name_2', false);
		frm.toggle_display('post_office_name_2', false);
		frm.toggle_display('post_code_2', false);
		loadChildAddress(frm,'district_name_2', frm.doc.division2);
	}
});

frappe.ui.form.on("Employee", {
	district_name_2: function(frm) {
		frm.toggle_display('thana_name_2', true);
		loadChildAddress(frm,'thana_name_2', frm.doc.district_name_2);
	}
});

frappe.ui.form.on("Employee", {
	thana_name_2: function(frm) {
		frm.toggle_display('post_office_name_2', true);
		loadChildAddress(frm,'post_office_name_2', frm.doc.thana_name_2);
	}
});

frappe.ui.form.on("Employee", {
	post_office_name_2: function(frm) {
		frm.toggle_display('post_code_2', true);
		loadChildAddress(frm,'post_code_2', frm.doc.post_office_name_2);
	}
});

/****************Permanent same to Present****************/

frappe.ui.form.on("Employee",{
	same_as:function(frm){
		if (frm.doc.same_as == 1) {
			if (frm.doc.division2 != null && frm.doc.district_name_2 != null && frm.doc.thana_name_2 != null && frm.doc.post_office_name_2 != null && frm.doc.post_code_2) {
				cur_frm.set_value("division",frm.doc.division2);
				cur_frm.set_value("district_name",frm.doc.district_name_2);
				cur_frm.set_value("thana_name",frm.doc.thana_name_2);
				cur_frm.set_value("post_office_name",frm.doc.post_office_name_2);
				cur_frm.set_value("post_code",frm.doc.post_code_2);
				cur_frm.set_value("vill_name", frm.doc.vill_name_2);
				cur_frm.set_value("road", frm.doc.road_no);
				cur_frm.set_value("house_present", frm.doc.house_permanent);
				frm.toggle_display('division', true);
				frm.toggle_display('district_name', true);
				frm.toggle_display('thana_name', true);
				frm.toggle_display('post_office_name', true);
				frm.toggle_display('post_code', true);
			}
		}
		else if(frm.doc.same_as==0){
			cur_frm.set_value("division", "");
			cur_frm.set_value("district_name", "");
			cur_frm.set_value("thana_name", "");
			cur_frm.set_value("post_office_name", "");
			cur_frm.set_value("post_code", "");
			cur_frm.set_value("vill_name", "");
			cur_frm.set_value("road", "");
			cur_frm.set_value("house_present", "");

			frm.toggle_display('district_name', false);
			cur_frm.toggle_display('thana_name', false);
			cur_frm.toggle_display('post_office_name', false);
			cur_frm.toggle_display('post_code', false);
		}
	}
});
/*
*
*		Mutli Device 
*------------------------------------------------
*	Author: Md Kamrul Hasan
*	15th December, 2019
*/

function saveToMachine(uid,name,password,card,device_select,user_id){
	var msg = 'IP Saved Successfully to Device';
	for(var i = 0; i < device_select.length; i++){

		frappe.call({
			method: "erpnext.hr.doctype.employee.callzk.save_insert",
			args: {"uid":uid,"name": name,"password":password,"card":card,"device_select": device_select[i].device_ip,"user_id":user_id}
		});

		msg = msg +'<br>'+ device_select[i].device_ip;
	}

	frappe.msgprint(msg);
}

frappe.ui.form.on("Employee", {
	save_to_in: function(frm) {
		console.log(frm.doc.device_select+' '+frm.doc.uid+' '+ frm.doc.emp_name+'-'+ frm.doc.password+'-'+frm.doc.card); 
		saveToMachine(frm.doc.uid, frm.doc.emp_name,frm.doc.password, frm.doc.card, frm.doc.device_select,frm.doc.bio_user_id);
	}
});


function deleteFromMachine(uid,device_select){
	var msg = 'IP Removed Successfully';

	for(var i = 0; i < device_select.length; i++){

		if(device_select[i].__checked){
			frappe.call({
				method: "erpnext.hr.doctype.employee.callzk.remove_user",
				args: {"uid":uid,"device_select": device_select[i].device_ip}
			});
			msg = msg +'<br>'+ device_select[i].device_ip;
		}
	}
	frappe.msgprint(msg);
}


frappe.ui.form.on("Employee", {
	remove_from_in: function(frm) {
		console.log(frm.doc.uid+' '+frm.doc.device_select);
		deleteFromMachine(frm.doc.uid,frm.doc.device_select);
	}
});


// uid auto generate

frappe.ui.form.on("Employee",{
	emp_id:function(frm){
		
		var regex = /[\d]/g;
		var str = frm.doc.emp_id;

		var number = str.match(regex).join([]);

		var bio_id = number.replace(/\b0+/g, '');

		console.log("Employee Staff Id : "+bio_id);

		if (str == null) {
			frappe.msgprint("Please Enter Your Staff Id");
			return;
		}

		if (str != null) {

			frm.set_value("bio_user_id",bio_id);

			console.log("Employee Staff Id :"+frm.doc.bio_user_id);
		}
		
	}
});


function IDGenerator() {

	this.length = 4;
	this.timestamp = +new Date;

	var _getRandomInt = function( min, max ) {
		return Math.floor( Math.random() * ( max - min + 1 ) ) + min;
	}

	this.generate = function() {
		var ts = this.timestamp.toString();
		var parts = ts.split( "" ).reverse();
		var id = "";

		for( var i = 0; i < this.length; ++i ) {
			var index = _getRandomInt( 0, parts.length - 1 );
			id += parts[index];

		}

		return id.replace(/\b0+/g, '');
	}
}


frappe.ui.form.on("Employee",{

	refresh:function(frm){

		var generator = new IDGenerator();
		var d = generator.generate();
		var uid = frm.doc.uid;

		if (uid == null) {
			frm.set_value("uid",d);
		}	 
	}
});



frappe.ui.form.on("Employee",{

	first_name:function(frm){
		generateFullName(frm);
	}
});

frappe.ui.form.on("Employee",{

	middle_name:function(frm){
		generateFullName(frm);
	}

});

frappe.ui.form.on("Employee",{

	last_name:function(frm){
		generateFullName(frm);
	}
});

function generateFullName(frm){
	
	var firstName 	= frm.doc.first_name, 
	middleName 	= frm.doc.middle_name,
	lastName 	= frm.doc.last_name, 
	fullName 	= null;

	if(firstName == null || firstName == '' || firstName == 'undefined'){

		frappe.msgprint("Please Enter First name");
		return;
	}

	if(firstName != null && middleName == null && lastName == null ){
		fullName = firstName;
	}

	else if(firstName != null && middleName == null && lastName != null ){
		fullName = firstName + ' ' + lastName;
	}

	else if(firstName != null && middleName != null && lastName == null ){
		fullName = firstName + ' ' + middleName;
	}

	else if(firstName != null && middleName != null && lastName != null ){
		fullName = firstName + ' ' + middleName + ' '+ lastName;
	}

	console.log(fullName);

	frm.set_value('emp_name', fullName);
}

function deleteAssignSalary(employee){
	frappe.call({
		method: "erpnext.hr.doctype.employee.salary_structure.delete_salary",
		args: {"employee":employee},
		callback: function(r, rt) {
			frappe.msgprint("Successfully Salary Structure Removed");
		}
	}); 
}
frappe.ui.form.on("Employee", {
	remove_salary_structure: function(frm) {
		deleteAssignSalary(frm.doc.employee);
		frm.set_value("salary",null)
		frm.set_value("salary_structure",null)
		frm.set_value("effective_date",null)

		console.log(frm.doc.salary);
		console.log(frm.doc.salary_structure);
		console.log(frm.doc.effective_date);
	}
});


function assignSalary(employee,salary,salary_structure,effective_date ){
	frappe.call({
		method: "erpnext.hr.doctype.employee.salary_structure.salary_assign",
		args: {"employee":employee,"salary":salary,"salary_structure":salary_structure,"effective_date":effective_date },
		callback: function(r, rt) {
			frappe.msgprint("Successfully Salary Structure Assign");
		}
	}); 
}
frappe.ui.form.on("Employee", {
	assign_salary_structure: function(frm) {

		if (frm.doc.salary_structure == null || frm.doc.effective_date == null) {
			frappe.msgprint('Salary Structure Effective Date must be set');
			return;
		}

		if(frm.doc.salary_structure != null && frm.doc.effective_date != null){
			assignSalary(frm.doc.employee,frm.doc.salary,frm.doc.salary_structure,frm.doc.effective_date);

		}
		
	}
});



function shiftAssignment(employee,shift_type,shift_date){
	frappe.call({

		method: "erpnext.hr.doctype.employee.employee_shift.shift_assignment",
		args: {"employee":employee,"shift_type":shift_type,"shift_date":shift_date},
		
		callback: function(r, rt) {
			frappe.msgprint("Successfully Shift Assignment");
		}
	}); 
}


frappe.ui.form.on("Employee", {
	shift_assign: function(frm) {

		var employee = frm.doc.employee;
		var shift_type = frm.doc.shift_type;
		var shift_date = frm.doc.shift_date;


		if (shift_type == null || shift_date == null) {
			frappe.msgprint('Shift Type and Shift Date must be set');
			return;
		}

		if (shift_type != null || shift_date != null) {
			
			shiftAssignment(employee,shift_type,shift_date);
		}	
	}
});

