<template>
  <v-app>
    <v-container fluid class="pa-0">
      <!-- Logo Row -->
      <v-row class="ma-0">
        <v-col cols="12" class="py-4 text-center" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
          <h1 class="text-h3 text-white font-weight-bold">
            🍽️ Restaurant Kitchen Orders
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
              @click="refreshOrders"
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
                  <span class="text-h6 font-weight-bold">Order #{{ order.orderNo }}</span>
                </v-chip>
                <v-chip color="grey" size="default" variant="outlined">
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
                @click="updateStatus(order.id, 'inprogress')"
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
                  <span class="text-h6 font-weight-bold">Order #{{ order.orderNo }}</span>
                </v-chip>
                <v-chip color="grey" size="default" variant="outlined">
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
                @click="updateStatus(order.id, 'completed')"
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
                  Order #{{ order.orderNo }}
                </v-chip>
                <v-chip color="grey" size="small" variant="outlined">
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
                    @click="updateStatus(order.id, 'inprogress')"
                  >
                    In Progress
                  </v-btn>
                </v-col>
                <v-col cols="6" class="pl-1">
                  <v-btn
                    color="primary"
                    size="small"
                    block
                    @click="deliverOrder(order.id)"
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
import { ref, computed } from 'vue';

const selectedCategory = ref('All');
const categories = ['All', 'Coffee', 'Juice', 'Pizza'];

const orders = ref([
  {
    id: 1,
    orderNo: '001',
    date: '2025-10-04',
    status: 'todo',
    items: [
      { name: 'Chicken Biryani', quantity: 2 },
      { name: 'Butter Naan', quantity: 4 },
      { name: 'Raita', quantity: 2 }
    ]
  },
  {
    id: 2,
    orderNo: '002',
    date: '2025-10-04',
    status: 'todo',
    items: [
      { name: 'Karahi Chicken', quantity: 1 },
      { name: 'Roti', quantity: 6 }
    ]
  },
  {
    id: 3,
    orderNo: '003',
    date: '2025-10-04',
    status: 'todo',
    items: [
      { name: 'Chicken Tikka', quantity: 1 },
      { name: 'Naan', quantity: 2 }
    ]
  },
  {
    id: 4,
    orderNo: '004',
    date: '2025-10-04',
    status: 'todo',
    items: [
      { name: 'Mutton Korma', quantity: 1 },
      { name: 'Rice', quantity: 2 }
    ]
  },
  {
    id: 5,
    orderNo: '005',
    date: '2025-10-04',
    status: 'todo',
    items: [
      { name: 'Fish Fry', quantity: 2 },
      { name: 'Salad', quantity: 1 }
    ]
  },
  {
    id: 6,
    orderNo: '006',
    date: '2025-10-04',
    status: 'todo',
    items: [
      { name: 'Seekh Kebab', quantity: 4 },
      { name: 'Paratha', quantity: 3 }
    ]
  },
  {
    id: 7,
    orderNo: '007',
    date: '2025-10-04',
    status: 'inprogress',
    items: [
      { name: 'Nihari', quantity: 1 },
      { name: 'Naan', quantity: 2 },
      { name: 'Salad', quantity: 1 }
    ]
  },
  {
    id: 8,
    orderNo: '008',
    date: '2025-10-04',
    status: 'inprogress',
    items: [
      { name: 'Biryani', quantity: 3 },
      { name: 'Raita', quantity: 2 }
    ]
  },
  {
    id: 9,
    orderNo: '009',
    date: '2025-10-04',
    status: 'inprogress',
    items: [
      { name: 'Chicken Karahi', quantity: 1 },
      { name: 'Roti', quantity: 4 }
    ]
  },
  {
    id: 10,
    orderNo: '010',
    date: '2025-10-04',
    status: 'inprogress',
    items: [
      { name: 'Dal Makhani', quantity: 2 },
      { name: 'Naan', quantity: 4 }
    ]
  },
  {
    id: 11,
    orderNo: '011',
    date: '2025-10-04',
    status: 'completed',
    items: [
      { name: 'Haleem', quantity: 2 },
      { name: 'Paratha', quantity: 4 }
    ]
  },
  {
    id: 12,
    orderNo: '012',
    date: '2025-10-04',
    status: 'completed',
    items: [
      { name: 'Chicken Biryani', quantity: 2 },
      { name: 'Raita', quantity: 1 }
    ]
  },
  {
    id: 13,
    orderNo: '013',
    date: '2025-10-04',
    status: 'completed',
    items: [
      { name: 'Butter Chicken', quantity: 1 },
      { name: 'Naan', quantity: 3 }
    ]
  },
  {
    id: 14,
    orderNo: '014',
    date: '2025-10-04',
    status: 'completed',
    items: [
      { name: 'Palak Paneer', quantity: 1 },
      { name: 'Roti', quantity: 4 }
    ]
  },
  {
    id: 15,
    orderNo: '015',
    date: '2025-10-04',
    status: 'completed',
    items: [
      { name: 'Mix Grill', quantity: 1 },
      { name: 'Salad', quantity: 2 }
    ]
  }
]);

const todoOrders = computed(() => orders.value.filter(o => o.status === 'todo'));
const inProgressOrders = computed(() => orders.value.filter(o => o.status === 'inprogress'));
const completedOrders = computed(() => orders.value.filter(o => o.status === 'completed'));

const updateStatus = (orderId, newStatus) => {
  const order = orders.value.find(o => o.id === orderId);
  if (order) {
    order.status = newStatus;
  }
};

const refreshOrders = () => {
  // This function would typically fetch fresh data from your API
  // For now, it just triggers a re-render
  console.log('Refreshing orders...');
  // You can add your API call here:
  // fetchOrdersFromAPI();
};

const deliverOrder = (orderId) => {
  const order = orders.value.find(o => o.id === orderId);
  if (order) {
    console.log(`Delivering order #${order.orderNo}`);
    // You can add logic here to handle delivery
    // For example, remove from list or update status to 'delivered'
  }
};
</script>

<style scoped>
.v-card {
  transition: transform 0.2s;
}

.v-card:hover {
  transform: translateY(-2px);
}
</style>