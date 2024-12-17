<template>
  <div>
    <v-row no-gutters class="mt-2">
      <v-col
        cols="4"
        class="p-1"
        v-for="(button, index) in buttonType"
        :key="index"
      >
        <v-btn
          class="white--text"
          color="#AF002B"
          depressed
          block
          elevation="2"
          raised
          x-large
          height="60px"
          >{{ button.label }}</v-btn
        >
      </v-col>
    </v-row>
  </div>
</template>

<script>
export default {
  props: {
    buttonType: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {};
  },
};
</script>

<style>
</style>