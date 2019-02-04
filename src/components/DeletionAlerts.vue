<template>
  <b-alert
    dismissible
    fade
    :show="dismissCountDown"
    :variant="variant"
    @dismissed="onDismissed"
    @dismiss-count-down="countDownChanged"
  >
    <template v-if="isSuccess">
      <h4 class="alert-heading">
        Success!
      </h4>
      <p>{{ alerts.length | pluralize("repos were", "repo was") }} successfully deleted.</p>
    </template>
    <template v-else>
      <h4 class="alert-heading">
        Error
      </h4>
      <p>{{ alerts.length | pluralize("repos were", "repo was") }} unable to be deleted.</p>
      <ul
        v-for="alert in alerts"
        :key="alert.repo.name"
        class="unstyled"
      >
        <li>
          <h5>
            {{ alert.repo.name }}
          </h5>
          <p>
            Error Message {{ alert.error.message }}
          </p>
        </li>
      </ul>
    </template>
  </b-alert>
</template>

<script>
import { selectedRepos } from "@/mixins.js";

export default {
  filters: {
    pluralize: function(value, plural, single) {
      return `${value} ${value === 1 ? single : plural}`;
    }
  },
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
      variant: this.type === "success" ? "success" : "danger",
      isSuccess: this.type === "success",
      dismissCountDown: 10,
      isDismissed: false
    };
  },
  methods: {
    // Runs each second during countdown
    countDownChanged(dismissCountDown) {
      this.dismissCountDown = dismissCountDown;
      if (dismissCountDown === 0) this.emitDismissed();
    },
    // When user clicks dismiss button
    onDismissed() {
      this.dismissCountDown = 0;
      this.emitDismissed();
    },
    emitDismissed() {
      console.log("ALERT DISMISSED");
      this.$root.$emit("alert-dismissed", this.type);
    }
  }
};
</script>
