<template>
  <section>
    <h2>Get Started</h2>

    <b-form
      class="mb-4"
      @submit="onSubmit"
    >
      <b-form-group
        id="tokenGroup"
        label="Enter Your GitHub Token"
        label-for="token"
        description="Don't have a token? Get yours <a href='https://github.coms/settings/tokens'>here</a>."
        class="w-50"
      >
        <b-form-input
          id="token"
          v-model="$root.$data.token"
          required
          placeholder="Personal Access Token"
        />
      </b-form-group>

      <b-button
        type="submit"
        variant="primary"
      >
        Submit
      </b-button>
    </b-form>

    <ApolloQuery
      v-if="apolloKey > 0"
      :query="require('@/graphql/GitHubViewer.gql')"
      :context="{
        headers: {
          authorization: `Bearer ${$root.$data.token}`
        }
      }"
    >
      <template
        slot-scope="{ result: { loading, error, data }, isLoading }"
      >
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
        </div>

        <!-- Result -->
        <div
          v-else-if="data && data.viewer"
          class="result"
        >
          <h2>Is this you?</h2>
          <UserBox
            :viewer="data && data.viewer"
            class="pt-3 w-50"
          />
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
  </section>
</template>

<script>
import UserBox from "@/components/UserBox.vue";

export default {
  components: {
    UserBox
  },
  data () {
    return {
      apolloKey: 0
    }
  },
  methods: {
    onSubmit (evt) {
        evt.preventDefault();
        this.apolloKey++;
    },
  }
};
</script>
