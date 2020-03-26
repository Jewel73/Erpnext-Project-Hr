//	Author:Shariful Islam
//	Date:06/10/2019
frappe.pages['reminder'].on_page_load = function(wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Reminder',
		single_column: true
	});
	//----------------------------------
	page.set_title_sub('Cocola Food Products Ltd.');
	page.set_indicator('Dashboard', 'orange');
	let $btn = page.set_primary_action('Update Address', () => openForm(), 'octicon octicon-plus');
	page.add_action_item('Left Employee',()=> frappe.set_route("List", "Employee", {"status": "Left"}));
	page.add_action_item('Intern List',()=>frappe.set_route("List", "Employee", {"employment_type": "Casual"}));
	
	//---------------------------------
	function openForm(){
		let d = new frappe.ui.Dialog({
    title: 'Enter details',
    fields: [
        {
            label: 'First Name',
            fieldname: 'first_name',
            fieldtype: 'Data'
        },
        {
            label: 'Last Name',
            fieldname: 'last_name',
            fieldtype: 'Data'
        },
        {
            label: 'Age',
            fieldname: 'age',
            fieldtype: 'Int'
        }
    ],
    primary_action_label: 'Submit',
    primary_action(values) {
        console.log(values);
        d.hide();
    }
});
d.show();
	}	
}

