<template>
  <v-app>
    <Navbar1/>
    <v-main style="background: #F4F4F4; min-height: 100vh;">
      <v-container fluid class="pa-0">
        <POS/>
      </v-container>
    </v-main>
  </v-app>
</template>
  
<script>
import { ref } from 'vue';
import Navbar1 from './components/Navbar1.vue';
import POS from './components/tabrahPos/Home.vue';

export default {
  name: 'MyComponent',
  components: {
      Navbar1,
      POS
  },
  setup() {
    const page = ref('POS');
    return {};
  },
};
</script>
  
<style>
.border-16 {
  border-radius: 16px !important;
}
</style>
  