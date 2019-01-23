<template>
  <div id="app">
    <NavBar v-if="$route.name !== 'home'" />
    <div class="container pt-5">
      <router-view />
    </div>
  </div>
</template>

<script>
import NavBar from "@/components/NavBar.vue";
export default {
  components: {
    NavBar
  }
};
</script>
