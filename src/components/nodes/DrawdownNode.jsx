import React, { useState } from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';
import { ShieldAlert, Trash2 } from 'lucide-react';

export default function DrawdownNode({ id, data, isConnectable }) {
  const { setNodes, setEdges } = useReactFlow();
  const [maxDrawdown, setMaxDrawdown] = useState(data.maxDrawdown || 5.0);

  const onChange = (val) => {
    setMaxDrawdown(parseFloat(val));
    if (data.onChange) {
      data.onChange({ ...data, maxDrawdown: parseFloat(val) });
    }
  };

  const onDelete = () => {
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
    setEdges((edges) => edges.filter((edge) => edge.source !== id && edge.target !== id));
  };

  return (
    <div className="custom-node" style={{ borderColor: '#f43f5e' }}>
      <div className="custom-node-header" style={{ color: '#f43f5e', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldAlert size={16} /> Drawdown Protector
        </div>
        <Trash2 size={14} className="node-delete-btn" onClick={onDelete} style={{ color: 'var(--text-muted)' }} />
      </div>
      
      <div className="custom-node-body">
        <label>Max Daily Drawdown (%)</label>
        <input type="number" step="0.1" value={maxDrawdown} onChange={(e) => onChange(e.target.value)} />
      </div>

      <Handle type="source" position={Position.Right} isConnectable={isConnectable} />
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} />
    </div>
  );
}
