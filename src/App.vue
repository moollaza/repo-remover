<template>
  <div
    id="app"
    class="is-flex"
  >
    <TheNavBar v-if="$route.name !== 'home'" />

    <RouterView />

    <footer class="footer">
      <div class="content has-text-centered">
        <p class="has-text-dark">
          <small>
            Copyright © 2019 Zaahir Moolla |
            Source code available on
            <a
              href="https://github.com/moollaza/repo-remover"
              class="has-text-dark"
            >
              GitHub
            </a>
          </small>
        </p>
      </div>
    </footer>
  </div>
</template>

<script>
import TheNavBar from "@/components/TheNavBar.vue";
export default {
  components: {
    TheNavBar
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
</style>
