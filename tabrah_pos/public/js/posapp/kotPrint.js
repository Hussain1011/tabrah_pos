import { initQZTray, groupItemsByPrinter, printKotWithQZTray } from './qzTrayService';

export async function printKot(offlineData) {
    try {
        // Check if network printing is enabled in POS profile
        if (offlineData.pos_profile?.custom_enable_kot_network_printing) {
            return await handleNetworkPrinting(offlineData);
        } else {
            return await handleBrowserPrinting(offlineData);
        }
    } catch (error) {
        console.error("Error printing KOT:", error);
        throw error;
    }
}

async function handleNetworkPrinting(offlineData) {
    try {
        // Initialize QZ Tray
        const connected = await initQZTray();
        if (!connected) {
            console.error('QZ Tray not connected. Falling back to browser printing.');
            return await handleBrowserPrinting(offlineData);
        }

        // Group items by printer
        const printerGroups = groupItemsByPrinter(offlineData.items, offlineData.pos_profile);

        // Print to each printer
        for (const [printerKey, group] of Object.entries(printerGroups)) {
            const kotData = {
                ...offlineData,
                items: group.items
            };

            const success = await printKotWithQZTray(group.config, kotData);
            if (!success) {
                console.error(`Failed to print to ${printerKey}`);
            }
        }

        return true;
    } catch (error) {
        console.error("Error in network printing:", error);
        // Fallback to browser printing
        return await handleBrowserPrinting(offlineData);
    }
}

async function handleBrowserPrinting(offlineData) {
    try {
        let now = new Date();
        let lastGroup = null;
        const items = offlineData?.items || [];
        const tableNo = offlineData?.table_no || "N/A";
        const date = offlineData?.date || now.toISOString().split('T')[0]; // Fallback to current date
        const time = offlineData?.time || now.toLocaleTimeString('en-US', { hour12: true }); // Fallback to current time

        // Dynamically generate table rows for the items
        const itemRows = items
            .map(item => {
                const { item_name, qty, comment, product_bundle, item_group } = item;
                let bundleRows = "";
                let rows = "";
                
                // 1️⃣ Add a group header if this item_group is different from the last one
                if (item_group && item_group !== lastGroup) {
                    lastGroup = item_group;
                    rows += `
                    <tr style="background: #f2f2f2; font-weight: bold; border-top: 2px solid #000;">
                        <td colspan="2" style="padding: 5px 0;">${item_group}</td>
                    </tr>
                    `;
                }
                // If the item has a product bundle, add its items below the main item
                if (product_bundle?.items?.length > 1) {
                    bundleRows = product_bundle.items
                        .slice(1) // Skip the first item in the product bundle
                        .map(bundleItem => `
                            <tr>
                                <td style="padding-left: 20px;">- ${bundleItem.custom_item_name}</td>
                                <td class="text-center">1</td>
                            </tr>
                        `)
                        .join("");
                }

                // If the item has a comment, show it below the item
                let commentRow = comment
                    ? `<tr><td colspan="2" style="font-style: italic; color: grey;">Note: ${comment}</td></tr>`
                    : "";

                rows += `
                    <tr style="border-bottom: 2px solid black;">
                        <td>${item_name || "N/A"}</td>
                        <td class="text-center">${qty || 0}</td>
                    </tr>
                    ${bundleRows}
                    ${commentRow}
                `;
                return rows;
            })
            .join("");

        // Create a new window
        const newWindow = window.open("", "_blank");

        // Set the HTML content of the new window
        newWindow.document.write(`
            <html>
            <head>
                <style>
                    .print-format table, .print-format tr, 
                    .print-format td, .print-format div, .print-format p {
                        line-height: 150%;
                        vertical-align: middle;
                        margin: 2px 0;
                    }
                    
                    @media screen {
                        .print-format {
                            width: 3.6in;
                            padding: 0.25in;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="print-format">
        <div style="margin-bottom: 5px;">
        </div>
                    ${offlineData.company === "Run of the Mill" && offlineData.custom_token_number ? 
                        `<div style="text-align: center; margin-bottom: 10px;">
                            <h1 style="font-size: 48px; font-weight: bold; margin: 0; padding: 10px; border: 3px solid black;">
                                ${offlineData.custom_token_number}
                            </h1>
                            <p style="font-size: 18px; font-weight: bold; margin: 5px 0;">Run of the Mill</p>
                        </div>` : 
                        '<div style="text-align: center; margin-bottom: 10px;"><h2>KITCHEN ORDER TICKET</h2></div>'
                    }
                    <div style="display:flex;justify-content:space-between;margin-bottom: 2px;">
                        <p class="text-center" style="margin-bottom: 2px;">Server: N/A</p>
                        <p class="text-center" style="margin-bottom: 2px;">No of Pax: ${offlineData.cover || 'N/A'}</p>
                    </div>
                    <div style="display:flex;justify-content:space-between;margin-bottom: 2px;">
                        <p class="text-center" style="margin-bottom: 2px;">Order No: 12345</p>
                        <p style="margin-bottom: 0;">Date: ${date}</p>
                    </div>
                    <div style="display:flex;justify-content:space-between;margin-bottom: 2px;">
                        <p style="margin-bottom: 0;">Table: ${tableNo}</p>
                        <p style="margin-bottom: 0;">Time: ${time}</p>
                    </div>
                    <p class="text-center" style="margin-bottom: 0.25rem; border-bottom: 2px solid black; font-size:15px;"><b>Dine In</b></p>
                    <div style="display:flex;justify-content:space-between; border-bottom: 2px solid black; font-size:15px;">
                        <p style="margin-bottom: 0;"><b>New Order</b></p>
                        <p style="margin-bottom: 0;"><b>Modified</b></p>
                    </div>
                    <table style="margin-top: 1px;" class="innertext">
                        <thead>
                            <tr style="border-bottom: 2px solid black;">
                                <th style="width: 70%;"><b>ITEM</b></th>
                                <th style="width: 30%;" class="text-center"><b>Qty</b></th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemRows}
                        </tbody>
                    </table>
                </div>
            </body>
            </html>
        `);
        newWindow.document.close();

        // Add event listener for after printing
        newWindow.onafterprint = () => {
            newWindow.close();
        };

        // Open the print dialog
        newWindow.print();

        // Fallback for browsers that don't support onafterprint
        newWindow.addEventListener("focus", () => {
            setTimeout(() => {
                newWindow.close();
            }, 500); // Adjust delay if necessary
        });

        return true;
    } catch (error) {
        console.error("Error in browser printing:", error);
        throw error;
    }
}
