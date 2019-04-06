<template>
  <button
    class="button is-primary"
    @click="generateRepos"
  >
    Generate More Repos
  </button>
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
