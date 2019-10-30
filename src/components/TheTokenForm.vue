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
        Cleaning up repos has never been quicker, or easier!
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
              Get a Personal Access Token from GitHub
            </h3>

            <div class="content">
              <ol>
                <li>Click the button below to visit GitHub.com in a new window.</li>
                <li>
                  Scroll to the bottom and click <b>Generate token</b>.
                </li>
                <li>Copy the generated token and paste it below.</li>
              </ol>
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
            <small>
              <span class="tag is-info">
                Note:
              </span> Tokens are not saved. For security, you should delete the token after use.
            </small>
          </div>

          <b-button
            :disabled="!(hasToken && hasValidToken)"
            size="is-medium"
            type="is-primary"
            @click="onSubmit"
          >
            Continue
          </b-button>
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

  .subtitle {
    margin-bottom: 4rem !important;
  }

  .notification {
    margin-top: 1em;
  }
}
</style>
