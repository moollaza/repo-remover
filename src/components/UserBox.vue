<template>
  <b-media>
    <b-img
      slot="aside"
      :src="viewer.avatarUrl"
      width="120"
      alt="avatar"
      class="rounded"
    />
    <h5 class="mt-0 mb-1">
      {{ viewer.name }}
      &nbsp;
      <small>@{{ viewer.login }}</small>
    </h5>
    <span v-html="viewer.bioHTML" />
  </b-media>
</template>

<script>
export default {
  props: {
    viewer: {
      type: Object,
      default() {
        return {};
      }
    }
  }
};
</script>
