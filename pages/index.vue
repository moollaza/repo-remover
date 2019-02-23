<template>
  <main>
    <!-- Hero -->
    <b-jumbotron
      header="Repo Remover"
      lead="Easily archive and delete your GitHub Repos."
    />
    <TokenForm />
  </main>
</template>

<script>
import TokenForm from '@/components/TokenForm.vue';

export default {
  name: 'Home',
  components: {
    TokenForm
  }
};
</script>
