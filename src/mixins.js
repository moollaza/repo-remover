export const selectedRepos = {
  computed: {
    numberOfSelectedRepos() {
      const selected = this.$root.$data.repos.filter(function (repo) {
        return repo.isSelected;
      });

      return selected.length;
    }
  },
  methods: {
    getSelectedRepos() {
      return this.$root.$data.repos.filter(function (repo) {
        return repo.isSelected;
      });
    },
    hasSelectedRepos() {
      const repos = this.getSelectedRepos();
      return repos.length > 0;
    },
    numSelectedRepos() {
      if (!this.hasSelectedRepos()) return 0;
      const selectedRepos = this.getSelectedRepos();
      return selectedRepos.length;
    }
  }
}
