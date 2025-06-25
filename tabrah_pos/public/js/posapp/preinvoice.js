export async function printPreInvoice(offlineData) {
    try {
        const cartItems = offlineData?.cart_items || [];

        // Calculate totals
        let totalExclGST = 0;

        const processedItems = cartItems.map(cartItem => {
            const parentAmount = (cartItem.qty || 0) * (cartItem.rate || 0);
            totalExclGST += parentAmount;

            const validBundleItems = (cartItem.bundle_items || []).filter(
                bundle => bundle.item_name !== cartItem.item_name
            );

            const groupedBundles = validBundleItems.reduce((groups, bundle) => {
                const groupKey = bundle.item_group || 'Other';
                if (!groups[groupKey]) {
                    groups[groupKey] = {
                        item_names: [],
                        totalRate: 0,
                        item_group: groupKey
                    };
                }
                groups[groupKey].item_names.push(bundle.item_name);
                groups[groupKey].totalRate += bundle.rate || 0;
                return groups;
            }, {});

            const bundleGroups = Object.values(groupedBundles);

            return {
                ...cartItem,
                bundle_groups: bundleGroups,
                parentAmount
            };
        });

        const gstAmountCash = 0;
        const grandTotalCash = totalExclGST + gstAmountCash;
        const gstAmountCard = Number((totalExclGST * 0.05).toFixed(2));
        const grandTotalCard = totalExclGST + gstAmountCard;

        const now = new Date();
        const dateTimeString = now.toLocaleString();
        const postingDate = now.toLocaleDateString();
        const postingTime = now.toLocaleTimeString();

        const newWindow = window.open("", "_blank");

        newWindow.document.write(`
<html>
<head>
    <title>PRE INVOICE</title>
    <style>
        .print-format table, .print-format tr, 
        .print-format td, .print-format div, .print-format p {
            line-height: 100%;
            vertical-align: middle;
        }
        @media screen {
            .print-format {
                width: 3.5in;
                padding: 0.25in;
                min-height: 8in;
            }
        }
        .print-format td, .print-format th {
            padding: 5px !important;
        }
        @media print {
            body {
                margin: 2mm;
                font-size: 12px !important;
            }
            table {
                page-break-inside: avoid;
                margin: 3px 0 !important;
            }
        }
        body {
            font-family: Arial;
            font-size: 12px;
            margin: 0;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 5px 0;
        }
        th, td {
            padding: 4px;
            line-height: 1.2;
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .text-left { text-align: left; }
        .header {
            text-align: center;
            margin-bottom: 8px;
        }
        .innertext {
            font-size: 10px;
        }
        .row {
            display: flex;
            margin-bottom: 5px;
        }
        .col-xs-6 {
            width: 50%;
            padding: 0 2px;
        }
        .col-xs-12 {
            width: 100%;
            padding: 0 2px;
        }
        tr {
            page-break-inside: avoid;
            page-break-after: auto;
        }
    </style>
</head>
<body>
    <div class="print-format">
        <div class="row">
            <div class="col-xs-12" style="text-align:center">
                <p style="font-size: 16px;"><b>${offlineData.resturent_type || 'Neighborhood Cafe'}</b></p>
                <p>${offlineData.pos_profile || ''}</p>
                <p><b>Mob:</b>55664455</p>
            </div>
        </div>

        <div class="row">
            <div class="col-xs-6">
                <table>
                    <tbody>
                        <tr class="innertext">
                            <td style="font-size: 14px;"><b>PRE-INVOICE</b></td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div class="col-xs-6">
                <table>
                    <tbody>
                        <tr class="innertext">
                            <td></td>
                            <td style="font-size: 14px;" class="text-right"><b>فاتورة</b></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div class="row">
            <div class="col-xs-12">
                <p>Order #: ${offlineData.name || 'PRE-INVOICE'}</p>
            </div>
        </div>

        <div class="row" style="font-size: 10px;">
            <div class="col-xs-6">
                <table>
                    <tbody>
                        <tr class="innertext">
                            <td><b>Receipt #:</b></td>
                            <td>${offlineData.name || 'PRE-INVOICE'}</td>
                        </tr>
                        <tr class="innertext">
                            <td><b>Table:</b></td>
                            <td>${offlineData.table_no || ''}</td>
                        </tr>
                        <tr class="innertext">
                            <td><b>No of Pax:</b></td>
                            <td>${offlineData.cover || ''}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div class="inner-data col-xs-6">
                <table>
                    <tbody>
                        <tr class="innertext">
                            <td>${postingDate}</td>
                            <td><b>:تاريخ:</b></td>
                        </tr>
                        <tr class="innertext">
                            <td>${postingTime}</td>
                            <td><b>:الوقت</b></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div class="row">
            <div class="col-xs-12">
                <p class="text-center" style="font-size: 16px;"><b>${offlineData.resturent_type || 'Dine In'}</b></p>
            </div>
        </div>

        <table style="margin-top: 1px;" class="innertext">
            <thead>
                <tr style="border: 2px solid black;">
                    <th style="width: 50%;"><b>ITEM</b></th>
                    <th style="width: 10%;" class="text-center"><b>Qty</b></th>
                    <th style="width: 20%;" class="text-center"><b>Rate</b></th>
                    <th style="border: 2px solid black; width: 20%;" class="text-center"><b>Amount</b></th>
                </tr>
            </thead>
            <tbody>
                ${processedItems.map(cartItem => `
                    <tr style="border-bottom: 2px solid black;">
                        <td>${cartItem.item_name}</td>
                        <td class="text-center">${cartItem.qty}</td>
                        <td class="text-center">${(cartItem.rate || 0).toFixed(2)}</td>
                        <td class="text-center">${cartItem.parentAmount.toFixed(2)}</td>
                    </tr>
                    ${cartItem.bundle_groups?.map(group => `
                        <tr style="border-bottom: 1px solid #ccc;">
                            <td style="padding-left: 15px;">- ${group.item_names.join(', ')}</td>
                            <td class="text-center">-</td>
                            <td class="text-center">${group.totalRate.toFixed(2)}</td>
                            <td class="text-center">-</td>
                        </tr>
                    `).join('') || ''}
                `).join('')}
                
                <tr>
                    <td colspan="2" class="text-left"><b>Bill Amount</b></td>
                    <td colspan="2" class="text-right">${totalExclGST.toFixed(2)}</td>
                </tr>
                <tr>
                    <td colspan="2" class="text-left"><b>Total Discount</b></td>
                    <td colspan="2" class="text-right">0.00</td>
                </tr>
                <tr>
                    <td colspan="2" class="text-left"><b>Total</b></td>
                    <td colspan="2" class="text-right">${totalExclGST.toFixed(2)}</td>
                </tr>
                
            </tbody>
        </table>

        <p class="text-center">Thank you for Choosing Us</p>
        <p class="text-center" style="margin-top: -2px;">Prepared by: ${offlineData.total_qty || ''}</p>
        <p class="text-center" style="margin-top: -2px;"><b>Prepared by Tabrah Holding</b></p>
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
    } catch (error) {
        console.error("Error printing invoice:", error);
    }
}
