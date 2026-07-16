import React, { useState } from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';
import { ShieldAlert, Trash2 } from 'lucide-react';

export default function TradeManagementNode({ id, data, isConnectable }) {
  const { setNodes, setEdges } = useReactFlow();
  
  const [trailingStop, setTrailingStop] = useState(data.trailingStop || 0);
  const [breakEven, setBreakEven] = useState(data.breakEven || 0);

  const updateData = (field, val) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          node.data = {
            ...node.data,
            [field]: val,
          };
        }
        return node;
      })
    );
  };

  const handleTrailingChange = (val) => {
    setTrailingStop(val);
    updateData('trailingStop', val);
  };

  const handleBreakEvenChange = (val) => {
    setBreakEven(val);
    updateData('breakEven', val);
  };

  const onDelete = () => {
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
    setEdges((edges) => edges.filter((edge) => edge.source !== id && edge.target !== id));
  };

  return (
    <div className="custom-node" style={{ borderColor: '#f43f5e' }}>
      <div className="custom-node-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f43f5e' }}>
          <ShieldAlert size={16} />
          Trade Management
        </div>
        <Trash2 size={14} className="node-delete-btn" onClick={onDelete} style={{ color: 'var(--text-muted)' }} />
      </div>
      
      <div className="custom-node-body">
        <div style={{ marginBottom: '8px' }}>
          <label style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Trailing Stop (Pips)</label>
          <input 
            type="number" 
            value={trailingStop}
            onChange={(e) => handleTrailingChange(parseFloat(e.target.value))}
            style={{ width: '100%', padding: '4px', marginTop: '2px', backgroundColor: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid var(--border)', borderRadius: '4px' }}
          />
        </div>
        <div style={{ marginBottom: '8px' }}>
          <label style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Break Even (Activation Pips)</label>
          <input 
            type="number" 
            value={breakEven}
            onChange={(e) => handleBreakEvenChange(parseFloat(e.target.value))}
            style={{ width: '100%', padding: '4px', marginTop: '2px', backgroundColor: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid var(--border)', borderRadius: '4px' }}
          />
        </div>
      </div>
      
      <Handle type="source" position={Position.Right} isConnectable={isConnectable} />
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} />
    </div>
  );
}
