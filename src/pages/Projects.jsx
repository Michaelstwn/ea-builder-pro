import React, { useState, useEffect } from 'react';
import { FolderGit2, Plus, Edit2, Play, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [activeTab, setActiveTab] = useState('EA');
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem('ea_projects');
    if (saved) {
      setProjects(JSON.parse(saved));
    }
  }, []);

  const createNewProject = (type) => {
    const newProj = {
      id: Date.now().toString(),
      name: `New ${type} Project ${projects.length + 1}`,
      type: type,
      status: 'On-going',
      version: 1,
      nodes: [],
      edges: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const updated = [newProj, ...projects];
    setProjects(updated);
    localStorage.setItem('ea_projects', JSON.stringify(updated));
    navigate(`/?projectId=${newProj.id}`);
  };

  const deleteProject = (id) => {
    if (!window.confirm('Delete this project?')) return;
    const updated = projects.filter(p => p.id !== id);
    setProjects(updated);
    localStorage.setItem('ea_projects', JSON.stringify(updated));
  };

  const openProject = (id) => {
    navigate(`/?projectId=${id}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return '#10b981';
      case 'On-going': return '#3b82f6';
      case 'Maintenance': return '#eab308';
      case 'Failed': return '#ef4444';
      case 'Optimization': return '#c084fc';
      default: return '#888';
    }
  };

  return (
    <div style={{ padding: '32px', width: '100%', height: '100%', overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <FolderGit2 size={28} color="var(--accent)" />
          <h2 style={{ margin: 0, fontWeight: 500 }}>My Projects</h2>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-primary" onClick={() => createNewProject('EA')} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Plus size={16} /> New EA
          </button>
          <button className="btn-secondary" onClick={() => createNewProject('Indicator')} style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--bg-panel)', color: '#8b5cf6', border: '1px solid #8b5cf6' }}>
            <Plus size={16} /> New Indicator
          </button>
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', borderBottom: '1px solid var(--border)' }}>
        <div 
          onClick={() => setActiveTab('EA')}
          style={{ padding: '8px 16px', cursor: 'pointer', borderBottom: activeTab === 'EA' ? '2px solid var(--accent)' : 'none', color: activeTab === 'EA' ? 'var(--accent)' : 'var(--text-muted)' }}
        >
          Expert Advisors
        </div>
        <div 
          onClick={() => setActiveTab('Indicator')}
          style={{ padding: '8px 16px', cursor: 'pointer', borderBottom: activeTab === 'Indicator' ? '2px solid #8b5cf6' : 'none', color: activeTab === 'Indicator' ? '#8b5cf6' : 'var(--text-muted)' }}
        >
          Custom Indicators
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
        {projects.filter(p => (p.type || 'EA') === activeTab).length === 0 && (
          <div style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
            No projects found in this category.
          </div>
        )}
        
        {projects.filter(p => (p.type || 'EA') === activeTab).map(proj => (
          <div key={proj.id} style={{ backgroundColor: 'var(--bg-canvas)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: 'var(--text-main)' }}>{proj.name}</h3>
              <div style={{ 
                fontSize: '11px', fontWeight: 600, padding: '4px 8px', borderRadius: '12px',
                backgroundColor: getStatusColor(proj.status) + '22',
                color: getStatusColor(proj.status),
                border: `1px solid ${getStatusColor(proj.status)}55`
              }}>
                {proj.status}
              </div>
            </div>
            
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px', flex: 1 }}>
              <div style={{ marginBottom: '8px' }}><strong>Version:</strong> v{proj.version}</div>
              <div style={{ marginBottom: '8px' }}><strong>Type:</strong> {proj.type || 'EA'}</div>
              <div style={{ marginBottom: '8px' }}><strong>Last Updated:</strong> {new Date(proj.updatedAt).toLocaleDateString()}</div>
              
              {proj.recommendations && (
                 <div style={{ marginTop: '16px', padding: '12px', backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px dashed #10b981', borderRadius: '8px' }}>
                    <div style={{ color: '#10b981', marginBottom: '4px' }}><strong>Recommendations (from Backtest):</strong></div>
                    {proj.recommendations.balance && <div>• Min Balance: ${proj.recommendations.balance}</div>}
                    {proj.recommendations.timeframe && <div>• Timeframe: {proj.recommendations.timeframe}</div>}
                    {proj.recommendations.preset && <div>• Applied Preset: {proj.recommendations.preset}</div>}
                    {proj.recommendations.profit && <div>• Expected Profit: ${proj.recommendations.profit}</div>}
                 </div>
              )}
            </div>
            
            <div style={{ display: 'flex', gap: '12px', marginTop: 'auto' }}>
              <button className="btn-primary" onClick={() => openProject(proj.id)} style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', backgroundColor: proj.type === 'Indicator' ? '#8b5cf6' : 'var(--accent)' }}>
                <Edit2 size={14} /> Edit Project
              </button>
              <button onClick={() => deleteProject(proj.id)} style={{ padding: '8px', backgroundColor: 'transparent', border: '1px solid var(--border)', borderRadius: '6px', color: '#ef4444', cursor: 'pointer' }} title="Delete">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
