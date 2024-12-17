<template>
  <v-card class="summary-card pt-5 pl-5">
    <!-- Table Management Title -->
    <v-row class="pr-3">
      <h2 class="pl-4 mt-4">Table Management</h2>
    </v-row>

    <v-divider class="my-4"></v-divider>

    <!-- First Floor Section -->
    <v-row>
      <v-col
        cols="12"
        :class="{
          'pb-0': $vuetify.breakpoint.mdAndDown,
        }"
      >
        <strong>First Floor</strong>
        <v-divider></v-divider>
      </v-col>

      <v-col
        v-for="(table, index) in firstFloorTable.slice(0, 11)"
        :key="index"
        cols="6"
        sm="4"
        md="2"
        lg="2"
        :class="{
          'pb-0': $vuetify.breakpoint.mdAndDown,
          'p-3': $vuetify.breakpoint.lgAndUp,
        }"
      >
        <v-card
          v-if="table.floor_no == 1"
          class="table-card mr-2"
          :class="{
            'green-bg': table.status == 'Reserved',
            'red-bg': reservedTables.firstFloor.includes(table),
          }"
          @click="openDialog('firstFloor', table)"
          :style="{
            height: $vuetify.breakpoint.mdAndDown ? '80px' : '',
          }"
        >
          <div class="d-block">
            <v-card-title
              :class="{
                'pb-0': table.seats,
                'font-lg': $vuetify.breakpoint.lgAndUp,
                'font-md': $vuetify.breakpoint.mdAndDown,
              }"
              >{{ $vuetify.breakpoint.mdAndDown ? "T #" : "Table" }}
              {{ table.name }}</v-card-title
            >
            <p
              class="d-flex justify-center cover-p"
              v-if="table.cover && table.cover > 0"
            >
              {{ $vuetify.breakpoint.mdAndDown ? "C #" : "Cover" }}
              {{ table.cover }}
            </p>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-divider class="my-4" v-if="SecondFloorTable.length > 0"></v-divider>

    <!-- Second Floor Section -->
    <v-row v-if="SecondFloorTable.length > 0">
      <v-col cols="12">
        <strong>2nd Floor</strong>
        <v-divider></v-divider>
      </v-col>
      <v-col
        v-for="(table, index) in SecondFloorTable.slice(0, 11)"
        :key="index"
        cols="6"
        sm="4"
        md="2"
        lg="2"
        class="p-3"
      >
        <v-card
          v-if="table.floor_no == 2"
          class="table-card mr-2"
          :class="{
            'green-bg': table.status == 'Reserved',
            'red-bg': reservedTables.secondFloor.includes(table),
          }"
          :style="{
            height: $vuetify.breakpoint.mdAndDown ? '80px' : '',
          }"
          @click="openDialog('secondFloor', table)"
        >
          <div class="d-block">
            <v-card-title
              :class="{
                'pb-0': table.seats,
                'font-lg': $vuetify.breakpoint.lgAndUp,
                'font-md': $vuetify.breakpoint.mdAndDown,
              }"
              >{{ $vuetify.breakpoint.mdAndDown ? "T #" : "Table" }}
              {{ table.name }}</v-card-title
            >
            <p
              class="d-flex justify-center cover-p"
              v-if="table.cover && table.cover > 0"
            >
              {{ $vuetify.breakpoint.mdAndDown ? "C #" : "Cover" }}
              {{ table.cover }}
            </p>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-divider class="my-4"></v-divider>

    <!-- Navigation Buttons -->
    <v-row>
      <v-col cols="4">
        <v-btn
          class="white--text font-30"
          color="#AF002B"
          depressed
          block
          elevation="2"
          raised
          x-large
          height="60px"
          @click="goToHome"
        >
          Home
        </v-btn>
      </v-col>
      <v-col cols="4">
        <v-btn
          class="white--text font-30"
          color="black"
          depressed
          block
          elevation="2"
          raised
          x-large
          height="60px"
          @click="removeLastReservation"
        >
          Back
        </v-btn>
      </v-col>
      <v-col cols="4" class="pr-6">
        <v-btn
          class="white--text font-30"
          color="black"
          depressed
          block
          elevation="2"
          raised
          x-large
          height="60px"
          @click="goToMenu"
        >
          Next
        </v-btn>
      </v-col>
    </v-row>

    <!-- Dialog for Number of People -->
    <v-dialog
      v-model="dialog"
      max-width="500"
      persistent
      class="right-corner-dialog"
    >
      <v-card>
        <v-card-title>
          <span class="headline">Enter Number of People</span>
        </v-card-title>
        <v-card-text>
          <v-text-field
            v-model="numberOfPeople"
            label="Number of People"
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
                @click="handleNumButtonClick(num)"
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
            @click="closeDialog"
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
            @click="reserveTable"
            >Reserve</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>

  <!-- </v-container> -->
</template>
  
  

  <script>
import { evntBus } from "../../bus";
export default {
  data() {
    return {
      tables: [],
      firstFloorTable: [],
      SecondFloorTable: [],

      reservedTables: {
        firstFloor: [],
        secondFloor: [],
      },
      currentOrderTable: "",
      pos_profile: "",
      orderTypes: [],
      ordertype: "",
      selectedType: "",
      dialog: false,
      numberPad: [1, 2, 3, 4, 5, 6, 7, 8, 9, "-", 0, "Back"],
      numberOfPeople: "",
    };
  },

  methods: {
    goToHome() {
      this.$emit("go-to-home");
    },
    openDialog(floor, table) {
      const obj = {
        table_no: table,
        pos_profile: this.pos_profile,
        order_type: this.ordertype,
      };
      evntBus.$emit("sent-table-no", table);
      evntBus.$emit("set-invoice-doc", {});
      if (table.status == "Available") {
        // this.reservedTables[floor] = [table];
        table.status = "Reserved";
        const index = this.reservedTables[floor].indexOf(table);
        if (index === -1) {
          this.reservedTables[floor].push(table);
        }
        this.numberOfPeople = ""; // Reset number of people input
        this.dialog = true;
        this.currentOrderTable = {
          floor: floor,
          tableNumber: table,
          persons: this.numberOfPeople,
        };
      } else {
        this.getOrderSummary(table);
        this.$emit("go-to-menu", obj);
        this.currentOrderTable = {
          floor: floor,
          tableNumber: table,
          persons: table.cover,
        };
        evntBus.$emit("table-detail", this.currentOrderTable);

        // evntBus.$emit("order-detail", obj);
      }
      evntBus.$emit("order-detail", obj);
    },
    handleNumButtonClick(num) {
      if (num === "Back") {
        this.numberOfPeople = this.numberOfPeople.slice(0, -1);
        if (this.numberOfPeople == "") {
          this.numberOfPeople = "";
          this.$nextTick(() => {
            this.numberOfPeople = "";
          });
        }
      } else if (num == "-") {
        if (this.numberOfPeople > 1) {
          this.numberOfPeople = (parseInt(this.numberOfPeople) - 1).toString();
        }
      } else if (num == "+") {
        this.numberOfPeople = (parseInt(this.numberOfPeople) + 1).toString();
      } else {
        this.numberOfPeople += num.toString();
      }
      // if (this.numberOfPeople >= 1) {
      //   evntBus.$emit("add-numberOfPeople", this.numberOfPeople, this.selectedParentItem);
      // }
    },
    reserveTable() {
      if (this.reservedTables[this.currentOrderTable.floor].length > 0) {
        this.currentOrderTable = {
          floor: this.currentOrderTable.floor,
          tableNumber: this.currentOrderTable.tableNumber,
          persons: this.numberOfPeople,
        };
        this.currentOrderTable.tableNumber.cover = this.numberOfPeople;
        this.goToMenu();
        this.dialog = false;
        evntBus.$emit("table-detail", this.currentOrderTable);
      }
    },
    closeDialog() {
      this.dialog = false;
      this.reservedTables[this.currentOrderTable.floor] = [];
      this.currentOrderTable.tableNumber.status = "Available";
      this.currentOrderTable = null;
      this.numberOfPeople = "";
    },
    toggleReservation(floor, table) {
      if (table.status == "Available") {
        // const index = this.reservedTables[floor].indexOf(table);
        // if (index === -1) {
        //   this.reservedTables[floor].push(table);
        // }
        // else {
        //   this.reservedTables[floor].splice(index, 1);
        // }
        // this.reservedTables[floor] = [table];

        if (this.reservedTables[floor].length > 0) {
          this.currentOrderTable = {
            floor: floor,
            tableNumber: table,
            persons: this.numberOfPeople,
          };
        } else {
          this.currentOrderTable = null;
        }
      }
    },
    removeLastReservation() {
      if (this.currentOrderTable) {
        this.currentOrderTable.tableNumber.status = "Available";
        const { firstFloor, secondFloor } = this.reservedTables;
        if (secondFloor.length > 0) {
          secondFloor.pop();
        } else if (firstFloor.length > 0) {
          firstFloor.pop();
        }
        const table = this.tables.find(
          (t) => t.name == this.currentOrderTable.tableNumber.table_no
        );
        if (table) {
          table.cover = 0;
          table.status = "Available";
        }
        this.currentOrderTable = "";
        // if (secondFloor.length > 0) {
        //   this.currentOrderTable = {
        //     floor: "secondFloor",
        //     tableNumber: secondFloor[secondFloor.length - 1],
        //   };
        // } else if (firstFloor.length > 0) {
        //   this.currentOrderTable = {
        //     floor: "firstFloor",
        //     tableNumber: firstFloor[firstFloor.length - 1],
        //   };
        // } else {
        //   this.currentOrderTable = null;
        // }
      }
    },
    goToMenu() {
      if (this.currentOrderTable) {
        const obj = {
          table_no: this.currentOrderTable,
          pos_profile: this.pos_profile,
          order_type: this.ordertype,
        };
        this.$emit("go-to-menu", obj);
        evntBus.$emit("order-detail", obj);
      }
    },
    selectOrderType(type) {
      this.selectedType = type;
      const obj = {
        table_no: this.currentOrderTable,
        pos_profile: this.pos_profile,
        order_type: this.selectedType,
      };
      if (type !== "Dine in") {
        // this.$emit("go-to-menu", obj);
        // evntBus.$emit("order-detail", obj);
        this.$emit("go-to-customer-form", type);
      }
    },
    async getOrderSummary(data) {
      try {
        const response = await frappe.call({
          method: "tabrah_pos.tabrah_pos.api.posapp.get_invoice_by_table",
          args: {
            table: data.table_no,
          },
        });
        evntBus.$emit("set-invoice-doc", response.message[0]);
        evntBus.$emit(
          "get-order-summary",
          response.message[0].order_summery_for_pos
        );
      } catch (error) {
        console.error("Error fetching table names:", error);
      }
    },
    async fetchTableOptions(key) {
      try {
        const response = await frappe.call({
          method: "tabrah_pos.tabrah_pos.api.posapp.get_all_Table_names",
          args: {
            pos_profile: this.pos_profile,
          },
        });
        // if (key) {
        //   const table = response.message.find(
        //     (t) => t.name == this.currentOrderTable.tableNumber.table_no
        //   );
        //   if (table) {
        //     table.cover = this.currentOrderTable.persons;
        //     table.status = "Reserved";
        //   }
        // }

        this.tables = [];
        this.tables = response.message;
        this.tables.filter((item) => {
          if (item.floor_no == 1) {
            this.firstFloorTable.push(item);
          } else {
            this.SecondFloorTable.push(item);
          }
        });
      } catch (error) {
        console.error("Error fetching table names:", error);
      }
    },
    // async fetchOrderTypes() {
    //   try {
    //     const response = await frappe.call({
    //       method: "tabrah_pos.tabrah_pos.api.posapp.get_Order_type",
    //       args: {
    //         pos_profile: this.pos_profile,
    //       },
    //     });
    //     this.orderTypes = response.message;
    //     this.ordertype = response.message[0];
    //     this.selectedType = response.message[0];
    //     evntBus.$emit("send_order_type", response.message[0]);
    //   } catch (error) {
    //     console.error("Error fetching table names:", error);
    //   }
    // },
  },
  mounted() {
    evntBus.$on("send_pos_profile", (data) => {
      this.pos_profile = data;
      if (this.pos_profile.pos_theme == "Nando") {
        this.fetchTableOptions();
        // this.fetchOrderTypes();
      }
    });
    evntBus.$on("open-menu-detail", (data) => {
      this.ordertype = data.order_type;
      // this.get_items(data);
    });
    evntBus.$on("set-default-data", () => {
      this.currentOrderTable = "";
      this.tables = [];
      this.$nextTick(() => {
        this.tables = [];
        this.reservedTables.firstFloor = [];
        this.reservedTables.firstFloor = [];
        this.firstFloorTable = [];
        this.SecondFloorTable = [];
      });
      this.fetchTableOptions();
      evntBus.$emit("default-order-summary");
    });
    evntBus.$on("change-table-cover", (data) => {
      this.currentOrderTable = data;
      this.tables = [];
      this.$nextTick(() => {
        this.tables = [];
        this.reservedTables.firstFloor = [];
        this.reservedTables.firstFloor = [];
        this.firstFloorTable = [];
        this.SecondFloorTable = [];
      });
      this.fetchTableOptions(true);
    });
    evntBus.$on("change-person-count", (data) => {
      const table = this.tables.find((t) => t.name == data.tableNumber);
      if (table) {
        this.currentOrderTable.persons = data.persons;
        table.cover = data.persons;
      }
    });
  },
  beforeDestroy() {
    evntBus.$off("send_pos_profile");
    evntBus.$off("set-default-data");
    evntBus.$off("change-table-cover");
    evntBus.$off("change-person-count");
  },
};
</script>
  

  <style scoped>
.summary-card {
  height: 92vh;
  border-radius: 8px !important;
}
.table-card {
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f4f4f4 !important;
  cursor: pointer;
}
.red-bg {
  background-color: #ff8c20 !important;
  color: white;
}
.green-bg {
  background-color: #2ad413 !important;
}
.v-sheet.v-card:not(.v-sheet--outlined) {
  box-shadow: none !important;
}
.v-dialog__content {
  position: absolute !important;
  top: 10px !important;
  right: 0px !important;
  bottom: auto !important;
  /* left: 650px !important; */
  margin: 0 !important;
}
.cover-p {
  font-size: 16px;
  font-weight: 500;
}
.font-lg {
  font-size: 20px;
}

.font-md {
  font-size: 14px;
}
</style>
  