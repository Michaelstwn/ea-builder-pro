import React from 'react';
import { Globe, HardDriveDownload } from 'lucide-react';

export default function Community() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', backgroundColor: 'var(--bg-app)' }}>
      <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-canvas)' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Globe size={28} color="var(--accent)" />
          Community Hub
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
          Discover and download Expert Advisor templates created by other traders.
        </p>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        <div style={{ 
           width: '120px', height: '120px', 
           borderRadius: '50%', backgroundColor: 'rgba(255, 255, 255, 0.03)', 
           display: 'flex', alignItems: 'center', justifyContent: 'center',
           marginBottom: '24px'
        }}>
          <HardDriveDownload size={48} color="var(--text-muted)" style={{ opacity: 0.5 }} />
        </div>
        
        <h2 style={{ fontSize: '32px', fontWeight: 700, margin: 0, letterSpacing: '4px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
          Coming Soon
        </h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '16px', maxWidth: '400px', textAlign: 'center', lineHeight: 1.6 }}>
          We are currently building the database infrastructure. Soon you will be able to share your EA projects and download templates from the community!
        </p>
        
        <button className="btn-secondary" style={{ marginTop: '32px', padding: '8px 24px' }} disabled>
          Waiting for Database Configuration...
        </button>
      </div>
    </div>
  );
}
