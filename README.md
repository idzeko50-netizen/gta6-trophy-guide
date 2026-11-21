[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/idzeko50-netizen/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/idzeko50-netizen/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

# GTA 6 Trophy Guide — all 55 trophies & the road to the platinum

A plain, offline, static web guide to every PlayStation 5 trophy in Grand Theft Auto VI: 1 platinum, 2 gold, 6 silver, 46 bronze. All 55 are offline and fit in a single playthrough; 28 are hidden on PlayStation until earned.

What it does:

- **Checklist** — tick trophies off as you earn them; ticks are saved in the browser (localStorage) and can be exported to a file and imported back.
- **A guide for every trophy**, written for this page, with its sources cited beside it (KeenGamer, Push Square, GameMapa, GTA Vice City Hub). Where the published guides have not confirmed a method yet — a few of the hidden trophies — the guide says so instead of inventing one.
- **Filters** by kind (story, missable, collectibles, activities, online) and by grade, plus a search box.
- **Spoiler setting** — hides the names and descriptions of story trophies until they are earned.
- **Roadmap to the platinum** in five stages: story first (with the one missable trophy flagged during Chapter 1), side stories, activities, collectibles, then the long grinds and the platinum last.
- **Progress display** — X of 55 earned, per-grade counts, and platinum progress.

The one trophy that can be missed: **Positive Mental Attitude**. During Chapter 1, after the mission Down to Earth, meditate with Lucia on the balcony at Jason's house — before you leave Chapter 1.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 — no build step, no network needed; the page loads only files from `app/`.

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

That copies `app/` and `screenshots/` into `out/` and writes `out/dossier.json`.
