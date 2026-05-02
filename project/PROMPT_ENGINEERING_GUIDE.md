# The Best Prompt for Support Triage Agents - Engineering Guide

## Executive Summary

An effective support triage prompt needs:

- clear role definition
- explicit decision authority
- company-specific context
- escalation triggers
- structured output requirements
- safety guardrails
- a risk assessment framework

This guide explains how to design, validate, and continuously improve a triage prompt for multi-company support workflows.

## Part 1: Prompt Structure

Every high-quality triage prompt should include:

1. Role and identity
2. Constraints and guardrails
3. Decision framework
4. Company-specific context
5. Risk assessment
6. Output specification
7. Examples

Why this works:

- clarity improves consistency
- constraints reduce unsafe behavior
- examples improve auditability
- company-specific rules prevent generic routing mistakes

## Part 2: Core Prompting Principles

### Safety first

Prefer escalation over guessing when tickets involve uncertainty, sensitive data, billing, account changes, fraud, or policy interpretation.

### Explicit constraints

State what the model must never do:

- promise refunds
- modify accounts
- invent exceptions
- guess undocumented policies

### Decision trees over prose

Use clear if/then style rules so escalation logic is easier to follow and verify.

### Output structure before style

Require JSON-only responses so decisions can be validated and logged automatically.

### Risk indicators over vague intuition

Define keywords, patterns, and data signals that trigger escalation.

## Part 3: Company-Specific Prompt Engineering

### HackerRank

Escalate:

- score disputes
- cheating or fairness issues
- billing or refund requests
- locked or suspended accounts

Reply:

- submission flow
- language support
- challenge clarification
- basic navigation

### Claude

Escalate:

- API key compromise
- billing disputes
- production outages
- retention or deletion requests
- enterprise, SLA, or legal matters

Reply:

- model usage questions
- SDK setup
- token and rate-limit explanations
- prompt engineering guidance

### Visa

Escalate:

- fraud
- chargebacks
- compliance requests
- settlement issues
- cardholder data exposure

Reply:

- public card feature questions
- general payment flow explanations
- documented integration questions

## Part 4: Risk Scoring System

Suggested scoring:

- high-priority signals like `fraud`, `breach`, `critical`, `locked`: +2
- medium-priority signals like `refund`, `billing`, `dispute`: +1
- general technical failure signals like `error`, `not working`: +0.5

Company-specific boosts:

- HackerRank: `cheating`, `unfair`
- Claude: `production`, `outage`
- Visa: `pci`, `compliance`, `regulation`

Sensitive data:

- card numbers, CVV, API keys, passwords should auto-escalate

Suggested thresholds:

- score >= 3: high risk
- score 1-2: medium risk
- score 0: low risk

## Part 5: Output Engineering

Machine-readable output should include:

- `status`
- `request_type`
- `product_area`
- `response`
- `justification`
- `confidence`
- `risk_level`

Validation examples:

```python
assert output["status"] in ["replied", "escalated"]
assert output["request_type"] in ["product_issue", "bug", "feature_request", "invalid"]
assert 0.0 <= output["confidence"] <= 1.0
assert output["risk_level"] in ["low", "medium", "high"]
```

## Part 6: Common Mistakes

Avoid:

- overly flexible prompts
- vague escalation criteria
- prompts with no examples
- trusting the model to infer policy safely
- weak output formatting requirements

## Part 7: Optimization Techniques

Useful patterns:

- positive framing of constraints
- multi-step reasoning
- confidence-based routing
- company-specific prompt variants
- dynamic context injection

## Part 8: Testing and Validation

Include test sets for:

- simple FAQs
- clear escalations
- invalid inputs
- company detection
- confidence calibration

Track:

- status accuracy
- request-type accuracy
- escalation rate

## Part 9: Adaptation

Possible deployment modes:

- simple prompts for small teams
- more structured prompts for enterprise workflows
- hybrid heuristics plus API calls for cost-sensitive setups

## Part 10: Continuous Improvement

Use a feedback loop:

1. run the agent
2. collect human corrections
3. find false replies and false escalations
4. refine keywords, examples, and thresholds
5. test again

## Quick Checklist

Before shipping, confirm:

- role is explicit
- constraints are explicit
- escalation rules are explicit
- company rules are present
- risk scoring exists
- output schema is validated
- examples are included
- confidence thresholds are clear
- test cases exist
- metrics are defined
