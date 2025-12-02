import qz from 'qz-tray';

let isConnected = false;

export async function initQZTray() {
    if (isConnected) return true;
    
    try {
        await qz.websocket.connect();
        isConnected = true;
        console.log('Connected to QZ Tray');
        return true;
    } catch (err) {
        console.error('Failed to connect to QZ Tray:', err);
        return false;
    }
}

export async function disconnectQZTray() {
    if (!isConnected) return;
    
    try {
        await qz.websocket.disconnect();
        isConnected = false;
        console.log('Disconnected from QZ Tray');
    } catch (err) {
        console.error('Error disconnecting from QZ Tray:', err);
    }
}

export async function findPrinter(printerName) {
    try {
        const printers = await qz.printers.find();
        return printers.find(printer => printer.includes(printerName));
    } catch (err) {
        console.error('Error finding printer:', err);
        return null;
    }
}

export async function printKotWithQZTray(printerConfig, kotContent) {
    try {
        if (!isConnected) {
            const connected = await initQZTray();
            if (!connected) throw new Error('QZ Tray not connected');
        }

        // Create printer config
        const config = qz.configs.create({
            ...printerConfig,
            encoding: 'UTF-8',
            rasterize: false,
            altPrinting: false,
            copies: 1,
            margins: { top: 0, right: 0, bottom: 0, left: 0 }
        });

        // Format content for ESC/POS printing

        const content = formatKotForEscPos(kotContent);

        // Send print job
        await qz.print(config, content);
        return true;
    } catch (err) {
        console.error('Error printing with QZ Tray:', err);
        return false;
    }
}

export async function printPaymentWithQZTray(printerConfig, invoiceDoc, numberOfCopies = 1) {
    try {
        if (!isConnected) {
            const connected = await initQZTray();
            if (!connected) throw new Error('QZ Tray not connected');
        }

        // Create printer config
        const config = qz.configs.create({
            ...printerConfig,
            encoding: 'UTF-8',
            rasterize: false,
            altPrinting: false,
            copies: numberOfCopies,
            margins: { top: 0, right: 0, bottom: 0, left: 0 }
        });

        // Format content for ESC/POS printing
        const content = formatPaymentReceiptForEscPos(invoiceDoc);

        // Send print job
        await qz.print(config, content);
        return true;
    } catch (err) {
        console.error('Error printing payment receipt with QZ Tray:', err);
        return false;
    }
}

function formatKotForEscPos(kotData) {
    // ESC/POS Commands
    const ESC = '\x1B';
    const GS = '\x1D';
    const LF = '\x0A';
    const CENTER = ESC + 'a' + '\x01';
    const LEFT = ESC + 'a' + '\x00';
    const BOLD_ON = ESC + 'E' + '\x01';
    const BOLD_OFF = ESC + 'E' + '\x00';

    const COLS_NORMAL = 32; //58mm typical
    const COLS_BIG = 16; //2x width halves columns
    const SIZE_4X = GS + '!' + '\x33'; // 4x width, 4x height (if supported)
    const ESC_DOUBLE_WH = ESC + '!' + '\x38'; // ESC ! with double width & height
    const NORMAL = ESC + '!' + '\x00';
    const INIT = ESC + '@';
    const CUT = ESC + 'm';
    const FEED = ESC + 'd' + '\x03';
    const SIZE_NORMAL = GS + '!' + '\x00';
    const SIZE_TALL   = GS + '!' + '\x01';   // 2x height, normal width  (← “a bit big”)
    const SIZE_2X     = GS + '!' + '\x11';   // 2x width+height (keep for token if you want)

    const CUT_PARTIAL = GS + 'V' + '\x01';

    const isBigCompany = (kotData.company === "Neighborhood");

    // helper to wrap a line with size change (auto resets)
    const bigLine = (text) => [SIZE_2X, text + LF, SIZE_NORMAL];

    let commands = [];
    commands.push(INIT);

    // force standard mode + no left margin + no extra char spacing
    const STD_MODE          = ESC + 'S';
    const LEFT_MARGIN_ZERO  = GS + 'L' + '\x00' + '\x00';      // GS L nL nH
    const CHAR_SPACING_0    = ESC + ' ' + '\x00';              // ESC SP n
    const PRINT_AREA_FULL   = GS + 'W' + '\x80' + '\x01';      // 384 dots (58mm)


    // Removed device-specific width command which can affect centering
    // commands.push(ESC + 'C' + '\x24');

    // Token number for Run of the Mill - Centered, Very Large, and Bold
    if (kotData.company === "Run of the Mill" && kotData.custom_token_number) {
        commands.push(LF);             // spacing above
        commands.push(CENTER);         // ensure center alignment
        commands.push(BOLD_ON);        // bold
        commands.push(ESC_DOUBLE_WH);  // ESC-based double width & height for compatibility
        commands.push(SIZE_4X);        // GS-based 4x size (if supported)
        commands.push(String(kotData.custom_token_number) + LF);
        commands.push(SIZE_NORMAL);    // reset size
        commands.push(BOLD_OFF);       // bold off
        commands.push(LF);             // spacing below
        commands.push(LEFT);           // reset alignment
    }


    // Header
    commands.push(CENTER);
    commands.push(BOLD_ON);
    commands.push(SIZE_NORMAL); // Reset size for header
    if (kotData.company === "Run of the Mill") {
        commands.push('RUN OF THE MILL' + LF);
        commands.push(NORMAL);
        commands.push('KITCHEN ORDER TICKET' + LF + LF);
    } else {
        commands.push(BOLD_ON, 'KITCHEN ORDER TICKET' + LF + LF);
    }
    commands.push(BOLD_OFF, SIZE_NORMAL);

    // Order Info Section
    commands.push(LEFT);
    commands.push(BOLD_ON);
    commands.push('Server: ' + (kotData.server || 'N/A') + LF);
    commands.push('No of Pax: ' + (kotData.cover || 'N/A') + LF);
    commands.push('Order No: 12345' + LF);
    commands.push('Date: ' + kotData.date + LF);
    commands.push('Table: ' + (kotData.table_no || 'N/A') + LF);
    commands.push('Time: ' + kotData.time + LF);
    commands.push(BOLD_OFF);

    // Dine In Section
    commands.push(CENTER);
    commands.push(BOLD_ON);
    commands.push('--------------------------------' + LF);
    commands.push('Dine In' + LF);
    commands.push('--------------------------------' + LF);
    commands.push(BOLD_OFF);

    // New/Modified Section
    commands.push(LEFT);
    commands.push('New Order          Modified' + LF);
    commands.push('--------------------------------' + LF);

    // Items Header
    commands.push(BOLD_ON);
    commands.push('ITEM                           QTY' + LF);
    commands.push('--------------------------------' + LF);
    commands.push(BOLD_OFF);

    // Items
    kotData.items.forEach(item => {
        const name = item.item_name || 'N/A';
        const qty  = item.qty || 0;
      
        const isBigCompany = kotData.company === "Neighborhood";
      
        if (isBigCompany) {
          // Double-height only → width stays 32 cols, so we can keep QTY on the same line.
          const NAME_COLS = 28;              // leave space for 3-digit qty + 1 space
          const lines = wrapWords(name, NAME_COLS);
      
          commands.push(SIZE_TALL, BOLD_ON);
          lines.forEach((ln, idx) => {
            const last = idx === lines.length - 1;
            if (last) {
              const left  = padRight(ln, NAME_COLS);
              const right = padLeft(qty, 3);
              commands.push(left + ' ' + right + LF);
            } else {
              commands.push(ln + LF);
            }
          });
          commands.push(BOLD_OFF, SIZE_NORMAL);
        } else {
          // Normal size, single line: 30 + 2/3 cols for qty
          const nm = padRight(name, 30);
          const q  = padLeft(qty, 3);
          commands.push(nm + q + LF);
        }
      
        // Bundle items (normal size)
        if (item.product_bundle?.items?.length > 0) {
          item.product_bundle.items.forEach(bi => {
            const bn = padRight('  - ' + (bi.custom_item_name || 'N/A'), 30);
            commands.push(bn + '  1' + LF);
          });
        }
      
        // Note
        if (item.comment) commands.push('Note: ' + item.comment + LF);
      
        commands.push('--------------------------------' + LF);
      });
      

    // Footer
    commands.push(CENTER);
    commands.push(BOLD_ON);
    commands.push('*** END OF KOT ***' + LF + LF);
    commands.push(BOLD_OFF);

    // Feed and cut
    commands.push(FEED);
    commands.push(CUT);

    return commands;
}

const COLS_NORMAL = 32;     // 58mm typical
function wrapWords(str, width) {
  const words = String(str || '').split(/\s+/).filter(Boolean);
  const out = []; let line = '';
  for (const w of words) {
    const cand = line ? line + ' ' + w : w;
    if (cand.length <= width) line = cand;
    else { if (line) out.push(line); line = w; }
  }
  if (line) out.push(line);
  return out;
}
function padRight(s, w){ s=String(s); return s.length>=w? s.slice(0,w) : s+' '.repeat(w-s.length); }
function padLeft(s, w){ s=String(s); return s.length>=w? s.slice(-w) : ' '.repeat(w-s.length)+s; }

  
function formatPaymentReceiptForEscPos(doc) {
    // ESC/POS Commands
    const ESC = '\x1B';
    const LF = '\x0A';
    const CENTER = ESC + 'a' + '\x01';
    const LEFT = ESC + 'a' + '\x00';
    const RIGHT = ESC + 'a' + '\x02';
    const BOLD_ON = ESC + 'E' + '\x01';
    const BOLD_OFF = ESC + 'E' + '\x00';
    const DOUBLE_WIDTH = ESC + '!' + '\x30';
    const DOUBLE_HEIGHT = ESC + '!' + '\x10';
    const DOUBLE_WH = ESC + '!' + '\x38'; // Double width and height
    const NORMAL = ESC + '!' + '\x00';
    const INIT = ESC + '@';
    const CUT = ESC + 'm';
    const FEED = ESC + 'd' + '\x03';
    
    // Arabic character encoding
    const SET_ARABIC = ESC + 't' + '\x06'; // CP864 Arabic
    const SET_LATIN = ESC + 't' + '\x00';  // Default Latin

    let commands = [];
    commands.push(INIT);

    // Get company info - check multiple possible fields
    const company = doc.company || doc.pos_profile?.company || 'Neighborhood Cafe';
    const posProfile = doc.pos_profile?.name || doc.pos_profile || '';

    console.log('Company detected:', company); // Debug log

    // Token number for Run of the Mill - Large and Bold
    if (company === "Run of the Mill" && doc.custom_token_number) {
        commands.push(CENTER);
        commands.push(BOLD_ON);
        commands.push(DOUBLE_WH); // Double width and height
        commands.push(doc.custom_token_number + LF);
        commands.push(NORMAL);
        commands.push(BOLD_OFF);
        commands.push(LF);
    }

    // Header with company info - no separate logo section
    commands.push(CENTER);
    
    // Company specific headers (this replaces the logo)
    if (company === "Velo") {
        commands.push(BOLD_ON);
        commands.push('Velo' + LF);
        commands.push(BOLD_OFF);
        commands.push(posProfile + LF);
        commands.push('Mob: 4480 0204' + LF);
    } else if (company === "Run of the Mill") {
        commands.push(BOLD_ON);
        commands.push(DOUBLE_WIDTH);
        commands.push('Run of the Mill' + LF);
        commands.push(NORMAL);
        commands.push(BOLD_OFF);
        commands.push(posProfile + LF);
    } else if (company === "Neighborhood" || company === "Neighborhood Cafe" || company.includes("Neighborhood")) {
        commands.push(BOLD_ON);
        commands.push('Neighborhood Cafe' + LF);
        commands.push(BOLD_OFF);
        commands.push('Demo' + LF);
        commands.push('Mob: 55664455' + LF);
    } else {
        // Default case - try to show actual company name if available
        if (company && company !== 'Default Company') {
            commands.push(BOLD_ON);
            commands.push(company + LF);
            commands.push(BOLD_OFF);
        } else {
            commands.push(BOLD_ON);
            commands.push('Neighborhood Cafe' + LF);
            commands.push(BOLD_OFF);
            commands.push('Demo' + LF);
            commands.push('Mob: 55664455' + LF);
        }
    }
    
    commands.push(LF);

    // Invoice title - with proper Arabic encoding
    commands.push(LEFT);
    commands.push(BOLD_ON);
    commands.push('INVOICE             ');
    
    // Switch to Arabic encoding for Arabic text
    commands.push(SET_ARABIC);
    commands.push('فاتورة' + LF);
    commands.push(SET_LATIN); // Switch back to Latin
    commands.push(BOLD_OFF);
    commands.push(LF);

    // Order info
    commands.push('Order #: ' + doc.name + LF);
    commands.push(LF);

    // Receipt info section
    commands.push('Receipt #:' + LF);
    
    if (company === "Neighborhood" || company === "Neighborhood Cafe" || company.includes("Neighborhood")) {
        commands.push('Customer: Walk In' + LF);
        commands.push('Customer No.: ' + LF);
    } else {
        commands.push('Customer: ' + (doc.customer_name || 'Walk In') + LF);
        commands.push('Customer No.: ' + (doc.contact_mobile || '') + LF);
    }

    // Date and time - with proper Arabic encoding
    const postingDate = doc.posting_date || new Date().toISOString().split('T')[0];
    const postingTime = doc.posting_time || new Date().toLocaleTimeString();
    
    // Date with Arabic
    commands.push(postingDate.padEnd(20));
    commands.push(SET_ARABIC);
    commands.push(':تاريخ' + LF);
    commands.push(SET_LATIN);
    
    // Time with Arabic
    commands.push(postingTime.padEnd(20));
    commands.push(SET_ARABIC);
    commands.push(':الوقت' + LF);
    commands.push(SET_LATIN);
    commands.push(LF);

    // Items table header
    commands.push('================================' + LF);
    commands.push(BOLD_ON);
    commands.push('ITEM      QTY  RATE   AMOUNT' + LF);
    commands.push(BOLD_OFF);
    commands.push('================================' + LF);

    // Items
    if (doc.items && doc.items.length > 0) {
        doc.items.forEach(item => {
            let itemName = (item.item_name || '').substring(0, 10).padEnd(10);
            let qty = String(item.qty || 0).padStart(3);
            let rate = String(Math.round(item.rate || 0)).padStart(5);
            let amount = String(Math.round(item.amount || 0)).padStart(7);
            
            commands.push(itemName + qty + rate + amount + LF);
        });
    }

    commands.push('================================' + LF);

    // Totals section
    const formatMoney = (amount) => String(Math.round(amount || 0));
    
    commands.push('Bill Amount:'.padEnd(20) + formatMoney(doc.total).padStart(12) + LF);
    commands.push('Total Discount:'.padEnd(20) + formatMoney(doc.discount_amount).padStart(12) + LF);
    commands.push(BOLD_ON);
    commands.push('Total:'.padEnd(20) + formatMoney(doc.grand_total).padStart(12) + LF);
    commands.push(BOLD_OFF);
    commands.push('Paid Amount:'.padEnd(20) + formatMoney(doc.paid_amount).padStart(12) + LF);
    commands.push('Change Amount:'.padEnd(20) + formatMoney(doc.change_amount).padStart(12) + LF);
    commands.push('================================' + LF);

    // Payment modes
    if (doc.payments && doc.payments.length > 0) {
        doc.payments.forEach(payment => {
            commands.push(payment.mode_of_payment + ' ' + formatMoney(payment.amount) + LF);
        });
    }

    // Dashed line
    commands.push('--------------------------------' + LF);

    // Footer
    commands.push(CENTER);
    commands.push('Thank you for Choosing Us' + LF);
    commands.push('Prepared by: ' + (doc.owner || '') + LF);
    commands.push(LF);

    // Company policy
    if (company === "Velo") {
        commands.push('Velo Policy: 7 days for Exchange' + LF);
        commands.push('or Store Credit. NO REFUNDS.' + LF);
    } else if (company === "Run of the Mill") {
        commands.push('Run of the Mill Policy: Kindly' + LF);
        commands.push('review your items before leaving' + LF);
        commands.push('the premises.' + LF);
    } else {
        commands.push('Neighborhood Policy: We appreciate' + LF);
        commands.push('your visit. Follow us on social' + LF);
        commands.push('media @neighborhoodcafe' + LF);
    }

    commands.push(LF);
    commands.push(FEED);
    commands.push(CUT);

    return commands;
}

// Function to get logo commands based on company
function getLogoCommands(company) {
    let logoCommands = [];
    
    switch (company) {
        case "Velo":
            logoCommands = getVeloLogo();
            break;
        case "Run of the Mill":
            logoCommands = getRunOfTheMillLogo();
            break;
        case "Neighborhood":
        case "Neighborhood Cafe":
            logoCommands = getNeighborhoodLogo();
            break;
        default:
            logoCommands = getDefaultLogo();
            break;
    }
    
    return logoCommands;
}

// Velo logo
function getVeloLogo() {
    return [
        '\n',
        '  V E L O  \n',
        '═══════════\n',
        '\n'
    ];
}

// Run of the Mill logo
function getRunOfTheMillLogo() {
    return [
        '\n',
        ' RUN OF THE MILL \n',
        '═════════════════\n',
        '\n'
    ];
}

// Neighborhood Cafe logo
function getNeighborhoodLogo() {
    return [
        '\n',
        ' NEIGHBORHOOD \n',
        '    CAFE      \n',
        '══════════════\n',
        '\n'
    ];
}

// Default logo
function getDefaultLogo() {
    return [
        '\n',
        '*** RESTAURANT ***\n',
        '══════════════════\n',
        '\n'
    ];
}

// Convert image to ESC/POS bitmap (stub)
function convertImageToBitmap(imageData, width, height) {
    return [];
}

export async function handlePaymentNetworkPrinting(invoiceDoc, pos_profile) {
    try {
        if (!pos_profile.custom_enable_payment_network_prints) {
            return false;
        }

        const connected = await initQZTray();
        if (!connected) {
            console.error('QZ Tray not connected for payment printing.');
            return false;
        }

        const printSettings = pos_profile.custom_payment_prints_setting || [];
        
        if (printSettings.length === 0) {
            console.error('No payment print settings configured.');
            return false;
        }

        for (const setting of printSettings) {
            const printerConfig = {
                name: setting.print_name || `${setting.print_ip}:${setting.print_port}`,
                host: setting.print_ip,
                port: setting.print_port
            };

            const numberOfCopies = setting.number_of_prints || 1;

            const success = await printPaymentWithQZTray(printerConfig, invoiceDoc, numberOfCopies);
            if (!success) {
                console.error(`Failed to print payment receipt to ${printerConfig.name}`);
            }
        }

        return true;
    } catch (error) {
        console.error("Error in payment network printing:", error);
        return false;
    }
}

export async function getPrinterConfigByItemGroup(pos_profile, item_group) {
    try {
        const settings = pos_profile.custom_kot_network_settings || [];
        const printerSetting = settings.find(s => s.item_group === item_group);
        
        if (!printerSetting) return null;

        return {
            name: printerSetting.printer_name || `${printerSetting.printer_ip}:${printerSetting.printer_port}`,
            host: printerSetting.printer_ip,
            port: printerSetting.printer_port
        };
    } catch (err) {
        console.error('Error getting printer config:', err);
        return null;
    }
}

export function groupItemsByPrinter(items, pos_profile) {
    const printerGroups = {};
    
    items.forEach(item => {
        const itemGroup = item.item_group;
        const printerSetting = pos_profile.custom_kot_network_settings?.find(
            s => s.item_group === itemGroup
        );
        
        if (printerSetting) {
            const printerKey = printerSetting.printer_name || 
                             `${printerSetting.printer_ip}:${printerSetting.printer_port}`;
            
            if (!printerGroups[printerKey]) {
                printerGroups[printerKey] = {
                    config: {
                        name: printerSetting.printer_name,
                        host: printerSetting.printer_ip,
                        port: printerSetting.printer_port
                    },
                    items: []
                };
            }
            
            printerGroups[printerKey].items.push(item);
        }
    });
    
    return printerGroups;
}

// Test function for Arabic printing and token formatting
export function testArabicPrint() {
    const testDoc = {
        company: "Neighborhood Cafe",
        custom_token_number: "12",
        name: "TEST-INVOICE-001",
        customer_name: "Test Customer",
        contact_mobile: "1234567890",
        posting_date: "2025-01-09",
        posting_time: "14:30:00",
        items: [
            {
                item_name: "Test Item",
                qty: 1,
                rate: 100,
                amount: 100
            }
        ],
        total: 100,
        discount_amount: 0,
        grand_total: 100,
        paid_amount: 100,
        change_amount: 0,
        payments: [
            {
                mode_of_payment: "Cash",
                amount: 100
            }
        ],
        owner: "Test User"
    };
    
    console.log("Testing Arabic print format...");
    const commands = formatPaymentReceiptForEscPos(testDoc);
    console.log("Generated commands:", commands);
    return commands;
}

// Make test function globally available
if (typeof window !== 'undefined') {
    window.testArabicPrint = testArabicPrint;
}

// Debug function to check company information
export function debugCompanyInfo(doc) {
    console.log('=== Company Debug Info ===');
    console.log('doc.company:', doc.company);
    console.log('doc.pos_profile:', doc.pos_profile);
    console.log('doc.pos_profile?.company:', doc.pos_profile?.company);
    console.log('doc.pos_profile?.name:', doc.pos_profile?.name);
    
    const detectedCompany = doc.company || doc.pos_profile?.company || 'Neighborhood Cafe';
    console.log('Final detected company:', detectedCompany);
    
    // Test which condition will be matched
    if (detectedCompany === "Velo") {
        console.log('Will match: Velo');
    } else if (detectedCompany === "Run of the Mill") {
        console.log('Will match: Run of the Mill');
    } else if (detectedCompany === "Neighborhood" || detectedCompany === "Neighborhood Cafe" || detectedCompany.includes("Neighborhood")) {
        console.log('Will match: Neighborhood');
    } else {
        console.log('Will match: Default case');
    }
    
    return detectedCompany;
}

// Make debug function globally available
if (typeof window !== 'undefined') {
    window.debugCompanyInfo = debugCompanyInfo;
}

// Test token number generation
export function testTokenNumber() {
    console.log('Testing token number generation...');
    
    frappe.call({
        method: "tabrah_pos.tabrah_pos.api.posapp.get_next_token_number",
        args: {
            company: "Run of the Mill",
            pos_profile: "Test Profile"
        },
        callback: function(response) {
            if (response.message) {
                console.log('Next token number:', response.message);
            } else {
                console.log('No token number returned (company not Run of the Mill or error)');
            }
        },
        error: function(error) {
            console.error('Error getting token number:', error);
        }
    });
}

// Make test function globally available
if (typeof window !== 'undefined') {
    window.testTokenNumber = testTokenNumber;
}