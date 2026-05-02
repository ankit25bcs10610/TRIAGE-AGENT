## Support Corpus

Build this folder from the approved support sources only:

- HackerRank Support: https://support.hackerrank.com/
- Claude Help Center: https://support.claude.com/en/
- Visa Support: https://www.visa.co.in/support.html

Recommended layout:

- `support_corpus/hackerrank/`
- `support_corpus/claude/`
- `support_corpus/visa/`

Put exported `.md`, `.txt`, `.html`, or `.csv` support content under those folders.

Important rules:

- Do not mix in outside notes, blogs, or undocumented internal knowledge.
- Keep the source site name in the file path or file content where possible so the agent can detect company ownership correctly.
- If the relevant corpus evidence is missing, the agent will escalate instead of answering from memory.

Suggested evaluator-ready structure:

```text
support_corpus/
  hackerrank/
    README.md
    account-access.md
    assessments.md
  claude/
    README.md
    api-usage.md
    billing-and-privacy.md
  visa/
    README.md
    disputes.md
    card-support.md
```

Once the real files are added, the evaluator can run:

```bash
GROQ_API_KEY="their-key" npm run demo:full
```
