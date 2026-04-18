---
title: "Archive vs Delete GitHub Repos: Which Should You Choose?"
description: "Should you archive or delete old GitHub repositories? A complete comparison of both approaches with a decision framework to help you choose."
slug: "archive-vs-delete-github-repos"
canonical: "https://reporemover.xyz/guides/archive-vs-delete-github-repos/"
date: "2026-04-12"
lastmod: "2026-04-17"
---

Deciding whether to archive or delete a GitHub repository? **Archive if you might need it later. Delete if you're certain it's worthless.** This guide breaks down the differences, trade-offs, and when to use each approach.

## Archive vs Delete: Quick Comparison

|                           | Archive                             | Delete                                                   |
| ------------------------- | ----------------------------------- | -------------------------------------------------------- |
| **Reversible?**           | Yes — unarchive anytime             | Limited — 90-day self-serve restore window, with caveats |
| **Code preserved?**       | Yes — full history                  | Restorable within 90 days; gone after that               |
| **Visible on profile?**   | Yes, marked as "archived"           | No — completely removed                                  |
| **Forks affected?**       | No                                  | No (forks are independent)                               |
| **Issues/PRs preserved?** | Yes, read-only                      | Restorable within 90 days, but issue labels are lost     |
| **Counts toward limits?** | Yes (storage)                       | No                                                       |
| **Best for**              | Old projects, references, portfolio | Test repos, duplicates, mistakes                         |

## When to Archive

Archive a repository when:

- **You might reference the code later** — even if you're "done" with a project, the code may be useful as a reference.
- **It's part of your portfolio** — archived repos remain visible on your profile and show your work history.
- **Others depend on it** — if people have forked or starred your repo, archiving keeps the code accessible while signaling it's no longer maintained.
- **It contains documentation** — READMEs, wikis, and issues often contain valuable context that's hard to recreate.
- **You're unsure** — when in doubt, archive. GitHub does let you restore a deleted repo within 90 days, but the window is short, team permissions aren't restored, and issue labels are lost.

### What Archiving Does

When you archive a GitHub repository:

1. The repository becomes **read-only** — no pushes, pull requests, issues, or comments
2. It's marked with an "Archived" banner on GitHub
3. It still appears in search results and on your profile
4. All existing data (code, issues, PRs, wiki) is preserved
5. You can **unarchive** it at any time to restore full functionality

### How to Archive in Bulk

GitHub doesn't offer a built-in way to archive multiple repositories at once. Your options:

- **[Repo Remover](https://reporemover.xyz)** — Select multiple repos and click "Archive Selected." Fastest approach with a visual interface.
- **GitHub CLI** — `gh repo archive owner/repo-name` (one at a time, scriptable in a loop)
- **GitHub API** — `PATCH /repos/{owner}/{repo}` with `{"archived": true}`

## When to Delete

Delete a repository when:

- **It was a test or experiment** — repos created to try a framework, test a CI pipeline, or follow a tutorial.
- **It's a duplicate** — you accidentally created two repos for the same project.
- **It contains sensitive data** — if you accidentally committed secrets, API keys, or credentials. (Note: also rotate those credentials.)
- **It has zero value** — empty repos, repos with a single "initial commit," or auto-generated repos you never used.
- **It's cluttering your profile** — if you have 200+ repos and can't find anything, deleting the noise helps.

### What Deletion Does

When you delete a GitHub repository:

1. The repository is **removed from your profile** — code, issues, PRs, wiki, releases
2. You have a **90-day self-serve restore window** — go to [github.com/settings/deleted_repositories](https://github.com/settings/deleted_repositories) for a personal account, or `Organization settings > Deleted repositories` for an org, and click **Restore**. After 90 days, the repository is deleted permanently
3. Restoration is **blocked for any repo with fork relationships** — GitHub's own UI is explicit: "You can only restore repositories that are not forks, or have not been forked." If your repo was ever forked by anyone, or if it's itself a fork, the self-serve button will not appear. Paid-plan accounts can contact GitHub Support to untangle the fork network
4. Not everything comes back — **team permissions are not restored**, and restored **issues lose their labels**
5. Forks of your repo are **not affected** by deletion — they become standalone repositories
6. Stars, watchers, and any external links to the repo will break (stars are not restored even if you restore the repo)

### How to Delete in Bulk

- **[Repo Remover](https://reporemover.xyz)** — Select multiple repos, click "Delete Selected," confirm by typing your username. Includes confirmation dialogs to prevent accidents.
- **GitHub CLI** — `gh repo delete owner/repo-name --yes` (scriptable, but no visual review)
- **GitHub Web UI** — Settings > Danger Zone > Delete this repository (one at a time, painful at scale)

## Decision Framework

Use this flowchart to decide:

1. **Does the repo contain code you might reference?** → Archive
2. **Is it part of your public portfolio?** → Archive
3. **Have others forked or starred it?** → Archive (unless it's truly empty)
4. **Is it a test/tutorial/experiment with no unique value?** → Delete
5. **Is it empty or contains only a README?** → Delete
6. **Did you accidentally commit secrets?** → Delete + rotate credentials
7. **Still unsure?** → Archive (you can always delete later)

## The "Archive First" Strategy

Many developers use a two-phase cleanup approach:

1. **Phase 1 — Archive everything** you're considering removing. This is safe, reversible, and instantly declutters your active repo list.
2. **Phase 2 — Review archived repos** after 3-6 months. If you never needed to reference them, delete them. If you did unarchive one, it was worth keeping.

This approach sidesteps the 90-day restore window entirely and keeps issue labels, team permissions, and stars intact if you change your mind.

## Frequently Asked Questions

### Can I restore a deleted GitHub repository?

Yes, within 90 days, through the GitHub UI — but with real limits.

- **Personal account**: [github.com/settings/deleted_repositories](https://github.com/settings/deleted_repositories)
- **Organization**: `Organization settings > Deleted repositories`

Pick the repo and click **Restore**. The repo shows up in that list up to an hour after deletion. GitHub's own warning on the page spells out the biggest gotcha directly: _"You can only restore repositories that are not forks, or have not been forked."_ If your repo was ever forked by someone else, or if it is itself a fork, the Restore button will not appear.

Other caveats that make this different from archiving:

- The 90-day window is a hard cutoff — after that the repository is permanently gone.
- **Team permissions are not restored.** You'll have to re-add team access.
- **Restored issues lose their labels** — the issues come back, but their label associations don't.
- **Stars, watchers, and traffic data are not restored.**
- Paid-plan accounts can contact GitHub Support to untangle a fork-blocked restore; free accounts cannot.

If any of those caveats matter to you, archive first and delete later rather than deleting now and hoping restore works.

### Can I unarchive a GitHub repository?

Yes. Archiving is fully reversible. Go to the repository's Settings page and click "Unarchive this repository." All code, issues, and pull requests will be restored to their original state with full read-write access.

### Does archiving affect my GitHub contribution graph?

No. Archiving a repository does not remove commits from your contribution graph. Your past contributions to that repository are preserved. However, new contributions to archived repos are not possible since they're read-only.

### Can I archive or delete organization repositories?

Yes, both operations work for organization repositories as long as you have admin permissions. For organizations, coordinate with your team before bulk operations — other members may depend on repos you're considering removing.
