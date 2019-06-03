<template>
  <a
    href="https://betapage.co/product/repo-remover"
    class="callout has-text-white"
  >
    <div class="container">
      <div class="level is-mobile">
        <!-- Left side -->
        <div class="level-left">
          <div class="level-item">
            <p>
              <b>
                We're featured on BetaPage!
              </b>
            </p>
          </div>
          <div class="level-item is-hidden-mobile">
            <p>
              If you like RepoRemover, give us a vote and help spread the word!
            </p>
          </div>
        </div>

        <!-- Right side -->
        <div class="level-right">
          <p class="level-item">
            <strong>View</strong>
          </p>
        </div>
      </div>
    </div>
  </a>
</template>

<script>
export default {
  data() {
    return {
      isMenuActive: false,
      showGenerateButton: process.env.NODE_ENV === "development"
    };
  }
};
</script>

<style lang="scss" scoped>
.callout {
  background-color: $primary;
  color: white;
  padding: 1em 0.25em;
  margin-bottom: 0 !important;
}
</style>
