<template>
  <div
    id="app"
    class="is-flex"
  >
    <NavBar v-if="$route.name !== 'home'" />

    <router-view />

    <footer class="footer">
      <div class="content has-text-centered">
        <p>
          <small>
            Copyright © 2019 Zaahir Moolla
          </small>
        </p>
      </div>
    </footer>
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
@import "./scss/base";

html {
  font-size: 0.9rem;
  overflow: auto;
}

#app {
  min-height: 100vh;
  flex-direction: column;
}

.footer {
  margin-top: auto;
  flex-shrink: 0;
}

// @include media-breakpoint-up(sm) {
//   html {
//     font-size: 1rem;
//   }
// }
</style>
