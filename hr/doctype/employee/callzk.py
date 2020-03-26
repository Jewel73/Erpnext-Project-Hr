import frappe
from zk import ZK, const
@frappe.whitelist()
def get_all_device_user(device_select):
	us = []
	conn = None
	zk = ZK(str(device_select), port=4370, timeout=5, password=3636, force_udp=False, ommit_ping=False)
	try:
	    conn = zk.connect()
	    conn.disable_device()
	    users = conn.get_users()
	    for user in users:
	        privilege = 'User'
	        if user.privilege == const.USER_DEFAULT:
	            privilege = 'Admin'
	        tpl1 = (user.uid, user.name, privilege, user.password, user.group_id, user.user_id)
	        us.append(tpl1)
	    conn.test_voice()
	    conn.enable_device()
	    print(us)
	    return us
	except Exception as e:
	    print ("Process terminate : {}".format(e))
	finally:
	    if conn:
	        conn.disconnect()


@frappe.whitelist() 
def save_insert(uid,name,password,card,device_select,user_id):
	print("-------------------Calling from save user---------------------------")

	conn = None
	zk = ZK(str(device_select), port=4370, timeout=5, password=1234, force_udp=False, ommit_ping=False)
	try:
	    conn = zk.connect()
	    print(type(int(uid)))
	    conn.set_user(uid=int(uid), name=name, privilege=const.USER_DEFAULT, password=password, group_id='',user_id=user_id, card=int(card))
	    print("-------------------USer Added--------------------------")
	    conn.disable_device()
	    conn.enable_device()
	except Exception as e:
	    print ("Process terminate : {}".format(e))
	finally:
	    if conn:
	        conn.disconnect()


@frappe.whitelist() 
def remove_user(uid, device_select):
        conn = None
        zk = ZK(str(device_select), port=4370, timeout=5, password=1234, force_udp=False, ommit_ping=False)
        try:
            conn = zk.connect()
            conn.delete_user(uid=int(uid))
	    print("User Removed-------------------------------------------------")
            conn.disable_device()
        except Exception as e:
            print ("Process terminate : {}".format(e))
        finally:
            if conn:
                conn.disconnect()
