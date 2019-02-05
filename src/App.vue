<template>
  <div id="app">
    <NavBar v-if="$route.name !== 'home'" />
    <div class="container pt-3 pt-sm-5">
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

<style lang="scss">
// Import Bootstrap + Bootstrap-Vue
@import "~bootstrap/scss/bootstrap.scss";
@import "~bootstrap-vue/dist/bootstrap-vue.css";

html {
  font-size: 0.9rem;
}

@include media-breakpoint-up(sm) {
  html {
    font-size: 1rem;
  }
}
</style>
