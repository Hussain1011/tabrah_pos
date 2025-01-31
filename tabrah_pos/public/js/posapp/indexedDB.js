const DB_NAME = 'OfflineDB';
const DB_VERSION = 1;
let db;

const indexedDBService = {
  openDatabase() {
    return new Promise((resolve, reject) => {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        // Create object stores if not exist
        if (!db.objectStoreNames.contains('items')) {
          db.createObjectStore('items', { keyPath: 'item_code' });
        }
        if (!db.objectStoreNames.contains('pos_profile')) {
          db.createObjectStore('pos_profile', { keyPath: 'name' });
        }
        if (!db.objectStoreNames.contains('pos_opening_shift')) {
          db.createObjectStore('pos_opening_shift', { keyPath: 'name' });
        }
        if (!db.objectStoreNames.contains("pos_settings")) {
          db.createObjectStore("pos_settings", { keyPath: "name" });
        }
        if (!db.objectStoreNames.contains("get_offers")) {
          db.createObjectStore("get_offers", { keyPath: "name" });
        }
        if (!db.objectStoreNames.contains("get_items_groups")) {
          db.createObjectStore("get_items_groups", { keyPath: "name" });
        }
        if (!db.objectStoreNames.contains("get_customer_names")) {
          db.createObjectStore("get_customer_names", { keyPath: "name" });
        }
        if (!db.objectStoreNames.contains("get_item_details")) {
          db.createObjectStore("get_item_details", { keyPath: "item_code" });
        }
        if (!db.objectStoreNames.contains("get_customer_info")) {
          db.createObjectStore("get_customer_info", { keyPath: "customer_name" });
        }
        if (!db.objectStoreNames.contains("get_table_names")) {
          db.createObjectStore("get_table_names", { keyPath: "name" });
        }
        if (!db.objectStoreNames.contains("get_order_type")) {
          db.createObjectStore("get_order_type", { keyPath: "name" });
        }
        if (!db.objectStoreNames.contains("update_invoice")) {
          db.createObjectStore("update_invoice", { keyPath: "doctype" });
        }
        if (!db.objectStoreNames.contains("create_invoice")) {
          const objectStore = db.createObjectStore("create_invoice", { keyPath: 'id', autoIncrement: true });
          objectStore.createIndex('synced', 'synced', { unique: false });
        }
      };

      request.onerror = (event) => {
        console.error('IndexedDB error:', event.target.errorCode);
        reject(event.target.errorCode);
      };

      request.onsuccess = (event) => {
        db = event.target.result;
        resolve(db);
      };
    });
  },

  /**
   * This function save the Items object in to indexedDB, on ItemsSelector.vue component creation.
   * This method is typically used in the ItemsSelector.vue component to store Items locally.
   * The function used for this process is get_items(), which retrieves Items.
   *
   * @param {Object} items - The items to be saved into IndexedDB. 
   *        This object is typically retrieved from a direct call to the database.
   * 
   * @returns {Promise<void>} A promise that resolves when the Items have been successfully saved.
   *          If the operation fails, the promise will be rejected with an error.
   * 
   */
  saveItems(items) {
    const transaction = db.transaction(['items'], 'readwrite');
    const store = transaction.objectStore('items');
    let storeItems= JSON.parse(items);
    storeItems.forEach((item) => {
      store.put(item);
    });

    transaction.oncomplete = () => {
      console.log('Items saved to IndexedDB');
    };

    transaction.onerror = (event) => {
      console.error('Error saving items:', event.target.errorCode);
    };
  },
    /*
    This function gets the items that are to be sold
  */
    getPosProfile() {
      const transaction = db.transaction(['pos_profile'], 'readonly');
      const store = transaction.objectStore('pos_profile');
      const request = store.getAll();
  
      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          resolve(request.result);
        };
  
        request.onerror = (event) => {
          console.error('Error getting POS:', event.target.errorCode);
          reject(event.target.errorCode);
        };
      });
    },
  

  /*
    This function gets the items that are to be sold
  */
  getItems() {
    const transaction = db.transaction(['items'], 'readonly');
    const store = transaction.objectStore('items');
    const request = store.getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = (event) => {
        console.error('Error getting items:', event.target.errorCode);
        reject(event.target.errorCode);
      };
    });
  },
    /*
    This function gets the items that are to be sold
  */
    getGroupItems() {
      const transaction = db.transaction(['get_items_groups'], 'readonly');
      const store = transaction.objectStore('get_items_groups');
      const request = store.getAll();
  
      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          resolve(request.result);
        };
  
        request.onerror = (event) => {
          console.error('Error getting items:', event.target.errorCode);
          reject(event.target.errorCode);
        };
      });
    },
    
  /**
   * This function save the POS_PROFILE object in to indexedDB, on POS.vue component creation.
   * This method is typically used in the POS.vue component to store POS Profile locally.
   * The function used for this process is async check_opening_entry(), which retrieves POS Profile.
   *
   * @param {Object} pos_profile - The POS profile to be saved into IndexedDB. 
   *        This object is typically retrieved from a direct call to the database.
   * 
   * @returns {Promise<void>} A promise that resolves when the POS Profile have been successfully saved.
   *          If the operation fails, the promise will be rejected with an error.
   * 
   */
  savePosItems(pos_profile) {
    const transaction = db.transaction(['pos_profile'], 'readwrite');
    const store = transaction.objectStore('pos_profile');
    let pos1 = JSON.parse(pos_profile);
    store.put(pos1);

    transaction.oncomplete = () => {
      console.log('POS Profile saved to IndexedDB');
    };

    transaction.onerror = (event) => {
      console.error('Error saving POS Profile:', event.target.errorCode);
    };
  },
  deleteAllPosProfiles() {
    const transaction = db.transaction(['pos_profile'], 'readwrite');
    const store = transaction.objectStore('pos_profile');

    const request = store.clear(); // Clear all records in the object store

    request.onsuccess = () => {
        console.log('All POS Profiles deleted from IndexedDB');
    };

    request.onerror = (event) => {
        console.error('Error deleting POS Profiles:', event.target.errorCode);
    };
},

  /**
   * This function save the POS_OPENING_SHIFT object in to indexedDB, on POS.vue component creation.
   * This method is typically used in the POS.vue component to store POS_OPENING_SHIFT locally.
   * The function used for this process is async check_opening_entry(), which retrieves POS_OPENING_SHIFT.
   *
   * @param {Object} pos_opening_shift - The POS_OPENING_SHIFT to be saved into IndexedDB. 
   *        This object is typically retrieved from a direct call to the database.
   * 
   * @returns {Promise<void>} A promise that resolves when the POS Profile have been successfully saved.
   *          If the operation fails, the promise will be rejected with an error.
   * 
   */
  savePosOpeningShift(pos_opening_shift) {
    const transaction = db.transaction(['pos_opening_shift'], 'readwrite');
    const store = transaction.objectStore('pos_opening_shift');
    let pos1 = JSON.parse(pos_opening_shift);
    store.put(pos1);

    transaction.oncomplete = () => {
      console.log('pos_opening_shift saved to IndexedDB');
    };

    transaction.onerror = (event) => {
      console.error('Error saving pos_opening_shift:', event.target.errorCode);
    };
  },
   /**
   * This function save the POS_SETTINGS object in to indexedDB, on POS.vue component creation.
   * This method is typically used in the POS.vue component to store POS_SETTINGS locally.
   * The function used for this process is get_pos_setting(), which retrieves POS_SETTINGS.
   *
   * @param {Object} data - The POS_SETTINGS to be saved into IndexedDB. 
   *        This object is typically retrieved from a direct call to the database.
   * 
   * @returns {Promise<void>} A promise that resolves when the POS Profile have been successfully saved.
   *          If the operation fails, the promise will be rejected with an error.
   * 
   */
  savePosSettings(data) {
    const transaction = db.transaction(['pos_settings'], 'readwrite');
    const store = transaction.objectStore('pos_settings');
    let pos1 = JSON.parse(data);
    store.put(pos1);

    transaction.oncomplete = () => {
      console.log('POS Settings saved to IndexedDB');
    };

    transaction.onerror = (event) => {
      console.error('Error saving POS Settings:', event.target.errorCode);
    };
  },
  /*
    This function save the POS offers details in indexedDB, on POS.vue
    component creation

    PARAMS: (Object: Response from lucrum_layers_pos.lucrum_layers_pos.api.posapp.get_offers API call)
    Returns: None
  */
  saveOffers(data) {
    const transaction = db.transaction(['get_offers'], 'readwrite');
    const store = transaction.objectStore('get_offers');
    let pos1 = JSON.parse(data);
    store.put(pos1);

    transaction.oncomplete = () => {
      console.log('POS Offers data saved to IndexedDB');
    };

    transaction.onerror = (event) => {
      console.error('Error saving POS Offers Data:', event.target.errorCode);
    };
  },

  /*
    This function save the items groups in indexedDB, on ItemSelector.vue
    component creation

    PARAMS: (Object: Response from lucrum_layers_pos.lucrum_layers_pos.api.posapp.get_items_groups API call)
    Returns: None
 */
    saveItemGroups(data) {
      try {
        const transaction = db.transaction(['get_items_groups'], 'readwrite');
        const store = transaction.objectStore('get_items_groups');
        
        // Convert data to a serializable format
        let storeItems= JSON.parse(data);
        storeItems.forEach((item) => {
          store.put(item);
        });
        // let pos1 = JSON.parse(data); 
        
        // store.put(pos1);
    
        transaction.oncomplete = () => {
          console.log('Items Groups data saved to IndexedDB');
        };
    
        transaction.onerror = (event) => {
          console.error('Error saving Items Group Data:', event.target.errorCode);
        };
      } catch (error) {
        console.error('Data serialization error:', error);
      }
    },


  /**
   * This function save the CUSTOMER_NAME object in to indexedDB, on POS.vue component creation.
   * This method is typically used in the Customer.vue component to store CUSTOMER_NAME locally.
   * The function used for this process is get_customer_names(), which retrieves ITEMS_DETAILS.
   *
   *@returns {Promise<void>} A promise that resolves when the CUSTOMER_NAME have been successfully saved.
   *          If the operation fails, the promise will be rejected with an error.
   * 
   */
  saveCustomerName(data) {
    const transaction = db.transaction(['get_customer_names'], 'readwrite');
    const store = transaction.objectStore('get_customer_names');
    let pos1 = JSON.parse(data);
    store.put(pos1[0]);

    transaction.oncomplete = () => {
      console.log('Customer name data saved to IndexedDB');
    };

    transaction.onerror = (event) => {
      console.error('Error saving customer Data:', event.target.errorCode);
    };
  },

  /**
   * This function save the ITEMS_DETAILS object in to indexedDB, on POS.vue component creation.
   * This method is typically used in the ItemSelector.vue component to store ITEMS_DETAILS locally.
   * The function used for this process is update_items_details(items), which retrieves ITEMS_DETAILS.
   *
   * @param {Object} items - The ITEMS_DETAILS to be saved into IndexedDB. 
   *        This object is typically retrieved from a direct call to the database.
   * 
   * @returns {Promise<void>} A promise that resolves when the ITEMS_DETAILS have been successfully saved.
   *          If the operation fails, the promise will be rejected with an error.
   * 
   */
  saveItemDetails(data) {
    const transaction = db.transaction(['get_item_details'], 'readwrite');
    const store = transaction.objectStore('get_item_details');
    let pos1 = JSON.parse(data);
    for (let value of pos1) {
      store.put(value);
    }


    transaction.oncomplete = () => {
      console.log('items details data saved to IndexedDB');
    };

    transaction.onerror = (event) => {
      console.error('Error saving items details Data:', event.target.errorCode);
    };
  },

  /**
   * This function save the CUSTOMER_INFROMATION object in to indexedDB, on POS.vue component creation.
   * This method is typically used in the Invoice.vue component to store CUSTOMER_INFROMATION locally.
   * The function used for this process is fetch_customer_details(), which retrieves CUSTOMER_INFROMATION.
   *
   * @param {Object} data - The CUSTOMER_INFROMATION to be saved into IndexedDB. 
   *        This object is typically retrieved from a direct call to the database.
   * 
   * @returns {Promise<void>} A promise that resolves when the CUSTOMER_INFROMATION have been successfully saved.
   *          If the operation fails, the promise will be rejected with an error.
   * 
   */
  saveCustomerInfo(data) {
    const transaction = db.transaction(['get_customer_info'], 'readwrite');
    const store = transaction.objectStore('get_customer_info');
    let pos1 = JSON.parse(data);
    store.put(pos1);

    transaction.oncomplete = () => {
      console.log('customr info data saved to IndexedDB');
    };

    transaction.onerror = (event) => {
      console.error('Error saving customer Data:', event.target.errorCode);
    };
  },

  /*
    This function save the table information in indexedDB, on ItemSelector.vue
    component creation

    PARAMS: (Object: Response from lucrum_layers_pos.lucrum_layers_pos.api.posapp.get_Table_names API call)
    Returns: None
  */
  saveTableInfo(data) {
    const transaction = db.transaction(['get_table_names'], 'readwrite');
    const store = transaction.objectStore('get_table_names');
    let pos1 = JSON.parse(data);
    store.put(pos1[0]);

    transaction.oncomplete = () => {
      console.log('customr info data saved to IndexedDB');
    };

    transaction.onerror = (event) => {
      console.error('Error saving customer Data:', event.target.errorCode);
    };
  },

  /*
    This function gets the table information stored in indexedDB.
  */
  getTableInfo(name) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        console.log("Dude you got problems");
      }
      const transaction = db.transaction(['get_table_names'], 'readonly');
      const store = transaction.objectStore('get_table_names');
      const request = store.get(name);


      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = (event) => {
        console.error('Error getting items:', event.target.errorCode);
        reject(event.target.errorCode);
      };
    });
  },

  /*
    This function save the order type information in indexedDB, on ItemSelector.vue
    component creation

    PARAMS: (Object: Response from lucrum_layers_pos.lucrum_layers_pos.api.posapp.get_Order_type API call)
    Returns: None
  */
  saveOrderType(data) {
    const transaction = db.transaction(['get_order_type'], 'readwrite');
    const store = transaction.objectStore('get_order_type');
    let pos1 = JSON.parse(data);
    store.put(pos1[0]);

    transaction.oncomplete = () => {
      console.log('Order Type data saved to IndexedDB');
    };

    transaction.onerror = (event) => {
      console.error('Error saving order type Data:', event.target.errorCode);
    };
  },
  /*
    This function save the order type information in indexedDB, on ItemSelector.vue
    component creation

    PARAMS: (Object: Response from lucrum_layers_pos.lucrum_layers_pos.api.posapp.get_Order_type API call)
    Returns: None
  */
  saveUpdateInvoice(data) {
    const transaction = db.transaction(['update_invoice'], 'readwrite');
    const store = transaction.objectStore('update_invoice');
    let pos1 = JSON.parse(data);
    store.put(pos1);

    transaction.oncomplete = () => {
      console.log('update invoice  data saved to IndexedDB');
    };

    transaction.onerror = (event) => {
      console.error('Error saving update invoice Data:', event.target.errorCode);
    };
  },
  /*
    This function save the sales Invoice in indexedDB, on Payments.vue
    component creation

    PARAMS: (Object: Payload for invoice)
    Returns: None
  */
  saveSalesInvoice(data, payment_mode) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['create_invoice'], 'readwrite');
      const store = transaction.objectStore('create_invoice');
      
      let pos1 = JSON.parse(data);
      console.log("Offline Sales inovice",pos1)
      pos1.synced = false;
      // pos1.mode_of_payment = payment_mode;
      // store.put(pos1);

  
      // Using put to add or update the record
      const request = store.put(pos1);
  
      request.onsuccess = (event) => {
        // The result will be the record ID (either newly created or updated)
        const recordId = event.target.result;
        console.log('Sales invoice data saved to IndexedDB, Record ID:', recordId);
        resolve(recordId); // Resolve the promise with the record ID
      };
  
      request.onerror = (event) => {
        console.error('Error saving sales invoice data:', event.target.errorCode);
        reject('Error saving sales invoice data: ' + event.target.errorCode); // Reject the promise with an error
      };
  
      transaction.oncomplete = () => {
        console.log('Offline Invoice Transaction completed successfully');
      };
  
      transaction.onerror = (event) => {
        console.error('Transaction error:', event.target.errorCode);
        reject('Transaction error: ' + event.target.errorCode); // Reject the promise in case of transaction error
      };
    });
  },
  /*
    This function gets the Updated Invoice Payload stored in indexedDB.
  */
  getUpdateInvoice(name) {
    return new Promise((resolve, reject) => {
      // if (!this.db) {
      //   console.log("Dude you got problems");
      // }
      const transaction = db.transaction(['update_invoice'], 'readonly');
      const store = transaction.objectStore('update_invoice');
      const request = store.get(name);


      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = (event) => {
        console.error('Error getting items:', event.target.errorCode);
        reject(event.target.errorCode);
      };
    });
  },

  /*
    This function gets the Updated Invoice Payload stored in indexedDB.
  */
  getCustomerInfo(name) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        console.log("Dude you got problems");
      }
      const transaction = db.transaction(['get_customer_info'], 'readonly');
      const store = transaction.objectStore('get_customer_info');
      const request = store.get(name);


      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = (event) => {
        console.error('Error getting items:', event.target.errorCode);
        reject(event.target.errorCode);
      };
    });
  },
  async updateSalesInvoice(id, updatedData) {
    try {
      const transaction = db.transaction(['create_invoice'], 'readwrite');
      const store = transaction.objectStore('create_invoice');
      
      // Retrieve the existing invoice record by its ID
      const invoiceRecord = await new Promise((resolve, reject) => {
        const getRequest = store.get(id);
  
        getRequest.onsuccess = (event) => {
          const record = event.target.result;
          if (record) {
            resolve(record);
          } else {
            reject('Invoice not found for the given ID: ' + id);
          }
        };
  
        getRequest.onerror = (event) => {
          reject('Error fetching the invoice record: ' + event.target.errorCode);
        };
      });
  
      // Update the existing record with the new data
      Object.assign(invoiceRecord, updatedData);
  
      // Save the updated record back to the IndexedDB
      await new Promise((resolve, reject) => {
        const updateRequest = store.put(invoiceRecord);
  
        updateRequest.onsuccess = () => {
          console.log('Sales invoice data updated successfully in IndexedDB, Record ID:', id);
          resolve();
        };
  
        updateRequest.onerror = (event) => {
          reject('Error updating sales invoice data: ' + event.target.errorCode);
        };
      });
  
      // Return the updated record ID after the successful transaction
      console.log('Transaction to update invoice completed successfully');
      return id;
      
    } catch (error) {
      console.error('Error updating invoice:', error);
      throw error; // Re-throw the error for further handling
    }
  }
  
};

export default indexedDBService;