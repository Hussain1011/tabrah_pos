import frappe
import json
from erpnext.stock.get_item_details import get_default_bom


   
        
def get_packed_items(invoice_name,item_code):
    return frappe.get_all("Packed Item", filters={"parent": invoice_name, "parent_item": item_code}, fields=["item_code", "qty"])
def on_submit(self, method):

    default_price_list = 'Standard Selling'
    price_list = None
    if self.resturent_type:
        price_list = frappe.db.get_value('Price List', {'order_type': self.resturent_type}, 'name')

    if price_list:
        self.selling_price_list = price_list
    else:
        if frappe.db.exists('Price List', default_price_list):
            self.selling_price_list = default_price_list
    if self.is_pos:
        pos_profile = frappe.get_doc("POS Profile", self.pos_profile)
        if pos_profile.post_auto_consumption_on_sales and self.cost_center:
            if len(self.items) > 0:
                auto_boms = []
                for d in self.items:
                    packed_items = get_packed_items(self.name, d.item_code)
                    if packed_items:
                        for packed_item in packed_items:
                            bom = get_default_bom(packed_item.item_code)
                            if bom:
                                doc = frappe.get_doc({
                                    'doctype': 'Automated BOM Manufacturing',
                                    'item_code': packed_item.item_code,
                                    'bom': bom,
                                    'posting_date': self.posting_date,
                                    'posting_time': self.posting_time,
                                    'reference_doctype': self.doctype,
                                    'reference_name': "ACC-SINV-2025-00077",
                                    'cost_center': self.cost_center,
                                    'qty': packed_item.qty
                                })
                                doc.insert()
                                auto_boms.append(doc.name)
                                doc.submit()
                                print(doc)
                    else:
                        bom = get_default_bom(d.item_code)
                        if bom:
                            doc = frappe.get_doc({
                                'doctype': 'Automated BOM Manufacturing',
                                'item_code': d.item_code,
                                'bom': bom,
                                'posting_date': self.posting_date,
                                'posting_time': self.posting_time,
                                'reference_doctype': self.doctype,
                                'reference_name': "ACC-SINV-2025-00077",
                                'cost_center': self.cost_center,
                                'qty': d.qty
                            })
                            doc.insert()
                            auto_boms.append(doc.name)
                            doc.submit()

                self.custom_foodpanda_order_id = json.dumps(auto_boms)

def onsubmit(self, method):

    pos_profile = frappe.get_doc("POS Profile", self.pos_profile)
    if pos_profile.custom_allow_kot_print_on_payments:
        kot_doc = frappe.new_doc("Kitchen Order Ticket")
        kot_doc.company = self.company
        kot_doc.pos_profile = self.pos_profile
        if self.table_no:
            kot_doc.table_no = self.table_no
        kot_doc.token_no = self.table_no
        kot_doc.notes = 'notes'
        kot_doc.status = 'todo'
        kot_doc.pos_opening_shift = self.posa_pos_opening_shift
        kot_doc.sales_invoice = self.name
        for it in self.items:
            child = kot_doc.append("items", {})
            child.item_code = it.item_code
            item_grp = frappe.get_doc("Item", child.item_code)
            child.item_name = it.item_name
            child.item_group = item_grp.item_group
            child.qty = it.qty
            child.uom = it.uom
            child.remarks = "remarks"
        kot_doc.insert(ignore_permissions=True)    
        frappe.db.commit()

    
    frappe.publish_realtime(
        "kot_created",
        {"kot": self.as_dict()},
        after_commit=True
    )