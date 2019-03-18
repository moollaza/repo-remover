<template>
  <!-- Modal Component -->
  <div
    id="confirmAction"
    class="modal-card"
  >
    <header class="modal-card-head">
      <p class="modal-card-title">
        {{ modalTitle }}
      </p>
    </header>

    <section class="modal-card-body">
      <p>
        Are you sure you want to {{ showDelete ? "delete" : "archive" }} the following {{ numSelectedRepos() }} repos?
      </p>

      <div class="content confirm-action-list">
        <ol class="">
          <li
            v-for="repo in getSelectedRepos()"
            :key="repo.id"
          >
            {{ repo.name }}
          </li>
        </ol>
      </div>

      <div
        v-if="showDelete"
        class="modal-warning"
      >
        <strong class="text-danger">
          Warning:
        </strong>
        This <em>cannot</em> be undone. Repos will be unrecoverable.
      </div>
    </section>

    <footer class="modal-card-foot">
      <button
        class="button"
        type="button"
        @click="$parent.close()"
      >
        Cancel
      </button>
      <button
        :class="['button',
                 showDelete ? 'is-danger' : 'is-warning']"
        @click="modifyRepos"
      >
        Confirm {{ showDelete ? "Delete" : "Archive" }}
      </button>
    </footer>
  </div>
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
      return (this.showDelete ? "Delete" : "Archive") + " Repos";
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
  margin-top: 1em;
  max-height: 50vh;
  overflow-y: auto;
}

.modal-warning {
  margin-top: 2em;
}
</style>

