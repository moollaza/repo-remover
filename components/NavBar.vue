<template>
  <b-navbar
    toggleable="md"
    type="light"
    variant="light"
  >
    <div class="container">
      <b-navbar-toggle target="nav_collapse" />

      <b-navbar-brand href="/">
        Repo Remover
      </b-navbar-brand>

      <b-collapse
        id="nav_collapse"
        is-nav
      >
        <b-navbar-nav>
          <b-nav-item href="/">
            Home
          </b-nav-item>
          <b-nav-item href="/about">
            About
          </b-nav-item>
        </b-navbar-nav>
      </b-collapse>
    </div>
  </b-navbar>
</template>

<script>
export default {}
</script>

<style scoped>
</style>
