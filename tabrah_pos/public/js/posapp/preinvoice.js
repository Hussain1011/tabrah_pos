

// Method to open a new window and print the invoice
export async function printPreInvoice(offlineData) {
    try {
   
      let now = new Date();
      const items = offlineData?.items || [];
  
        // Dynamically generate table rows for the items
        const itemRows = items
        .map(item => {
          const { item_name, qty, rate, discount = 0, amount } = item;
          return `
            <tr>
                <td>${item_name || "N/A"}</td>
                <td class="text-center">${qty || 0}</td>
                <td class="text-center">${rate || 0}</td>
                <td class="text-center">${discount || 0}</td>
                <td class="text-center">${qty*rate || 0}</td>
            </tr>
          `;
        })
        .join("");
  
  
      // Create a new window
      const newWindow = window.open("", "_blank");
      
  
      // Set the HTML content of the new window
      newWindow.document.write(`
  <html>
  <head>
      <title>Pre-Invoice</title>
      <style>
          .print-format table, .print-format tr, .print-format td, .print-format div, .print-format p {
              line-height: 100%;
              vertical-align: middle;
          }
          @media screen {
              .print-format {
                  width: 4in;
                  padding: 0.25in;
                  min-height: 8in;
              }
          }
          .print-format td, .print-format th {
              padding: 5px !important;
          }
          table {
              width: 100%;
              border-collapse: collapse;
          }
          th, td {
              border: 2px solid black;
              padding: 5px;
              text-align: left;
          }
          .text-center {
              text-align: center;
          }
          .text-right {
              text-align: right;
          }
      </style>
  </head>
  <body>
        <div style="display: flex; justify-content: center;">
  </div>
  
  <div style="text-align: center; font-weight: bold;">Neighborhood Cafe</div>
  <div style="text-align: center;">
        <br>
      Mov#: 055664455 
  </div>
  
      <table>
                <thead>
                    <tr style="background-color: #e0e0e0;">
                        <th>Item</th>
                        <th class="text-center">Qty</th>
                        <th class="text-center">Rate</th>
                        <th class="text-center">Disc</th>
                        <th class="text-center">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemRows}
                    <tr>
                        <td colspan="4"><b>Bill Excluding GST (Rs.)</b></td>
                        <td class="text-right">${offlineData.total.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td colspan="4"><b>SALES TAX @ 16%</b></td>
                        <td class="text-right">${offlineData.gstAmountCash.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td colspan="4"><b>Total Bill Including 16% GST Rs.</b></td>
                        <td class="text-right">${offlineData.grand_total.toFixed(2)}</td>
                    </tr>
                </tbody>
            </table>
      </table>
  
      <p class="text-center" style="margin-top: 0px;"><b>Thank you for Choosing Us!</b></p>
      <hr>
      <p class="text-center" style="margin-top: -10px;">Prepared by Neighborhood Cafe</p>
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
      });  } catch (error) {
      console.error("Error printing invoice:", error);
    }
  }