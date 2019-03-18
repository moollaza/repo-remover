<template>
  <main class="container">
    <!-- Success Alerts -->
    <UpdateAlerts
      v-if="hasSuccessAlerts"
      :alerts="alerts.success"
      type="success"
      :is-deletion="alerts.isDeletion"
    />
    <!-- Fail Alerts -->
    <UpdateAlerts
      v-if="hasFailAlerts"
      :alerts="alerts.fail"
      type="fail"
      :is-deletion="alerts.isDeletion"
    />

    <!-- Apollo Query -->
    <ApolloQuery
      v-if="$root.$data.token"
      ref="apolloQuery"
      fetch-policy="cache-and-network"
      :query="require('@/graphql/GitHubViewer.gql')"
      :context="{
        headers: {
          authorization: `Bearer ${$root.$data.token}`,
          'User-Agent': 'Repo Remover'
        }
      }"
      @result="onResult"
    >
      <template slot-scope="{ result: { loading, error, data }, isLoading }">
        <!-- Loading -->
        <div
          v-if="isLoading"
          class="text-center"
        >
          <div
            class="spinner-border text-primary"
            role="status"
          >
            <span class="sr-only">
              Loading...
            </span>
          </div>
        </div>

        <!-- Error -->
        <div v-else-if="error">
          An error occured. &nbsp;
          <router-link to="/">
            Go Back
          </router-link>
        </div>

        <!-- Result -->
        <div v-else-if="data && data.viewer">
          <div class="columns">
            <div class="column is-three-quarters">
              <h3 class="title is-4">
                Authenicated as:
              </h3>
              <TheUserBox :viewer="data && data.viewer" />
            </div>
          </div>

          <!-- Repos Table -->
          <TheReposTable v-if="$root.$data.repos" />
        </div>

        <!-- No result -->
        <div v-else>
          No result :(
        </div>
      </template>
    </ApolloQuery>
  </main>
</template>

<script>
import TheUserBox from "@/components/TheUserBox.vue";
import TheReposTable from "@/components/TheReposTable.vue";
import UpdateAlerts from "@/components/UpdateAlerts.vue";

export default {
  name: "Details",
  components: {
    TheUserBox,
    TheReposTable,
    UpdateAlerts
  },
  data() {
    return {
      alerts: {
        isDeletion: null,
        success: [],
        fail: []
      }
    };
  },
  computed: {
    hasSuccessAlerts() {
      return this.alerts.success.length > 0;
    },
    hasFailAlerts() {
      return this.alerts.fail.length > 0;
    }
  },
  mounted() {
    this.$root.$on("repos-updated", (isDeletion, results) => {
      this.alerts.isDeletion = isDeletion;

      results.forEach(res => {
        const type = res.isFulfilled ? "success" : "fail";
        if (type === "success") {
          this.alerts[type].push(res.value);
        } else {
          this.alerts[type].push(res.reason);
        }
      });
      this.refetchData();
    });

    // Remove alert data from array when alert dismissed
    this.$root.$on("alert-dismissed", type => {
      this.alerts[type] = [];
    });

    // Refetch Table
    this.$root.$on("reload-table", () => {
      this.refetchData();
    });

    // Grab query object from Component so we can refetch
    // data after modifying repos
    this.$nextTick(function() {
      this.query = this.$refs.apolloQuery.getApolloQuery();
    });
  },
  methods: {
    refetchData() {
      this.query.refetch();
    },

    onResult(resultObj) {
      // Seems this can prematurely fire with an empty data object
      if (!resultObj.data) return;

      this.$root.$data.login = resultObj.data.viewer.login;
      this.$root.$data.repos = resultObj.data.viewer.repositories.nodes.map(
        repo => {
          // Add some reactive properties needed for table selection
          this.$set(repo, "isSelected", false);
          this.$set(repo, "_rowVariant", "");
          return repo;
        }
      );
    }
  }
};
</script>

<style lang="scss" scoped>
@import "~bulma/sass/utilities/_all";

main.container {
  padding: 3em 0;

  @include mobile {
    padding: 1em 0.5em;
  }
}
</style>
