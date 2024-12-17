<template>
  <v-card class="summary-card pt-5">
    <!-- Search Field -->
    <v-row class="px-6">
      <v-col cols="12">
        <v-text-field
          v-model="searchQuery"
          label="Search Invoices"
          prepend-icon="mdi-magnify"
          outlined
          clearable
        ></v-text-field>
      </v-col>
    </v-row>

    <v-row class="px-6">
      <v-col cols="12">
        <h3 class="headline">{{ selectedOrderType.hold_invoices }}</h3>
      </v-col>
    </v-row>

    <div class="card-h">
      <v-row class="px-6">
        <v-col
          v-for="(item, index) in filteredItems"
          :key="index"
          cols="12"
          md="4"
          lg="2"
          class="mb-4"
        >
          <v-card
            class="red darken-4 white--text py-2 px-3 ml-2"
            :style="{
              height: $vuetify.breakpoint.mdAndDown ? '70px' : '100px',
            }"
            @click="openInvoiceOrder(item)"
          >
            <v-card-text class="white--text px-0">
              <div class="invoice-p">Invoice: {{ item.name }}</div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <v-row class="px-6">
      <v-col cols="12" md="6" class="mt-10">
        <v-btn
          class="white--text font-30"
          color="black"
          depressed
          block
          elevation="2"
          raised
          x-large
          height="60px"
          @click="goToHome"
        >
          Back
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
      items: [], //new Array(29).fill({}),
      selectedOrderType: "",
      orderTypes: [],
      pos_profile: "",
      searchQuery: "",
    };
  },
  computed: {
    // Computed property to filter items based on search query
    filteredItems() {
      if (!this.searchQuery) {
        return this.items;
      }
      // Filter items based on the search query
      return this.items.filter((item) =>
        item.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    },
  },
  methods: {
    goToHome() {
      this.$emit("go-to-home");
    },
    openInvoiceOrder(data) {
      console.log("recall-data", data);
      const order = this.orderTypes.find(
        (item) => item.name == data.resturent_type
      );
      const obj = {
        pos_profile: this.pos_profile,
        order_type: order,
      };

      evntBus.$emit("open-menu-detail", obj);
      if (data.order_summery_for_pos) {
        evntBus.$emit("get-order-summary", data.order_summery_for_pos);
      }
      evntBus.$emit("set-invoice-doc", data);
      this.$emit("go-to-menu");
      if (data.contact_mobile) {
        const customerDetail = {
          name: data.customer_name,
          phone: data.contact_mobile,
        };
        evntBus.$emit("customer-detail", customerDetail);
      }
    },
  },
  mounted() {
    evntBus.$on("recall-data-array", (data) => {
      this.items = [];
      this.items = data;
      console.log("recall-array", this.items);
    });
    evntBus.$on("order-type-array", (data) => {
      this.orderTypes = data;
    });

    evntBus.$on("pos-profile", (obj) => {
      this.pos_profile = obj.pos_profile;
    });
  },
  beforeDestroy() {
    evntBus.$off("recall-data-array");
    evntBus.$off("order-type-array");
  },
};
</script>

<style scoped>
/* .headline {
  font-size: 16px;
  font-weight: bold;
} */
.card-h {
  height: 600px;
  max-height: 600px;
  overflow-y: scroll;
  overflow-x: hidden;
}
.invoice-p {
  font-size: 14px;
  font-weight: 500;
}
@media (max-width: 1024px) and (max-height: 768px) {
  .card-h {
    overflow-y: auto;
    height: calc(100vh - 200px);
  }
}
</style>