frappe.listview_settings['Attendance'] = {
	add_fields: ["status", "attendance_date"],
	get_indicator: function(doc) {
		return [__(doc.status), doc.status=="Present" ? "green" : "darkgrey", "status,=," + doc.status];
	}
};

frappe.listview_settings['Attendance'] = {
  onload(listview) {
//		listview.add_menu_item('Send Email', () => open_email_dialog(), true)
		//frappe.set_route("List", "User")
		getAttendance();
//  		updateLog();
  }
}

function getAttendance(){
  var userData=[];
    frappe.call({
    method: "erpnext.hr.doctype.attendance.callzk.get_attendance",
    callback: function(r, rt) {
        console.log(r.message);
	updateLog();  
     }
    }); 
}

//---------------------------------------------------
function updateLog(){
frappe.call({
        method:"erpnext.hr.doctype.attendance.callzk.update_log",
        callback:function(r,rt){
                console.log(r.message);
                }       
        });
}

