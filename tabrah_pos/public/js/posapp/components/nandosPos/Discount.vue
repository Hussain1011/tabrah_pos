<template>
  <v-card class="summary-card">
    <v-card-text
      class="d-flex flex-column justify-space-between"
      style="height: 100%"
    >
      <div>
        <v-row>
          <v-col cols="12" class="pt-10 pl-12">
            <h3>Discounts</h3>
          </v-col>
        </v-row>

        <v-row class="px-9">
          <v-col
            v-for="(discount, index) in discountArray"
            :key="index"
            cols="2"
          >
            <v-card
              class="discount-card"
              :class="{
                'dish-card': false,
                highlight: selectedDiscount === discount,
              }"
              :style="{ backgroundColor: discount.color }" 
              @click="selectDiscount(discount)"
            >
              <v-card-title
                ><p class="main-item-title mt-3">
                  {{ discount.name }}
                </p></v-card-title
              >
            </v-card>
          </v-col>
        </v-row>
      </div>
      <v-spacer></v-spacer>
      <div>
        <v-row>
          <v-col cols="12" class="pl-12">
            <h4>Discount Selected</h4>
            <p class="selected-discount">
              {{ selectedDiscount.name || "NONE" }}
            </p>
          </v-col>
        </v-row>
        <v-row no-gutters class="mt-2 px-8">
          <!-- <Buttons :buttonType="buttonType"></Buttons> -->
          <v-col cols="4" class="p-1">
            <v-btn
              class="white--text font-26"
              color="black"
              depressed
              block
              elevation="2"
              raised
              x-large
              height="60px"
              @click="handleBack()"
              >Back</v-btn
            >
          </v-col>
          <v-col cols="4" class="p-1">
            <v-btn
              class="white--text font-26"
              color="black"
              depressed
              block
              elevation="2"
              raised
              x-large
              height="60px"
              @click="confirmDiscount()"
              >Confirm</v-btn
            >
          </v-col>
          <v-col cols="4" class="p-1">
            <v-btn
              class="white--text font-26"
              color="black"
              depressed
              block
              elevation="2"
              raised
              x-large
              height="60px"
              @click="removeDiscount()"
              >Remove</v-btn
            >
          </v-col>
        </v-row>
      </div>
    </v-card-text>

    <v-dialog
      v-model="dialog"
      max-width="500"
      persistent
      class="right-corner-dialog"
    >
      <v-card>
        <v-card-title>
          <span class="headline">Enter card number</span>
        </v-card-title>
        <v-card-text>
          <v-text-field
            v-model="inputValue"
            label="Enter card number"
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
            @click="dialog = false,inputValue=''"
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
</template>

<script>
import { evntBus } from "../../bus";
export default {
  props: {
    discountArray: {
      type: Array,
      required: true,
      default: () => [],
    },
  },

  data() {
    return {
      discounts: [  ],
      selectedDiscount: "",
      numberPad: [1, 2, 3, 4, 5, 6, 7, 8, 9, '#', 0, "Back"],
      dialog: false,
      inputValue: "",



    };
  },
  methods: {
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
    },
    confirmDialog() {
      this.selectedDiscount.cardNumber=this.inputValue
      this.dialog = false;
    },
    selectDiscount(discount) {
      this.selectedDiscount = discount;
      if(this.selectedDiscount.on_bank_card){
        this.dialog=true
      }
    },
    removeDiscount() {
      this.selectedDiscount = "";
      this.inputValue=''
      evntBus.$emit("selected-discount", this.selectedDiscount);
    },
    confirmDiscount(){
      evntBus.$emit("selected-discount", this.selectedDiscount);
      this.$emit("go-to-payment");

    },
    handleBack() {
      this.$emit("go-to-payment");
    },
  },
  mounted() {
    evntBus.$on("update-selected-discount", () => {
      this.selectedDiscount = "";
      this.inputValue=''
    });
  },
};
</script>
<style scoped>
.summary-card {
  height: 92vh;
  border-radius: 8px !important;
}
.discount-card {
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  /* background: #af002b !important; */
}
.main-item-title {
  color: white;
}
.highlight {
  background: #ff7e28 !important;
}
.selected-discount {
  font-size: 26px;
  font-weight: 700;
  color: black;
}
</style>