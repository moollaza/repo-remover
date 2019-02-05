<template>
  <section class="col col-lg-6">
    <h2>Get Started</h2>

    <b-form
      class="mb-4"
      @submit="onSubmit"
    >
      <b-form-group
        id="tokenGroup"
        label="Enter Your GitHub Token"
        label-for="token"
        description="Get your token <a href='https://github.com/settings/tokens'>here</a>. Only <code>repo</code> and <code>delete_repo</code> scopes are required."
      >
        <b-form-input
          id="token"
          v-model="$root.$data.token"
          required
          placeholder="Personal Access Token"
        />
      </b-form-group>

      <b-button
        type="submit"
        variant="primary"
      >
        Submit
      </b-button>
    </b-form>
  </section>
</template>

<script>
import UserBox from "@/components/UserBox.vue";

export default {
  components: {
    UserBox
  },
  data() {
    return {
      apolloKey: 0
    };
  },
  methods: {
    onSubmit(evt) {
      evt.preventDefault();
      this.$router.push("details");
    }
  }
};
</script>
