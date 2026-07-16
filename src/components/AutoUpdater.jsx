import React, { useState, useEffect } from 'react';
import { Download, RefreshCw, X } from 'lucide-react';

export default function AutoUpdater() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateDownloaded, setUpdateDownloaded] = useState(false);
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    if (!window.ipcRenderer) return;

    const handleUpdateAvailable = () => setUpdateAvailable(true);
    const handleDownloadProgress = (event, progressObj) => setProgress(progressObj);
    const handleUpdateDownloaded = () => {
      setUpdateDownloaded(true);
      setUpdateAvailable(false);
    };

    window.ipcRenderer.on('update-available', handleUpdateAvailable);
    window.ipcRenderer.on('download-progress', handleDownloadProgress);
    window.ipcRenderer.on('update-downloaded', handleUpdateDownloaded);

    return () => {
      window.ipcRenderer.removeAllListeners('update-available');
      window.ipcRenderer.removeAllListeners('download-progress');
      window.ipcRenderer.removeAllListeners('update-downloaded');
    };
  }, []);

  const handleRestart = () => {
    if (window.ipcRenderer) {
      window.ipcRenderer.send('restart_app');
    }
  };

  if (!updateAvailable && !updateDownloaded) return null;

  return (
    <div style={{
      position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
      backgroundColor: 'var(--panel-bg)', border: '1px solid var(--border)',
      padding: '16px 24px', borderRadius: '8px', zIndex: 9999,
      display: 'flex', alignItems: 'center', gap: '16px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
    }}>
      {updateAvailable && !updateDownloaded && (
        <>
          <Download size={20} color="var(--accent)" />
          <div>
            <div style={{ fontWeight: 500, fontSize: '14px' }}>Downloading Update...</div>
            {progress && (
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {Math.round(progress.percent)}% ({Math.round(progress.transferred / 1024 / 1024)}MB / {Math.round(progress.total / 1024 / 1024)}MB)
              </div>
            )}
          </div>
        </>
      )}

      {updateDownloaded && (
        <>
          <RefreshCw size={20} color="#10b981" />
          <div>
            <div style={{ fontWeight: 500, fontSize: '14px' }}>Update Ready</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>A new version has been downloaded. Restart to install.</div>
          </div>
          <button className="btn-primary" onClick={handleRestart} style={{ marginLeft: '12px' }}>
            Restart Now
          </button>
          <button className="btn-secondary" onClick={() => setUpdateDownloaded(false)} style={{ padding: '6px' }}>
            <X size={16} />
          </button>
        </>
      )}
    </div>
  );
}
