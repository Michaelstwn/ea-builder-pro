import React, { useState } from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';
import { Play, Trash2 } from 'lucide-react';

export default function ActionNode({ id, data }) {
  const { setNodes, setEdges } = useReactFlow();
  const [params, setParams] = useState(data.params || {});

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

  const isBuy = data.action && data.action.includes('Buy');
  const color = isBuy ? 'var(--buy-color)' : 'var(--sell-color)';
  
  return (
    <div className="custom-node" style={{ borderColor: color + '55' }}>
      <Handle type="target" position={Position.Left} id="in" />
      
      <div className="custom-node-header" style={{ color: color, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Play size={16} />
          {data.action}
        </div>
        <Trash2 size={14} className="node-delete-btn" onClick={onDelete} style={{ color: 'var(--text-muted)' }} />
      </div>
      <div className="custom-node-body">
        {data.schema && data.schema.map((field) => (
          <div key={field.name} style={{ marginBottom: '8px' }}>
            <label style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{field.label}</label>
            {field.type === 'select' ? (
              <select
                value={params[field.name]}
                onChange={(e) => handleParamChange(field.name, e.target.value)}
                style={{ width: '100%', padding: '4px', marginTop: '2px', backgroundColor: 'var(--bg-panel)', color: 'white', border: '1px solid var(--border)', borderRadius: '4px' }}
              >
                {field.options.map(opt => (
                  <option key={opt} value={opt} style={{ backgroundColor: '#1c1e26', color: 'white' }}>{opt}</option>
                ))}
              </select>
            ) : (
              <input 
                type="number" 
                step={field.step || 1}
                value={params[field.name]}
                onChange={(e) => handleParamChange(field.name, parseFloat(e.target.value))}
                style={{ width: '100%', padding: '4px', marginTop: '2px', backgroundColor: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid var(--border)', borderRadius: '4px' }}
              />
            )}
          </div>
        ))}
        {!data.schema && (
          <div style={{ marginBottom: '8px' }}>
            <label style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Lot Size</label>
            <input type="number" step="0.01" defaultValue={0.1} style={{ width: '100%', padding: '4px', marginTop: '2px', backgroundColor: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid var(--border)', borderRadius: '4px' }} />
          </div>
        )}
      </div>
    </div>
  );
}
