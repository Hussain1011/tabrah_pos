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
          <!-- Left side: Image and product details -->
          <v-col cols="5">
            <v-img :src="selectedProduct.image" alt="Product Image" height="580 " aspect-ratio="1" cover
              class="mb-4 product-img py-0"></v-img>
            <div class="py-0 item-content">
              <div class="item-name">
                {{ selectedProduct.item_name ? selectedProduct.item_name : "" }}
              </div>
              <div class="item-price" v-if="selectedProduct.custom_discounted_rate > 0"
                style=" text-decoration: line-through!important;color: grey;font-size: 0.9em;margin-right: 5px;">
                QAR.{{
                  selectedProduct.rate ? formatNumber(selectedProduct.rate) : ""
                }}
              </div>
              <div class="item-price" v-else>
                QAR.{{
                  selectedProduct.rate ? formatNumber(selectedProduct.rate) : ""
                }}
              </div>
              <div class="item-price" v-show="selectedProduct.custom_discounted_rate > 0">
                QAR.{{
                  selectedProduct.rate ? formatNumber(selectedProduct.custom_discounted_rate) : ""
                }}
              </div>
            </div>
          </v-col>

          <!-- Right side: Product specifications and actions -->
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

            <div class="mt-3 d-flex justify-between"></div>

            <div class="d-flex justify-between">
              <!-- <div class="black--text item-title">Embroidery Lawn Dupatta</div>
              <div>2.50 m</div> -->
            </div>

            <div class="d-flex justify-between">
              <!-- <div class="black--text item-title">Died Cambric Trouser</div>
              <div>2.50 m</div> -->
            </div>

            <v-divider class="mt-2 border-opacity-75 mx-6" :thickness="1" style="background-color: grey"></v-divider>

            <!-- Quantity selection and Add to Cart button -->
            <v-row class="my-4 align-center">
              <v-col cols="4" class="text-right">
                <v-btn variant="outlined" size="x-large" class="text-capitalize" color="#21A0A0"
                  style="background-color: #d3ecec; border-radius: 8px" @click="decreaseQuantity">-</v-btn>
              </v-col>
              <v-col cols="4" class="text-center">
                <div class="text-quantity black--text">{{ quantity }}</div>
                <v-divider class="mx-7 border-opacity-75" :thickness="2" style="background-color: black"></v-divider>
              </v-col>
              <v-col cols="4" class="text-left">
                <v-btn variant="outlined" size="x-large" class="text-capitalize" color="#21A0A0"
                  style="background-color: #d3ecec; border-radius: 8px" @click="increaseQuantity">+</v-btn>
              </v-col>
            </v-row>
            <v-row class="my-4 align-center">
              <v-col cols="12" class="text-right">
                <v-text-field class="b-radius-8" variant="outlined"
                  :label="`Discount (max ${pos_profile.posa_max_discount_allowed} %)`" v-model="discount" type="number"
                  :max="pos_profile.posa_max_discount_allowed" @update="validateDiscount"
                  :disabled="!pos_profile.posa_max_discount_allowed" />
              </v-col>
              <v-col cols="12" class="text-right" v-if="pos_profile.custom_enable_edit_rate_by_group && selectedProduct.item_group === pos_profile.custom_select_item_group_to_edit_rate">
                <v-text-field class="b-radius-8" variant="outlined"
                  label="Rate"
                  v-model="selectedProduct.rate"
                  type="number"
                  :min="0"
                  :disabled="false"
                />
              </v-col>
              <v-col cols="12" class="text-right">
                <v-text-field class="b-radius-8" variant="outlined"
                  :label="`Additional Comment`" v-model="itemComment" 
                  
                   />
              </v-col>
              <v-col cols="12" md="12" class="my-0">
                <v-checkbox v-model="complementaryItem" color="red" label="Complementary Item" @change="handleComplementaryToggle"
                  hide-details></v-checkbox>
              </v-col>
              <!-- <v-col cols="4" class="text-center">
                <div class="text-quantity black--text">{{ quantity }}</div>
                <v-divider
                  class="mx-7 border-opacity-75"
                  :thickness="2"
                  style="background-color: black"
                ></v-divider>
              </v-col>
              <v-col cols="4" class="text-left">
                <v-btn
                  variant="outlined"
                  size="x-large"
                  class="text-capitalize"
                  color="#21A0A0"
                  style="background-color: #d3ecec; border-radius: 8px"
                  @click="increaseQuantity"
                  >+</v-btn
                >
              </v-col> -->
            </v-row>

            <v-row>
              <v-col cols="12">
                <div class="font-weight-bold" style="margin-top: 24px !important">
                  Description
                </div>
                <div class="grey--text">
                  {{ selectedProduct.description }}
                </div>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-card-text>
      <div style="padding: 24px 32px 24px 32px; background: #fff; box-shadow: 0 -2px 8px rgba(0,0,0,0.03); z-index: 2;">
        <v-btn block size="x-large" color="#21A0A0" style="border-radius: 8px" @click="addToCart">
          ADD
        </v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import eventBus from "../../bus";

    const dialog = ref(false);
    const quantity = ref(1); // Initial quantity
    const selectedProduct = ref("");
    const updateQty = ref(false);
    const discount = ref("");
    const pos_profile = ref("");
    const complementaryItem = ref(false);
    const itemComment = ref('')
    const editingIndex = ref(null);

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
    const formatNumber = (num) => {
      return new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(num);
    };

    const addToCart = () => {
      if (discount.value <= pos_profile.value.posa_max_discount_allowed) {
        // Always sync complementary state before emitting
        selectedProduct.value.complementryItem = Boolean(complementaryItem.value);
        if (complementaryItem.value) {
          selectedProduct.value.rate = 0;
        }
        // Do NOT reset rate to original_rate if not complementary; preserve manual edits
        if (!updateQty.value) {
          eventBus.emit("add-to-cart", selectedProduct.value);
        } else {
          selectedProduct.value.index = editingIndex.value;
          eventBus.emit("exist-item-cart", selectedProduct.value);
        }
        complementaryItem.value = false;
        dialog.value = false;
        discount.value = "";
        // Only reset rate if complementary is checked, otherwise preserve manual edits
        if (complementaryItem.value) {
          selectedProduct.value.rate = selectedProduct.value.original_rate;
        }
      }
    };
    const closeDialog = () => {
      dialog.value = false;
      if (updateQty.value) {
        eventBus.emit("exist-item-cart", selectedProduct.value);
      }
    };
    // const validateDiscount = (value) => {
    //   const maxAllowed = pos_profile.value.posa_max_discount_allowed;
    //   if (value > maxAllowed) {
    //     discount.value = maxAllowed; // Limit the value to the maximum allowed
    //   } else {
    //     discount.value = value; // Allow valid input
    //   }
    // };
    const validateDiscount = () => {
      if (discount.value === "" || discount.value === null) {
        // If discount is cleared, reset the rate to the original rate
        selectedProduct.value.rate = selectedProduct.value.original_rate;
      } else if (discount.value > pos_profile.posa_max_discount_allowed) {
        // Emit an error message if the discount exceeds the allowed percentage
        eventBus.emit(
          "error-message",
          `Discount cannot exceed ${pos_profile.posa_max_discount_allowed}%`
        );
        discount.value = ""; // Clear the invalid discount
      } else {
        // If discount is valid, calculate and set the new rate
        const discountAmount =
          (selectedProduct.value.original_rate * discount.value) / 100;
        selectedProduct.value.rate =
          selectedProduct.value.original_rate - discountAmount;
      }
    };

    // Function triggered when checkbox is clicked
const handleComplementaryToggle = () => {
  if (complementaryItem.value) {
    // Save original rate if not already saved
    if (!selectedProduct.value.original_rate || selectedProduct.value.original_rate === 0) {
      selectedProduct.value.original_rate = selectedProduct.value.rate;
    }
    selectedProduct.value.rate = 0;
    selectedProduct.value.complementryItem = true;
  } else {
    // Do NOT reset rate to original_rate here; preserve manual edits
    selectedProduct.value.complementryItem = false;
  }
};

    watch(discount, (newVal) => {
      console.log("discount value", newVal);
      if (!selectedProduct.value.original_rate) {
        selectedProduct.value.original_rate = selectedProduct.value.rate;
      }
      if (discount.value === "" || discount.value === null) {
        // If discount is cleared, reset the rate to the original rate
        selectedProduct.value.rate = selectedProduct.value.original_rate;
      } else if (discount.value > pos_profile.value.posa_max_discount_allowed) {
        // Emit an error message if the discount exceeds the allowed percentage
        eventBus.emit("show_mesage", {
          text: `You are not allowed to apply a discount greater than ${pos_profile.value.posa_max_discount_allowed}%.`,
          color: "error",
        });
        discount.value = "";
      } else {
        // If discount is valid, calculate and set the new rate
        const discountAmount =
          (selectedProduct.value.original_rate * discount.value) / 100;
        selectedProduct.value.rate =
          selectedProduct.value.original_rate - discountAmount;
      }
    });
    watch(itemComment, (newVal) => {
      if(newVal){
        selectedProduct.value.comment=newVal
      }
    })
    // watch(complementaryItem, (newValue) => {
    //   if (newValue) {
    //     selectedProduct.value.rate = 0;
    //     selectedProduct.value.complementryItem = true;

    //     console.log("pos_profile", pos_profile.value);
    //     // Filter complementary mode
    //     const complementryMode = pos_profile.value.payments
    //       .filter(profile => profile.custom_is_complementary_mode_of_payment == 1)
    //       .map(profile => ({
    //         ...profile,
    //         amount: selectedProduct.value.original_rate // Add original amount
    //       }));

    //     console.log("complementryMode", complementryMode);
    //   } else {
    //     selectedProduct.value.rate = selectedProduct.value.original_rate;
    //     selectedProduct.value.complementryItem = false;

    //     // Reset the filtered complementary mode with zero amount
    //     const complementryMode = pos_profile.value.payments
    //       .filter(profile => profile.custom_is_complementary_mode_of_payment == 1)
    //       .map(profile => ({
    //         ...profile,
    //         amount: 0 // Set amount to zero
    //       }));

    //     console.log("complementryMode", complementryMode);
    //   }
    // });

    onMounted(() => {
      eventBus.on("open-product-dialog", (data) => {
        console.log('Dialog open:', {
          complementryItem: data.product.complementryItem,
          complementaryItemValue: Boolean(data.product.complementryItem)
        });
        editingIndex.value = data.index ?? null;
        updateQty.value = data.flag;
        quantity.value = data.product.qty ? data.product.qty : 1;
        data.product.qty = quantity.value;
        selectedProduct.value = JSON.parse(JSON.stringify(data.product));
        itemComment.value = data.product.comment || '';
        complementaryItem.value = Boolean(data.product.complementryItem);

        // Always set original_rate if not set, and if not complementary
        if (!selectedProduct.value.original_rate || selectedProduct.value.original_rate === 0) {
          if (!complementaryItem.value) {
            selectedProduct.value.original_rate = selectedProduct.value.rate;
          }
        }

        if (complementaryItem.value) {
          selectedProduct.value.rate = 0;
        } // else: do not reset rate, preserve manual edits
        if (selectedProduct.value) {
          dialog.value = true;
        }
      });

      eventBus.on("send_pos_profile", async (profile) => {
        console.log("pos-profile", profile);
        pos_profile.value = profile;
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
  font-size: 14px;
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
