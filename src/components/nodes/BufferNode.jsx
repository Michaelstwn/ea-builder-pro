import React, { useState } from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';
import { Edit2, Trash2 } from 'lucide-react';

export default function BufferNode({ id, data, isConnectable }) {
  const { setNodes, setEdges } = useReactFlow();
  const [bufferId, setBufferId] = useState(data.bufferId || 0);
  const [color, setColor] = useState(data.color || 'clrRed');
  const [style, setStyle] = useState(data.style || 'DRAW_LINE');

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
    <div className="custom-node" style={{ borderColor: '#8b5cf6' }}>
      <div className="custom-node-header" style={{ color: '#8b5cf6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Edit2 size={16} /> Indicator Buffer
        </div>
        <Trash2 size={14} className="node-delete-btn" onClick={onDelete} />
      </div>
      
      <div className="custom-node-body">
        <label>Buffer Index (0-7)</label>
        <input 
          type="number" 
          value={bufferId} 
          min="0"
          max="7"
          onChange={(e) => {
            setBufferId(e.target.value);
            updateData('bufferId', Number(e.target.value));
          }} 
        />

        <label>Line Style</label>
        <select 
          value={style} 
          onChange={(e) => {
            setStyle(e.target.value);
            updateData('style', e.target.value);
          }}
          style={{ width: '100%', padding: '4px', marginTop: '2px', backgroundColor: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid var(--border)', borderRadius: '4px', marginBottom: '8px' }}
        >
          <option value="DRAW_LINE" style={{ backgroundColor: '#1c1e26' }}>Line</option>
          <option value="DRAW_HISTOGRAM" style={{ backgroundColor: '#1c1e26' }}>Histogram</option>
          <option value="DRAW_ARROW" style={{ backgroundColor: '#1c1e26' }}>Arrow</option>
        </select>
        
        <label>Color</label>
        <select 
          value={color} 
          onChange={(e) => {
            setColor(e.target.value);
            updateData('color', e.target.value);
          }}
          style={{ width: '100%', padding: '4px', marginTop: '2px', backgroundColor: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid var(--border)', borderRadius: '4px' }}
        >
          <option value="clrRed" style={{ backgroundColor: '#1c1e26' }}>Red</option>
          <option value="clrGreen" style={{ backgroundColor: '#1c1e26' }}>Green</option>
          <option value="clrBlue" style={{ backgroundColor: '#1c1e26' }}>Blue</option>
          <option value="clrYellow" style={{ backgroundColor: '#1c1e26' }}>Yellow</option>
        </select>
      </div>

      <Handle type="target" position={Position.Left} isConnectable={isConnectable} id="in" />
    </div>
  );
}
