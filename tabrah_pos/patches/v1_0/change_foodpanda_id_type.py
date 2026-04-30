import frappe

def execute():
    doctypes = ["Sales Invoice"]  # add child doctypes if needed
    for dt in doctypes:
        if frappe.db.has_column(dt, "custom_foodpanda_order_id"):
            # pick TEXT or LONGTEXT
            frappe.db.sql(f"""
                ALTER TABLE `tab{dt}`
                MODIFY `custom_foodpanda_order_id` TEXT
            """)