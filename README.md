<img src="public/repo-remover-banner-white.png" alt="RepoRemover - The fastest way to archive or delete multiple GitHub repos" >

## Try it now at https://reporemover.xyz
*Don't want to use the hosted version? You can run Repo Remover locally using the instructions below.*

<p>
  <img src="https://img.shields.io/github/license/moollaza/repo-remover.svg?style=flat-square" />
  <a href="https://reporemover.xyz">
    <img src="https://img.shields.io/website/https/reporemover.xyz.svg?style=flat-square" >
  </a>
  <a title="MadeWithVueJs.com Shield" href="https://madewithvuejs.com/p/repo-remover/shield-link">
    <img src="https://madewithvuejs.com/storage/repo-shields/1511-shield.svg"/>
  </a>
</p>

## Demo
![RepoRemover Selection UI](./src/assets/img/reporemover-demo.gif)

## How it works
Repo Remover uses [Personal Access Token](https://help.github.com/en/articles/creating-a-personal-access-token-for-the-command-line) along with the GitHub API to get a list of your personal repositories, and make changes to them.

Once you've provided a Personal Access Token, you can select which of your repos to modify, set the selected repos to be either archived or deleted, and then click the button to make the changes!

Before any changes are made, you will be asked to review the list of selected repos, and confirm your decision.

**Note**: Personal Access Tokens are not stored or saved in any way. For optimal security, we suggest you create a new token each time you use Repo Remover, and delete it when you are done.

## Run Repo Remover locally

1. Fork this repository to your own GitHub account and then clone it to your computer.
2. Install dependencies
    ```
    yarn install
    ```
3. Run local server
    ```
    yarn serve
    ```
4. Visit http://localhost:8080/

## Built with
- [Vue.js](https://vuejs.org/)
- [Buefy](https://buefy.org/)
- [Vue-Apollo](https://vue-apollo.netlify.com/)
- Free hosting from [ZEIT Now](https://zeit.co/home)
- Privacy-focused analytics by [Fathom Analytics](https://usefathom.com/ref/E83PFO)
  - Want to know how many repos have been deleted? [Checkout the public analytics dashboard](https://app.usefathom.com/share/ikjnvhai/repo+remover)

## Author
Zaahir Moolla ([@zmoolla](https://twitter.com/zmoolla), [zaahir.ca](https://zaahir.ca))
