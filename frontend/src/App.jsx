import { useState, useRef, useEffect } from 'react';
import ChatMessage from './components/ChatMessage';
import TypingIndicator from './components/TypingIndicator';

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

  const sendMessage = async (messageText) => {
    setIsLoading(true);
    setStatus(null);

    // Optimistically add user message
    const userMsg = {
      role: 'user',
      content: messageText,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      setLoadingStep(0);

      const baseUrl = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://curalink-odoe.onrender.com' : '');
      const res = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          patientName: formData.patientName,
          disease: formData.disease,
          intent: formData.intent,
          location: formData.location,
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
            disease: formData.disease,
            intent: formData.intent,
            location: formData.location,
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

  // ── Format time ──────────────────────────────────────────────
  const formatTime = (iso) => {
    return new Date(iso).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // ═══════════════════════════════════════════════════════════════
  //  Render
  // ═══════════════════════════════════════════════════════════════
  return (
    <div className="app-container">
      {/* ── Header ──────────────────────────────────────────────── */}
      <header className="app-header">
        <div className="app-header__logo">
          <div className="app-header__icon">🩺</div>
          <h1>Curalink</h1>
        </div>
        <p className="app-header__subtitle">
          AI‑powered medical research assistant — publications, clinical trials &amp; insights
        </p>
      </header>

      {/* ── Patient Form ────────────────────────────────────────── */}
      <section className="form-card" id="patient-form">
        <h2 className="form-card__title">
          <span>●</span> Patient Research Context
        </h2>
        <form onSubmit={handleFormSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="patientName">Patient Name</label>
              <input
                id="patientName"
                name="patientName"
                type="text"
                placeholder="e.g. John Doe"
                value={formData.patientName}
                onChange={handleFormChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="disease">Disease of Interest</label>
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
              <label htmlFor="location">Location</label>
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
              <label htmlFor="intent">Additional Query / Intent</label>
              <input
                id="intent"
                name="intent"
                type="text"
                placeholder="e.g. Latest treatment options"
                value={formData.intent}
                onChange={handleFormChange}
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn--primary" disabled={isLoading} style={{ minWidth: '160px' }}>
              {isLoading ? (
                <>
                  <span className="btn__spinner" />
                  Processing...
                </>
              ) : (
                <>🚀 Start Research</>
              )}
            </button>
            <button type="button" className="btn btn--ghost" onClick={handleClearForm}>
              Reset
            </button>
          </div>
        </form>
      </section>

      {/* ── Chat Section ────────────────────────────────────────── */}
      <section className="chat-section" id="chat-section">
        <div className="chat-section__header">
          <h2 className="chat-section__title">
            <span>●</span> Research Chat
          </h2>
          {messages.length > 0 && (
            <span className="chat-section__badge">
              {messages.length} message{messages.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        <div className="chat-messages" id="chat-messages">
          {messages.length === 0 ? (
            <div className="chat-empty">
              <div className="chat-empty__icon">💬</div>
              <p className="chat-empty__text">
                Fill in the patient context above and click <strong>Start Research</strong> to begin
                your conversation.
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
                <TypingIndicator 
                  step={loadingStep} 
                  onStepComplete={(next) => setLoadingStep(next)} 
                />
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* ── Quick Chat Input ──────────────────────────────────── */}
        {messages.length > 0 && (
          <form className="chat-input-bar" onSubmit={handleChatSubmit} id="chat-input-bar">
            <input
              ref={chatInputRef}
              type="text"
              placeholder="Ask a follow-up question or refine search..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              disabled={isLoading}
              autoComplete="off"
            />
            <button type="submit" className="btn btn--primary" disabled={isLoading || !chatInput.trim()} style={{ padding: '0.6rem 1.5rem' }}>
              Send
            </button>
          </form>
        )}

        {/* ── Status Bar ────────────────────────────────────────── */}
        {status && (
          <div className={`status-bar ${status.type === 'error' ? 'status-bar--error' : ''}`}>
            <span className="status-dot" />
            {status.text}
          </div>
        )}
      </section>
    </div>
  );
}

export default App;
