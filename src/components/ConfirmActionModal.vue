<template>
  <div
    id="confirmAction"
    class="modal-card"
  >
    <header class="modal-card-head">
      <p class="modal-card-title has-text-weight-bold">
        {{ modalTitle }}
      </p>
    </header>

    <section class="modal-card-body">
      <b-message
        v-if="showDelete"
        type="is-danger"
      >
        <strong>
          Warning:
        </strong>
        This action cannot be undone. This will permanently delete the {{ repos.length | pluralize("repos", "repository", { noNumber: true }) }}, {{ repos.length | pluralize("wikis", "wiki", { noNumber: true }) }}, issues, and comments, and remove all collaborator associations.
      </b-message>

      <p>
        Are you sure you want to <strong>{{ showDelete ? "delete" : "archive" }}</strong> the following {{ repos.length | pluralize("repos", "repository", { noSingleValue: true }) }}?
      </p>

      <div class="content confirm-action-list">
        <ul class="">
          <li
            v-for="repo in repos"
            :key="repo.id"
          >
            {{ repo.name }}
          </li>
        </ul>
      </div>

      <b-field label="Please type your GitHub username to confirm:">
        <b-input
          v-model="confirmUsername"
          autofocus
        />
      </b-field>
    </section>

    <footer class="modal-card-foot">
      <div class="buttons">
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
          :disabled="confirmUsername !== $root.$data.login"
          @click="modifyRepos"
        >
          I understand the consequences, {{ showDelete ? "delete" : "archive" }} {{ repos.length | pluralize("these repositories", "this repository", { noNumber: true }) }}
        </button>
      </div>
    </footer>
  </div>
</template>

<script>
import { filters } from "@/mixins.js";

const pSettle = require("p-settle");
const Octokit = require("@octokit/rest");

export default {
  mixins: [filters],
  props: {
    showDelete: {
      type: Boolean,
      default: true
    },
    repos: {
      type: Array,
      default: function() {
        return [];
      }
    }
  },
  data() {
    return {
      confirmUsername: ""
    };
  },
  computed: {
    modalTitle() {
      return "Confirm " + (this.showDelete ? "Deletion" : "Archival");
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
      let promises = this.repos.map(async repo => {
        try {
          if (this.showDelete) {
            await this.octokit.repos.delete({
              owner: repo.owner.login,
              repo: repo.name
            });

            window.fathom && fathom.trackGoal(process.env.VUE_APP_FATHOM_REPO_DELETED, 0);
          } else {
            await this.octokit.repos.update({
              owner: repo.owner.login,
              repo: repo.name,
              name: repo.name,
              archived: true
            });

            window.fathom && fathom.trackGoal(process.env.VUE_APP_FATHOM_REPO_ARCHIVED, 0);
          }
          return repo;
        } catch (error) {
          return Promise.reject({ error, repo });
        }
      });

      const results = await pSettle(promises);
      this.$root.$emit("repos-updated", this.showDelete, results);
      this.$parent.close();
    }
  }
};
</script>

<style lang="scss" scoped>
.confirm-action-list {
  margin-top: 0.5em;
  max-height: 50vh;
  overflow-y: auto;
}

.modal-warning {
  margin-top: 2em;
}

.modal-card-foot {
  justify-content: flex-end;

  .button {
    @include mobile {
      width: 100%;
      height: auto;
      margin-right: 0;
      white-space: normal;
    }
  }
}
</style>

