import React from 'react';
import { HashRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { Bot, GitMerge, BarChart2, PlaySquare, Settings as SettingsIcon, FolderGit2, Globe, Activity, ArrowLeft } from 'lucide-react';
import Editor from './pages/Editor';
import AutoTuner from './pages/AutoTuner';
import Preview from './pages/Preview';
import Settings from './pages/Settings';
import Projects from './pages/Projects';
import Community from './pages/Community';
import Analyzer from './pages/Analyzer';
import AutoUpdater from './components/AutoUpdater';

function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/projects', icon: FolderGit2, label: 'Projects' },
    { path: '/', icon: GitMerge, label: 'Editor' },
    { path: '/preview', icon: PlaySquare, label: 'Simulate' },
    { path: '/community', icon: Globe, label: 'Community' },
    { path: '/analyzer', icon: Activity, label: 'Analyzer' },
    { path: '/tune', icon: BarChart2, label: 'Tuner' },
  ];

  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw' }}>
      <header className="app-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Bot size={20} color="var(--accent)" />
          <h1>EA Builder Pro</h1>
        </div>
      </header>
      
      <div className="app-body" style={{ display: 'flex', flex: 1, height: 'calc(100vh - 48px)' }}>
        {/* App Navigation Sidebar */}
        <nav style={{ 
          width: '72px', 
          backgroundColor: 'var(--bg-app)', 
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: '10px',
          gap: '4px'
        }}>
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            title="Back"
            style={{
              background: 'none',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px',
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '44px',
              height: '36px',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--accent)';
              e.currentTarget.style.borderColor = 'var(--accent)';
              e.currentTarget.style.backgroundColor = 'rgba(59,130,246,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-muted)';
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <ArrowLeft size={18} />
          </button>

          <div style={{ width: '36px', height: '1px', backgroundColor: 'var(--border)', marginBottom: '4px' }} />

          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                title={label}
                style={{
                  color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                  textDecoration: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '2px',
                  padding: '6px 4px',
                  borderRadius: '8px',
                  backgroundColor: isActive ? 'rgba(59,130,246,0.1)' : 'transparent',
                  transition: 'all 0.2s ease',
                  width: '56px',
                }}
              >
                <Icon size={20} />
                <span style={{ fontSize: '9px', fontWeight: isActive ? 600 : 400, opacity: isActive ? 1 : 0.7 }}>{label}</span>
              </Link>
            );
          })}
          
          <div style={{ flex: 1 }} />
          
          <Link
            to="/settings"
            title="Settings"
            style={{
              color: location.pathname === '/settings' ? 'var(--accent)' : 'var(--text-muted)',
              textDecoration: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
              padding: '6px 4px',
              marginBottom: '12px',
              borderRadius: '8px',
              backgroundColor: location.pathname === '/settings' ? 'rgba(59,130,246,0.1)' : 'transparent',
              transition: 'all 0.2s ease',
              width: '56px',
            }}
          >
            <SettingsIcon size={20} />
            <span style={{ fontSize: '9px', fontWeight: location.pathname === '/settings' ? 600 : 400, opacity: location.pathname === '/settings' ? 1 : 0.7 }}>Settings</span>
          </Link>
        </nav>

        {/* Page Content */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          <Routes>
            <Route path="/" element={<Editor />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/preview" element={<Preview />} />
            <Route path="/community" element={<Community />} />
            <Route path="/analyzer" element={<Analyzer />} />
            <Route path="/tune" element={<AutoTuner />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>
      </div>
      <AutoUpdater />
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AppLayout />
    </HashRouter>
  );
}
