import React, { useState } from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';
import { Activity, Trash2 } from 'lucide-react';

export default function IndicatorNode({ id, data }) {
  const { setNodes, setEdges } = useReactFlow();
  
  // Initialize state from data.params
  const [params, setParams] = useState(data.params || {});
  const [timeframe, setTimeframe] = useState(data.timeframe || 'Current');
  const [symbol, setSymbol] = useState(data.symbol || 'Current');

  const onDelete = () => {
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
    setEdges((edges) => edges.filter((edge) => edge.source !== id && edge.target !== id));
  };

  const handleTimeframeChange = (val) => {
    setTimeframe(val);
    updateNodeData('timeframe', val);
  };

  const handleSymbolChange = (val) => {
    setSymbol(val);
    updateNodeData('symbol', val);
  };

  const updateNodeData = (field, value) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          node.data = {
            ...node.data,
            [field]: value,
          };
        }
        return node;
      })
    );
  };

  const handleParamChange = (name, value) => {
    const newParams = { ...params, [name]: value };
    setParams(newParams);
    updateNodeData('params', newParams);
  };

  return (
    <div className="custom-node" style={{ borderColor: 'var(--accent-border)' }}>
      <div className="custom-node-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={16} />
          {data.name}
        </div>
        <Trash2 size={14} className="node-delete-btn" onClick={onDelete} />
      </div>
      <div className="custom-node-body">
        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Symbol</label>
            <select
              value={symbol}
              onChange={(e) => handleSymbolChange(e.target.value)}
              style={{ width: '100%', padding: '4px', marginTop: '2px', backgroundColor: 'var(--bg-panel)', color: 'white', border: '1px solid var(--border)', borderRadius: '4px' }}
            >
              {['Current', 'EURUSD', 'GBPUSD', 'USDJPY', 'XAUUSD', 'BTCUSD'].map(opt => (
                <option key={opt} value={opt} style={{ backgroundColor: '#1c1e26', color: 'white' }}>{opt}</option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Timeframe</label>
            <select
              value={timeframe}
              onChange={(e) => handleTimeframeChange(e.target.value)}
              style={{ width: '100%', padding: '4px', marginTop: '2px', backgroundColor: 'var(--bg-panel)', color: 'white', border: '1px solid var(--border)', borderRadius: '4px' }}
            >
              {['Current', 'M1', 'M5', 'M15', 'M30', 'H1', 'H4', 'D1', 'W1', 'MN1'].map(opt => (
                <option key={opt} value={opt} style={{ backgroundColor: '#1c1e26', color: 'white' }}>{opt}</option>
              ))}
            </select>
          </div>
        </div>
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
                value={params[field.name]}
                onChange={(e) => handleParamChange(field.name, parseFloat(e.target.value))}
                style={{ width: '100%', padding: '4px', marginTop: '2px', backgroundColor: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid var(--border)', borderRadius: '4px' }}
              />
            )}
          </div>
        ))}
        {!data.schema && (
           <div style={{ marginBottom: '8px' }}>
            <label style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Period</label>
            <input type="number" defaultValue={14} style={{ width: '100%', padding: '4px', marginTop: '2px', backgroundColor: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid var(--border)', borderRadius: '4px' }} />
           </div>
        )}
      </div>
      <Handle type="source" position={Position.Right} id="out" />
    </div>
  );
}
