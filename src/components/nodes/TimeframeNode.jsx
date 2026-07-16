import React, { useState } from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';
import { Clock, Trash2 } from 'lucide-react';

export default function TimeframeNode({ id, data, isConnectable }) {
  const { setNodes, setEdges } = useReactFlow();
  const [session, setSession] = useState(data.session || 'Always');
  const [startHour, setStartHour] = useState(data.startHour || '00:00');
  const [endHour, setEndHour] = useState(data.endHour || '23:59');

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

  const onSessionChange = (e) => {
    setSession(e.target.value);
    updateData('session', e.target.value);
  };
  
  const onTimeChange = (field, val) => {
    if (field === 'start') {
      setStartHour(val);
      updateData('startHour', val);
    }
    if (field === 'end') {
      setEndHour(val);
      updateData('endHour', val);
    }
  };

  const onDelete = () => {
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
    setEdges((edges) => edges.filter((edge) => edge.source !== id && edge.target !== id));
  };

  return (
    <div className="custom-node" style={{ borderColor: '#8b5cf6' }}>
      <div className="custom-node-header" style={{ color: '#8b5cf6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={16} /> Time Filter
        </div>
        <Trash2 size={14} className="node-delete-btn" onClick={onDelete} style={{ color: 'var(--text-muted)' }} />
      </div>
      
      <div className="custom-node-body">
        <label>Trading Session</label>
        <select value={session} onChange={onSessionChange}>
          <option value="Always">24/7 (Always Active)</option>
          <option value="London">London Session (08:00 - 16:30)</option>
          <option value="New York">New York Session (13:00 - 22:00)</option>
          <option value="Tokyo">Tokyo Session (00:00 - 09:00)</option>
          <option value="Custom">Custom Hours</option>
        </select>
        
        {session === 'Custom' && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ flex: 1 }}>
              <label>Start</label>
              <input type="time" value={startHour} onChange={(e) => onTimeChange('start', e.target.value)} />
            </div>
            <div style={{ flex: 1 }}>
              <label>End</label>
              <input type="time" value={endHour} onChange={(e) => onTimeChange('end', e.target.value)} />
            </div>
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Right} isConnectable={isConnectable} />
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} />
    </div>
  );
}
