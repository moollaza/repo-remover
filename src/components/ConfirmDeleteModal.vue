<template>
  <!-- Modal Component -->
  <b-modal
    id="confirmDelete"
    title="Confirm Deletion"
    ok-variant="danger"
    :ok-title="`Delete Repos`"
    centered
  >
    <p class="my-4">
      Are you sure you want to delete the following {{ numSelectedRepos() }} repos?
    </p>

    <ul class="list-unstyled">
      <li
        v-for="repo in getSelectedRepos()"
        :key="repo.id"
      >
        {{ repo.name }}
      </li>
    </ul>
  </b-modal>
</template>

<script>
import { selectedRepos } from "@/mixins.js";

export default {
  mixins: [selectedRepos]
};
</script>
