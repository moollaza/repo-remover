---
title: "How to Bulk Delete GitHub Repositories"
description: "Delete multiple GitHub repositories at once using Repo Remover, GitHub CLI, or the API. Step-by-step guide with three methods compared."
slug: "bulk-delete-github-repositories"
canonical: "https://reporemover.xyz/guides/bulk-delete-github-repositories/"
date: "2026-04-12"
lastmod: "2026-04-17"
---

Need to delete multiple GitHub repositories at once? Whether you're cleaning up old projects, removing test repos, or starting fresh, this guide covers three methods to bulk delete GitHub repositories — from the easiest GUI approach to command-line scripts.

## Why Bulk Delete GitHub Repositories?

Over time, GitHub accounts accumulate repositories that no longer serve a purpose: abandoned side projects, tutorial forks, test repos from years ago, and duplicates you forgot about. GitHub doesn't offer a native way to delete multiple repositories at once — you have to delete them one by one, typing each repository name as confirmation.

For developers with dozens or hundreds of repos to clean up, this manual process is painful. Here are three better approaches.

## Method 1: Using Repo Remover (Recommended)

[Repo Remover](https://reporemover.xyz) is a free, open-source web tool that lets you view, filter, and bulk delete or archive GitHub repositories from a single dashboard. Your GitHub token never leaves your browser — it calls the GitHub API directly with zero server involvement.

### Step 1: Generate a Personal Access Token

1. Go to [GitHub Settings > Developer settings > Personal access tokens > Fine-grained tokens](https://github.com/settings/personal-access-tokens/new)
2. Give the token a descriptive name like "Repo Remover cleanup"
3. Under **Repository access**, select "All repositories"
4. Under **Permissions > Repository permissions**, enable:
   - **Administration**: Read and write (required for deletion)
   - **Metadata**: Read-only (required for listing repos)
5. Click **Generate token** and copy it

### Step 2: Load Your Repositories

1. Visit [reporemover.xyz](https://reporemover.xyz)
2. Paste your Personal Access Token in the input field
3. Click **Load Repos** — all your repositories will appear in a sortable, filterable table

### Step 3: Select and Delete

1. Use the search bar to filter repos by name, or use visibility filters (public, private, archived)
2. Select the repositories you want to delete using the checkboxes
3. Click **Delete Selected** (or **Archive Selected** if you want to preserve them)
4. Confirm the action in the dialog — type your GitHub username to proceed

That's it. Repo Remover handles the API calls to delete each repository, with a brief delay between operations to respect GitHub's rate limits.

**Why this method is best:**

- No command line required
- Visual interface makes it easy to review before deleting
- Supports both personal and organization repositories
- Archive option for repos you want to keep but hide
- Open source — you can audit the code yourself

## Method 2: Using the GitHub CLI

If you prefer the command line, the [GitHub CLI](https://cli.github.com/) (`gh`) can delete repositories — though it doesn't have a native bulk operation.

### List your repositories

```bash
gh repo list --limit 200 --json name,updatedAt,visibility
```

### Delete repositories matching a pattern

```bash
# Delete all repos matching "test-" prefix (requires confirmation for each)
gh repo list --json name -q '.[].name' | grep "^test-" | while read repo; do
  gh repo delete "your-username/$repo" --yes
done
```

### Delete repos not updated in 2+ years

```bash
cutoff=$(date -d "2 years ago" +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date -v-2y +%Y-%m-%dT%H:%M:%SZ)
gh repo list --json name,updatedAt -q ".[] | select(.updatedAt < \"$cutoff\") | .name" | while read repo; do
  echo "Deleting: $repo"
  gh repo delete "your-username/$repo" --yes
done
```

**Pros:** Scriptable, can be combined with other CLI tools
**Cons:** No visual review, easy to make mistakes, requires `gh auth login` with `delete_repo` scope

## Method 3: GitHub Web UI (Manual)

GitHub's web interface only supports deleting repositories one at a time:

1. Navigate to the repository on github.com
2. Go to **Settings** (bottom of the repository page)
3. Scroll to the bottom — **Danger Zone**
4. Click **Delete this repository**
5. Type the full repository name (e.g., `your-username/repo-name`) to confirm
6. Click **I understand the consequences, delete this repository**

Repeat for every repository you want to delete.

**This doesn't scale.** Deleting 10 repos means navigating to 10 settings pages and typing 10 repo names. For 50+ repos, use Method 1 or Method 2 instead.

## Tips and Best Practices

- **Archive before deleting** — If you're unsure about a repository, archive it first. Archiving is fully reversible. Deletion has a 90-day self-serve restore window, but loses issue labels, team permissions, and stars.
- **Export important data first** — Clone repos locally before deleting if you might need the code later.
- **Check for forks** — If others have forked your repository, deleting yours won't affect their forks.
- **Review organization repos carefully** — Deleting an org repo may affect team members. Coordinate before bulk operations.
- **Revoke your token after cleanup** — If you created a fine-grained token specifically for this task, delete it when you're done.

## Frequently Asked Questions

### Can I undo a GitHub repository deletion?

Yes, within 90 days. Go to [github.com/settings/deleted_repositories](https://github.com/settings/deleted_repositories) (personal) or `Organization settings > Deleted repositories` (orgs) and click **Restore** on the repo you want back. The repo shows up there up to an hour after deletion.

Important limit from GitHub's own UI: _"You can only restore repositories that are not forks, or have not been forked."_ So any repo that was forked by someone else, or that is itself a fork, cannot be self-serve restored. Paid plans can escalate to GitHub Support; free accounts are stuck.

Other caveats: team permissions are not restored, restored issues lose their labels, stars and watchers do not come back. If any of that matters, archive instead of deleting.

### Does bulk deleting work with organization repositories?

Yes. Both Repo Remover and the GitHub CLI support organization repositories, as long as your token or authentication has the necessary admin permissions for the organization.

### Will deleting a repository affect forks?

No. Forks are independent copies. Deleting the original (upstream) repository does not delete any forks. However, if you delete a fork, it has no effect on the original repository.

### Is it safe to use a third-party tool like Repo Remover?

Repo Remover is open source and uses a zero-knowledge architecture — your GitHub token never leaves your browser. It communicates directly with the GitHub API from your device. You can [audit the source code](https://github.com/moollaza/repo-remover) yourself. No backend server ever sees your token.
