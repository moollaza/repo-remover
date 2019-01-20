<template>
  <main>
    <ApolloQuery
      v-if="$root.$data.token"
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
          class="spinner-border text-primary"
          role="status"
        >
          <span class="sr-only">
            Loading...
          </span>
        </div>

        <!-- Error -->
        <div
          v-else-if="error"
          class="error"
        >
          An error occured
          <router-link to="/home">
            Go Back
          </router-link>
        </div>

        <!-- Result -->
        <div
          v-else-if="data && data.viewer"
          class="result"
        >
          <UserBox
            :viewer="data && data.viewer"
            class="w-50 mb-4"
          />

          <ReposTable v-if="$root.$data.repos" />
        </div>

        <!-- No result -->
        <div
          v-else
          class="no-result"
        >
          No result :(
        </div>
      </template>
    </ApolloQuery>
  </main>
</template>

<script>
import UserBox from "@/components/UserBox.vue";
import ReposTable from "@/components/ReposTable.vue";

export default {
  name: "Home",
  components: {
    UserBox,
    ReposTable
  },
  methods: {
    onResult(resultObj) {
      console.log(resultObj);
      this.$root.$data.repos = resultObj.data.viewer.repositories.nodes;
    }
  },
};
</script>
