<template>
  <b-alert
    dismissible
    fade
    :show="dismissCountDown"
    :variant="variant"
    @dismissed="dismissCountDown=0"
    @dismiss-count-down="countDownChanged"
  >
    <template v-if="isSuccess">
      <h4 class="alert-heading">
        Success!
      </h4>
      <p>{{ alerts.length }} repos were successfully deleted.</p>
    </template>
    <template v-else>
      <h4 class="alert-heading">
        Error
      </h4>
      <p>{{ alert.count }} repos were unable to be deleted.</p>
      <ul
        v-for="repo in alerts"
        :key="repo.name"
        class="unstyled"
      >
        <li>
          {{ repo.name }}
        </li>
      </ul>
    </template>
  </b-alert>
</template>

<script>
import { selectedRepos } from "@/mixins.js";

export default {
  mixins: [selectedRepos],
  props: {
    type: {
      type: String,
      default: ""
    },
    alerts: {
      type: Array,
      default() {
        return [];
      }
    }
  },
  data() {
    return {
      variant: this.type === "success" ? "success" : "warning",
      isSuccess: this.type === "success",
      dismissCountDown: 10
    };
  },
  methods: {
    countDownChanged(dismissCountDown) {
      this.dismissCountDown = dismissCountDown;
    }
  }
};
</script>
