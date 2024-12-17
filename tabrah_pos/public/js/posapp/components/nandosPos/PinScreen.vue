<template>
  <v-row
    class="main-container"
    justify="center"
    align="center"
    style="height: 100vh"
  >
    <v-col cols="12" md="6" lg="4">
      <v-card>
        <v-card-title>
          <span class="headline">Enter Pin</span>
        </v-card-title>
        <v-card-text>
          <v-text-field
            v-model="pinCode"
            label="Enter Pin..."
            type="password"
            outlined
            clearable
            class="font-40"
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
                @click="handleNumButtonClick(num)"
              >
                <p class="num-p mt-3">{{ num }}</p>
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="mx-4">
          <v-btn
            color="red"
            class="black--text"
            depressed
            elevation="0"
            raised
            x-large
            height="50px"
            @click="cancelPin"
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
            @click="goToHomeScreen"
            >login</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-col>
    <div>
      <v-snackbar
        v-model="snack"
        top
        right
        :elevation="0"
        :timeout="5000"
        :color="snackColor"
        class="snack"
        :class="'snack-type-' + type"
      >
        <div class="notification-content">
          <div class="notification-icon" :class="type">
            <!-- <i class="fa fa-check-circle" v-if="type == 'success'" ></i> -->
            <v-icon v-if="type == 'success'">mdi-check-bold</v-icon>
            <v-icon v-if="type == 'error'">mdi-alert-circle</v-icon>
            <!-- <i class="fa fa-exclamation-triangle" v-if="type == 'error' || type == 'warning'" ></i> -->
            <i class="fa fa-info-circle" v-if="type == 'info'"></i>
          </div>

          <div class="notification-message">
            {{ snackText }}
          </div>
        </div>
        <template v-slot:action="{ attrs }">
          <a class="close-notification-button" v-bind="attrs">
            <i class="fa fa-times"></i>
          </a>
        </template>
      </v-snackbar>
    </div>
  </v-row>
</template>

<script>
import { evntBus } from "../../bus";

export default {
  data() {
    return {
      numberPad: [1, 2, 3, 4, 5, 6, 7, 8, 9, "#", 0, "Back"],
      pinCode: "",
      pos_profile: "",
      snack:false,
      snackColor:'',
      snackText:'',
      type:''
    };
  },
  methods: {
    handleNumButtonClick(num) {
      if (num === "Back") {
        this.pinCode = this.pinCode.slice(0, -1);
        if (this.pinCode == "") {
          this.pinCode = "";
          this.$nextTick(() => {
            this.pinCode = "";
          });
        }
      } else if (num == "-") {
        if (this.pinCode > 1) {
          this.pinCode = (parseInt(this.pinCode) - 1).toString();
        }
      } else if (num == "+") {
        this.pinCode = (parseInt(this.pinCode) + 1).toString();
      } else {
        this.pinCode += num.toString();
      }
    },
    cancelPin() {
      this.pinCode = "";
    },
    goToHomeScreen() {
      console.log("called-pin" )
      if (this.pinCode) {
        console.log("this.pos_profile.employee_list",this.pos_profile.employee_list)
        const employeeExists = this.pos_profile.employee_list.find(
          (employee) => employee.pin_for_pos == this.pinCode
        );
        console.log("employeeExists",employeeExists)

        if (employeeExists) {
          // If the pinCode exists, emit the event and update the login status
          evntBus.$emit("go-to-home-screen");
          this.pos_profile.login = true;
          this.pos_profile.active_emp=employeeExists
          evntBus.$emit("active-employee",employeeExists);
          this.pinCode=''
        } else {
          // If the pinCode doesn't exist, show an error message
          this.snack=true
          this.show_mesage('Unauthenticated','error')
        }
      } else {
        this.show_mesage('Enter Pin Code','error')
      }
    },
    show_mesage(text,color) {
      this.snack = true;
      this.snackColor = color;
      this.snackText = text;
      this.type = color;
    },
  },
  mounted() {
    evntBus.$on("send_pos_profile", (data) => {
      console.log("in login screen", data);
      this.pos_profile = data;
    });
  },
};
</script>

<style scoped>
.font-40 {
  font-size: 40px;
}
</style>