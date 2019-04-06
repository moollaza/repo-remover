<template>
  <nav
    class="navbar is-light"
    role="navigation"
    aria-label="main navigation"
  >
    <div class="container">
      <div class="navbar-brand">
        <router-link
          to="/"
          class="navbar-item has-text-weight-bold is-size-4"
        >
          Repo Remover
        </router-link>

        <!-- Hamburger Menu -->
        <a
          role="button"
          class="navbar-burger burger"
          aria-label="menu"
          aria-expanded="false"
          data-target="navbar"
          @click="isMenuActive = !isMenuActive"
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </a>
      </div>


      <div
        id="navbar"
        :class="['navbar-menu',
                 isMenuActive ? 'is-active' : '']"
      >
        <div class="navbar-start">
          <router-link
            to="/"
            class="navbar-item"
          >
            Home
          </router-link>
          <router-link
            to="/about"
            class="navbar-item"
          >
            About
          </router-link>
          <div
            v-if="showGenerateButton"
            class="navbar-item"
          >
            <GenerateReposButton />
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
const GenerateReposButton = () =>
  process.env.NODE_ENV === "development"
    ? import(/* webpackChunkName: "generateReposButton" */ "./GenerateReposButton.vue")
    : false;

export default {
  components: {
    GenerateReposButton
  },
  data() {
    return {
      isMenuActive: false,
      showGenerateButton: process.env.NODE_ENV === "development"
    };
  }
};
</script>
