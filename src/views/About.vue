<template>
  <main>
    <section>
      <div class="container">
        <h1 class="title is-size-1">
          About
        </h1>

        <p class="is-size-4">
          Repo Remover makes it easy to archive and delete multiple GitHub Repos at once.
          We use the GitHub API to ensure your changes are made safely and securely.
        </p>

        <div class="content">
          <h3>
            Repo Remover was made with:
          </h3>
          <ul class="text-dark">
            <li>
              <a href="https://vuejs.org/">
                Vue.js
              </a>
            </li>
            <li>
              <a href="https://vue-apollo.netlify.com/">
                Vue Apollo
              </a>
            </li>
            <li>
              <a href="https://octokit.github.io/rest.js/">
                Octokit Rest
              </a>
            </li>
            <li>
              <a href="https://buefy.org/">
                Buefy
              </a>
            </li>
          </ul>
        </div>
      </div>
    </section>
  </main>
</template>

<style lang="scss" scoped>
section {
  padding: 3rem 1.5rem;
}

.content {
  margin-top: 2em;

  ul {
    font-size: 1.5em;
  }
}
</style>
