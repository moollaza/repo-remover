<template>
  <section>
    <h2>Get Started</h2>

    <b-form
      class="mb-4"
      @submit="onSubmit"
    >
      <b-form-group
        id="tokenGroup"
        label="Enter Your GitHub Token"
        label-for="token"
        description="Don't have a token? Get yours <a href='https://github.com/settings/tokens'>here</a>."
        class="w-50"
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
  data () {
    return {
      apolloKey: 0
    }
  },
  methods: {
    onSubmit (evt) {
        evt.preventDefault();
        this.$router.push('details');
    },
  }
};
</script>
