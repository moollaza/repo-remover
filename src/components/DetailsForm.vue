<template>
  <section class="section">
    <h2 class="title is-3">Get Started</h2>
    <div class="columns">
      <!-- Username -->
      <div class="column">
        <div class="field">
          <label class="label">Enter Your GitHub Username</label>
          <div class="control">
            <input v-model="username" class="input" type="text" placeholder="username">
          </div>
        </div>
      </div>

      <!-- Token -->
      <div class="column">
        <div class="field">
          <label class="label">Enter Your GitHub Token</label>
          <div class="control">
            <input v-model="token" class="input" type="text" placeholder="token">
          </div>
          <p class="help">
            Don't have a token? You can get one
            <a href="#" class="is-text">here</a>
          </p>
        </div>
      </div>
    </div>
    <!-- Submit -->
    <div class="field">
      <button class="button is-pulled-right is-link" @click="router.push('repos')">Submit</button>
    </div>
  </section>
</template>

<script>
export default {
  username: "",
  token: ""
};
</script>

<style scoped>
</style>
