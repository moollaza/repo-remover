<template>
  <div
    id="app"
    class="is-flex"
  >
    <TheNavBar v-if="$route.name !== 'home'" />

    <RouterView />

    <TheFooter />
  </div>
</template>

<script>
import TheNavBar from "@/components/TheNavBar.vue";
import TheFooter from "@/components/TheFooter.vue";
export default {
  components: {
    TheNavBar,
    TheFooter
  }
};
</script>

<style lang="scss">
html {
  font-size: 0.9rem;
  overflow: auto;
}

#app {
  min-height: 100vh;
  flex-direction: column;
}
</style>
