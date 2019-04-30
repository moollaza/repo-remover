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

        <div class="navbar-end">
          <div class="navbar-item">
            <div class="field is-grouped">
              <p class="control">
                <a
                  class="button is-outlined is-twitter"
                  target="_blank"
                  href="https://twitter.com/intent/tweet?url=https%3A%2F%2Freporemover.xyz&text=Repo%20Remover%3A%20Easily%20delete%20and%20archive%20multiple%20GitHub%20repos%20at%20once%20with%20Repo%20Remover!%20via%20%40zmoolla"
                >
                  <b-icon
                    icon="twitter"
                    pack="fab"
                  />
                  <span>Tweet</span>
                </a>
              </p>
              <p class="control">
                <a
                  class="button is-light"
                  href="https://github.com/moollaza/repo-remover"
                >
                  <b-icon
                    icon="github"
                    pack="fab"
                  />
                  <span>Project</span>
                </a>
              </p>
              <p class="control">
                <a
                  href="mailto:hello@reporemover.xyz?subject=Hello! I have some feedback..."
                  class="button is-light"
                >
                  <b-icon
                    icon="paper-plane"
                  />
                  <span>Feedback</span>
                </a>
              </p>
            </div>
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
    // Some utils to make development easier
    async makeRepo() {
      const name = randomName().spaced;
      await this.octokit.repos.createForAuthenticatedUser({ name });
      return await delay(500);
    },
    // this will create an empty repo with
    // a random name in your GitHub account
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
