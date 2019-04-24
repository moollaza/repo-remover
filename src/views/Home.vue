<template>
  <main class="home">
    <!-- Hero -->
    <section class="hero is-light">
      <div class="hero-body">
        <div class="container">
          <div class="columns is-vcentered">
            <div class="column is-narrow">
              <h1 class="title is-size-1-touch">
                Repo Remover
              </h1>
              <h2 class="subtitle is-size-4-touch is-3">
                Easily archive and delete multiple GitHub repos.
              </h2>

              <div class="buttons">
                <button
                  v-scroll-to="'#get-started'"
                  class="button is-primary  is-medium is-rounded"
                >
                  Get Started
                </button>
                <router-link
                  to="/about"
                  class="button is-text has-text-link	is-medium is-rounded"
                >
                  Learn More
                </router-link>
              </div>
            </div>
            <div class="column is-hidden-mobile">
              <div class="is-block has-text-centered">
                <img
                  src="@/assets/img/icons8-trash-cloud.svg"
                  alt="Trash can up in the clouds"
                  class="hero__img is-inline-block"
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Promo Section w/ Video -->
    <section class="promo has-background-info">
      <div class="container">
        <p class="title is-1 has-text-white">
          See It In Action!
        </p>
        <p class="subtitle is-3 has-text-white">
          RepoRemover has many features to help you navigate your repos.
        </p>
        <div class="columns is-vcentered is-marginless is-paddingless">
          <div class="features column is-4">
            <p class="feature">
              Filter
            </p>
            <p class="feature">
              Search
            </p>
            <p class="feature">
              Sort
            </p>
            <p class="feature">
              Select
            </p>
          </div>
          <div class="column is-marginless is-paddingless">
            <video
              controls="controls"
              autobuffer=""
              src="/media/reporemover-demo.16859102.mp4"
              style="display: block;margin: 0;padding: 0;"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- Token Form -->
    <TheTokenForm />
  </main>
</template>

<script>
import TheTokenForm from "@/components/TheTokenForm.vue";

export default {
  name: "Home",
  components: {
    TheTokenForm
  }
};
</script>

<style lang="scss">
.home section:not(.hero) {
  padding: 6em 1em;

  .subtitle {
    margin-bottom: 4rem !important;
  }
}

.hero {
  .title {
    font-weight: bold;
    font-size: 5em;
  }

  .button.is-text {
    text-decoration: none;
  }

  &__img {
    @include mobile {
    }
    @include tablet {
      max-width: 200px;
    }
    @include desktop {
      max-width: 300px;
    }
    @include widescreen {
      max-width: 400px;
    }
  }
}

.promo {
  color: white;

  .subtitle {
    margin-bottom: 2em;
  }

  .columns {
    border: 1px solid #e1e1e194;
  }

  .features {
    padding: 3em;
  }

  .feature {
    @extend .title;
    font-size: 3em;
    color: white;
  }
}

.step {
  margin-bottom: 3em;

  &__title {
    @extend .title;
    @extend .is-flex;
    @extend .is-size-5;
    align-items: center;
  }

  &__num {
    @extend .is-flex;
    box-sizing: content-box;
    margin-right: 0.5em;
    color: $white;
    background-color: $primary;
    border-radius: 100%;
    text-align: center;

    &__content {
      padding: 0.6em;
      height: 0.8em;
      width: 0.8em;
      line-height: 0.8em;
      font-size: 0.8em;
    }
  }
}
</style>
