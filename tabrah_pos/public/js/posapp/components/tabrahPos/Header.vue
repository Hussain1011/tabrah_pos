<template>
  <div class="pos-header-bar">
    <div class="d-flex align-center" style="padding: 8px 0; gap: 8px; flex-wrap: wrap;">
      <!-- Order Type -->
      <v-select v-model="selectedOrderType" :items="orderTypes" label="Order Type" 
        class="order-type-select" density="compact" variant="outlined" item-title="order_type" 
        :disabled="currentScreen !== 0" hide-details
        style="max-width: 160px; flex-shrink: 0;" />

      <!-- Order By -->
      <v-select v-model="orderBy" :items="employeesList" label="Order By" 
        class="order-type-select" density="compact" variant="outlined" 
        item-title="employee_name" item-value="employee" hide-details
        style="max-width: 160px; flex-shrink: 0;" />

      <!-- Table Select -->
      <v-select v-if="pos_profile.allow_table_no" v-model="selectedTable" :items="tableOptions" 
        label="Table" class="order-type-select" density="compact" variant="outlined" 
        item-title="table_no" item-value="table_no" hide-details
        style="max-width: 140px; flex-shrink: 0;" />

      <v-spacer></v-spacer>

      <!-- Search -->
      <v-text-field variant="outlined" append-inner-icon="mdi-magnify" placeholder="Find your item"
        density="compact" v-model="searchItem" clearable hide-details
        style="max-width: 280px; flex-shrink: 0;" />
    </div>
  </div>
</template>

<script setup>
import eventBus from "../../bus";
import { ref, onMounted, watch, onBeforeUnmount } from "vue";
import storageService from "../../storageService";

const searchValue = ref("");
const pos_profile = ref("");
const selectedOrderType = ref("");
const currentScreen = ref(null);
const searchField = ref(null); // Ref to access the text field component
const searchItem = ref("");

const orderTypes = ref([]);
const tableOptions = ref([]);
const selectedTable = ref("");
const employeesList = ref([]);
const orderBy = ref("");
const logOut = () => {
  eventBus.emit("logout-pos");
};

const debounce = (func, delay) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func(...args);
    }, 500);
  };
};

const emitSearchEvent = debounce((value) => {
  eventBus.emit("search-item", value); // Emit the search event when typing stops
}, 500); // 500ms delay (you can change the delay as needed)
const go_desk = () => {
  frappe.set_route("/");
  location.reload();
};
const changeOrderType = (newValue) => {
  eventBus.emit("update_get_item", newValue);
  let orderRequired =
    orderTypes.value.find((orderType) => orderType.order_type == newValue) ||
    "";
  if (orderRequired.order_required) {
    eventBus.emit("required-order-id", true);
  } else {
    eventBus.emit("required-order-id", false);
  }
};
// Fetch order types
const fetchTableOptions = async () => {
  try {
    const response = await frappe.call({
      method: "tabrah_pos.tabrah_pos.api.posapp.get_Table_names",
      args: {
        pos_profile: pos_profile.value,
      },
    });

    // tableOptions.value = response.message;
    tableOptions.value = response.message.filter((t) => t.status !== 'Reserved');


  } catch (error) {
    console.error("Error fetching order types:", error);
  }
};
const emitSearchItemEvent = debounce((value) => {
  eventBus.emit("search-item-by-code", value);
}, 500);

const offlineProfileData = async () => {
  try {
    const data = await storageService.getPosProfile();

    console.log("offline pos profile from localStorage ..", data);

    if (data && data.length > 0) {
      pos_profile.value = data[0]; // Assuming pos_profile is in the first index
      orderTypes.value = pos_profile.value.applicable_for_order_type;
      selectedOrderType.value =
        orderTypes.value.find((orderType) => orderType.default === 1)
          ?.order_type || orderTypes.value[0].order_type;

      let orderRequired =
        orderTypes.value.find(
          (orderType) => orderType.order_type === selectedOrderType.value
        ) || "";

      // Emit event if the order is required
      eventBus.emit("required-order-id", orderRequired.order_required);
    } else {
      console.error("No profile data found in localStorage.");
    }
  } catch (error) {
    console.error("Error getting profile:", error);
  }
};

watch(searchValue, (newValue) => {
  emitSearchEvent(newValue); // Trigger debounce when searchValue changes
});
watch(searchItem, (newValue) => {
  emitSearchItemEvent(newValue); // Trigger debounce when searchValue changes
});
watch(selectedOrderType, (newValue) => {
  eventBus.emit("selected_order_type", newValue);
  changeOrderType(newValue);
});
watch(selectedTable, (newValue) => {
  eventBus.emit("selected_table", newValue);
});
watch(orderBy, (newValue) => {
  eventBus.emit("order-taker", newValue);
});
onMounted(() => {
  if (!navigator.onLine) {
    offlineProfileData();
  }
  // window.addEventListener("offline", () => {
  //   // console.log("in-header You are offline");
  //   // offlineProfileData();
  // });
  eventBus.on("send_pos_profile", (profile) => {
    pos_profile.value = profile;
    orderTypes.value = pos_profile.value.applicable_for_order_type;
    employeesList.value = profile.employee_list
    fetchTableOptions();
    selectedOrderType.value =
      orderTypes.value.find((orderType) => orderType.default === 1)
        ?.order_type || orderTypes.value[0].order_type;
    let orderRequired =
      orderTypes.value.find(
        (orderType) => orderType.order_type == selectedOrderType.value
      ) || "";
    if (orderRequired.order_required) {
      eventBus.emit("required-order-id", true);
    } else {
      eventBus.emit("required-order-id", false);
    }
  });

  eventBus.on("current-screen", (newVal) => {
    currentScreen.value = newVal;
  });
  eventBus.on("clear-search", () => {
    searchValue.value = "";
  });
  eventBus.on("reserved-table", (table) => {
    // const targetTable = tableOptions.value.find((t) => t.table_no == table);
    // console.log("targetTable", targetTable);
    // if (targetTable) {
    //   targetTable.status = "reserved";
    // }
    // tableOptions.value =tableOptions.value.filter((t) => t.status !=='reserved');
    fetchTableOptions()
    selectedTable.value = ''
  });

  eventBus.on("app-internet-status", (newStatus) => {
    offlineProfileData();
  });
  // eventBus.on("internet-status", (newVal) => {
  //   if(!newVal){
  //     offlineProfileData()
  //   }
  // });
  eventBus.on("selected_table", (table) => {
    selectedTable.value = table;
  });
});
onBeforeUnmount(() => {
  eventBus.off("send_pos_profile");
  eventBus.off("current-screen");
  eventBus.off("app-internet-status");
});
</script>

<style scoped>
.pos-header-bar {
  margin-bottom: 0;
}
.order-type-select {
  padding-top: 3px;
}
</style>
<style>
.v-field.v-field--appended.v-field--center-affix.v-field--no-label.v-field--variant-outlined.v-theme--light.v-locale--is-ltr {
  padding-top: 7px !important;
  border-radius: 12px !important;
}

.v-select__selection {
  position: relative;
  top: 8px;
}

.v-field__clearable {
  margin-bottom: 8px !important;
}
</style>
