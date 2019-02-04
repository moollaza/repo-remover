<template>
  <main>
    <!-- Success Alerts -->
    <DeletionAlerts
      v-if="hasSuccessAlerts"
      :alerts="alerts.success"
      type="success"
    />
    <!-- Fail Alerts -->
    <DeletionAlerts
      v-if="hasFailAlerts"
      :alerts="alerts.fail"
      type="fail"
    />

    <!-- Apollo Query -->
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
  </main>
</template>

<script>
import UserBox from "@/components/UserBox.vue";
import ReposTable from "@/components/ReposTable.vue";
import DeletionAlerts from "@/components/DeletionAlerts.vue";

export default {
  name: "Details",
  components: {
    UserBox,
    ReposTable,
    DeletionAlerts
  },
  data() {
    return {
      alerts: {
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
    this.$root.$on("repos-deleted", async results => {
      results.forEach(res => {
        const type = res.isFulfilled ? "success" : "fail";
        if (type === "success") {
          this.alerts[type].push(res.value);
        } else {
          this.alerts[type].push(res.reason);
        }
        console.log("ALERTS: ", this.alerts);
      });
      await this.refetchData();
    });

    // Remove alert data from array when alert dismissed
    this.$root.$on("alert-dismissed", type => {
      this.alerts[type] = [];
    });

    this.$root.$on("reload-table", () => {
      this.refetchData();
    });

    this.$nextTick(function() {
      this.query = this.$refs.apolloQuery.getApolloQuery();
    });
  },
  methods: {
    async refetchData() {
      return this.query.refetch();
    },

    onResult(resultObj) {
      // Seems this can prematurely fire with an empty data object
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
