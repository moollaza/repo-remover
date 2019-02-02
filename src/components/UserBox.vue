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
      <a
        class="text-body"
        :href="`https://github.com/${viewer.login}`"
      >
        {{ title }}
      </a>
    </h5>
    <template v-if="viewer.name">
      <p class="text-secondary">
        @{{ viewer.login }}
      </p>
    </template>
    <p v-html="viewer.bioHTML" />
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
  },
  computed: {
    title() {
      return this.viewer.name || `@${this.viewer.login}`;
    }
  }
};
</script>
