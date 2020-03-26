import frappe
import random
import time
from zk import ZK, const
from datetime import datetime

@frappe.whitelist()
def get_users():
	group =[]
	conn = None
	zk = ZK('10.33.210.20', port=4370, timeout=100, password=3636, force_udp=False, ommit_ping=False)
	try:
	    conn = zk.connect()
	    conn.disable_device()
	    users = conn.get_users()
	    #for i, val in enumerate(users):
	    	#frappe.db.sql("INSERT INTO tabAttendance (uid,name,password,group_id,user_id,card, docstatus) VALUES ('"+str(val.uid)+"', '"+str(val.name)+"','"+str(val.password)+"','"+str(val.group_id)+"','"+str(val.user_id)+"','"+str(val.card)+"',1)")
	    return "User Added"
	except Exception as e:
	    print ("Process terminate : {}".format(e))
	finally:
	    if conn:
	        conn.disconnect()

@frappe.whitelist()
def update_log():
	max_time = frappe.db.sql("SELECT MAX(date), MAX(out_time) FROM tabAttendance")
	mlist = list(max_time)
	return type(list(mlist[0]))
	#condition = datetime.strptime(maxxx, '%d-%m-%Y,%H:%M:%S')
	conn = None
	zk = ZK('10.33.210.20', port=4370, timeout=5, password=3636, force_udp=False, ommit_ping=False)
	try:
	    conn = zk.connect()
	    conn.disable_device()
	    attendances = conn.get_attendance()
	    insertable = []
	   # for i, att in enumerate(attendances):
	#	st = att.timestamp
	#	if st > condition:
	#	   insertable.append(st)
	 #   return insertable
	except Exception as e:
	   return e
	finally:
	    if conn:
		conn.disconnect()

#Successfully log updated22-10-2019,17:56:54



@frappe.whitelist()
def get_attendance():
	group =[]
	conn = None
	zk = ZK('10.33.210.20', port=4370, timeout=100, password=3636, force_udp=False, ommit_ping=False)
	try:
	    conn = zk.connect()
	    conn.disable_device()
	    attendances = conn.get_attendance()
	    for i, att in enumerate(attendances):
	    	dt = str(att.timestamp).split(" ")
	    	today = datetime.strptime(dt[0], '%Y-%m-%d').strftime('%d-%m-%Y')
	        user_name = frappe.db.sql("SELECT employee_name from tabEmployee where emp_id='77'")
		pname = list(user_name)
	        qname = pname[0]
    	        #frappe.db.sql("INSERT INTO tabAttendance(name,employee_name, status,docstatus,uid, date,time,out_time) VALUES('"+str(random.randint(1,10000000))+"','aaaa','Present',1,%s, '"+str(today)+"', '"+dt[1]+"','"+dt[1]+"') ON DUPLICATE KEY UPDATE employee_name='aaaa', out_time='"+dt[1]+"', date='"+str(today)+"'",att.uid)
		#frappe.db.sql("INSERT INTO tabLogtable(name,uid, date,time) VALUES('"+str(random.randint(1,100000))+"','"+str(att.uid)+"', '"+str(today)+"','"+str(dt[1])+"')")
	    return type(qname)
	except Exception as e:
	    return "Error "+ str(e)
#	    print ("Process terminate : {}".format(e))
	finally:
	    if conn:
	        conn.disconnect()



#[73 : 2019-10-09 17:18:08 (4, 255)]
