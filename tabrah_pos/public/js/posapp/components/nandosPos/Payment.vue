<template>
  <v-card class="summary-card mt-3">
    <v-row>
      <v-col cols="12" sm="6" md="3" lg="3" class="pt-6 pb-0 ml-9 col-width">
        <div style="background-color: #f9c94c" class="amount-div">
          <v-card-title
            class="pb-0"
            :class="{
              'pt-2': $vuetify.breakpoint.mdAndDown,
            }"
            :style="{
              height: $vuetify.breakpoint.mdAndDown ? '35px' : '',
            }"
          >
            <p class="title-p">Paid Amount</p></v-card-title
          >
          <v-card-title
            class="pt-1"
            :class="{
              'py-0': $vuetify.breakpoint.mdAndDown,
            }"
          >
            <p class="amount-p">Rs. {{ amountTake || 0.0 }}</p></v-card-title
          >
        </div>
      </v-col>
      <v-col cols="12" sm="6" md="3" lg="3" class="pt-6 pb-0 col-width">
        <div style="background-color: #9c9c9c; color: white" class="amount-div">
          <v-card-title
            class="pb-0"
            :class="{
              'pt-2': $vuetify.breakpoint.mdAndDown,
            }"
            :style="{
              height: $vuetify.breakpoint.mdAndDown ? '35px' : '',
            }"
          >
            <p class="title-p">To Be Paid</p></v-card-title
          >
          <v-card-title
            class="pt-1"
            :class="{
              'py-0': $vuetify.breakpoint.mdAndDown,
            }"
          >
            <p class="amount-p">
              Rs. {{ invoice_doc.rounded_total }}
            </p></v-card-title
          >
        </div>
      </v-col>
      <v-col cols="12" sm="6" md="3" lg="3" class="pt-6 pb-0 col-width">
        <div style="background-color: #d31d1d; color: white" class="amount-div">
          <v-card-title
            class="pb-0"
            :class="{
              'pt-2': $vuetify.breakpoint.mdAndDown,
            }"
            :style="{
              height: $vuetify.breakpoint.mdAndDown ? '35px' : '',
            }"
          >
            <p class="title-p">Change</p></v-card-title
          >
          <v-card-title
            class="pt-1"
            :class="{
              'py-0': $vuetify.breakpoint.mdAndDown,
            }"
          >
            <p class="amount-p">
              Rs. -{{ parseFloat(changeAmount.toFixed(2)) }}
            </p></v-card-title
          >
        </div>
      </v-col>
      <v-col
        cols="12"
        sm="6"
        md="3"
        lg="3"
        class="pl-7 pt-6 pb-0"
        @click="openDiscountTypeModal"
      >
        <div>
          <v-card-title
            class="py-0 pl-0"
            :style="{
              height: $vuetify.breakpoint.mdAndDown ? '31px' : '',
            }"
          >
            <p class="title-p">Discount Type</p>
          </v-card-title>
          <div class="discount-select d-flex">
            <p
              v-if="!selectedDiscount"
              class="placeholder"
              :class="{ 'ml-1': $vuetify.breakpoint.mdAndDown }"
            >
              Discount Type
            </p>
            <p v-else>
              {{ selectedDiscount.name }}
              <span
                v-if="selectedDiscount.discount_type == 'Discount Percentage'"
                >{{ selectedDiscount.discount_percentage }} %</span
              >
            </p>
            <v-spacer></v-spacer>
            <v-icon
              v-if="selectedDiscount"
              @click.stop="cancelSelectedDiscount"
              class="ml-2"
              >mdi-close-circle</v-icon
            >
          </div>
        </div>
      </v-col>
    </v-row>

    <v-row class="total-row">
      <v-col cols="2" class="pl-7 ml-3 pb-0">
        <div>
          <v-card-title
            class="pb-0"
            :class="{
              'py-0': $vuetify.breakpoint.mdAndDown,
              'pr-0': $vuetify.breakpoint.mdAndDown,
            }"
            :style="{
              width: $vuetify.breakpoint.mdAndDown ? '80px' : '',
              height: $vuetify.breakpoint.mdAndDown ? '30px' : '',
            }"
          >
            <p class="title-p">Net Total</p></v-card-title
          >
          <v-card-title
            class="pt-1"
            :class="{
              'py-0': $vuetify.breakpoint.mdAndDown,
            }"
            :style="{
              width: $vuetify.breakpoint.mdAndDown ? '145px' : '',
            }"
          >
            <p class="amount-p">
              Rs. {{ invoice_doc.net_total }}
            </p></v-card-title
          >
        </div>
      </v-col>
      <v-col cols="1" class="divider-col pr-0">
        <v-divider vertical style="background-color: black"></v-divider>
      </v-col>
      <v-col cols="2" class="px-0 pb-0">
        <div>
          <v-card-title
            class="pb-0 px-0"
            :class="{
              'py-0': $vuetify.breakpoint.mdAndDown,
              'pr-0': $vuetify.breakpoint.mdAndDown,
            }"
            :style="{
              width: $vuetify.breakpoint.mdAndDown ? '140px' : '',
              height: $vuetify.breakpoint.mdAndDown ? '30px' : '',
            }"
          >
            <p class="title-p">
              Taxes & Charges {{ paymentType.tax_rate }}%
            </p></v-card-title
          >
          <v-card-title
            class="pt-1"
            :class="{
              'py-0': $vuetify.breakpoint.mdAndDown,
              'px-0': $vuetify.breakpoint.lgAndUp,
            }"
            :style="{
              width: $vuetify.breakpoint.mdAndDown ? '145px' : '',
            }"
          >
            <p class="amount-p">
              Rs.
              {{
                invoice_doc.total_taxes_and_charges
                  ? invoice_doc.total_taxes_and_charges.toFixed(2)
                  : 0
              }}
            </p></v-card-title
          >
        </div>
      </v-col>
      <v-col cols="1" class="divider-col">
        <v-divider vertical style="background-color: black"></v-divider>
      </v-col>
      <v-col cols="2" class="pl-2 pb-0">
        <div>
          <v-card-title
            class="pb-0"
            :class="{
              'py-0': $vuetify.breakpoint.mdAndDown,
              'pr-0': $vuetify.breakpoint.mdAndDown,
            }"
            :style="{
              width: $vuetify.breakpoint.mdAndDown ? '130px' : '',
              height: $vuetify.breakpoint.mdAndDown ? '30px' : '',
            }"
          >
            <p class="title-p">Total Amount</p></v-card-title
          >
          <v-card-title
            class="pt-1"
            :class="{
              'py-0': $vuetify.breakpoint.mdAndDown,
              'px-0': $vuetify.breakpoint.lgAndUp,
            }"
            :style="{
              width: $vuetify.breakpoint.mdAndDown ? '145px' : '',
            }"
          >
            <p class="amount-p">
              Rs.{{ invoice_doc.total ? invoice_doc.total.toFixed(2) : 0 }}
            </p></v-card-title
          >
        </div>
      </v-col>
      <v-col cols="1" class="divider-col">
        <v-divider vertical style="background-color: black"></v-divider>
      </v-col>
      <v-col cols="2" class="pl-2 pb-0">
        <div>
          <v-card-title
            class="pb-0"
            :class="{
              'py-0': $vuetify.breakpoint.mdAndDown,
              'pr-0': $vuetify.breakpoint.mdAndDown,
            }"
            :style="{
              width: $vuetify.breakpoint.mdAndDown ? '130px' : '',
              height: $vuetify.breakpoint.mdAndDown ? '30px' : '',
            }"
          >
            <p class="title-p">Discount Amount</p></v-card-title
          >
          <v-card-title
            class="pt-1"
            :style="{
              width: $vuetify.breakpoint.mdAndDown ? '145px' : '',
            }"
          >
            <p class="amount-p">
              {{ invoice_doc.discount_amount }}
            </p></v-card-title
          >
        </div>
      </v-col>
    </v-row>

    <v-row class="total-row">
      <v-col cols="2" class="pl-7 ml-3 pb-0 pt-0">
        <div>
          <v-card-title
            class="pb-0"
            :class="{
              'py-0': $vuetify.breakpoint.mdAndDown,
              'pr-0': $vuetify.breakpoint.mdAndDown,
            }"
            :style="{
              width: $vuetify.breakpoint.mdAndDown ? '130px' : '',
              height: $vuetify.breakpoint.mdAndDown ? '30px' : '',
            }"
          >
            <p class="title-p">Grand Total</p></v-card-title
          >
          <v-card-title
            class="pt-1"
            :style="{
              width: $vuetify.breakpoint.mdAndDown ? '145px' : '',
            }"
            :class="{
              'pr-0': $vuetify.breakpoint.lgAndUp,
            }"
          >
            <p class="amount-p">
              Rs. {{ invoice_doc.grand_total }}
            </p></v-card-title
          >
        </div>
      </v-col>
      <v-col cols="1" class="divider-col">
        <v-divider vertical style="background-color: black"></v-divider>
      </v-col>
      <v-col cols="2" class="pl-2 pb-0 pt-0">
        <div>
          <v-card-title
            class="pb-0"
            :class="{
              'py-0': $vuetify.breakpoint.mdAndDown,
              'pr-0': $vuetify.breakpoint.mdAndDown,
            }"
            :style="{
              width: $vuetify.breakpoint.mdAndDown ? '130px' : '',
              height: $vuetify.breakpoint.mdAndDown ? '30px' : '',
            }"
          >
            <p class="title-p">Rounded Total</p></v-card-title
          >
          <v-card-title
            class="pt-1"
            :style="{
              width: $vuetify.breakpoint.mdAndDown ? '145px' : '',
            }"
          >
            <p class="amount-p" style="color: #d31d1d">
              Rs. {{ invoice_doc.rounded_total }}
            </p></v-card-title
          >
        </div>
      </v-col>
      <v-col cols="1" class="divider-col" v-show="showDeliveryCharges">
        <v-divider vertical style="background-color: black"></v-divider>
      </v-col>
      <v-col cols="2" class="pl-2 pb-0 pt-0" v-show="showDeliveryCharges">
        <div>
          <v-card-title
            class="pb-0"
            :class="{
              'py-0': $vuetify.breakpoint.mdAndDown,
              'pr-0': $vuetify.breakpoint.mdAndDown,
            }"
            :style="{
              width: $vuetify.breakpoint.mdAndDown ? '130px' : '',
              height: $vuetify.breakpoint.mdAndDown ? '30px' : '',
            }"
          >
            <p class="title-p">Delivery Charges</p></v-card-title
          >
          <v-card-title
            class="pt-1 px-0"
            :style="{
              width: $vuetify.breakpoint.mdAndDown ? '145px' : '',
            }"
          >
            <p class="amount-p">Rs. {{ deliveryCharges }}</p></v-card-title
          >
        </div>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="2" class="pl-10 pr-0 py-0">
        <v-card-title class="pb-0 pr-0 pt-6">
          <p class="title-p">Amount</p></v-card-title
        >
      </v-col>
      <v-col
        :cols="paymentType.mode_type == 'Bank' ? '6' : '10'"
        class="pr-12 pl-0"
        :class="{ 'py-0': $vuetify.breakpoint.mdAndDown }"
      >
        <v-text-field
          v-model="amountTake"
          ref="amountInput"
          @focus="setActiveField('amount')"
          @touchstart="setActiveField('amount')"
          outlined
        ></v-text-field>
      </v-col>
      <v-col
        cols="1"
        class="pl-10 pr-0 py-0"
        v-show="paymentType.mode_type == 'Bank'"
      >
        <v-card-title class="pb-0 pr-0 pt-6">
          <p class="title-p">Tip</p></v-card-title
        >
      </v-col>
      <v-col
        v-show="paymentType.mode_type == 'Bank'"
        cols="3"
        class="pr-12 pl-0"
        :class="{ 'py-0': $vuetify.breakpoint.mdAndDown }"
      >
        <v-text-field
          v-model="tip"
          outlined
          ref="tipInput"
          @focus="setActiveField('tip')"
          @touchstart="setActiveField('tip')"
        ></v-text-field>
      </v-col>
    </v-row>
    <v-row no-gutters class="mt-1">
      <v-col cols="6" class="pl-9 py-0">
        <v-row>
          <v-col
            cols="4"
            v-for="num in numberPad"
            :key="num"
            class="number-pad p-2"
          >
            <v-btn
              class="black--text"
              color="#F4F4F4"
              depressed
              block
              elevation="0"
              raised
              x-large
              height="45px"
              :style="{
                height: $vuetify.breakpoint.mdAndDown ? '45px' : '50px',
              }"
              @click="handleButtonClick(num)"
              ><p class="num-p mt-3">{{ num }}</p></v-btn
            >
          </v-col>
        </v-row>
      </v-col>
      <v-col cols="6" class="px-6 pt-0">
        <v-row>
          <v-col
            cols="4"
            v-for="(paymentMode, i) in pos_profile.payments"
            :key="i"
          >
            <div class="mt-2">
              <v-btn
                class="white--text text-wrap"
                :color="paymentMode.selected ? '#AF002B' : '#9C9C9C'"
                depressed
                block
                elevation="2"
                raised
                x-large
                :style="{
                  height: $vuetify.breakpoint.mdAndDown ? '60px' : '90px',
                }"
                @click="changePaymentType(paymentMode)"
                >{{ paymentMode.mode_of_payment }}</v-btn
              >
            </div>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
    <v-row no-gutters class="mt-5 px-7">
      <v-col cols="12" sm="4" md="4" lg="2" class="p-1">
        <v-btn
          class="white--text font-26"
          color="#AF002B"
          depressed
          block
          elevation="2"
          raised
          x-large
          :style="{
            height: $vuetify.breakpoint.mdAndDown ? '50px' : '60px',
          }"
          @click="goToHome"
        >
          Home</v-btn
        >
      </v-col>
      <v-col cols="12" sm="4" md="4" lg="2" class="p-1">
        <v-btn
          class="white--text font-26"
          color="black"
          depressed
          block
          elevation="2"
          raised
          x-large
          :style="{
            height: $vuetify.breakpoint.mdAndDown ? '50px' : '60px',
          }"
          @click="backToMenuScreen()"
          >Back</v-btn
        >
      </v-col>
      <v-col cols="12" sm="4" md="4" lg="2" class="p-1">
        <v-btn
          class="white--text font-26"
          color="black"
          depressed
          block
          elevation="2"
          raised
          x-large
          :style="{
            height: $vuetify.breakpoint.mdAndDown ? '50px' : '60px',
          }"
          @click="submit_invoice()"
          :loading="btnLoading"
          >Submit</v-btn
        >
      </v-col>
      <v-col cols="12" sm="4" md="6" lg="4" class="p-1">
        <v-btn
          class="white--text font-26"
          color="black"
          depressed
          block
          elevation="2"
          raised
          x-large
          :style="{
            height: $vuetify.breakpoint.mdAndDown ? '50px' : '60px',
          }"
          :loading="btnLoading1"
          @click="submit_invoice(undefined, false, true)"
          >Submit & Print</v-btn
        >
      </v-col>
      <v-col cols="12" sm="4" md="4" lg="2" class="p-1">
        <v-btn
          class="white--text font-26"
          color="black"
          depressed
          block
          elevation="2"
          raised
          x-large
          :style="{
            height: $vuetify.breakpoint.mdAndDown ? '50px' : '60px',
          }"
          @click="handleCancelInvoice"
          >Cancel</v-btn
        >
      </v-col>
    </v-row>
    <v-dialog max-width="600" v-model="dialog" persistent>
      <v-card>
        <v-card-text>
          <p class="dialog-text">Are You Sure You Want to Cancel Order</p>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn text @click="dialog = false">No</v-btn>
          <v-btn text @click="cancelOrder" color="red">Yes</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <iframe id="printFrame" style="display: none"></iframe>
  </v-card>
</template>

<script>
import { evntBus } from "../../bus";
import { sync_fbr } from "../../tax_integration";

export default {
  data() {
    return {
      numberPad: [1, 2, 3, 4, 5, 6, 7, 8, 9, "+", 0, "Back"],
      discountType: ["Flat Discount", "Card Discount"],
      amountTake: "",
      pos_profile: "",
      ordertype: "",
      selectedTable: "",
      // posting_date: this.getCurrentDate(),
      customer: "Walk in",
      pos_opening_shift: "",
      subTotal: 0,
      orderItem: [],
      invoice_doc: {},
      copy_invoice_doc: {},
      changeAmount: 0,
      taxRate: 0,
      paymentType: "Cash",
      dialog: false,
      orderSummary: [],
      cover: "",
      discountArray: [],
      selectedDiscount: "",
      orderItems: [],
      showDeliveryCharges: false,
      deliveryCharges: 0,
      btnLoading1: false,
      btnLoading: false,
      newTax: {},
      tip: "",
      activeField: "amount", // tracks the active field
    };
  },
  watch: {
    selectedDiscount: {
      handler(newVal, oldVal) {
        if (newVal) {
          if (
            this.amountTake &&
            this.amountTake > this.invoice_doc.grand_total
          ) {
            this.changeAmount = this.amountTake - this.invoice_doc.grand_total;
          }
        }
      },
      deep: true,
    },
    tip: {
      handler(newVal, oldVal) {
        if (newVal) {
          console.log("tip added", newVal);
          this.invoice_doc.tip = newVal;
        }
      },
      deep: true,
    },
  },
  methods: {
    changePaymentType(type) {
      console.log("profile", this.pos_profile);
      this.tip=''
      this.invoice_doc.tip = this.tip;
      this.pos_profile.payments.forEach((payment) => {
        payment.selected = false;
        if (payment == type) {
          payment.selected = true;
        } else {
          payment.selected = false;
        }
      });
      this.paymentType = type;
      console.log("paymenttype", this.paymentType);
      this.set_full_amount();
      this.addedDiscount();
    },
    openDiscountTypeModal() {
      const vm = this;
      frappe.call({
        method: "tabrah_pos.tabrah_pos.api.posapp.get_offers",
        args: {
          profile: vm.pos_profile.name,
        },
        callback: function (r) {
          if (r.message) {
            const sortedArray = r.message.sort((a, b) => {
              if (
                a.apply_on === "Transaction" &&
                b.apply_on !== "Transaction"
              ) {
                return -1; // a should come first
              } else if (
                a.apply_on !== "Transaction" &&
                b.apply_on === "Transaction"
              ) {
                return 1; // b should come first
              } else {
                return 0; // keep the order if both are same
              }
            });

            // Add color: "green" to objects where apply_on: "Transaction"
            sortedArray.forEach((obj) => {
              if (obj.apply_on === "Transaction") {
                obj.color = "green";
              } else {
                obj.color = "#af002b";
              }
            });

            vm.discountArray = sortedArray;
            console.log("discount-array", r.message);
            vm.$emit("go-to-discountscreen", vm.discountArray);
          }
        },
      });
    },
    backToMenuScreen() {
      if (!this.btnLoading && !this.btnLoading1) {
        this.$emit("go-to-menu");
        evntBus.$emit("clear-menu-screen");
      }
    },
    goToHome() {
      if (!this.btnLoading && !this.btnLoading1) {
        // this.$emit("go-to-home");
        evntBus.$emit("set-default-data");
        this.setDefaultValue();
        this.showDeliveryCharges = false;
        this.pos_profile.login = false;
        evntBus.$emit("go-to-pin-screen");
      }
    },
    setActiveField(field) {
      this.activeField = field;
    },
    focusActiveField() {
      // Focus the active field input when a number is clicked
      if (this.activeField === "amount") {
        this.$refs.amountInput.focus();
      } else if (this.activeField === "tip") {
        this.$refs.tipInput.focus();
      }
    },
    handleButtonClick(num) {
      this.focusActiveField(); // Focus on the correct field when a button is clicked

      if (num === "Back") {
        if (this.activeField === "amount") {
          this.amountTake = this.amountTake.slice(0, -1);
        } else if (this.activeField === "tip") {
          this.tip = this.tip.slice(0, -1);
        }
      } else if (num === "-") {
        if (this.activeField === "amount" && this.amountTake > 0) {
          this.amountTake = (parseInt(this.amountTake) - 1).toString();
        } else if (this.activeField === "tip" && this.tip > 0) {
          this.tip = (parseInt(this.tip) - 1).toString();
        }
      } else if (num === "+") {
        if (this.activeField === "amount") {
          this.amountTake = (parseInt(this.amountTake) + 1).toString();
        } else if (this.activeField === "tip") {
          this.tip = (parseInt(this.tip) + 1).toString();
        }
      } else {
        if (this.activeField === "amount") {
          this.amountTake += num.toString();
        } else if (this.activeField === "tip") {
          this.tip += num.toString();
        }
      }

      // Handle change amount and update invoice_doc logic here if necessary
      if (
        this.activeField === "amount" &&
        this.amountTake >= this.invoice_doc.rounded_total
      ) {
        this.changeAmount = this.amountTake - this.invoice_doc.rounded_total;
      }
      this.invoice_doc.paid_amount = this.amountTake;
      // Reset the amounts in payments
      this.invoice_doc.payments.forEach((item) => {
        item.amount = 0;
      });
      let updatePaymentAmount = this.invoice_doc.payments.find(
        (item) => item.mode_of_payment == this.paymentType.mode_of_payment
      );
      updatePaymentAmount.amount = this.amountTake;
    },
    handleSubmit(event, payment_received = false, print = false) {},
    submit_invoice(event, payment_received = false, print = false) {
      if (
        this.pos_profile.active_emp.designation == "Cashier" ||
        this.pos_profile.active_emp.designation == "Manager"
      ) {
        let matchingPayment = this.pos_profile.payments.find(
          (item) => item.mode_of_payment === this.paymentType.mode_of_payment
        );
        this.newTax = matchingPayment;
        if (this.amountTake >= this.invoice_doc.grand_total) {
          if (print) {
            this.btnLoading1 = true;
          } else {
            this.btnLoading = true;
          }
          let totalPayedAmount = 0;
          this.invoice_doc.payments.forEach((payment) => {
            payment.amount = flt(payment.amount);
            totalPayedAmount += payment.amount;
          });
          if (this.invoice_doc.is_return && totalPayedAmount == 0) {
            this.invoice_doc.is_pos = 0;
          }
          //   if (this.customer_credit_dict.length) {
          //     this.customer_credit_dict.forEach((row) => {
          //       row.credit_to_redeem = flt(row.credit_to_redeem);
          //     });
          //   }
          let data = {};
          let changeAmount = -this.changeAmount;
          data["paid_change"] = this.changeAmount;
          data["total_change"] = this.changeAmount;
          data["credit_change"] = 0;
          data["redeemed_customer_credit"] = 0;
          data["customer_credit_dict"] = [];
          data["is_cashback"] = true;

          const vm = this;
          frappe.call({
            method: "tabrah_pos.tabrah_pos.api.posapp.submit_invoice",
            args: {
              data: data,
              invoice: vm.invoice_doc,
              taxvalue: vm.newTax.tax_and_charges || "",
            },
            async: true,
            callback: async function (r) {
              console.log(
                "  this.invoice_doc.payments",
                vm.invoice_doc.payments
              );
              if (r.message) {
                for (const payment of vm.invoice_doc.payments) {
                  if (payment.amount > 0 && payment.type === "Bank" && !print) {
                    try {
                      const responseCode = await sync_fbr(
                        vm.invoice_doc.name,
                        vm.pos_profile.name
                      );
                      console.log("Response Code:", responseCode); // Handle the response if needed
                    } catch (error) {
                      console.error("Error syncing FBR:", error); // Handle any errors
                    }
                  }
                }
                if (print) {
                  try {
                    // Await the sync_fbr promise to ensure sequential execution
                    const responseCode = await sync_fbr(
                      vm.invoice_doc.name,
                      vm.pos_profile.name
                    );
                    console.log("fbr-response", responseCode);
                    if (responseCode) {
                      vm.load_print_page();
                    } else {
                      console.error(
                        "FBR synchronization failed. Print page will not be loaded."
                      );
                    }
                  } catch (error) {
                    console.error(
                      "Error occurred during FBR sync and print handling:",
                      error
                    );
                  }
                }
                // evntBus.$emit("set_last_invoice", vm.invoice_doc.name);
                evntBus.$emit("show_mesage", {
                  text: `Invoice ${r.message.name} is Submited`,
                  color: "success",
                });
                frappe.utils.play_sound("submit");
                // vm.$emit("go-to-home");
                vm.setDefaultValue();
                evntBus.$emit("set-default-data");
                evntBus.$emit("update-selected-discount");
                vm.selectedDiscount = null;
                vm.showDeliveryCharges = false;
                vm.btnLoading = false;
                vm.btnLoading1 = false;
                vm.pos_profile.login = false;
                evntBus.$emit("go-to-pin-screen");
                vm.amountTake = "";
              }
            },
            error: function (error) {
              console.error("API call failed:", error);
              evntBus.$emit("show_mesage", {
                text: `An error occurred while submitting the invoice`,
                color: "error",
              });
              frappe.utils.play_sound("error");
              vm.btnLoading = false;
              vm.btnLoading1 = false;
            },
          });
        } else {
          evntBus.$emit("show_mesage", {
            text: `Paid amount must be greater than amount to be paid`,
            color: "error",
          });
          frappe.utils.play_sound("error");
          this.btnLoading = false;
          this.btnLoading1 = false;
          return;
        }
      } else {
        evntBus.$emit("show_mesage", {
          text: `You have no rights`,
          color: "error",
        });
      }
    },
    handleCancelInvoice() {
      if (this.pos_profile.active_emp.designation == "Manager") {
        this.dialog = true;
      }
    },
    cancel_invoice() {
      const doc = this.invoice_doc;
      // this.invoiceType = this.pos_profile.posa_default_sales_order
      //   ? "Order"
      //   : "Invoice";
      // this.invoiceTypes = ["Invoice", "Order"];
      // this.posting_date = frappe.datetime.nowdate();
      // if (doc.name && this.pos_profile.posa_allow_delete) {
      const vm = this;
      frappe.call({
        method: "tabrah_pos.tabrah_pos.api.posapp.delete_invoice",
        args: { invoice: doc.name },
        async: true,
        callback: function (r) {
          if (r.message) {
            evntBus.$emit("show_mesage", {
              text: r.message,
              color: "warning",
            });
            // vm.$emit("go-to-home");
            // vm.setDefaultValue();
            // evntBus.$emit("set-default-data");
          }
        },
      });
      // }
    },
    setDefaultValue() {
      (this.amountTake = ""),
        (this.invoice_doc = {}),
        (this.subTotal = 0),
        (this.orderSummary = []),
        (this.orderItem = []),
        (this.changeAmount = 0);
    },
    load_print_page() {
      const print_format =
        this.pos_profile.print_format_for_online ||
        this.pos_profile.print_format;
      const letter_head = this.pos_profile.letter_head || 0;
      const url =
        frappe.urllib.get_base_url() +
        "/printview?doctype=Sales%20Invoice&name=" +
        this.invoice_doc.name +
        "&trigger_print=1" +
        "&format=" +
        "Sales%20Invoice%20Print" +
        "&no_letterhead=" +
        letter_head;
      const printFrame = document.getElementById("printFrame");
      printFrame.src = url;
      console.log(" printFrame.contentWindow", printFrame.contentWindow);

      printFrame.onload = function () {
        printFrame.contentWindow.focus();
        printFrame.contentWindow.print();
      };
      // const printWindow = window.open(url, "Print");
      // printWindow.addEventListener(
      //   "load",
      //   function () {
      //     printWindow.print();
      //     // printWindow.close();
      //     // NOTE : uncomoent this to auto closing printing window
      //   },
      //   true
      // );
    },
    cancelSelectedDiscount() {
      this.selectedDiscount = null;
      this.invoice_doc = this.copy_invoice_doc;
      this.invoice_doc.discount_amount = 0;
      this.set_full_amount();
      if (this.amountTake > this.invoice_doc.rounded_total) {
        this.changeAmount = this.amountTake - this.invoice_doc.rounded_total;
      } else {
        this.changeAmount = 0;
      }
      evntBus.$emit("update-selected-discount");
    },
    set_full_amount(idx) {
      console.log("this.paymentType", this.paymentType);
      console.log("this.pos_profile.payments", this.pos_profile.payments);

      let getTax = this.pos_profile.payments.find(
        (item) => item.mode_of_payment == this.paymentType.mode_of_payment
      );
      console.log("gettax", getTax);
      this.invoice_doc.taxes_and_charges = getTax.taxes_and_charges;
      // this.taxType = getTax.taxes_and_charges;
      this.taxRate = getTax.tax_rate / 100;
      const subtotal = this.invoice_doc.net_total;
      const taxAndCharges = subtotal * this.taxRate;
      this.invoice_doc.total_taxes_and_charges = taxAndCharges;
      this.invoice_doc.rounded_total = Math.ceil(
        taxAndCharges + this.invoice_doc.net_total
      );
      // this.invoice_doc.total = taxAndCharges + this.invoice_doc.net_total;
      this.invoice_doc.grand_total = taxAndCharges + this.invoice_doc.net_total;

      // if (this.paymentType === "Credit Card") {
      //   this.taxRate = 0.05;
      //   const subtotal = this.invoice_doc.net_total;
      //   const taxAndCharges = subtotal * this.taxRate;
      //   this.invoice_doc.total_taxes_and_charges = taxAndCharges;
      //   this.invoice_doc.rounded_total = Math.ceil(
      //     taxAndCharges + this.invoice_doc.net_total
      //   );
      //   // this.invoice_doc.total = taxAndCharges + this.invoice_doc.net_total;
      //   this.invoice_doc.grand_total =
      //     taxAndCharges + this.invoice_doc.net_total;
      // } else {
      //   this.taxRate = 0.15;
      //   const subtotal = this.invoice_doc.net_total;
      //   const taxAndCharges = subtotal * this.taxRate;
      //   this.invoice_doc.total_taxes_and_charges = taxAndCharges;
      //   this.invoice_doc.rounded_total = Math.ceil(
      //     taxAndCharges + this.invoice_doc.net_total
      //   );
      //   // this.invoice_doc.total = taxAndCharges + this.invoice_doc.net_total;
      //   this.invoice_doc.grand_total =
      //     taxAndCharges + this.invoice_doc.net_total;
      // }
      let updatePaymentAmount = this.invoice_doc.payments.find(
        (item) => item.mode_of_payment == this.paymentType.mode_of_payment
      );
      updatePaymentAmount.amount = this.amountTake;
      // this.addedDiscount();
      if (this.amountTake > this.invoice_doc.rounded_total) {
        this.changeAmount = this.amountTake - this.invoice_doc.rounded_total;
      }
      if (this.showDeliveryCharges) {
        this.invoice_doc.grand_total =
          this.invoice_doc.grand_total + this.deliveryCharges;
        this.invoice_doc.rounded_total = Math.round(
          this.invoice_doc.grand_total
        );
      }
      if (this.amountTake >= this.invoice_doc.rounded_total) {
        this.changeAmount = this.amountTake - this.invoice_doc.rounded_total;
      }
    },
    addedDiscount() {
      let discountAmount = 0;
      if (
        this.invoice_doc &&
        this.invoice_doc.net_total &&
        this.selectedDiscount
      ) {
        if (this.selectedDiscount.apply_on == "Transaction") {
          if (this.selectedDiscount.discount_type == "Discount Percentage") {
            discountAmount =
              (this.invoice_doc.net_total *
                this.selectedDiscount.discount_percentage) /
              100;
            if (
              this.selectedDiscount.apply_cap &&
              discountAmount > this.selectedDiscount.max_amt
            ) {
              discountAmount = this.selectedDiscount.max_amt;
            }
          } else if (this.selectedDiscount.discount_type == "Discount Amount") {
            discountAmount = this.selectedDiscount.discount_amount;
          }
        } else {
          // if (this.invoice_doc.grand_total >= this.selectedDiscount.min_amt) {
          if (this.selectedDiscount.from_order) {
            const item = this.invoice_doc.items.find(
              (i) => i.item_code === this.selectedDiscount.item
            );
            if (item) {
              discountAmount = item.rate;
            }
          } else {
            this.getRateOfDiscountItem(this.selectedDiscount);
          }
          // }
        }
        if (
          this.selectedDiscount.apply_on == "Transaction" ||
          this.selectedDiscount.from_order
        ) {
          (this.invoice_doc.discount_amount = discountAmount),
            // (this.invoice_doc.additional_discount_percentage =
            //   this.selectedDiscount.discount_percentage);
            console.log("Discount Amount...", discountAmount);
          this.invoice_doc.grand_total =
            this.invoice_doc.grand_total - discountAmount;
          this.invoice_doc.rounded_total = Math.round(
            this.invoice_doc.grand_total
          );
        }
      }
    },
    cancelOrder() {
      this.dialog = false;
      this.cancel_invoice();
      this.goToHome();
    },
    getRateOfDiscountItem(data) {
      const vm = this;
      frappe.call({
        method: "tabrah_pos.tabrah_pos.api.posapp.get_item_with_rate",
        args: { item: data.item, order_type: this.invoice_doc.resturent_type },
        async: true,
        callback: function (r) {
          if (r.message) {
            console.log("get rate ", r.message);
            r.message.item_doc.rate = r.message.item_price;
            evntBus.$emit(
              "make-order-summary",
              r.message.item_doc,
              "main-item",
              ""
            );
            evntBus.$emit("update-invoice-for-discount");
            vm.invoice_doc.discount_amount = r.message.item_price;
          }
        },
      });
      // }
    },
    set_delivery_charges() {
      const vm = this;
      frappe.call({
        method:
          "tabrah_pos.tabrah_pos.api.posapp.get_applicable_delivery_charges",
        args: {
          company: this.pos_profile.company,
          pos_profile: this.pos_profile.name,
          customer: this.pos_profile.customer || "Walk in",
        },
        async: true,
        callback: function (r) {
          if (r.message) {
            console.log("delivery charges", r.message[0]);
            vm.deliveryCharges = r.message[0].default_rate;
            evntBus.$emit("set-deilvery-charges", r.message[0]);
          }
        },
      });
    },
  },
  mounted() {
    evntBus.$on("open-menu-detail", (data) => {
      this.pos_profile = data.pos_profile;
      this.pos_profile.payments.forEach((item) => {
        // Set selected to false for all items
        item.selected = false;

        // Set selected to true if the item is the default
        if (item.default) {
          item.selected = true;
          this.paymentType = item;
        }
      });
      // this.paymentType = this.pos_profile.payments.find((item) => {
      //   item.selected = false;

      //   if (item.default) {
      //     item.selected = true;
      //     return item;
      //   }
      // });
    });

    evntBus.$on("order-detail", (obj) => {
      console.log("in-payment-screen", obj);
      this.pos_profile = obj.pos_profile;
    });
    // evntBus.$on("called-payment-invoice", (data) => {
    //   console.log("called-payment-invoice", data);
    //   this.subTotal = data.subTotal;
    //   this.orderItem = data.orderItem;
    //   this.orderSummary = data.orderSummary;
    //   this.processInvoice();
    // });
    // evntBus.$on("register_pos_profile", (data) => {
    //   this.pos_opening_shift = data.pos_opening_shift;
    // });
    evntBus.$on("updated-invoice", (data) => {
      this.invoice_doc = data;
      this.copy_invoice_doc = { ...data };
      console.log("this.deliveryCharges", this.deliveryCharges);
      this.set_full_amount();
    });
    evntBus.$on("selected-discount", (data) => {
      this.selectedDiscount = data;
      console.log("this.selectedDiscount", data);
      this.invoice_doc.pos_offer = this.selectedDiscount.name;
      this.invoice_doc.bank_card_number = this.selectedDiscount.cardNumber;
      let discountAmount = 0;
      if (
        this.invoice_doc &&
        this.invoice_doc.net_total &&
        this.selectedDiscount
      ) {
        if (this.selectedDiscount.apply_on == "Transaction") {
          if (this.selectedDiscount.discount_type == "Discount Percentage") {
            discountAmount =
              (this.invoice_doc.net_total *
                this.selectedDiscount.discount_percentage) /
              100;
            if (
              this.selectedDiscount.apply_cap &&
              discountAmount > this.selectedDiscount.max_amt
            ) {
              discountAmount = this.selectedDiscount.max_amt;
            }
          } else if (this.selectedDiscount.discount_type == "Discount Amount") {
            discountAmount = this.selectedDiscount.discount_amount;
          }
        } else {
          // if (this.invoice_doc.grand_total >= this.selectedDiscount.min_amt) {
          if (this.selectedDiscount.from_order) {
            const item = this.orderItems.find(
              (i) => i.main_item.item_code === this.selectedDiscount.item
            );
            console.log("get-item", item);
            if (item) {
              discountAmount = item.main_item.rate;
            }
          } else {
            this.getRateOfDiscountItem(this.selectedDiscount);
          }
          // }
        }
        if (
          this.selectedDiscount.apply_on == "Transaction" ||
          this.selectedDiscount.from_order
        ) {
          (this.invoice_doc.discount_amount = discountAmount),
            // (this.invoice_doc.additional_discount_percentage =
            //   this.selectedDiscount.discount_percentage);
            console.log("Discount Amount...", discountAmount);
          this.invoice_doc.grand_total =
            this.invoice_doc.grand_total - discountAmount;
          this.invoice_doc.rounded_total = Math.round(
            this.invoice_doc.grand_total
          );
        }
      }
    });
    evntBus.$on("order-summary-array", (array) => {
      this.orderItems = array;
    });
    evntBus.$on("customer-detail", (data) => {
      if (data) {
        this.showDeliveryCharges = true;
        this.set_delivery_charges();
        // this.deliveryCharges=200
        // this.invoice_doc.grand_total =
        //       this.invoice_doc.grand_total+this.deliveryCharges;
        //     this.invoice_doc.rounded_total = Math.round(
        //       this.invoice_doc.grand_total
        //     );
      }
    });
  },
  beforeDestroy() {
    evntBus.$off("updated-invoice");
    evntBus.$off("order-detail");
    evntBus.$off("open-menu-detail");
    evntBus.$off("updated-invoice");
    evntBus.$off("selected-discount");
  },
};
</script>

<style  scoped>
.summary-card {
  height: 92vh;
  border-radius: 8px !important;
}
.amount-p {
  font-size: 26px;
  font-weight: 700;
}

.title-p {
  font-size: 18px;
  font-weight: 500;
}
.divider-col {
  padding-top: 44px;
  padding-bottom: 34px;
  padding-left: 35px;
}
.num-p {
  font-size: 25px;
  font-weight: 600;
}
.dialog-text {
  display: flex;
  justify-content: center;
  padding-top: 83px;
  font-size: 23px;
  font-weight: 500;
  color: black;
}
.col-width {
  max-width: 240px !important;
}
.discount-select {
  border: 1px solid #ccc;
  padding: 10px;
  cursor: pointer;
  border-radius: 4px;
}
.placeholder {
  color: #aaa;
}
.text-wrap {
  white-space: normal;
  word-wrap: break-word;
  text-align: center; /* Optional: Center the text */
  font-size: 20px;
  display: inline-block;
  max-width: 100%;
  white-space: normal;
  word-break: break-word; /* Ensures that words will break to the next line */
  overflow-wrap: break-word;
}
@media (max-width: 1024px) {
  .amount-p {
    font-size: 16px;
  }
  .title-p {
    font-size: 14px;
  }
  .col-width {
    max-width: 150px !important;
  }
  /* .divider-col {
    display: none;
  } */
  .amount-div {
    max-height: 80px !important;
  }
  .discount-select {
    padding: 3px;
  }
  .divider-col {
    padding-top: 10px !important;
    padding-bottom: 99px !important;
    padding-left: 35px !important;
  }
  .total-row {
    max-height: 85px;
  }
}
</style>