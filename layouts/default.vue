<template>
  <div
    id="app"
    class="d-flex flex-column"
  >
    <NavBar v-if="$route.name !== 'home'" />
    <div class="container pt-3 pt-sm-5">
      <router-view />
    </div>
    <footer class="mt-auto text-center py-4 bg-light">
      <small>
        Copyright © 2019 Zaahir Moolla
      </small>
    </footer>
  </div>
</template>

<script>
import NavBar from '@/components/NavBar.vue';
export default {
  components: {
    NavBar
  }
};
</script>

<style lang="scss">
@import "~bootstrap/scss/bootstrap.scss";

html {
  font-size: 0.9rem;
}

#app {
  height: 100vh;
  width: 100vw;
}

#app > .container {
  flex: 1 0 auto;
}

footer {
  flex-shrink: 0;
}

@include media-breakpoint-up(sm) {
  html {
    font-size: 1rem;
  }
}
</style>
