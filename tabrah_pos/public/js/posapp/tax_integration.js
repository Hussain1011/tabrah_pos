export async function sync_fbr(invoice, pos_profile) {
    try {
        // Fetch branch document based on POS profile
        const branch_doc = await fetchDocument('Branch', { pos_profile });

        // Fetch invoice document based on invoice name
        const invoice_doc = await fetchDocument('Sales Invoice', { name: invoice });

        // Debugging output for branch and invoice documents
        console.log("Branch Document:", branch_doc);
        console.log("Invoice Document:", invoice_doc);

        // Check if FBR is enabled for the branch
        if (branch_doc.message.enable_fbr) {
            console.log("FBR Integration Enabled");
            console.log("POS Profile:", pos_profile, "Invoice:", invoice);
            console.log("Branch Document:", branch_doc.message, "Invoice Document:", invoice_doc.message);

            // Prepare order data for FBR
            const order_data = get_order_data_for_fbr(invoice_doc.message, branch_doc.message);
            console.log("Order Data:", order_data);

            // Get FBR Invoice ID
            const fbr_resp = await get_fbr_invoice_id(branch_doc, order_data);
            console.log("FBR Response:", fbr_resp);

            if (fbr_resp && fbr_resp.Code === "100") {
                if (invoice_doc && invoice_doc.message) {
                    invoice_doc.message.fbr_invoice_id = fbr_resp.InvoiceNumber || "000000000";
                    console.log("Updated Invoice Document with FBR ID:", invoice_doc.message);
                    
                    try {
                        // Fetch QR code data for the invoice
                        const qr_resp = await fetchQRData(invoice_doc.message.fbr_invoice_id, invoice_doc.message.name);
                        console.log("QR Code Response:", qr_resp);
                        
                        return 100; // Success
                    } catch (error) {
                        console.error("Error fetching QR code data:", error);
                        return 500; // Failure due to QR code fetch error
                    }
                } else {
                    console.error("Invoice document or message is undefined.");
                    return 500; // Failure due to undefined invoice document
                }
            } else {
                console.log("FBR TO ERP: Unable to generate FBR QR number.");
                console.log("Full FBR Response:", fbr_resp);  // Log the full response for debugging
                return 500; // Failure due to unsuccessful FBR response
            }
        } else {
            console.log("FBR Integration is Disabled");
            return 500; // Failure due to FBR integration being disabled
        }
    } catch (error) {
        // Error handling
        console.error("Error during FBR synchronization:", error);
        return 500; // Failure due to general error
    }
}

// Helper function to fetch a document based on doctype and filters
async function fetchDocument(doctype, filters) {
    try {
        const response = await frappe.call({
            method: 'frappe.client.get',
            args: {
                doctype,
                filters
            }
        });
        return response;
    } catch (error) {
        throw new Error(`Failed to fetch ${doctype} document: ${error.message}`);
    }
}

// Helper function to fetch QR code data for the invoice
async function fetchQRData(fbr_invoice_no, sales_invoice_name) {
    try {
        const response = await frappe.call({
            method: 'tabrah_pos.tabrah_pos.api.update_invoice_tax.get_qr_data',
            args: {
                fbr_invoice_no,
                sales_invoice_name
            }
        });
        return response;
    } catch (error) {
        throw new Error(`Failed to fetch QR data: ${error.message}`);
    }
}



function get_order_data_for_fbr(invoice_doc, branch_doc) {
    const items_data = get_items_list_for_fbr(invoice_doc, invoice_doc.ref_usin);
    const fbr_id = branch_doc.fbr_pos_id;
    const postingDate = invoice_doc.posting_date; 
    const postingTime = invoice_doc.posting_time;  
    const fbr_date = `${postingDate.toString()} ${postingTime.toString().split('.')[0]}`;
    var usin = fbr_id + '-' + invoice_doc.name.split(" ")[0].replace(/-manager-|-cashier-/, "-");


    console.log(fbr_date);  
    let data = {};

    if (branch_doc.authority === "FBR") {
        data = {
            "InvoiceNumber": "",
            "POSID": parseInt(fbr_id),
            "USIN": usin,
            "DateTime": fbr_date,
            "BuyerNTN": "1234567-8",
            "BuyerCNIC": "12345-1234567-8",
            "BuyerName": "Buyer Name",
            "BuyerPhoneNumber": "0000-0000000",
            "TotalBillAmount": Math.abs(invoice_doc.rounded_total),
            "TotalQuantity": Math.abs(invoice_doc.total_qty),
            "TotalSaleValue": Math.abs(invoice_doc.total),
            "TotalTaxCharged": Math.abs(invoice_doc.total_taxes_and_charges),
            "Discount": invoice_doc.discount_amount || 0.0,
            "FurtherTax": 0.0,
            "PaymentMode": 1,
            "RefUSIN": "",
            "InvoiceType": 1,
            "Items": items_data
        };

    } else if (branch_doc.authority === "SRB") {
        data = {
            "posId": parseInt(fbr_id),
            "name": "",
            "ntn": "1234567-8",
            "invoiceDateTime": fbr_date,
            "invoiceType": "12345-1234567-8",
            "invoiceID": "Buyer Name",
            "rateValue": "0000-0000000",
            "saleValue": Math.abs(invoice_doc.total_qty),
            "taxAmount": Math.abs(invoice_doc.total),
            "consumerName": Math.abs(invoice_doc.total_taxes_and_charges),
            "consumerNTN": invoice_doc.discount_amount || 0.0,
            "address": 0.0,
            "tariffCode": 0.0,
            "extraInf": 0.0,
            "TransType": 1
        };

    } else if (branch_doc.authority === "PRA") {
        data = {
            "InvoiceNumber": "",
            "POSID": parseInt(fbr_id),
            "USIN": usin,
            "DateTime": fbr_date,
            "BuyerPNTN": "1234567-8",
            "BuyerCNIC": "12345-1234567-8",
            "BuyerName": "Buyer Name",
            "BuyerPhoneNumber": "0000-0000000",
            "TotalBillAmount": Math.abs(invoice_doc.rounded_total),
            "TotalQuantity": Math.abs(invoice_doc.total_qty),
            "TotalSaleValue": Math.abs(invoice_doc.total),
            "TotalTaxCharged": Math.abs(invoice_doc.total_taxes_and_charges),
            "Discount": invoice_doc.discount_amount || 0.0,
            "FurtherTax": 0.0,
            "PaymentMode": 1,
            "RefUSIN": "",
            "InvoiceType": 1,
            "Items": items_data
        };

    } else {
        console.error("Unknown authority:", branch_doc.authority);
    }
    return data;
}

function get_items_list_for_fbr(invoice_doc, refUSIN) {
    const items_list = invoice_doc.items;
    const items_data = items_list.map(item => {
        const item_data = {
            "ItemCode": item.item_code,
            "ItemName": item.item_name, 
            "Quantity": Math.abs(item.qty),
            "PCTCode": "11001010",
            "TaxCharged": 0.0,
            "Discount": Math.abs(item.discount_amount) || 0.0,
            "FurtherTax": 0.0
            
        };

        if (refUSIN) {
            // if (lineamount.priceWithTax < 0) {
            //     item_data["TaxRate"] = Math.abs(item.item_tax_rate);
            //     item_data["SaleValue"] = Math.abs(item.net_amount);
            //     item_data["TotalAmount"] = Math.abs(item.amount);
            //     item_data["RefUSIN"] = refUSIN;
            //     item_data["InvoiceType"] = 3;
            // } else {
            //     item_data["TaxRate"] = Math.abs(item.item_tax_rate);
            //     item_data["SaleValue"] = Math.abs(item.net_amount);
            //     item_data["TotalAmount"] = Math.abs(item.amount);
            //     item_data["RefUSIN"] = refUSIN;
            //     item_data["InvoiceType"] = 2;
            // }
        } else {
            item_data["TaxRate"] = Math.abs(item.item_tax_rate) || 0.0;
            item_data["SaleValue"] = Math.abs(item.net_amount) ;
            item_data["TotalAmount"] = Math.abs(item.amount);
            item_data["RefUSIN"] = "";
            item_data["InvoiceType"] = 1;
        }

        return item_data;
    });

    return items_data;
}

async function get_fbr_invoice_id(branch_doc, orderData) {
        const fbrHost = branch_doc.message.fbr_host;
        console.log("fbrHost:",fbrHost);
        console.log("Authority:", branch_doc.message.authority);
        let url;
        if (branch_doc.message.authority === "SRB") {
            url = fbrHost 
                ? `http://${fbrHost}:8282/SalesInvoiceService` 
                : `http://localhost:8282/SalesInvoiceService`;
        } else {
            url = fbrHost 
                ? `http://${fbrHost}:8524/api/IMSFiscal/GetInvoiceNumberByModel` 
                : `http://localhost:8524/api/IMSFiscal/GetInvoiceNumberByModel`;
        }
    
        console.log("Before generating the FBR invoice number --->", orderData);
    
        try {
            const response = await $.ajax({
                url: url,
                type: "POST",
                data: JSON.stringify(orderData),
                dataType: "json",
                cache: false,
                contentType: "application/json; charset=utf-8",
                processData: false
            });
    
            return response;
        } catch (error) {
            console.error("Error generating FBR invoice:", error);
            return null;
        }
        
    
    
}
