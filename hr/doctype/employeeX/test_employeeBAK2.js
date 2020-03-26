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




//-----------------------------------------------------------------------
//=======================================================================
//====================CUSTOM CODE =======================================

//geoLocation.js

/*  @Author:Minhaz Uddin
    Date:17/08/2019
    @Author:Shariful Islam
    Date:17/08/2019
*/
//district_name

/*===================District Loader (Present and Parmanent)=================*/

frappe.ui.form.on('Employee','onload',function(frm){
	loadDistrict(frm,'district_name');
	loadDistrict(frm,'district_name_2');

});
/*===================Present Address==================*/
frappe.ui.form.on("Employee", {
    district_name: function(frm) {
   	loadThana(frm,'thana_name','post_office_name','post_code',frm.doc.district_name);

    }
});

/* Postral Code Genearrtor*/
frappe.ui.form.on("Employee", {
    thana_name: function(frm) {
    	loadPostalInfo(frm,'post_office_name','post_code',frm.doc.thana_name);
      
    }
});



frappe.ui.form.on("Employee", {
    post_office_name: function(frm) {
    	setPostCode(frm,'post_code',frm.doc.thana_name,frm.doc.post_office_name)
    }
});

/*===============================Parmanent Address==============*/
frappe.ui.form.on("Employee", {
    district_name_2: function(frm) {
   	loadThana(frm,'thana_name_2','post_office_name_2','post_code_2',frm.doc.district_name_2);

    }
});

/* Postral Code Genearrtor*/
frappe.ui.form.on("Employee", {
    thana_name_2: function(frm) {
    	loadPostalInfo(frm,'post_office_name_2','post_code_2',frm.doc.thana_name_2);
      
    }
});



frappe.ui.form.on("Employee", {
    post_office_name_2: function(frm) {
    	setPostCode(frm,'post_code_2',frm.doc.thana_name_2,frm.doc.post_office_name_2)
    }
});






/*==========================Required Function ======================*/
/*-------------------load district from DataBase---------------------*/
 function loadDistrict(frm,districtFieldName){
    var districtName=[];
    frappe.call({
    method: "erpnext.hr.doctype.employee.bdGeoLocation.get_all_district",
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
//	console.log(thanaFieldName);
//	console.log(thanaName);
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
		console.log(postalName);
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





/*======================================================================*/
/*------------Dependent Brunch Section--------------------*/


var brunchName=['Head Office','Sales & Marketing','Management','Mouchak Factory','Tongi Factory'];
var departmentName={
    'Head Office':['HR','Accounts','IT','Procurement','Distribution','Design','General','Sales Admin'],
    'Mouchak Factory':['HR','Maintenance','Store','PPIC','Distribution','Security','General','Production'],
    'Tongi Factory':['HR','Maintenance','Store','PPIC','Distribution','Security','General','Production'],
};
var areaName = {
    "North Dhaka":["Dhaka City-A","Manikgonj","Tangail","Bogra","Rangpur"],
    "South Dhaka":["Dhaka City-B","Narayenganj","Maymenshing","Sylhet"],
    "Chittagong":["Dhaka City-C","Chittagong-A","Chittagong-B","Comilla"],
    "Khulna":["Dhaka City-D","Khulna","Barishal","Rajshahi"
]};
var territoryName = {
"Dhaka City-A":["Cantonment","Badda","Uttara"],
"Dhaka City-B":["Chockbazar","Kamrangirchar","Keranigonj"],
"Dhaka City-C":["Malibag","Demra"],
"Dhaka City-D":["Mohammadpur","Mirpur"],
"Manikgonj":["Nobinagar","Kasimpur" ,"Manikgonj","Tongi"],
"Narayenganj":["Siddirgonj","Dohar","Narayangonj","Norsingdi"],
"Chittagong-A":["Katalgonj","Hathazari","Patiya","Cox's Bazar"],
"Khulna":["Khulna Metro","Sathkhira","Bagerhat","Jessore" ,"Goplagonj","Jhenaidhah"],
"Tangail":["Joydebpur", "Tangail","Jamalpur","Sherpur"],
"Maymenshing":["Mymensingh","Netrokona","Kishorgonj","Katiadi"],
"Chittagong-B":["Rizuddin Bazar","Fatikchori","Feni"],
"Barishal":["Faridpur","Madaripur","Shariatpur","Barisal","Bhola","Patuakhali"],
"Bogra":["Bogra","Sirajganj","Naogaon","Joypurhat"],
"Sylhet":["Sylhet Metro","Osmani Nogor","Hobigonj","Moulovibazar","B.Baria","Sunamganj"],
"Comilla":["Comilla","Laksham","Chandpur","Maijdee","Laxmipur"],
"Rajshahi":["Kushtia","Rajshahi","Chapai Nawabgonj","Pabna"],
"Rangpur":["Rangpur" ,"Kurigram","Dinajpur","Nilphamary","Thakurgaon"]
};




frappe.ui.form.on('Employee','onload',function(frm){
    loadStaticData(frm,'branch_name',brunchName);
});

frappe.ui.form.on("Employee", {
    branch_name: function(frm) {
        loadStaticData(frm,'department_name',departmentName[frm.doc.branch_name]);
        loadStaticData(frm,'area_name',[]);
        loadStaticData(frm,'territory_name',[]);
        frm.toggle_display("area_name", false);
        frm.toggle_display("territory_name", false);
    }
});

frappe.ui.form.on("Employee", {
    division_name: function(frm) {
        loadStaticData(frm,'area_name',[]);
        loadStaticData(frm,'territory_name',[]);
        loadStaticData(frm,'area_name',areaName[frm.doc.division_name]);
        frm.toggle_display("area_name", true);
        frm.toggle_display("territory_name", true);
    }
});

frappe.ui.form.on("Employee", {
    area_name: function(frm) {
        loadStaticData(frm,'territory_name',territoryName [frm.doc.area_name]);
    }
});

function loadStaticData(frm,fieldName,optionData){
    frm.set_df_property(fieldName,'options',optionData);
}
/*

frappe.ui.form.on("Employee", {
    employee_grade: function(frm) {
    	cur_frm.set_value('designation' ,frm.doc.employee_grade);      
    }
});


//-------------
/*
var data=[];
var result=[];

var brunchName=[];


frappe.ui.form.on('Employee','onload',function(frm){
	console.log("A mesg from termia"); 
 	 generateDepartmentTree(frm);
    //	loadStaticData(frm,'branch_name',brunchName);
});

frappe.ui.form.on("Employee", {
    branch_name: function(frm) {
        loadStaticData(frm,'department_name',data[frm.doc.branch_name]);
        loadStaticData(frm,'area_name',[]);
        loadStaticData(frm,'territory_name',[]);
        frm.toggle_display("area_name", false);
        frm.toggle_display("territory_name", false);
    }
});

frappe.ui.form.on("Employee", {
    division_name: function(frm) {
        loadStaticData(frm,'area_name',[]);
        loadStaticData(frm,'territory_name',[]);
        loadStaticData(frm,'area_name',data[frm.doc.division_name]);
        frm.toggle_display("area_name", true);
        frm.toggle_display("territory_name", true);
    }
});

frappe.ui.form.on("Employee", {
    area_name: function(frm) {
        loadStaticData(frm,'territory_name',data[frm.doc.area_name]);
    }
});

function loadStaticData(frm,fieldName,optionData){
    frm.set_df_property(fieldName,'options',optionData);
}


function generateDepartmentTree(frm){
    frappe.call({
        method: "erpnext.hr.doctype.employee.deptTree.get_all_department_tree",
        callback: function(r, rt) {
            if(r.message) {
            result = r.message;
               for(var i=0;i<result.length;i++){
                     data[result[i][0]]=[];
                }
                for(var i=0;i<result.length;i++){
                    data[result[i][0]].push(result[i][1]);
                }
//		console.log(result);
//		console.log(result[0][0]);
		 brunchName=data[data[null][0]];
		console.log(data);
	 }
	loadStaticData(frm,'branch_name',brunchName);
	}
	});
    
}



*/
