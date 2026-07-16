import React from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';
import { Shield, Trash2 } from 'lucide-react';

export default function RiskNode({ id, data }) {
  const { setNodes, setEdges } = useReactFlow();

  const onDelete = () => {
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
    setEdges((edges) => edges.filter((edge) => edge.source !== id && edge.target !== id));
  };
  return (
    <div className="custom-node" style={{ borderColor: '#f59e0b' }}>
      <Handle type="target" position={Position.Left} />
      <div className="custom-node-header" style={{ color: '#f59e0b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Shield size={16} />
          <span>{data.type || 'Risk Mgmt'}</span>
        </div>
        <Trash2 size={14} className="node-delete-btn" onClick={onDelete} style={{ color: 'var(--text-muted)' }} />
      </div>
      <div className="custom-node-body">
        {data.params && Object.keys(data.params).map(key => (
          <div key={key} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
             <span style={{ color: 'var(--text-muted)' }}>{key.replace(/_/g, ' ')}:</span>
             <span>{data.params[key]}</span>
          </div>
        ))}
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
