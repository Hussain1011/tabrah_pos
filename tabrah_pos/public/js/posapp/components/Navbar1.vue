<template>
  <div>
    <!-- Modern App Bar -->
    <v-app-bar app height="56" class="pos-top-bar elevation-0" style="background: white; border-bottom: 1px solid #DEE2E6;">
      <!-- Left: Brand -->
      <div class="d-flex align-center" style="margin-left: 20px;">
        <div class="pos-brand-icon" @click="go_desk">
          <v-icon size="24" color="primary">mdi-store</v-icon>
        </div>
        <span class="ml-3" @click="go_desk" style="cursor: pointer; font-size: 18px; font-weight: 700; text-transform: uppercase; color: rgb(var(--v-theme-primary));">{{ pos_profile.company || 'POS' }}</span>
      </div>

      <!-- Center: Navigation Buttons -->
      <div class="d-flex align-center justify-center" style="position: absolute; left: 50%; transform: translateX(-50%); gap: 8px;">
        <v-btn variant="tonal" color="primary" size="small" @click="goToDashboard()">
          <v-icon size="18" class="mr-1">mdi-view-grid-outline</v-icon>
          POS
        </v-btn>
        <v-btn variant="tonal" color="primary" size="small" @click="goToHoldOrder()">
          <v-icon size="18" class="mr-1">mdi-clipboard-text-outline</v-icon>
          Hold
        </v-btn>
      </div>

      <v-spacer></v-spacer>

      <!-- Right: POS name, Close POS, Menu -->
      <div class="d-flex align-center" style="gap: 8px; margin-right: 12px;">
        <span style="font-size: 13px; font-weight: 600; color: #6C757D;">{{ pos_profile.name }}</span>

        <v-btn variant="outlined" color="error" size="small" @click="go_desk()"
          style="text-transform: none; font-weight: 600; border-radius: 10px;">
          <v-icon size="16" class="mr-1">mdi-logout</v-icon>
          Close POS
        </v-btn>

        <v-menu transition="slide-y-transition" offset-y>
          <template v-slot:activator="{ props }">
            <v-btn variant="tonal" color="primary" v-bind="props" size="small">
              <v-icon size="18" class="mr-1">mdi-menu</v-icon>
              Menu
            </v-btn>
          </template>

          <v-list class="py-1" style="border-radius: 14px; box-shadow: 0 8px 24px rgba(0,0,0,0.12); min-width: 180px;">
            <v-list-item class="d-flex" @click="closeShift()" style="border-radius: 10px;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <v-icon size="20" color="primary">mdi-content-save-move-outline</v-icon>
                <v-list-item-title style="font-size: 13px; font-weight: 500;">Close Shift</v-list-item-title>
              </div>
            </v-list-item>
            <v-list-item class="d-flex" @click="logOut()" style="border-radius: 10px;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <v-icon size="20" color="error">mdi-logout</v-icon>
                <v-list-item-title style="font-size: 13px; font-weight: 500;">Logout</v-list-item-title>
              </div>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
    </v-app-bar>

    <!-- Notification Snackbar -->
    <div>
      <v-snackbar v-model="snack" location="top right" :elevation="0" :timeout="4000" :color="snackColor"
        class="pos-snackbar" :class="'snack-type-' + type">
        <div class="notification-content">
          <div class="notification-icon" :class="type">
            <v-icon v-if="type === 'success'">mdi-check-bold</v-icon>
            <v-icon v-if="type === 'error'">mdi-alert-circle</v-icon>
            <i class="fa fa-info-circle" v-if="type === 'info'"></i>
          </div>

          <div class="notification-message" style="font-size: 16px; font-weight: 500">
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
  </div>
</template>

<script>
import { ref, onMounted, watch, onUnmounted } from "vue";
import POS from "./tabrahPos/Home.vue";
import eventBus from "../bus";
import storageService from "../storageService";

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
    const test = ref(false);

    const goToOrderHistory = () => {
      eventBus.emit("go-to-order-history");
    };
    const openCustomerScreen = () => {
      console.log("oopenCustomerScreen", window.location.pathname);
      const customerScreenUrl = `${window.location.origin}/app/customerscreen`; // Update the path if using Vue Router
      window.open(customerScreenUrl, "_blank");
    };

    const getHoldOrders = async () => {
      try {
        // Retrieve hold orders from local storage
        // orders.value = [];
        const heldOrders =
          (await JSON.parse(localStorage.getItem("heldOrders"))) || [];
        eventBus.emit("go-to-hold-order", heldOrders);

        console.log("Hold orders retrieved successfully:", heldOrders);
      } catch (error) {
        console.error("Failed to retrieve hold orders:", error);
      }
    };
    const goToHoldOrder = () => {
      getHoldOrders();

      // eventBus.emit("go-to-hold-order");
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
        const allRecords = storageService.getUnsyncedInvoices();
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
              `Internet speed: ${calculatedSpeedMbps} Mbps. ${isInternet.value ? "Online" : "Offline"
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
        // syncSalesInvoicesFromIndexedDB;
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
      window.addEventListener("offline", () => {
        isInternet.value = false;
      });

      window.addEventListener("online", () => {
        isInternet.value = true;
      });

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
        // Switch Vuetify theme based on company
        if (window.__posVuetify && window.__posGetTheme) {
          const themeName = window.__posGetTheme(profile.company);
          window.__posVuetify.theme.global.name.value = themeName;
        }
      });
      eventBus.on("show_mesage", (data) => {
        showNotification(data);
      });
      eventBus.on("Unsync-record", (data) => {
        unsyncInvoice.value = data;
      });
    });
    onUnmounted(() => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
      eventBus.off("punching-status");
      eventBus.off("internet-status");
      eventBus.off("logout-pos");
      eventBus.off("send_pos_profile");
      eventBus.off("Unsync-record");
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
      // getHoldOrders,
      openCustomerScreen,
    };
  },
};
</script>

<style scoped>
.pos-top-bar {
  z-index: 101 !important;
}
.pos-brand-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: #F3EDF2;
  border-radius: 10px;
  cursor: pointer;
}
.pos-brand-icon:hover {
  background: #714B67;
}
.pos-brand-icon:hover .v-icon {
  color: white !important;
}
.custom-snackbar {
  position: fixed !important;
  top: 40px !important;
  right: 20px;
  z-index: 9999;
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

.curser-pointer {
  cursor: pointer;
}
</style>
