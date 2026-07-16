import React, { useState } from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';
import { Shield, Trash2 } from 'lucide-react';

export default function PartialCloseNode({ id, data, isConnectable }) {
  const { setNodes, setEdges } = useReactFlow();
  const [triggerPips, setTriggerPips] = useState(data.triggerPips || 50);
  const [closePercent, setClosePercent] = useState(data.closePercent || 50);

  const updateData = (field, val) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          node.data = {
            ...node.data,
            [field]: Number(val),
          };
        }
        return node;
      })
    );
  };

  const onDelete = () => {
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
    setEdges((edges) => edges.filter((edge) => edge.source !== id && edge.target !== id));
  };

  return (
    <div className="custom-node" style={{ borderColor: '#f43f5e' }}>
      <div className="custom-node-header" style={{ color: '#f43f5e', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Shield size={16} /> Partial Close
        </div>
        <Trash2 size={14} className="node-delete-btn" onClick={onDelete} />
      </div>
      
      <div className="custom-node-body">
        <label>Trigger Profit (Pips)</label>
        <input 
          type="number" 
          value={triggerPips} 
          onChange={(e) => {
            setTriggerPips(e.target.value);
            updateData('triggerPips', e.target.value);
          }} 
        />

        <label>Close Volume (%)</label>
        <input 
          type="number" 
          max="100"
          min="1"
          value={closePercent} 
          onChange={(e) => {
            setClosePercent(e.target.value);
            updateData('closePercent', e.target.value);
          }} 
        />
      </div>

      <Handle type="source" position={Position.Right} isConnectable={isConnectable} />
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} />
    </div>
  );
}
