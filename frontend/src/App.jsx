import { useState, useRef, useEffect } from 'react';
import ChatMessage from './components/ChatMessage';
import TypingIndicator from './components/TypingIndicator';

const formatTime = (isoString) => {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return '';
  }
};

function App() {
  // ── Form State ───────────────────────────────────────────────
  const [formData, setFormData] = useState({
    patientName: '',
    disease: '',
    intent: '',
    location: '',
  });

  // ── Chat State ───────────────────────────────────────────────
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0); // 0: Searching publications, 1: Fetching trials, 2: Preparing response
  const [status, setStatus] = useState(null); // { type: 'success' | 'error', text: '' }

  const messagesEndRef = useRef(null);
  const chatInputRef = useRef(null);

  // ── Auto‑scroll to latest message ────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // ── Form Handlers ────────────────────────────────────────────
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!formData.disease.trim()) {
      setStatus({ type: 'error', text: 'Please enter a disease of interest.' });
      return;
    }

    const initialMessage =
      `Patient: ${formData.patientName || 'Anonymous'}. ` +
      `Researching: ${formData.disease}. ` +
      (formData.intent ? `Intent: ${formData.intent}. ` : '') +
      (formData.location ? `Location: ${formData.location}.` : '');

    await sendMessage(initialMessage);
  };

  const handleClearForm = () => {
    setFormData({ patientName: '', disease: '', intent: '', location: '' });
    setMessages([]);
    setSessionId(null);
    setStatus(null);
    setChatInput('');
  };

  // ── Chat Handlers ────────────────────────────────────────────
  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || isLoading) return;
    await sendMessage(chatInput);
    setChatInput('');
  };

  const sendMessage = async (messageText, overrideFormData = null) => {
    setIsLoading(true);
    setStatus(null);

    // Optimistically add user message
    const userMsg = {
      role: 'user',
      content: messageText,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);

    const activeFormData = overrideFormData || formData;

    try {
      setLoadingStep(0);

      const baseUrl = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://curalink-odoe.onrender.com' : '');
      const res = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          patientName: activeFormData.patientName,
          disease: activeFormData.disease,
          intent: activeFormData.intent,
          location: activeFormData.location,
          message: messageText,
        }),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      setLoadingStep(1);
      const data = await res.json();
      setSessionId(data.sessionId);

      await new Promise(r => setTimeout(r, 600));
      setLoadingStep(2);
      await new Promise(r => setTimeout(r, 800));

      const assistantMsg = {
        role: 'assistant',
        content: data.reply,
        timestamp: new Date().toISOString(),
        metadata: {
          studiesFound: data.studiesFound,
          trialsFound: data.trialsFound,
          topPublication: data.topPublication,
          topTrial: data.topTrial,
          context: {
            disease: activeFormData.disease,
            intent: activeFormData.intent,
            location: activeFormData.location,
          }
        }
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setStatus({ type: 'success', text: 'Connected to Curalink API' });
    } catch (err) {
      console.error('Chat error:', err);
      setStatus({ type: 'error', text: `Connection failed — ${err.message}` });

      const fallbackMsg = {
        role: 'assistant',
        content:
          'I\'m currently unable to reach the server. Please ensure the backend is running and try again.',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
      setLoadingStep(0);
      chatInputRef.current?.focus();
    }
  };

  const suggestions = [
    { patientName: 'Pt-1042', disease: 'Type 2 Diabetes', location: 'New York, USA', intent: 'Latest therapies' },
    { patientName: 'Pt-2209', disease: "Crohn's Disease", location: 'Chicago, USA', intent: 'Phase 3 trials' },
    { patientName: 'Anonymous', disease: 'Glioblastoma', location: 'Boston, USA', intent: 'Immunotherapies' }
  ];

  const handleSuggestionClick = async (sug) => {
    const updatedForm = {
      patientName: sug.patientName,
      disease: sug.disease,
      location: sug.location,
      intent: sug.intent
    };
    setFormData(updatedForm);
    const initialMessage =
      `Patient: ${sug.patientName || 'Anonymous'}. ` +
      `Researching: ${sug.disease}. ` +
      (sug.intent ? `Intent: ${sug.intent}. ` : '') +
      (sug.location ? `Location: ${sug.location}.` : '');

    await sendMessage(initialMessage, updatedForm);
  };

  // ═══════════════════════════════════════════════════════════════
  //  Render
  // ═══════════════════════════════════════════════════════════════
  return (
    <>
      {/* ── Background Aesthetics ────────────────────────────────── */}
      <div className="ambient ambient-pink" aria-hidden="true"></div>
      <div className="ambient ambient-lavender" aria-hidden="true"></div>
      <div className="ambient ambient-yellow" aria-hidden="true"></div>
      <div className="grain" aria-hidden="true"></div>

      {/* ── Header Pill ─────────────────────────────────────────── */}
      <header className="site-header">
        <a href="/" className="brand" aria-label="Curalink Clinical Intelligence Home">
          <div className="brand-mark">CL</div>
          <div className="brand-info">
            <span className="brand-name">Curalink</span>
            <small className="brand-subtitle">Clinical Intelligence</small>
          </div>
        </a>
        <nav className="site-nav" aria-label="Primary navigation">
          <a href="#workspace">Workspace</a>
          <a href="#features">Features</a>
          <a href="#workspace" className="nav-pill">Clinical Portal</a>
        </nav>
      </header>

      <main>
        {/* ── Hero Section ──────────────────────────────────────── */}
        <section className="hero-section">
          <div className="hero-copy">
            <p className="eyebrow">Curalink Medical Intelligence</p>
            <h1>Clinical research, matching trials, and literature.</h1>
            <p className="hero-lede">
              A dashboard of active clinical trials, recent publications, and treatment pathways — plus Curalink Assistant, your companion for patient research.
            </p>
            <div className="hero-actions">
              <a href="#workspace" className="button primary">Start Research</a>
              <a href="#features" className="button secondary">Explore Features</a>
            </div>
          </div>
          <div className="hero-visual" aria-label="Curalink system preview">
            <div className="orbit-card orbit-one">PubMed</div>
            <div className="orbit-card orbit-two">ClinicalTrials.gov</div>
            <div className="orbit-card orbit-three">AI Analysis</div>
            <div className="nest-card">
              <div className="nest-face" aria-hidden="true">
                <svg className="pulse-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </div>
              <p>Research Companion</p>
              <strong>Publications. Clinical Trials. Treatment Options. One place to start.</strong>
              <div className="mood-meter" aria-hidden="true">
                <span style={{ '--height': '44%' }}></span>
                <span style={{ '--height': '70%' }}></span>
                <span style={{ '--height': '56%' }}></span>
                <span style={{ '--height': '88%' }}></span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Services / Features Section ────────────────────────── */}
        <section className="section-shell intro-grid" id="features" aria-label="Capabilities">
          <article className="glass-card feature-card">
            <span className="card-icon">01</span>
            <h2>Condition Overview</h2>
            <p>Retrieve structured medical definitions, standard of care protocols, and AI-synthesized research summaries.</p>
          </article>
          <article className="glass-card feature-card">
            <span className="card-icon">02</span>
            <h2>Trial Matching</h2>
            <p>Scan ClinicalTrials.gov automatically for recruiting studies, filtering by geographic proximity and phases.</p>
          </article>
          <article className="glass-card feature-card">
            <span className="card-icon">03</span>
            <h2>Literature Search</h2>
            <p>Extract direct publication records, authors, dates, and reference links from recent PubMed literature databases.</p>
          </article>
        </section>

        {/* ── Workspace Section ─────────────────────────────────── */}
        <section className="section-shell workspace-section" id="workspace" aria-label="Workspace">
          {/* Left Column: Info & Context Form */}
          <div className="workspace-copy">
            <p className="eyebrow">Workspace</p>
            <h2>Patient Context</h2>
            <p>Define your patient's symptoms, geographical location, and clinical intent. The AI compiles publication databases and recruiting trials to compile a structured report.</p>

            <div className="safety-card">
              <strong>Clinical Assistant Disclaimer</strong>
              <p>Curalink is an informational research assistant. It is not a diagnostic tool and does not provide formal medical advice or diagnosis.</p>
            </div>

            {/* Patient Form Card */}
            <div className="form-card" id="patient-form">
              <form onSubmit={handleFormSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="patientName">Patient Identifier (Optional)</label>
                    <input
                      id="patientName"
                      name="patientName"
                      type="text"
                      placeholder="e.g. Pt-1042"
                      value={formData.patientName}
                      onChange={handleFormChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="disease">Primary Condition / Disease</label>
                    <input
                      id="disease"
                      name="disease"
                      type="text"
                      placeholder="e.g. Type 2 Diabetes"
                      value={formData.disease}
                      onChange={handleFormChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="location">Geographic Focus (for Trials)</label>
                    <input
                      id="location"
                      name="location"
                      type="text"
                      placeholder="e.g. New York, USA"
                      value={formData.location}
                      onChange={handleFormChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="intent">Clinical Intent / Objective</label>
                    <input
                      id="intent"
                      name="intent"
                      type="text"
                      placeholder="e.g. Latest approved therapies"
                      value={formData.intent}
                      onChange={handleFormChange}
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="button primary" disabled={isLoading} style={{ minWidth: '180px' }}>
                    {isLoading ? (
                      <>
                        <span className="btn__spinner" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
                          <circle cx="11" cy="11" r="8"></circle>
                          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                        Generate Report
                      </>
                    )}
                  </button>
                  <button type="button" className="button secondary" onClick={handleClearForm}>
                    Clear Context
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column: Chat Stream Widget */}
          <div className="companion-chat glass-card" aria-label="Research stream">
            <header className="chat-header">
              <div className="chat-header-copy">
                {isLoading ? (
                  <span className="status-pill checking">
                    <span className="status-dot"></span>Analyzing…
                  </span>
                ) : (
                  <span className="status-pill online">
                    <span className="status-dot"></span>Active
                  </span>
                )}
                <h3>Curalink Stream</h3>
                <p className="chat-subtitle">Research outputs & trials matching</p>
              </div>
              <div className="chat-orb" aria-hidden="true"></div>
            </header>

            <div className="chat-body">
              <div className="chat-messages" id="chat-messages">
                {messages.length === 0 ? (
                  <div className="chat-empty">
                    <div className="chat-empty__icon">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                      </svg>
                    </div>
                    <p className="chat-empty__text">
                      Define the patient context on the left or use a quick start template to generate a clinical research report.
                    </p>
                  </div>
                ) : (
                  <>
                    {messages.map((msg, idx) => (
                      <ChatMessage
                        key={idx}
                        role={msg.role}
                        content={msg.content}
                        time={formatTime(msg.timestamp)}
                        metadata={msg.metadata}
                      />
                    ))}
                    {isLoading && (
                      <div className="chat-row assistant">
                        <div className="chat-bubble assistant">
                          <TypingIndicator step={loadingStep} />
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>
            </div>

            {/* Stream Footer with suggestions and follow-up inputs */}
            <footer className="chat-footer">
              {messages.length === 0 ? (
                <div className="prompt-row" aria-label="Quick start options">
                  {suggestions.map((sug, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSuggestionClick(sug)}
                      disabled={isLoading}
                    >
                      {sug.disease} ({sug.patientName})
                    </button>
                  ))}
                </div>
              ) : (
                <form className="chat-compose" onSubmit={handleChatSubmit}>
                  <input
                    ref={chatInputRef}
                    type="text"
                    placeholder="Refine parameters or ask follow-up questions..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    disabled={isLoading}
                    autoComplete="off"
                  />
                  <button type="submit" className="button primary" disabled={isLoading || !chatInput.trim()}>
                    Run
                  </button>
                </form>
              )}
            </footer>
          </div>
        </section>

        {/* ── Status Bar ────────────────────────────────────────── */}
        {status && (
          <div style={{ width: 'min(1200px, 100% - 2rem)', margin: '1rem auto' }}>
            <div className={`status-bar ${status.type === 'error' ? 'status-bar--error' : ''}`}>
              <span className="status-dot" />
              {status.text}
            </div>
          </div>
        )}
      </main>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className="site-footer">
        <div className="site-footer-inner">
          <div className="footer-brand">
            <span className="brand-name"><strong>Curalink Clinical Intelligence</strong></span>
            <p>AI‑powered medical research, clinical trial matching, and literature indexing.</p>
          </div>
          <nav aria-label="Footer navigation">
            <a href="#workspace">Workspace</a>
            <a href="#features">Features</a>
          </nav>
        </div>
        <p className="footer-note">
          Curalink is an informational research aid. For emergencies, contact local crisis services or emergency response.
        </p>
      </footer>
    </>
  );
}

export default App;
