# Claude Rate Limits

Source site: https://support.claude.com/en/
Company: Claude
Topic: Token usage, limits, and related troubleshooting

## Suggested source article(s)

- Claude API and Console rate-limit topics
- Usage-limit help pages

## Extracted support content

- The Claude Help Center `Claude API and Console` collection includes official topics about rate limits, including an article about Anthropic’s approach to rate limits for the Claude API.
- The official rate-limit article says usage limits are measured in three metrics: requests per minute, input tokens per minute, and output tokens per minute.
- The same article says exceeding any of those limits results in a 429 error and includes a `retry-after` header telling the client how long to wait.
- It also says rate limits are defined at the organization level and depend on usage tier, with automatic tier advancement based on usage thresholds up to Tier 4.
- The article says organizations can view their current tier and limits in the Claude Console.
- The same collection also includes troubleshooting for 429 errors and guidance about advancing Claude API usage tiers.
- This supports safe replies that explain that rate-limit and usage-tier questions have official documentation and should follow the documented console/API guidance.
- It also supports escalation or cautious handling when a user asks for unsupported guarantees or account-side changes related to limits or billing.

## Notes for the evaluator

- Keep this file specific to limits, quotas, and usage troubleshooting.

## Source notes

- Official collection used: `Claude API and Console`
- Source URL: https://support.claude.com/en/collections/5370014-claude-api-and-console
- Official article used: `Our approach to rate limits for the Claude API`
- Source URL: https://support.claude.com/en/articles/8243635-our-approach-to-api-rate-limits
