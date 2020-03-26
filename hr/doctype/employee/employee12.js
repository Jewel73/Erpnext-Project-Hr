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
		loadMachine();
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
	}
});
cur_frm.cscript = new erpnext.hr.EmployeeController({frm: cur_frm});


//====================CUSTOM CODE =======================================

/*  @Author:Minhaz Uddin
    Date:17/08/2019
    @Author:Shariful Islam
    Date:17/08/2019
    */
    /*===================District Loader (Present and Parmanent)=================*/

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
    /*===================Present Address==================*/
    frappe.ui.form.on("Employee", {
      district_name: function(frm) {
       frm.toggle_display('thana_name', true);
       frm.toggle_display('post_office_name', false);
       frm.toggle_display('post_code', false);   	
       loadThana(frm,'thana_name','post_office_name','post_code',frm.doc.district_name);
     }
   });

    /* Postral Code Genearrtor*/
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

    /*===============================Parmanent Address==============*/
    frappe.ui.form.on("Employee", {
      district_name_2: function(frm) {
        frm.toggle_display('thana_name_2', true);
        frm.toggle_display('post_office_name_2', false);
        frm.toggle_display('post_code_2', false);
        loadThana(frm,'thana_name_2','post_office_name_2','post_code_2',frm.doc.district_name_2);
      }
    });

    /* Postral Code Genearrtor*/
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


    /*==========================Required Function ======================*/
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

    /*-------------------load district from DataBase---------------------*/
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
    /*-------------------load thana from DataBase---------------------*/
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


    /*-------------------load PostalInfo from DataBase---------------------*/
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

    /*======================================================================*/

//--------------------------------------------------
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

/*======================================================================*/
/*------------Dependent Brunch Section--------------------*/

/*   Author:Shariful Islam
     Date:09/10/2019
     */
/*
     frappe.ui.form.on('Employee', {
      refresh: function(frm) {
        loadBranch(frm,"branch");
        frm.toggle_display('group_name', false);
        frm.toggle_display('division_name', false);
//        frm.toggle_display('department', false);
        frm.toggle_display('area_name', false);
        frm.toggle_display('territory_name', false);
        frm.toggle_display('section', false);
        frm.toggle_display('sub_section', false);
      }
    });

     function loadBranch(frm,b_name){
      var branchName=[];
      frappe.call({
        method: "erpnext.hr.doctype.employee.bdGeoLocation.get_all_branch",
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
            if (departmentName.length == 0) {
              frm.toggle_display('department', false);
              frm.toggle_display('division_name',false);
              frm.toggle_display('group_name',false);                 
              frm.toggle_display('area_name', false);
              frm.toggle_display('territory_name', false);
              frm.toggle_display('section', false);
              frm.toggle_display('sub_section', false);
            }
            else
            {
              if (branch_value=="Sales & Marketing") {
                frm.toggle_display('department', false);
                frm.toggle_display('division_name',true);
                frm.toggle_display('group_name',true);                      
                frm.toggle_display('area_name', false);
                frm.toggle_display('territory_name', false);
                frm.toggle_display('section', false);
                frm.toggle_display('sub_section', false);
                loadSalesChild(frm.doc.branch);                        
                loadDivision(frm,'division_name',salesChildName[0]);
                loadGroup(frm,'group_name',salesChildName[1]);

              }
              else{
                frm.set_df_property(d_name, 'options',departmentName);
                frm.toggle_display('department', true);
                frm.toggle_display('division_name',false);
                frm.toggle_display('group_name',false);
                frm.toggle_display('area_name', false);
                frm.toggle_display('territory_name', false);
                frm.toggle_display('section', false);
                frm.toggle_display('sub_section', false);
              }
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

    var divisionName=[];
    function loadDivision(frm,field_name,d_name){
      divisionName=[];
      frappe.call({
        method: "erpnext.hr.doctype.employee.bdGeoLocation.get_all_division",
        async: false,
        args: {"dname":d_name},
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
    var childName=[];
    function loadChild(frm,field_name,d_name){
      childName=[];
      frappe.call({
        method: "erpnext.hr.doctype.employee.bdGeoLocation.load_child",
        async: false,
        args: {"parentName":d_name},
        callback: function(r, rt) {
          if(r.message) {
            var childs=r.message;
            for(var i=0;i<childs.length;i++ ){
              childName.push(childs[i][0]);
            }
            if(childName.length== 0){
              frm.toggle_display('section', false);
            }
            else{       
 	    frm.toggle_display('section', true);
              frm.set_df_property(field_name, 'options',childName);
            }

          }        
        }
      }); 
    }

//------------Chittagong matching error

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
//	frm.toggle_display("area_name", true);
	frm.toggle_display("territory_name", true); 	
console.log(nChildArray);			
	frm.set_df_property(field_name, 'options',nChildArray);
				
			}        
		}
	}); 
}


//----------------------------


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
       frm.toggle_display('section_name', false);
       frm.toggle_display('sub_section_name', false);
       frm.toggle_display('territory_name', true);
       frm.set_df_property(field_name, 'options',territoryName);
     }        
   }
 }); 
   }

   var groupName=[];
   function loadGroup(frm,field_name,g_name){
    groupName=[];
    frappe.call({
      method: "erpnext.hr.doctype.employee.bdGeoLocation.get_all_group",
      async: false,
      args: {"pname":g_name},
      callback: function(r, rt) {
        if(r.message) {
          var childs=r.message;
          for(var i=0;i<childs.length;i++ ){
            groupName.push(childs[i][0]);
          }
          frm.set_df_property(field_name, 'options',groupName);
        }        
      }
    }); 
  }

  frappe.ui.form.on("Employee", {
    branch: function(frm) {
      loadDepartment(frm,"department",frm.doc.branch);
    }
  });

  frappe.ui.form.on("Employee", {
    department: function(frm) {
	var dept = frm.doc.department;
	var dept_lower = dept.toLowerCase();
	var mydept = "production";

	if (dept_lower.includes(mydept)) {
		console.log(dept_lower);
		loadChild(frm,"section",frm.doc.department);
		frm.toggle_display('section', true);
	}
	else{
		frm.toggle_display('section', false);
		frm.toggle_display('sub_section', false);
	}
//      loadChild(frm,"section",frm.doc.department);
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
	var addCfpl = frm.doc.division_name +" - CFPL";
	console.log(addCfpl);
 //     loadChild(frm,"area_name",frm.doc.division_name);
//	console.log(frm.doc.division_name);
	newLoadChild(frm,"area_name",addCfpl); 
     frm.toggle_display('section',false);
      frm.toggle_display('sub_section',false);   
      frm.toggle_display('area_name', true);
frm.toggle_display('territory_name', false);
	    
}
  });

  frappe.ui.form.on("Employee", {
    area_name: function(frm) { 
      newLoadChild(frm,"territory_name",frm.doc.area_name);
	frm.toggle_display('territory_name',true);
      frm.toggle_display('section', false);
      frm.toggle_display('sub_section', false);  

    }
  });
*/
// Last Updated: 10 Oct , 2019, 11:39 AM

// Date 16 Oct
function loadMachine(){
	var userData=[];
	frappe.call({
		method: "erpnext.hr.doctype.employee.device.get_all_device_user",
		callback: function(r, rt) {
			if(r.message) {
				var users=r.message;
				for(var i=0;i<users.length;i++ ){
					userData.push(users[i][0]);
					userData.push(users[i][1]);
					userData.push(users[i][2]);
					userData.push(users[i][3]);
					userData.push(users[i][4]);
					userData.push(users[i][5]);
				}
				console.log("from user -----------------------");
				console.log(userData);
			}
		}
	}); 
}

//....................16 oct 
//................Bio metric
function saveToMachine(uid, name, privilege, password, group_id, user_id_card,card, device_ip){
	var userData=[];
	frappe.call({
		method: "erpnext.hr.doctype.employee.callzk.save_insert",
		args: {"uid":uid,"name": name,"privilege":privilege,"password":password,"group_id":group_id,"user_id_card":user_id_card,"card":card,"device_ip": device_ip},
		callback: function(r, rt) {
			console.log("======================");
			alert("Successully Added");
		}
	}); 
}
frappe.ui.form.on("Employee", {
	save_to_in: function(frm) {

		saveToMachine(frm.doc.uid, frm.doc.username, frm.doc.privilege, frm.doc.password,frm.doc.group_id,frm.doc.user_id_card, frm.doc.card, frm.doc.in_device_ip);
	}
});

frappe.ui.form.on("Employee", {
	save_to_out: function(frm) {

		saveToMachine(frm.doc.uid, frm.doc.username, frm.doc.privilege, frm.doc.password,frm.doc.group_id,frm.doc.user_id_card, frm.doc.card, frm.doc.out_device_ip);
	}
});
