<template>
  <!-- <v-container fluid> -->
  <v-card class="summary-card pt-5 pl-5">
    <v-row no-gutters>
      <!-- Top Row for the first 7 dishes -->
      <v-col
        cols=""
        v-for="(dish, index) in dishes.slice(0, 8)"
        :key="index"
        class="dish-col"
      >
        <v-card
          class="dish-card"
          :class="{
            'dish-card': false,
            highlight: selectedGroup === dish,
          }"
          @click="selectedGroupItem(dish, 'main-item')"
        >
          <v-card-title
            ><p class="main-item-title mt-3">
              {{
                dish.item_group.length > 30
                  ? dish.item_group.substring(0, 30) + "..."
                  : dish.item_group
              }}
            </p></v-card-title
          >
        </v-card>
      </v-col>
    </v-row>
    <v-row no-gutters class="">
      <v-col cols="2" class="" style="max-width: 161px">
        <div
          class="verical-dish mt-2"
          v-for="(dish, index) in dishes.slice(8, 14)"
          :key="index + 8"
        >
          <v-card
            class="dish-card-vertical"
            :class="{
              'dish-card': false,
              highlight: selectedGroup === dish,
            }"
            @click="selectedGroupItem(dish, 'main-item')"
          >
            <v-card-title>
              <p class="main-item-title mt-3">
                {{
                  dish.item_group.length > 30
                    ? dish.item_group.substring(0, 30) + "..."
                    : dish.item_group
                }}
              </p></v-card-title
            >
          </v-card>
        </div>
      </v-col>
      <v-col cols="10" class="mt-2">
        <v-card-text
          class="d-flex flex-column justify-space-between"
          style="height: 100%"
        >
          <div>
            <v-row no-gutters style="max-height: 550px">
              <v-col
                cols="2"
                v-for="(dish, index) in subItemArray"
                :key="index"
              >
                <v-card
                  class="flavor-card mr-4 my-2"
                  @click="selectSubItem(dish, 'sub-item')"
                  :class="{ highlight: dish.selected }"
                >
                  <v-card-title
                    ><p class="sub-item-title mt-2">
                      {{
                        dish.display_name.length > 40
                          ? dish.display_name.substring(0, 40) + "..."
                          : dish.display_name
                      }}
                    </p></v-card-title
                  >
                </v-card>
              </v-col>
            </v-row>
          </div>
          <v-spacer></v-spacer>

          <!-- <v-row no-gutters class="mt-2" v-if="showQuantity">
          <v-col cols="12" class="quantity-section">
            <p class="mt-2">Quantity</p>
            <v-text-field
              label="Enter Number"
              class="name-input ml-6"
              clearable
              type="number"
              v-model="quantity"
            ></v-text-field>
          </v-col>
        </v-row> -->
          <!-- <v-row no-gutters class="mt-1" v-show="showQuantity">
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
              height="70px"
              @click="handleButtonClick(num)"
              ><p class="num-p mt-3">{{ num }}</p></v-btn
            >
          </v-col>
        </v-row> -->
          <div>
            <v-row no-gutters class="mt-1 button-row">
              <v-col
                cols="4"
                class="p-1"
                v-if="
                  orderDetailData &&
                  orderDetailData.order_type.order_type == 'Dine In'
                "
              >
                <v-btn
                  class="white--text font-26"
                  color="#AF002B"
                  depressed
                  block
                  elevation="4"
                  raised
                  x-large
                  height="80px"
                  @click="
                    openDialog(
                      'Enter Number of Persons',
                      'Enter Persons',
                      handlePersonClick
                    )
                  "
                >
                  Cover
                  <p class="ml-2 mt-4 font-26">
                    {{ currentOrderTable.persons }}
                  </p>
                  <v-icon right class="ml-3" size="28px">
                    mdi-pencil
                  </v-icon></v-btn
                >
              </v-col>
              <v-col cols="3" class="p-1">
                <v-btn
                  class="white--text font-26"
                  color="black"
                  depressed
                  block
                  elevation="3"
                  raised
                  x-large
                  height="80px"
                  @click="print_draft_invoice(false)"
                  >KOT</v-btn
                >
              </v-col>
              <v-col cols="3" class="p-1">
                <v-btn
                  class="white--text font-26"
                  color="black"
                  depressed
                  block
                  elevation="2"
                  raised
                  x-large
                  height="80px"
                  @click="print_draft_invoice(true)"
                  >Recipt Copy</v-btn
                >
              </v-col>

              <v-col cols="2" class="p-1">
                <v-btn
                  class="white--text font-26"
                  color="black"
                  depressed
                  block
                  elevation="2"
                  raised
                  x-large
                  height="80px"
                  @click="
                    openDialog(
                      'Enter Number of Qunatity',
                      'Enter Quantity',
                      handleQuantityClick
                    )
                  "
                  >Qty</v-btn
                >
              </v-col>
            </v-row>
          </div>
        </v-card-text>
      </v-col>
    </v-row>

    <v-row no-gutters class="mt-2 px-1 button-row">
      <!-- <Buttons :buttonType="buttonType"></Buttons> -->

      <v-col cols="2" class="p-1">
        <v-btn
          class="white--text font-26"
          color="#AF002B"
          depressed
          block
          elevation="2"
          raised
          x-large
          height="70px"
          @click="goToHome"
          >Home</v-btn
        >
      </v-col>
      <v-col cols="2" class="p-1">
        <v-btn
          class="white--text font-26"
          color="black"
          depressed
          block
          elevation="2"
          raised
          x-large
          height="70px"
          @click="handelSkipAddOn()"
          >Skip</v-btn
        >
      </v-col>

      <v-col cols="2" class="p-1">
        <v-btn
          class="white--text font-26"
          color="black"
          depressed
          block
          elevation="2"
          raised
          x-large
          height="70px"
          @click="handleBack()"
          >Back</v-btn
        >
      </v-col>
      <v-col cols="2" class="p-1">
        <v-btn
          class="white--text font-26"
          color="black"
          depressed
          block
          elevation="2"
          raised
          x-large
          height="70px"
          @click="nextOrder()"
          >Next</v-btn
        >
      </v-col>
      <v-col cols="2" class="p-1">
        <v-btn
          class="white--text font-26"
          color="black"
          depressed
          block
          elevation="2"
          raised
          x-large
          height="70px"
          @click="clearLastOrder()"
          >Clear</v-btn
        >
      </v-col>
      <v-col cols="2" class="p-1">
        <v-btn
          class="white--text font-26"
          color="black"
          depressed
          block
          elevation="2"
          raised
          x-large
          height="70px"
          @click="storeOrderAgainstTable()"
          >Store</v-btn
        >
      </v-col>
    </v-row>
    <v-dialog
      v-model="dialog"
      max-width="500"
      persistent
      class="right-corner-dialog"
    >
      <v-card>
        <v-card-title>
          <span class="headline">{{ dialogTitle }}</span>
        </v-card-title>
        <v-card-text>
          <v-text-field
            v-model="inputValue"
            :label="dialogLabel"
            type="number"
            outlined
            clearable
          ></v-text-field>
          <v-row no-gutters class="mt-1">
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
                height="70px"
                @click="handleButtonClick(num)"
                ><p class="num-p mt-3">{{ num }}</p></v-btn
              >
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-btn
            color="red"
            class="black--text"
            depressed
            elevation="0"
            raised
            x-large
            height="50px"
            @click="dialog = false"
            >Cancel</v-btn
          >
          <v-spacer></v-spacer>
          <v-btn
            color="green"
            class="black--text"
            depressed
            elevation="0"
            raised
            x-large
            height="50px"
            @click="confirmDialog"
            >OK</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
  <!-- </v-container> -->
</template>

<script>
import { evntBus } from "../../bus";
import Buttons from "./common/Buttons.vue";
export default {
  name: "DishSelection",
  components: {
    Buttons,
  },
  data() {
    return {
      dishes: [],
      numberPad: [1, 2, 3, 4, 5, 6, 7, 8, 9, "-", "+", "Back"],
      buttonType: [{ label: "Home" }, { label: "Back" }, { label: "Add" }],
      showQuantity: true,
      selectedParentItem: "",
      variants: [],
      currentVariantIndex: 0,
      subItemArray: [],
      quantity: "",
      dialog: false,
      orderDetailData: null,
      currentOrderTable: "",
      dialogTitle: "",
      dialogLabel: "",
      inputValue: "",
      cover: "",
      invoice_doc: null,
      pos_profile: "",
      ordertype: "",
      selectedGroup: "",
    };
  },
  watch: {
    selectedParentItem: {
      handler(newVal, oldVal) {},
    },
    deep: true,
  },

  methods: {
    goToHome() {
      // this.variants[this.currentVariantIndex].items;
      this.$emit("go-to-home");
      this.nextOrder();
      evntBus.$emit("default-order-summary");
      evntBus.$emit("change-table-cover", this.currentOrderTable);
    },
    openQunatityDialog() {
      if (this.selectedParentItem) {
        this.dialog = true;
      }
    },
    openDialog(title, label, handler) {
      this.dialogTitle = title;
      this.dialogLabel = label;
      this.currentHandler = handler;
      this.inputValue = "";
      if (label == "Enter Persons") {
        this.dialog = true;
      }
      if (label == "Enter Quantity" && this.selectedParentItem) {
        this.dialog = true;
      }
    },
    confirmDialog() {
      this.dialog = false;
      this.currentHandler();
    },

    handleButtonClick(num) {
      if (num === "Back") {
        this.inputValue = this.inputValue.slice(0, -1);
        if (this.inputValue == "") {
          this.inputValue = "1";
          this.$nextTick(() => {
            this.inputValue = "1";
          });
        }
      } else if (num == "-") {
        if (this.inputValue > 0) {
          this.inputValue = (parseInt(this.inputValue) - 1).toString();
        }
      } else if (num == "+") {
        this.inputValue = (parseInt(this.inputValue) + 1).toString();
      } else {
        this.inputValue += num.toString();
      }
      this.dialogLabel == "Enter Quantity"
        ? (this.quantity = this.inputValue)
        : (this.cover = this.inputValue);
      // if (this.quantity >= 1) {
      //   evntBus.$emit("add-quantity", this.quantity, this.selectedParentItem);
      // }
    },
    handleQuantityClick() {
      evntBus.$emit("add-quantity", this.quantity, this.selectedParentItem);
    },
    handlePersonClick() {
      this.currentOrderTable.persons = this.cover;
      evntBus.$emit("change-person-count", this.currentOrderTable);
    },
    toggleQuantity() {
      if (this.selectedParentItem) {
        this.showQuantity = !this.showQuantity;
      }
    },
    generateUniqueId() {
      return `id-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    },
    selectedGroupItem(dish, type) {
      if (!this.selectedParentItem) {
        this.nextOrder();
        this.selectedParentItem = dish;
        this.selectedGroup = dish;
        this.get_items(this.orderDetailData, dish);
      }
    },
    selectedDish(dish, type) {
      // if (!this.selectedParentItem) {
      // Create a deep copy of the dish object
      let newDish = JSON.parse(JSON.stringify(dish));

      newDish.itemType = type;
      let id = this.generateUniqueId();
      newDish.id = id;
      this.selectedParentItem = newDish;
      if (this.selectedParentItem.has_variants) {
        this.get_variants(newDish);
      }
      evntBus.$emit("make-order-summary", this.selectedParentItem, type, "");
      // }
    },
    nextOrder() {
      this.selectedParentItem = "";
      this.selectedGroup = "";
      this.currentVariantIndex = 0;
      this.subItemArray = [];
      // this.showQuantity=false
    },
    storeOrderAgainstTable() {
      // if (this.selectedParentItem) {
      evntBus.$emit("save-table-order", false);
      // }
    },
    print_draft_invoice(key) {
      // if (this.selectedParentItem) {
      evntBus.$emit("save-table-order", true);
      this.formatFlag = key;
      // }
    },
    load_print_page(invoice_name, key) {
      const print_format =
        this.pos_profile.print_format_for_online ||
        this.pos_profile.print_format;
      const default_format = "Sales%20Invoice%20Print";
      let format = "";
      key
        ? (format = this.pos_profile?.pre_invoice_pirnt_format
            ? this.pos_profile?.pre_invoice_pirnt_format
            : default_format)
        : (format = this.pos_profile?.kot_print_format
            ? this.pos_profile?.kot_print_format
            : default_format);

      const letter_head = this.pos_profile.letter_head || 0;
      const url =
        frappe.urllib.get_base_url() +
        "/printview?doctype=Sales%20Invoice&name=" +
        invoice_name +
        "&trigger_print=1&format=" +
        encodeURIComponent(format) +
        "&no_letterhead=" +
        letter_head;
      console.log("url,", url);
      const printWindow = window.open(url, "Print");
      printWindow.addEventListener(
        "load",
        function () {
          printWindow.print();
          // printWindow.close();
          // NOTE : uncomoent this to auto closing printing window
        },
        true
      );
    },

    selectSubItem(dish, type) {
      // dish.itemType = type;
      // dish.selected = true;
      // this.selectedParentItem=dish
      if (dish.type == "main-item") {
        this.selectedDish(dish, "main-item");
      } else {
        this.subItemArray.forEach((item) => {
          if (item === dish) {
            item.itemType = type;
            item.selected = true;
          } else {
            item.selected = false;
          }
        });
        this.subItemArray = [...this.subItemArray];
        console.log("dish-selected", dish);
        if (dish.is_deal) {
          for (let i = 0; i < dish.item_add_ons.length; i++) {
            console.log("loop", i);
            dish.item_add_ons[i].is_deal = dish.is_deal;
            evntBus.$emit(
              "make-order-summary",
              dish.item_add_ons[i],
              type,
              this.selectedParentItem,
              this.currentVariantIndex
            );
          }
        } else {
          evntBus.$emit(
            "make-order-summary",
            dish,
            type,
            this.selectedParentItem,
            this.currentVariantIndex
          );
        }

        this.variants[this.currentVariantIndex].selected = true;
        if (this.currentVariantIndex < this.variants.length - 1) {
          this.currentVariantIndex = this.currentVariantIndex + 1;
          this.subItemArray = this.variants[this.currentVariantIndex].values;
          this.subItemArray.forEach((element) => {
            if (!element.doctype) {
              element.display_name = element.abbr;
              element.type = "variant";
            } else if (element.doctype == "Item Specifics Child") {
              element.type = "item-specifics";
              element.display_name = element.item_specifics_name;
            } else {
              element.type = "add-on";
            }
          });
        } else {
          if (dish.type !== "item-specifics") {
            this.nextOrder();
          }
        }
      }
    },
    handleBack() {
      if (this.currentVariantIndex > 0) {
        this.currentVariantIndex = this.currentVariantIndex - 1;
        this.subItemArray = this.variants[this.currentVariantIndex].values;
        this.subItemArray.forEach((element) => {
          if (!element.doctype) {
            element.display_name = element.abbr;
            element.type = "variant";
          } else if (element.doctype == "Item Specifics Child") {
            element.type = "item-specifics";
            element.display_name = element.item_specifics_name;
          } else {
            element.type = "add-on";
          }
        });
      }
    },
    handelSkipAddOn() {
      if (
        this.subItemArray.length > 0 &&
        this.subItemArray[0].type == "add-on"
      ) {
        if (this.currentVariantIndex < this.variants.length - 1) {
          this.currentVariantIndex = this.currentVariantIndex + 1;
          this.subItemArray = this.variants[this.currentVariantIndex].values;
          this.subItemArray.forEach((element) => {
            if (!element.doctype) {
              element.display_name = element.abbr;
              element.type = "variant";
            } else if (element.doctype == "Item Specifics Child") {
              element.type = "item-specifics";
              element.display_name = element.item_specifics_name;
            } else {
              element.type = "add-on";
            }
          });
        }
      }
    },
    clearLastOrder() {
      // evntBus.$emit("clear-last-order");
      this.nextOrder();
    },
    get_variants(value) {
      const vm = this;
      frappe.call({
        method: "tabrah_pos.tabrah_pos.api.posapp.get_variants_addons",
        args: {
          item_code: value.item_code,
          order_type: vm.ordertype.name,
        },
        callback: function (r) {
          if (r.message) {
            evntBus.$emit("get-variant-array", r.message[0].variants);
            if (r.message[0].add_ons.length > 0) {
              value.calledBundleApi = true;
            }
            let dealArray = r.message[0].add_ons.filter((item) => item.is_deal);
            console.log("DEal-array", dealArray);
            let noDealArray = r.message[0].add_ons.filter(
              (item) => !item.is_deal
            );
            // r.message[0].Attributes[0];
            vm.variants = [
              ...r.message[0].Attributes[0],
              ...dealArray,
              ...noDealArray,
            ];
            console.log("vm.variants", vm.variants);
            vm.variants.forEach((element) => {
              element.selected = false;
              if (element?.doctype == "Item Add-Ons") {
                if (element.is_deal) {
                  let array = [];
                  array.push(element);
                  element.values = array;
                } else {
                  element.values = element.item_add_ons;
                }
              }
              if (element.item_type == "Item Specifics") {
                element.values = element.item_specifics;
                element.doctype = "Item Specifics";
              }
            });
            vm.subItemArray = vm.variants[vm.currentVariantIndex].values;

            vm.subItemArray.forEach((element) => {
              if (!element.doctype) {
                element.display_name = element.abbr;
                element.type = "variant";
              } else if (element.doctype == "Item Specifics Child") {
                element.type = "item-specifics";
                element.display_name = element.item_specifics_name;
              } else {
                element.type = "add-on";
              }
            });
          }
        },
      });
    },

    get_items(data, groupItem) {
      const vm = this;
      frappe.call({
        method: "tabrah_pos.tabrah_pos.api.posapp.get_items",
        args: {
          pos_profile: data.pos_profile,
          price_list: "",
          item_group: groupItem.item_group,
          search_value: "",
          customer: "Walk in",
          order_type: data.order_type.name,
        },
        callback: function (r) {
          if (r.message) {
            // vm.dishes = r.message;
            r.message.forEach((item) => {
              (item.display_name = item.item_name), (item.type = "main-item");
            });
            vm.subItemArray = r.message;
          }
        },
      });
    },
  },
  mounted() {
    evntBus.$on("order-detail", (data) => {
      this.orderDetailData = data;
      this.dishes = data.pos_profile.item_groups;
      this.pos_profile = data.pos_profile;
      this.ordertype = data.order_type;
      // this.get_items(data);
    });
    evntBus.$on("open-menu-detail", (data) => {
      this.orderDetailData = data;
      this.dishes = data.pos_profile.item_groups;
      this.pos_profile = data.pos_profile;
      this.ordertype = data.order_type;
      // this.get_items(data);
    });
    evntBus.$on("clear-menu-screen", () => {
      this.nextOrder();
    });
    evntBus.$on("update-quantity", (item) => {
      this.selectedParentItem = item;
      this.quantity = "";
    });
    evntBus.$on("table-detail", (data) => {
      this.currentOrderTable = data;
    });
    evntBus.$on("called-print-invoice", (data) => {
      this.invoice_doc = data;
      this.load_print_page(data.name, this.formatFlag);
    });
    evntBus.$on("go-for-new-order", () => {
      // this.goToHome();
      this.nextOrder();
      evntBus.$emit("default-order-summary");
      evntBus.$emit("change-table-cover", this.currentOrderTable);
    });
  },
  beforeDestroy() {
    evntBus.$off("update-quantity");
    evntBus.$off("clear-menu-screen");
    evntBus.$off("order-detail");
    evntBus.$off("table-detail");
    evntBus.$off("called-print-invoicel");
  },
};
</script>

<style scoped>
.dish-col,
.dish-col-vertical {
  padding: 3px;
  margin-right: 8px;
}
.verical-dish {
  padding: 2px;
  width: 140px;
}
.quantity-section {
  font-size: 20px;
  font-weight: 600;
}
.dish-card,
.dish-card-vertical {
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f9c94c !important;
}
.flavor-card {
  height: 90px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f4f4f4 !important;
}
.summary-card {
  height: 92vh;
  border-radius: 8px !important;
}

.flavor-card {
  background-color: #f5f5f5; /* Example background color for flavor cards */
}

.quantity-section {
  display: flex;
  align-items: center;
}
.highlight {
  background: #ff7e28 !important; /* Example highlight background color */
}
.sub-item-title {
  font-size: 14px;
  font-weight: 600;
  display: inline-block;
  max-width: 100%;
  white-space: normal;
  word-break: break-word; /* Ensures that words will break to the next line */
  overflow-wrap: break-word; /* Older specification for word breaking */
}
.main-item-title {
  font-size: 16px;
  font-weight: 600;
  display: inline-block;
  max-width: 100%;
  white-space: normal;
  word-break: break-word; /* Ensures that words will break to the next line */
  overflow-wrap: break-word; /* Older specification for word breaking */
}
.num-p {
  font-size: 25px;
  font-weight: 600;
}
.v-sheet.v-card:not(.v-sheet--outlined) {
  box-shadow: none !important;
}
.v-dialog__content {
  position: absolute !important;
  top: 10px !important;
  right: 0px !important;
  bottom: auto !important;
  left: 650px !important;
  margin: 0 !important;
}
.button-row {
  position: relative;
  /* top: 230px; */
}
</style>
