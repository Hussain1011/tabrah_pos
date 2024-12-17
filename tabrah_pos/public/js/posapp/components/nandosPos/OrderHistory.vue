<template>
  <v-card class="summary-card mt-3">
    <v-row class="pl-3">
      <v-col cols="12" class="pt-8">
        <v-card-title>
          <p class="title-p">Order History</p>
        </v-card-title>
      </v-col>
    </v-row>
    <v-row class="px-3">
      <v-col cols="12">
        <v-card-text>
          <v-simple-table>
            <template v-slot:default>
              <thead>
                <tr class="header-row">
                  <th class="text-left header-row">Order ID</th>
                  <th class="text-left header-row">Order Time</th>
                  <th class="text-left header-row">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="order in orders" :key="order.id">
                  <td class="row-data">{{ order.id }}</td>
                  <td class="row-data">{{ order.time }}</td>
                  <td class="row-data">{{ order.total }}</td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>
        </v-card-text>
      </v-col>
    </v-row>
    <v-row class="px-3">
      <v-col cols="12">
        <v-card-actions>
          <v-spacer></v-spacer>
          <p class="page-no mt-4 mr-3">Showing {{ orders.length }} of 21</p>
          <v-btn color="white" icon  tile large class="action-btn">
            <v-icon>mdi-chevron-left</v-icon>
          </v-btn>
          <v-btn icon color="white"  tile large class="action-btn">
            <v-icon>mdi-chevron-right</v-icon>
          </v-btn>
        </v-card-actions>
      </v-col>
    </v-row>
  </v-card>
</template>

<script>
export default {
  data() {
    return {
      orders: [
        { id: "N34560", time: "26/05/24 21:53", total: "RS. 4,632" },
        { id: "N34562", time: "26/05/24 21:53", total: "RS. 4,632" },
        { id: "N34563", time: "26/05/24 21:53", total: "RS. 4,632" },
        { id: "N34564", time: "26/05/24 21:53", total: "RS. 4,632" },
        { id: "N34565", time: "26/05/24 21:53", total: "RS. 4,632" },
        { id: "N34566", time: "26/05/24 21:53", total: "RS. 4,632" },
        { id: "N34566", time: "26/05/24 21:53", total: "RS. 4,632" },
        { id: "N34566", time: "26/05/24 21:53", total: "RS. 4,632" },
        { id: "N34566", time: "26/05/24 21:53", total: "RS. 4,632" },
        { id: "N34566", time: "26/05/24 21:53", total: "RS. 4,632" },
        { id: "N34566", time: "26/05/24 21:53", total: "RS. 4,632" },

      ],
    };
  },
};
</script>

<style scoped>
.title-p {
  font-size: 48px !important;
  font-weight: 500 !important;
}
.row-data {
  font-size: 20px;
}
.header-row {
  font-size: 20px !important;
  font-weight: 500 !important;
}
.page-no {
  font-size: 16px !important;
}
.action-btn{
    background: #AF002B

}
</style>