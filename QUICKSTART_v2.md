# Support Triage Agent v2 - Quick Start Guide

## What You Have

This repository currently includes a starter template and regression fixtures for three companies:

- Claude
- HackerRank
- Visa

Bundled files in this workspace:

- `starter_tickets.csv`: starter input template
- `expected_regression.csv`: 10 labeled regression cases
- `expected_high_risk_regression.csv`: 8 labeled high-risk regression cases
- `chat_session.jsonl`: sample interactive audit log

For full challenge execution, you still need your actual ticket CSV, sample/reference CSV, and extracted support corpus directory.

## Running the Agent

### Step 1: Set Your API Key

```bash
export GROQ_API_KEY="your-actual-groq-api-key-here"
```

### Step 2: Run the Agent

Model-backed challenge run:

```bash
python3 support_triage_agent_v2.py \
  support_tickets.csv \
  sample_support_tickets.csv \
  results.csv \
  --corpus-dir ./support_corpus
```

Parameters:

- `support_tickets.csv`: the ticket file to process
- `sample_support_tickets.csv`: examples or labeled references for grounding
- `results.csv`: output file where results will be saved
- `--corpus-dir`: required for model-backed runs unless you intentionally use rules-only mode

Rules-only fallback:

```bash
TRIAGE_RULES_ONLY=1 python3 support_triage_agent_v2.py \
  starter_tickets.csv \
  "" \
  triage_results.csv
```

### Step 3: Review Results

```bash
cat results.csv
```

## Output Columns

- `issue`: original ticket text
- `subject`: ticket subject line
- `company`: HackerRank, Claude, Visa, or detected fallback
- `response`: reply text or escalation reason
- `product_area`: category such as `screen`, `privacy`, `billing`
- `status`: `Replied` or `Escalated`
- `request_type`: `product_issue`, `feature_request`, `bug`, or `invalid`
- `justification`: why the decision was made

Example output:

```csv
issue,subject,company,response,product_area,status,request_type,justification
"I lost access to my Claude workspace...",Claude access lost,Claude,"Your access was removed by your IT admin. Since you're not the workspace owner...",conversation_management,Escalated,product_issue,This requires account modification and verification
```

## Processing Time

- Rules-only mode: near-instant for small CSVs
- Model-backed mode: depends on API latency and corpus size

## What the Agent Does

For each ticket, it:

1. Identifies the company
2. Decides whether to reply or escalate
3. Classifies the request type
4. Assigns a product area
5. Generates a response or escalation reason
6. Records a justification for auditability

## Key Features

- Uses sample tickets as examples
- Applies company-aware decision logic
- Escalates when uncertain
- Produces structured CSV output
- Keeps every decision auditable with a justification

## Expected Results Distribution

The exact split depends on your real ticket set, but the bundled regression fixtures are designed to reinforce a conservative routing posture:

- high-risk, billing, fraud, privacy, and access cases should escalate
- straightforward FAQ-style usage questions are the main cases that should reply

## Troubleshooting

### API key not found

```bash
export GROQ_API_KEY="your-key"
echo $GROQ_API_KEY
```

### Invalid API key

- Make sure the key is a valid Groq API key
- Check for extra spaces or quotes

### Script says `Missing --corpus-dir`

- That is expected for model-backed runs
- Provide `--corpus-dir ./support_corpus` with an extracted corpus
- Or use `TRIAGE_RULES_ONLY=1` for the deterministic fallback mode

### Rate limiting

- API latency may temporarily slow processing
- Re-run if needed after a brief wait

### Partial results

- Failed tickets should still appear as `Escalated` with an error reason
- Resume mode skips rows already written to the output CSV
- Use `--no-resume` for a clean rerun

## Next Steps

1. Set your API key
2. Run the agent
3. Review `results.csv`
4. Validate the `Replied` tickets carefully
5. Tune company rules or prompt examples if needed
