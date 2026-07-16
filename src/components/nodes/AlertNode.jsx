import React, { useState } from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';
import { Bell, Trash2 } from 'lucide-react';

export default function AlertNode({ id, data }) {
  const { setNodes, setEdges } = useReactFlow();
  const [message, setMessage] = useState(data.message || 'Signal Triggered!');
  const [alertType, setAlertType] = useState(data.alertType || 'Popup Alert');

  const onDelete = () => {
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
    setEdges((edges) => edges.filter((edge) => edge.source !== id && edge.target !== id));
  };

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

  const handleMessageChange = (val) => {
    setMessage(val);
    updateData('message', val);
  };

  const handleTypeChange = (val) => {
    setAlertType(val);
    updateData('alertType', val);
  };
  
  return (
    <div className="custom-node" style={{ borderColor: 'var(--accent)' }}>
      <Handle type="target" position={Position.Left} id="in" />
      <div className="custom-node-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent)' }}>
          <Bell size={16} />
          {data.action || 'Send Alert'}
        </div>
        <Trash2 size={14} className="node-delete-btn" onClick={onDelete} style={{ color: 'var(--text-muted)' }} />
      </div>
      <div className="custom-node-body">
        <div style={{ marginBottom: '8px' }}>
          <label style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Alert Type</label>
          <select
            value={alertType}
            onChange={(e) => handleTypeChange(e.target.value)}
            style={{ width: '100%', padding: '4px', marginTop: '2px', backgroundColor: 'var(--bg-panel)', color: 'white', border: '1px solid var(--border)', borderRadius: '4px' }}
          >
            <option value="Popup Alert" style={{ backgroundColor: '#1c1e26' }}>Popup Alert</option>
            <option value="Push Notification" style={{ backgroundColor: '#1c1e26' }}>Push Notification</option>
            <option value="Print to Journal" style={{ backgroundColor: '#1c1e26' }}>Print to Journal</option>
          </select>
        </div>
        <div style={{ marginBottom: '8px' }}>
          <label style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Message</label>
          <input 
            type="text" 
            value={message}
            onChange={(e) => handleMessageChange(e.target.value)}
            style={{ width: '100%', padding: '4px', marginTop: '2px', backgroundColor: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid var(--border)', borderRadius: '4px' }}
          />
        </div>
      </div>
    </div>
  );
}
