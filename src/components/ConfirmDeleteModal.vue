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
    <p class="mb-4">
      Are you sure you want to delete the following {{ numSelectedRepos() }} repos?
      <small class="d-block">
        <strong class="text-danger">
          Warning:
        </strong>
        This cannot be undone. Repos will likely be unrecoverable.
      </small>
    </p>

    <ul class="list-unstyled confirm-delete-list">
      <li
        v-for="repo in getSelectedRepos()"
        :key="repo.id"
      >
        {{ repo.name }}
      </li>
    </ul>
  </b-modal>
</template>

<script>
import { selectedRepos } from "@/mixins.js";

const pSettle = require("p-settle");
const Octokit = require("@octokit/rest");

export default {
  mixins: [selectedRepos],
  mounted() {
    this.octokit = new Octokit({ auth: `token ${this.$root.$data.token}` });
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
          return error;
        }
      });
      const results = await pSettle(promises);

      this.updateRepos(results);
    },
    updateRepos(results) {
      const selectedRepos = this.getSelectedRepos();
      const fail = results.filter(x => x.isRejected);
      const success = results.filter(x => x.isFulfilled);

      results.forEach((result, index) => {
        if (result.isFulfilled) {
          const deletedRepo = selectedRepos[index];
          const repo = this.$root.$data.repos.find(
            repo => repo.name === deletedRepo.name
          );
        }
      });
      this.$root.$emit("repos-deleted", success, fail);
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

