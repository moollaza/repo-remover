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
    async deleteRepos() {
      const selectedRepos = this.getSelectedRepos();

      let promises = selectedRepos.map(repo =>
        this.octokit.repos.delete({
          owner: this.$root.$data.login,
          repo: repo.name
        })
      );
      const results = await pSettle(promises);
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

