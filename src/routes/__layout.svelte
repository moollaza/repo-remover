<script>
  import { page, navigating } from "$app/stores";
  import Nav from "$lib/Nav.svelte";
  import "../app.css";

  $: section = $page.path.split("/")[1];
</script>

<Nav {section} />

<main>
  <div class="container">
    <slot />
  </div>
</main>

<style lang="postcss">
</style>
