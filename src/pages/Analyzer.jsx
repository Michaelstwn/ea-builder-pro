import React, { useState } from 'react';
import { UploadCloud, Activity, Bot, AlertTriangle } from 'lucide-react';

export default function Analyzer() {
  const [reportText, setReportText] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleDrop = async (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      setReportText(event.target.result);
      setAnalysis('');
    };
    reader.readAsText(file);
  };

  const analyzeReport = async () => {
    if (!reportText) return;
    setLoading(true);
    setErrorMsg('');
    try {
      if (!window.ipcRenderer) throw new Error("IPC not available (running in browser)");
      
      const resG = await window.ipcRenderer.invoke('secure-get', { encryptedHex: localStorage.getItem('gemini_api_key_enc') });
      if (!resG.success || !resG.decrypted) throw new Error("Gemini API Key missing");

      const prompt = `Act as an expert algorithmic trader and MQL5 developer. Analyze the following Strategy Tester Report.
Provide an optimization strategy, identifying weaknesses (e.g. high drawdown, consecutive losses) and suggest specific parameters to optimize or logic to add (like Time Filters or Trailing Stops).

--- REPORT ---
${reportText.substring(0, 50000)} // truncate to avoid token limits
--- END REPORT ---`;

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${resG.decrypted}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      
      if (!res.ok) throw new Error("Failed to fetch from Gemini API");
      
      const data = await res.json();
      setAnalysis(data.candidates[0].content.parts[0].text);
    } catch (err) {
      setErrorMsg(err.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '32px', height: '100%', overflowY: 'auto', backgroundColor: 'var(--bg-app)', color: 'var(--text-main)' }}>
      <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '24px', marginBottom: '24px' }}>
        <Activity color="var(--accent)" />
        AI Backtest Analyzer
      </h1>
      
      {!reportText && (
        <div 
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          style={{
            border: '2px dashed var(--border)',
            borderRadius: '16px',
            padding: '64px',
            textAlign: 'center',
            backgroundColor: 'var(--bg-panel)',
            cursor: 'pointer'
          }}
          onClick={() => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.html,.htm,.csv,.txt';
            input.onchange = (e) => {
              const file = e.target.files[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = (event) => setReportText(event.target.result);
              reader.readAsText(file);
            };
            input.click();
          }}
        >
          <UploadCloud size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px' }} />
          <h3>Drag & Drop Strategy Tester Report</h3>
          <p style={{ color: 'var(--text-muted)' }}>Supports HTML or CSV formats from MetaTrader 4/5</p>
        </div>
      )}

      {reportText && !analysis && !loading && (
        <div style={{ backgroundColor: 'var(--bg-panel)', padding: '24px', borderRadius: '12px' }}>
          <h3>Report Loaded</h3>
          <p style={{ color: 'var(--text-muted)' }}>{reportText.length} bytes read.</p>
          <button onClick={analyzeReport} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px' }}>
            <Bot size={16} />
            Generate AI Optimization Advice
          </button>
        </div>
      )}

      {loading && (
        <div style={{ padding: '32px', textAlign: 'center', color: 'var(--accent)' }}>
          <Activity size={32} className="animate-pulse" style={{ margin: '0 auto 16px' }} />
          <p>Analyzing performance metrics and trading patterns...</p>
        </div>
      )}

      {errorMsg && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '8px', marginTop: '16px' }}>
          <AlertTriangle size={16} />
          {errorMsg}
        </div>
      )}

      {analysis && (
        <div style={{ marginTop: '24px' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bot size={20} color="var(--accent)" /> AI Insights
          </h2>
          <div style={{ backgroundColor: 'var(--bg-panel)', padding: '24px', borderRadius: '12px', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
            {analysis}
          </div>
          <button onClick={() => { setReportText(''); setAnalysis(''); }} className="btn-secondary" style={{ marginTop: '16px' }}>
            Analyze Another Report
          </button>
        </div>
      )}
    </div>
  );
}
