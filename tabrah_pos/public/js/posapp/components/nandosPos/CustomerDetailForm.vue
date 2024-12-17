<template>
  <v-card class="summary-card pt-5">
    <v-form>
      <v-row class="px-6">
        <v-col cols="12" md="6" class="pb-0">
          <div class="d-flex">
            <p class="pt-4 label-p">Phone Number*</p>
            <v-text-field
              v-model="form.phone"
              ref="phone"
              outlined
              class="px-2"
              @focus="openKeyboard('phone')"
              type="number"
            ></v-text-field>
            <v-btn
              class="white--text pl-2"
              color="#AF002B"
              depressed
              elevation="0"
              raised
              height="55px"
              @click="searchCustomer"
              >Search</v-btn
            >
          </div>
        </v-col>
        <v-col cols="12" md="6" class="pb-0">
          <div class="d-flex">
            <p class="pt-4 label-p">Gender</p>
            <v-select
              :items="items"
              v-model="form.salutation"
              ref="salutation"
              outlined
              class="pl-2"
              style="max-width: 130px"
              @change="openKeyboard('salutation')"
            ></v-select>
            <p class="pt-4 pl-2 label-p">Name</p>
            <v-text-field
              v-model="form.name"
              ref="name"
              outlined
              class="pl-2"
              @focus="openKeyboard('name')"
            ></v-text-field>
          </div>
        </v-col>
      </v-row>
      <v-row class="px-6">
        <v-col cols="12" md="12" class="pt-0">
          <p class="customer-p">Customer Information:</p>
        </v-col>
      </v-row>
      <v-row class="px-6">
        <v-col cols="12" md="12" class="pb-0">
          <div class="d-flex">
            <p class="pt-4 label-p">Address Line 1*</p>
            <v-text-field
              v-model="form.address1"
              ref="address1"
              outlined
              class="pl-2"
              @focus="openKeyboard('address1')"
            ></v-text-field>
          </div>
        </v-col>
      </v-row>
      <v-row class="px-6">
        <v-col cols="12" md="12" class="pb-0">
          <div class="d-flex">
            <p class="pt-4 label-p">Address Line 2</p>
            <v-text-field
              v-model="form.address2"
              ref="address2"
              outlined
              class="pl-2"
              @focus="openKeyboard('address2')"
            ></v-text-field>
          </div>
        </v-col>
      </v-row>
      <!-- <v-row class="px-6">
        <v-col cols="12" md="4" class="pb-0">
          <div class="d-flex">
            <p class="pt-4 label-p">House No</p>
            <v-text-field
              v-model="form.house"
              ref="house"
              outlined
              @focus="openKeyboard('house')"
              class="pl-2"
            ></v-text-field>
          </div>
        </v-col>
        <v-col cols="12" md="4" class="pb-0">
          <div class="d-flex">
            <p class="pt-4 label-p">Block</p>
            <v-text-field
              v-model="form.block"
              ref="block"
              outlined
              class="pl-2"
              @focus="openKeyboard('block')"
            ></v-text-field>
          </div>
        </v-col>
        <v-col cols="12" md="4" class="pb-0">
          <div class="d-flex">
            <p class="pt-4 label-p">Floor</p>
            <v-text-field
              v-model="form.floor"
              ref="floor"
              outlined
              class="pl-2"
              @focus="openKeyboard('floor')"
            ></v-text-field>
          </div>
        </v-col>
      </v-row> -->

      <v-row class="px-6">
        <v-col cols="12" md="4" class="pb-0">
          <div class="d-flex">
            <p class="pt-4 label-p">Province</p>
            <v-select
              :items="provinceArray"
              v-model="form.province"
              ref="salutation"
              outlined
              class="pl-2"
              @change="openKeyboard('province')"
            ></v-select>
            <!-- <v-text-field
              v-model="form.province"
              ref="province"
              outlined
              class="pl-2"
              @focus="openKeyboard('province')"
            ></v-text-field> -->
          </div>
        </v-col>
        <v-col cols="12" md="4" class="pb-0">
          <div class="d-flex">
            <p class="pt-4 label-p">Zip code</p>
            <v-text-field
              v-model="form.zipcode"
              ref="zipcode"
              outlined
              class="pl-2"
              @focus="openKeyboard('zipcode')"
            ></v-text-field>
          </div>
        </v-col>
        <v-col cols="12" md="4" class="pb-0">
          <div class="d-flex">
            <p class="pt-4 label-p">Zone</p>
            <v-select
              :items="zoneArray"
              v-model="form.zone"
              ref="zone"
              outlined
              class="pl-2"
              @change="openKeyboard('zone')"
            ></v-select>
            <!-- <v-text-field
              v-model="form.zone"
              ref="zone"
              outlined
              class="pl-2"
              @focus="openKeyboard('zone')"
            ></v-text-field> -->
          </div>
        </v-col>
      </v-row>

      <!-- <v-row class="px-6">
        <v-col cols="12" md="12" class="pb-0">
          <div class="d-flex">
            <p class="pt-4 label-p">remarks</p>
            <v-text-field
              v-model="form.remarks"
              ref="remarks"
              outlined
              class="pl-2"
              @focus="openKeyboard('remarks')"
            ></v-text-field>
          </div>
        </v-col>
      </v-row> -->

      <v-row no-gutters class="px-3">
        <v-col cols="1" v-for="num in keys" :key="num" class="number-pad p-2">
          <v-btn
            class="black--text"
            color="#F4F4F4"
            depressed
            block
            elevation="0"
            raised
            x-large
            height="70px"
            @click="keyPress(num)"
            ><p class="num-p mt-3">{{ num }}</p></v-btn
          >
        </v-col>
      </v-row>
      <v-row no-gutters class="px-4 mt-3">
        <v-col cols="3" class="pr-2">
          <v-btn
            class="white--text font-26"
            color="#AF002B"
            depressed
            block
            elevation="0"
            raised
            x-large
            height="70px"
            @click="goToMenu"
            >Cancel</v-btn
          >
        </v-col>
        <v-col :cols="orderType.is_take_away ? '5' : '6'">
          <v-btn
            class="black--text"
            color="#F4F4F4"
            depressed
            block
            elevation="0"
            raised
            x-large
            height="70px"
            @click="addSpaceInField"
            >Space</v-btn
          >
        </v-col>
        <v-col cols="2" class="pl-2" v-if="orderType.is_take_away">
          <v-btn
            class="white--text font-26"
            color="black"
            depressed
            block
            elevation="0"
            raised
            x-large
            height="70px"
            @click="skipCustomerDetail"
            >Skip</v-btn
          >
        </v-col>
        <v-col :cols="orderType.is_take_away ? '2' : '3'" class="pl-2">
          <v-btn
            class="white--text font-26"
            color="#AF002B"
            depressed
            block
            elevation="0"
            raised
            x-large
            height="70px"
            @click="createCustomer"
            >Done</v-btn
          >
        </v-col>
      </v-row>
    </v-form>
  </v-card>
</template>

<script>
import { method } from "lodash";
import { evntBus } from "../../bus";
export default {
  data() {
    return {
      form: {
        phone: "",
        salutation: "",
        name: "",
        address1: "",
        address2: "",
        block: "",
        floor: "",
        province: "",
        zipcode: "",
        remarks: "",
        zone: "",
      },
      showKeyboard: false,
      currentField: "",
      items: ["Male", "Female"],
      provinceArray: ["Punjab", "Sindh", "Balochistan", "KPK"],
      zoneArray: ["Lahore", "Karachi", "Islamabad", "Rawalpindi"],
      pos_profile: "",
      customer_id: "",
      orderType: "",

      keys: [
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "0",
        ".",
        "/",
        "q",
        "w",
        "e",
        "r",
        "t",
        "y",
        "u",
        "i",
        "o",
        "p",
        "#",
        "%",
        "a",
        "s",
        "d",
        "f",
        "g",
        "h",
        "j",
        "k",
        "l",
        "z",
        "(",
        ")",
        "x",
        "c",
        "v",
        "b",
        "n",
        "m",
        ",",
        ":",
        "-",
        "*",
        "&",
        "⌫",
      ],
    };
  },
  methods: {
    openKeyboard(field) {
      this.currentField = field;
      //   this.showKeyboard = true;
    },
    goToMenu() {
      this.$emit("go-to-home");
      this.defaultForm();
    },
    defaultForm() {
      this.form.phone = "";
      this.form.salutation = "";
      this.form.name = "";
      this.form.address1 = "";
      this.form.address2 = "";
      this.form.province = "";
      this.form.zipcode = "";
      this.form.zone = "";
    },
    keyPress(key) {
      if (this.currentField) {
        if (key == "⌫") {
          this.deleteChar();
        } else {
          this.form[this.currentField] += key;
        }
      }
      console.log("this.form", this.form);
    },
    addSpaceInField() {
      if (this.currentField) {
        this.$nextTick(() => {
          if (this.$refs[this.currentField]) {
            this.$refs[this.currentField].focus();
          }
        });

        this.form[this.currentField] += " ";
      }
    },
    deleteChar() {
      this.form[this.currentField] = this.form[this.currentField].slice(0, -1);
    },
    enterChar() {
      this.showKeyboard = false;
      this.currentField = "";
    },
    search() {
      // Add search functionality here
    },
    createCustomer() {
      // validate if all required fields are filled

      const requiredFieldsForDelivery = [
        { field: "phone", message: __("Customer phone is required.") },
        { field: "name", message: __("Customer name is required.") },
        { field: "salutation", message: __("Gender is required.") },
        { field: "address1", message: __("Address is required.") },
        { field: "province", message: __("Province is required.") },
        { field: "zipcode", message: __("Zipcode is required.") },
        { field: "zone", message: __("Zone is required.") },
      ];
      const requiredFieldsForTakeAway = [
        { field: "phone", message: __("Customer phone is required.") },
        { field: "name", message: __("Customer name is required.") },
        { field: "salutation", message: __("Gender is required.") },
      ];
      console.log("this.order", this.orderType);

      let fieldData = this.orderType.is_take_away
        ? requiredFieldsForTakeAway
        : requiredFieldsForDelivery;

      for (const { field, message } of fieldData) {
        if (!this.form[field]) {
          evntBus.$emit("show_mesage", { text: message, color: "error" });
          return;
        }
      }

      if (this.form.phone) {
        const vm = this;
        const args = {
          customer_id: this.customer_id,
          customer_name: this.form.name,
          company: this.pos_profile.company,
          pos_profile_doc: this.pos_profile,
          tax_id: "",
          mobile_no: this.form.phone,
          email_id: "",
          referral_code: "",
          birthday: "",
          customer_group: "Individual",
          territory: "Pakistan",
          customer_type: "Individual",
          gender: this.form.salutation,
          address_line1: this.form.address1,
          address_line2: this.form.address2,
          city: this.form.zone,
          state: this.form.province,
          country: "Pakistan",
          pincode: this.form.zipcode,
          phone: "",
          method: this.customer_id ? "update" : "create",
        };
        frappe.call({
          method:
            "tabrah_pos.tabrah_pos.api.posapp.create_customer_with_address",
          args: args,
          callback: (r) => {
            console.log("customer creation", r.message);
            if (r.message) {
              let text = __("Customer created successfully.");
              if (vm.customer_id) {
                text = __("Customer updated successfully.");
              }
              evntBus.$emit("show_mesage", {
                text: text,
                color: "success",
              });
              // args.name = r.message.name;
              frappe.utils.play_sound("submit");
            }
            if (this.orderType.is_delivery) {
              evntBus.$emit("customer-detail", this.form);
            }
            this.$emit("go-to-menu");

            //  else {
            //   frappe.utils.play_sound('error');
            //   evntBus.$emit('show_mesage', {
            //     text: __('Customer creation failed.'),
            //     color: 'error',
            //   });
            // }
          },
        });
      }
    },
    skipCustomerDetail() {
      this.pos_profile.customer = "take away";
      this.$emit("go-to-menu");
    },
    searchCustomer() {
      // validate if all required fields are filled
      if (!this.form.phone) {
        evntBus.$emit("show_mesage", {
          text: __("Customer phone is required."),
          color: "error",
        });
        return;
      }
      if (this.form.phone) {
        const vm = this;
        const args = {
          pos_profile: this.pos_profile,
          mobile_no: this.form.phone,
        };
        frappe.call({
          method: "tabrah_pos.tabrah_pos.api.posapp.get_customer_by_mobile",
          args: args,
          callback: (r) => {
            console.log("customer creation", r.message);
            if (r.message) {
              vm.customer_id = r.message.name;
              this.form.name = r.message.customer_name;
              this.form.salutation = r.message.gender;
              this.form.address1 =
                r.message.customer_primary_address.address_line1;
              this.form.address2 =
                r.message.customer_primary_address.address_line2;
              this.form.province = r.message.customer_primary_address.state;
              this.form.zipcode = r.message.customer_primary_address.pincode;
              this.form.zone = r.message.customer_primary_address.city;
            } else {
              evntBus.$emit("show_mesage", {
                text: __("No Customer Found."),
                color: "error",
              });
              this.form.salutation = "";
              this.form.name = "";
              this.form.address1 = "";
              this.form.address2 = "";
              this.form.province = "";
              this.form.zipcode = "";
              this.form.zone = "";
            }
          },
        });
      }
    },
  },
  mounted() {
    evntBus.$on("open-menu-detail", (obj) => {
      this.defaultForm();
      this.pos_profile = obj.pos_profile;
      this.orderType = obj.order_type;
      console.log("selected Type", this.orderType);
    });
    evntBus.$on("set-default-data", () => {
      this.defaultForm();
    });
  },
};
</script>

<style  scoped>
.customer-p {
  font-size: 24px;
  font-weight: 700;
}
.label-p {
  font-size: 20px;
  font-weight: 600;
}
</style>