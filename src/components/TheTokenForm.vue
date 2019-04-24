<template>
  <section class="section get-started">
    <div class="container">
      <p
        id="get-started"
        class="title is-size-2"
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
                You can create your token on GitHub. You only need to select the <code>repo</code> and <code>delete_repo</code> scopes. Once your token has been generated, copy and paste it below.
              </p>
            </div>

            <div class="buttons">
              <button
                class="button"
                @click="isShowingTokenDemo = true"
              >
                <b-icon
                  icon="info"
                  size="is-small"
                />
                <span>
                  Show me how
                </span>
              </button>

              <a
                href="https://github.com/settings/tokens"
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
          </div>

          <!-- How To Get a Personal Access Token Modal-->
          <b-modal :active.sync="isShowingTokenDemo">
            <p class="image">
              <img src="@/assets/img/get-personal-access-token.gif">
            </p>
          </b-modal>

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
