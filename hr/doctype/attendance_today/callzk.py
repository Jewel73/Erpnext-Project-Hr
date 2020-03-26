import frappe
import random
import time
from zk import ZK, const
from datetime import datetime
from __future__ import unicode_literals
from frappe.model.document import Document

@frappe.whitelist()
def getCalled():
	print("+++++++++++DEMO+++++++++++++++++++++-----------ATTENDANCE TODAY --------------------------+++++++++++++++")
@frappe.whitelist()
def get_attendance():
	print("Getting Attendance")
	in_list = frappe.db.sql("SELECT ip_address from `tabIn Device`")
	out_list = frappe.db.sql("SELECT ip_address from `tabOut Device`")
	ip_address=[]
	for ip in in_list:
		print(ip[0])
		#get_attendance_connect(str(ip[0]))
		set_attendance_in_device(str(ip[0]))
	for ip in out_list:
		print(ip[0])
		set_attendance_out_device(str(ip[0]))


@frappe.whitelist()
def set_attendance_out_device(device_ip):
	group =[]
        print("----------==============================================--------------")
	conn = None
	zk = ZK(device_ip, port=4370, timeout=100, password=1234, force_udp=False, ommit_ping=False)
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
			if user.uid == att.uid:
				user_name= user.name			
			    	dt = str(att.timestamp).split(" ")
				today = datetime.strptime(dt[0], '%Y-%m-%d').strftime('%Y-%m-%d')
    	        		frappe.db.sql("INSERT INTO `tabAttendance Today`(name,employee_name, status,docstatus,uid, date,out_time) VALUES('"+str(random.randint(1,10000000))+"','"+user_name+"','Present',1,%s, '"+str(today)+"','"+dt[1]+"') ON DUPLICATE KEY UPDATE employee_name='"+user_name+"', out_time='"+dt[1]+"', date='"+str(today)+"'",str(att.uid))
	    return "get_attendance Status: Success"
	except Exception as e:
	    return "Error "+ str(e)
	finally:
	    if conn:
	        conn.disconnect()

@frappe.whitelist()
def set_attendance_in_device(device_ip):
        group =[]
        print("----------==============================================--------------")
        conn = None
        zk = ZK(device_ip, port=4370, timeout=100, password=1234, force_udp=False, ommit_ping=False)
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
                        if user.uid == att.uid:
                                user_name= user.name
                                dt = str(att.timestamp).split(" ")
                                today = datetime.strptime(dt[0], '%Y-%m-%d').strftime('%Y-%m-%d')
				frappe.db.sql("INSERT INTO `tabAttendance Today`(name,employee_name, status,docstatus,uid, date,time,out_time) VALUES('"+str(random.randint(1,10000000))+"','"+user_name+"','Present',1,%s, '"+str(today)+"', '"+dt[1]+"','"+dt[1]+"') ON DUPLICATE KEY UPDATE employee_name='"+user_name+"', date='"+str(today)+"'",str(att.uid))
            return "get_attendance Status: Success"
        except Exception as e:
            return "Error "+ str(e)
        finally:
            if conn:
                conn.disconnect()


#[73 : 2019-10-09 17:18:08 (4, 255)]
@frappe.whitelist()
def update_log():
        print("Getting Attendance")
        in_list = frappe.db.sql("SELECT ip_address from `tabIn Device`")
        out_list = frappe.db.sql("SELECT ip_address from `tabOut Device`")
        ip_address=[]
        for ip in in_list:
                print(ip[0])
                update_log_connect(str(ip[0]))
        for ip in out_list:
                print(ip[0])
                update_log_connect(str(ip[0]))

@frappe.whitelist()
def update_log_connect(device_ip):
	conn = None
	zk = ZK(device_ip, port=4370, timeout=5, password=1234, force_udp=False, ommit_ping=False)
	try:
		conn = zk.connect()
		conn.disable_device()
		hasFound= []
		max_time = frappe.db.sql("SELECT MAX(date), MAX(time) FROM tabLogtable")
		print("-------------------Updating log table ---------------------"+ str(len(max_time)))
		print(max_time)
		if len(max_time)>0:
			print("------------------Second If ---------------------")
			Dt = str(max_time[0][0])+" "+str(max_time[0][1])
			nDt = datetime.strptime(Dt, '%d-%m-%Y %H:%M:%S')
			attendances = conn.get_attendance()
			users = conn.get_users()
			for i, att in enumerate(attendances):
				for user in users:
					if user.uid == att.uid:
						user_name = user.name
						st = att.timestamp
						if st > nDt:
							sp = str(att.timestamp).split(" ")
							#dtime = datetime.strptime(sp[0], '%Y-%m-%d').strftime('%d-%m-%Y')
							dtime = datetime.strptime(sp[0], '%Y-%m-%d')
							frappe.db.sql("INSERT INTO tabLogtable(name,employee_name,uid,date,time,out_time) VALUES('"+str(random.randint(1,10000))+"','"+user_name+"','"+str(att.uid)+"','"+str(dtime)+"','"+str(sp[1])+"','out')")
							hasFound.append(dtime)
			return len(hasFound)
		else:
			return max_time
	except Exception as e:
		return e
	finally:
		if conn:
			conn.disconnect()
getCalled()
