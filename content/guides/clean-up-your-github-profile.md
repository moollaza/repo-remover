---
title: "Clean Up Your GitHub Profile"
description: "Make your GitHub profile shine for employers and collaborators. A step-by-step guide to cleaning up repositories, pinning your best work, and presenting a professional developer portfolio."
slug: "clean-up-your-github-profile"
canonical: "https://reporemover.xyz/guides/clean-up-your-github-profile/"
date: "2026-04-12"
lastmod: "2026-04-17"
---

Your GitHub profile is your developer portfolio. Whether you're job hunting, contributing to open source, or building your reputation, a cluttered GitHub with hundreds of abandoned repos sends the wrong signal. Here's how to clean it up.

## Why Your GitHub Profile Matters

Recruiters, hiring managers, and potential collaborators check GitHub profiles. What they see:

- **Pinned repositories** — your best work, front and center
- **Contribution graph** — how active you are
- **Repository list** — everything you've ever created or forked
- **README profile** — your personal introduction

A profile with 200 repos, most of which are abandoned tutorials and empty forks, buries your real work. Cleaning up makes your actual skills visible.

## Step 1: Audit Your Repositories

Before deleting anything, get a clear picture of what you have.

### Using Repo Remover (Fastest)

1. Visit [reporemover.xyz](https://reporemover.xyz) and load your repositories
2. Sort by "Last Updated" to find the oldest, most neglected repos
3. Filter by visibility to see what's publicly visible
4. Use search to find tutorial-related repos (search for "tutorial," "test," "learn," "demo")

### Using GitHub CLI

```bash
# List all repos sorted by last update (oldest first)
gh repo list --limit 300 --json name,updatedAt,visibility,isFork \
  --jq 'sort_by(.updatedAt) | .[] | [.name, .updatedAt[:10], .visibility, if .isFork then "fork" else "" end] | @tsv'
```

### Manual Approach

Visit `github.com/your-username?tab=repositories` and sort by "Last updated." Scroll through and mentally categorize each repo.

## Step 2: Categorize Your Repos

Sort your repositories into four buckets:

| Category     | Action                          | Examples                                               |
| ------------ | ------------------------------- | ------------------------------------------------------ |
| **Showcase** | Pin and polish                  | Your best projects, active open source work            |
| **Keep**     | Leave as-is                     | Useful utilities, libraries you maintain               |
| **Archive**  | Archive (hide from active list) | Old projects with useful code, completed coursework    |
| **Remove**   | Delete (90-day restore window)  | Empty repos, tutorial forks, test projects, duplicates |

### Red Flags — Repos to Remove

- Empty repositories (just a README or nothing at all)
- Forked repos you never modified
- Tutorial follow-alongs (unless you significantly customized them)
- Repos named "test," "temp," "untitled," or "my-first-..."
- Duplicate repos (accidentally created twice)
- Repos with a single commit from years ago

### Worth Archiving (Not Deleting)

- Completed course projects that demonstrate skills
- Old side projects with working code
- Repos others have starred or forked
- Anything you might want to reference later

## Step 3: Bulk Clean Up

Now act on your categories.

### Delete the Noise

Use [Repo Remover](https://reporemover.xyz) to select and delete multiple repos at once:

1. Load your repos and use the search filter
2. Select all repos you've categorized as "Remove"
3. Click "Delete Selected" and confirm

Alternatively, with the GitHub CLI:

```bash
# Delete specific repos
gh repo delete your-username/test-repo-1 --yes
gh repo delete your-username/old-tutorial --yes
```

### Archive the Old

For repos worth keeping but not actively maintained:

1. In Repo Remover, select repos categorized as "Archive"
2. Click "Archive Selected"

Or via CLI: `gh repo archive your-username/old-project`

## Step 4: Pin Your Best Work

GitHub lets you pin up to 6 repositories to the top of your profile. Choose carefully:

1. Go to your GitHub profile
2. Click "Customize your pins"
3. Select 6 repositories that showcase your **range and depth**

### What to Pin

- Your most impressive or complex project
- An active open source contribution
- A project using a technology you want to be hired for
- Something with a polished README and good documentation
- A project that solves a real problem (not just a demo)

### What NOT to Pin

- Tutorial follow-alongs
- Dotfiles (unless they're exceptionally well-organized)
- Forks you haven't modified
- Repos without READMEs

## Step 5: Polish Your Pinned Repos

For each pinned repository, ensure:

- **README is complete** — describe what it does, how to use it, and include screenshots if applicable
- **Description is set** — the one-line description shown on your profile
- **Topics are added** — GitHub topics help discoverability and show what technologies you use
- **Language is accurate** — if GitHub detected the wrong primary language, add a `.gitattributes` file
- **License is included** — shows you understand open source practices

## Step 6: Set Up Your Profile README

Create a repository named exactly `your-username` (matching your GitHub username). The README.md in this repo becomes your profile's header.

Keep it concise:

- Brief intro (who you are, what you do)
- Key technologies you work with
- Links to your portfolio, blog, or social profiles
- Current focus or what you're looking for

Avoid: badge overload, animated GIFs of typing text, auto-generated stats widgets (unless they're genuinely impressive).

## Maintenance Schedule

GitHub profiles get cluttered gradually. Set a reminder:

- **Monthly**: Quick scan for repos to archive (5 minutes)
- **Quarterly**: Full audit — review all repos, update pins, clean up forks
- **Before job applications**: Deep clean — polish READMEs, update descriptions, ensure pins are current

## Frequently Asked Questions

### Will cleaning up my GitHub affect my contribution graph?

No. Deleting or archiving repositories does not remove commits from your contribution graph. Your past contributions are preserved regardless of what happens to the repository.

### Should I delete forked repositories I haven't modified?

Generally yes. Unmodified forks clutter your profile and don't demonstrate any skill. If you forked a project to contribute to it, only keep the fork if your contribution is meaningful and visible.

### How do I handle private repositories when cleaning up?

Private repos aren't visible to others, so they don't affect your public profile. Still worth cleaning up for your own organization, but prioritize public repo cleanup if you're preparing for job applications.
