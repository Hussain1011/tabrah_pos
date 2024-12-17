<template>
  <v-container fluid>
    <PinScreen v-show="!userLogin" />
    <v-row class="main-container" v-show="userLogin">
      <v-col cols="4">
        <OrderSummary @go-to-payment="openPaymentScreen" />
      </v-col>
      <v-col cols="8">
        <HomeScreen
          v-show="screen == 0"
          @go-to-menu="openMenuScreen"
          @go-to-table-screen="openTableScreen"
          @go-to-customer-form="openCustomerForm"
          @go-to-recall-screen="openRecallScreen"
        ></HomeScreen>
        <TableScreen
          v-show="screen == 1"
          @go-to-menu="openMenuScreen"
          @go-to-customer-form="openCustomerForm"
          @go-to-home="openHomeScreen"
        />
        <MenuGrid v-show="screen == 2" @go-to-home="openHomeScreen" />
        <Payment
          v-show="screen == 3"
          @go-to-home="openHomeScreen"
          @go-to-menu="openMenuScreen"
          @go-to-discountscreen="openDiscountScreen"
        ></Payment>
        <Discount
          v-show="screen == 4"
          @go-to-payment="openPaymentScreen"
          :discountArray="discountArray"
        ></Discount>
        <CustomerDetailForm
          v-show="screen == 5"
          @go-to-home="openHomeScreen"
          @go-to-menu="openMenuScreen"
        ></CustomerDetailForm>
        <RecallOrderScreen
          v-show="screen == 6"
          @go-to-home="openHomeScreen"
          @go-to-menu="openMenuScreen"
        ></RecallOrderScreen>
        <!-- <OrderHistory v-show="screen == 7"></OrderHistory> -->
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import MenuGrid from "./MenuGrid.vue";
import OrderSummary from "./OrderSummary.vue";
import TableScreen from "./TableScreen.vue";
import { evntBus } from "../../bus";
import Payment from "./Payment.vue";
import Discount from "./Discount.vue";
import CustomerDetailForm from "./CustomerDetailForm.vue";
import HomeScreen from "./HomeScreen.vue";
import RecallOrderScreen from "./RecallOrderScreen.vue";
import PinScreen from "./PinScreen.vue";
// import OrderHistory from "./OrderHistory.vue";
export default {
  components: {
    HomeScreen,
    OrderSummary,
    MenuGrid,
    TableScreen,
    Payment,
    Discount,
    CustomerDetailForm,
    RecallOrderScreen,
    PinScreen,
    // OrderHistory,
  },
  data() {
    return {
      screen: 0,
      orderDetail: "",
      discountArray: [],
      userLogin: false,
      pos_profile: "",
    };
  },
  methods: {
    openMenuScreen(data) {
      console.log("open menu");
      this.screen = 2;
    },
    openHomeScreen() {
      this.screen = 0;
    },
    openPaymentScreen() {
      this.screen = 3;
    },
    openDiscountScreen(data) {
      this.discountArray = data;
      this.screen = 4;
    },
    openCustomerForm(data) {
      this.screen = 5;
    },
    openTableScreen() {
      this.screen = 1;
    },
    openRecallScreen() {
      this.screen = 6;
    },
  },
  mounted() {
    evntBus.$on("send_pos_profile", (data) => {
      this.pos_profile = data;
      
    });
    evntBus.$on("go-to-home-screen", () => {
      this.userLogin = true;
      this.pos_profile.login = true;
    });
    evntBus.$on("go-to-pin-screen", () => {
      this.userLogin = false;
      this.screen=0
      this.pos_profile.login = false;
      this.pos_profile.active_emp=''
      console.log("this.pos_profile", this.pos_profile);
    });
  },
};
</script>

<style scoped>
.main-container {
  background: #ededed;
}
</style>