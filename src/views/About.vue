<template>
  <main class="page-about">
    <section class="padded">
      <div class="container">
        <h1 class="title is-size-1">
          About
        </h1>

        <div class="content">
          <p class="lead">
            Repo Remover makes it easy to archive and delete multiple GitHub Repos with a single click.
          </p>

          <p>
            <!-- eslint-disable vue/singleline-html-element-content-newline -->
            In order to use Repo Remover, a <a href="https://help.github.com/en/articles/creating-a-personal-access-token-for-the-command-line">
              Personal Access Token
            </a> is required. The token is used with the GitHub API to get a list of your personal repositories, and make changes to them.
            <!-- eslint-enable vue/singleline-html-element-content-newline -->
          </p>

          <p>
            Once you've provided a Personal Access Token, you can select which of your repos to modify, set the selected repos to be either <span class="tag is-warning">
              archived
            </span> or <span class="tag is-danger">
              deleted
            </span>, and then click the button to make the changes!
          </p>

          <p>Before any changes are made, you will be asked to review the list of selected repos.</p>
        </div>

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
              (and <a href="https://bulma.io/">
                Bulma
              </a>)
            </li>
            <li>
              <a href="https://icons8.com/">
                Icons8
              </a>
            </li>
          </ul>
        </div>
        <div class="content">
          <p>
            Repo Remover is hosted on
            <a href="https://now.sh/">
              ZEIT Now
            </a>.
          </p>
        </div>

        <hr>

        <div class="content">
          <h2>Disclaimer</h2>
          <p>Repo Remover is provided as is, and we make no promises or guarantees about this service.</p>

          <h3>
            Use at your own risk:
          </h3>
          <p>
            Changes made with Repo Remover are permanent and cannot be reversed.

            Any repos you <span class="tag is-warning">
              archive
              <!-- eslint-disable-next-line vue/singleline-html-element-content-newline -->
            </span> can be manually un-archived on <a href="https://github.com">GitHub</a>.

            However, any repos you <span class="tag is-danger">
              delete
            </span> <b> cannot be un-deleted</b>. Please be careful and make sure you understand what you are doing.
          </p>
          <p class="is-underlined">
            Repo Remover is not liable for any damages or losses arising from your use or inability to use the service.
          </p>
        </div>

        <router-link
          to="/"
          class="button is-success is-medium"
          type="submit"
        >
          <b-icon
            icon="chevron-circle-left"
            size="is-small"
          />
          <span>Go Back</span>
        </router-link>
      </div>
    </section>
  </main>
</template>

<script>
export default {
  metaInfo: {
    title: "About Repo Remover | Cleanup your GitHub repos with ease.",
    meta: [
      {
        property: "og:title",
        content: "About Repo Remover | Cleanup your GitHub repos with ease."
      }
    ]
  }
};
</script>

<style lang="scss">
.page-about {
  .content {
    p,
    ul {
      font-size: 1.2rem;
    }

    .tag {
      vertical-align: middle;
    }
  }
}
</style>
