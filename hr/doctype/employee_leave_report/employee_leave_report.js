// Copyright (c) 2020, Frappe Technologies Pvt. Ltd. and contributors
// For license information, please see license.txt
cur_frm.add_fetch('employee','employee_name','employee_name');
cur_frm.add_fetch('employee','company','company');

frappe.ui.form.on('Employee Leave Report', {
	refresh: function(frm) {
		loadLeaveDashboard(frm);
	},

	onload: function(frm) {
		if (!frm.doc.posting_date) {
			frm.set_value("posting_date", frappe.datetime.get_today());
		}
		if (frm.doc.docstatus == 0) {
			return frappe.call({
				method: "erpnext.hr.doctype.leave_application.leave_application.get_mandatory_approval",
				args: {
					doctype: frm.doc.doctype,
				},
				callback: function(r) {
					if (!r.exc && r.message) {
						frm.toggle_reqd("leave_approver", true);
					}
				}
			});
		}
	},

	make_dashboard: function(frm) {
		loadLeaveDashboard(frm);
	},

	employee: function(frm) {
		frm.trigger("make_dashboard");
		frm.trigger("get_leave_balance");
		frm.trigger("set_leave_approver");
	},

	leave_type: function(frm) {
		frm.trigger("get_leave_balance");
	},


	get_leave_balance: function(frm) {
		if(frm.doc.docstatus==0 && frm.doc.employee && frm.doc.leave_type && frm.doc.from_date) {
			return frappe.call({
				method: "erpnext.hr.doctype.leave_application.leave_application.get_leave_balance_on",
				args: {
					employee: frm.doc.employee,
					date: frm.doc.from_date,
					leave_type: frm.doc.leave_type,
					consider_all_leaves_in_the_allocation_period: true
				},
				callback: function(r) {
					if (!r.exc && r.message) {
						frm.set_value('leave_balance', r.message);
					}
					else {
						frm.set_value('leave_balance', "0");
					}
				}
			});
		}
	},

	calculate_total_days: function(frm) {
		if(frm.doc.from_date && frm.doc.to_date && frm.doc.employee && frm.doc.leave_type) {

			var from_date = Date.parse(frm.doc.from_date);
			var to_date = Date.parse(frm.doc.to_date);

			if(to_date < from_date){
				frappe.msgprint(__("To Date cannot be less than From Date"));
				frm.set_value('to_date', '');
				return;
			}
				return frappe.call({
					method: 'erpnext.hr.doctype.leave_application.leave_application.get_number_of_leave_days',
					args: {
						"employee": frm.doc.employee,
						"leave_type": frm.doc.leave_type,
						"from_date": frm.doc.from_date,
						"to_date": frm.doc.to_date,
						"half_day": frm.doc.half_day,
						"half_day_date": frm.doc.half_day_date,
					},
					callback: function(r) {
						if (r && r.message) {
							frm.set_value('total_leave_days', r.message);
							frm.trigger("get_leave_balance");
						}
					}
				});
			}
		}

});



function loadLeaveDashboard(frm){

	var leave_details;
	if (frm.doc.employee) {
		frappe.call({
			method: "erpnext.hr.doctype.leave_application.leave_application.get_leave_details",
			async: false,
			args: {
				employee: frm.doc.employee,
				date: frm.doc.posting_date
			},
			callback: function(r) {
				if (!r.exc && r.message['leave_allocation']) {
					leave_details = r.message['leave_allocation'];
				}
				if (!r.exc && r.message['leave_approver']) {
					frm.set_value('leave_approver', r.message['leave_approver']);
				}
			}
		});

		console.log(frm);

		$("div").remove(".form-dashboard-section");
		let section = frm.dashboard.add_section(
			frappe.render_template('employee_leave_report_dashboard', {
				data: leave_details
			})
			);
		frm.dashboard.show();
	}

	console.log(frm.dashboard)

	var tableData = frm.dashboard.wrapper[0].innerText.split(/\r?\n/);

	for(var i = 2; i < tableData.length; i++){
		var rowData  = tableData[i];
		var leaveType = rowData.replace(/[^a-z ]/gi, '');
		var leaves = rowData.replace(leaveType, '').trim().split(/\s{1,}/);

		var totalAllocated = leaves[0],
		usedLeaves = leaves[1],
		pending = leaves[2],
		available = leaves[3];

		frappe.call({
			method: "erpnext.hr.doctype.employee_leave_report.leave.insertLeave",
			args: {"employee":frm.doc.employee,"parent":frm.doc.name,"leaveType":leaveType, "totalAllocated":totalAllocated,
			"usedLeaves":usedLeaves, "pending":pending, "available":available},
			
			callback: function(r) {
				console.log('Leave Type: ' + leaveType + ' Total Allocated Leaves: ' + totalAllocated + ' Used Leaves: ' + usedLeaves + ' Pending: ' + pending + ' Available Leaves ' + available);
			}
		});
	}
}

