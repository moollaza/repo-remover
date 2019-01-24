export function getSelectedRepos() {
  return this.$root.$data.repos.filter(function (repo) {
    return repo.selected;
  });
}

export function hasSelectedRepos() {
  return !!this.getSelectedRepos();
}
