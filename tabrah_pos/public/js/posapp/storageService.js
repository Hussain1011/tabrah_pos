const STORAGE_PREFIX = 'tabrah_pos_';

function getStore(key) {
  try {
    const data = localStorage.getItem(STORAGE_PREFIX + key);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error('Error reading from localStorage:', e);
    return null;
  }
}

function setStore(key, value) {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.error('Error writing to localStorage:', e);
  }
}

function removeStore(key) {
  localStorage.removeItem(STORAGE_PREFIX + key);
}

const storageService = {
  openDatabase() {
    return Promise.resolve(true);
  },

  saveItems(items) {
    const storeItems = JSON.parse(items);
    setStore('items', storeItems);
    console.log('Items saved to localStorage');
  },

  getItems() {
    return Promise.resolve(getStore('items') || []);
  },

  getPosProfile() {
    const data = getStore('pos_profile');
    return Promise.resolve(data ? [data] : []);
  },

  getGroupItems() {
    return Promise.resolve(getStore('items_groups') || []);
  },

  savePosItems(pos_profile) {
    const pos1 = JSON.parse(pos_profile);
    setStore('pos_profile', pos1);
    console.log('POS Profile saved to localStorage');
  },

  deleteAllPosProfiles() {
    removeStore('pos_profile');
    console.log('All POS Profiles deleted from localStorage');
  },

  savePosOpeningShift(pos_opening_shift) {
    const pos1 = JSON.parse(pos_opening_shift);
    setStore('pos_opening_shift', pos1);
    console.log('pos_opening_shift saved to localStorage');
  },

  savePosSettings(data) {
    const pos1 = JSON.parse(data);
    setStore('pos_settings', pos1);
    console.log('POS Settings saved to localStorage');
  },

  saveOffers(data) {
    const pos1 = JSON.parse(data);
    setStore('offers', pos1);
    console.log('POS Offers saved to localStorage');
  },

  saveItemGroups(data) {
    try {
      const storeItems = JSON.parse(data);
      setStore('items_groups', storeItems);
      console.log('Items Groups saved to localStorage');
    } catch (error) {
      console.error('Data serialization error:', error);
    }
  },

  saveCustomerName(data) {
    const pos1 = JSON.parse(data);
    setStore('customer_names', pos1[0]);
    console.log('Customer name saved to localStorage');
  },

  saveItemDetails(data) {
    const pos1 = JSON.parse(data);
    setStore('item_details', pos1);
    console.log('Item details saved to localStorage');
  },

  saveCustomerInfo(data) {
    const pos1 = JSON.parse(data);
    setStore('customer_info', pos1);
    console.log('Customer info saved to localStorage');
  },

  saveTableInfo(data) {
    const pos1 = JSON.parse(data);
    setStore('table_names', pos1[0]);
    console.log('Table info saved to localStorage');
  },

  getTableInfo(name) {
    const data = getStore('table_names');
    return Promise.resolve(data || null);
  },

  saveOrderType(data) {
    const pos1 = JSON.parse(data);
    setStore('order_type', pos1[0]);
    console.log('Order Type saved to localStorage');
  },

  saveUpdateInvoice(data) {
    const pos1 = JSON.parse(data);
    setStore('update_invoice', pos1);
    console.log('Update invoice saved to localStorage');
  },

  getUpdateInvoice(name) {
    const data = getStore('update_invoice');
    return Promise.resolve(data || null);
  },

  getCustomerInfo(name) {
    const data = getStore('customer_info');
    return Promise.resolve(data || null);
  },

  saveSalesInvoice(data) {
    return new Promise((resolve) => {
      const pos1 = JSON.parse(data);
      pos1.synced = false;

      const invoices = getStore('create_invoices') || [];
      const nextId = invoices.length > 0 ? Math.max(...invoices.map(i => i.id || 0)) + 1 : 1;
      pos1.id = nextId;
      invoices.push(pos1);
      setStore('create_invoices', invoices);
      console.log('Sales invoice saved to localStorage, Record ID:', nextId);
      resolve(nextId);
    });
  },

  getUnsyncedInvoices() {
    const invoices = getStore('create_invoices') || [];
    return invoices.filter(inv => inv.synced === false);
  },

  async updateSalesInvoice(id, updatedData) {
    const invoices = getStore('create_invoices') || [];
    const index = invoices.findIndex(inv => inv.id === id);
    if (index === -1) {
      throw new Error('Invoice not found for the given ID: ' + id);
    }
    Object.assign(invoices[index], updatedData);
    setStore('create_invoices', invoices);
    console.log('Sales invoice updated in localStorage, Record ID:', id);
    return id;
  },

  clearCreateInvoice() {
    removeStore('create_invoices');
    console.log('All invoices cleared from localStorage');
  },
};

export default storageService;
