<template>
  <v-app>
    <v-container fluid class="pa-0">
      <!-- Logo Row -->
      <v-row class="ma-0">
        <v-col cols="12" class="py-4 text-center" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
          <h1 class="text-h3 text-white font-weight-bold">
            🍽️ Kitchen Orders
          </h1>
        </v-col>
      </v-row>

      <!-- Statistics Row -->
      <v-row class="ma-0 px-4 pt-2">
        <v-col cols="12" md="6">
          <v-card elevation="3" class="pa-3">
            <v-row align="center">
              <v-col cols="12" sm="4">
                <div class="text-center">
                  <div class="text-h5 font-weight-bold" style="color: #ff6b6b;">{{ todoOrders.length }}</div>
                  <div class="text-body-2 text-grey-darken-1">Orders in To Do</div>
                </div>
              </v-col>
              <v-col cols="12" sm="4">
                <div class="text-center">
                  <div class="text-h5 font-weight-bold" style="color: #f59e0b;">{{ inProgressOrders.length }}</div>
                  <div class="text-body-2 text-grey-darken-1">Orders in Progress</div>
                </div>
              </v-col>
              <v-col cols="12" sm="4">
                <div class="text-center">
                  <div class="text-h5 font-weight-bold" style="color: #10b981;">{{ completedOrders.length }}</div>
                  <div class="text-body-2 text-grey-darken-1">Completed Orders</div>
                </div>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
        <v-col cols="12" md="3">
          <v-card elevation="3" class="pa-3 d-flex align-center" style="height: 100%;">
            <v-select
              v-model="selectedCategory"
              :items="categories"
              label="Kot Category"
              item-title="item_group"
              density="comfortable"
              variant="outlined"
              hide-details
            ></v-select>
          </v-card>
        </v-col>
        <v-col cols="12" md="3">
          <v-card elevation="3" class="pa-3 d-flex align-center justify-center" style="height: 100%;">
            <v-btn
              color="#21A0A0"
              size="default"
              prepend-icon="mdi-refresh"
              @click="getKotOrders()"
              block
            >
              Refresh Orders
            </v-btn>
          </v-card>
        </v-col>
      </v-row>

      <!-- KOT Columns Row -->
      <v-row class="ma-0 px-4">
        <!-- TODO Column -->
        <v-col cols="12" md="4">
          <v-card elevation="2" class="px-3" style="height: 78vh; background-color: #f8f9fa; display: flex; flex-direction: column;">
            <v-card-title class="text-h5 font-weight-bold text-center pb-4" style="color: #ff6b6b;">
              📋 To Do
            </v-card-title>
            <v-divider class="mb-1"></v-divider>
            
            <div style="overflow-y: auto; flex: 1;">
            
            <v-card
              v-for="order in todoOrders"
              :key="order.id"
              class="mb-3 pa-4"
              elevation="3"
            >
              <div class="mb-2">
                <v-chip color="primary" size="default" class="mr-2">
                  <span class="text-h6 font-weight-bold">Order #{{ order.kot_no }}</span>
                </v-chip>
                <v-chip color="grey" size="default" variant="outlined" v-if="order?.date"> 
                  <span class="text-body-1">{{ order.date }}</span>
                </v-chip>
              </div>
              
              <v-card-subtitle class="pa-0 mt-3 mb-2 text-subtitle-1 font-weight-bold">
                Order Details:
              </v-card-subtitle>
              
              <v-list dense class="pa-0">
                <v-list-item
                  v-for="(item, idx) in order.items"
                  :key="idx"
                  class="px-0"
                  style="min-height: 35px;"
                >
                  <v-list-item-title class="text-body-1 font-weight-medium">
                    {{ item.quantity }}x {{ item.name }}
                  </v-list-item-title>
                </v-list-item>
              </v-list>

              <v-btn
                color="success"
                block
                class="mt-3"
                @click="updateKotOrderStatus(order, 'inprogress')"
              >
                Start
              </v-btn>
            </v-card>
            </div>
          </v-card>
        </v-col>

        <!-- IN PROGRESS Column -->
        <v-col cols="12" md="4">
          <v-card elevation="2" class="px-3" style="height: 78vh; background-color: #fff8e1; display: flex; flex-direction: column;">
            <v-card-title class="text-h5 font-weight-bold text-center pb-4" style="color: #f59e0b;">
              🔥 In Progress
            </v-card-title>
            <v-divider class="mb-4"></v-divider>
            
            <div style="overflow-y: auto; flex: 1;">
            
            <v-card
              v-for="order in inProgressOrders"
              :key="order.id"
              class="mb-3 pa-4"
              elevation="3"
            >
              <div class="mb-2">
                <v-chip color="warning" size="default" class="mr-2">
                  <span class="text-h6 font-weight-bold">Order #{{ order.kot_no }}</span>
                </v-chip>
                <v-chip v-if="order?.date" color="grey" size="default" variant="outlined">
                  <span class="text-body-1">{{ order.date }}</span>
                </v-chip>
              </div>
              
              <v-card-subtitle class="pa-0 mt-3 mb-2 text-subtitle-1 font-weight-bold">
                Order Details:
              </v-card-subtitle>
              
              <v-list dense class="pa-0">
                <v-list-item
                  v-for="(item, idx) in order.items"
                  :key="idx"
                  class="px-0"
                  style="min-height: 35px;"
                >
                  <v-list-item-title class="text-body-1 font-weight-medium">
                    {{ item.quantity }}x {{ item.name }}
                  </v-list-item-title>
                </v-list-item>
              </v-list>

              <v-btn
                color="primary"
                block
                class="mt-3"
                @click="updateKotOrderStatus(order, 'completed')"
              >
                Complete
              </v-btn>
            </v-card>
            </div>
          </v-card>
        </v-col>

        <!-- COMPLETED Column -->
        <v-col cols="12" md="4">
          <v-card elevation="2" class="px-3" style="height: 78vh; background-color: #e8f5e9; display: flex; flex-direction: column;">
            <v-card-title class="text-h5 font-weight-bold text-center pb-4" style="color: #10b981;">
              ✅ Completed
            </v-card-title>
            <v-divider class="mb-4"></v-divider>
            
            <div style="overflow-y: auto; flex: 1;">
            
            <v-card
              v-for="order in completedOrders"
              :key="order.id"
              class="mb-3 pa-4"
              elevation="3"
            >
              <div class="mb-2">
                <v-chip color="success" size="small" class="mr-2">
                  Order #{{ order.kot_no }}
                </v-chip>
                <v-chip v-if="order?.date" color="grey" size="small" variant="outlined">
                  {{ order.date }}
                </v-chip>
              </div>
              
              <v-card-subtitle class="pa-0 mt-3 mb-2 text-subtitle-2 font-weight-bold">
                Order Details:
              </v-card-subtitle>
              
              <v-list dense class="pa-0">
                <v-list-item
                  v-for="(item, idx) in order.items"
                  :key="idx"
                  class="px-0"
                  style="min-height: 30px;"
                >
                  <v-list-item-title class="text-body-2">
                    {{ item.quantity }}x {{ item.name }}
                  </v-list-item-title>
                </v-list-item>
              </v-list>

              <v-row class="mt-3" no-gutters>
                <v-col cols="6" class="pr-1">
                  <v-btn
                    color="warning"
                    size="small"
                    block
                    @click="updateKotOrderStatus(order, 'inprogress')"
                  >
                    In Progress
                  </v-btn>
                </v-col>
                <v-col cols="6" class="pl-1">
                  <v-btn
                    color="primary"
                    size="small"
                    block
                    @click="updateKotOrderStatus(order, 'delivered')"
                  >
                    Deliver
                  </v-btn>
                </v-col>
              </v-row>
            </v-card>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-app>
</template>

<script setup>
import { ref, computed,onMounted } from 'vue';

const selectedCategory = ref(null);
const categories = ref([]);
const pos_profile = ref("");
const orders = ref([
  // {
  //   id: 1,
  //   orderNo: '001',
  //   date: '2025-10-04',
  //   status: 'todo',
  //   items: [
  //     { name: 'Chicken Biryani', quantity: 2 },
  //     { name: 'Butter Naan', quantity: 4 },
  //     { name: 'Raita', quantity: 2 }
  //   ]
  // },
  // {
  //   id: 2,
  //   orderNo: '002',
  //   date: '2025-10-04',
  //   status: 'todo',
  //   items: [
  //     { name: 'Karahi Chicken', quantity: 1 },
  //     { name: 'Roti', quantity: 6 }
  //   ]
  // },
]);

const todoOrders = computed(() => orders.value.filter(o => o.status === 'todo'));
const inProgressOrders = computed(() => orders.value.filter(o => o.status === 'inprogress'));
const completedOrders = computed(() => orders.value.filter(o => o.status === 'completed'));

const getKotOrders = async (pos_profile_name) => {
  try {
    const response = await frappe.call({
        method: "tabrah_pos.tabrah_pos.api.posapp.get_pending_kots",
        args: {
          pos_profile: pos_profile.value.name,
          company: pos_profile.value.company
        },
      });
    if (response.message) {
      orders.value = response.message;
    }
  } catch (error) {
    console.error("Error getting order", error);
  }
};
const updateKotOrderStatus = async (kot, status) => {
  try {
    const response = await frappe.call({
        method: "tabrah_pos.tabrah_pos.api.posapp.update_kot_status",
        args: {
          pos_profile: pos_profile.value.name,
          kot_name: kot.name,
          status: status
        },
      });
    if (response.message) {
      kot.status = status;
    
    }
  } catch (error) {
    console.error("Error getting order", error);
  }
};
const check_opening_entry = async () => {
  try {
    const r = await frappe.call(
      "tabrah_pos.tabrah_pos.api.posapp.check_opening_shift",
      {
        user: frappe.session.user,
      }
    );

    if (r.message) {
      pos_profile.value = r.message.pos_profile;
      categories.value = pos_profile.value.item_groups;
      selectedCategory.value = categories.value[0]

    } 
  } catch (error) {
    console.error("Error checking opening entry", error);
  }
};
onMounted(async () => {
  await check_opening_entry()
  getKotOrders();
  frappe.realtime.on("kot_created", function (data) {
    console.log('refresh-data',data)
        if(data.kot){
          getKotOrders()
        }
      });
});

</script>

<style scoped>
.v-card {
  transition: transform 0.2s;
}

.v-card:hover {
  transform: translateY(-2px);
}
</style>