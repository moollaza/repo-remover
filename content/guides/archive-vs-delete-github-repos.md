---
title: "Archive vs Delete GitHub Repos: Which Should You Choose?"
description: "Should you archive or delete old GitHub repositories? A complete comparison of both approaches with a decision framework to help you choose."
slug: "archive-vs-delete-github-repos"
canonical: "https://reporemover.xyz/guides/archive-vs-delete-github-repos/"
date: "2026-04-12"
lastmod: "2026-04-18"
---

Deciding whether to archive or delete a GitHub repository? **Archive if you might want to look at it later. Delete if you don't need it.** This guide breaks down the differences, trade-offs, and when to use each approach.

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

- **You might reference the code later** — even if you're "done" with a project, the code may be worth keeping.
- **It's part of your portfolio** — archived repos stay visible on your profile and show your work history.
- **Others depend on it** — if people have forked or starred your repo, archiving keeps the code accessible and flags it as no longer maintained.
- **It contains documentation** — READMEs, wikis, and issues often hold context that's hard to recreate.
- **You're unsure** — archive buys you time to decide. GitHub does let you restore a deleted repo within 90 days<sup>[<a href="#source-github-restore">1</a>]</sup>, but the restore brings back the code, not the team permissions or issue labels.

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
4. Not everything comes back — **you lose team permissions**, and restored **issues lose their labels**
5. Forks survive — they become standalone repositories
6. Stars, watchers, and any external links to the repo will break (restoring the repo doesn't bring stars back)

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

If you can't decide between archive and delete on a pile of borderline repos, try a two-phase cleanup:

1. **Phase 1 — Archive everything** you're considering removing. Reversible, and it instantly declutters your active repo list.
2. **Phase 2 — Review archived repos** after 3–6 months. Delete the ones you never referenced. The ones you unarchived were worth keeping.

This trades dwell time for safety — useful when you're cleaning up in bulk and not sure which repos you'll miss. If you already know you don't need a repo, delete it directly. You don't owe it a probation period.

## Frequently Asked Questions

### Can I restore a deleted GitHub repository?

Yes, within 90 days, through the GitHub UI — but with real limits.

- **Personal account**: [github.com/settings/deleted_repositories](https://github.com/settings/deleted_repositories)
- **Organization**: `Organization settings > Deleted repositories`

Pick the repo and click **Restore**. The repo shows up in that list up to an hour after deletion. GitHub's own warning is explicit: _"You can only restore repositories that are not forks, or have not been forked."_ If anyone has ever forked your repo, or if it's itself a fork, the Restore button won't appear.

Other caveats that make this different from archiving:

- The 90-day window is a hard cutoff — after that the repository is gone for good.
- **You lose team permissions** — you'll have to re-add team access.
- **Restored issues lose their labels** — the issues come back, the labels don't.
- **Stars, watchers, and traffic data don't come back.**
- Paid-plan accounts can escalate a fork-blocked restore to GitHub Support; free accounts can't.

If any of those caveats matter to you, archive now and delete later — don't delete now and hope restore works.

### Can I unarchive a GitHub repository?

Yes. Archiving is fully reversible. Go to the repository's Settings page and click "Unarchive this repository." Unarchiving restores all code, issues, and pull requests with full read-write access.

### Does archiving affect my GitHub contribution graph?

No. Archiving keeps your commits in your contribution graph — past contributions stay intact. But archived repos are read-only, so you can't add new commits to them.

### Can I archive or delete organization repositories?

Yes, both operations work for organization repositories as long as you have admin permissions. For organizations, coordinate with your team before bulk operations — other members may depend on repos you're considering removing.

## Sources

<ol>
  <li id="source-github-restore">GitHub Docs, <a href="https://docs.github.com/en/repositories/creating-and-managing-repositories/restoring-a-deleted-repository" target="_blank" rel="noopener noreferrer">Restoring a deleted repository</a> — 90-day window, fork-blocked restore, and what doesn't come back.</li>
</ol>
