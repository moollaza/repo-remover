<template>
  <main>
    <!-- Hero -->
    <b-jumbotron
      header="Repo Remover"
      lead="Easily remove unused repos from your GitHub"
    />
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
