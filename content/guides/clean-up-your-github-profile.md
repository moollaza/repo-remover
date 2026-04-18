---
title: "Clean Up Your GitHub Profile"
description: "Make your GitHub profile shine for employers and collaborators. A step-by-step guide to cleaning up repositories, pinning your best work, and presenting a professional developer portfolio."
slug: "clean-up-your-github-profile"
canonical: "https://reporemover.xyz/guides/clean-up-your-github-profile/"
date: "2026-04-12"
lastmod: "2026-04-18"
---

Your GitHub profile is the public record of what you've built. Whether you're job hunting, contributing to open source, or just want a tidy workspace, a little curation makes your real work easier to find. Here's how to clean it up.

## Why clean up your profile?

Mostly, you get a profile you can navigate. When tutorials and empty forks outnumber your real projects, you lose track of your own work — and anyone who does show up sees the clutter first. That's the reliable payoff, no matter who's looking.

As for hiring: many engineers and hiring managers argue GitHub profiles don't meaningfully factor into decisions<sup>[<a href="#source-frederickson">2</a>][<a href="#source-hn-recruiters">3</a>]</sup>. _Some_ technical hiring managers do look when GitHub is linked on your resume<sup>[<a href="#source-dev-recruiters">1</a>]</sup>, but don't expect the profile itself to move the needle.

The five steps that follow are ordered around that reality: audit what you have, categorize it, clean up in bulk, pin and polish the handful worth showcasing, and write a short profile README.

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

Sort every repository into one of these buckets:

| Category     | Examples                                                                            |
| ------------ | ----------------------------------------------------------------------------------- |
| **Showcase** | Your best projects, active open source work                                         |
| **Keep**     | Useful utilities, libraries you maintain                                            |
| **Archive**  | Old projects with useful code, completed coursework, working code you might revisit |
| **Private**  | In-progress work, drafts, anything you don't want on your public profile            |
| **Remove**   | Empty repos, tutorial forks, test projects, duplicates                              |

Step 3 covers what to do with each bucket. For now, just sort.

### Low-signal repos worth flagging

These are the repos most often mentioned as low-value in recruiter-facing writing<sup>[<a href="#source-dev-recruiters">1</a>][<a href="#source-profile-mistakes">5</a>]</sup> — and more importantly, they bury your real work:

- Empty repositories (just a README or nothing at all)
- Forked repos you never modified
- Tutorial follow-alongs (unless you significantly customized them)
- Duplicate repos (accidentally created twice)

Most of these go in **Remove**. A few might belong in **Archive** if the code is worth keeping for reference.

## Step 3: Bulk Clean Up

Each category gets a different tool. Pick based on what the repo is actually for.

### Archive — for reference and history

Archiving freezes a repo: still visible, still fork-able, still links to your commits, but clearly marked "no longer maintained." Use this for completed side projects, old coursework, and working code you might want to look at again.

1. In Repo Remover, select repos categorized as "Archive"
2. Click "Archive Selected"

Or via CLI: `gh repo archive your-username/old-project`

### Make It Private — for work you're not ready to share

If a repo is in-progress or you just don't want it on your public profile, flip it to private. Your commits and contribution graph are preserved; the code just isn't listed publicly.

```bash
gh repo edit your-username/old-project --visibility private
```

### Delete — for repos you don't need

Some repos just don't need to stick around: empty repos, obvious duplicates, throwaway experiments, accidental commits. Delete them. Keeping junk "just in case" clutters your own workspace more than it helps. If you change your mind, deletion is reversible for 90 days<sup>[<a href="#source-github-restore">7</a>]</sup>.

Use [Repo Remover](https://reporemover.xyz) to select and delete multiple repos at once:

1. Load your repos and use the search filter
2. Select repos you've categorized as "Remove"
3. Click "Delete Selected" and confirm

Alternatively, with the GitHub CLI:

```bash
gh repo delete your-username/empty-test-repo --yes
```

## Step 4: Pin and Polish Your Best Work

GitHub lets you pin up to 6 repositories to the top of your profile. Choose carefully, then polish each one — the pins are what most visitors actually read.

### Pick your pins

1. Go to your GitHub profile
2. Click "Customize your pins"
3. Select 6 repositories that showcase your **range and depth**

**What to pin:**

- Your most impressive or complex project
- An active open source contribution
- A project using a technology you want to be hired for
- Something with a polished README and good documentation
- A project that solves a real problem (not just a demo)

**What NOT to pin:**

- Tutorial follow-alongs
- Dotfiles (unless they're exceptionally well-organized)
- Forks you haven't modified
- Repos without READMEs

### Polish each pin

For every pinned repository, check:

- **README is complete** — describe what it does, how to use it, and include screenshots if applicable
- **Description is set** — the one-line description shown on your profile
- **Topics are added** — GitHub topics help discoverability and show what technologies you use
- **Language is accurate** — if GitHub detected the wrong primary language, add a `.gitattributes` file
- **License is included** — shows you understand open source practices

## Step 5: Set Up Your Profile README

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

No. Deleting or archiving repositories keeps your commits in your contribution graph — they stay regardless of what happens to the repo.

### Should I delete forked repositories I haven't modified?

Generally yes. Unmodified forks clutter your profile and show nothing about your skill. Keep the fork only when your contribution is meaningful and visible.

### How do I handle private repositories when cleaning up?

Private repos aren't visible to others, so they don't affect your public profile. Cleaning them up is a matter of personal organization.

## Sources

These are the pieces that most shaped this guide. They're a mix of recruiter-side advice and hiring-manager counterpoints — intentionally, because the honest answer is "it depends who's looking."

<ol>
  <li id="source-dev-recruiters">Hexshift, <a href="https://dev.to/hexshift/what-recruiters-look-for-in-a-github-profile-and-how-to-optimize-yours-j0e" target="_blank" rel="noopener noreferrer">What Recruiters Look For in a GitHub Profile</a> — DEV Community.</li>
  <li id="source-frederickson">Ben Frederickson, <a href="https://www.benfrederickson.com/github-wont-help-with-hiring/" target="_blank" rel="noopener noreferrer">GitHub Won't Help You With Hiring</a>.</li>
  <li id="source-hn-recruiters"><a href="https://news.ycombinator.com/item?id=19413348" target="_blank" rel="noopener noreferrer">Ask HN: What do recruiters look for in a GitHub profile?</a> — Hacker News thread where hiring managers weigh in on both sides.</li>
  <li id="source-200-engineers">Coders Stop, <a href="https://medium.com/@coders.stop/ive-hired-200-engineers-here-s-why-your-github-doesn-t-matter-b4dc1ea403ab" target="_blank" rel="noopener noreferrer">I've Hired 200+ Engineers: Here's Why Your GitHub Doesn't Matter</a>.</li>
  <li id="source-profile-mistakes">JS Guru Jobs, <a href="https://medium.com/@kantmusk/7-github-profile-mistakes-that-cost-you-job-offers-e6b37ea92238" target="_blank" rel="noopener noreferrer">7 GitHub Profile Mistakes That Cost You Job Offers</a>.</li>
  <li id="source-purge-keep">Bradley Collins, <a href="https://dev.to/bradleycollins/purge-or-keep-old-unfinished-projects-in-github-1lbb" target="_blank" rel="noopener noreferrer">Purge or Keep old, unfinished projects in GitHub?</a> — DEV Community.</li>
  <li id="source-github-restore">GitHub Docs, <a href="https://docs.github.com/en/repositories/creating-and-managing-repositories/restoring-a-deleted-repository" target="_blank" rel="noopener noreferrer">Restoring a deleted repository</a> — 90-day window.</li>
</ol>
