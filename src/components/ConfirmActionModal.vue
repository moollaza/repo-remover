<template>
  <!-- Modal Component -->
  <b-modal
    id="confirmAction"
    centered
    :title="modalTitle"
    :ok-variant="modalVariant"
    :ok-title="modalOkText"
    @ok="modifyRepos"
  >
    <p>
      Are you sure you want to {{ showDelete ? "delete" : "archive" }} the following {{ numSelectedRepos() }} repos?
    </p>

    <ul class="confirm-action-list">
      <li
        v-for="repo in getSelectedRepos()"
        :key="repo.id"
      >
        {{ repo.name }}
      </li>
    </ul>

    <small
      v-if="showDelete"
      class="mb-0"
    >
      <strong class="text-danger">
        Warning:
      </strong>
      This cannot be undone. Repos will be unrecoverable.
    </small>
  </b-modal>
</template>

<script>
import { selectedRepos } from "@/mixins.js";

const pSettle = require("p-settle");
const Octokit = require("@octokit/rest");

export default {
  mixins: [selectedRepos],
  props: {
    showDelete: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    modalTitle() {
      return "Confirm " + (this.showDelete ? "Deletion" : "Archival");
    },
    modalVariant() {
      return this.showDelete ? "danger" : "warning";
    },
    modalOkText() {
      return (this.showDelete ? "Delete" : "Archive") + " Modals";
    }
  },
  mounted() {
    this.octokit = new Octokit({
      auth: `token ${this.$root.$data.token}`,
      userAgent: "Repo Remover"
    });

    this.octokit.hook.error("request", error => {
      throw error;
    });
  },
  methods: {
    // TODO: Move this out to Details and trigger via event?
    async modifyRepos() {
      const selectedRepos = this.getSelectedRepos();

      let promises = selectedRepos.map(async repo => {
        try {
          if (this.showDelete) {
            await this.octokit.repos.delete({
              owner: this.$root.$data.login,
              repo: repo.name
            });
          } else {
            await this.octokit.repos.update({
              owner: this.$root.$data.login,
              repo: repo.name,
              name: repo.name,
              archived: true
            });
          }
          return repo;
        } catch (error) {
          return Promise.reject({ error, repo });
        }
      });

      const results = await pSettle(promises);

      this.updateRepos(results);
    },
    updateRepos(results) {
      this.$root.$emit("repos-updated", this.showDelete, results);
    }
  }
};
</script>
<style scoped>
.confirm-action-list {
  max-height: 50vh;
  overflow-y: auto;
}
</style>

