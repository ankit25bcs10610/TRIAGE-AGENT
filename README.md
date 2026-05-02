# Support Triage Project

This project implements a conservative support-triage workflow for three ecosystems:

- HackerRank
- Claude
- Visa

It includes:

- a React dashboard that explains the workflow and deliverables
- a Python triage agent that classifies tickets and decides whether to reply or escalate
- regression fixtures for validation
- a corpus structure grounded only in the approved official support sources

The supported `request_type` values are:

- `product_issue`
- `feature_request`
- `bug`
- `invalid`

## Quick Start

Install the frontend dependencies:

```bash
npm install
```

Run the dashboard locally:

```bash
npm run dev
```

Run the rules-only demo:

```bash
npm run demo:rules
```

Run the model-backed demo:

```bash
GROQ_API_KEY="your-groq-api-key-here" npm run demo:full
```

Note:
`demo:full` requires `support_corpus/` to contain real extracted content from the approved support sources listed below.

## What The Agent Does

For each ticket, the agent:

1. detects the company if needed
2. assesses risk
3. classifies the request type
4. assigns a product area
5. decides whether to reply or escalate
6. writes structured CSV output

The agent is conservative by design. If the relevant official support evidence is missing or weak, it escalates instead of guessing.

## Approved Support Corpus Sources

- HackerRank Support: [support.hackerrank.com](https://support.hackerrank.com/)
- Claude Help Center: [support.claude.com/en](https://support.claude.com/en/)
- Visa Support: [visa.co.in/support.html](https://www.visa.co.in/support.html)

Only content extracted from those approved sources should be used to populate `support_corpus/`.

## Main Commands

Model-backed run:

```bash
python3 support_triage_agent_v2.py support_tickets.csv sample_support_tickets.csv your_results.csv --corpus-dir ./support_corpus
```

Rules-only fallback:

```bash
TRIAGE_RULES_ONLY=1 python3 support_triage_agent_v2.py starter_tickets.csv "" triage_results.csv
```

## Project Files

- `src/App.jsx`: React dashboard content
- `src/App.css`: dashboard styles
- `src/index.css`: global styles
- `support_triage_agent_v2.py`: Python triage engine
- `support_tickets.csv`: starter full-run ticket set
- `sample_support_tickets.csv`: starter labeled reference set
- `starter_tickets.csv`: minimal starter input template
- `expected_regression.csv`: baseline regression fixture
- `expected_high_risk_regression.csv`: high-risk regression fixture
- `support_corpus/README.md`: corpus instructions
- `QUICKSTART_v2.md`: expanded usage notes
- `SYSTEM_PROMPT_GUIDE.md`: system prompt and escalation policy
- `PROMPT_ENGINEERING_GUIDE.md`: prompt design and validation notes

## Validation

Frontend checks:

```bash
npm run lint
npm run build
```

## Submission Notes

The repository is structured so an evaluator can:

- inspect the React dashboard
- run a rules-only demo immediately
- run a model-backed flow once the approved corpus content is present
- review regression fixtures and corpus organization

For the strongest end-to-end evaluation, populate the topic-based files inside `support_corpus/` with real extracted official support content.
