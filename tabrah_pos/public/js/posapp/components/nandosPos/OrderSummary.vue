<template>
  <v-card class="summary-card">
    <!-- Order Details -->
    <v-card-text
      class="order-text"
      :class="{ 'delivery-order-h': customerDetail.phone }"
    >
      <div class="order-detail">
        <!-- Header Row -->
        <v-row class="header-row header-style">
          <v-col cols="6" class="header-name">Name</v-col>
          <v-col cols="2" class="header-center">Qty</v-col>
          <v-col cols="3" class="header-right">Price</v-col>
        </v-row>
        <v-divider></v-divider>

        <!-- Order Items -->
        <v-row v-for="(item, index) in orderItems" :key="index">
          <v-col cols="6" class="mt-1 d-flex pb-0">
            <p class="index-p">{{ index + 1 }}</p>
            <p class="order-item-p">- {{ item.main_item.item_name }}</p>
          </v-col>
          <v-col
            cols="2"
            class="mt-2 ml-0.5 pb-0"
            @click="updateQuantity(item)"
          >
            <p class="order-item-p">{{ item.main_item.quantity }}</p>
          </v-col>
          <v-col cols="2" class="mt-2 pb-0">
            <p class="order-item-p">{{ item.main_item.rate }}</p>
          </v-col>
          <v-col cols="2" class="pr-8">
            <v-btn
              color="red"
              elevation="2"
              icon
              outlined
              tile
              @click="deleteItem(index)"
              class="float-right"
            >
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </v-col>
          <!-- Sub Items -->
          <div
            v-for="(subItem, subIndex) in item.sub_items"
            :key="subIndex"
            style="display: contents"
          >
            <v-col cols="6" class="py-0 pl-8">
              <p class="order-item-p">--{{ subItem.display_name }}</p>
            </v-col>
            <v-col cols="2" class="py-0">
              <p class="order-item-p">-</p>
            </v-col>
            <v-col cols="2" class="py-0">
              <p class="order-item-p">{{ subItem.rate || 0.0 }}</p>
            </v-col>
          </div>
        </v-row>
      </div>
    </v-card-text>

    <v-divider></v-divider>

    <!-- Payment Details -->
    <v-card-text class="payment-text">
      <div class="payment-detail">
        <v-list-item>
          <v-list-item-content class="d-block">
            <div class="d-flex" v-if="customerDetail.phone">
              <p class="payment-value">
                C/Name:
                {{
                  customerDetail.name.length > 30
                    ? customerDetail.name.substring(0, 30) + "..."
                    : customerDetail.name
                }}
              </p>
              <v-spacer></v-spacer>
              <p class="payment-value">Ph# {{ customerDetail.phone }}</p>
            </div>
            <div class="d-flex">
              <p class="payment-item">
                {{ active_emp.employee_name }} ({{ active_emp.designation }})
              </p>
              <v-spacer></v-spacer>
              <p class="payment-value">{{ currentDateTime }}</p>
            </div>
            <div class="d-flex">
              <p class="payment-item">GST:</p>
              <v-spacer></v-spacer>
              <p class="payment-value">{{ paymentType.tax_rate }} %</p>
            </div>
            <div class="d-flex">
              <p class="payment-item">Sub total:</p>
              <v-spacer></v-spacer>
              <p class="payment-value">Rs. {{ subTotal }}</p>
            </div>
            <div class="d-flex">
              <p class="payment-item">Grand Total:</p>
              <v-spacer></v-spacer>
              <p class="payment-value">Rs. {{ totalRate }}</p>
            </div>
          </v-list-item-content>
        </v-list-item>
      </div>
      <v-card-actions class="payment-btn">
        <v-btn
          class="white--text font-30"
          color="#AF002B"
          :class="{ 'mt-2': !customerDetail, 'mt-7': customerDetail }"
          depressed
          block
          elevation="0"
          raised
          x-large
          height="55px"
          @click="goToPaymentScreen()"
        >
          Payment
        </v-btn>
      </v-card-actions>
    </v-card-text>
  </v-card>
</template>

  
  <script>
import { evntBus } from "../../bus";

export default {
  name: "OrderSummary",
  props: {
    order: Object,
  },
  data() {
    return {
      orderItems: [],
      totalRate: 0,
      subTotal: 0,
      bundleItem: [],
      availableVariants: [],
      isUpdatingOrderItems: false,
      updateIndex: 0,
      item_specifics: [],
      noVariantItems: [],
      invoice_doc: {},
      posting_date: this.getCurrentDate(),
      selectedTable: "",
      pos_profile: "",
      ordertype: "",
      cover: "",
      bundleItems: null,
      pos_opening_shift: "",
      invoiceDataArray: [],
      checkVaiantItemExist: false,
      loading: false,
      bundleForVariant: [],
      customerDetail: "",
      paymentType: "",
      delivery_charges_name: "",
      delivery_charges_rate: 0,
      active_emp: "",
      currentDateTime: "",
      timeInterval: null,
    };
  },
  watch: {
    orderItems: {
      handler() {
        this.updateTotalRate();
        this.makeBundleString();
        this.checkVariantExist();
        this.getNoVariantItems();
      },
      deep: true, // Watch nested properties for changes
    },
    isUpdatingOrderItems: {
      handler(val) {
        if (val) {
          this.updateOrderItems();
        }
      },
      deep: true,
    },
  },

  methods: {
    deleteItem(index) {
      this.orderItems.splice(index, 1);
      if (this.orderItems.length == 0) {
        evntBus.$emit("clear-menu-screen");
        this.updateIndex = 0;
      }
      if (this.orderItems.length > 0) {
        this.updateIndex -= 1;
      }
    },
    checkVariantExist() {
      this.checkVaiantItemExist = this.orderItems.some(
        (item) => item.main_item.calledBundleApi
      );
    },
    updateQuantity(data) {
      evntBus.$emit("update-quantity", data.main_item);
    },
    getNoVariantItems() {
      const noVariantArray = [];
      this.orderItems.forEach((item, index) => {
        const { main_item, sub_items } = item;
        if (!main_item.calledBundleApi) {
          const subItemNames = [];
          sub_items.forEach((subItem) => {
            if (
              subItem.type !== "add-on" &&
              subItem.type !== "item-specifics"
            ) {
              subItemNames.push(subItem.display_name);
            }
          });
          if (subItemNames.length > 0) {
            const itemNameString = `${main_item.item_code}-${subItemNames.join(
              "-"
            )}`;
            const mainItemObject = {
              item_code: itemNameString,
              item_group: main_item.item_group,
              qty: main_item.quantity,
              rate: main_item.rate,
              type: "variant",
              indexNo: index,
            };
            noVariantArray.push(mainItemObject);
          } else {
            const mainItemObject = {
              item_code: main_item.item_code,
              item_group: main_item.item_group,
              qty: main_item.quantity,
              rate: main_item.rate,
              indexNo: index,
            };
            noVariantArray.push(mainItemObject);
          }
          // noVariantArray.push(mainItemObject);
        }
      });
      this.noVariantArray = noVariantArray;
      // this.availableVariants.forEach((item)=>{
      //   item.rateUpdated=false
      // })
      this.noVariantArray.forEach((item) => {
        if (item.type !== "add-on" && !item.rateUpdated) {
          // Process only if rateUpdated is not true
          let matchedVariant = this.availableVariants.find(
            (variant) =>
              variant.item_code == item.item_code && !variant.rateUpdated // Check both item_code and rateUpdated
          );
          console.log(" this.availableVariants", this.availableVariants);

          if (matchedVariant) {
            matchedVariant.rateUpdated = true;
            console.log("variant match......", matchedVariant.item_code);
            console.log("this.updateIndex", this.updateIndex);

            if (
              this.updateIndex > 0 &&
              this.updateIndex - 1 < this.orderItems.length
            ) {
              console.log(
                "update-orderitem",
                this.orderItems[this.updateIndex - 1]
              );

              let rate = matchedVariant.rate;
              this.orderItems[this.updateIndex - 1].main_item.rate = rate;
              item.rateUpdated = true; // Set rateUpdated to true after updating the rate
            }
          }
        }
      });
      console.log("this.noVariantArray ", this.noVariantArray);
    },

    makeBundleString() {
      const resultArray = [];
      const itemSpecificArray = [];
      let mainBundle = [];

      this.orderItems.forEach((item, index) => {
        const { main_item, sub_items } = item;
        if (!resultArray[index]) {
          resultArray[index] = [];
        }
        if (!itemSpecificArray[index]) {
          itemSpecificArray[index] = [];
        }
        if (main_item.calledBundleApi) {
          console.log("index", index, item);
          const subItemNames = [];

          sub_items.forEach((subItem) => {
            if (
              subItem.type !== "add-on" &&
              subItem.type !== "item-specifics"
            ) {
              subItemNames.push(subItem.display_name);
            }
          });

          const itemNameString = `${main_item.item_code}-${subItemNames.join(
            "-"
          )}`;
          const mainItemObject = {
            item_code: itemNameString,
            item_group: main_item.item_group,
            qty: main_item.quantity,
            rate: main_item.rate,
            type: "variant",
            indexNo: index,
          };

          // Push the main item object to the resultArray at the current index
          resultArray[index].push(mainItemObject);
          sub_items.forEach((subItem) => {
            if (subItem.type === "add-on") {
              const addOnItemObject = {
                item_code: subItem.item,
                item_group: subItem.item_group,
                qty: main_item.quantity,
                rate: subItem.rate,
                type: "add-on",
                indexNo: index,
              };
              resultArray[index].push(addOnItemObject);
            }
            if (subItem.type == "item-specifics") {
              itemSpecificArray[index].push({ name: subItem.display_name });
            }
          });
          this.bundleForVariant = resultArray;
          console.log("check-result-array", resultArray);

          mainBundle.push({
            items: resultArray[index],
            item_specifics: itemSpecificArray[index],
          });
        }
      });

      console.log("make-bundle", mainBundle);
      this.bundleItem = mainBundle;
    },
    getItemBundle(key, Print = false) {
      console.log("bundle-payload", this.bundleItem);
      const vm = this;
      const obj = {
        items: vm.bundleItem,
      };
      frappe.call({
        method: "tabrah_pos.tabrah_pos.api.posapp.create_bundle_from_item",
        args: {
          json_data: obj,
        },
        callback: function (response) {
          if (response.message) {
            console.log("bundle-ready", response.message);
            // if (key) {
            //   vm.$emit("go-to-payment");
            // }
            vm.bundleItems = response.message;
            vm.invoiceDataArray = [...vm.bundleItems, ...vm.noVariantArray];
            console.log("invoiceDataArray", vm.invoiceDataArray);

            vm.processInvoice(key, Print);

            // const obj = {
            //   orderItem: response.message,
            //   subTotal: vm.subTotal,
            //   orderSummary: vm.orderItems,
            // };
            // evntBus.$emit("called-payment-invoice", obj);
          }
        },
      });
    },
    processInvoice(key, print) {
      const doc = this.get_invoice_doc();
      if (doc.name) {
        return this.update_invoice(doc, key, print);
      } else {
        return this.update_invoice(doc, key, print);
      }
    },
    get_invoice_doc() {
      let doc = {};
      if (this.invoice_doc?.name) {
        doc = { ...this.invoice_doc };
      }
      doc.doctype = "Sales Invoice";
      doc.is_pos = 1;
      doc.ignore_pricing_rule = 1;
      doc.company = doc.company || this.pos_profile.company;
      doc.pos_profile = doc.pos_profile || this.pos_profile.name;
      doc.campaign = doc.campaign || this.pos_profile.campaign;
      doc.currency = doc.currency || this.pos_profile.currency;
      doc.naming_series = doc.naming_series || this.pos_profile.naming_series;
      doc.customer = this.pos_profile.customer || "Walk in";
      doc.items = this.checkVaiantItemExist
        ? this.invoiceDataArray
        : this.noVariantArray;
      doc.total = this.subTotal;
      doc.discount_amount = 0;
      doc.additional_discount_percentage = 0;
      doc.posa_pos_opening_shift = this.pos_opening_shift.name;
      doc.payments = this.get_payments();
      doc.taxes = [];
      doc.is_return = "";
      doc.return_against = "";
      doc.posa_offers = [];
      doc.posa_coupons = [];
      doc.posa_delivery_charges = this.delivery_charges_name || "";
      doc.posa_delivery_charges_rate = this.delivery_charges_rate || 0;
      doc.posting_date = this.getCurrentDate();
      doc.table_no = this.selectedTable.table_no;
      doc.resturent_type = this.ordertype.name;
      doc.order_summery_for_pos = this.orderItems;
      doc.cost_center = this.pos_profile.cost_center;
      doc.cover = this.cover;
      doc.order_by = this.pos_profile.active_emp.employee;
      return doc;
    },
    update_invoice(doc, key, print) {
      const vm = this;
      frappe.call({
        method: "tabrah_pos.tabrah_pos.api.posapp.update_invoice",
        args: {
          data: doc,
        },
        async: false,
        callback: function (r) {
          if (r.message) {
            console.log("final-result", r.message);
            vm.invoice_doc = r.message;

            vm.loading = false;
            if (key) {
              vm.$emit("go-to-payment");
            } else {
              evntBus.$emit("go-for-new-order");
              vm.pos_profile.login = false;
              evntBus.$emit("go-to-pin-screen");
            }
            if (print) {
              evntBus.$emit("called-print-invoice", vm.invoice_doc);
              vm.pos_profile.login = false;
              evntBus.$emit("go-to-pin-screen");
            }
            evntBus.$emit("updated-invoice", vm.invoice_doc);
            evntBus.$emit("show_mesage", {
              text: `Order store Successfully`,
              color: "success",
            });
          }
        },
        error: function (requestError) {
          vm.loading = false; // Stop loading state
          console.error("Request Error: ", requestError);
          evntBus.$emit("show_mesage", {
            text: `Something went wrong with the request..`,
            color: "error",
          });
          frappe.utils.play_sound("error");
        },
      });
      //   return this.invoice_doc;
    },
    get_payments() {
      const payments = [];
      this.pos_profile.payments.forEach((payment) => {
        payments.push({
          amount: 0,
          mode_of_payment: payment.mode_of_payment,
          default: payment.default,
          account: "",
        });
      });
      return payments;
    },
    getCurrentDate() {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0"); // Add 1 to month since getMonth() returns 0-11
      const day = String(today.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    },
    updateTotalRate() {
      // this.updateOrderItems()
      console.log("hello-this.orderItems", this.orderItems);
      let baseTotal = this.orderItems.reduce((total, item) => {
        let mainItemRate = parseFloat(item.main_item.rate);
        let mainItemQuantity = parseInt(item.main_item.quantity);
        if (!isNaN(mainItemRate) && !isNaN(mainItemQuantity)) {
          total += mainItemRate * mainItemQuantity;
        }

        // Add sub item rates
        if (item.sub_items) {
          total += item.sub_items.reduce((subTotal, subItem) => {
            let subItemRate = parseFloat(subItem.rate);
            if (!isNaN(subItemRate)) {
              return subTotal + subItemRate;
            }
            return subTotal;
          }, 0);
        }

        return total;
      }, 0);

      // Calculate GST
      let taxRate = this.paymentType.tax_rate / 100;
      this.subTotal = baseTotal;
      let gstAmount = baseTotal * taxRate;

      // Calculate total rate including GST
      this.totalRate = baseTotal + gstAmount;
    },
    goToPaymentScreen() {
      // this.$emit('go-to-payment')
      if (this.orderItems.length > 0) {
        this.loading = true;
        if (this.checkVaiantItemExist) {
          this.getItemBundle(true);
        } else {
          this.processInvoice(true);
        }
      }
    },
    updateOrderItems() {
      if (this.isUpdatingOrderItems) {
        // this.getVariantrate()
        this.bundleItem.forEach((item) => {
          item.rateUpdated = false;
        });
        this.bundleForVariant.forEach((itemArray, index) => {
          // Loop through each array inside bundleForVariant (itemArray is an array)
          itemArray.forEach((item) => {
            if (item.type !== "add-on" && !item.rateUpdated) {
              // Process only if rateUpdated is not true
              let matchedVariant = this.availableVariants.find(
                (variant) =>
                  variant.item_code == item.item_code && !variant.rateUpdated // Check both item_code and rateUpdated
              );

              if (matchedVariant) {
                // matchedVariant.rateUpdated = true;
                console.log("variant match......", matchedVariant.item_code);

                if (index < this.orderItems.length) {
                  // Use index to update the corresponding order item
                  console.log("update-orderitem", this.orderItems[index]);

                  let rate = matchedVariant.rate;
                  this.orderItems[index].main_item.rate = rate;
                  item.rateUpdated = true; // Set rateUpdated to true after updating the rate
                }
              }
            }
          });
        });
      }
      this.isUpdatingOrderItems = false;
    },
    // getVariantrate() {
    //   try {
    //     this.bundleForVariant.forEach((item) => {
    //       const response = frappe.call({
    //         method: "tabrah_pos.tabrah_pos.api.posapp.get_variant_with_rate",
    //         args: {
    //           item_code: "1/2 Chicken-Hot",
    //           order_type: this.ordertype,
    //         },
    //       });
    //       console.log("hello-variant", response);
    //     });
    //   } catch (error) {
    //     console.error("Error fetching table names:", error);
    //   }
    // },
    updateCurrentDateTime() {
      const now = new Date();

      // Get the date (formatted as YYYY-MM-DD)
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const date = `${year}-${month}-${day}`;

      // Get the time (formatted as hh:mm:ss)
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const seconds = String(now.getSeconds()).padStart(2, "0");
      const time = `${hours}:${minutes}:${seconds}`;

      // Combine date and time
      this.currentDateTime = `${date} ${time}`;
    },

    // Method to start the clock that updates every second
    startClock() {
      this.timeInterval = setInterval(() => {
        this.updateCurrentDateTime();
      }, 1000); // Update every second
    },
  },
  mounted() {
    this.updateCurrentDateTime();
    this.startClock();
    evntBus.$on(
      "make-order-summary",
      (data, type, parentItem, subItemIndex) => {
        console.log("dish-item", data);
        // if(this.orderItems.length==0){
        //   this.updateIndex=0
        // }
        if (type == "main-item") {
          data.quantity = 1;
          this.updateIndex = this.updateIndex + 1;
          this.orderItems.push({ main_item: data, sub_items: [] });
        } else {
          if (this.orderItems.length > 0) {
            const parentIndex = this.orderItems.findIndex(
              (item) => item.main_item.id === parentItem.id
            );
            let subItems = [];
            if (parentIndex !== -1) {
              // this.orderItems[parentIndex].sub_items[subItemIndex]=data;
              subItems = this.orderItems[parentIndex].sub_items;
              if (data.type == "item-specifics") {
                subItems.push(data);
              } else if (data.is_deal) {
                subItems.push(data);
              } else {
                subItems.push(data);
                // if (subItems.length > subItemIndex) {
                //   // Update existing value
                //   subItems[subItemIndex] = data;
                // } else {
                //   // Push new value at the specific index
                //   while (subItems.length <= subItemIndex) {
                //     subItems.push({});
                //   }
                //   subItems[subItemIndex] = data;
                // }
              }
              let vm = this;
              this.orderItems[parentIndex].sub_items = subItems;
            }
            this.orderItems[parentIndex].sub_items = [];
            this.orderItems[parentIndex].sub_items = subItems;
          }
        }
        this.isUpdatingOrderItems = true;
        evntBus.$emit("order-summary-array", this.orderItems);

        // this.updateOrderItems();
      }
    );
    evntBus.$on("clear-last-order", () => {
      this.orderItems.pop();
    });
    evntBus.$on("add-quantity", (quantity, selectedParentItem) => {
      quantity = Number(quantity);
      if (this.orderItems.length > 0) {
        let vm = this;
        const parentIndex = this.orderItems.findIndex(
          (item) => item.main_item.item_name === selectedParentItem.item_name
        );
        if (parentIndex !== -1) {
          this.$set(
            this.orderItems[parentIndex].main_item,
            "quantity",
            quantity
          );
          this.orderItems = [...this.orderItems];
        }
      }
    });
    evntBus.$on("default-order-summary", () => {
      this.orderItems = [];
      evntBus.$emit("clear-menu-screen");
      this.updateIndex = 0;
    });
    evntBus.$on("get-variant-array", (data) => {
      this.availableVariants = [];
      this.availableVariants = data;
    });
    evntBus.$on("save-table-order", (data) => {
      if (this.orderItems.length > 0) {
        if (this.checkVaiantItemExist) {
          this.getItemBundle(false, data);
        } else {
          this.processInvoice(false, data);
        }
      }
    });
    evntBus.$on("update-invoice-for-discount", () => {
      this.processInvoice(false);
    });
    evntBus.$on("get-order-summary", (data) => {
      this.orderItems = [];
      this.orderItems = JSON.parse(data);
      this.updateIndex = this.orderItems.length;
      evntBus.$emit("order-summary-array", this.orderItems);
    });
    evntBus.$on("sent-table-no", (table) => {
      this.selectedTable = table;
    });
    evntBus.$on("order-detail", (obj) => {
      this.pos_profile = obj.pos_profile;
      this.ordertype = obj.order_type;
      // this.selectedTable = obj.table_no.tableNumber;
      this.cover = obj.table_no.persons;
    });
    evntBus.$on("open-menu-detail", (obj) => {
      this.pos_profile = obj.pos_profile;
      this.ordertype = obj.order_type;
    });

    evntBus.$on("register_pos_profile", (data) => {
      this.pos_profile = data.pos_profile;
      this.pos_opening_shift = data.pos_opening_shift;
      this.paymentType = this.pos_profile.payments.find((item) => {
        if (item.default) {
          return item;
        }
      });
    });
    evntBus.$on("set-default-data", () => {
      this.invoice_doc = {};
      this.delivery_charges_rate = 0;
      this.customerDetail = "";
      this.pos_profile.customer = "Walk in";
    });
    evntBus.$on("set-invoice-doc", (data) => {
      this.invoice_doc = data;
    });
    evntBus.$on("customer-detail", (form) => {
      console.log("get-customer", form);
      this.customerDetail = form;
      this.pos_profile.customer = form.name;
    });
    evntBus.$on("set-deilvery-charges", (data) => {
      this.delivery_charges_rate = data.default_rate;
      this.delivery_charges_name = data.name;
    });
    evntBus.$on("active-employee", (data) => {
      this.active_emp = data;
    });
  },
  beforeDestroy() {
    evntBus.$off("get-order-summary");
    evntBus.$off("save-table-order");
    evntBus.$off("default-order-summary");
    evntBus.$off("get-variant-array");
    evntBus.$off("add-quantity");
    evntBus.$off("clear-last-order");
    evntBus.$off("make-order-summary");
    evntBus.$off("sent-table-no");
    evntBus.$off("order-detail");
    evntBus.$off("update-invoice-for-discount");
    evntBus.$off("register_pos_profile");
    evntBus.$off("set-default-data");
    evntBus.$off("set-invoice-doc");
    evntBus.$off("customer-detail");
    clearInterval(this.timeInterval);
  },
};
</script>
  
  <style scoped>
.order-text {
  display: flex;
  flex-direction: column;
  height: 68%;
}
.default-order-h {
  height: 70%;
}
.delivery-order-h {
  height: 70% !important;
}
.payment-text {
  height: 30%;
}

/* .order-text > div:first-child {
    flex: 1;
  } */

.order-summary {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 5px;
}

.order-item {
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid #ddd;
  padding: 10px 0;
}

.order-totals {
  margin-top: 20px;
}

.payment-button {
  background-color: #d90429;
  color: white;
  padding: 10px 20px;
  border: none;
  cursor: pointer;
  font-size: 16px;
  width: 100%;
  text-align: center;
  margin-top: 20px;
}

.summary-card {
  height: 92vh;
  border-radius: 8px !important;
}
.order-no {
  font-size: 20px;
  font-weight: 600;
}
.header-style {
  color: black;
  font-size: 16px;
  font-weight: 600;
}
.item-divider {
  position: relative;
  bottom: 24px;
}
.order-detail {
  max-height: 700px;
  overflow-y: scroll;
  overflow-x: hidden;
}
.payment-detail {
  height: 60%;
}
.payment-item {
  font-size: 16px;
  font-weight: 500;
}
.payment-value {
  font-size: 18px;
  font-weight: 600;
}
.order-item-p {
  font-size: 14px;
  font-weight: 500;
}
.index-p {
  font-weight: 600;
}
/* Adjust styles for 1024x768 resolution */
@media (min-width: 1024px) and (max-width: 1280px) {
  .order-text {
    font-size: 14px;
  }
  .payment-text {
    font-size: 16px;
  }
  .order-item-p {
    font-size: 12px;
  }
  .header-name,
  .header-center,
  .header-right {
    font-size: 14px;
  }
}

/* Adjust button height and font size for medium screens */
@media (max-width: 1264px) {
  .font-30 {
    font-size: 18px !important;
  }

  .v-btn {
    height: 45px !important;
  }
  .payment-btn {
    margin-top: 6px;
  }
}

/* Custom styles for different breakpoints */
@media (max-width: 960px) {
  .summary-card {
    padding: 10px;
  }

  .payment-text {
    font-size: 14px;
  }

  .order-item-p {
    font-size: 10px;
  }
}
</style>