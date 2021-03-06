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
//		loadMachine();
//		loadParent(frm);
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
/*-------------------Salary Structure Assignment Method----------------------*/
/*
                        Author: Md Kamrul Hasan
                        18th December, 2019
*/
  	assign_salary_structure: function(frm){
 	   frappe.call({
     		 method: "erpnext.hr.doctype.employee.employee.salary_assign",
      		args:{
        	employee: frm.doc.name
      		},
  	    callback:function(r){
        //frm.set_value("salary_structure",r.message);
       	frappe.msgprint('Salary Structure Assignment')
     	 }
   	 });
 	 }

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
        frappe.msgprint("Leave Allocateion Successfully Saved");
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



//====================CUSTOM CODE =======================================

/*  @Author:Minhaz Uddin
    Date:17/08/2019
    @Author:Shariful Islam
    Date:17/08/2019
    */
    /*===================District Loader (Present and Parmanent)=================*/
/*
    frappe.ui.form.on('Employee','onload',function(frm){
     frm.toggle_display('district_name', false);
     frm.toggle_display('thana_name', false);
     frm.toggle_display('post_office_name', false);
     frm.toggle_display('post_code', false);
     frm.toggle_display('district_name_2', false);
     frm.toggle_display('thana_name_2', false);
     frm.toggle_display('post_office_name_2', false);
     frm.toggle_display('post_code_2', false);
     loadDivisions(frm, 'division');
     loadDivisions(frm, 'division2');
   });
*/
    /*===================Present Address==================*/
/*
    frappe.ui.form.on("Employee", {
      district_name: function(frm) {
       frm.toggle_display('thana_name', true);
       frm.toggle_display('post_office_name', false);
       frm.toggle_display('post_code', false);   	
       loadThana(frm,'thana_name','post_office_name','post_code',frm.doc.district_name);
     }
   });
*/
    /* Postral Code Genearrtor*/
  
/*
  frappe.ui.form.on("Employee", {
      thana_name: function(frm) {
        frm.toggle_display('post_office_name', true);
        frm.toggle_display('post_code', false);    	
        loadPostalInfo(frm,'post_office_name','post_code',frm.doc.thana_name);
      }
    });

    frappe.ui.form.on("Employee", {
      post_office_name: function(frm) {
        frm.toggle_display('post_code', true);
        setPostCode(frm,'post_code',frm.doc.thana_name,frm.doc.post_office_name)
      }
    });
*/
    /*===============================Parmanent Address==============*/
/*  
  frappe.ui.form.on("Employee", {
      district_name_2: function(frm) {
        frm.toggle_display('thana_name_2', true);
        frm.toggle_display('post_office_name_2', false);
        frm.toggle_display('post_code_2', false);
        loadThana(frm,'thana_name_2','post_office_name_2','post_code_2',frm.doc.district_name_2);
      }
    });
*/
    /* Postral Code Genearrtor*/
/*  
  frappe.ui.form.on("Employee", {
      thana_name_2: function(frm) {
       frm.toggle_display('post_office_name_2', true);
       frm.toggle_display('post_code_2', false);

       loadPostalInfo(frm,'post_office_name_2','post_code_2',frm.doc.thana_name_2);      
     }
   });

    frappe.ui.form.on("Employee", {
      post_office_name_2: function(frm) {
        frm.toggle_display('post_code_2', true);
        setPostCode(frm,'post_code_2',frm.doc.thana_name_2,frm.doc.post_office_name_2)
      }
    });

    frappe.ui.form.on("Employee", {
      division: function(frm) {
        frm.toggle_display('district_name', true);
        frm.toggle_display('thana_name', false);
        frm.toggle_display('post_office_name', false);
        frm.toggle_display('post_code', false);
        var division_id =0;
        for (var i = 0; i < divisions.length; i++) {
          if (divisions[i][1]==frm.doc.division) {
            division_id = divisions[i][0];
            break;
          }
        }
        loadDistrict(frm,'district_name', division_id);
      }
    });
    frappe.ui.form.on("Employee", {
      division2: function(frm) {
       frm.toggle_display('district_name_2', true);	
       frm.toggle_display('thana_name_2', false);
       frm.toggle_display('post_office_name_2', false);
       frm.toggle_display('post_code_2', false);
       var division_id =0;
       for (var i = 0; i < divisions.length; i++) {
        if (divisions[i][1]==frm.doc.division2) {
          division_id = divisions[i][0];
          break;
        }
      }
      loadDistrict(frm,'district_name_2', division_id);
    }
  });

*/
    /*==========================Required Function ======================*/
  /*
  var divisions=[];
    function loadDivisions(frm, divisionFieldName){
      var divisionsName=[];
      frappe.call({
        method: "erpnext.hr.doctype.employee.bdGeoLocation.get_all_divisions",
        callback: function(r, rt) {
          if(r.message) {
            divisions = r.message;
            for(var i=0;i<divisions.length;i++ ){
              divisionsName.push(divisions[i][1]);
            }
            frm.set_df_property(divisionFieldName, 'options',divisionsName);
          }
        }
      });
    }

*/
    /*-------------------load district from DataBase---------------------*/
/*
    function loadDistrict(frm,districtFieldName, div_id){
      var districtName=[];
      frappe.call({
        method: "erpnext.hr.doctype.employee.bdGeoLocation.get_all_district",
        args:{"division_id": div_id},
        callback: function(r, rt) {
          if(r.message) {
            var districts=r.message;
            for(var i=0;i<districts.length;i++ ){
              districtName.push(districts[i][2]);
            }
            frm.set_df_property(districtFieldName, 'options',districtName);
          }
        }       
      }); 
    }
*/  
  /*-------------------load thana from DataBase---------------------*/
/*  
  function loadThana(frm,thanaFieldName,postOfficeNameFieldName,postCodeFieldName,selected_disrict){
      frappe.call({
        method: "erpnext.hr.doctype.employee.bdGeoLocation.get_all_thana",
        args: {"district":selected_disrict},
        callback: function(r,rt) {
         var thanaName=[];
         if(r.message) {
          var thana=r.message;
          for(var i=0;i<thana.length;i++ ){
            thanaName.push(thana[i][2]);
          }
          frm.set_df_property( thanaFieldName, 'options',thanaName);
          frm.set_df_property(postOfficeNameFieldName , 'options',[]);
          cur_frm.set_value(postCodeFieldName ,'');
        }
      }
    });
}

*/
    /*-------------------load PostalInfo from DataBase---------------------*/
/*  
  function loadPostalInfo(frm,postOfficeNameFieldName,postCodeFieldName,selected_thana){
      var postalInfo=[]; 
      var postalName=[];
      frappe.call({
        method: "erpnext.hr.doctype.employee.bdGeoLocation.get_all_postal_info",
        args: {"thana":selected_thana},
        callback: function(r,rt) {
         if(r.message) {
          postalInfo=r.message;
          for(var i=0;i<postalInfo.length;i++ ){
            postalName.push(postalInfo[i][2]);
          }
          frm.set_df_property(postOfficeNameFieldName, 'options',postalName);
          cur_frm.set_value(postCodeFieldName,'');
          frm.refresh_field(postalName);
        }
      }
    });
    }


    function setPostCode(frm,postCodeFieldName,thanaName,data2match){
      frappe.call({
        method: "erpnext.hr.doctype.employee.bdGeoLocation.get_all_postal_info",
        args: {"thana":thanaName},
        callback: function(r,rt) {
         if(r.message) {
          var postalInfo=r.message;
          var postalCode;
          for(var i=0;i<postalInfo.length;i++ ){
           if(data2match==postalInfo[i][2]){
             postalCode=postalInfo[i][3];
             break;
           }
         }
         cur_frm.set_value(postCodeFieldName,postalCode);
         frm.refresh_field(postCodeFieldName);
       }
     }
   });
    }
*/
//--------------------------------------------------
/*
frappe.ui.form.on("Employee", {
  same_as: function(frm) {
    if (frm.doc.same_as==1) {
      if(frm.doc.division != null && frm.doc.district_name != null && frm.doc.thana_name != null && frm.doc.post_office_name != null && frm.doc.post_code != null){
        cur_frm.set_value("division2", frm.doc.division);
        cur_frm.set_value("district_name_2", frm.doc.district_name);
        cur_frm.set_value("thana_name_2", frm.doc.thana_name);
        cur_frm.set_value("post_office_name_2", frm.doc.post_office_name);
        cur_frm.set_value("post_code_2", frm.doc.post_code);
        cur_frm.set_value("vill_name_2", frm.doc.vill_name);
        cur_frm.set_value("road_no", frm.doc.road);
        cur_frm.set_value("house_permanent", frm.doc.house_present);
        frm.toggle_display('division2', true);
        frm.toggle_display('district_name_2', true);
        frm.toggle_display('thana_name_2', true);
        frm.toggle_display('post_office_name_2', true);
        frm.toggle_display('post_code_2', true);
      }
    }else if(frm.doc.same_as==0){
      cur_frm.set_value("division2", "");
      cur_frm.set_value("district_name_2", "");
      cur_frm.set_value("thana_name_2", "");
      cur_frm.set_value("post_office_name_2", "");
      cur_frm.set_value("post_code_2", "");

      frm.toggle_display('district_name_2', false);
      cur_frm.toggle_display('thana_name_2', false);
      cur_frm.toggle_display('post_office_name_2', false);
      cur_frm.toggle_display('post_code_2', false);
    }
  }
});
*/
/*======================================================================*/
/*------------Dependent Brunch Section--------------------*/

/*
   Author:Shariful Islam
   Date:09/10/2019
*/

     frappe.ui.form.on('Employee', {
      refresh: function(frm) {
        loadBranch(frm,"branch_name");

	/*Set Department after refresh */

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
	      /* */

      }
    });


/*Department Set*/


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

/*Department Set*/


/*

		Mutli Device 
------------------------------------------------
	Author: Md Kamrul Hasan
	15th December, 2019
*/

function saveToMachine(uid,name,password,card,device_select){
  console.log(device_select);
  for(var i = 0; i < device_select.length; i++){
    frappe.call({
      method: "erpnext.hr.doctype.employee.callzk.save_insert",
      args: {"uid":uid,"name": name,"password":password,"card":card,"device_select": device_select[i].device_ip},
      callback: function(r, rt) {
        console.log("Saved method: saveToMachine");
        console.log('callback-'+device_select[i]);
      frappe.msgprint("Successfully Saved");
    }
  }); 
  }
}

frappe.ui.form.on("Employee", {
  save_to_in: function(frm) {
    console.log(frm.doc.device_select+' '+frm.doc.uid+' '+ frm.doc.emp_name+'-'+ frm.doc.password+'-'+frm.doc.card); 
    saveToMachine(frm.doc.uid, frm.doc.emp_name,frm.doc.password, frm.doc.card, frm.doc.device_select);
  }
});


/*
--------------------------------------------------
	Remove Checked Ip from Device

*/

function deleteFromMachine(uid,device_select){
	console.log(device_select);
	for(var i = 0; i < device_select.length; i++){
		if(device_select[i].__checked){
			frappe.call({
				method: "erpnext.hr.doctype.employee.callzk.remove_user",
				args: {"uid":uid,"device_select": device_select[i].device_ip},
				callback: function(r, rt) {
					frappe.msgprint("Successfully Removed");
				}
			});
		}
	}
}


frappe.ui.form.on("Employee", {
	remove_from_in: function(frm) {
		console.log(frm.doc.uid+' '+frm.doc.device_select);
		deleteFromMachine(frm.doc.uid,frm.doc.device_select);
	}
});


/*


frappe.ui.form.on("Employee", {
        get_value: function(frm) {
		var fname =frm.doc.first_name+' '+frm.doc.middle_name+' '+frm.doc.last_name;
		var uidArray = frm.doc.emp_id.split('-')
		var uid = uidArray[1]
		console.log(fname);
		console.log(uid);
		if(frm.doc.emp_id != null && frm.doc.first_name != null && frm.doc.last_name != null){
        	        frm.set_value("uid",uid);
			frm.set_value("emp_name",fname);
			frm.set_value("user_id_card", uid);
		}
        }
});
*/
/*------------Without get value button for Bio-metric Integration-------*/


frappe.ui.form.on("Employee",{
	emp_id:function(frm){
		var emp_id_dataArray = frm.doc.emp_id.split('-');
		var emp_id_data = emp_id_dataArray[1];
		if (emp_id_data != null) {
			frm.set_value("uid",emp_id_data);
		}
		else{
			frappe.msgprint("Please Enter Your Staff Id");
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

/*-----------------------------------------------------------------------*/


//***************************Address Tree**********
/*
		Author:Md Kamrul hasan
		10th December 2019
*/

/*
frappe.ui.form.on('Employee', {
  refresh: function(frm) {
    frm.toggle_display('district_name', false);
    frm.toggle_display('thana_name', false);
    frm.toggle_display('post_office_name', false);
    frm.toggle_display('post_code', false);
    frm.toggle_display('district_name_2', false);
    frm.toggle_display('thana_name_2', false);
    frm.toggle_display('post_office_name_2', false);
    frm.toggle_display('post_code_2', false);
    loadDivisionAddress(frm, 'division');
    loadDivisionAddress2(frm, 'division2');
    
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

*/
/***********************Division 02**************************/
/*

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
*/

/*********************Same As************************/
/*
frappe.ui.form.on("Employee",{
  same_as:function(frm){
    if (frm.doc.same_as == 1) {
      if (frm.doc.division != null && frm.doc.district_name != null && frm.doc.thana_name != null && frm.doc.post_office_name != null && frm.doc.post_code) {
        cur_frm.set_value("division2",frm.doc.division);
        cur_frm.set_value("district_name_2",frm.doc.district_name);
        cur_frm.set_value("thana_name_2",frm.doc.thana_name);
        cur_frm.set_value("post_office_name_2",frm.doc.post_office_name);
        cur_frm.set_value("post_code_2",frm.doc.post_code);
        cur_frm.set_value("vill_name_2", frm.doc.vill_name);
        cur_frm.set_value("road_no", frm.doc.road);
        cur_frm.set_value("house_permanent", frm.doc.house_present);
        frm.toggle_display('division2', true);
        frm.toggle_display('district_name_2', true);
        frm.toggle_display('thana_name_2', true);
        frm.toggle_display('post_office_name_2', true);
        frm.toggle_display('post_code_2', true);
      }
    }
    else if(frm.doc.same_as==0){
      cur_frm.set_value("division2", "");
      cur_frm.set_value("district_name_2", "");
      cur_frm.set_value("thana_name_2", "");
      cur_frm.set_value("post_office_name_2", "");
      cur_frm.set_value("post_code_2", "");

      frm.toggle_display('district_name_2', false);
      cur_frm.toggle_display('thana_name_2', false);
      cur_frm.toggle_display('post_office_name_2', false);
      cur_frm.toggle_display('post_code_2', false);
    }
  }
});

*/


//***************************Address Tree**********
/*
Author:Md Kamrul hasan
10th December 2019
*/


frappe.ui.form.on('Employee', {
	refresh: function(frm) {
	/*	frm.toggle_display('district_name', false);
		frm.toggle_display('thana_name', false);
		frm.toggle_display('post_office_name', false);
		frm.toggle_display('post_code', false);
		frm.toggle_display('district_name_2', false);
		frm.toggle_display('thana_name_2', false);
		frm.toggle_display('post_office_name_2', false);
		frm.toggle_display('post_code_2', false);*/

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

