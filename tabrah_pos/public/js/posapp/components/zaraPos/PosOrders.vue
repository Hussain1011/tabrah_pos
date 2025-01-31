<template>
  <v-card elevation="1" class="border-16 product-main-card">
    <v-row class="pl-6 pt-6">
      <v-col cols="9" class="mt-3">
        <h3>POS Orders</h3>
      </v-col>
      <v-col cols="3" class="d-flex justify-end pr-11">
        <v-btn variant="outlined" size="large" class="text-capitalize mr-2" color="#21A0A0" style="border-radius: 8px">
          <!-- <v-icon class="mr-2">mdi-plus</v-icon> -->
          <p class="mt-2 category-p">Completed</p>
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
              min-height: 100%;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
            ">
          <v-card-text class="pb-0">
            <div class="dis-grid">
              <div class="d-flex justify-space-between">
                <!-- <div class="panda-go-div">Pando Go</div> -->
                <div class="" style="color: grey;">#{{ order.id }}</div>
                <!-- <v-icon @click.stop="deleteItem(order.id)" color="red"
                    >mdi-delete</v-icon
                  > -->
                <v-chip color="#21A0A0">
                  Completed
                </v-chip>

                <!-- <span class="ml-2 mt-1">{{ order.name }}</span> -->
              </div>
              <p class="mt-2" style="font-size: 18px;font-weight: 700;">
                <!-- <span class="text-grey">Date:{{ formatDeliveryDate(order.timestamp) }}</span> -->
                Rs. {{ order.grand_total }}
              </p>
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
              <p class="grand-p">Rs. {{ order.grand_total }}</p>
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
      </v-col>
    </v-row>



    <!-- Dialog -->
    <v-dialog v-model="dialog" max-width="741px" height="820" persistent>
      <v-card style="height: 790px; overflow-y: hidden; border-radius: 16px">
        <v-card-title>
          <v-row align="center" justify="space-between" class="py-2">
            <v-col cols="auto" class="d-flex align-center" style="    padding-left: 260px;
">
              <img src="/assets/tabrah_pos/js/posapp/components/pos/returnType.png" alt="" class="" />
              <span class="ml-3" style="font-size: 15px;font-weight: 500;">Choose Return Type</span>
            </v-col>
            <v-col cols="auto">
              <v-card-title class="d-flex justify-end">
                <v-btn variant="text" size="x-small" density="default" color="white" style="background: #F05D23"
                  @click="closeDialog()">
                  <v-icon>mdi-close</v-icon>
                </v-btn>
              </v-card-title>
            </v-col>
          </v-row>
        </v-card-title>
        <v-card-text>
          <v-row justify="center" class="" style="    padding-left: 100px;">
            <v-radio label="Exchange" value="exchange"></v-radio>
            <v-radio label="Replace" value="replace"></v-radio>
            <!-- <v-radio label="Refund" value="refund"></v-radio>
            <v-radio label="Points" value="points"></v-radio> -->
          </v-row>

          <v-row>
            <v-col cols="12" class="px-10 pt-15">
              <div style="background: #F3F3F3; border-radius: 12px;" class="px-15 py-5">
                <v-card style="    width: 400px;margin-left: 54px;border-radius: 8px;" class="d-flex justify-center">
                  <v-card-text class="pb-0">

                    <div class="dis-grid">
                      <div class="d-flex justify-space-between px-2">
                        <div class="" style="color: #666666;">#45211</div>
                        <v-chip color="#21A0A0" size="small">
                          Completed
                        </v-chip>

                      </div>
                      <p class="mt-1 px-2" style="font-size: 18px;font-weight: 700; color: #666666;">
                        Rs. 23234
                      </p>
                    </div>

                    <div class="d-flex py-4 mb-2"
                      style="border-top: 1px solid #D5D5D5;border-bottom: 1px solid #D5D5D5;">
                      <img src="/assets/tabrah_pos/js/posapp/components/pos/account.png" alt="" class=""
                        style="width: 35px;" />
                      <p class="mt-2 ml-2">nadeem</p>
                      <span style="border: 1px solid #D5D5D5;margin-left: 70px;"></span>
                      <img src="/assets/tabrah_pos/js/posapp/components/pos/posImg.png" alt="" class="ml-2"
                        style="width: 35px;" />
                      <p class="mt-2 ml-2">ISb-123</p>
                    </div>

                    <div class="d-flex  my-3" style="">
                      <img src="/assets/tabrah_pos/js/posapp/components/pos/receipt_long.png" alt="" class=""
                        style="width: 35px;" />
                      <p class="ml-2 mt-2 text-grey">
                        <!-- Display items with "+x more" if more than 6 items -->
                        <!-- {{
                    order.items
                      .slice(0, 6)
                      .map((item) => item.item_name)
                      .join(", ")
                  }}<span v-if="order.items.length > 6">, +{{ order.items.length - 6 }} more</span> -->
                        zara, gul Ahmed,
                      </p>
                    </div>





                  </v-card-text>
                </v-card>

              </div>
              <div class="px-0 pt-7" style="max-height: 350px; overflow-y: auto;">
                <v-row v-for="(item, index) in items" :key="item.sku" class="py-0 align-center mr-0 "
                  @click="openDialog(item, true)">
                  <div style="background: #F3F3F3; width: 100%;" class="d-flex py-3">
                    <v-col cols="5" class="pr-2 pb-0 ml-4 pt-1">
                      <div>{{ item.item_name }}</div>
                      <!-- <div class="text-caption grey--text">{{ item.sku }}</div> -->
                      <div class="text-caption grey--text">{{ item.rate }}</div>
                    </v-col>

                    <v-col cols="2" class="text-center px-0 pb-0">
                      {{ item.qty }}
                    </v-col>

                    <v-col cols="4" class="text-right teal--text text--accent-4 pb-0">
                      <strong>Rs.{{ item.rate * item.qty }}</strong>
                    </v-col>

                    <v-col cols="1" class="text-right pb-0" v-show="screen == 0">
                      <!-- Delete icon -->
                      <v-icon @click.stop="deleteItem(index)" color="red">mdi-delete</v-icon>
                    </v-col>


                  </div>
                  <v-col cols="12" class="py-0 my-0 px-0">
                    <v-divider class="dotted-divider" :thickness="2"></v-divider>
                  </v-col>
                </v-row>

              </div>

              <div class="pt-5 d-flex justify-center">
                <v-btn class="white--text font-weight-bold payment-button" height="52" color="#21A0A0"
                  @click="goForPayment" :loading="loadingBtn" :disabled="loadingBtn" style="width: 321px;">
                  <p class="mt-2 payment-p">PAYMENT</p>
                </v-btn>
              </div>

              <div class="pt-5 d-flex justify-center">
                <v-btn class="white--text font-weight-bold " height="52" variant="text" @click="goForPayment"
                  :loading="loadingBtn" :disabled="loadingBtn" style="width: 321px;">
                  <p class="mt-2 payment-p">Cancel</p>
                </v-btn>
              </div>


            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>


  </v-card>
</template>

<script setup>
import { ref, onMounted } from "vue";
import eventBus from "../../bus";

const orders = ref([
  {
    id: "1200589C",
    total: "1,080,000.00",
    name: "Nadeem Butt",
    location: "ISB - 0012",
    items: [
      {
        item_name: 'Gul Ahmed'


      }
    ],
    grand_total: 12000,
    timestamp: "2025-01-01 00:00:00"
  },
]);

const items = ref([
  {
    item_name: "Three Milk Cake",
    rate: 120000,
    qty: 2
  },
  {
    item_name: "Three Milk Cake",
    rate: 120000,
    qty: 2
  },

])

const pos_profile = ref("");
const selectedOrder = ref("");
const dialog = ref(false)
const showOrderDetail = (order) => {
  dialog.value = true
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




onMounted(() => {
  // eventBus.on("send_pos_profile", async (profile) => {
  //   pos_profile.value = profile;
  //   getHoldOrders();
  // });
  eventBus.on("go-to-pos-order", (data) => {
  });
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
  border-color: #626262 !important;
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

:deep(.v-label--clickable) {
  margin-top: 8px !important;
}
</style>