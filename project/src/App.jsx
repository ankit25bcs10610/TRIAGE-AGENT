import { useEffect, useRef, useState } from 'react'
import './App.css'

const datasetStats = [
  { label: 'Demo Full-Run Tickets', value: '4', detail: 'starter model-backed input rows' },
  { label: 'Regression Fixtures', value: '20', detail: '11 baseline + 9 high-risk cases' },
  { label: 'Supported Companies', value: '3+1', detail: 'Claude, HackerRank, Visa, Unknown' },
  { label: 'Output Fields', value: '8', detail: 'final CSV export columns' },
]

const files = [
  {
    name: 'support_triage_agent_v2.py',
    caption: 'Core engine',
    description:
      'Python triage script that loads tickets, builds prompts, calls the Groq API, and writes the final CSV output.',
  },
  {
    name: 'support_corpus/README.md',
    caption: 'Corpus guide',
    description:
      'Explains how to build the local corpus using only the approved HackerRank, Claude, and Visa support sources.',
  },
  {
    name: 'support_tickets.csv',
    caption: 'Demo full-run input',
    description:
      'Starter ticket CSV that lets the model-backed command run once real corpus files are added.',
  },
  {
    name: 'sample_support_tickets.csv',
    caption: 'Demo sample set',
    description:
      'Starter labeled examples used to ground the full-run prompt and demonstrate request-type coverage.',
  },
  {
    name: 'starter_tickets.csv',
    caption: 'Starter input',
    description:
      'Bundled template CSV with the expected Issue, Subject, and Company columns.',
  },
  {
    name: 'expected_regression.csv',
    caption: 'Baseline evaluation',
    description:
      'Expected labels for 10 representative regression cases used to verify routing quality.',
  },
  {
    name: 'expected_high_risk_regression.csv',
    caption: 'High-risk evaluation',
    description:
      'Extra regression set focused on sensitive cases that should remain safely escalated.',
  },
]

const companies = [
  {
    name: 'HackerRank',
    share: '20 tickets',
    areas: ['screen', 'community', 'assessment', 'contests', 'billing'],
    reply: 'Feature guidance, navigation questions, challenge usage',
    escalate: 'Score disputes, refunds, locked accounts, cheating concerns',
  },
  {
    name: 'Claude',
    share: '3 tickets',
    areas: ['privacy', 'billing', 'api', 'conversation_management'],
    reply: 'Model usage, SDK setup, conversation guidance',
    escalate: 'Account access, billing surprises, security or data concerns',
  },
  {
    name: 'Visa',
    share: '3 tickets',
    areas: ['travel_support', 'cards', 'fraud', 'disputes'],
    reply: 'General card guidance and standard support flows',
    escalate: 'Fraud, disputes, chargebacks, identity-sensitive requests',
  },
]

const steps = [
  'Load sample answers and ticket queue from CSV files.',
  'Infer the company if the Company field is blank or unknown.',
  'Build a company-specific system prompt with examples and guardrails.',
  'Ask the model to classify the ticket, choose a product area, and draft a response.',
  'Write normalized results to CSV using the required output schema.',
]

const commands = [
  'python3 --version',
  'pip install --break-system-packages groq pandas -q',
  'export GROQ_API_KEY="your-groq-api-key-here"',
  'python3 support_triage_agent_v2.py support_tickets.csv sample_support_tickets.csv your_results.csv --corpus-dir ./support_corpus',
  'TRIAGE_RULES_ONLY=1 python3 support_triage_agent_v2.py starter_tickets.csv "" triage_results.csv',
]

const quickstartSteps = [
  {
    title: 'Set the API key',
    detail: 'Export GROQ_API_KEY before any model-backed run.',
  },
  {
    title: 'Choose a routing mode',
    detail:
      'Use `--corpus-dir` for the full challenge workflow, or `TRIAGE_RULES_ONLY=1` for the deterministic fallback.',
  },
  {
    title: 'Run and review',
    detail:
      'Check the CSV output, then compare it against the bundled regression fixtures when validating changes.',
  },
]

const metrics = [
  { label: 'High-risk tickets should escalate', value: '100%' },
  { label: 'Unknown-company replies should be rare', value: '0%' },
  { label: 'Bug + invalid tickets should escalate', value: '100%' },
  { label: 'Regression labels available in repo', value: '18 cases' },
]

const signalBoard = [
  { label: 'Escalation posture', value: 'Conservative', tone: 'warm' },
  { label: 'Routing mode', value: 'Multi-domain', tone: 'cool' },
  { label: 'Audit trail', value: 'CSV + JSONL', tone: 'warm' },
]

const guardrails = [
  'Never invent policies, refunds, access changes, or undocumented procedures.',
  'Use only the approved support corpus for HackerRank, Claude, and Visa when grounding replies.',
  'Escalate anything involving billing, fraud, legal, compliance, or account modification.',
  'Reply only when the answer is grounded in documented support behavior with high confidence.',
  'Treat uncertainty as a routing signal, not as permission to guess.',
]

const riskLevels = [
  { level: 'High', detail: 'Security, fraud, billing disputes, account access, compliance, sensitive data' },
  { level: 'Medium', detail: 'Outages, unclear bugs, urgent issues, or missing context' },
  { level: 'Low', detail: 'FAQs, feature usage, and clearly documented workflows' },
]

const principles = [
  {
    title: 'Safety-first prompting',
    detail: 'Escalate uncertain or sensitive cases instead of trying to be cleverly helpful.',
  },
  {
    title: 'Explicit constraints',
    detail: 'Forbid promises around refunds, account changes, access grants, and undocumented exceptions.',
  },
  {
    title: 'Structured outputs',
    detail: 'Force JSON-only decisions so routing, logging, and validation stay automated.',
  },
  {
    title: 'Risk over intuition',
    detail: 'Use keywords, sensitive-data checks, and confidence thresholds instead of vague judgment.',
  },
]

const scoringRules = [
  'High-priority keywords like fraud, breach, locked, or critical add strong escalation weight.',
  'Billing, disputes, and payment language should push borderline tickets toward escalation.',
  'Company-specific boosts improve accuracy for HackerRank integrity issues, Claude outages, and Visa compliance topics.',
  'Sensitive data such as card numbers or API keys should trigger automatic escalation.',
]

const validationSets = [
  'FAQ cases like submission steps or API limits should usually reply.',
  'Refunds, fraud reports, locked accounts, and leaked API keys should always escalate.',
  'Spam, empty tickets, and malicious prompts should classify as invalid and escalate.',
  'Unknown-company tickets should still be tested for company detection quality.',
]

const examples = [
  {
    subject: 'Why are my mock interviews not working',
    company: 'HackerRank',
    issue:
      'I cannot launch the mock interview environment before my session. The page loads, then stops responding.',
    status: 'Escalated',
    requestType: 'bug',
    productArea: 'assessment',
    justification:
      'A broken interview environment is a technical failure that may need specialist investigation.',
    response:
      'This looks like a platform issue affecting your interview environment, so it should be escalated to the technical support team for investigation.',
  },
  {
    subject: 'How do I submit my solution?',
    company: 'HackerRank',
    issue:
      'I completed the coding question but I am not sure where to click to submit the final answer.',
    status: 'Replied',
    requestType: 'product_issue',
    productArea: 'screen',
    justification:
      'This is a straightforward usage question with a safe, documented answer.',
    response:
      'Open the challenge, run your code to verify the output, and then use the submit action in the coding interface to send your final solution for evaluation.',
  },
  {
    subject: 'Claude access lost',
    company: 'Claude',
    issue:
      'I lost access to my Claude workspace after an internal change. Can you restore my access?',
    status: 'Escalated',
    requestType: 'product_issue',
    productArea: 'conversation_management',
    justification:
      'Workspace access restoration requires account verification and internal permissions review.',
    response:
      'This request needs account verification and admin-side access checks, so it should be escalated to the team that handles workspace permissions.',
  },
  {
    subject: 'Help',
    company: 'Visa',
    issue:
      'I noticed suspicious transactions on my card while traveling and I need help right away.',
    status: 'Escalated',
    requestType: 'product_issue',
    productArea: 'fraud',
    justification:
      'Suspicious transactions are high risk and always require specialist handling.',
    response:
      'Because this involves potentially unauthorized card activity, the ticket should be escalated immediately to the fraud support team.',
  },
  {
    subject: 'Please add bulk candidate export',
    company: 'HackerRank',
    issue:
      'We would like a feature that exports all candidate scorecards in one CSV instead of downloading them one by one.',
    status: 'Escalated',
    requestType: 'feature_request',
    productArea: 'general_support',
    justification:
      'This is a product enhancement request rather than a documented workflow issue, so it should be routed for human review.',
    response:
      'This looks like a feature request rather than a support issue with a documented answer, so it should be escalated for product-team review.',
  },
]

const assistantPrompts = [
  'How do I run CSV mode?',
  'How do I use chat mode?',
  'What columns should my CSV contain?',
  'Why are rows getting skipped?',
  'What does Escalated mean?',
]

const themes = [
  { value: 'sandstone', label: 'Sandstone' },
  { value: 'midnight', label: 'Midnight' },
  { value: 'graphite', label: 'Graphite Night' },
  { value: 'aurora', label: 'Aurora Dark' },
  { value: 'mint', label: 'Mint Grid' },
  { value: 'sunset', label: 'Sunset Wire' },
]

const defaultCommandBuilder = {
  ticketsPath: '',
  samplePath: '',
  outputPath: '',
}

const troubleshootingTips = [
  {
    title: 'Missing API key',
    detail:
      'Export `GROQ_API_KEY` in the same terminal session, or use `TRIAGE_RULES_ONLY=1` if you only want deterministic routing.',
  },
  {
    title: 'Rows are skipped',
    detail:
      'Resume mode found matching rows in the existing output CSV. Use `--no-resume` for a clean rerun.',
  },
  {
    title: 'CSV will not load',
    detail:
      'Check that the ticket CSV includes `Issue` and `Subject`, and that your file path is quoted if it contains spaces.',
  },
  {
    title: 'Challenge run exits immediately',
    detail:
      'Model-backed processing requires `--corpus-dir` unless you explicitly enable the rules-only fallback mode.',
  },
  {
    title: 'No corpus evidence found',
    detail:
      'If the agent cannot retrieve relevant same-company support content from the approved corpus, it will escalate instead of replying.',
  },
  {
    title: 'Rate limit errors',
    detail:
      'Use the lighter Groq model, rerun after cooldown, or switch to rules-only mode for a conservative fallback.',
  },
]

const resultExplainer = [
  {
    label: 'Replied',
    detail: 'The agent found a low-risk answer pattern and felt safe returning a direct response.',
  },
  {
    label: 'Escalated',
    detail: 'The issue looked risky, vague, unsupported, or sensitive enough to require human review.',
  },
  {
    label: 'product_issue',
    detail: 'A valid support request about workflow, access, billing, policy, or product behavior.',
  },
  {
    label: 'feature_request',
    detail: 'A request for new functionality or product enhancement that should be routed rather than answered as an FAQ.',
  },
  {
    label: 'bug',
    detail: 'A platform failure, outage, or technical malfunction that likely needs specialist investigation.',
  },
  {
    label: 'invalid',
    detail: 'A malicious, harmful, empty, or clearly off-scope request that should not be answered normally.',
  },
]

const assistantKnowledge = [
  {
    match: ['csv mode', 'run csv', 'batch'],
    answer:
      'Use CSV mode when you want to process a whole ticket file at once. Export GROQ_API_KEY, then run the Python script with input CSV, sample CSV, output CSV, and `--corpus-dir` unless you are using rules-only fallback.',
  },
  {
    match: ['corpus', 'support sources', 'approved sources', 'hackerrank support', 'claude help center', 'visa support'],
    answer:
      'Use only the approved support corpus sources: HackerRank Support, Claude Help Center, and Visa Support. If relevant corpus evidence is missing for a ticket, the agent should escalate rather than guess.',
  },
  {
    match: ['chat mode', 'interactive', 'normal conversation'],
    answer:
      'Use chat mode when you want to triage one issue at a time in the terminal. Run `python3 support_triage_agent_v2.py --chat [sample_csv]`, then enter an issue and optionally set `/company` or `/subject`.',
  },
  {
    match: ['columns', 'csv contain', 'headers', 'format'],
    answer:
      'The ticket CSV should include `Issue`, `Subject`, and optionally `Company`. The bundled starter template already uses that schema.',
  },
  {
    match: ['skipped', 'skip completed', 'resume'],
    answer:
      'Skipped rows usually mean resume mode found matching tickets in the existing output CSV. If you want a clean rerun, use the `--no-resume` flag.',
  },
  {
    match: ['escalated', 'escalate'],
    answer:
      'Escalated means the agent decided the ticket should be handed to a human specialist instead of answered automatically. This usually happens for risky, sensitive, vague, or unsupported cases.',
  },
  {
    match: ['api key', 'groq'],
    answer:
      'Set your key in the terminal before running the agent: `export GROQ_API_KEY="your-key"` or prefix the command with `GROQ_API_KEY="your-key"`.',
  },
]

function answerAssistant(question) {
  const normalized = question.toLowerCase()
  const entry = assistantKnowledge.find((item) =>
    item.match.some((phrase) => normalized.includes(phrase)),
  )

  if (entry) {
    return entry.answer
  }

  return 'Ask about CSV mode, chat mode, CSV columns, skipped rows, Escalated status, or API key setup. This helper is focused on using the triage project rather than answering general questions.'
}

function quotePath(path) {
  if (!path.trim()) {
    return '"/path/to/file.csv"'
  }

  return `"${path.trim().replaceAll('"', '\\"')}"`
}

function statusTone(status) {
  return status === 'Replied' ? 'good' : 'alert'
}

function App() {
  const [theme, setTheme] = useState(() => window.localStorage.getItem('triage-theme') || 'sandstone')
  const [assistantInput, setAssistantInput] = useState('')
  const [assistantMessages, setAssistantMessages] = useState([
    {
      role: 'assistant',
      text: 'Ask how to run the agent, which mode to use, what CSV format is expected, or why a run behaved a certain way.',
    },
  ])
  const [isListening, setIsListening] = useState(false)
  const [voiceSupported] = useState(
    () => Boolean(window.SpeechRecognition || window.webkitSpeechRecognition),
  )
  const [speechSupported] = useState(() => 'speechSynthesis' in window)
  const [copiedItem, setCopiedItem] = useState('')
  const [commandBuilder, setCommandBuilder] = useState(defaultCommandBuilder)
  const recognitionRef = useRef(null)
  const copyTimerRef = useRef(null)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    window.localStorage.setItem('triage-theme', theme)
  }, [theme])

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognition) {
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    recognition.onstart = () => setIsListening(true)
    recognition.onend = () => setIsListening(false)
    recognition.onerror = () => setIsListening(false)
    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript?.trim() || ''
      if (transcript) {
        setAssistantInput(transcript)
      }
    }

    recognitionRef.current = recognition

    return () => {
      recognition.stop()
      recognitionRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) {
        window.clearTimeout(copyTimerRef.current)
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  function submitAssistant(question) {
    const trimmed = question.trim()
    if (!trimmed) {
      return
    }

    setAssistantMessages((current) => [
      ...current,
      { role: 'user', text: trimmed },
      { role: 'assistant', text: answerAssistant(trimmed) },
    ])
    setAssistantInput('')
  }

  function toggleVoiceInput() {
    if (!recognitionRef.current) {
      return
    }

    if (isListening) {
      recognitionRef.current.stop()
      return
    }

    recognitionRef.current.start()
  }

  async function copyText(key, value) {
    if (!navigator.clipboard?.writeText) {
      return
    }

    await navigator.clipboard.writeText(value)
    setCopiedItem(key)

    if (copyTimerRef.current) {
      window.clearTimeout(copyTimerRef.current)
    }

    copyTimerRef.current = window.setTimeout(() => {
      setCopiedItem('')
    }, 1800)
  }

  function speakText(value) {
    if (!('speechSynthesis' in window) || !value) {
      return
    }

    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(value)
    utterance.rate = 1
    utterance.pitch = 1
    window.speechSynthesis.speak(utterance)
  }

  function updateCommandField(field, value) {
    setCommandBuilder((current) => ({
      ...current,
      [field]: value,
    }))
  }

  function handleCsvPick(field, event) {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    updateCommandField(field, file.name)
  }

  const generatedRunCommand = `GROQ_API_KEY="your-groq-api-key" python3 support_triage_agent_v2.py \\
  ${quotePath(commandBuilder.ticketsPath)} \\
  ${quotePath(commandBuilder.samplePath)} \\
  ${quotePath(commandBuilder.outputPath)}`

  return (
    <main className="app-shell">
      <section className="masthead-bar">
        <div className="masthead-copy">
          <span className="eyebrow">Terminal-first workflow</span>
          <p>Designed for conservative routing, auditable outputs, and fast handoff from raw CSVs to review-ready triage decisions.</p>
        </div>
        <div className="masthead-actions">
          <label className="theme-switcher">
            <span>Theme</span>
            <select value={theme} onChange={(event) => setTheme(event.target.value)}>
              {themes.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <nav className="top-nav" aria-label="Section navigation">
            <a href="#runbook">Runbook</a>
            <a href="#simulator">Simulator</a>
            <a href="#quality-targets">Quality</a>
          </nav>
        </div>
      </section>

      <section className="hero-panel">
        <div className="hero-orbit hero-orbit-one" aria-hidden="true" />
        <div className="hero-orbit hero-orbit-two" aria-hidden="true" />
        <div className="eyebrow">Support triage project</div>
        <div className="hero-grid">
          <div>
            <h1 className="hero-title">Build and run an AI support triage workflow from CSV to final decision.</h1>
            <p className="hero-copy">
              This interface packages your prompt into a clean project brief: what
              data you have, how the agent should behave, how to run it, what output
              to expect, and which tickets should be replied to versus escalated.
            </p>
            <div className="hero-actions">
              <a href="#runbook" className="primary-action">
                Open runbook
              </a>
              <a href="#simulator" className="secondary-action">
                Try simulator
              </a>
            </div>
            <div className="hero-badges">
              <span>Terminal based</span>
              <span>CSV in, CSV out</span>
              <span>Conservative by design</span>
            </div>
            <div className="signal-board">
              {signalBoard.map((item) => (
                <article key={item.label} className={`signal-chip ${item.tone}`}>
                  <small>{item.label}</small>
                  <strong>{item.value}</strong>
                </article>
              ))}
            </div>
          </div>

          <div className="snapshot-card">
            <div className="snapshot-header">
              <span>Queue snapshot</span>
              <span className="live-pill">Ready</span>
            </div>
            <div className="snapshot-list">
              {datasetStats.map((item) => (
                <article key={item.label} className="stat-tile">
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                  <small>{item.detail}</small>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <span>Data overview</span>
          <h2>Everything the agent receives before it makes a triage call.</h2>
        </div>
        <div className="file-grid">
          {files.map((file) => (
            <article key={file.name} className="info-card">
              <p className="card-tag">{file.caption}</p>
              <h3>{file.name}</h3>
              <p>{file.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-block assistant-panel">
        <div className="section-heading">
          <span>Help assistant</span>
          <h2>Ask how to use the agent, which mode to run, or what input format it expects.</h2>
        </div>
        <div className="assistant-layout">
          <div className="assistant-conversation" aria-live="polite">
            {assistantMessages.map((message, index) => (
              <article
                key={`${message.role}-${index}`}
                className={`assistant-bubble ${message.role}`}
              >
                <small>{message.role === 'assistant' ? 'Guide' : 'You'}</small>
                <p>{message.text}</p>
                <div className="assistant-bubble-actions">
                  <button
                    type="button"
                    className="assistant-mini-action"
                    onClick={() => copyText(`message-${index}`, message.text)}
                  >
                    {copiedItem === `message-${index}` ? 'Copied' : 'Copy'}
                  </button>
                  {message.role === 'assistant' && speechSupported ? (
                    <button
                      type="button"
                      className="assistant-mini-action"
                      onClick={() => speakText(message.text)}
                    >
                      Speak
                    </button>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
          <div className="assistant-controls">
            <div className="assistant-chip-row">
              {assistantPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  className="assistant-chip"
                  onClick={() => submitAssistant(prompt)}
                >
                  {prompt}
                </button>
              ))}
            </div>
            <div className="assistant-tools-row">
              <article className="assistant-tool-card">
                <small>Input</small>
                <strong>Type or speak</strong>
                <span>Ask setup questions in natural language.</span>
              </article>
              <article className="assistant-tool-card">
                <small>Command</small>
                <strong>Build terminal run</strong>
                <span>Generate a copy-ready command from your CSV paths.</span>
              </article>
              <article className="assistant-tool-card">
                <small>Output</small>
                <strong>Explain results</strong>
                <span>Understand `Escalated`, `bug`, and `product_issue` faster.</span>
              </article>
            </div>
            <div className="assistant-input-row">
              <input
                className="assistant-input"
                type="text"
                value={assistantInput}
                onChange={(event) => setAssistantInput(event.target.value)}
                placeholder="Ask how to run CSV mode, chat mode, or inspect a dataset..."
              />
              {voiceSupported ? (
                <button
                  type="button"
                  className={`secondary-action voice-toggle ${isListening ? 'active' : ''}`}
                  onClick={toggleVoiceInput}
                >
                  {isListening ? 'Listening...' : 'Voice'}
                </button>
              ) : null}
              <button
                type="button"
                className="primary-action assistant-send"
                onClick={() => submitAssistant(assistantInput)}
              >
                Ask
              </button>
            </div>
            <div className="assistant-builder">
              <div className="assistant-builder-head">
                <div>
                  <span className="builder-eyebrow">Terminal helper</span>
                  <h3>Generate terminal command</h3>
                  <p>Paste full CSV paths or pick local files to build a ready-to-run command.</p>
                </div>
                <button
                  type="button"
                  className="assistant-mini-action"
                  onClick={() => setCommandBuilder(defaultCommandBuilder)}
                >
                  Reset
                </button>
              </div>
              <div className="builder-grid">
                <label className="builder-field">
                  <span>Tickets CSV path</span>
                  <input
                    className="assistant-input"
                    type="text"
                    value={commandBuilder.ticketsPath}
                    onChange={(event) => updateCommandField('ticketsPath', event.target.value)}
                    placeholder="/Users/you/Downloads/starter_tickets.csv"
                  />
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(event) => handleCsvPick('ticketsPath', event)}
                  />
                </label>
                <label className="builder-field">
                  <span>Sample CSV path</span>
                  <input
                    className="assistant-input"
                    type="text"
                    value={commandBuilder.samplePath}
                    onChange={(event) => updateCommandField('samplePath', event.target.value)}
                    placeholder="/Users/you/Downloads/sample_support_tickets.csv"
                  />
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(event) => handleCsvPick('samplePath', event)}
                  />
                </label>
                <label className="builder-field">
                  <span>Output CSV path</span>
                  <input
                    className="assistant-input"
                    type="text"
                    value={commandBuilder.outputPath}
                    onChange={(event) => updateCommandField('outputPath', event.target.value)}
                    placeholder="/Users/you/Downloads/output.csv"
                  />
                </label>
              </div>
              <div className="builder-command-shell">
                <div className="builder-command-head">
                  <span className="builder-terminal-dot red" />
                  <span className="builder-terminal-dot amber" />
                  <span className="builder-terminal-dot green" />
                  <strong>Run in Terminal</strong>
                </div>
                <code className="command-line builder-command">{generatedRunCommand}</code>
                <button
                  type="button"
                  className="command-copy"
                  onClick={() => copyText('generated-command', generatedRunCommand)}
                >
                  {copiedItem === 'generated-command' ? 'Copied' : 'Copy command'}
                </button>
              </div>
              <p className="builder-note">
                Picked files can only provide the file name in-browser. Replace that with the full terminal path if the CSV is not already in your project folder.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <span>Company rules</span>
          <h2>Each company uses different product areas and different escalation triggers.</h2>
        </div>
        <div className="company-grid">
          {companies.map((company) => (
            <article key={company.name} className="company-card">
              <div className="company-topline">
                <div>
                  <p className="card-tag">Domain profile</p>
                  <h3>{company.name}</h3>
                </div>
                <span className="company-share">{company.share}</span>
              </div>
              <p className="company-brief">
                <strong>Reply when:</strong> {company.reply}
              </p>
              <p className="company-brief">
                <strong>Escalate when:</strong> {company.escalate}
              </p>
              <div className="pill-row">
                {company.areas.map((area) => (
                  <span key={area} className="area-pill">
                    {area}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section-block dual-layout">
        <div>
          <div className="section-heading">
            <span>Policy core</span>
            <h2>The system prompt makes the agent conservative, grounded, and auditable.</h2>
          </div>
          <div className="policy-list">
            {guardrails.map((rule) => (
              <article key={rule} className="policy-card">
                <p>{rule}</p>
              </article>
            ))}
          </div>
        </div>
        <div className="schema-card">
          <h3>Risk routing</h3>
          <div className="risk-grid">
            {riskLevels.map((risk) => (
              <article key={risk.level} className="risk-card">
                <strong>{risk.level}</strong>
                <p>{risk.detail}</p>
              </article>
            ))}
          </div>
          <p>
            The full prompt reference lives in <strong>SYSTEM_PROMPT_GUIDE.md</strong>
            and defines authority, escalation rules, output schema, and response standards.
          </p>
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <span>Engineering guide</span>
          <h2>Prompt quality comes from strong structure, hard boundaries, and measurable validation.</h2>
        </div>
        <div className="principle-grid">
          {principles.map((principle) => (
            <article key={principle.title} className="info-card">
              <h3>{principle.title}</h3>
              <p>{principle.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-block dual-layout">
        <div className="schema-card">
          <h3>Risk scoring model</h3>
          <div className="policy-list">
            {scoringRules.map((rule) => (
              <article key={rule} className="policy-card">
                <p>{rule}</p>
              </article>
            ))}
          </div>
        </div>
        <div className="schema-card">
          <h3>Validation framework</h3>
          <div className="policy-list">
            {validationSets.map((item) => (
              <article key={item} className="policy-card">
                <p>{item}</p>
              </article>
            ))}
          </div>
          <p>
            The detailed reference for these practices is included in{' '}
            <strong>PROMPT_ENGINEERING_GUIDE.md</strong>.
          </p>
        </div>
      </section>

      <section className="section-block flow-layout">
        <div className="section-heading">
          <span>Workflow</span>
          <h2>How the triage agent turns raw tickets into structured output.</h2>
        </div>
        <div className="steps-column">
          {steps.map((step, index) => (
            <article key={step} className="step-card">
              <div className="step-index">0{index + 1}</div>
              <p>{step}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <span>Quick start</span>
          <h2>Three steps to go from raw tickets to a completed results file.</h2>
        </div>
        <div className="steps-column quickstart-grid">
          {quickstartSteps.map((step, index) => (
            <article key={step.title} className="step-card">
              <div className="step-index">0{index + 1}</div>
              <h3>{step.title}</h3>
              <p>{step.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-block" id="runbook">
        <div className="section-heading">
          <span>Runbook</span>
          <h2>Use these commands to run the agent end to end.</h2>
        </div>
        <div className="dual-layout">
          <div className="terminal-window">
            <div className="terminal-header">
              <div className="terminal-dots">
                <span className="dot red"></span>
                <span className="dot amber"></span>
                <span className="dot green"></span>
              </div>
              <span className="terminal-title">bash - support_triage_runbook</span>
            </div>
            <div className="terminal-body">
              {commands.map((command, index) => (
                <div key={command} className="terminal-row">
                  <div className="terminal-prompt-prefix">
                    <span className="terminal-prompt">$</span>
                    <code className="terminal-line">{command}</code>
                  </div>
                  <button
                    type="button"
                    className="terminal-copy-btn"
                    onClick={() => copyText(`command-${index}`, command)}
                  >
                    {copiedItem === `command-${index}` ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="documentation-pane">
            <div className="doc-section">
              <span className="doc-eyebrow">Script Info</span>
              <h3>Included Python script</h3>
              <p>
                The workspace contains <strong>support_triage_agent_v2.py</strong>,
                the complete Python workflow that performs prompt construction, company
                detection, resume handling, JSONL audit logging, Groq API calls, and CSV export.
              </p>
            </div>

            <div className="doc-section">
              <span className="doc-eyebrow">Data Schema</span>
              <h3>Expected output CSV fields</h3>
              <div className="schema-grid">
                {[
                  'issue',
                  'subject',
                  'company',
                  'response',
                  'product_area',
                  'status',
                  'request_type',
                  'justification',
                ].map((field) => (
                  <span key={field} className="schema-tag">{field}</span>
                ))}
              </div>
              <p>
                `status` must be <strong>Replied</strong> or <strong>Escalated</strong>.
                `request_type` may be <strong>product_issue</strong>,{' '}
                <strong>feature_request</strong>, <strong>bug</strong>, or <strong>invalid</strong>.
              </p>
              <p className="doc-footer-hint">
                Model-backed runs also require a support corpus directory unless you intentionally switch to rules-only mode.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-block" id="quality-targets">
        <div className="section-heading">
          <span>Quality targets</span>
          <h2>Benchmarks to review after any full triage run.</h2>
        </div>
        <div className="metric-grid">
          {metrics.map((metric) => (
            <article key={metric.label} className="metric-card">
              <strong>{metric.value}</strong>
              <span>{metric.label}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="section-block dual-layout">
        <div className="schema-card">
          <div className="section-heading compact-heading">
            <span>Troubleshooting</span>
            <h2>Fast fixes for the problems users hit most often during setup and reruns.</h2>
          </div>
          <div className="policy-list">
            {troubleshootingTips.map((tip) => (
              <article key={tip.title} className="policy-card">
                <h3>{tip.title}</h3>
                <p>{tip.detail}</p>
              </article>
            ))}
          </div>
        </div>
        <div className="schema-card">
          <div className="section-heading compact-heading">
            <span>Result explainer</span>
            <h2>Make the output labels understandable before someone reviews the final CSV.</h2>
          </div>
          <div className="policy-list">
            {resultExplainer.map((item) => (
              <article key={item.label} className="policy-card">
                <h3>{item.label}</h3>
                <p>{item.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-block" id="simulator">
        <div className="section-heading">
          <span>Simulator</span>
          <h2>Representative examples of how the triage outcome should look.</h2>
        </div>
        <div className="example-list">
          {examples.map((ticket) => (
            <article key={ticket.subject} className="example-card">
              <div className="example-head">
                <div>
                  <p className="card-tag">{ticket.company}</p>
                  <h3>{ticket.subject}</h3>
                </div>
                <div className={`status-chip ${statusTone(ticket.status)}`}>
                  {ticket.status}
                </div>
              </div>
              <p className="ticket-copy">{ticket.issue}</p>
              <div className="ticket-meta">
                <span>{ticket.requestType}</span>
                <span>{ticket.productArea}</span>
              </div>
              <div className="example-outcome-block">
                <p>
                  <strong>Justification:</strong> {ticket.justification}
                </p>
                <p>
                  <strong>Response:</strong> {ticket.response}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section-block footer-note">
        <div className="footer-grid">
          <div className="section-heading">
            <span>Next step</span>
            <h2>Move from setup to a finished triage run in one clean pass.</h2>
            <p className="footer-copy">
              Start with credentials, execute the agent, inspect the output CSV,
              and then tighten routing rules only where the review shows risk.
            </p>
          </div>
          <div className="footer-actions-panel">
            <div className="footer-action-list">
              <article className="footer-action-card">
                <strong>1. Export key</strong>
                <span>Authenticate the Groq-powered run.</span>
              </article>
              <article className="footer-action-card">
                <strong>2. Launch triage</strong>
                <span>Process your full ticket set end to end.</span>
              </article>
              <article className="footer-action-card">
                <strong>3. Review output</strong>
                <span>Audit statuses, request types, and justifications.</span>
              </article>
            </div>
            <div className="footer-cta-row">
              <a href="#runbook" className="primary-action">
                Open commands
              </a>
              <a href="#quality-targets" className="secondary-action footer-secondary">
                Check benchmarks
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default App
