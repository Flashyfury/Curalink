function TypingIndicator({ step }) {
  const steps = [
    'Analyzing patient context...',
    'Scanning recent medical publications...',
    'Cross-referencing active clinical trials...',
    'Generating clinical report...'
  ];

  // Map the 3 steps from App.jsx (0, 1, 2) to our 4 steps for a more detailed feel
  // 0: Searching publications
  // 1: Fetching trials
  // 2: Preparing response
  const displayStep = step === 0 ? 1 : step === 1 ? 2 : 3;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.8rem 1.1rem' }}>
      <div className="analysis-indicator__spinner" style={{ flexShrink: 0 }}></div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
        <div className="analysis-indicator__text" style={{ fontSize: '0.92rem', color: 'var(--ink)' }}>
          {steps[displayStep]}
        </div>
        <div style={{ fontSize: '0.74rem', color: 'var(--ink-2)', fontWeight: '500' }}>
          Step {displayStep + 1} of {steps.length}
        </div>
      </div>
    </div>
  );
}

export default TypingIndicator;
