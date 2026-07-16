import React from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';
import { ArrowRightLeft, Trash2 } from 'lucide-react';

export default function LogicNode({ id, data }) {
  const { setNodes, setEdges } = useReactFlow();

  const onDelete = () => {
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
    setEdges((edges) => edges.filter((edge) => edge.source !== id && edge.target !== id));
  };

  return (
    <div className="custom-node" style={{ borderColor: '#eab30855' }}>
      <Handle type="target" position={Position.Left} id="in1" style={{ top: '30%' }} />
      <Handle type="target" position={Position.Left} id="in2" style={{ top: '70%' }} />
      
      <div className="custom-node-header" style={{ color: '#eab308', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ArrowRightLeft size={16} />
          {data.operator}
        </div>
        <Trash2 size={14} className="node-delete-btn" onClick={onDelete} style={{ color: 'var(--text-muted)' }} />
      </div>
      <div className="custom-node-body">
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center' }}>
          Evaluates condition
        </p>
      </div>
      
      <Handle type="source" position={Position.Right} id="out" />
    </div>
  );
}
