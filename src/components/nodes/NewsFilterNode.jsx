import React, { useState } from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';
import { Bell, Trash2 } from 'lucide-react';

export default function NewsFilterNode({ id, data, isConnectable }) {
  const { setNodes, setEdges } = useReactFlow();
  const [minsBefore, setMinsBefore] = useState(data.minsBefore || 30);
  const [minsAfter, setMinsAfter] = useState(data.minsAfter || 30);
  const [impact, setImpact] = useState(data.impact || 'High');

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

  const onDelete = () => {
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
    setEdges((edges) => edges.filter((edge) => edge.source !== id && edge.target !== id));
  };

  return (
    <div className="custom-node" style={{ borderColor: '#6366f1' }}>
      <div className="custom-node-header" style={{ color: '#6366f1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Bell size={16} /> News Filter
        </div>
        <Trash2 size={14} className="node-delete-btn" onClick={onDelete} />
      </div>
      
      <div className="custom-node-body">
        <label>Stop Before (Mins)</label>
        <input 
          type="number" 
          value={minsBefore} 
          onChange={(e) => {
            setMinsBefore(e.target.value);
            updateData('minsBefore', Number(e.target.value));
          }} 
        />

        <label>Stop After (Mins)</label>
        <input 
          type="number" 
          value={minsAfter} 
          onChange={(e) => {
            setMinsAfter(e.target.value);
            updateData('minsAfter', Number(e.target.value));
          }} 
        />
        
        <label>Impact Level</label>
        <select 
          value={impact} 
          onChange={(e) => {
            setImpact(e.target.value);
            updateData('impact', e.target.value);
          }}
          style={{ width: '100%', padding: '4px', marginTop: '2px', backgroundColor: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid var(--border)', borderRadius: '4px' }}
        >
          <option value="High" style={{ backgroundColor: '#1c1e26' }}>High Impact Only</option>
          <option value="Medium" style={{ backgroundColor: '#1c1e26' }}>High & Medium</option>
          <option value="Low" style={{ backgroundColor: '#1c1e26' }}>All News</option>
        </select>
      </div>

      <Handle type="source" position={Position.Right} isConnectable={isConnectable} />
    </div>
  );
}
