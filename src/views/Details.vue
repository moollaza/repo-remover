<template>
  <main>
    <!-- Apollo Query -->
    <ApolloQuery
      v-if="$root.$data.token"
      ref="apolloQuery"
      :query="require('@/graphql/GitHubRepos.gql')"
      :context="{
        headers: {
          authorization: `Bearer ${$root.$data.token}`,
          'User-Agent': 'Repo Remover'
        }
      }"
      :variables="{
        ghLogin: `${$root.$data.login}`
      }"
      @result="onResult"
    >
      <template slot-scope="{ result: { error, data }, isLoading }">
        <!-- Loading -->
        <div v-if="isLoading">
          <section class="section">
            <div class="container">
              <div class="spinner text-primary" role="status">
                <span class="sr-only">
                  Loading...
                </span>
              </div>
            </div>
          </section>
        </div>

        <!-- Error -->
        <div v-else-if="error">
          <section class="section">
            <div class="container">
              <b-message type="is-danger" has-icon closeable="false">
                <b>Uh-oh!</b> We couldn't get your GitHub data. Please verify
                your Personal Access Token is correct and try again.
                <router-link to="/#get-started">
                  Go Back
                </router-link>
              </b-message>
            </div>
          </section>
        </div>

        <!-- Result -->
        <div v-else-if="data && data.user">
          <section class="section">
            <div class="container">
              <h3 class="title is-4">Authenicated as:</h3>
              <UserBox :viewer="data && data.user" />
            </div>
          </section>

          <!-- Repos Table -->
          <section class="section">
            <ReposTable v-if="repos.length > 0" :repos="repos" />
          </section>
        </div>

        <!-- No result -->
        <div v-else>No result :(</div>
      </template>
    </ApolloQuery>
    <!-- No Token -->
    <div v-else>
      <section class="section">
        <div class="container">
          <b-message type="is-warning" has-icon closeable="false">
            <b>Uh-oh!</b> A token is required to get your GitHub data. Please
            enter your Personal Access Token first.
            <router-link to="/#get-started">Go Back</router-link>
          </b-message>
        </div>
      </section>
    </div>
  </main>
</template>

<script>
import UserBox from "@/components/UserBox.vue";
import ReposTable from "@/components/ReposTable.vue";

import { filters } from "@/mixins.js";

let lastCursor = false;

export default {
  name: "Details",
  components: {
    UserBox,
    ReposTable
  },
  mixins: [filters],
  data() {
    return {
      token: this.$root.$data.token,
      repos: []
    };
  },
  mounted() {
    this.$root.$on("repos-updated", (isDeletion, results) => {
      const successes = results.filter(res => res.isFulfilled);
      const failures = results.filter(res => !res.isFulfilled);

      if (successes.length > 0) {
        this.notifySuccess(isDeletion, successes.length);
      }

      if (failures.length > 0) {
        this.notifyFailure(isDeletion, failures);
      }

      this.refetchData();
    });

    // Refetch Table
    this.$root.$on("reload-table", () => {
      this.refetchData();
    });

    // Grab query object from Component so we can refetch
    // data after modifying repos
    this.$nextTick(function() {
      this.query =
        this.$refs.apolloQuery && this.$refs.apolloQuery.getApolloQuery();
    });
  },
  methods: {
    refetchData() {
      this.query.refetch();
    },

    async getNextPage(afterCursor) {
      if (!afterCursor) {
        throw new Error(
          "No afterCursor argument passed to getNextPage function"
        );
      }

      if (lastCursor === afterCursor) {
        return;
      }

      lastCursor = afterCursor;

      await this.query.fetchMore({
        variables: {
          after: afterCursor
        },
        // Transform the previous result with new data
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) {
            return prev;
          }

          const newPageInfo = fetchMoreResult.user.repositories.pageInfo;

          this.repos = [
            ...prev.user.repositories.nodes,
            ...fetchMoreResult.user.repositories.nodes
          ].filter(repo => repo.viewerCanAdminister);

          return Object.assign({}, prev, {
            user: {
              ...prev.user,
              repositories: {
                ...prev.user.repositories,
                nodes: [
                  ...prev.user.repositories.nodes,
                  ...fetchMoreResult.user.repositories.nodes
                ],
                pageInfo: fetchMoreResult.user.repositories.pageInfo
              }
            }
          });
        }
      });
    },

    async onResult({ data, loading }) {
      // Seems this can prematurely fire with an empty data object
      if (!data) return;

      this.$root.$data.login = data.user.login;
      this.repos = data.user.repositories.nodes.filter(
        repo => repo.viewerCanAdminister
      );

      // Load next 100 repos if available
      // the response will fire onResult again
      if (data.user.repositories.pageInfo.hasNextPage === true) {
        this.getNextPage(data.user.repositories.pageInfo.endCursor);
      }
    },

    notifySuccess(isDeletion, amount) {
      const action = isDeletion ? "deleted" : "archived";
      const numRepos = this.$options.filters.pluralize(
        amount,
        "repos were",
        "repo was"
      );
      const message = `${numRepos} successfully ${action}`;
      this.notify("success", message);
    },

    notifyFailure(isDeletion, failures) {
      const action = isDeletion ? "delete" : "archive";

      failures.forEach(obj => {
        const message = `
          Failed to ${action} "${obj.reason.repo.name}": ${obj.reason.error.message}`;

        this.notify("fail", message, { queue: false, indefinite: true });
      });
    },

    notify(type, message, ops) {
      this.$buefy.snackbar.open(
        Object.assign(
          {
            duration: type === "success" ? 5000 : 10000,
            position: "is-top-right",
            type: type === "success" ? "is-success" : "is-warning",
            message,
            queue: type !== "success"
          },
          ops
        )
      );
    }
  }
};
</script>

<style lang="scss" scoped>
main.container {
  padding: 3em 0;

  @include mobile {
    padding: 1em 0.5em;
  }
}

// Loading Spinner
// Source: https://stephanwagner.me/only-css-loading-spinner
@keyframes spinner {
  to {
    transform: rotate(360deg);
  }
}

.spinner:before {
  content: "";
  box-sizing: border-box;
  position: absolute;
  top: 50%;
  left: 50%;
  width: 50px;
  height: 50px;
  margin-top: -10px;
  margin-left: -10px;
  border-radius: 50%;
  border-top: 2px solid #07d;
  border-right: 2px solid transparent;
  animation: spinner 0.6s linear infinite;
}
</style>
