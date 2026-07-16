import React, { useState } from 'react';
import { useReactFlow } from 'reactflow';
import { Code, Trash2 } from 'lucide-react';

export default function CustomCodeNode({ id, data }) {
  const { setNodes, setEdges } = useReactFlow();
  const [params, setParams] = useState(data.params || { location: 'OnTick', code: '' });

  const onDelete = () => {
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
    setEdges((edges) => edges.filter((edge) => edge.source !== id && edge.target !== id));
  };

  const handleParamChange = (name, value) => {
    const newParams = { ...params, [name]: value };
    setParams(newParams);
    
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          node.data = {
            ...node.data,
            params: newParams,
          };
        }
        return node;
      })
    );
  };

  return (
    <div className="custom-node" style={{ borderColor: '#6366f155', width: '280px' }}>
      <div className="custom-node-header" style={{ color: '#6366f1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Code size={16} />
          Custom Code
        </div>
        <Trash2 size={14} className="node-delete-btn" onClick={onDelete} style={{ color: 'var(--text-muted)', cursor: 'pointer' }} />
      </div>
      <div className="custom-node-body">
          <div style={{ marginBottom: '8px' }}>
            <label style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Injection Location</label>
            <select
                value={params.location}
                onChange={(e) => handleParamChange('location', e.target.value)}
                style={{ width: '100%', padding: '4px', marginTop: '2px', backgroundColor: 'var(--bg-panel)', color: 'white', border: '1px solid var(--border)', borderRadius: '4px' }}
              >
                 <option value="Global">Global Scope (Top of file)</option>
                 <option value="OnInit">OnInit()</option>
                 <option value="OnTick">OnTick() / OnCalculate()</option>
            </select>
          </div>
          <div style={{ marginBottom: '8px' }}>
            <label style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Raw MQL Code</label>
            <textarea 
              placeholder="// Write your MQL here..."
              value={params.code}
              onChange={(e) => handleParamChange('code', e.target.value)}
              rows={6}
              style={{ width: '100%', padding: '6px', marginTop: '2px', backgroundColor: 'rgba(0,0,0,0.3)', color: '#a5b4fc', border: '1px solid var(--border)', borderRadius: '4px', fontFamily: 'monospace', fontSize: '11px', resize: 'vertical' }}
            />
          </div>
      </div>
    </div>
  );
}
