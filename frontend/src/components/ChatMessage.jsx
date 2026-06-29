function ChatMessage({ role, content, time, metadata }) {
  const isUser = role === 'user';

  const parseSections = (text) => {
    const sections = {
      overview: '',
      insights: '',
      trials: '',
      attribution: ''
    };

    if (!text) return sections;

    const marker1 = /(?:#+\s*)?1\.\s*(?:\*\*)?Condition\s+Overview(?:\*\*)?:?/i;
    const marker2 = /(?:#+\s*)?2\.\s*(?:\*\*)?Research\s+Insights(?:\*\*)?:?/i;
    const marker3 = /(?:#+\s*)?3\.\s*(?:\*\*)?Clinical\s+Trials(?:\*\*)?:?/i;
    const marker4 = /(?:#+\s*)?4\.\s*(?:\*\*)?Source\s+Attribution(?:\*\*)?:?/i;

    const match1 = text.search(marker1);
    const match2 = text.search(marker2);
    const match3 = text.search(marker3);
    const match4 = text.search(marker4);

    const idx1 = match1 !== -1 ? match1 + text.match(marker1)[0].length : -1;
    const idx2 = match2 !== -1 ? match2 + text.match(marker2)[0].length : -1;
    const idx3 = match3 !== -1 ? match3 + text.match(marker3)[0].length : -1;
    const idx4 = match4 !== -1 ? match4 + text.match(marker4)[0].length : -1;

    let overviewText = '';
    let insightsText = '';
    let trialsText = '';
    let attributionText = '';

    if (match1 !== -1) {
      let endOf1 = text.length;
      if (match2 !== -1) endOf1 = match2;
      else if (match3 !== -1) endOf1 = match3;
      else if (match4 !== -1) endOf1 = match4;
      overviewText = text.slice(idx1, endOf1).trim();
    } else {
      let endOfPrefix = text.length;
      if (match2 !== -1) endOfPrefix = match2;
      else if (match3 !== -1) endOfPrefix = match3;
      else if (match4 !== -1) endOfPrefix = match4;
      overviewText = text.slice(0, endOfPrefix).trim();
    }

    if (match2 !== -1) {
      let endOf2 = text.length;
      if (match3 !== -1) endOf2 = match3;
      else if (match4 !== -1) endOf2 = match4;
      insightsText = text.slice(idx2, endOf2).trim();
    }

    if (match3 !== -1) {
      let endOf3 = text.length;
      if (match4 !== -1) endOf3 = match4;
      trialsText = text.slice(idx3, endOf3).trim();
    }

    if (match4 !== -1) {
      attributionText = text.slice(idx4).trim();
    }

    sections.overview = overviewText;
    sections.insights = insightsText;
    sections.trials = trialsText;
    sections.attribution = attributionText;

    return sections;
  };

  const renderAssistantContent = () => {
    if (!metadata) {
      return <div className="text-bubble">{content}</div>;
    }

    const { studiesFound, trialsFound, topPublication, topTrial, context } = metadata;
    const parsed = parseSections(content);

    const renderFormattedText = (text) => {
      if (!text) return null;
      const lines = text.split('\n').filter(line => line.trim() !== '');

      return lines.map((line, idx) => {
        let displayLine = line.trim();
        const isBullet = /^(?:\d+\.|[-*•])\s/.test(displayLine);
        if (isBullet) {
          displayLine = displayLine.replace(/^(?:\d+\.|[-*•])\s+/, '');
        }
        const lineParts = displayLine.split(/(\*\*.*?\*\*)/g);
        
        return (
          <div key={idx} style={{ 
            marginBottom: '0.75rem', 
            paddingLeft: isBullet ? '1.5rem' : '0',
            position: 'relative'
          }}>
            {isBullet && <span style={{ position: 'absolute', left: '0', top: '0', color: 'var(--pink-dk)' }}>•</span>}
            {lineParts.map((part, i) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i} style={{ color: 'var(--ink)', fontWeight: '700' }}>{part.slice(2, -2)}</strong>;
              }
              return <span key={i}>{part}</span>;
            })}
          </div>
        );
      });
    };

    return (
      <div className="report-card">
        <div className="report-header">
          <div className="report-header__icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </div>
          <div className="report-header__title">Clinical Research Report</div>
        </div>

        <div className="report-body">
          {/* Condition Overview */}
          <div className="report-section report-section--full">
            <div className="report-section__title">Condition Overview</div>
            <div className="report-section__content">
              {renderFormattedText(parsed.overview) || `${context?.disease || 'Condition'} overview based on current research.`}
            </div>
          </div>

          {/* Research Insights */}
          {parsed.insights && (
            <div className="report-section report-section--full">
              <div className="report-section__title">Research Insights</div>
              <div className="report-section__content">
                {renderFormattedText(parsed.insights)}
              </div>
            </div>
          )}

          {/* Clinical Trials Narrative */}
          {parsed.trials && (
            <div className="report-section report-section--full">
              <div className="report-section__title">Clinical Trials</div>
              <div className="report-section__content">
                {renderFormattedText(parsed.trials)}
              </div>
            </div>
          )}

          <div className="report-grid">
            {/* Publications Highlight */}
            <div className="highlight-box">
              <div className="highlight-box__title">Top Publication</div>
              <div className="highlight-box__meta">{studiesFound || 0} recent publications found</div>
              {topPublication ? (
                <>
                  <div style={{ fontSize: '0.92rem', fontWeight: '700', color: 'var(--ink)', marginBottom: '0.5rem', lineHeight: '1.4' }}>
                    {topPublication.title}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--ink-2)', marginBottom: '0.5rem' }}>
                    Year: {topPublication.year}
                  </div>
                  {topPublication.url && (
                    <a href={topPublication.url} target="_blank" rel="noopener noreferrer" className="resource-link">
                      View Source
                    </a>
                  )}
                </>
              ) : (
                <div style={{ fontSize: '0.88rem', color: 'var(--ink-2)' }}>No relevant publications found.</div>
              )}
            </div>

            {/* Trials Highlight */}
            <div className="highlight-box">
              <div className="highlight-box__title">Leading Clinical Trial</div>
              <div className="highlight-box__meta">{trialsFound || 0} active trials found</div>
              {topTrial ? (
                <>
                  <div style={{ fontSize: '0.92rem', fontWeight: '700', color: 'var(--ink)', marginBottom: '0.6rem', lineHeight: '1.4' }}>
                    {topTrial.title}
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                    {topTrial.status && (
                      <span style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem', background: 'rgba(139, 92, 246, 0.08)', borderRadius: '6px', border: '1px solid rgba(61, 38, 84, 0.08)', color: 'var(--ink)' }}>
                        {topTrial.status}
                      </span>
                    )}
                    {topTrial.phase && (Array.isArray(topTrial.phase) ? topTrial.phase.length > 0 : true) && (
                      <span style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem', background: 'rgba(139, 92, 246, 0.08)', borderRadius: '6px', border: '1px solid rgba(61, 38, 84, 0.08)', color: 'var(--ink)' }}>
                        {Array.isArray(topTrial.phase) ? topTrial.phase.join(', ') : topTrial.phase}
                      </span>
                    )}
                  </div>
                  {topTrial.url && (
                    <a href={topTrial.url} target="_blank" rel="noopener noreferrer" className="resource-link">
                      View Trial Details
                    </a>
                  )}
                </>
              ) : (
                <div style={{ fontSize: '0.88rem', color: 'var(--ink-2)' }}>No relevant clinical trials found.</div>
              )}
            </div>
          </div>

          {/* Source Attribution */}
          {parsed.attribution && (
            <div className="report-section report-section--full">
              <div className="report-section__title">Source Attribution</div>
              <div className="report-section__content" style={{ fontSize: '0.85rem', color: 'var(--ink-2)' }}>
                {renderFormattedText(parsed.attribution)}
              </div>
            </div>
          )}
        </div>

        <div className="report-disclaimer">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          Informational purposes only. Not a substitute for professional medical advice.
        </div>
      </div>
    );
  };

  if (isUser) {
    return (
      <div className="chat-row user">
        <div className="chat-bubble user">
          <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', opacity: 0.8, letterSpacing: '0.05em', marginBottom: '0.25rem', fontWeight: '800' }}>
            Patient Context — {time}
          </div>
          <div>{content}</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', width: '100%' }}>
      <div className="chat-row assistant">
        <div className="chat-bubble assistant" style={{ width: '100%' }}>
          {renderAssistantContent()}
        </div>
      </div>
      <div style={{ fontSize: '0.72rem', color: 'var(--ink-2)', textAlign: 'right', paddingRight: '0.5rem', fontWeight: '500' }}>
        Generated at {time}
      </div>
    </div>
  );
}

export default ChatMessage;
