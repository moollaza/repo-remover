<template>
  <section class="section get-started">
    <div class="container">
      <p
        id="get-started"
        class="title is-1"
      >
        Get Started
      </p>
      <p class="subtitle is-3">
        Cleaning up repos has never been easier!
      </p>

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
                Click the button below to generate your token on GitHub.com. Only the <code>repo</code> and <code>delete_repo</code> scopes are required. Once your token has been generated, copy and paste it below.
                When you're finished with Repo Remover, you can delete the token.
              </p>
            </div>

            <a
              href="https://github.com/settings/tokens/new?scopes=delete_repo,repo&amp;description=Repo%20Remover%20Token"
              class="button is-link is-outlined"
              target="_blank"
            >
              <b-icon
                icon="chevron-right"
                size="is-small"
              />
              <span>
                Get my token
              </span>
            </a>
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
            class="button is-primary is-medium"
            type="submit"
            variant="primary"
            :disabled="!hasToken"
            @click="onSubmit"
          >
            <b-icon
              icon="check"
              size="is-small"
            />
            <span>Next Step</span>
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
  padding: 4em 1em;

  h3.title {
    align-items: center;
  }

  .notification {
    margin-top: 1em;
  }
}
</style>
