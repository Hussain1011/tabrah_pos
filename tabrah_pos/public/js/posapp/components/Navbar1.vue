<template>
  <!-- <v-app> -->
  <!-- App Bar (Navbar) -->
  <div>
    <v-app-bar app color="white" height="55" class="elevation-0">
      <v-app-bar-nav-icon @click="drawer = !drawer" />
      <v-img
        src="/assets/tabrah_pos/js/posapp/components/pos/logo.png"
        alt="POS"
        max-width="32"
        class="mr-2"
        @click="go_desk"
      ></v-img>
      <v-toolbar-title
        style="cursor: pointer"
        class="text-uppercase primary--text ml-1"
        @click="go_desk"
      >
        <span class="font-weight-light primary--text">Neighboorhood</span>
        <span class="ml-2 primary--text">pos</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-switch
        v-model="isInternet"
        :label="isInternet ? 'System is Online' : 'System is Offline'"
        hide-details
        inset
        class="switch-btn"
        color="#21A0A0"
      ></v-switch>
      <v-btn style="cursor: unset" text color="#21A0A0">
        <span right>{{ pos_profile.name }}</span>
      </v-btn>
      <div class="text-center">
        <v-menu transition="slide-x-transition">
          <template v-slot:activator="{ props }">
            <v-btn color="#21A0A0" dark text v-bind="props"> Menu </v-btn>
          </template>

          <v-list>
            <v-list-item class="d-flex" @click="closeShift()">
              <div style="display: flex">
                <v-icon class="mr-2 mt-1">mdi-content-save-move-outline</v-icon>
                <v-list-item-title>Close Shift</v-list-item-title>
              </div>
            </v-list-item>
            <v-list-item class="d-flex" @click="logOut()">
              <div style="display: flex">
                <v-icon class="mr-2 mt-1">mdi-logout</v-icon>
                <v-list-item-title>Logout</v-list-item-title>
              </div>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
      <!-- <div class="text-center">
        <v-menu offset-y>
          <template v-slot:activator="{ on, attrs }">
            <v-btn color="primary" dark text v-bind="attrs" v-on="on"
              >Menu</v-btn
            >
          </template>
          <v-card class="mx-auto" max-width="300" tile>
            <v-list dense>
              <v-list-item-group v-model="menu_item" color="primary">
                <v-list-item
                >
                  <v-list-item-icon>
                    <v-icon>mdi-content-save-move-outline</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title>{{
                      __("Close Shift")
                    }}</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
                <v-list-item
                  @click="print_last_invoice"
                >
                  <v-list-item-icon>
                    <v-icon>mdi-printer</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title>{{
                      __("Print Last Invoice")
                    }}</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
                <v-divider class="my-0"></v-divider>
                <v-list-item @click="logOut">
                  <v-list-item-icon>
                    <v-icon>mdi-logout</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title>{{ __("Logout") }}</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
                <v-list-item @click="go_about">
                  <v-list-item-icon>
                    <v-icon>mdi-information-outline</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title>{{ __("About") }}</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-list-item-group>
            </v-list>
          </v-card>
        </v-menu>
      </div> -->
    </v-app-bar>

    <!-- Navigation Drawer -->
    <v-navigation-drawer
      app
      expand-on-hover
      rail
      v-model="drawer"
      temporary
      style="background-color: #0d1821"
    >
      <div>
        <v-list density="compact" nav>
          <v-list-item
            title="Dashboard"
            value="Dashboard"
            style="color: white"
            @click="goToDashboard()"
          >
            <template v-slot:prepend>
              <v-icon size="36" color="white" class="pr-3"
                >mdi-view-dashboard</v-icon
              >
              <!-- Adjust size here -->
            </template>
          </v-list-item>
          <v-list-item
            title="Order History"
            value="Order history"
            style="color: white"
            @click="goToOrderHistory()"
          >
            <template v-slot:prepend>
              <v-icon size="36" color="white" class="pr-3">mdi-receipt</v-icon>
              <!-- Adjust size here -->
            </template>
          </v-list-item>
          <!-- <v-list-item
          title="Hold Order"
          value="Hold Order"
          style="color: white"
          @click="goToHoldOrder()"
        >
          <template v-slot:prepend>
            <v-icon size="36" color="white" class="pr-3">mdi-receipt</v-icon>
          </template>
        </v-list-item> -->
          <v-list-item style="color: white">
            <template v-slot:prepend>
              <v-icon size="36" color="white" class="pr-3">mdi-sync-off</v-icon>
            </template>
            <template v-slot:title>
              Unsync Invoice: <span>{{ unsyncInvoice }}</span>
            </template>
          </v-list-item>
        </v-list>
        <!-- Unsync Records Button -->
        <!-- <v-row justify="center" class="pb-4">
      <v-tooltip text="Unsync Records" location="top">
        <template v-slot:activator="{ props }">
          <v-btn
            v-bind="props"
            icon
            variant="tonal"
            color="white"
            @click="unsyncRecords"
          >
            <v-icon color="#ffffff">mdi-sync-off</v-icon>
          </v-btn>
        </template>
      </v-tooltip>
    </v-row> -->
      </div>
    </v-navigation-drawer>
    <div>
      <v-snackbar
        v-model="snack"
        top
        right
        :elevation="0"
        :timeout="5000"
        :color="snackColor"
        class="snack custom-snackbar"
        :class="'snack-type-' + type"
      >
        <div class="notification-content">
          <div class="notification-icon" :class="type">
            <v-icon v-if="type === 'success'">mdi-check-bold</v-icon>
            <v-icon v-if="type === 'error'">mdi-alert-circle</v-icon>
            <i class="fa fa-info-circle" v-if="type === 'info'"></i>
          </div>

          <div
            class="notification-message"
            style="font-size: 16px; font-weight: 500"
          >
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

    <!-- Main Content -->
    <v-main>
      <!-- <v-container>
        <h1>Main Content Area</h1>
        <p>This is where the content of your application will go.</p>
      </v-container> -->
      <!-- <POS/> -->
    </v-main>
  </div>
  <!-- </v-app> -->
</template>
<script>
import { ref, onMounted, watch } from "vue";
import POS from "./zaraPos/Home.vue";
import eventBus from "../bus";

export default {
  name: "NavDrawer",
  components: {
    POS,
  },
  setup() {
    // Reactive state for controlling the drawer visibility
    const drawer = ref(false);
    const loggedOut = ref(false); // Ref to track logged-out state
    const pos_profile = ref("");
    const snack = ref(false);
    const snackColor = ref("");
    const snackText = ref("");
    const type = ref("");
    const isInternet = ref(true);
    const unsyncInvoice = ref(0);
    const speedMbps = ref(null); // Measured internet speed in Mbps
    let intervalId = null; // Interval ID for clearing later
    const punching = ref("completed");

    const goToOrderHistory = () => {
      eventBus.emit("go-to-order-history");
    };
    const goToHoldOrder = () => {
      eventBus.emit("go-to-hold-order");
    };
    const goToDashboard = () => {
      eventBus.emit("open-product-menu");
    };

    const go_desk = () => {
      frappe.set_route("/");
      location.reload();
    };
    const closeShift = () => {
      eventBus.emit("open_closing_dialog");
    };

    const logOut = () => {
      loggedOut.value = true;

      // Assuming 'frappe' is available in your scope, modify accordingly if necessary
      return frappe.call({
        method: "logout",
        callback: (r) => {
          if (r.exc) {
            return;
          }
          frappe.set_route("/login");
          location.reload();
        },
      });
    };
    const showNotification = (data) => {
      snackText.value = data.text;
      snackColor.value = data.color;
      type.value = data.color;
      snack.value = true;
    };
    const syncSalesInvoicesFromIndexedDB = async () => {
      try {
        // Await the promise returned by openDatabase
        const db = await indexedDBService.openDatabase();
        const allRecords = await fetchUnsyncedSalesInvoiceRecords(db);
        // console.log("Fetched unsynced records length:", allRecords.length);
        unsyncInvoice.value = allRecords.length;
      } catch (error) {
        console.error("Error during synchronization:", error);
      }
    };

    const checkInternetSpeed = async (threshold = 2) => {
      const imageAddr =
        "https://upload.wikimedia.org/wikipedia/commons/a/a6/Brandenburger_Tor_abends.jpg"; // Test image URL
      const downloadSize = 2707459; // File size in bytes

      try {
        const download = new Image();
        const startTime = new Date().getTime();

        // Start downloading the test image
        const cacheBuster = `?cacheBuster=${startTime}`;
        download.src = imageAddr + cacheBuster;

        return new Promise((resolve, reject) => {
          download.onload = () => {
            const endTime = new Date().getTime();
            const duration = (endTime - startTime) / 1000; // Duration in seconds

            const bitsLoaded = downloadSize * 8; // Convert to bits
            const calculatedSpeedMbps = (
              bitsLoaded /
              duration /
              1024 /
              1024
            ).toFixed(2); // Mbps

            speedMbps.value = calculatedSpeedMbps;

            // Update online status based on threshold
            isInternet.value = parseFloat(calculatedSpeedMbps) >= threshold;
            if (calculatedSpeedMbps > 2) {
              isInternet.value = true;
            } else {
              console.log("offline mode on");
                isInternet.value = false;
            }

            console.log(
              `Internet speed: ${calculatedSpeedMbps} Mbps. ${
                isInternet.value ? "Online" : "Offline"
              }`
            );
            resolve({
              speedMbps: calculatedSpeedMbps,
              isOnline: isInternet.value,
            });
          };

          download.onerror = () => {
            speedMbps.value = null;
            isInternet.value = false;
            console.error("Error measuring internet speed.");
            reject(new Error("Error measuring internet speed."));
          };
        });
      } catch (error) {
        console.error("Error checking internet speed:", error);
        throw error;
      }
    };
    watch(isInternet, (newStatus) => {
      if (newStatus) {
        // Logic to handle going online
        console.log("Internet is now Online");
        // Place any additional functionality for "Online" state here
      } else {
        // Logic to handle going offline
        console.log("Internet is now Offline");
        // Place any additional functionality for "Offline" state here
      }
      eventBus.emit("app-internet-status", newStatus);
    });
    watch(drawer, (newStatus) => {
      if (newStatus) {
        syncSalesInvoicesFromIndexedDB;
      }
    });
    onMounted(() => {
      // checkInternetSpeed()
      // intervalId = setInterval(() => {
      //   if (navigator.onLine) {
      //   checkInternetSpeed();
      //   }
      // }, 15000);
      if (navigator.onLine) {
        isInternet.value = true;
      } else {
        isInternet.value = false;
      }
      eventBus.on("punching-status", (data) => {
        punching.value = data;
      });

      // console.log("navbar-internet", isInternet.value);
      eventBus.on("internet-status", (newVal) => {
        isInternet.value = newVal;
      });

      eventBus.on("logout-pos", () => {
        logOut();
      });
      eventBus.on("send_pos_profile", (profile) => {
        pos_profile.value = profile;
      });
      eventBus.on("show_mesage", (data) => {
        showNotification(data);
      });
      eventBus.on("Unsync-record", (data) => {
        unsyncInvoice.value = data;
      });
    });

    return {
      drawer,
      goToOrderHistory,
      loggedOut,
      logOut,
      pos_profile,
      go_desk,
      closeShift,
      snack,
      snackColor,
      snackText,
      type,
      goToDashboard,
      goToHoldOrder,
      isInternet,
      unsyncInvoice,
      checkInternetSpeed,
      syncSalesInvoicesFromIndexedDB,
      punching,
    };
  },
};
</script>
 <style scoped>
/* Add custom styling as necessary */
.custom-snackbar {
  position: fixed !important;
  top: 40px !important;
  right: 20px;
  z-index: 9999; /* Ensures it appears on top of other content */
  margin: 0;
}
</style>
<style>
.v-switch .v-label {
  margin-top: 8px;
}
.notification-content {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.notification-content .notification-icon.success {
  background-color: #3fbf62;
}
.notification-content .notification-icon.error {
  background-color: #ec4f2b;
}
.notification-content .notification-icon.info {
  background-color: #016de6;
}
.notification-content .notification-icon.warning {
  background-color: #ee9401;
}

.v-snack.snack-type-success .v-snack__wrapper {
  background-color: #eaf7ee !important;
  border: 1px solid #a4ddb4 !important;
}
.v-snack.snack-type-error .v-snack__wrapper {
  background-color: #fcece9 !important;
  border: 1px solid #f4c5bb !important;
}
.v-snack.snack-type-info .v-snack__wrapper {
  background-color: #e4effa !important;
  border: 1px solid #abcdf1 !important;
}
.v-snack.snack-type-warning .v-snack__wrapper {
  background-color: #fef7e9 !important;
  border: 1px solid #fde0af !important;
}
.notification-content .notification-message {
  color: white !important;
}
.notification-content .notification-icon i {
  width: 27px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.notification-content .notification-icon {
  font-size: 25px !important;
  padding: 5px;
  border-radius: 8px;
  margin-right: 10px;
}

.v-snack__btn.close-notification-button {
  color: #484848;
  margin-right: 10px;
}

.v-snack__content {
  padding: 5px 7px !important;
}
.v-snackbar--variant-elevated {
  position: fixed !important;
  top: 40px !important;
}
</style>