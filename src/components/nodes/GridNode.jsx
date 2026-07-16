import React, { useState } from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';
import { Layers, Trash2 } from 'lucide-react';

export default function GridNode({ id, data, isConnectable }) {
  const { setNodes, setEdges } = useReactFlow();
  const [strategy, setStrategy] = useState(data.strategy || 'Martingale');
  const [multiplier, setMultiplier] = useState(data.multiplier || 2.0);
  const [step, setStep] = useState(data.step || 20);

  const onChange = (field, val) => {
    if (field === 'strategy') setStrategy(val);
    if (field === 'multiplier') setMultiplier(parseFloat(val));
    if (field === 'step') setStep(parseInt(val, 10));
    
    if (data.onChange) {
      data.onChange({
        ...data,
        strategy: field === 'strategy' ? val : strategy,
        multiplier: field === 'multiplier' ? parseFloat(val) : multiplier,
        step: field === 'step' ? parseInt(val, 10) : step
      });
    }
  };

  const onDelete = () => {
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
    setEdges((edges) => edges.filter((edge) => edge.source !== id && edge.target !== id));
  };

  return (
    <div className="custom-node" style={{ borderColor: '#f59e0b' }}>
      <div className="custom-node-header" style={{ color: '#f59e0b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={16} /> Grid / Martingale
        </div>
        <Trash2 size={14} className="node-delete-btn" onClick={onDelete} style={{ color: 'var(--text-muted)' }} />
      </div>
      
      <div className="custom-node-body">
        <label>Recovery Strategy</label>
        <select value={strategy} onChange={(e) => onChange('strategy', e.target.value)}>
          <option value="Martingale">Martingale (Multiply Lot)</option>
          <option value="Grid">Grid (Fixed Lot)</option>
        </select>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ flex: 1 }}>
            <label>Multiplier</label>
            <input type="number" step="0.1" value={multiplier} onChange={(e) => onChange('multiplier', e.target.value)} />
          </div>
          <div style={{ flex: 1 }}>
            <label>Step (Points)</label>
            <input type="number" value={step} onChange={(e) => onChange('step', e.target.value)} />
          </div>
        </div>
      </div>

      <Handle type="target" position={Position.Left} isConnectable={isConnectable} />
    </div>
  );
}
