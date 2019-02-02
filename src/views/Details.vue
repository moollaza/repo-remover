<template>
  <main>
    <ApolloQuery
      v-if="$root.$data.token"
      ref="apolloQuery"
      fetch-policy="cache-and-network"
      :query="require('@/graphql/GitHubViewer.gql')"
      :context="{
        headers: {
          authorization: `Bearer ${$root.$data.token}`
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
          <b-row>
            <b-col lg="6">
              <UserBox
                :viewer="data && data.viewer"
                class=" mb-4"
              />
            </b-col>
          </b-row>

          <!-- Repos Table -->
          <ReposTable v-if="$root.$data.repos" />
        </div>

        <!-- No result -->
        <div v-else>
          No result :(
        </div>
      </template>
    </ApolloQuery>

    <!-- Deletion Alerts -->
    <DeletionAlerts v-if="$root.$data.alerts.length" />
  </main>
</template>

<script>
import UserBox from "@/components/UserBox.vue";
import ReposTable from "@/components/ReposTable.vue";
import DeletionAlerts from "@/components/DeletionAlerts.vue";

export default {
  name: "Home",
  components: {
    UserBox,
    ReposTable,
    DeletionAlerts
  },
  data() {
    return {
      apolloKey: 0
    };
  },
  mounted() {
    this.$root.$on("repos-deleted", (success, fail) => {
      this.refetchData();

    ReposTable
    });

    // Remove alert data from array when alert dismissed
    this.$root.$on("alert-dismissed", type => {
      this.$root.$data.alerts = this.$root.$data.alerts.filter(
        alert => !alert[type]
      );
    });

    this.$root.$on("reload-table", () => {
      this.refetchData();
    });

    this.$nextTick(function() {
      this.query = this.$refs.apolloQuery.getApolloQuery();
    });
  },
  methods: {
    refetchData() {
      // const query = this.$refs.apolloQuery.getApolloQuery();
      this.query.refetch();
    },

    onResult(resultObj) {
      if (!resultObj.data) {
        return;
      }

      this.$root.$data.login = resultObj.data.viewer.login;
      this.$root.$data.repos = resultObj.data.viewer.repositories.nodes.map(
        repo => {
          // Add some reactive properties needed for table selection
          this.$set(repo, "isSelected", false);
          // this.$set(repo, "isDeleted", false);
          this.$set(repo, "_rowVariant", "");
          return repo;
        }
      );
    }
  }
};
</script>
