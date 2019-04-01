<template>
  <main>
    <section class="padded">
      <div class="container">
        <h1 class="title is-1">
          404 - Page Not Found
        </h1>
        <h2 class="subtitle">
          We can't seem to find the page you're looking for.
        </h2>

        <p>
          <router-link
            to="/"
            class="button is-link is-medium"
            type="submit"
          >
            <b-icon
              icon="chevron-circle-left"
              size="is-small"
            />
            <span>Go Home</span>
          </router-link>
        </p>
      </div>
    </section>
  </main>
</template>

<script>
export default {
  name: "NotFound"
};
</script>

<style scoped>
</style>
