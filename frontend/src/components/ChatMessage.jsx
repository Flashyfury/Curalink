function ChatMessage({ role, content, time, metadata }) {
  const isUser = role === 'user';

  const renderAssistantContent = () => {
    if (!metadata) return <div className="message__bubble">{content}</div>;

    const { studiesFound, trialsFound, topPublication, topTrial, context } = metadata;

    return (
      <div className="message__bubble">
        <div className="response-card">
          {/* 🧠 Condition Overview */}
          <div className="response-section">
            <h3 className="response-section__title">🧠 Condition Overview</h3>
            <div className="response-section__content">
              {content.split('Research Insights:')[0].replace('Condition Overview:', '').trim() || 
               `${context?.disease || 'Condition'} overview based on current research.`}
            </div>
          </div>

          {/* 📄 Research Insights */}
          <div className="response-section">
            <h3 className="response-section__title">📄 Research Insights</h3>
            <div className="response-section__content">
              <ul className="response-section__list">
                <li className="response-section__item">Studies found: <strong>{studiesFound || 0}</strong></li>
                {topPublication && (
                  <>
                    <li className="response-section__item">Top Publication: <em>{topPublication.title}</em></li>
                    <li className="response-section__item">Year: {topPublication.year}</li>
                  </>
                )}
              </ul>
              {topPublication?.url && (
                <div className="resource-links">
                  <a href={topPublication.url} target="_blank" rel="noopener noreferrer" className="resource-link">
                    View Publication ↗
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* 🧪 Clinical Trials */}
          <div className="response-section">
            <h3 className="response-section__title">🧪 Clinical Trials</h3>
            <div className="response-section__content">
              <ul className="response-section__list">
                <li className="response-section__item">Trials found: <strong>{trialsFound || 0}</strong></li>
                {topTrial && (
                  <>
                    <li className="response-section__item">Top Trial: <em>{topTrial.title}</em></li>
                    <li className="response-section__item">Status: <span className="response-meta">{topTrial.status}</span></li>
                  </>
                )}
              </ul>
              {topTrial?.url && (
                <div className="resource-links">
                  <a href={topTrial.url} target="_blank" rel="noopener noreferrer" className="resource-link">
                    View Trial ↗
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* 📍 Context */}
          <div className="response-section">
            <h3 className="response-section__title">📍 Context</h3>
            <div className="response-section__content">
              <span className="response-meta">Disease: {context?.disease || 'N/A'}</span>
              <span className="response-meta">Intent: {context?.intent || 'N/A'}</span>
              <span className="response-meta">Location: {context?.location || 'N/A'}</span>
            </div>
          </div>

          {/* ⚠ Disclaimer */}
          <div className="response-disclaimer">
            <strong>⚠ Disclaimer:</strong> Informational only. This tool provides research information and is not a substitute for medical advice.
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`message message--${role}`}>
      <div className="message__avatar">
        {isUser ? '👤' : '🤖'}
      </div>
      <div style={{ flex: 1 }}>
        {isUser ? <div className="message__bubble">{content}</div> : renderAssistantContent()}
        <div className="message__time">{time}</div>
      </div>
    </div>
  );
}

export default ChatMessage;
