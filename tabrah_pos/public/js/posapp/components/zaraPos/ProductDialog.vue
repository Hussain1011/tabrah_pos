<template>
  <v-dialog v-model="dialog" max-width="741px" height="720" persistent>
    <v-card style="height: 720px; overflow-y: hidden; border-radius: 16px; display: flex; flex-direction: column;">
      <v-card-title class="d-flex justify-end">
        <v-btn variant="text" size="x-small" density="default" color="white" style="background: orange"
          @click="closeDialog()">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="px-8" style="overflow-y: auto; flex: 1 1 auto;">
        <v-row>
          <!-- Left side -->
          <v-col cols="5">
            <v-img :src="selectedProduct.image ? selectedProduct.image : defaultImg"  alt="Product Image" height="480" aspect-ratio="1" cover
              class="mb-4 product-img py-0"></v-img>

            <div class="py-0 item-content">
              <div class="item-name">
                {{ selectedProduct.item_name || "" }}
              </div>

              <div class="item-price">
                Rs.{{ selectedProduct.original_rate ? formatNumber(selectedProduct.original_rate) : "" }}
              </div>

              <div class="" v-if="selectedProduct.rate < selectedProduct.original_rate">
                <strong>Total After Discount: Rs:<span class="item-price">{{ formatNumber(selectedProduct.rate) }}</span></strong>
              </div>
            </div>
          </v-col>

          <!-- Right side -->
          <v-col cols="7">
            <div class="d-flex justify-between">
              <div class="black--text item-title">Item Number</div>
              <div>{{ selectedProduct.item_code }}</div>
            </div>

            <div class="mt-3 d-flex justify-between">
              <div class="black--text item-title">Item Detail</div>
              <div>{{ selectedProduct.item_name }}</div>
            </div>

            <div class="mt-4 d-flex justify-between">
              <div class="black--text item-title">Inventory</div>
              <div>{{ selectedProduct.actual_qty }}</div>
            </div>

            <v-divider class="mt-2 border-opacity-75 mx-6" :thickness="1" style="background-color: grey"></v-divider>

            <!-- Quantity -->
            <v-row class="my-4 align-center">
              <v-col cols="4" class="text-right">
                <v-btn variant="outlined" size="x-large" class="text-capitalize" color="#21A0A0"
                  style="background-color: #d3ecec; border-radius: 8px" @click="decreaseQuantity">
                  -
                </v-btn>
              </v-col>

              <v-col cols="4" class="text-center">
                <div class="text-quantity black--text">{{ quantity }}</div>
                <v-divider class="mx-7 border-opacity-75" :thickness="2" style="background-color: black"></v-divider>
              </v-col>

              <v-col cols="4" class="text-left">
                <v-btn variant="outlined" size="x-large" class="text-capitalize" color="#21A0A0"
                  style="background-color: #d3ecec; border-radius: 8px" @click="increaseQuantity">
                  +
                </v-btn>
              </v-col>
            </v-row>

            <!-- Discount (Rs Input → Percentage Output) -->
            <v-row class="my-4 align-center">
              <v-col cols="12" class="text-right">
                <v-text-field class="b-radius-8" variant="outlined" label="Discount (Rs)" v-model="discountRs"
                  type="number" min="0" @input="calculateDiscountPercentage" />
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12">
                <div class="font-weight-bold">Description</div>
                <div class="grey--text">{{ selectedProduct.description }}</div>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-card-text>

      <div style="padding: 24px 32px; background: #fff; box-shadow: 0 -2px 8px rgba(0,0,0,0.03); z-index: 2;">
        <v-btn block size="x-large" color="#21A0A0" style="border-radius: 8px" @click="addToCart">
          ADD
        </v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, onMounted, watch,computed } from "vue";
import eventBus from "../../bus";

const dialog = ref(false);
const quantity = ref(1);
const selectedProduct = ref({});
const discountRs = ref(""); // user enters discount in RS
const editingIndex = ref(null);
const updateQty = ref(false);
const defaultImg = computed(() => `/assets/tabrah_pos/js/posapp/components/pos/defaultProduct.png`);


/* Increase / Decrease Quantity */
const increaseQuantity = () => {
  quantity.value++;
  selectedProduct.value.qty = quantity.value;
};

const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--;
    selectedProduct.value.qty = quantity.value;
  }
};

/* Format */
const formatNumber = (num) => {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

/* Convert Rs Discount → Percentage + Update Rate */
const calculateDiscountPercentage = () => {
  if (!discountRs.value || discountRs.value <= 0) {
    selectedProduct.value.rate = selectedProduct.value.original_rate;
    selectedProduct.value.discount_percentage = 0;
    return;
  }

  const rate = selectedProduct.value.original_rate;

  const percentage = (discountRs.value / rate) * 100;

  selectedProduct.value.discount_percentage = Number(percentage.toFixed(2));

  selectedProduct.value.rate = rate - Number(discountRs.value);
};

/* Add to Cart */
const addToCart = () => {
  selectedProduct.value.discount_amount = Number(discountRs.value || 0);
  selectedProduct.value.discount_percentage =
    selectedProduct.value.discount_percentage || 0;

  if (!updateQty.value) {
    eventBus.emit("add-to-cart", selectedProduct.value);
  } else {
    selectedProduct.value.index = editingIndex.value;
    eventBus.emit("exist-item-cart", selectedProduct.value);
  }

  dialog.value = false;
  discountRs.value = "";
};

/* Close */
const closeDialog = () => {
  dialog.value = false;
};

/* Open Dialog Listener */
onMounted(() => {
  eventBus.on("open-product-dialog", (data) => {
    console.log("data received in product dialog ..", data);
    editingIndex.value = data.index ?? null;
    updateQty.value = data.flag;
    if(data.product.discount_amount>0){
      discountRs.value = data.product.discount_amount;
    } else {
      discountRs.value = "";
    }

    quantity.value = data.product.qty || 1;
    selectedProduct.value = JSON.parse(JSON.stringify(data.product));

    if (!selectedProduct.value.original_rate) {
      selectedProduct.value.original_rate = selectedProduct.value.rate;
    }
    dialog.value = true;
  });
});
</script>


<style scoped>
.text-h5 {
  font-size: 24px;
}

.text-h6 {
  font-size: 20px;
}

.grey--text {
  color: #9e9e9e;
}

.product-img {
  /* height: 537px; */
  position: relative;
  bottom: 81px;
}

.item-content {
  position: relative;
  bottom: 60px;
}

.item-name {
  font-size: 16px;
  font-weight: 800;
}

.item-price {
  font-size: 30px;
  font-weight: 700;
  color: #f69e7b;
}

.item-title {
  font-size: 12px;
  font-weight: 700;
}

.text-quantity {
  font-size: 35px;
  font-weight: 500;
}
</style>
