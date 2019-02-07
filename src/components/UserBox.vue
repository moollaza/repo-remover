<template>
  <b-media>
    <b-img
      slot="aside"
      :src="viewer.avatarUrl"
      width="120"
      height="120"
      alt="avatar"
      class="rounded avatar"
    />
    <h5 class="m-0">
      <a
        class="text-body"
        :href="`https://github.com/${viewer.login}`"
      >
        {{ title }}
      </a>
    </h5>
    <template v-if="viewer.name">
      <small class="text-secondary m-0">
        @{{ viewer.login }}
      </small>
    </template>
    <p
      class="mt-2 mb-0"
      v-html="viewer.bioHTML"
    />
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
