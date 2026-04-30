from __future__ import annotations

import frappe
from frappe.model.document import Document

from tabrah_pos.tabrah_pos.doctype.sunmi_printer.sunmi_client import SunmiConfig, SunmiOpenApiClient
from tabrah_pos.tabrah_pos.doctype.sunmi_printer.template import render_escpos_template


class SUNMIPrinter(Document):

	def get_sunmi_client(self):
		settings = frappe.get_single("SUNMI Settings")
		app_id = (settings.app_id or "").strip()
		app_key = (settings.get_password("app_key") or "").strip()
		if not app_id or not app_key:
			frappe.throw("SUNMI Settings is missing app_id/app_key.")

		return SunmiOpenApiClient(SunmiConfig(app_id=app_id, app_key=app_key))

	@frappe.whitelist()
	def check_online_status(self):
		sn = (self.serial_number or "").strip()
		if not sn:
			frappe.throw("Serial Number is required.")

		client = self.get_sunmi_client()

		try:
			result = client.get_online_status(sn)
		except Exception as e:
			frappe.throw(f"Failed to check status from SUNMI: {e}")

		online_status = client.normalize_status(result.get("is_online"))

		now_dt = frappe.utils.now_datetime()

		return {
			"online_status": online_status,
			"last_status_check": now_dt,
			"raw": result.get("raw"),
		}

	def print(self, body):
		client = self.get_sunmi_client()
		sn = (self.serial_number or "").strip()
		try:
			result = client.push_print_content(sn, body)
		except Exception as e:
			frappe.throw(f"Failed to print from SUNMI: {e}")



@frappe.whitelist()
def check_online_status(printer_name: str):
	doc = frappe.get_doc("SUNMI Printer", printer_name)
	return doc.check_online_status()



@frappe.whitelist()
def get_sunmi_printers():
	# Return list used by the UI buttons
	return frappe.get_all(
		"SUNMI Printer",
		fields=["name", "printer_name", "serial_number", "color"],
		order_by="printer_name asc"
	)

@frappe.whitelist()
def print_receipt_to_sunmi(doctype: str, docname: str, printer: str, print_format: str = None):
	doc = frappe.get_doc(doctype, docname)
	p = frappe.get_doc("SUNMI Printer", printer)
	p.check_online_status()
	body = render_escpos_template(doctype, docname, print_format)
	p.print(body)

	return {"ok": True, "printer": p.name}