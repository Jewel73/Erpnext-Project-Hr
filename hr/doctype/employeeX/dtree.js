// Copyright (c) 2019, Frappe Technologies Pvt. Ltd. and contributors
// For license information, please see license.txt

frappe.ui.form.on('DTree', {
	refresh: function(frm) {
	loadParent(frm);
	}
});
var parentName=[];
function loadParent(frm){
	parentName=[];
	frappe.call({
		method: "erpnext.hr.doctype.dtree.dtree.get_all_parent",
		async: false,
		callback: function(r, rt) {
			console.log(r.message);
			if(r.message) {
				var parents=r.message;
				for(var i=0;i<parents.length;i++ ){
					parentName.push(parents[i][0]);
				}
			frm.set_df_property("department","options",parentName);
			}        
		}
	}); 
}
