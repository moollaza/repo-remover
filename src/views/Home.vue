<template>
  <main class="home">
    <!-- Hero -->
    <section class="hero is-light">
      <div class="hero-body">
        <div class="container">
          <div class="columns is-vcentered">
            <div class="column is-7">
              <h1 class="title is-size-1-touch">
                Repo Remover
              </h1>
              <h2 class="subtitle is-size-4-touch is-3">
                <!-- eslint-disable vue/singleline-html-element-content-newline -->
                The <b>fastest</b> way to <span class="underline underline--yellow">archive</span>
                or <span class="underline underline--red">delete</span> multiple GitHub repos.
                <!-- eslint-enable vue/singleline-html-element-content-newline -->
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

    <section class="has-background-hhite">
      <div class="container">
        <div class="columns is-vcentered">
          <div class="column is-half">
            <img
              src="@/assets/img/excited-kids.jpg"
              alt="Excited kids points at computer screen"
            >
            <small>
              <p>
                Image by <a href="https://pixabay.com/users/StartupStockPhotos-690514/">
                  StartupStockPhotos
                </a>
              </p>
            </small>
          </div>
          <div class="column is-half">
            <h2 class="title is-3">
              They just used RepoRemover.
            </h2>
            <br>
            <h2 class="title is-2">
              Try it out and this could be <b>you!</b>
            </h2>
            <button
              v-scroll-to="'#get-started'"
              class="button is-success  is-medium is-rounded"
            >
              Yes! I want to feel this good!
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Promo Section w/ Video -->
    <section class="promo has-background-link">
      <div class="container">
        <p class="title is-1 has-text-white">
          See It In Action!
        </p>
        <p class="subtitle is-3 has-text-white">
          Have unmaintained or forgotten repos lying around?
          <br>
          RepoRemover can help you find them, quickly.
        </p>
        <div class="columns is-vcentered is-marginless is-paddingless">
          <div class="column is-marginless is-paddingless is-three-fifths">
            <video
              class="is-block demo-video"
              controls="controls"
              src="@/assets/video/reporemover-demo.mp4"
            />
          </div>
          <div class="features column">
            <p class="feature">
              <i class="fas fa-filter" />
              Filter
            </p>
            <p class="feature">
              <i class="fas fa-search" />
              Search
            </p>
            <p class="feature">
              <i class="fas fa-sort-alpha-down" />
              Sort
            </p>
            <p class="feature">
              <i class="fas fa-check-square" />
              Select
            </p>
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

  .subtitle {
    b {
      font-weight: 600;
    }
  }

  .underline {
    border-bottom: 3px solid;

    &--red {
      border-color: $danger;
    }

    &--yellow {
      border-color: $warning;
    }
  }

  .button.is-text {
    text-decoration: none;
  }

  &__img {
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

  .features {
    padding: 3em;
    min-width: 310px;
    margin: auto;

    .feature {
      @extend .title;
      display: flex;
      align-items: center;
      margin-bottom: 3rem !important;
      font-size: 2.8rem;
      color: white;

      &:last-of-type {
        margin-bottom: 0 !important;
      }
    }

    .fas {
      font-size: 2rem;
      margin-right: 0.5em;
      text-align: center;
    }

    @include mobile {
      display: flex;
      flex-wrap: wrap;
      padding: 3em 0 0;
      text-align: center;
      justify-content: space-evenly;

      .feature {
        margin-bottom: 0 !important;
        padding: 0.5em;
        text-align: center;
        flex-direction: column;
      }

      .fas {
        margin-right: 0;
        margin-bottom: 0.3em;
      }
    }

    @media screen and (max-width: 400px) {
      .feature {
        width: 100%;
      }
    }
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
