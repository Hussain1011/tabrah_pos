# -*- coding: utf-8 -*-
# Copyright (c) 2021, Youssef Restom and contributors
# For license information, please see license.txt


from __future__ import unicode_literals
import frappe
from frappe import _
from frappe.model.mapper import get_mapped_doc
from frappe.utils import flt, add_days
from tabrah_pos.tabrah_pos.doctype.pos_coupon.pos_coupon import update_coupon_code_count
from tabrah_pos.tabrah_pos.api.posapp import get_company_domain
from tabrah_pos.tabrah_pos.doctype.delivery_charges.delivery_charges import (
    get_applicable_delivery_charges,
)


def validate(doc, method):
    validate_shift(doc)
    set_patient(doc)
    auto_set_delivery_charges(doc)
    calc_delivery_charges(doc)


def before_submit(doc, method):
    for d in doc.items:
        if d.custom_is_complimentary_item == 1:
           
            # prevent pricing rules from reapplying rates
            doc.flags.ignore_pricing_rule = True
            doc.ignore_pricing_rule = 1

            if row_should_be_free(doc, d):
                make_item_zero(d)

            # If you also want taxes to be zero in these cases, uncomment:
            # for tx in (doc.taxes or []):
            #     tx.tax_amount = 0
            #     tx.base_tax_amount = 0
            #     tx.total = 0
            #     tx.base_total = 0
            #     tx.tax_amount_after_discount_amount = 0
            #     tx.base_tax_amount_after_discount_amount = 0

            # recompute all totals after edits
            doc.calculate_taxes_and_totals()

    if doc.total == 0 and doc.rounded_total == 0 and doc.grand_total ==0 and doc.base_grand_total == 0:
        
        doc.outstanding_amount = 0
        doc.in_words = 0
        doc.is_pos = 0
        doc.status = 'Paid'
        doc.payment_due_date = doc.posting_date

        doc.append('payment_schedule', {
                        'due_date': doc.posting_date,
                        'invoice_portion': '100%',
                        'discount': 0,
                        'payment_amount': 0,
                        'outstanding': 0,
                        'base_payment_amount': 0,
                        'base_outstanding': 0,
                    })
        
        doc.set_missing_values()
        doc.calculate_taxes_and_totals()
        
    if doc.is_pos:    
        if doc.pos_profile:
            branch = frappe.get_doc(
                "Branch",
                {"pos_profile": ["like", f"%{doc.pos_profile}%"]}
            )
            if branch:
                doc.custom_branch = branch.name
                
                # qr_generator = frappe.db.get_value(
                #     "QR Generator",
                #     {"branch": ["like", f"%{branch.name}%"]},
                #     "name"
                # )
                # if qr_generator:
                #     doc.custom_feedback_qr = qr_generator

                if branch.enable_fbr == 1 and len(doc.payments) > 0:
                    fbr_pos_charges = branch.fbr_pos_charges
                    custom_fbr_expense_account = branch.custom_fbr_expense_account
                    fbr_charges_account = branch.fbr_charges_account
                    cost_center = doc.cost_center

                    # Create FBR Charges Credit GL Entry
                    doc.append('taxes', {
                        'charge_type': 'Actual',
                        'account_head': fbr_charges_account,
                        'tax_amount': fbr_pos_charges,
                        'description': 'FBR Charges',
                        'cost_center': cost_center,
                        'auto_added_by_script': 1
                    })

                    # Check if any payment uses specific modes of payment
                    flag = 0
                    if not doc.payments:  
                        frappe.throw("No Mode of Payment Selected")
                    for p in doc.payments:
                        if p.amount != 0:  # Only consider non-zero payments
                            mop = frappe.get_doc("Mode of Payment", p.mode_of_payment)
                            if mop.name in ['HBL', 'Keenu']:
                                flag = 1
                                break  # Exit loop early if condition is met

                    if flag == 0:
                        # Create Expense Debit GL Entry
                        doc.append('taxes', {
                            'charge_type': 'Actual',
                            'account_head': custom_fbr_expense_account,
                            'tax_amount': -1 * abs(fbr_pos_charges),
                            'description': "FBR Expense",
                            'cost_center': cost_center,
                            'auto_added_by_script': 1
                        })

                    doc.calculate_taxes_and_totals()

                    if doc.paid_amount < doc.grand_total:
                        frappe.throw("Paid Amount cannot be less than the Grand Total after tax recalculation.")

                    if doc.paid_amount == doc.grand_total:
                        doc.change_amount = 0
                        doc.base_change_amount = 0

                    if doc.paid_amount > doc.grand_total:
                        doc.change_amount = doc.paid_amount - doc.grand_total
                        doc.base_change_amount = doc.paid_amount - doc.grand_total
                        
    pos_profile = frappe.get_doc("POS Profile", doc.pos_profile)
    if pos_profile.post_auto_consumption_on_sales and doc.custom_foodpanda_order_id:
        auto_bom = frappe.get_doc("Automated BOM Manufacturing", doc.custom_foodpanda_order_id)
        auto_bom.reference_name = doc.name
        auto_bom.save()

    add_loyalty_point(doc)
    create_sales_order(doc)
    update_coupon(doc, "used")

def should_zero_out(doc):
    """
    Header-level condition. Change to your real rule.
    Examples:
      return bool(doc.get("custom_make_free"))
      return doc.customer_group == "Employees"
      return doc.get("is_return")  # etc.
    """
    return bool(doc.get("custom_make_free"))

def row_should_be_free(doc, it):
    """
    Row-level filter. Keep it broad if ALL rows should become free
    once header condition is true.
    """
    # Example per-row flag:
    # return it.get("custom_free_item") == 1
    return True   # all rows

def make_item_zero(it):
    """Zero all price-affecting fields; mark as free for reporting."""
    it.is_free_item = 1
    it.discount_percentage = 0
    it.discount_amount = 0
    it.rate = 0
    it.base_rate = 0
    it.net_rate = 0
    it.price_list_rate = 0
    it.amount = 0
    it.base_amount = 0
    it.net_amount = 0
    it.base_net_total = 0

    # clear optional margin fields if present
    if hasattr(it, "margin_rate_or_amount"): it.margin_rate_or_amount = 0
    if hasattr(it, "margin_type"): it.margin_type = ""

def before_cancel(doc, method):
    update_coupon(doc, "cancelled")


def add_loyalty_point(invoice_doc):
    for offer in invoice_doc.posa_offers:
        if offer.offer == "Loyalty Point":
            original_offer = frappe.get_doc("POS Offer", offer.offer_name)
            if original_offer.loyalty_points > 0:
                loyalty_program = frappe.get_value(
                    "Customer", invoice_doc.customer, "loyalty_program"
                )
                if not loyalty_program:
                    loyalty_program = original_offer.loyalty_program
                doc = frappe.get_doc(
                    {
                        "doctype": "Loyalty Point Entry",
                        "loyalty_program": loyalty_program,
                        "loyalty_program_tier": original_offer.name,
                        "customer": invoice_doc.customer,
                        "invoice_type": "Sales Invoice",
                        "invoice": invoice_doc.name,
                        "loyalty_points": original_offer.loyalty_points,
                        "expiry_date": add_days(invoice_doc.posting_date, 10000),
                        "posting_date": invoice_doc.posting_date,
                        "company": invoice_doc.company,
                    }
                )
                doc.insert(ignore_permissions=True)


def create_sales_order(doc):
    if (
        doc.posa_pos_opening_shift
        and doc.pos_profile
        and doc.is_pos
        and doc.posa_delivery_date
        and not doc.update_stock
        and frappe.get_value("POS Profile", doc.pos_profile, "posa_allow_sales_order")
    ):
        sales_order_doc = make_sales_order(doc.name)
        if sales_order_doc:
            sales_order_doc.posa_notes = doc.posa_notes
            sales_order_doc.flags.ignore_permissions = True
            sales_order_doc.flags.ignore_account_permission = True
            sales_order_doc.save()
            sales_order_doc.submit()
            url = frappe.utils.get_url_to_form(
                sales_order_doc.doctype, sales_order_doc.name
            )
            msgprint = "Sales Order Created at <a href='{0}'>{1}</a>".format(
                url, sales_order_doc.name
            )
            frappe.msgprint(
                _(msgprint), title="Sales Order Created", indicator="green", alert=True
            )
            i = 0
            for item in sales_order_doc.items:
                doc.items[i].sales_order = sales_order_doc.name
                doc.items[i].so_detail = item.name
                i += 1


def make_sales_order(source_name, target_doc=None, ignore_permissions=True):
    def set_missing_values(source, target):
        target.ignore_pricing_rule = 1
        target.flags.ignore_permissions = ignore_permissions
        target.run_method("set_missing_values")
        target.run_method("calculate_taxes_and_totals")

    def update_item(obj, target, source_parent):
        target.stock_qty = flt(obj.qty) * flt(obj.conversion_factor)
        target.delivery_date = (
            obj.posa_delivery_date or source_parent.posa_delivery_date
        )

    doclist = get_mapped_doc(
        "Sales Invoice",
        source_name,
        {
            "Sales Invoice": {
                "doctype": "Sales Order",
            },
            "Sales Invoice Item": {
                "doctype": "Sales Order Item",
                "field_map": {
                    "cost_center": "cost_center",
                    "Warehouse": "warehouse",
                    "delivery_date": "posa_delivery_date",
                    "posa_notes": "posa_notes",
                },
                "postprocess": update_item,
            },
            "Sales Taxes and Charges": {
                "doctype": "Sales Taxes and Charges",
                "add_if_empty": True,
            },
            "Sales Team": {"doctype": "Sales Team", "add_if_empty": True},
            "Payment Schedule": {"doctype": "Payment Schedule", "add_if_empty": True},
        },
        target_doc,
        set_missing_values,
        ignore_permissions=ignore_permissions,
    )

    return doclist


def update_coupon(doc, transaction_type):
    for coupon in doc.posa_coupons:
        if not coupon.applied:
            continue
        update_coupon_code_count(coupon.coupon, transaction_type)


def set_patient(doc):
    domain = get_company_domain(doc.company)
    if domain != "Healthcare":
        return
    patient_list = frappe.get_all(
        "Patient", filters={"customer": doc.customer}, page_length=1
    )
    if len(patient_list) > 0:
        doc.patient = patient_list[0].name


def auto_set_delivery_charges(doc):
    if not doc.pos_profile:
        return
    if not frappe.get_cached_value(
        "POS Profile", doc.pos_profile, "posa_auto_set_delivery_charges"
    ):
        return

    delivery_charges = get_applicable_delivery_charges(
        doc.company,
        doc.pos_profile,
        doc.customer,
        doc.shipping_address_name,
        doc.posa_delivery_charges,
        restrict=True,
    )

    if doc.posa_delivery_charges:
        if doc.posa_delivery_charges_rate:
            return
        else:
            if len(delivery_charges) > 0:
                doc.posa_delivery_charges_rate = delivery_charges[0].rate
    else:
        if len(delivery_charges) > 0:
            doc.posa_delivery_charges = delivery_charges[0].name
            doc.posa_delivery_charges_rate = delivery_charges[0].rate
        else:
            doc.posa_delivery_charges = None
            doc.posa_delivery_charges_rate = None


def calc_delivery_charges(doc):
    if not doc.pos_profile:
        return

    old_doc = None
    calculate_taxes_and_totals = False
    if not doc.is_new():
        old_doc = doc.get_doc_before_save()
        if not doc.posa_delivery_charges and not old_doc.posa_delivery_charges:
            return
    else:
        if not doc.posa_delivery_charges:
            return
    if not doc.posa_delivery_charges:
        doc.posa_delivery_charges_rate = 0

    charges_doc = None
    if doc.posa_delivery_charges:
        charges_doc = frappe.get_cached_doc(
            "Delivery Charges", doc.posa_delivery_charges
        )
        doc.posa_delivery_charges_rate = charges_doc.default_rate
        charges_profile = next(
            (i for i in charges_doc.profiles if i.pos_profile == doc.pos_profile), None
        )
        if charges_profile:
            doc.posa_delivery_charges_rate = charges_profile.rate

    if old_doc and old_doc.posa_delivery_charges:
        old_charges = next(
            (
                i
                for i in doc.taxes
                if i.charge_type == "Actual"
                and i.description == old_doc.posa_delivery_charges
            ),
            None,
        )
        if old_charges:
            doc.taxes.remove(old_charges)
            calculate_taxes_and_totals = True

    if doc.posa_delivery_charges:
        doc.append(
            "taxes",
            {
                "charge_type": "Actual",
                "description": doc.posa_delivery_charges,
                "tax_amount": doc.posa_delivery_charges_rate,
                "cost_center": charges_doc.cost_center,
                "account_head": charges_doc.shipping_account,
            },
        )
        calculate_taxes_and_totals = True

    if calculate_taxes_and_totals:
        doc.calculate_taxes_and_totals()


def validate_shift(doc):
    if doc.posa_pos_opening_shift and doc.pos_profile and doc.is_pos:
        # check if shift is open
        shift = frappe.get_cached_doc("POS Opening Shift", doc.posa_pos_opening_shift)
        if shift.status != "Open":
            frappe.throw(_("POS Shift {0} is not open").format(shift.name))
        # check if shift is for the same profile
        if shift.pos_profile != doc.pos_profile:
            frappe.throw(
                _("POS Opening Shift {0} is not for the same POS Profile").format(
                    shift.name
                )
            )
        # check if shift is for the same company
        if shift.company != doc.company:
            frappe.throw(
                _("POS Opening Shift {0} is not for the same company").format(
                    shift.name
                )
            )
