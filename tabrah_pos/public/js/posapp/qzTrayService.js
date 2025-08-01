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
    const LF = '\x0A';
    const CENTER = ESC + 'a' + '\x01';  // Center alignment
    const LEFT = ESC + 'a' + '\x00';    // Left alignment
    const BOLD_ON = ESC + 'E' + '\x01';
    const BOLD_OFF = ESC + 'E' + '\x00';
    const DOUBLE_WIDTH = ESC + '!' + '\x30'; // Double width + bold
    const NORMAL = ESC + '!' + '\x00';   // Normal text
    const INIT = ESC + '@';              // Initialize printer
    const CUT = ESC + 'm';               // Partial cut
    const FEED = ESC + 'd' + '\x03';     // Feed 3 lines

    let commands = [];
    commands.push(INIT);

    // Set print width (may need adjustment based on your printer)
    commands.push(ESC + 'C' + '\x24');  // 36 characters per line

    // Header
    commands.push(CENTER);
    commands.push(DOUBLE_WIDTH);
    commands.push('KITCHEN ORDER TICKET' + LF + LF);
    commands.push(NORMAL);

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
        // Main item
        let itemName = item.item_name || 'N/A';
        let qty = item.qty || 0;
        
        // Pad item name and quantity to align properly
        itemName = itemName.padEnd(30).substring(0, 30);
        let qtyStr = String(qty).padStart(3);
        
        commands.push(itemName + qtyStr + LF);

        // Bundle items (if any)
        if (item.product_bundle?.items?.length > 0) {
            item.product_bundle.items.forEach(bundleItem => {
                let bundleName = '  - ' + (bundleItem.custom_item_name || 'N/A');
                bundleName = bundleName.padEnd(30).substring(0, 30);
                commands.push(bundleName + '  1' + LF);
            });
        }

        // Item comment/note (if any)
        if (item.comment) {
            commands.push('Note: ' + item.comment + LF);
        }

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
    const NORMAL = ESC + '!' + '\x00';
    const INIT = ESC + '@';
    const CUT = ESC + 'm';
    const FEED = ESC + 'd' + '\x03';
    const DASHED_LINE = ESC + 'C' + '\x01';

    let commands = [];
    commands.push(INIT);

    // Get company info
    const company = doc.company || 'Default Company';
    const posProfile = doc.pos_profile || '';

    // Token number for Run of the Mill
    if (company === "Run of the Mill" && doc.custom_token_number) {
        commands.push(CENTER);
        commands.push(DOUBLE_WIDTH);
        commands.push(BOLD_ON);
        commands.push(doc.custom_token_number + LF + LF);
        commands.push(NORMAL);
        commands.push(BOLD_OFF);
    }

    // Header with company logo and info
    commands.push(CENTER);
    
    // Add logo based on company
    const logoCommands = getLogoCommands(company);
    commands.push(...logoCommands);
    
    if (company === "Velo") {
        commands.push(BOLD_ON);
        commands.push('Velo' + LF);
        commands.push(BOLD_OFF);
        commands.push(posProfile + LF);
        commands.push('Mob: 4480 0204' + LF);
    } else if (company === "Run of the Mill") {
        commands.push(BOLD_ON);
        commands.push('Run of the Mill' + LF);
        commands.push(BOLD_OFF);
        commands.push(posProfile + LF);
    } else {
        commands.push(BOLD_ON);
        commands.push('Neighborhood Cafe' + LF);
        commands.push(BOLD_OFF);
        commands.push(posProfile + LF);
        commands.push('Mob: 55664455' + LF);
    }

    commands.push(LF);

    // Invoice title
    commands.push(LEFT);
    commands.push(BOLD_ON);
    commands.push('INVOICE'.padEnd(20) + 'فاتورة' + LF);
    commands.push(BOLD_OFF);
    commands.push(LF);

    // Order info
    commands.push('Order #: ' + doc.name + LF);
    commands.push(LF);

    // Receipt info section
    commands.push('Receipt #:' + LF);
    
    if (company === "Neighborhood") {
        commands.push('Table:' + LF);
        commands.push('No of Pax:' + LF);
    } else {
        commands.push('Customer: ' + (doc.customer_name || '') + LF);
        commands.push('Customer No.: ' + (doc.contact_mobile || '') + LF);
    }

    // Date and time
    const postingDate = doc.posting_date || new Date().toISOString().split('T')[0];
    const postingTime = doc.posting_time || new Date().toLocaleTimeString();
    
    commands.push(postingDate.padEnd(20) + ':تاريخ' + LF);
    commands.push(postingTime.padEnd(20) + ':الوقت' + LF);
    commands.push(LF);

    // Dine In section for Neighborhood
    if (company === "Neighborhood") {
        commands.push(CENTER);
        commands.push(BOLD_ON);
        commands.push('Dine In' + LF);
        commands.push(BOLD_OFF);
        commands.push(LF);
    }

    // Items table header
    commands.push(LEFT);
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

    // Custom discount offer
    if (doc.custom_discount_offer && doc.discount_amount) {
        commands.push(doc.custom_discount_offer + ' - ' + formatMoney(doc.discount_amount) + LF);
    }

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
    commands.push('Prepared by: ' + (doc.total_qty || '') + LF);
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

    // Feed and cut
    commands.push(FEED);
    commands.push(CUT);

    return commands;
}

// Function to get logo commands based on company
function getLogoCommands(company) {
    const ESC = '\x1B';
    const GS = '\x1D';
    const LF = '\x0A';
    
    // ESC/POS Image printing commands
    // GS v 0 - Print raster bit image
    // ESC * - Print bit image
    
    let logoCommands = [];
    
    switch (company) {
        case "Velo":
            // Velo logo commands
            logoCommands = getVeloLogo();
            break;
        case "Run of the Mill":
            // Run of the Mill logo commands
            logoCommands = getRunOfTheMillLogo();
            break;
        case "Neighborhood":
        case "Neighborhood Cafe":
            // Neighborhood Cafe logo commands
            logoCommands = getNeighborhoodLogo();
            break;
        default:
            // Default/fallback logo
            logoCommands = getDefaultLogo();
            break;
    }
    
    return logoCommands;
}

// Velo logo bitmap data
function getVeloLogo() {
    const ESC = '\x1B';
    const GS = '\x1D';
    const LF = '\x0A';
    
    // Simple text-based logo for Velo (you can replace with actual bitmap)
    return [
        ESC + 'a' + '\x01', // Center align
        ESC + '!' + '\x30', // Double width
        'V E L O' + LF,
        ESC + '!' + '\x00', // Normal width
        '════════════════════' + LF,
        LF
    ];
}

// Run of the Mill logo bitmap data
function getRunOfTheMillLogo() {
    const ESC = '\x1B';
    const GS = '\x1D';
    const LF = '\x0A';
    
    return [
        ESC + 'a' + '\x01', // Center align
        ESC + '!' + '\x20', // Double height
        'RUN OF THE MILL' + LF,
        ESC + '!' + '\x00', // Normal
        '════════════════════' + LF,
        LF
    ];
}

// Neighborhood Cafe logo bitmap data
function getNeighborhoodLogo() {
    const ESC = '\x1B';
    const GS = '\x1D';
    const LF = '\x0A';
    
    return [
        ESC + 'a' + '\x01', // Center align
        ESC + '!' + '\x30', // Double width
        'NEIGHBORHOOD' + LF,
        ESC + '!' + '\x10', // Double height
        'CAFE' + LF,
        ESC + '!' + '\x00', // Normal
        '════════════════════' + LF,
        LF
    ];
}

// Default logo
function getDefaultLogo() {
    const ESC = '\x1B';
    const LF = '\x0A';
    
    return [
        ESC + 'a' + '\x01', // Center align
        '*** RESTAURANT ***' + LF,
        '════════════════════' + LF,
        LF
    ];
}

// Function to convert image to ESC/POS bitmap (for future use with actual images)
function convertImageToBitmap(imageData, width, height) {
    // This function would convert actual image data to ESC/POS bitmap format
    // For now, returning placeholder
    const ESC = '\x1B';
    const GS = '\x1D';
    
    // ESC/POS bitmap command structure:
    // GS v 0 m xL xH yL yH d1...dk
    // where m = mode, xL xH = width, yL yH = height, d1...dk = image data
    
    return [
        GS + 'v' + '0', // Raster bit image
        // Width and height bytes would go here
        // Followed by actual bitmap data
    ];
}

export async function handlePaymentNetworkPrinting(invoiceDoc, pos_profile) {
    try {
        if (!pos_profile.custom_enable_payment_network_prints) {
            return false; // Network printing not enabled
        }

        // Initialize QZ Tray
        const connected = await initQZTray();
        if (!connected) {
            console.error('QZ Tray not connected for payment printing.');
            return false;
        }

        // Get payment print settings
        const printSettings = pos_profile.custom_payment_prints_setting || [];
        
        if (printSettings.length === 0) {
            console.error('No payment print settings configured.');
            return false;
        }

        // Print to each configured printer
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