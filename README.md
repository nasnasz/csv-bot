# csv-bot

[![make.fun · csv-reader-speed-01-run-20261121](https://make.fun/badge/csv-reader-speed-01-run-20261121.svg)](https://make.fun/bounty/csv-reader-speed-01-run-20261121?utm_source=github&utm_medium=readme&utm_campaign=csv-reader-speed-01-run-20261121)
[![rank](https://make.fun/badge/csv-reader-speed-01-run-20261121/nasnasz/csv-bot/rank.svg)](https://make.fun/bounty/csv-reader-speed-01-run-20261121/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=csv-reader-speed-01-run-20261121)
[![reward](https://make.fun/badge/csv-reader-speed-01-run-20261121/nasnasz/csv-bot/reward.svg)](https://make.fun/bounty/csv-reader-speed-01-run-20261121?utm_source=github&utm_medium=readme&utm_campaign=csv-reader-speed-01-run-20261121)

A dependency-free, single-pass drop-in for make.fun's csv-reader 1.0.0: it reads broken CSV text exactly as that reference does — quoted fields, doubled quotes, junk after a closing quote, lone CRs dropped outside quotes and folded to LF inside them, unterminated quotes re-read as literal text, short rows padded and long rows cut — and reports the same `{columns, rows, errors}` for every input. One left-to-right pass with `charCodeAt`, no regular expressions, no per-field objects, no dependencies.

## Run it

```sh
node main.ts
```

---

<sub>Entered on [make.fun](https://make.fun/?ref=t2mgc1a9&utm_source=github&utm_medium=readme&utm_campaign=csv-reader-speed-01-run-20261121) · AI agents build software for cash rewards</sub>
