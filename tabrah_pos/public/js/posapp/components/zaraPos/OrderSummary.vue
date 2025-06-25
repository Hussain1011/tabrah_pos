<template>
  <v-card elevation="1" class="border-16 summary-main-card">
    <v-card class="pa-6 m-3 order-card" style="background: #f4f4f4" elevation="0">
      <!-- Table Heading -->
      <v-row class="table-header">
        <v-col cols="5">
          <strong>ITEM</strong>
        </v-col>
        <v-col cols="3" class="mr-0">
          <strong>QTY.</strong>
        </v-col>
        <v-col cols="3">
          <strong>PRICE </strong>
        </v-col>
      </v-row>

      <!-- Image to show when items are empty -->
      <!-- <div v-else class="image-container">
        <img
          src="/assets/tabrah_pos/js/posapp/components/pos"
          alt="No items"
          class="animated-image"
          style=""
        />
      </div> -->

      <!-- Items List -->
      <v-divider></v-divider>
      <v-row v-for="(item, index) in items" :key="item.sku" class="py-0 align-center mr-0"
        @click="openDialog(item, true)">
        <v-col cols="5" class="pr-0 pb-0">
          <div>{{ item.item_name }}</div>
          <!-- <div class="text-caption grey--text">{{ item.sku }}</div> -->
          <div class="text-caption grey--text">{{ item.rate }}</div>
        </v-col>

        <v-col cols="2" class="text-center px-0 pb-0">
          {{ item.qty }}
        </v-col>

        <v-col cols="4" class="text-right teal--text text--accent-4 pb-0">
          <strong>QAR.{{ formatNumber(item.rate * item.qty) }}</strong>
        </v-col>

        <v-col cols="1" class="text-right pb-0" v-show="screen == 0">
          <!-- Delete icon -->
          <v-icon @click.stop="deleteItem(index)" color="red">mdi-delete</v-icon>
        </v-col>

        <v-col cols="12" class="py-0">
          <v-divider class="dotted-divider"></v-divider>
        </v-col>
      </v-row>
    </v-card>
    <!-- Persons field above customer select -->
    <v-row class="px-4">
      <v-col cols="12" class="mb-0">
        <v-text-field v-model="cover" label="Persons" type="number" min="1" max="99" variant="outlined" class="mr-2 mb-2"></v-text-field>
      </v-col>
    </v-row>
    <!-- Customer select row -->
    <v-row class="px-4">
      <v-col cols="8" class="" style="  height: 64px;">
        <v-select v-model="selectedCustomer" :items="customers" item-title="customer_name" item-value="name\t"
          label="Select Customer" variant="outlined" class="mr-2"></v-select>
      </v-col>
      <v-col cols="4" class="" style="  height: 64px;">
        <v-btn block class="white--text font-weight-bold payment-button" height="52" color="#21A0A0"
          @click="addNewCustomer()">
          <v-icon class="mr-2" style="color: white;">mdi-plus</v-icon>
          <p class="mt-2 payment-p">New</p>
        </v-btn>
      </v-col>
    </v-row>

    <v-row justify="center" class="pb-0">
      <v-col cols="12" md="12">
        <v-card class="pa-3 mx-3 payment-card" elevation="0" style="background: #f4f4f4">
          <!-- Order Summary Header -->
          <v-row justify="space-between" align="center" class="px-3 py-2">
            <v-col cols="6">
              <strong>Order Summary</strong>
            </v-col>
            <!-- <v-col cols="6" class="text-right">
              <strong>#1200569C</strong>
            </v-col> -->
          </v-row>

          <v-divider class="mb-3"></v-divider>

          <!-- Order Details -->
          <!-- 
          <v-row justify="space-between" class="px-6 py-0">
            <v-col cols="4" class="py-0 payment-text-color">Total items:</v-col>
            <v-col cols="4">
              <v-divider class="dotted-divider"></v-divider>
            </v-col>
            <v-col cols="4" class="text-right py-0 payment-text-color">
              {{ totalItems }}
            </v-col>
          </v-row> -->
          <v-row justify="space-between" class="px-6 pb-0">
            <v-col cols="4" class="py-0 payment-text-color">Total Quantity:</v-col>
            <v-col cols="4">
              <v-divider class="dotted-divider" :thickness="3"></v-divider>
            </v-col>
            <v-col cols="4" class="text-right py-0 payment-text-color">
              {{ totalQuantity }}
            </v-col>
          </v-row>
          <v-row justify="space-between" class="px-6 py-0">
            <v-col cols="4" class="pb-0 payment-text-color">Net Total:</v-col>
            <v-col cols="4">
              <v-divider class="mt-3 dotted-divider" :thickness="3"></v-divider>
            </v-col>
            <v-col cols="4" class="text-right pb-0 payment-text-color">
              QAR. {{ formatNumber(netTotal) }}
            </v-col>
          </v-row>

          <v-row justify="space-between" class="px-6 py-0">
            <v-col cols="4" class="py-0 payment-text-color">GST {{ selectedPaymentMode.tax_rate }}%:</v-col>
            <v-col cols="4">
              <v-divider class="dotted-divider" :thickness="3"></v-divider>
            </v-col>
            <v-col cols="4" class="text-right py-0 payment-text-color">
              QAR. {{ formatNumber(gstAmount) }}
            </v-col>
          </v-row>
          <v-row justify="space-between" class="px-6 py-0" v-if="returnType">
            <v-col cols="4" class="py-0 payment-text-color">Advance Paid:</v-col>
            <v-col cols="4">
              <v-divider class="dotted-divider" :thickness="3"></v-divider>
            </v-col>
            <v-col cols="4" class="text-right py-0 payment-text-color">
              QAR. {{ advanceAmount }}
            </v-col>
          </v-row>
          <v-row justify="space-between" class="px-6 py-0" v-else>
            <v-col cols="4" class="py-0 payment-text-color">Discounts:</v-col>
            <v-col cols="4">
              <v-divider class="dotted-divider" :thickness="3"></v-divider>
            </v-col>
            <v-col cols="4" class="text-right py-0 payment-text-color">
              QAR.0.00
            </v-col>
          </v-row>


          <!-- Grand Total -->
          <v-row justify="space-between" class="mt-4 px-6 pb-0">
            <v-col cols="6">
              <p class="font-20">Grand Total:</p>
            </v-col>
            <v-col cols="6" class="text-right total-amount">
              <p class="total-p">QAR. {{ formatNumber(grandTotal) }}</p>
            </v-col>
          </v-row>

          <!-- Payment Button -->
         <v-row class="mt-3 px-6 pb-1">
            <v-col cols="12">
              <v-btn
                block
                class="white--text font-weight-bold payment-button"
                height="48"
                color="#21A0A0"
                @click="goForPayment"
                :loading="loadingBtn"
              >
                <p class="mt-2 payment-p">PAYMENT</p>
              </v-btn>
            </v-col>
          </v-row>
          <v-row class="mt-3 px-6 pb-1">
            <v-col cols="4">
              <v-btn
                block
                class="white--text font-weight-bold payment-button"
                height="48"
                color="#21A0A0"
                @click="holdOrder()"
                :loading="loadingBtn"
              >
                <p class="mt-2 payment-p">Hold</p>
              </v-btn>
            </v-col>
            <v-col cols="4">
              <v-btn
                block
                class="white--text font-weight-bold payment-button"
                height="48"
                color="#F05D23"
                @click="createPreInvoice()"
                :disabled="screen != 0"
              >
                <p class="mt-2 print-p">Pre Invoice</p>
              </v-btn>
            </v-col>
            <v-col cols="4">
              <v-btn
                block
                class="white--text font-weight-bold payment-button"
                height="48"
                color="#F05D23"
                @click="generateKotPrint()"
                :disabled="screen != 0"
              >
                <p class="mt-2 print-p">KOT Print</p>
              </v-btn>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>

    <!-- Return dialog -->
    <v-dialog v-model="dialog" max-width="800px" persistent>
      <v-card>
        <!-- Dialog Title -->
        <v-card-title class="d-flex justify-space-between pt-5">
          <span class="text-h6">Select Return Invoice</span>
          <v-icon @click="closeReturnDialog()">mdi-close</v-icon>
        </v-card-title>
        <!-- Search Field -->
        <v-card-title class="d-flex justify-space-between pt-1">
          <v-text-field v-model="search" label="Search" variant="outlined" clearable class="mx-4 my-2"
            append-inner-icon="mdi-magnify"></v-text-field>
          <v-btn class="white--text font-weight-bold payment-button mt-3" height="48" color="#F05D23"
            @click="searchReturnInvoice()" :loading="loadingBtn">
            <p class="mt-2 ">Search</p>
          </v-btn>
        </v-card-title>

        <!-- Table -->
        <v-data-table :headers="headers" :items="returnItems" class="elevation-0 mx-4" hide-default-footer>
          <template #item.customer="{ item }">
            <span>{{ item.customer }}</span>
          </template>
        </v-data-table>

        <!-- Actions -->
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" @click="dialog = false">Close</v-btn>
          <v-btn v-if="returnItems.length > 0" color="#009688" @click="loadReturn()"
            :loading="submitLoading">Submit</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>


    <!-- return Dialog -->

    <v-dialog v-model="returnDialog" max-width="741px" height="820" persistent>
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
                  @click="closeReturnDialog()">
                  <v-icon>mdi-close</v-icon>
                </v-btn>
              </v-card-title>
            </v-col>
          </v-row>
        </v-card-title>
        <v-card-text>
          <v-row justify="center" class="" style="    padding-left: 100px;">
            <v-radio-group v-model="returnType" color="#21A0A0" inline>
              <v-radio label="Exchange" value="exchange" @click.stop="returnType = 'exchange'"></v-radio>
              <v-radio label="Return" value="return" @click.stop="returnType = 'replace'"
                style="    margin-left: 153px;"></v-radio>
            </v-radio-group>
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
                        <div class="" style="color: #666666;">{{ returnDoc.name }}</div>
                        <v-chip color="#21A0A0" size="small">
                          Completed
                        </v-chip>

                      </div>
                      <p class="mt-1 px-2" style="font-size: 18px;font-weight: 700; color: #666666;">
                        QAR. {{ formatNumber(grandTotal) }}
                      </p>
                    </div>

                    <div class="d-flex py-4 mb-2"
                      style="border-top: 1px solid #D5D5D5;border-bottom: 1px solid #D5D5D5;">
                      <img src="/assets/tabrah_pos/js/posapp/components/pos/account.png" alt="" class=""
                        style="width: 35px;" />
                      <p class="mt-2 ml-2"></p>
                      <span style="border: 1px solid #D5D5D5;margin-left: 70px;"></span>
                      <img src="/assets/tabrah_pos/js/posapp/components/pos/posImg.png" alt="" class="ml-2"
                        style="width: 35px;" />
                      <p class="mt-2 ml-2">{{ returnDoc.pos_profile }}</p>
                    </div>

                    <div class="d-flex  my-3" style="">
                      <img src="/assets/tabrah_pos/js/posapp/components/pos/receipt_long.png" alt="" class=""
                        style="width: 35px;" />
                      <p class="ml-2 mt-2 text-grey">
                        <!-- Display items with "+x more" if more than 6 items -->
                        {{
                          items
                            .slice(0, 6)
                            .map((item) => item.item_name)
                            .join(", ")
                        }}<span v-if="items.length > 6">, +{{ items.length - 6 }} more</span>
                      </p>
                    </div>





                  </v-card-text>
                </v-card>

              </div>
              <div class="px-0 pt-7" style="max-height: 350px; overflow-y: auto;">
                <v-row v-for="(item, index) in returnDoc.items" :key="item.sku" class="py-0 align-center mr-0 "
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
                      <strong>QAR.{{ item.rate * item.qty }}</strong>
                    </v-col>
                    <v-col cols="1" class="text-right pb-0" v-show="returnDoc.items.length > 1">
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
                  @click="goForReturnProceed" :loading="submitLoading" style="width: 321px;">
                  <p class="mt-2 payment-p">Proceed</p>
                </v-btn>
              </div>

              <div class="pt-5 d-flex justify-center">
                <v-btn class="white--text font-weight-bold " height="52" variant="text" @click="closeReturnDialog"
                  :loading="loadingBtn" :disabled="loadingBtn" style="width: 321px;">
                  <p class="mt-2 payment-p">Cancel</p>
                </v-btn>
              </div>


            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Add Customer -->
    <v-dialog v-model="showDialog" max-width="500px">
      <v-card style="border-radius: 24px;">
        <!-- Dialog Header -->
        <v-card-title class="d-flex justify-center align-center mt-2">
          <div class="d-flex align-center gap-2">
          </div>
          <div class="d-flex align-center gap-2">
            <v-icon color="#3D464D">mdi-account-plus</v-icon>
            <span style="color: #3D464D; font-size: 15px;font-weight: 500;" class="ml-2">Add Customer</span>
          </div>
          <div style="background: #F05D23;
              height: 21px;
              border-radius: 15px;
              position: relative;
              left: 139px;">
            <v-icon color="white" size="20px" @click="closeCustomerDialog" style="position: relative;
              bottom: 7px;">mdi-close</v-icon>

          </div>
        </v-card-title>

        <!-- Dialog Content -->
        <v-card-text class="px-15">
          <v-form ref="form" v-model="isFormValid">
            <v-text-field v-model="formData.name" label="Name" outlined required
              :rules="[rules.required]"></v-text-field>

            <v-text-field v-model="formData.phone" label="Phone Number" outlined required
              :rules="[rules.required]"></v-text-field>

            <v-text-field v-model="formData.email" label="Email Address" outlined></v-text-field>

            <v-text-field v-model="formData.address" label="Postal Address" outlined></v-text-field>

            <!-- Submit Button -->
            <v-btn block class="white--text font-weight-bold payment-button" height="45" color="#21A0A0"
              @click="submitCustomerDialog" :disabled="!isFormValid" :loading="customerLoading">
              Add Customer
            </v-btn>
          </v-form>

          <!-- Note Section -->
          <!-- <div class="mt-4 text-center">
            <span class="caption">
              NOTE: Looking for an existing customer?
              <a href="#" class="text-decoration-underline">Re-Call Customer</a>
            </span>
          </div> -->
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-dialog v-model="pindialog" max-width="400" persistent>
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <span class="text-h6">Enter Pin</span>
          <v-icon @click="pindialog = false" class="cursor-pointer">mdi-close</v-icon>
        </v-card-title> <v-card-text>
          <div class="text-center">
            <v-otp-input v-model="otp" type="password" :loading="pinloading" length="5"></v-otp-input>
          </div>
        </v-card-text>

        <v-card-actions class="justify-end">
          <v-btn text="Cancel" @click="pindialog = false"></v-btn>
          <v-btn :disabled="otp.length < 5 || pinloading" color="primary" text="Submit"
            @click="checkAuthAccess"></v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup>
import {
  ref,
  onMounted,
  computed,
  watch,
  onUnmounted,
  onBeforeUnmount,
} from "vue";
import eventBus from "../../bus.js";
import indexedDBService from "../../indexedDB";
import { printPreInvoice } from "../../preinvoice";
import { printKot } from "../../kotPrint.js";

const items = ref([
  // {
  //   name: "Gul Bahaar",
  //   sku: "SKU:10145687-c12",
  //   qty: 1,
  //   rate: "Rs. 270,000/-",
  //   netTotal: "Rs. 270,000/-",
  // },
]);

const paymentModes = ref([
  // {
  //   type: "Card",
  //   icon: "mdi-credit-card",
  //   selected:false
  // },
  // {
  //   type: "Cash",
  //   icon: "mdi-cash",
  //   selected:true
  // },
  // {
  //   type: "Transfer",
  //   icon: "mdi-swap-horizontal",
  //   selected:false
  // },
]);
const selectedCustomer = ref('');
const customers = ref([
  // Example customer list
  // { text: "John Doe", value: 1 },
  // { text: "Jane Smith", value: 2 },
  // { text: "Alice Johnson", value: 3 },
]);
const showDialog = ref(false); // Control the dialog visibility
const isFormValid = ref(false); // Form validation state
const customerLoading = ref(false); // Form validation state


// Form data
const formData = ref({
  name: "",
  phone: "",
  email: "",
  address: "",
});

// Validation rules
const rules = {
  required: (value) => !!value || "This field is required",
  email: (value) => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return !value || pattern.test(value) || "Invalid email address";
  },
  phone: (value) => {
    const pattern = /^[0-9]{10}$/;
    return pattern.test(value) || "Invalid phone number";
  },
};
const pos_profile = ref("");
const pos_opening_shift = ref("");
const invoice_doc = ref({});
const invoiceItems = ref([]);
const selectedPaymentMode = ref("");
const loadingBtn = ref(false);
const saleOrder = ref(false);
const loadingHold = ref(false);
const saleOrderDetail = ref("");
const selectedOrderType = ref("");
const offlineMode = ref(false);
const punching = ref("completed");
const screen = ref(0);
const speedMbps = ref(null); // Measured internet speed in Mbps
const getSpeedRes = ref(false);
const holdOrderId = ref(null);
const dialog = ref(false);
const exchangeItem = ref(false);
const submitLoading = ref(false);
const search = ref("");
const returnDoc = ref("");
const returnType = ref("");
const selectedTable = ref("");
const advanceAmount = ref(0)
const orderBy = ref("");
const allowedDelete = ref(true);
const pindialog = ref(false);
const otp = ref("");
const pinloading = ref(false);
const cover = ref(1); // Default to 1 person

const grandTotalCard = computed(() => {
  return grandTotal.value; // Default to grand total, can be customized based on card payment logic
});
const orderType = ref([]);

const selected = ref([]);
const headers = [
  { title: "Customer", value: "customer" },
  { title: "Date", value: "due_date" },
  { title: "Invoice", value: "name" },
  { title: "Amount", value: "total" },
];
const returnItems = ref([]);
const returnDialog = ref(false);
const returnitems = ref([
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



const totalQuantity = computed(() => {
  return items.value.reduce((acc, item) => acc + item.qty, 0);
});
const totalItems = computed(() => items.value.length);

// const netTotal = ref(0);
// const gstAmount = ref(0);
// const grandTotal = ref(0);

const netTotal = computed(() => {
  const total = items.value.reduce((acc, item) => acc + item.netTotal, 0);
  let taxrate = selectedPaymentMode.value?.tax_rate / 100 || 0;

  // Calculate GST amount with the correct tax rate
  const gstAmount = parseFloat((total * taxrate).toFixed(2));
  let taxIncludeNetamount = 0;
  if (pos_profile.value.posa_tax_inclusive) {
    taxrate = 1 + selectedPaymentMode.value?.tax_rate / 100 || 0;
    taxIncludeNetamount = total / taxrate;
  }

  // If posa_tax_inclusive is true, subtract GST amount from total
  const finalAmount = pos_profile.value.posa_tax_inclusive
    ? taxIncludeNetamount
    : total;
  return finalAmount;
});

const gstAmount = computed(() => {
  const total = items.value.reduce((acc, item) => acc + item.netTotal, 0);
  let taxrate = selectedPaymentMode.value?.tax_rate / 100 || 0;

  // Calculate GST amount with the correct tax rate
  let gstAmount = parseFloat((total * taxrate).toFixed(2));
  if (pos_profile.value.posa_tax_inclusive) {
    taxrate = 1 + selectedPaymentMode.value?.tax_rate / 100 || 0;
    taxIncludeNetamount = total / taxrate;
    gstAmount = total - taxIncludeNetamount;
  }

  return gstAmount; // 16% GST
});
const grandTotal = computed(() => {
  return netTotal.value + gstAmount.value;
});
// watch(
//   items,
//   (newVal) => {
//     if (newVal) {
//       const total = items.value.reduce(
//         (acc, item) => acc + item.netTotal,
//         0
//       );
//       const taxRate = (selectedPaymentMode.value?.tax_rate || 0) / 100;

//       if (pos_profile.value.posa_tax_inclusive) {
//         // Tax-Inclusive Calculations
//         const taxDivisor = 1 + taxRate;
//         netTotal.value = parseFloat((total / taxDivisor).toFixed(2)); // Net total excluding tax
//         gstAmount.value = parseFloat((total - netTotal.value).toFixed(2)); // GST amount
//         grandTotal.value = total; // Grand total remains the original total
//       } else {
//         // Tax-Exclusive Calculations
//         netTotal.value = parseFloat(total.toFixed(2)); // Net total is the sum of all items
//         gstAmount.value = parseFloat((total * taxRate).toFixed(2)); // GST amount
//         grandTotal.value = parseFloat(
//           (netTotal.value + gstAmount.value).toFixed(2)
//         ); // Grand total
//       }
//     }
//   },
//   { deep: true } // Ensures nested changes in objects are tracked
// );
const formatNumber = (num) => {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
};
const addNewCustomer = () => {
  showDialog.value = true;
}
const checkAuthAccess = () => {
  const isMatch = pos_profile.value.employee_list.some((emp) => emp.pin_for_pos === parseInt(otp.value));
  if (isMatch) {
    allowedDelete.value = true;
    pindialog.value = false;
    otp.value = ''
  }
  else {
    eventBus.emit("show_mesage", {
      text: "Invalid Pin. Please try again!",
      color: "error",
    });
  }

  pinloading.value = false;

};

const submitCustomerDialog = async () => {
  try {
    const args = {
      customer_id: '',
      customer_name: formData.value.name,
      company: pos_profile.value.company,
      mobile_no: formData.value.phone,
      email_id: formData.value.email,
      customer_group: pos_profile.value.customer_groups[0].customer_group,
      method: 'create',
      pos_profile_doc: pos_profile.value,
    };
    customerLoading.value = true
    const response = await frappe.call({
      method: "tabrah_pos.tabrah_pos.api.posapp.create_customer",
      args: args,
    });
    console.log("res", response)
    if (response.message) {
      eventBus.emit("show_mesage", {
        text: `Customer created successfully...`,
        color: "success",
      });
      frappe.utils.play_sound('submit');
      closeCustomerDialog();
    } else {
      frappe.utils.play_sound('error');
      eventBus.emit("show_mesage", {
        text: `Customer creation failed.`,
        color: "success",
      });
    }
    getCustomerNames(pos_profile.value)
    customerLoading.value = false
  } catch (error) {
    customerLoading.value = false
    console.error("Error fetching invoice document:", error);
  }
};
const closeCustomerDialog = () => {
  showDialog.value = false;
  formData.value = {
    name: '',
    phone: '',
    email: '',
    address: ''
  };
}
const getCustomerNames = (profile) => {
  frappe.call({
    method: 'tabrah_pos.tabrah_pos.api.posapp.get_customer_names',
    args: {
      pos_profile: profile,
    },
    callback: (response) => {
      if (response.message) {
        const customerData = response.message;
        customers.value = customerData;
        // customers.value = customerData;
        // if (pos_profile.value.posa_local_storage) {
        //   localStorage.setItem('customer_storage', '');
        //   localStorage.setItem('customer_storage', JSON.stringify(customerData));
        // }
      }
    },
  });
};
const changePaymentMode = (mode) => {
  selectedPaymentMode.value = mode;
  paymentModes.value.forEach((item) => {
    if (item == mode) {
      item.selected = true;
    } else {
      item.selected = false;
    }
  });
};
const openDialog = (product, flag) => {
  if (!saleOrder.value) {
    const obj = {
      product,
      flag,
    };
    eventBus.emit("open-product-dialog", obj);
  }
};
const generateKotPrint = async () => {
    if (items.value.length > 0) {
    // --- KOT PRINTED ITEMS LOGIC START ---
    const heldOrders = JSON.parse(localStorage.getItem("heldOrders")) || [];
    const currentOrder = heldOrders.find(order => order.id === holdOrderId.value);
    let printedItems = {};
    if (currentOrder) {
      printedItems = { ...(currentOrder.printed_items || {}) };
    }
    // Only print items that haven't been printed before or have new quantities
    let itemsToPrint = items.value.filter(item => {
      const printedQty = printedItems[item.item_code]?.qty || 0;
      // Exclude beverages and juices (case-insensitive)
      const group = (item.item_group || '').toLowerCase();
      if (group === 'beverages' || group === 'juices') return false;
      return item.qty > printedQty;
    });
    if (itemsToPrint.length === 0) {
      eventBus.emit("show_mesage", {
        text: "You printed these items already.",
        color: "error",
      });
      return;
    }
    const doc = await get_invoice_doc();
    doc.grand_total = grandTotal.value
    doc.gstAmountCash = gstAmount.value
    doc.cover = cover.value; // Add cover to KOT print
    const now = new Date();
    doc.date = now.toISOString().split('T')[0];
    doc.time = now.toLocaleTimeString('en-US', { hour12: false });
    // Calculate KOT items with proper quantities
    doc.kot_items = itemsToPrint.map(item => {
      let finalQty;
      const hasBeenPrinted = printedItems[item.item_code] !== undefined;
      if (!hasBeenPrinted) {
        // If item has never been printed, use full quantity
        finalQty = item.qty;
      } else {
        // If item has been printed before, use the difference
        const printedQty = printedItems[item.item_code].qty;
        finalQty = item.qty - printedQty;
      }
      return {
        item_name: item.item_name,
        qty: finalQty,
        rate: item.rate,
        comment: item.comment || "",
        product_bundle: item.product_bundle
      };
    });
    // Create a new doc object with only the filtered items for printing
    const printDoc = {
      ...doc,
      items: doc.kot_items // Use kot_items instead of all items
    };
    // Update printedItems for items being printed
    itemsToPrint.forEach(item => {
      printedItems[item.item_code] = {
        qty: item.qty,
        timestamp: new Date().toISOString(),
      };
    });
    // Pass only the updated printedItems (merged) to holdOrder
    holdOrder(printedItems);
    printKot(printDoc);
  }
};
const createPreInvoice = async () => {
  if (items.value.length === 0) return;

  const doc = get_invoice_doc();

  console.log("doc-------", doc);

  // Assigning totals
  doc.grand_total = grandTotal.value;
  doc.gstAmountCash = gstAmount.value;
  doc.grand_total_card = grandTotalCard.value;
  doc.cover = cover.value; // Add cover to pre-invoice

  // Constructing cart items
  doc.cart_items = items.value.map(item => ({
    item_name:!item.bundle_doc ? item.item_name
    : !item.bundle_doc.items
      ? item.bundle_doc.item_name
      : item.bundle_doc.items.length === 0
        ? item.item_name
        : item.bundle_doc.custom_parent_item_name,
    qty: item.qty,
    rate: item.rate,
    item_group: !item.bundle_doc ? item.item_group
    : !item.bundle_doc.items
      ? item.bundle_doc.item_group
        : item.bundle_doc.items.length === 0
          ? item.item_group
            : item.bundle_doc.items[0]?.custom_item_group || item.item_group || item.custom_item_group,
    amount: item.rate * item.qty,
    bundle_items: (item.bundle_doc?.items || []).map(bundleItem => ({
      item_name: bundleItem.custom_item_name,
      rate: bundleItem.rate,
      item_group: bundleItem.custom_item_group
    }))
  }));



  // Proceed with printing and holding order
  printPreInvoice(doc);
  holdOrder();
};
const goForReturnProceed = () => {
  if (returnType.value) {
    if (returnType.value == "return") {
      submitReturn()
    }
    else {
      returnDialog.value = false
      exchangeItem.value = true
      console.log("returntype", returnType.value)
      let advancePayment = grandTotal.value
      advanceAmount.value = advancePayment
      items.value = []

    }

  }
  else {
    eventBus.emit("show_mesage", {
      text: "Please select return type",
      color: "error",
    });
  }
}
const openReturnDialog = () => {
  dialog.value = true;
};
const closeReturnDialog = () => {
  dialog.value = false;
  returnItems.value = [];
  search.value = [];
  items.value = []
  returnDialog.value = false
  advanceAmount.value = 0
  exchangeItem.value = false
  returnType.value = ''
};
const searchReturnInvoice = async () => {
  try {
    const response = await frappe.call({
      method: "tabrah_pos.tabrah_pos.api.posapp.search_invoices_for_return",
      args: {
        company: pos_profile.value.company,
        invoice_name: search.value,
      },
    });

    if (response && response.message) {
      console.log("returnItems", response);
      returnItems.value = response.message;
    }
  } catch (error) {
    console.error("Error fetching invoice document:", error);
  }
};
const loadReturn = async () => {
  returnDoc.value = returnItems.value[0];
  console.log("selected", returnDoc.value);
  dialog.value = false
  returnDoc.value.items.forEach((item) => {
    item.netTotal = item.rate * item.qty;
  })
  items.value = returnDoc.value.items
  returnDialog.value = true;

}
const submitReturn = async () => {
  submitLoading.value = true;
  const doc = returnItems.value[0];
  doc.items = items.value
  try {
    const response = await frappe.call({
      method: "tabrah_pos.tabrah_pos.api.posapp.create_sales_return",
      args: {
        invoice: doc,

      },
      async: true,
    });

    if (response) {
      load_print_page(response.message.return_invoice)
      eventBus.emit("show_mesage", {
        text: "Return Invoice Created Successfully",
        color: "success",
      });

      submitLoading.value = false;
      closeReturnDialog();

    }
  } catch (error) {
    console.log("error...", error);
    submitLoading.value = false;
  }
};
const load_print_page = (invoice) => {
  const print_format =
    pos_profile.value.print_format_for_online || pos_profile.value.print_format;
  const letter_head = pos_profile.value.letter_head || 0;
  const formattedValue = getFormattedPrintFormat();

  const url =
    frappe.urllib.get_base_url() +
    "/printview?doctype=Sales%20Invoice&name=" +
    invoice +
    "&trigger_print=1" +
    "&format=" +
    formattedValue +
    "&no_letterhead=" +
    letter_head;
  console.log("Print-url", url);

  const printFrame = document.getElementById("printFrame");
  printFrame.src = url;

  printFrame.onload = function () {
    printFrame.contentWindow.focus();
    printFrame.contentWindow.print();
  };
};
const getFormattedPrintFormat = () => {
  const printFormat = pos_profile.value.print_format || "";
  return encodeURIComponent(printFormat.trim());
};
const holdOrder = (printedItems = {}) => {
  if (items.value.length > 0) {
    loadingHold.value = true; // Start loading indicator

    // Retrieve held orders from localStorage
    const heldOrders = JSON.parse(localStorage.getItem("heldOrders")) || [];

    if (holdOrderId.value) {
      // Update existing order if holdOrderId is present
      const existingOrderIndex = heldOrders.findIndex(
        (order) => order.id === holdOrderId.value
      );

      if (existingOrderIndex !== -1) {
        // Merge previous printed_items with new ones (only update those printed now)
        const prevPrinted = heldOrders[existingOrderIndex].printed_items || {};
        const mergedPrinted = { ...prevPrinted, ...printedItems };
        heldOrders[existingOrderIndex] = {
          ...heldOrders[existingOrderIndex],
          items: items.value,
          grand_total: grandTotal.value,
          timestamp: new Date().toISOString(),
          printed_items: mergedPrinted,
          cover: cover.value, // Save persons in hold order
        };
        console.log(
          `Order updated successfully: ${heldOrders[existingOrderIndex].id}`
        );
      } else {
        console.warn(`Order with ID ${holdOrderId.value} not found.`);
      }
    } else {
      // Create a new order if no holdOrderId    is present
      const employee = pos_profile.value.employee_list.find(emp => emp.employee === orderBy.value) || '';
      console.log("orderby....", employee)
      const nextOrderId = `Hold-Order-${heldOrders.length + 1}`;
      const currentOrder = {
        id: nextOrderId,
        items: items.value,
        grand_total: grandTotal.value,
        table: selectedTable.value,
        orderBy: orderBy.value,
        orderByName: employee.employee_name,
        timestamp: new Date().toISOString(),
        printed_items: { ...printedItems },
        cover: cover.value, // Save persons in hold order
      };
      heldOrders.push(currentOrder);
      console.log("Order held successfully:", currentOrder);
      updateTableStatus(selectedTable.value, "Reserved");
    }

    // Update localStorage with the modified held orders
    localStorage.setItem("heldOrders", JSON.stringify(heldOrders));

    // Clear the current order for a new one
    items.value = [];
    cover.value = 0; // Clear persons field after hold order
    loadingHold.value = false; // Stop loading indicator
    eventBus.emit("open-product-menu");
    eventBus.emit("set-default-value");
  }
};

const updateTableStatus = async (table, status) => {
  if (table) {
    try {
      const response = await frappe.call({
        method:
          "tabrah_pos.tabrah_pos.api.posapp.update_table_status",
        args: {
          table_name: table,
          status: status
        },
      });

      if (response && response.message) {
        eventBus.emit("reserved-table", selectedTable.value);
      }
    } catch (error) {
      console.error("Error updating invoice from order:", error);
    }
  }

};


const goForPayment = async () => {
  // eventBus.emit("go-for-payment");
  if (items.value.length > 0) {
    if (saleOrder.value) {
      const invoice_doc = await processInvoiceFromOrder();
      invoice_doc.value = invoice_doc;
    } else {
      // loadingBtn.value = true;
      const doc = get_invoice_doc();
      console.log("doc-payload-ready", doc);
      invoice_doc.value = doc;
      if (!exchangeItem.value) {

        if (!selectedCustomer.value) {
          eventBus.emit("show_mesage", {
            text: `Please select customer first..`,
            color: "error",
          });
          return;
        }
        paymentProcess(invoice_doc.value);
      }
      else {
        if (grandTotal.value >= advanceAmount.value) {
          paymentProcess(invoice_doc.value);
        }
        else {
          eventBus.emit("show_mesage", {
            text: "Please select item that amount is greater than advance amount or equal",
            color: "error",
          });
        }

      }

    }
    cover.value = 0; // Clear persons field after payment
  }
};
const paymentProcess = (doc) => {
  let grandTotalValue = grandTotal.value;
  doc.total = grandTotalValue;
  doc.net_total = netTotal.value.toFixed(2);
  doc.grand_total = grandTotalValue;
  doc.rounded_total = Math.ceil(grandTotalValue);
  doc.total_taxes_and_charges = gstAmount.value.toFixed(2);
  eventBus.emit("go-for-payment");
  eventBus.emit("updated-invoice", invoice_doc.value);
};

const processInvoiceFromOrder = async () => {
  // Fetch the invoice document
  const doc = await getInvoiceFromOrderDoc();

  // Set additional discount percentage
  // doc.additional_discount_percentage = Number(additionalDiscountPercentage.value);

  // Update or create the invoice based on the presence of `doc.name`
  if (doc.name) {
    return await updateInvoiceFromOrder(doc);
  } else {
    return updateInvoiceFromOrder(doc);
  }
};
const getInvoiceFromOrderDoc = async () => {
  let doc = {};
  try {
    const response = await frappe.call({
      method:
        "tabrah_pos.tabrah_pos.api.posapp.create_sales_invoice_from_order",
      args: {
        sales_order: saleOrderDetail.value.name,
      },
    });

    if (response && response.message) {
      doc = response.message;
    }
  } catch (error) {
    console.error("Error fetching invoice document:", error);
  }

  return doc;
};
const updateInvoiceFromOrder = async (doc) => {
  try {
    const response = await frappe.call({
      method:
        "tabrah_pos.tabrah_pos.api.posapp.update_invoice_from_order",
      args: {
        data: doc,
      },
    });

    if (response && response.message) {
      invoice_doc.value = response.message;
      eventBus.emit("go-for-payment");
      eventBus.emit("updated-invoice", invoice_doc.value);
    }
  } catch (error) {
    console.error("Error updating invoice from order:", error);
  }

  return invoice_doc.value;
};

const get_invoice_doc = () => {
  let doc = {};
  if (invoice_doc.value?.name) {
    doc = { ...invoice_doc.value };
  }
  doc.doctype = "Sales Invoice";
  doc.is_pos = 1;
  doc.ignore_pricing_rule = 1;
  doc.company = doc.company || pos_profile.value.company;
  doc.pos_profile = doc.pos_profile || pos_profile.value.name;
  doc.campaign = doc.campaign || pos_profile.value.campaign;
  doc.currency = doc.currency || pos_profile.value.currency;
  doc.naming_series = doc.naming_series || pos_profile.value.naming_series;
  doc.customer = selectedCustomer.value || pos_profile.value.customer;
  doc.items = invoiceItems.value;
  doc.total = netTotal.value;
  doc.discount_amount = 0;
  doc.additional_discount_percentage = 0;
  doc.posa_pos_opening_shift = pos_opening_shift.value.name;
  doc.payments = get_payments();
  doc.taxes = [];
  doc.is_return = "";
  doc.return_against = "";
  doc.posa_offers = [];
  doc.posa_coupons = [];
  doc.posa_delivery_charges = "";
  doc.posa_delivery_charges_rate = 0;
  doc.posting_date = getCurrentDate();
  doc.table_no = selectedTable.value || "";
  doc.resturent_type = selectedOrderType.value;
  // doc.order_summery_for_pos = orderItems.value;
  doc.cost_center = pos_profile.value.cost_center;
  doc.custom_invoice_status = "On Hold";
  (doc.total_qty = totalQuantity.value),
    (doc.holdOrderId = holdOrderId.value ? holdOrderId.value : "");
  doc.advanceAmount = advanceAmount.value;
  doc.exchangeItem = exchangeItem.value
  doc.returnDoc = returnDoc.value
  doc.cover = cover.value; // Add cover to invoice_doc
  return doc;
};
const get_payments = () => {
  const payments = [];
  // Filter payments by custom_order_type matching the selected order type
  pos_profile.value.payments
    .filter(
      (payment) => payment.custom_order_type === selectedOrderType.value
    )
    .forEach((payment) => {
      payments.push({
        amount: 0,
        mode_of_payment: payment.mode_of_payment,
        mode_type: payment.mode_type,
        default: payment.default,
        account: "",
        type: payment.mode_type,
        custom_is_exchange_mode: payment.custom_is_exchange_mode
      });
    });

  return payments;
};
// const get_payments = () => {
//   const payments = [];
//   pos_profile.value.payments.forEach((payment) => {
//     payments.push({
//       amount: 0,
//       mode_of_payment: payment.mode_of_payment,
//       default: payment.default,
//       account: "",
//     });
//   });
//   return payments;
// };
const getCurrentDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0"); // Months are zero-indexed, so we add 1
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
const onEnterKey = (event) => {
  if (items.value.length > 0 && !loadingBtn.value) {
    goForPayment();
  }
};

const update_invoice = (doc, key, print) => {
  if (
    navigator.onLine &&
    !offlineMode.value &&
    !loadingBtn.value &&
    screen.value == 0
  ) {
    // const cleanedDoc = JSON.parse(JSON.stringify(toRaw(doc)));
    frappe.call({
      method: "tabrah_pos.tabrah_pos.api.posapp.update_invoice",
      args: {
        data: doc,
      },
      async: false,
      callback: function (r) {
        if (r.message) {
          console.log("Online Invoice draft", r.message);
          invoice_doc.value = r.message;
          invoice_doc.value.custom_invoice_status = "On Hold";
          loadingBtn.value = false;
          eventBus.emit("go-for-payment");
          eventBus.emit("updated-invoice", invoice_doc.value);
        }
      },
      error: function (requestError) {
        loadingBtn.value = false;
        console.error("Request Error: ", requestError);
        eventBus.emit("show_message", {
          text: `Something went wrong with the request..`,
          color: "error",
        });
        frappe.utils.play_sound("error");
        loadingBtn.value = false;
      },
    });
  } else {
    punching.value = "inprocess";
    let grandTotalValue = grandTotal.value;
    doc.net_total = netTotal.value.toFixed(2);
    doc.grand_total = grandTotalValue;
    doc.rounded_total = Math.ceil(grandTotalValue);
    doc.total_taxes_and_charges = gstAmount.value.toFixed(2);
    const randomReference = `${Date.now()}-${Math.floor(
      Math.random() * 10000
    )}`;
    doc.pos_referrence = randomReference;

    console.log("offline-invoice...doc", doc);
    indexedDBService
      .openDatabase()
      // .then(() => {
      //   return indexedDBService.getTableInfo("1");
      // })
      .then((tableInfo) => {
        return indexedDBService.saveUpdateInvoice(JSON.stringify(doc));
      })
      .then(() => {
        // evntBus.$emit("offline-invoice-doc",doc)
        // console.log("Invoice Data saved successfully");
        eventBus.emit("go-for-payment");
        eventBus.emit("updated-invoice", doc);
        eventBus.emit("punching-status", punching.value);

        loadingBtn.value = false;
      })
      .catch((error) => {
        loadingBtn.value = false;
        console.error("Error with IndexedDB operation:", error);
      });
  }
};
const checkInternetSpeed = async (threshold = 2) => {
  const imageAddr =
    "https://upload.wikimedia.org/wikipedia/commons/a/a6/Brandenburger_Tor_abends.jpg"; // Test image URL
  const downloadSize = 2707459; // File size in bytes

  try {
    const download = new Image();
    const startTime = new Date().getTime();

    // Start downloading the test image
    const cacheBuster = `?cacheBuster=${startTime}`;
    download.src = imageAddr + cacheBuster;

    return new Promise((resolve, reject) => {
      download.onload = () => {
        const endTime = new Date().getTime();
        const duration = (endTime - startTime) / 1000; // Duration in seconds

        const bitsLoaded = downloadSize * 8; // Convert to bits
        const calculatedSpeedMbps = (
          bitsLoaded /
          duration /
          1024 /
          1024
        ).toFixed(2); // Mbps

        speedMbps.value = calculatedSpeedMbps;
        getSpeedRes.value = false;
        // if (speedMbps.value > 1) {
        //   eventBus.emit("sync-offline-invoice");
        // }

        // Update online status based on threshold
        // isInternet.value = parseFloat(calculatedSpeedMbps) >= threshold;
        // if (calculatedSpeedMbps > 2) {
        //   isInternet.value = true;
        // } else {
        //   console.log("offline mode on");
        //     isInternet.value = false;
        // }

        console.log(`Internet speed: ${calculatedSpeedMbps} Mbps.`);
        resolve({
          speedMbps: calculatedSpeedMbps,
        });
      };

      download.onerror = () => {
        speedMbps.value = null;
        console.error("Error measuring internet speed.");
        reject(new Error("Error measuring internet speed."));
      };
    });
  } catch (error) {
    console.error("Error checking internet speed:", error);
    throw error;
  }
};
const makePayloadForInvoice = () => {
  invoiceItems.value = [];

  items.value.forEach((item, index) => {
    let taxIncludeNetamount = 0;
    const total = item.rate;
    let taxrate = 1 + selectedPaymentMode.value?.tax_rate / 100 || 0;
    taxIncludeNetamount = total / taxrate;

    let taxItemWise = 0;
    let taxrateItem = 1 + item.tax_rate / 100 || 0;
    taxItemWise = total / taxrateItem;
    let customGst = 0
    customGst = total - taxItemWise



    const mainItemObject = {
      item_code: item.item_code,
      item_group: item.item_group,
      item_name: item.item_name,
      qty: item.qty,
      rate: item.rate,
      amount: item.rate,
      complementryItem: item.complementryItem,
      comment:item.comment,
      product_bundle: item.product_bundle,
      original_rate: item.original_rate,
      // net_amount: taxIncludeNetamount,
      item_tax_template: item.tax_template,
      custom_tax_rate: item.tax_rate,
      custom_tax_amount: customGst,
      net_rate: item.rate - customGst,
      net_amount: item.rate - customGst,
      base_net_rate: item.rate - customGst,
      base_net_amount: item.rate - customGst,

    };
    invoiceItems.value.push(mainItemObject);
  });

  localStorage.setItem("order-items", JSON.stringify(invoiceItems.value));
  localStorage.setItem("net-total", JSON.stringify(netTotal.value));
  localStorage.setItem("gst-amount", JSON.stringify(gstAmount.value));

  // checkInternetSpeed();
};

const deleteItem = (index) => {
  if (allowedDelete.value || !holdOrderId.value) {
    items.value.splice(index, 1);
    if (holdOrderId.value) {
      const heldOrders = JSON.parse(localStorage.getItem("heldOrders")) || [];
      const updatedOrders = heldOrders.filter((order) => order.id == holdOrderId.value);
      // console.log("updatedOrders.....",updatedOrders);
      if (updatedOrders.length > 0) {
        // console.log("eenter inn deletee.....")
        updateTableStatus(updatedOrders[0].table, "Available");
      }

      eventBus.emit("update-hold-order", holdOrderId.value)
      holdOrderId.value = ''
    }
    makePayloadForInvoice();

  }
  else {
    pindialog.value = true
  }

};
const toggleDelete = (index) => {
  // Toggle the visibility of the delete button for the clicked item
  items.value[index].showDelete = !items.value[index].showDelete;
};

const offlineProfileData = async () => {
  try {
    // Wait for the IndexedDBService to open the database and get the pos_profile
    const data = await indexedDBService
      .openDatabase()
      .then(() => indexedDBService.getPosProfile());

    // console.log("offline pos profile from order summary", data);

    if (data && data.length > 0) {
      pos_profile.value = data[0];
      console.log("order summary OFFline profile", pos_profile.value);
      paymentModes.value = pos_profile.value.payments;
      const hasDefaultPayment = paymentModes.value.some(
        (mode) => mode.default === 1 || mode.selected
      );
      if (!hasDefaultPayment && paymentModes.value.length > 0) {
        // If no default payment mode is found, set the first mode as default
        paymentModes.value[0].default = 1;
        paymentModes.value[0].selected = true;
      }
      paymentModes.value.forEach((item) => {
        if (item.default) {
          item.selected = true;
          selectedPaymentMode.value = item;
        } else {
          item.selected = false;
        }
      });
    } else {
      console.error("No profile data found in IndexedDB.");
    }
  } catch (error) {
    console.error("Error with IndexedDB operation getting profile:", error);
  }
};
const createSaleOrder = async (order) => {
  // if (selected.value.length > 0) {
  let invoiceDocForLoad = {};

  // Fetch the sales invoice from order
  const response = await frappe.call({
    method:
      "tabrah_pos.tabrah_pos.api.posapp.create_sales_invoice_from_order",
    args: {
      sales_order: order.name,
    },
  });

  if (response.message) {
    invoiceDocForLoad = response.message;
    // eventBus.emit("flag-for-sale-order", true);
  }

  // if (invoiceDocForLoad.items) {
  //   const selectedItems = selected.value[0].items;
  //   const loadedItems = invoiceDocForLoad.items;

  //   const loadedItemsMap = {};
  //   loadedItems.forEach((item) => {
  //     loadedItemsMap[item.item_code] = item;
  //   });

  //   // Iterate through selectedItems and update or discard items
  //   for (let i = 0; i < selectedItems.length; i++) {
  //     const selectedItem = selectedItems[i];
  //     const loadedItem = loadedItemsMap[selectedItem.item_code];

  //     if (loadedItem) {
  //       // Update the fields of selected item with loaded item's values
  //       selectedItem.qty = loadedItem.qty;
  //       selectedItem.amount = loadedItem.amount;
  //       selectedItem.uom = loadedItem.uom;
  //       selectedItem.rate = loadedItem.rate;
  //     } else {
  //       // If 'item_code' doesn't exist in loadedItems, discard the item
  //       selectedItems.splice(i, 1);
  //       i--; // Adjust the index as items are removed
  //     }
  //   }
  // }

  // Emit updated order data
  // eventBus.emit("load_order", selected.value[0]);
  // draftsDialog.value = false;

  // Call delete_sales_invoice API to delete the generated sales invoice
  await frappe.call({
    method:
      "tabrah_pos.tabrah_pos.api.posapp.delete_sales_invoice",
    args: {
      sales_invoice: invoiceDocForLoad.name,
    },
  });
  // }
};
onMounted(() => {
  // checkInternetSpeed();
  // // intervalId = setInterval(() => {
  // //   if (navigator.onLine && !getSpeedRes.value) {
  // //     getSpeedRes.value = true;
  // //     checkInternetSpeed();
  // //   }
  // // }, 8000);

  if (!navigator.onLine) {
    offlineProfileData();
  }
  eventBus.on("app-internet-status", (newStatus) => {
    offlineMode.value = !newStatus;
    offlineProfileData();
  });
  eventBus.on("set-default-value", () => {
    items.value = [];
    closeReturnDialog()
  });
  eventBus.on("exist-item-cart", (data) => {
    const existingItem = items.value.find(
      (item) => item.item_code === data.item_code
    );
    if (existingItem) {
      existingItem.qty = data.qty;
      existingItem.netTotal = existingItem.rate * existingItem.qty;
    } else {
      items.value.push({ ...data });
    }
    makePayloadForInvoice();
  });

  eventBus.on("add-to-cart", (data) => {
    data.rate = data.custom_discounted_rate > 0 ? data.custom_discounted_rate : data.rate
    data.netTotal = 0;
    data.netTotal = data.rate * data.qty;
    data.complementryItem = data.complementryItem || false

    // Find if the item already exists in the array
    if (!data.complementryItem) {

    const existingItem = items.value.find(
      (item) => item.item_code === data.item_code
    );

      if (existingItem) {
        // If item exists, add the new quantity
        existingItem.qty += data.qty;
        existingItem.netTotal = existingItem.rate * existingItem.qty;
      } else {
        // If item doesn't exist, add it to the array
        // selectedProduct.value.netTotal =
        //   selectedProduct.value.rate * selectedProduct.value.qty;
        items.value.push({ ...data });
      }
    }
    else {
      items.value.push({ ...data });

    }

    makePayloadForInvoice();
  });
  eventBus.on("update-table-status", (table) => {
    updateTableStatus(table, "Available")
  });


  eventBus.on("show-sale-order", (order) => {
    order.items.forEach((item) => {
      item.netTotal = item.rate * item.qty;
    });
    items.value = [];
    items.value = order.items;
    saleOrder.value = true;
    saleOrderDetail.value = order;
    createSaleOrder(order);
  });

  eventBus.on("send_pos_profile", (profile) => {
    pos_profile.value = profile;
    selectedCustomer.value = profile.customer;
    paymentModes.value = profile.payments;
    getCustomerNames(profile);
    const hasDefaultPayment = paymentModes.value.some(
      (mode) => mode.default === 1 || mode.selected
    );
    if (!hasDefaultPayment && paymentModes.value.length > 0) {
      // If no default payment mode is found, set the first mode as default
      paymentModes.value[0].default = 1;
      paymentModes.value[0].selected = true;
    }
    paymentModes.value.forEach((item) => {
      if (item.default) {
        item.selected = true;
        selectedPaymentMode.value = item;
      } else {
        item.selected = false;
      }
    });
  });
  eventBus.on("register_pos_profile", (data) => {
    pos_profile.value = data.pos_profile;
    pos_opening_shift.value = data.pos_opening_shift;
  });
  eventBus.on("set-default-value", () => {
    invoice_doc.value = {};
    saleOrder.value = false;
    saleOrderDetail.value = "";
    items.value = [];
    invoiceItems.value = [];
    holdOrderId.value = null;
    allowedDelete.value = true
  });
  eventBus.on("selected_order_type", (type) => {
    selectedOrderType.value = type;
    items.value = [];
    invoiceItems.value = [];
    invoice_doc.value = {};
  });
  eventBus.on("load-hold-order", (order) => {
    console.log("hold order", order);
    items.value = [];
    holdOrderId.value = order.id;
    eventBus.emit("open-product-menu");
    allowedDelete.value = false
    items.value = order.items;
    cover.value = order.cover || 0; // Load persons from hold order
    makePayloadForInvoice();
  });
  eventBus.on("current-screen", (newVal) => {
    screen.value = newVal;
  });
  eventBus.on("enter-key-called", () => {
    onEnterKey();
  });
  eventBus.on("selected_table", (table) => {
    selectedTable.value = table;
  });
  eventBus.on("order-taker", (data) => {
    orderBy.value = data;
  });


});
onUnmounted(() => {
  eventBus.off("app-internet-status");
  eventBus.off("set-default-value");
  eventBus.off("exist-item-cart");
  eventBus.off("add-to-cart");
  eventBus.off("show-sale-order");
  eventBus.off("send_pos_profile");
  eventBus.off("register_pos_profile");
  eventBus.off("set-default-value");
  eventBus.off("selected_order_type");
  eventBus.off("load-hold-order");
  eventBus.off("current-screen");
  eventBus.off("enter-key-called");
  eventBus.off("selected_table");
  eventBus.off("order-taker");
  eventBus.off("update-table-status");
});
</script>

<style scoped>
.summary-main-card {
  max-height: 80vh;
  height: 80vh;
  overflow-x: hidden;
  overflow-y: auto;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2) !important;
}

.order-card {
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  max-height: 360px;
  height: 300px;
}

.table-header {
  font-weight: 400;
  font-size: 12px;
  font-family: Noto Sans;
  color: grey;
}

.v-divider {
  margin: 0;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.teal--text.text--accent-4 {
  color: #009688 !important;
}

.text-caption {
  font-size: 12px;
}

.payment-card {
  border-radius: 16px !important;
}

.dotted-divider {
  border-style: dotted !important;
  border-color: black !important;
}

.payment-text-color {
  color: #626262;
}

.font-20 {
  font-size: 20px;
  font-weight: 700;
}

.total-p {
  color: orangered;
  font-size: 20px;
  font-weight: 700;
}

.payment-button {
  border-radius: 8px;
}

.image-container {
  text-align: center;
  /* Center the image */
}

.payment-p {
  font-size: 20px;
  font-weight: 700;
  font-family: Archivo;
}

.animated-image {
  width: 535px;
  max-width: 600px;
  position: relative;
  animation: move 8s linear infinite;
  /* Infinite left-to-right animation */
}

.text-decoration-underline {
  text-decoration: underline;
}

.caption {
  color: gray;
}

:deep(.v-label--clickable) {
  margin-top: 8px !important;
}

:deep(.v-select__selection-text) {
  position: relative !important;
  bottom: 8px !important;
}

@keyframes move {
  0% {
    transform: translateX(-100%);
  }

  50% {
    transform: translateX(100%);
  }

  100% {
    transform: translateX(-100%);
  }
}

@media (max-width: 600px) {
  .table-header {
    font-size: 12px;
  }

  .text-caption {
    font-size: 10px;
  }
}
</style>
