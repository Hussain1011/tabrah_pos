frappe.ui.form.on("SUNMI Printer", {
  refresh(frm) {
    frm.add_custom_button("Check Online Status", async () => {
      if (!frm.doc.serial_number) {
        frappe.msgprint("Serial Number is required.");
        return;
      }

      // frm.set_value("online_status", "Unknown");
      // frm.set_value("last_status_check", frappe.datetime.now_datetime());
      // frm.refresh_fields();

      const r = await frappe.call({
        method: "tabrah_pos.tabrah_pos.doctype.sunmi_printer.sunmi_printer.check_online_status",
        args: { printer_name: frm.doc.name },
        freeze: true
      });

      if (r.message) {
        // frm.set_value("online_status", r.message.online_status || "Unknown");
        // frm.set_value("last_status_check", r.message.last_status_check);
        // frm.refresh_fields();
        frappe.show_alert({ message: `Printer is ${r.message.online_status}`, indicator: "green" });
      }
    });
  }
});