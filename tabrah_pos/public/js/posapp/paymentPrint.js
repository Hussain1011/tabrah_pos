import { handlePaymentNetworkPrinting } from './qzTrayService';

export async function printPaymentReceipt(invoiceDoc, pos_profile) {
    try {
        // Check if network printing is enabled for payments
        if (pos_profile?.custom_enable_payment_network_prints) {
            return await handlePaymentNetworkPrinting(invoiceDoc, pos_profile);
        } else {
            return await handleBrowserPaymentPrinting(invoiceDoc, pos_profile);
        }
    } catch (error) {
        console.error("Error printing payment receipt:", error);
        throw error;
    }
}

async function handleBrowserPaymentPrinting(invoiceDoc, pos_profile) {
    try {
        const print_format = pos_profile.print_format_for_online || pos_profile.print_format;
        const letter_head = pos_profile.letter_head || 0;
        const formattedValue = encodeURIComponent(print_format.trim());

        const url = frappe.urllib.get_base_url() +
            "/printview?doctype=Sales%20Invoice&name=" +
            invoiceDoc.name +
            "&trigger_print=1" +
            "&format=" +
            formattedValue +
            "&no_letterhead=" +
            letter_head;

        console.log("Print-url", url);

        const printFrame = document.getElementById("printFrame");
        if (printFrame) {
            printFrame.src = url;

            printFrame.onload = function () {
                printFrame.contentWindow.focus();
                printFrame.contentWindow.print();
            };
        } else {
            // Fallback: open in new window
            const printWindow = window.open(url, '_blank');
            printWindow.onload = function() {
                printWindow.print();
            };
        }

        return true;
    } catch (error) {
        console.error("Error in browser payment printing:", error);
        throw error;
    }
} 