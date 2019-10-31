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
            <b-field
              label="Please enter your Personal Access Token"
              :message="tokenInputMessage"
              :type="tokenInputType"
            >
              <b-input
                v-model="$root.$data.token"
                required
                placeholder="Personal Access Token"
                minlength="40"
                maxlength="40"
                autocomplete="false"
                pattern="[a-zA-Z0-9]+"
                :has-counter="false"
                :loading="tokenIsLoading"
                @input.native="onTokenInput"
              >
                />
              </b-input>
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
      tokenInputType: "",
      tokenInputMessage: "",
      tokenIsLoading: false,
      hasValidToken: false,
      hasTokenError: false
    };
  },
  computed: {
    hasToken() {
      return this.$root.$data.token.length === 40;
    }
  },
  watch: {
    "$root.$data.token"(newValue) {
      if (newValue && this.hasToken) {
        this.$apollo.queries.gitHubViewer.options.context.headers.authorization = `Bearer ${this.$root.$data.token}`;
        this.$apollo.queries.gitHubViewer.start();
      }
    }
  },
  mounted() {
    this.$apollo.queries.gitHubViewer.setOptions({
      fetchPolicy: "no-cache"
    });
  },
  methods: {
    onSubmit(evt) {
      evt.preventDefault();
      this.$router.push("details");
    },
    onTokenInput(evt) {
      const target = evt.target;
      const validity = target.validity;
      target.setCustomValidity("");

      this.tokenInputType = "";
      this.tokenInputMessage = "";
      this.hasValidToken = false;
      this.$apollo.queries.gitHubViewer.stop();
      this.tokenIsLoading = false;

      if (!validity.valid) {
        if (validity.tooShort || validity.tooLong) {
          target.setCustomValidity(
            "Personal Access Token must be exactly 40 characters long"
          );
        }

        if (validity.patternMismatch) {
          target.setCustomValidity(
            "Personal Access Token should only include letters and numbers."
          );
        }
      } else {
        if (this.hasToken) this.tokenIsLoading = true;
      }
    }
  },
  apollo: {
    gitHubViewer() {
      return {
        context: {
          headers: {
            "User-Agent": "Repo Remover"
          }
        },
        query: require("@/graphql/GitHubViewer.gql"),
        update: data => data.viewer,
        result({ data, loading, networkStatus }) {
          if (data && data.viewer && data.viewer.login) {
            this.hasValidToken = true;
            this.tokenInputType = "is-success";
            this.tokenIsLoading = false;
            this.$root.$data.login = data.viewer.login;
            this.tokenInputMessage = "Success! This token is valid";
          }
        },
        // Error handling
        error(error) {
          this.hasTokenError = true;
          this.tokenInputType = "is-danger";
          this.tokenInputMessage =
            "Error: This token appears to be invalid. Please verify token is correct";
        },
        skip() {
          return true;
        }
      };
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
