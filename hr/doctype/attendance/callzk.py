import frappe
import random
import time
from zk import ZK, const
from datetime import datetime

@frappe.whitelist()
def get_attendance():
	print("Getting Attendance")
	in_list = frappe.db.sql("SELECT ip_address from `tabIn Device`")
	out_list = frappe.db.sql("SELECT ip_address from `tabIn Device`")
	ip_address=[]
	for ip in in_list:
		print(ip[0])
		set_attendance_in_device(str(ip[0]))



@frappe.whitelist()
def set_attendance_in_device(device_ip):
	group =[]
	print("----------==============================set_attendance_in_device======================--------------")
	Dt = datetime.date(datetime.now())
	print("Date Today ----------------------" + str(Dt))
	frappe.db.sql("DELETE FROM `tabToday` WHERE date <'"+str(Dt)+"'")
	conn = None
	zk = ZK(device_ip, port=4370, timeout=100, password=3636, force_udp=False, ommit_ping=False)
	try:
		conn = zk.connect()
		print(conn)
		conn.disable_device()
		attendances = conn.get_attendance()
		print(attendances)
		users = conn.get_users()
		user_name = ""

		# tabAtt = frappe.db.sql("SELECT user_id from tabAttendance where attendance_date = CURDATE()")
		# tabToday = frappe.db.sql("SELECT user_id from tabToday")

		for i, att in enumerate(attendances):
			for user in users:

				if user.user_id == att.user_id:
					user_name= user.name
					dt = str(att.timestamp).split(" ")
					today = datetime.strptime(dt[0], '%Y-%m-%d').strftime('%Y-%m-%d')
					dateAtt = datetime.strptime(dt[0], '%Y-%m-%d').strftime('%d-%m-%Y')

					#		Attendance to tabToday

					frappe.db.sql("INSERT INTO `tabToday`(name,employee_name, status,docstatus,user_id, date,time) VALUES('"+str(random.randint(1,10000000))+"','"+user_name+"','Present',1,%s, '"+str(today)+"', '"+dt[1]+"') ON DUPLICATE KEY UPDATE employee_name='"+user_name+"', date='"+str(today)+"'",str(att.user_id))


		return "get_attendance Status: Success"
	except Exception as e:
		return "Error "+ str(e)
	finally:
		if conn:
			conn.disconnect()




@frappe.whitelist()
def update_log():
		print("Getting Attendance")
		in_list = frappe.db.sql("SELECT ip_address from `tabIn Device`")
	   # out_list = frappe.db.sql("SELECT ip_address from `tabOut Device`")
		ip_address=[]
		for ip in in_list:
				print(ip[0])
				update_log_connect(str(ip[0]))




@frappe.whitelist()
def update_log_connect(device_ip):
	group =[]
	Dt = datetime.date(datetime.now())
	print("-------------------Updating log table ---------------------" + str(Dt))
	conn = None
	zk = ZK(device_ip, port=4370, timeout=100, password=3636, force_udp=False, ommit_ping=False)
	try:
		conn = zk.connect()
		print(conn)
		conn.disable_device()
		attendances = conn.get_attendance()
		print(attendances)
		users = conn.get_users()
		user_name = ""
		for i, att in enumerate(attendances):
			for user in users:
				if user.user_id == att.user_id:
					user_name= user.name
					dt = str(att.timestamp).split(" ")
					today = datetime.strptime(dt[0], '%Y-%m-%d').strftime('%Y-%m-%d')
					#frappe.db.sql("INSERT INTO `tabToday`(name,employee_name, status,docstatus,user_id, date,time) VALUES('"+str(random.randint(1,10000000))+"','"+user_name+"','Present',1,%s, '"+str(today)+"', '"+dt[1]+"') ON DUPLICATE KEY UPDATE employee_name='"+user_name+"', date='"+str(today)+"'",str(att.user_id))
					#frappe.db.sql("INSERT INTO `tabLogtable`(name,employee_name, user_id, date, time, status, ip_address, docstatus) VALUES('"+str(random.randint(1,10000000))+"','"+user_name+"','Present', device_ip,1,%s, '"+str(today)+"', '"+dt[1]+"')")
					frappe.db.sql("INSERT INTO `tabLogtable`(name,employee_name, user_id, date, time, status, ip_address, docstatus) VALUES('"+str(random.randint(1,10000000))+"','"+user_name+"','"+str(att.user_id)+"', '"+str(today)+"','"+dt[1]+"','out', '"+device_ip+"',1)")
					frappe.db.sql("INSERT INTO `tabEmployee Attendance Log`(name,employee_name, user_id, date, time, status, ip_address, docstatus) VALUES('"+str(random.randint(1,10000000))+"','"+user_name+"','"+str(att.user_id)+"', '"+str(today)+"','"+dt[1]+"','out', '"+device_ip+"',1)")

	   	isEmptyAttendance = conn.clear_attendance()
   # conn.disable_device()
	#if isEmptyAttendance:
	#	print("-------------------------------------All Attendnace Removed From In Device-----------------------------------")
		return "get_attendance Status: Success"
	except Exception as e:
		return "Error "+ str(e)
	finally:
		if conn:
			conn.disconnect()

