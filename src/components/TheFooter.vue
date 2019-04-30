<template>
  <footer class="footer">
    <div class="container">
      <div class="content">
        <div class="columns">
          <div class="column is-4">
            <h4>
              Repo Remover by
              <!-- eslint-disable vue/multiline-html-element-content-newline -->
              <a
                href="https://twitter.com/zmoolla"
              >Zaahir&nbsp;Moolla</a>.
            <!-- eslint-enable vue/multiline-html-element-content-newline -->
            </h4>
            <!-- eslint-disable vue/singleline-html-element-content-newline -->
            <p>
              Trash favicon and icon by <a href="https://icons8.com">Icons8</a>.
              <br>
              Source code licensed under <a href="https://opensource.org/licenses/mit-license.php">MIT</a>.
            </p>
            <!-- eslint-enable vue/singleline-html-element-content-newline -->
            <p>
              Copyright © 2019
            </p>
          </div>
          <div class="column is-narrow-tablet is-4-desktop">
            <h4>
              Contribute on GitHub
            </h4>
            <iframe
              src="https://ghbtns.com/github-btn.html?user=moollaza&repo=repo-remover&type=star&count=true&size=large"
              frameborder="0"
              scrolling="0"
              width="160px"
              height="30px"
              class="gh-btn-frame"
            />
            <iframe
              src="https://ghbtns.com/github-btn.html?user=moollaza&type=follow&count=true&size=large"
              frameborder="0"
              scrolling="0"
              width="220px"
              height="30px"
              class="gh-btn-frame"
            />
          </div>
          <div class="column is-narrow">
            <h4>
              Share
            </h4>

            <ul class="footer__links">
              <li>
                <a
                  class="is-flex"
                  target="_blank"
                  href="https://twitter.com/intent/tweet?url=https%3A%2F%2Freporemover.xyz&text=Repo%20Remover%3A%20Easily%20delete%20and%20archive%20multiple%20GitHub%20repos%20at%20once%20with%20Repo%20Remover!%20via%20%40zmoolla"
                >
                  <b-icon
                    icon="twitter"
                    pack="fab"
                  />
                  Twitter
                </a>
              </li>
              <li>
                <a
                  class="is-flex"
                  target="_blank"
                  href="https://www.facebook.com/sharer/sharer.php?u=http%3A//reporemover.xyz"
                >
                  <b-icon
                    icon="facebook"
                    pack="fab"
                  />
                  Facebook
                </a>
              </li>
              <li>
                <a
                  class="is-flex"
                  target="_blank"
                  href="https://reddit.com/submit?url=https://reporemover.xyz&title=Easily%20archive%20and%20delete%20multiple%20GitHub%20Repos.
"
                >
                  <b-icon
                    icon="reddit"
                    pack="fab"
                  />
                  Reddit
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
export default {};
</script>

<style lang="scss">
.footer {
  margin-top: auto;
  flex-shrink: 0;

  @include mobile {
    .column:not(:last-of-type) {
      margin-bottom: 1.5em;
    }
  }

  ul.footer__links {
    list-style: none;
    margin-left: 0;

    .icon {
      margin-right: 0.3em;
    }
  }

  .gh-btn-frame {
    display: block;
    width: 100%;
    height: 30px;

    &:not(:last-of-type) {
      margin-bottom: 1em;
    }
  }
}
</style>
