function TypingIndicator({ step }) {
  const steps = [
    'Searching publications...',
    'Fetching trials...',
    'Preparing response...'
  ];

  return (
    <div className="typing-indicator" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem' }}>
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <div className="message__avatar">
          🤖
        </div>
        <div className="typing-indicator__dots">
          <span className="typing-indicator__dot" />
          <span className="typing-indicator__dot" />
          <span className="typing-indicator__dot" />
        </div>
      </div>
      
      <div className="loading-status-container" style={{ marginLeft: 'calc(36px + 0.75rem)' }}>
        {steps.map((text, i) => (
          i <= step && (
            <div key={i} className="loading-status-item">
              <span 
                className="status-dot" 
                style={{ 
                  background: i < step ? 'var(--cl-success)' : 'var(--cl-accent)',
                  boxShadow: i === step ? '0 0 8px var(--cl-accent)' : 'none',
                  opacity: i === step ? 1 : 0.6
                }} 
              />
              <span style={{ 
                color: i === step ? 'var(--cl-text-primary)' : 'var(--cl-text-muted)',
                fontWeight: i === step ? '600' : '400'
              }}>
                {text}
              </span>
            </div>
          )
        ))}
      </div>
    </div>
  );
}

export default TypingIndicator;
