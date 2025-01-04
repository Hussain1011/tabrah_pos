<template>
  <v-card class="summary-card pt-2">
    <v-row class="px-8 mt-3">
      <v-col cols="12">
        <div class="d-flex justify-space-between">
          <h2>Order Type</h2>
          <v-spacer></v-spacer>

          <v-btn
            color="#AF002B"
            class="white--text"
            depressed
            elevation="0"
            raised
            x-large
            height="50px"
            @click="goToPinScreen"
            >Clock Out</v-btn
          >
        </div>
      </v-col>
    </v-row>
    <v-divider></v-divider>
    <v-row class="px-2 px-md-8">
      <v-col
        cols="12"
        sm="6"
        md="6"
        lg="4"
        v-for="(type, i) in orderTypes"
        :key="i"
      >
        <v-btn
          v-if="type.order_type != 'All'"
          class="white--text wrap-text"
          color="black"
          depressed
          block
          elevation="0"
          raised
          x-large
          :style="{
            height: $vuetify.breakpoint.lgAndUp ? '110px' : '70px',
          }"
          @click="selectOrderType(type)"
        >
          <p class="wrap-text mt-2">{{ type.order_type }}</p>
          <!-- {{ type.order_type }} -->
        </v-btn>
      </v-col>
    </v-row>

    <v-row class="px-8 mt-6">
      <v-col cols="12">
        <h2>Order Recall</h2>
      </v-col>
    </v-row>
    <v-divider></v-divider>
    <v-row class="px-2 px-md-8">
      <v-col
        cols="12"
        sm="6"
        md="6"
        lg="3"
        v-for="(type, i) in recallOrderArray"
        :key="i"
      >
        <v-btn
          class="white--text recall-btn"
          color="#AF002B"
          depressed
          block
          elevation="0"
          raised
          x-large
          :style="{
            height: $vuetify.breakpoint.lgAndUp ? '80px' : '50px',
          }"
          @click="getRecallOrder(type)"
        >
          <p class="mt-2 wrap-recall-text">{{ type.order_type }}</p>
        </v-btn>
      </v-col>
    </v-row>
  </v-card>
</template>

<script>
import { evntBus } from "../../bus";

export default {
  data() {
    return {
      orderTypes: [
        // { order_type: "Dine In " },
        // { order_type: "Take Away " },
        // { order_type: "Delivery" },
      ],
      recallOrderArray: [
        { order_type: "Recall Eat", type: "Recall Eat" },
        { order_type: "Recall Take Away", type: "Recall Take Away" },
        { order_type: "Recall Delivery", type: "Recall Delivery" },
        { order_type: "Recall All", type: "" },
      ],
      pos_profile: "",
      selectedType: "",
      pos_opening_shift: "",
    };
  },
  methods: {
    async fetchOrderTypes() {
      try {
        const response = await frappe.call({
          method: "tabrah_pos.tabrah_pos.api.posapp.get_Order_type",
          args: {
            pos_profile: this.pos_profile,
          },
        });
        console.log("tri maaaaa ka naki saka");
        this.orderTypes = response.message;
        this.ordertype = response.message[0];
        // this.selectedType = response.message[0];
        // evntBus.$emit("send_order_type", response.message[0]);
      } catch (error) {
        console.error("Error fetching table names:", error);
      }
    },
    async getRecallOrder(data) {
      try {
        // const id = this.orderTypes.find(
        //   (item) => item.hold_invoices == data.order_type
        // );
        console.log("type", data);
        const response = await frappe.call({
          method:
            "tabrah_pos.tabrah_pos.api.posapp.get_draft_invoices_by_ordertype",
          args: {
            pos_opening_shift: this.pos_opening_shift.name,
            hold_invoices: data.type,
          },
        });
        // this.selectedType = id;
        const obj = {
          pos_profile: this.pos_profile,
        };
        evntBus.$emit("pos-profile", obj);

        evntBus.$emit("order-type-array", this.orderTypes);

        evntBus.$emit("recall-data-array", response.message);
        this.$emit("go-to-recall-screen");
      } catch (error) {
        console.error("Error fetching table names:", error);
      }
    },
    selectOrderType(type) {
      console.log("calling ...", type);
      this.selectedType = type;
      evntBus.$emit("set-default-data");
      const obj = {
        pos_profile: this.pos_profile,
        order_type: this.selectedType,
      };
      if (type.is_take_away) {
        this.$emit("go-to-customer-form");
      } else if (type.is_dine_in) {
        console.log("enter in dine in");
        this.$emit("go-to-table-screen");
      } else {
        this.$emit("go-to-customer-form");
      }
      evntBus.$emit("open-menu-detail", obj);
    },
    goToPinScreen() {
      this.pos_profile.login = false;
      evntBus.$emit("go-to-pin-screen");
    },
  },
  mounted() {
    evntBus.$on("send_pos_profile", (data) => {
      console.log("in Home screen", data);
      this.pos_profile = data;
      if (this.pos_profile.pos_theme == "Nando") {
        this.fetchOrderTypes();
      }
    });
    evntBus.$on("register_pos_profile", (data) => {
      this.pos_opening_shift = data.pos_opening_shift;
    });
  },
};
</script>

<style scoped>
.recall-btn {
  font-size: 20px;
  font-weight: 600;
}
.wrap-text {
  font-size: 22px;
  font-weight: 500;
  display: inline-block;
  max-width: 100%;
  white-space: normal;
  word-break: break-word;
  overflow-wrap: break-word;
}
.font-22 {
  font-size: 20px !important;
}
.wrap-recall-text {
  font-size: 18px;
  font-weight: 500;
  display: inline-block;
  max-width: 90%;
  white-space: normal;
  word-break: break-word;
  overflow-wrap: break-word;
}
</style>