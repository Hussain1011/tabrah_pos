

<template>
  <v-card elevation="1" class="border-16 product-main-card">
    <v-row class="pl-6 pt-6">
      <v-col cols="3" class="mt-3">
        <h3>Hold Orders</h3>
      </v-col>
      <v-col cols="9" class="d-flex justify-end pr-11">
        <v-btn variant="outlined" size="large" class="text-capitalize mr-2" color="#21A0A0" style="border-radius: 8px"
          @click="addItem()" width="300px">
          <v-icon class="mr-2">mdi-plus</v-icon>
          <p class="mt-2 category-p">Add Item</p>
        </v-btn>
        <!-- <v-btn
            variant="outlined"
            size="large"
            class="text-capitalize mr-2"
            color="#21A0A0"
            style="border-radius: 8px"
            @click="getHoldOrders()"
            width="300px"
          >
            <p class="mt-2 category-p">Hold Order</p>
          </v-btn> -->
      </v-col>
    </v-row>

    <v-row class="px-4">
      <v-col v-for="order in orders" :key="order.id" cols="12" sm="6" md="4" lg="4" class="px-8">
        <v-card class="order-card d-flex flex-column" elevation="0" outlined @click="showOrderDetail(order)"
          :class="{ 'selected-card': selectedOrder == order }" style="
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          ">
          <v-card-text class="pb-0">
            <div class="dis-grid">
              <div class="d-flex justify-space-between">
                <!-- <div class="panda-go-div">Pando Go</div> -->
                <div class="panda-go-div">{{ order.id }}</div>
                <!-- <v-icon @click.stop="deleteItem(order.id)" color="red">mdi-delete</v-icon> -->

                <!-- <span class="ml-2 mt-1">{{ order.name }}</span> -->
              </div>
              <p class="mt-2">
                <span class="text-grey">Date:{{ formatDeliveryDate(order.timestamp) }}</span>
              </p>
              <span v-if="order.table">Table:{{ order.table }}</span>

              <span v-if="order.orderBy">Order Taker:{{ order.orderByName }}</span>

              <span v-if="order.cover">Persons: {{ order.cover }}</span>

              <span v-if="order.customer">Customer: {{ order.customer }}</span>
            </div>
            <div class="mt-3">
              <p>Order Detail:</p>
              <div class="d-flex ml-2" style="height: 80px">
                <v-icon>mdi-clipboard-list-outline</v-icon>
                <p class="ml-2 text-grey">
                  <!-- Display items with "+x more" if more than 6 items -->
                  {{
                    order.items
                      .slice(0, 6)
                      .map((item) => item.item_name)
                      .join(", ")
                  }}<span v-if="order.items.length > 6">, +{{ order.items.length - 6 }} more</span>
                </p>
              </div>
            </div>
            <v-divider class="mt-3 dotted-divider" :thickness="3"></v-divider>

            <div class="order-detail">
              <strong>Grand Total</strong>
              <p class="grand-p">QAR. {{ order.grand_total }}</p>
            </div>

            <!-- <div class="order-detail mt-3">
                  <strong>By</strong>
                  <p>{{ order.name }}</p>
                </div>
                <div class="order-detail mt-3 pb-3">
                  <strong>At</strong>
                  <p>{{ order.location }}</p>
                </div> -->
        </v-card-text>
        </v-card>
        <v-card class="d-flex flex-column" elevation="0" outlined :class="{ 'selected-card': selectedOrder == order }">
          <v-card-text class="pb-3">
            <div class="d-flex align-center justify-space-between" style="gap: 12px;">
              <v-select
                v-model="order.instruction"
                :items="instructionOptions"
                label="Instruction"
                variant="outlined"
                hide-details
                density="comfortable"
                style="flex: 1;"
              ></v-select>

              <v-btn
                color="#21A0A0"
                variant="flat"
                class="text-white text-capitalize"
                style="border-radius: 8px; height: 40px; min-width: 30px;"
                @click="ordersaway(order)"
              >Send</v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>


  </v-card>
</template>

<script setup>
import { ref, onMounted } from "vue";
import eventBus from "../../bus";
import { printKotAway } from "../../kotPrint.js";


const orders = ref([
  // {
  //   id: "1200589C",
  //   total: "1,080,000.00",
  //   name: "Nadeem Butt",
  //   location: "ISB - 0012",
  // },
]);

// dropdown options
const instructionOptions = ref([
  "Starters Away",
  "Breakfast Away",
  "Main Course Away",
  "Desert Away",
  "Sides Away",
]);

// Assuming you already have "orders" array somewhere
// Just make sure each order has its own "instruction" property
// Example initialization:
orders.value = orders.value.map(o => ({ ...o, instruction: "" }));

// selected value
const selectedInstruction = ref("");

const pos_profile = ref("");
const selectedOrder = ref("");
const showOrderDetail = (order) => {
  selectedOrder.value = order;
  eventBus.emit("load-hold-order", order);
};
const formatDeliveryDate = (date) => {
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  };
  return new Date(date).toLocaleString("en-US", options).replace(", ", " ");
};

const get_draft_orders = async () => {
  try {
    const response = await frappe.call({
      method: "tabrah_pos.tabrah_pos.api.posapp.search_orders",
      args: {
        company: pos_profile.value.company,
        currency: pos_profile.value.currency,
      },
    });

    if (response.message) {
      orders.value = response.message;
    }
  } catch (error) {
    console.error("Error fetching draft orders:", error);
  }
};
const getHoldOrders = async () => {
  try {
    // Retrieve hold orders from local storage
    orders.value = [];
    const heldOrders = JSON.parse(localStorage.getItem("heldOrders")) || [];

    // Update the orders array with the retrieved data
    setTimeout(() => {
      orders.value = heldOrders.reverse();
    }, 100);

    console.log("Hold orders retrieved successfully:", orders.value);
  } catch (error) {
    console.error("Failed to retrieve hold orders:", error);
  }
};
const deleteItem = (orderId) => {
  try {
    // Retrieve hold orders from local storage
    const heldOrders = JSON.parse(localStorage.getItem("heldOrders")) || [];

    // Filter out the order with the given ID
    const updatedOrders = heldOrders.filter((order) => order.id !== orderId);

    // Update localStorage with the filtered list
    localStorage.setItem("heldOrders", JSON.stringify(updatedOrders));

    // Update the orders array in the UI
    orders.value = updatedOrders.reverse();

    console.log(`Order with ID ${orderId} deleted successfully.`);
  } catch (error) {
    console.error("Failed to delete the order:", error);
  }
};
const addItem = async () => {
  if (selectedOrder.value) {
    eventBus.emit("open-product-menu");
  } else {
    eventBus.emit("show_mesage", {
      text: "Please select hold order first",
      color: "error",
    });
  }
};

const ordersaway = (order) => {
  console.log(order);
  printKotAway(order)
};

onMounted(() => {
  // eventBus.on("send_pos_profile", async (profile) => {
  //   pos_profile.value = profile;
  //   getHoldOrders();
  // });
  eventBus.on("go-to-hold-order", (data) => {
    // getHoldOrders();

    orders.value = data.reverse();
  });
  eventBus.on("update-hold-order",(id)=>{
    console.log("id",id)
    deleteItem(id)
  })


});
</script>

<style scoped>
.product-main-card {
  max-height: 80vh;
  height: 80vh;
  overflow-y: scroll;
  overflow-x: hidden;
}

.order-card {
  border: 1px solid #d5d5d5 !important;
  transition: transform 0.2s ease-in-out;
  border-radius: 16px !important;
}

.order-card:hover {
  transform: translateY(-5px);
  /* Move card slightly up on hover */
}

.order-header {
  display: flex;
  justify-content: space-between;
  font-weight: bold;
  color: #ff4500;
}

.grand-p {
  color: #ff4500;
}

.order-detail {
  display: flex;
  justify-content: space-between;
}

.dis-grid {
  display: grid;
}

.selected-card {
  background: #fcdfd3 !important;
}

.dotted-divider {
  border-style: dotted !important;
  border-color: #ff4500 !important;
}

.panda-go-div {
  border: 1px solid #ff6dbd;
  padding: 1px 7px 0px;
  border-radius: 6px;
  color: #ff6dbd !important;
  background: #fceaed;
}

.text-grey {
  color: #b3b3b3;
}
</style>
