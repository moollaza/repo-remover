<template>
  <article class="media">
    <figure class="media-left">
      <p class="image is-48x48">
        <img
          :src="viewer.avatarUrl"
          alt="avatar"
          class="is-rounded"
        >
      </p>
    </figure>

    <div class="media-content">
      <div class="content">
        <p>
          <a
            class="text-body"
            :href="`https://github.com/${viewer.login}`"
          >
            <strong>{{ title }}</strong>
          </a>
          <template v-if="viewer.name">
            <small class="text-secondary m-0">
              &#32;@{{ viewer.login }}
            </small>
          </template>
          <br>
          <span v-html="viewer.bioHTML" />
        </p>
      </div>
    </div>
  </article>
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
