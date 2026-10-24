# Agent Ramp Scoreboard

[![GitHub stars](https://img.shields.io/github/stars/aamirtechs/agent-ramp-scoreboard?style=social)](https://github.com/aamirtechs/agent-ramp-scoreboard/stargazers) [![GitHub forks](https://img.shields.io/github/forks/aamirtechs/agent-ramp-scoreboard?style=social)](https://github.com/aamirtechs/agent-ramp-scoreboard/network/members) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/aamirtechs/agent-ramp-scoreboard/blob/main/LICENSE) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/aamirtechs/agent-ramp-scoreboard/issues)
Live page: https://aamirtechs.github.io/agent-ramp-scoreboard/

New hire ramp analytics for a remote sales or service floor, aggregated by cohort only. It surfaces week 2 QA and compliance problems while they are still coachable, instead of ranking individuals.

## Features
- Cohort only ramp analytics for a remote sales or service floor: QA, conversion, handle time and compliance QA by start-week cohort and week on floor.
- Minimum cohort size (default 5) suppresses small cohorts from reporting with an explicit suppressed note.
- Editable target bands per metric, with in-band, below-band and above-band flags on every cohort week row.
- Early warning when a cohort is below band on the compliance QA item, generating a supportive coaching task line.
- No individual ranking anywhere: input is grouped by cohort before display and the summary CSV contains no agent references.
- Synthetic agents only in the sample data (Agent 001 and similar). Aggregated reporting coaches people instead of surveilling them.

## How it works
Upload or paste CSV rows with agent reference, cohort, week on floor and the four metrics, set the minimum cohort size and target bands, and run it. You get a cohort ramp table and a downloadable cohort summary CSV. It runs entirely in the browser.

## Privacy
Runs 100% in your browser. Your files never leave this device, nothing is uploaded,
and there is no tracking.

## Development
Core logic lives in `src/logic.js` and is shared by the page and the tests.
Run the tests with `npm test`.

## License
MIT, Copyright 2026 Amir Hussain.
