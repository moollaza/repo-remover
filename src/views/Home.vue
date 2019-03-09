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
        </div>
      </div>
    </section>

    <TokenForm />
  </main>
</template>

<script>
import TokenForm from "@/components/TokenForm.vue";

export default {
  name: "Home",
  components: {
    TokenForm
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
