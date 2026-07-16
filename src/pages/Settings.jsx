import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, RefreshCw } from 'lucide-react';

export default function Settings() {
  const [geminiKey, setGeminiKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [anthropicKey, setAnthropicKey] = useState('');
  const [groqKey, setGroqKey] = useState('');
  const [saved, setSaved] = useState(false);
  const [updateStatus, setUpdateStatus] = useState('');

  useEffect(() => {
    const loadKeys = async () => {
      let loadedKeys = {};
      if (window.ipcRenderer) {
        try {
          const res = await window.ipcRenderer.invoke('load-keys');
          if (res.success && res.keys) {
            loadedKeys = res.keys;
          }
        } catch (e) {
          console.warn("Failed to load keys from file", e);
        }
      }
      
      setGeminiKey(loadedKeys.gemini || localStorage.getItem('gemini_api_key') || '');
      setOpenaiKey(loadedKeys.openai || localStorage.getItem('openai_api_key') || '');
      setAnthropicKey(loadedKeys.anthropic || localStorage.getItem('anthropic_api_key') || '');
      setGroqKey(loadedKeys.groq || localStorage.getItem('groq_api_key') || '');
    };
    loadKeys();

    if (window.ipcRenderer) {
      const handleUpdateAvailable = () => setUpdateStatus('Update available. Downloading...');
      const handleUpdateNotAvailable = () => setUpdateStatus('Your application is up to date.');
      const handleError = (e, err) => setUpdateStatus('Error checking for updates.');
      const handleDownloaded = () => setUpdateStatus('Update ready! Check the popup to restart.');

      window.ipcRenderer.on('update-available', handleUpdateAvailable);
      window.ipcRenderer.on('update-not-available', handleUpdateNotAvailable);
      window.ipcRenderer.on('updater-error', handleError);
      window.ipcRenderer.on('update-downloaded', handleDownloaded);

      return () => {
        window.ipcRenderer.removeAllListeners('update-available');
        window.ipcRenderer.removeAllListeners('update-not-available');
        window.ipcRenderer.removeAllListeners('updater-error');
        window.ipcRenderer.removeAllListeners('update-downloaded');
      };
    }
  }, []);

  const handleSave = async () => {
    // Fallback plain storage
    if (geminiKey) localStorage.setItem('gemini_api_key', geminiKey);
    else localStorage.removeItem('gemini_api_key');
    if (openaiKey) localStorage.setItem('openai_api_key', openaiKey);
    else localStorage.removeItem('openai_api_key');
    if (anthropicKey) localStorage.setItem('anthropic_api_key', anthropicKey);
    else localStorage.removeItem('anthropic_api_key');
    if (groqKey) localStorage.setItem('groq_api_key', groqKey);
    else localStorage.removeItem('groq_api_key');

    // Save to file securely
    if (window.ipcRenderer) {
      try {
        await window.ipcRenderer.invoke('save-keys', {
          gemini: geminiKey,
          openai: openaiKey,
          anthropic: anthropicKey,
          groq: groqKey
        });
      } catch (e) {
        console.warn("Failed to save keys to file", e);
      }
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ padding: '24px', width: '100%', height: '100%', overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
        <SettingsIcon size={24} color="var(--accent)" />
        <h2 style={{ margin: 0, fontWeight: 500 }}>Global Settings</h2>
      </div>
      
      <div style={{ maxWidth: '600px', backgroundColor: 'var(--bg-canvas)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px' }}>
        <h3 style={{ fontSize: '16px', marginTop: 0, marginBottom: '16px', color: 'var(--text-main)' }}>AI Assistant Configuration</h3>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '24px' }}>
          You can configure multiple API keys. The EA Builder will allow you to select which AI model to use when generating workflows. If a model fails or hits limits, it will attempt to fallback if other keys are available.
        </p>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>Google Gemini API Key</label>
          <input 
            type="password"
            value={geminiKey}
            onChange={(e) => setGeminiKey(e.target.value)}
            placeholder="AIzaSy..."
            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'rgba(0,0,0,0.2)', color: 'white', fontFamily: 'monospace' }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>OpenAI API Key (ChatGPT)</label>
          <input 
            type="password"
            value={openaiKey}
            onChange={(e) => setOpenaiKey(e.target.value)}
            placeholder="sk-..."
            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'rgba(0,0,0,0.2)', color: 'white', fontFamily: 'monospace' }}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>Anthropic API Key (Claude)</label>
          <input 
            type="password"
            value={anthropicKey}
            onChange={(e) => setAnthropicKey(e.target.value)}
            placeholder="sk-ant-..."
            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'rgba(0,0,0,0.2)', color: 'white', fontFamily: 'monospace' }}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>Groq API Key (Llama-3, Mixtral - Free & Fast)</label>
          <input 
            type="password"
            value={groqKey}
            onChange={(e) => setGroqKey(e.target.value)}
            placeholder="gsk_..."
            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'rgba(0,0,0,0.2)', color: 'white', fontFamily: 'monospace' }}
          />
        </div>
      </div>

      <div style={{ maxWidth: '600px', backgroundColor: 'var(--bg-canvas)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', marginTop: '24px' }}>
        <h3 style={{ fontSize: '16px', marginTop: 0, marginBottom: '16px', color: 'var(--text-main)' }}>Simulation Data (Backtester)</h3>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '24px' }}>
          Configure a default historical data file (Bars/Ticks) from MT5/MT4 to be automatically loaded when you open the Simulation Preview.
        </p>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>Default MT5 Data File (CSV)</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input 
              type="text"
              readOnly
              value={localStorage.getItem('default_mt5_data_name') || ''}
              placeholder="No file selected..."
              style={{ flex: 1, padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'rgba(0,0,0,0.2)', color: 'white', fontSize: '12px' }}
            />
            <button 
              className="btn-secondary" 
              onClick={async () => {
                if (window.ipcRenderer) {
                  const res = await window.ipcRenderer.invoke('select-csv-file');
                  if (res.success) {
                    localStorage.setItem('default_mt5_data_path', res.filePath);
                    localStorage.setItem('default_mt5_data_name', res.fileName);
                    // force re-render just by saving state to trigger save UI although not perfectly bound
                    setSaved(true); setTimeout(() => setSaved(false), 500);
                  }
                } else {
                  alert("File selection requires desktop mode.");
                }
              }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)', borderRadius: '8px', padding: '0 16px', backgroundColor: 'var(--bg-panel)', color: 'white', cursor: 'pointer' }}
            >
              Browse
            </button>
          </div>
          {localStorage.getItem('default_mt5_data_path') && (
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '6px' }}>
              Path: {localStorage.getItem('default_mt5_data_path')}
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: '600px', marginTop: '24px', display: 'flex', gap: '12px' }}>
        <button className="btn-primary" onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Save size={16} /> {saved ? 'Saved!' : 'Save Settings'}
        </button>
      </div>

      <div style={{ maxWidth: '600px', backgroundColor: 'var(--bg-canvas)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', marginTop: '24px' }}>
        <h3 style={{ fontSize: '16px', marginTop: 0, marginBottom: '16px', color: 'var(--text-main)' }}>Application Updates</h3>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
          Check for the latest version of EA Builder Pro. New features and bug fixes are delivered via updates.
        </p>
        <button 
          className="btn-secondary" 
          onClick={async () => {
            setUpdateStatus('Checking for updates...');
            if (window.ipcRenderer) {
              const res = await window.ipcRenderer.invoke('check-for-updates');
              if (!res.success) setUpdateStatus('Failed to check for updates: ' + res.error);
              else setUpdateStatus('Checking...');
            } else {
              setUpdateStatus('Updates are only available in the desktop application.');
            }
          }} 
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <RefreshCw size={16} /> Check for Updates
        </button>
        {updateStatus && (
          <div style={{ fontSize: '12px', color: 'var(--accent)', marginTop: '12px' }}>
            {updateStatus}
          </div>
        )}
      </div>
    </div>
  );
}
