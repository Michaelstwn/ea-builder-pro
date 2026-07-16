import React, { useState, useEffect } from 'react';
import { Upload, BarChart2, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AutoTuner() {
  const [reportData, setReportData] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem('ea_projects');
    if (saved) {
      const parsed = JSON.parse(saved);
      setProjects(parsed);
      if (parsed.length > 0) setSelectedProjectId(parsed[0].id);
    }
  }, []);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      // Basic mock parser for MVP
      setReportData({
        filename: file.name,
        bestParams: [
          { MA_Period: 14, RSI_Period: 14, Profit: 1250.50, Trades: 45, Drawdown: 5.2 },
          { MA_Period: 21, RSI_Period: 14, Profit: 1100.20, Trades: 38, Drawdown: 4.1 },
          { MA_Period: 14, RSI_Period: 21, Profit: 980.00, Trades: 41, Drawdown: 3.5 },
        ]
      });
    };
    reader.readAsText(file);
  };

  const applyToProject = (row) => {
    if (!selectedProjectId) {
      alert('Please select a project first!');
      return;
    }

    const saved = localStorage.getItem('ea_projects');
    if (saved) {
      const projectsData = JSON.parse(saved);
      const idx = projectsData.findIndex(p => p.id === selectedProjectId);
      
      if (idx !== -1) {
        // Update status
        projectsData[idx].status = 'Completed';
        
        // Calculate recommended balance (e.g. 10x max drawdown dollar value roughly, or fixed rule)
        const recBalance = Math.max(500, Math.ceil(row.Profit * row.Drawdown / 100) * 10);
        
        projectsData[idx].recommendations = {
          balance: recBalance,
          timeframe: 'H1 (Auto-Detected)',
          preset: `MA=${row.MA_Period}, RSI=${row.RSI_Period}`,
          profit: row.Profit.toFixed(2)
        };
        
        projectsData[idx].updatedAt = new Date().toISOString();
        localStorage.setItem('ea_projects', JSON.stringify(projectsData));
        
        alert(`Backtest results applied successfully to project! Status set to Completed.`);
        navigate('/projects');
      }
    }
  };

  return (
    <div style={{ padding: '24px', color: 'var(--text-main)', width: '100%', overflowY: 'auto' }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
        <BarChart2 color="var(--accent)" /> Auto-Tuning
      </h2>
      
      <div style={{ marginBottom: '24px', maxWidth: '600px', backgroundColor: 'var(--bg-canvas)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
        <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>Target Project for Optimization</label>
        <select 
          value={selectedProjectId}
          onChange={(e) => setSelectedProjectId(e.target.value)}
          style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
        >
          {projects.length === 0 ? <option value="">No projects available</option> : null}
          {projects.map(p => (
            <option key={p.id} value={p.id}>{p.name} (v{p.version}) - {p.status}</option>
          ))}
        </select>
      </div>

      {!reportData ? (
        <div style={{
          border: '2px dashed var(--border)',
          borderRadius: '12px',
          padding: '48px',
          textAlign: 'center',
          backgroundColor: 'var(--bg-node)'
        }}>
          <Upload size={48} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
          <h3>Upload MT5 Optimization Report</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
            Supported formats: XML, HTML, CSV
          </p>
          <label className="btn-primary" style={{ cursor: 'pointer', display: 'inline-block' }}>
            Browse File
            <input type="file" accept=".xml,.html,.htm,.csv" style={{ display: 'none' }} onChange={handleFileUpload} />
          </label>
        </div>
      ) : (
        <div>
          <h3>Analysis for: {reportData.filename}</h3>
          <div style={{ marginTop: '24px', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-node)', textAlign: 'left' }}>
                  <th style={{ padding: '12px', borderBottom: '1px solid var(--border)' }}>MA Period</th>
                  <th style={{ padding: '12px', borderBottom: '1px solid var(--border)' }}>RSI Period</th>
                  <th style={{ padding: '12px', borderBottom: '1px solid var(--border)' }}>Total Profit</th>
                  <th style={{ padding: '12px', borderBottom: '1px solid var(--border)' }}>Drawdown</th>
                  <th style={{ padding: '12px', borderBottom: '1px solid var(--border)' }}>Trades</th>
                  <th style={{ padding: '12px', borderBottom: '1px solid var(--border)' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {reportData.bestParams.map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px' }}>{row.MA_Period}</td>
                    <td style={{ padding: '12px' }}>{row.RSI_Period}</td>
                    <td style={{ padding: '12px', color: 'var(--buy-color)' }}>${row.Profit.toFixed(2)}</td>
                    <td style={{ padding: '12px', color: 'var(--sell-color)' }}>{row.Drawdown}%</td>
                    <td style={{ padding: '12px' }}>{row.Trades}</td>
                    <td style={{ padding: '12px' }}>
                      <button className="btn-primary" onClick={() => applyToProject(row)} style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={14} /> Apply to Project
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button className="btn-secondary" style={{ marginTop: '24px', padding: '8px 16px', background: 'transparent', border: '1px solid var(--border)', color: 'white', borderRadius: '6px' }} onClick={() => setReportData(null)}>
            Upload Another Report
          </button>
        </div>
      )}
    </div>
  );
}
