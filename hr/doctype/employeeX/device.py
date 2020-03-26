import frappe
from zk import ZK, const

@frappe.whitelist()
def get_all_device_user():
	us = []
	conn = None
	zk = ZK('45.251.231.166', port=4370, timeout=5, password=3636, force_udp=False, ommit_ping=False)
	try:
		conn = zk.connect()
		conn.disable_device()
		users = conn.get_users()
		for user in users:
			privilege = 'User'
			if user.privilege == const.USER_ADMIN:
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