<template>
  <div
    id="app"
    class="is-flex"
  >
    <!-- <TheFeaturedCallout /> -->

    <TheNavBar v-if="$route.name !== 'home'" />

    <RouterView />

    <TheFooter />
  </div>
</template>

<script>
import TheFeaturedCallout from "@/components/TheFeaturedCallout.vue";
import TheNavBar from "@/components/TheNavBar.vue";
import TheFooter from "@/components/TheFooter.vue";
export default {
  metaInfo: {
    title: "Repo Remover | Cleanup your GitHub repos with ease.",
    meta: [
      {
        property: "og:title",
        content: "Repo Remover | Cleanup your GitHub repos with ease."
      },
      {
        name: "description",
        content:
          "Repo Remover makes it easy to archive and delete multiple GitHub repos at the same time. Free to use, and 100% open source."
      },
      {
        poperty: "og:image",
        content: "https://reporemover.xyz/repo-remover-landing.png"
      },
      {
        poperty: "og:url",
        content: "https://reporemover.xyz"
      },
      {
        poperty: "og:site_name",
        content: "Repo Remove"
      },
      {
        poperty: "og:type",
        content: "Website"
      }
    ]
  },
  components: {
    TheFeaturedCallout,
    TheNavBar,
    TheFooter
  }
};
</script>

<style lang="scss">
html {
  font-size: 0.9rem;
  overflow: auto;
}

#app {
  min-height: 100vh;
  flex-direction: column;
}
</style>
