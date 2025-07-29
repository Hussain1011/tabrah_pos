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