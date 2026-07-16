import React, { useState } from 'react';
import { useReactFlow } from 'reactflow';
import { Lock, Trash2 } from 'lucide-react';

export default function LicenseNode({ id, data }) {
  const { setNodes, setEdges } = useReactFlow();
  const [params, setParams] = useState(data.params || { accountNumber: '', expiryDate: '' });

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
    <div className="custom-node" style={{ borderColor: '#8b5cf655', width: '220px' }}>
      <div className="custom-node-header" style={{ color: '#8b5cf6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Lock size={16} />
          License / Security
        </div>
        <Trash2 size={14} className="node-delete-btn" onClick={onDelete} style={{ color: 'var(--text-muted)', cursor: 'pointer' }} />
      </div>
      <div className="custom-node-body">
         <div style={{ marginBottom: '8px' }}>
            <label style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Allowed Account Number</label>
            <input 
              type="number" 
              placeholder="e.g. 12345678 (Leave empty for any)"
              value={params.accountNumber}
              onChange={(e) => handleParamChange('accountNumber', e.target.value)}
              style={{ width: '100%', padding: '4px', marginTop: '2px', backgroundColor: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid var(--border)', borderRadius: '4px' }}
            />
          </div>
          <div style={{ marginBottom: '8px' }}>
            <label style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Expiry Date (YYYY.MM.DD)</label>
            <input 
              type="text" 
              placeholder="e.g. 2026.12.31"
              value={params.expiryDate}
              onChange={(e) => handleParamChange('expiryDate', e.target.value)}
              style={{ width: '100%', padding: '4px', marginTop: '2px', backgroundColor: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid var(--border)', borderRadius: '4px' }}
            />
          </div>
          <div style={{ fontSize: '9px', color: '#8b5cf6', marginTop: '4px', fontStyle: 'italic' }}>
             This node will lock the EA to the specified account or date. It does not need to be connected to any logic.
          </div>
      </div>
    </div>
  );
}
