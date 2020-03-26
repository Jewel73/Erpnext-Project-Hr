import frappe
@frappe.whitelist()
def get_user_salary(emp):
	salary = frappe.db.sql("select salary from tabEmployee where employee='"+emp+"'")
	return salary
@frappe.whitelist()
def get_emp_present_day(emp_id,start_date,end_date):
	count_att=frappe.db.sql("SELECT COUNT(DISTINCT(attendance_date)) FROM tabAttendance WHERE uid='"+emp_id+"' AND status='Present' AND attendance_date BETWEEN '"+start_date+"' AND '"+end_date+"'")
	count_log=frappe.db.sql("SELECT COUNT(DISTINCT(date)) FROM tabLogtable WHERE uid='"+emp_id+"' AND date BETWEEN '"+start_date+"' AND '"+end_date+"'")
	a = list(count_att[0])
	b = list(count_log[0])
	present_day=a[0]+b[0]
	return present_day
@frappe.whitelist()
def payment_days_query(emp_id, start_date, end_date, lwp):
        #count_att= frappe.db.sql("SELECT COUNT(DISTINCT(attendance_date)) FROM tabAttendance WHERE uid='"+emp_id+"' AND status='Present' AND attenda$
        #count_att = frappe.db.sql("select attendance_date from tabAttendance where uid='77' and attendance_date between '2019-10-01' and '2019-10-30$
        #a = list(count_att[0])
        date1 = datetime.strptime(str(start_date),'%Y-%m-%d')
        date2 = datetime.strptime(str(end_date),'%Y-%m-%d')
        #count_att = frappe.db.sql("SELECT attendance_date FROM tabAttendance WHERE uid='"+emp_id+"' AND attendance_date BETWEEN '"+date1+"' AND '"+da$
        #count_log = frappe.db.sql("SELECT DISTINCT(date) FROM tabLogtable WHERE uid='"+emp_id+"' AND date BETWEEN '"+start_date+"' AND '"+end_date+"'$
        #count_withpay= frappe.db.sql("SELECT total_leave_days FROM `tabLeave Application` WHERE status='Approved' AND leave_type!='Leave Without Pay'$
        #sum = 0.0
        #for i,d in enumerate(count_withpay):
         #       x = list(count_withpay[i])
          #      sum = sum+x[0]
        return date1

