<template>
  <section class="section get-started">
    <div class="container">
      <h1 class="title is-size-2">
        Get Started
      </h1>

      <div class="columns">
        <div class="column is-half">
          <div class="step">
            <h3 class="step__title">
              <div class="step__num">
                <div class="step__num__content">
                  1
                </div>
              </div>
              Get a Personal Access Token
            </h3>

            <div class="content">
              <p>
                <!-- eslint-disable -->
                You can create your token <a href="https://github.com/settings/tokens" target="_none" >on GitHub</a>.
                <!-- eslint-enable -->
                You only need to select the <code>repo</code> and <code>delete_repo</code> scopes. Once your token has been generated, copy and paste it below.
              </p>
            </div>

            <button
              class="button"
              @click="isShowingTokenDemo = true"
            >
              {{ isShowingTokenDemo ? "Hide" : "Show me how!" }}
            </button>

            <b-modal :active.sync="isShowingTokenDemo">
              <p class="image">
                <img src="/get-personal-access-token.gif">
              </p>
            </b-modal>
          </div>

          <div class="step">
            <h3 class="step__title">
              <div class="step__num">
                <div class="step__num__content">
                  2
                </div>
              </div>
              Select repositories to modify
            </h3>
            <b-field label="Please enter your Personal Access Token">
              <b-input
                v-model="$root.$data.token"
                placeholder="Personal Access Token"
                required
              />
            </b-field>
          </div>

          <button
            class="button is-primary is-large"
            type="submit"
            variant="primary"
            :disabled="!hasToken"
            @click="onSubmit"
          >
            Next Step
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  data() {
    return {
      isShowingTokenDemo: false
    };
  },
  computed: {
    hasToken() {
      return this.$root.$data.token.length > 0;
    }
  },
  methods: {
    onSubmit(evt) {
      evt.preventDefault();
      this.$router.push("details");
    }
  }
};
</script>

<style lang="scss">
.get-started {
  h3.title {
    align-items: center;
  }

  .notification {
    margin-top: 1em;
  }
}
</style>
