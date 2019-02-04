<template>
  <!-- Modal Component -->
  <b-modal
    id="confirmDelete"
    centered
    title="Confirm Deletion"
    ok-variant="danger"
    ok-title="Delete Repos"
    @ok="deleteRepos"
  >
    <p>
      Are you sure you want to delete the following {{ numSelectedRepos() }} repos?
    </p>

    <ul class="confirm-delete-list">
      <li
        v-for="repo in getSelectedRepos()"
        :key="repo.id"
      >
        {{ repo.name }}
      </li>
    </ul>

    <small class="mb-0">
      <strong class="text-danger">
        Warning:
      </strong>
      This cannot be undone. Repos will be unrecoverable.
    </small>
  </b-modal>
</template>

<script>
import { selectedRepos } from "@/mixins.js";
import { log } from "util";

const pSettle = require("p-settle");
const Octokit = require("@octokit/rest");

export default {
  mixins: [selectedRepos],
  mounted() {
    this.octokit = new Octokit({
      auth: `token ${this.$root.$data.token}`,
      log: console
    });

    this.octokit.hook.error("request", error => {
      throw error;
    });
  },
  methods: {
    // TODO: Move this out to Details and trigger via event?
    async deleteRepos() {
      const selectedRepos = this.getSelectedRepos();

      let promises = selectedRepos.map(async repo => {
        try {
          await this.octokit.repos.delete({
            owner: this.$root.$data.login,
            repo: repo.name
          });
          return repo;
        } catch (error) {
          return Promise.reject({ error, repo });
        }
      });

      const results = await pSettle(promises);

      this.updateRepos(results);
    },
    updateRepos(results) {
      this.$root.$emit("repos-deleted", results);
    }
  }
};
</script>
<style scoped>
.confirm-delete-list {
  max-height: 50vh;
  overflow-y: auto;
}
</style>

