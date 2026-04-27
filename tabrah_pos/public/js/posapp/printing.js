// Store the document and user data globally or within a specific scope
let doc = null;
let usr = null;
let pos_profile = null;
let pos_setting = null;
let pos_opening_shift = null;

// Method to open a new window and print the invoice
export async function printInvoice(invoiceId, offline_paid_amount, offline_paid_change,offlineData) {
  try {
    console.log("invoiceId",invoiceId)
    console.log("offline_paid_amount",offline_paid_amount)
    console.log("offline-print doc data.....",doc)

    let now = new Date();


    // Create a new window
    const newWindow = window.open("", "_blank");

    // Set the HTML content of the new window
    newWindow.document.write(`
    <html>
    <head>
        <style>
            body {
                font-family: Arial, sans-serif;
                font-size: 14px;
                margin: 0;
                padding: 0;
                color: #000;
            }

            .invoice-container {
                width: 100%;
                max-width: 900px;
                margin: 0 auto;
                padding: 20px;
                border: 1px solid #ddd;
            }

            .header {
                text-align: center;
                margin-bottom: 20px;
            }

            .header img {
                max-width: 160px;
                max-height: 140px;
            }

            .invoice-details {
                width: 100%;
                margin-bottom: 20px;
                font-size: 10px;
            }

            .invoice-details table {
                width: 100%;
                border-collapse: collapse;
            }

            .invoice-details td {
                padding: 8px;
                vertical-align: top;
            }

            .invoice-details .label {
                font-weight: bold;
                width: 30%;
            }

            .invoice-details .value {
                width: 70%;
            }

            .items-table {
                width: 90%;
                border-collapse: collapse;
                margin: 10px auto;
            }

            .items-table th, .items-table td {
                border: 1px solid #000;
                padding: 10px; 
                text-align: center;
            }

            .items-table th {
                background-color: #99a0a829;
                font-weight: bold;
            }

            .footer {
                margin-top: 20px;
                text-align: center;
                font-size: 12px;
            }

            .footer p {
                margin: 5px 0;
            }

            /* Print styles */
            @media print {
                body {
                    margin: 0;
                    padding: 0;
                    font-size: 12px; 
                }

                .invoice-container {
                    border: none; 
                    width: 100%; 
                }

                .items-table th, .items-table td {
                    border: 3px solid #000 !important;
                    line-height: 100%; 
                }

                button {
                    display: none; 
                }
                @page {
                    size: A4 portrait;
                    margin: 20mm;
                }
            }
        </style>
    </head>
    <body>

       <div style="line-height: 1.5; text-align: center;">
    <div style="text-align: center;">
            <img src="https://cdn.shopify.com/s/files/1/0290/8123/9612/files/LOGO_packinng.jpg?height=628&pad_color=ffffff&v=1614755406&width=1200" alt="Random Image"/>
        <p style="margin: 0; font-size: 16px; font-weight: bold;">Tabrah POS</p>
        <div style="width: 28%; margin: 10px auto;">
        </div>
    </div>
    <div style="width: 55%; margin: 0 auto; text-align: left; line-height: 1.5;">
        <table style="width: 100%; font-size:12px; line-height: 0.7;">
            ${offlineData.items.map((item, index) => `
               <tr>
                    <td colspan="2" style="width: 75%; font-weight: bold;">${item.item_name}</td>
                    <td style="width: 25%; text-align: right;"></td>
                </tr>
                <tr>
                    <td>${item.qty}Piece x ${item.rate.toFixed(2)} Rs.</td>
                    <td></td>
                    <td style="text-align: right;">${item.qty*item.rate.toFixed(2)} Rs</td>
                </tr>
                `).join("")}

        </table>
        <div style="padding-left:10px; padding-right:10px" > 
        <div style="display: flex;flex-direction: row; justify-content: space-between;">
            <p>Subtotal</p>
            <p>${offlineData.total.toFixed(2)} Rs</p>
        </div>  
        <div style="display: flex;flex-direction: row; justify-content: space-between;">
            <p>Sale Tax</p>
            <p style="text-decoration: underline; text-decoration-style: dotted;">${offlineData.total_taxes_and_charges} Rs</p>
        </div>
        
        <h3 style="text-align: right;" >Total &nbsp; &nbsp; &nbsp; &nbsp;  ${offlineData.grand_total} RS</h3>
  
            <!-- Dynamic Payment Modes -->
                ${offlineData.payments.filter(payment => payment.amount > 0).map(payment => `
                    <div style="display: flex; flex-direction: row; justify-content: space-between;">
                        <p>${payment.mode_of_payment}</p>
                        <p>${Number(payment.amount).toFixed(2)} Rs</p>
                    </div>
                `).join("")} 
        </div>
        </div>
        <p style="margin-top:30px;" >Thank you for your visit!
        <br>Prepared by Tabrah POS
        </p>

</div>

    </body>
    </html>

    `);

    // Close the document to trigger rendering in the new window
    newWindow.document.close();
    newWindow.focus();
    newWindow.print();
  } catch (error) {
    console.error("Error printing invoice:", error);
  }
}