<template>
  <main>
    <!-- Hero -->
    <b-jumbotron
      header="Repo Remover"
      lead="Easily remove unused repos from your GitHub"
    />
    <DetailsForm />
  </main>
</template>

<script>

import DetailsForm from "@/components/DetailsForm.vue";

export default {
  name: "Home",
  components: {
    DetailsForm
  }
};
</script>
