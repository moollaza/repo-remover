<template>
  <nav
    class="navbar"
    role="navigation"
    aria-label="main navigation"
  >
    <div class="navbar-brand">
      <router-link
        to="/"
        class="navbar-item"
      >
        Home
      </router-link>
    </div>

    <a
      role="button"
      class="navbar-burger burger"
      aria-label="menu"
      aria-expanded="false"
      data-target="navbar"
    >
      <span aria-hidden="true" />
      <span aria-hidden="true" />
      <span aria-hidden="true" />
    </a>

    <div
      id="navbar"
      class="navbar-menu"
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
        <router-view
          class="navbar-item"
          @click="generateRepos"
        >
          More Repos
        </router-view>
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
  mounted() {
    this.octokit = new Octokit({ auth: `token ${this.$root.$data.token}` });
  },
  methods: {
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
        console.error("ERROR - Repo Creation Failed", error);
      }
    }
  }
};
</script>
