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
            <button
              class="button is-primary"
              @click="generateRepos"
            >
              Generate More Repos
            </button>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
const randomName = require("project-name-generator");
const Octokit = require("@octokit/rest");

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default {
  data() {
    return {
      isMenuActive: false,
      showGenerateButton: process.env.NODE_ENV === "development"
    };
  },
  mounted() {
    this.octokit = new Octokit({ auth: `token ${this.$root.$data.token}` });
  },
  methods: {
    // some utils to make development easier
    async makeRepo() {
      const name = randomName().spaced;
      await this.octokit.repos.createForAuthenticatedUser({ name });
      return await delay(500);
    },
    async generateRepos() {
      try {
        await this.makeRepo();
        await this.makeRepo();
        await this.makeRepo();
        await delay(1000);
        this.$root.$emit("reload-table");
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("ERROR - Repo Creation Failed", error);
      }
    }
  }
};
</script>
