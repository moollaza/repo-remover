<template>
  <main>
    <!-- Hero -->
    <div class="hero is-light">
      <div class="hero-body">
        <h1 class="title is-2">Repo Remover</h1>
        <h2 class="subtitle is-4">Easily remove unused repos from your GitHub</h2>
      </div>
    </div>
    <DetailsForm/>
  </main>
</template>

<script>
// @ is an alias to /src
import DetailsForm from "@/components/DetailsForm.vue";

export default {
  name: "Home",
  components: {
    DetailsForm
  },
  data() {
    return {
      username: "",
      token: ""
    };
  },
  methods: {
    showRepos() {}
  }
};
</script>

<style>
</style>
