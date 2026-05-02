# Support Triage Project

A React dashboard that turns the support-triage prompt into a clear product-style brief. It explains:

- the available CSV inputs and evaluation fixtures in this repo
- the included Python agent
- the quick-start guide
- the system prompt guide
- the prompt engineering guide
- the official support corpus sources for HackerRank, Claude, and Visa
- how the Python triage agent works
- how to run it
- what output schema to expect
- sample reply vs escalate decisions
- the rules-only fallback and corpus requirement for challenge-complete runs

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Project shape

- `src/App.jsx`: support triage dashboard content
- `src/App.css`: dashboard styling
- `src/index.css`: global theme and layout
- `support_triage_agent_v2.py`: Python triage runner using `groq` and `pandas`
- `support_corpus/README.md`: instructions for building the local support corpus from the approved sources
- `starter_tickets.csv`: starter input template using `Issue`, `Subject`, and `Company`
- `expected_regression.csv`: baseline labeled regression cases
- `expected_high_risk_regression.csv`: high-risk labeled regression cases
- `chat_session.jsonl`: sample JSONL chat audit log
- `QUICKSTART_v2.md`: concise run instructions for the triage workflow
- `SYSTEM_PROMPT_GUIDE.md`: triage policy, escalation rules, and JSON response contract
- `PROMPT_ENGINEERING_GUIDE.md`: prompt design, risk scoring, testing, and optimization notes

## Python agent commands shown in the UI

```bash
python3 --version
pip install --break-system-packages groq pandas -q
export GROQ_API_KEY="your-groq-api-key-here"
python3 support_triage_agent_v2.py support_tickets.csv sample_support_tickets.csv your_results.csv --corpus-dir ./support_corpus
TRIAGE_RULES_ONLY=1 python3 support_triage_agent_v2.py starter_tickets.csv "" triage_results.csv
```

## Approved support corpus sources

- HackerRank Support: [support.hackerrank.com](https://support.hackerrank.com/)
- Claude Help Center: [support.claude.com/en](https://support.claude.com/en/)
- Visa Support: [visa.co.in/support.html](https://www.visa.co.in/support.html)

The agent is intended to use only content extracted from those support sources. If relevant corpus evidence is missing for a ticket, it now escalates instead of guessing.
