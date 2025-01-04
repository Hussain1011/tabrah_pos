<template>
  <v-row class="pt-0 px-2">
    <v-col cols="12" md="8">
      <v-card elevation="1" class="border-16 title-card d-flex">
        
        <div class="search-div">
          <v-select
            v-model="selectedOrderType"
            :items="orderTypes"
            label="Order Type"
            class="order-type-select"
            density="compact"
            variant="outlined"
            item-title="order_type"
            :disabled="currentScreen !== 0"
          />
        </div>
        <v-spacer></v-spacer>
        <div class="search-div" style="margin-left: 1%;">
          <v-select
            variant="outlined"
            label="Table"
            append-inner-icon="mdi-magnify"
            placeholder="Table No."
            :items="tableOptions"
            class="mt-1 mr-3"
            density="compact"
            item-title="table_name"
            item-value="id"
            style="height: 83px; border-radius: 6px;"
            @click="onOpenSelect"
          />
        </div>
        <v-spacer></v-spacer>
        <div class="search-div">
          <v-text-field
            variant="outlined"
            append-inner-icon="mdi-magnify"
            placeholder="Find Your Item"
            class="mt-1 mr-3"
            density="compact"
            style="height: 83px; border-radius: 6px"
            v-model="searchValue"
          />
        </div>  
      </v-card>
    </v-col>

    <v-col cols="12" md="4" class="p-4">
      <div class="d-flex">
        <div class="d-flex">
          <p class="mt-4 pos-p">POS:</p>
          <div class="pos-id">{{ pos_profile.name }}</div>
        </div>
        <v-spacer></v-spacer>
        <div class="pos-close d-flex" @click="go_desk()">
          <v-icon color="black" class="pt-6">mdi-logout</v-icon>
          <p class="pt-3 ml-1">Close POS</p>
        </div>
      </div>
    </v-col>
  </v-row>
</template>

<script setup>
import eventBus from "../../bus";
import { ref, onMounted, watch } from "vue";
import indexedDBService from "../../indexedDB";

const searchValue = ref("");
const pos_profile = ref("");
const selectedOrderType = ref("");
const currentScreen = ref(null);

const orderTypes = ref([]);
const tableOptions = ref([]);

const logOut = () => {
  eventBus.emit("logout-pos");
};


const onOpenSelect = () => {
        fetchTableOptions();
};

onMounted(() => {
        fetchTableOptions();
      });

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
const fetchOrderTypes = async () => {
  try {
    const response = await frappe.call({
      method: "tabrah_pos.tabrah_pos.api.posapp.get_Order_type",
      args: {
        pos_profile: pos_profile.value,
      },
    });

    // Assign response to order types
    orderTypes.value = response.message;
  } catch (error) {
    console.error("Error fetching order types:", error);
  }
};

// Fetch order types
const fetchTableOptions = async (profile) => {
  try {
    const response = await frappe.call({
      method: "tabrah_pos.tabrah_pos.api.posapp.get_Table_names",
      args: {
        pos_profile: 'Test',
      },
    });

    tableOptions.value = response.message.map((item) => ({
      table_name: item.table_no,
      id: item.name,
    })); // Map response to expected structure
    
  } catch (error) {
    console.error("Error fetching order types:", error);
  }
};


watch(searchValue, (newValue) => {
  emitSearchEvent(newValue); // Trigger debounce when searchValue changes
});
watch(selectedOrderType, (newValue) => {
  eventBus.emit("selected_order_type", newValue);
  changeOrderType(newValue);
});
onMounted(() => {
  window.addEventListener("offline", () => {
    // console.log("in-header You are offline");
    offlineProfileData();
  });
  eventBus.on("send_pos_profile", (profile) => {
    console.log('profile')
    console.log(profile)
    pos_profile.value = profile;
    orderTypes.value = pos_profile.value.applicable_for_order_type;
    // tableOptions.value = ['01','02'];
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
  eventBus.on("app-internet-status", (newStatus)=>{
    offlineProfileData()
  });
  // eventBus.on("internet-status", (newVal) => {
  //   if(!newVal){
  //     offlineProfileData()
  //   }
  // });

});
</script>

<style scoped>
.title-card {
  padding: 9px 0px 9px 0px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2) !important;
  border-radius: 12px;
}
.search-div {
  height: 60px;
  width: 100%;
  max-width: 350px;
}
.v-text-field--outlined {
  border-radius: 16px !important;
}

.pos-id {
  border: 1px solid;
  border-radius: 6px;
  width: 195px;
  height: 48px;
  padding-top: 15px;
  padding-left: 8px;
  margin-left: 14px;
  background: white;
}
.pos-close {
  border: 1px solid #f05d23;
  border-radius: 6px;
  width: 195px;
  height: 48px;
  padding-left: 8px;
  margin-left: 14px;
  background: #fcdfd3;
}
.pos-p {
  font-size: 16px;
  font-weight: 600;
}
.order-type-select {
  padding-top: 3px;
  height: 95px;
  width: 290px;
  margin-left: 44px;
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
</style>