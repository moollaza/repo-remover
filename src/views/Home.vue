<template>
  <main>
    <!-- Hero -->
    <section class="hero is-medium is-light">
      <div class="hero-body">
        <div class="container">
          <h1 class="title">
            Repo Remover
          </h1>
          <h2 class="subtitle is-4">
            Easily archive and delete your GitHub Repos.
          </h2>

          <div class="buttons">
            <router-link
              to="/about"
              class="button is-link is-medium is-rounded"
            >
              Learn More
            </router-link>
            <a
              href="https://github.com/moollaza/repo-remover"
              class="button is-dark is-medium is-outlined is-rounded"
            >
              <b-icon
                pack="fab"
                icon="github"
              />
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </div>
    </section>

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
.hero {
  margin-bottom: 3em;

  .title {
    font-size: 4em;
  }
}
</style>
