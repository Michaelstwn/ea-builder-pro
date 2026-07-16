import React, { useState, useCallback, useRef, useEffect } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Play, Save } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import IndicatorNode from '../components/nodes/IndicatorNode';
import LogicNode from '../components/nodes/LogicNode';
import ActionNode from '../components/nodes/ActionNode';
import RiskNode from '../components/nodes/RiskNode';
import TimeframeNode from '../components/nodes/TimeframeNode';
import GridNode from '../components/nodes/GridNode';
import DrawdownNode from '../components/nodes/DrawdownNode';
import TradeManagementNode from '../components/nodes/TradeManagementNode';
import AlertNode from '../components/nodes/AlertNode';
import PartialCloseNode from '../components/nodes/PartialCloseNode';
import NewsFilterNode from '../components/nodes/NewsFilterNode';
import BufferNode from '../components/nodes/BufferNode';
import LicenseNode from '../components/nodes/LicenseNode';
import CustomCodeNode from '../components/nodes/CustomCodeNode';
import NodePalette from '../components/NodePalette';
import AIAssistant from '../components/AIAssistant';
import { generateMQL5 } from '../engine/generator';
import { generateMQL4 } from '../engine/generator_mql4';
import { generateIndMQL5 } from '../engine/generator_ind_mq5';
import { generateIndMQL4 } from '../engine/generator_ind_mq4';

// Register custom nodes
const nodeTypes = {
  indicator: IndicatorNode,
  logic: LogicNode,
  action: ActionNode,
  risk: RiskNode,
  timeframe: TimeframeNode,
  grid: GridNode,
  drawdown: DrawdownNode,
  tradeManagement: TradeManagementNode,
  alert: AlertNode,
  partialClose: PartialCloseNode,
  newsFilter: NewsFilterNode,
  buffer: BufferNode,
  license: LicenseNode,
  customCode: CustomCodeNode,
};

let id = 0;
const getId = () => `dndnode_${Date.now()}_${id++}`;

export default function Editor() {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');
  
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [currentProject, setCurrentProject] = useState(null);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Load project from LocalStorage
  useEffect(() => {
    if (projectId) {
      const saved = localStorage.getItem('ea_projects');
      if (saved) {
        const projects = JSON.parse(saved);
        const proj = projects.find(p => p.id === projectId);
        if (proj) {
          setCurrentProject(proj);
          setNodes(proj.nodes || []);
          setEdges(proj.edges || []);
        }
      }
    } else {
       // Clear if no project
       setCurrentProject(null);
       setNodes([]);
       setEdges([]);
    }
  }, [projectId, setNodes, setEdges]);

  // Auto-save nodes/edges when they change, if we have a project
  const saveProjectState = useCallback((newNodes, newEdges) => {
    if (!currentProject) return;
    const saved = localStorage.getItem('ea_projects');
    if (saved) {
      const projects = JSON.parse(saved);
      const idx = projects.findIndex(p => p.id === currentProject.id);
      if (idx !== -1) {
        projects[idx].nodes = newNodes;
        projects[idx].edges = newEdges;
        projects[idx].updatedAt = new Date().toISOString();
        localStorage.setItem('ea_projects', JSON.stringify(projects));
        
        // Auto-Register Indicator
        if (currentProject.type === 'Indicator') {
          const customInds = JSON.parse(localStorage.getItem('custom_indicators') || '[]');
          
          // Generate Schema from Indicator inputs
          const schema = [];
          const usedIndicators = newNodes.filter(n => n.type === 'indicator');
          usedIndicators.forEach(ind => {
             const params = ind.data.params || {};
             Object.keys(params).forEach(k => {
               schema.push({ name: `${ind.data.name}_${k}`, label: `${ind.data.name} ${k}`, type: typeof params[k] === 'number' ? 'number' : 'string', default: params[k] });
             });
          });

          const newInd = {
             id: currentProject.id,
             name: currentProject.name,
             icon: 'Activity',
             category: 'Trend', // default category for custom
             schema: schema
          };

          const existingIdx = customInds.findIndex(i => i.id === currentProject.id);
          if (existingIdx !== -1) {
             customInds[existingIdx] = newInd;
          } else {
             customInds.push(newInd);
          }
          localStorage.setItem('custom_indicators', JSON.stringify(customInds));
        }
      }
    }
  }, [currentProject]);

  // Hook into node/edge changes to auto-save
  useEffect(() => {
     if (currentProject) saveProjectState(nodes, edges);
  }, [nodes, edges, currentProject, saveProjectState]);

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      const nodeData = JSON.parse(event.dataTransfer.getData('application/json'));

      // check if the dropped element is valid
      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      
      const newNode = {
        id: getId(),
        type,
        position,
        data: nodeData,
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  const saveToDisk = async (code, filenameStr, ext) => {
    if (window.ipcRenderer) {
      const result = await window.ipcRenderer.invoke('save-ea-file', { content: code, defaultPath: filenameStr, extension: ext });
      return result.success;
    } else {
      const blob = new Blob([code], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filenameStr;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return true;
    }
  };

  const handleGenerate = async (target) => {
    setShowExportMenu(false);
    
    let successCount = 0;
    const isInd = currentProject && currentProject.type === 'Indicator';
    
    if (target === 'mq5' || target === 'both') {
      const code5 = isInd ? generateIndMQL5(nodes, edges, currentProject?.name || 'Indicator') : generateMQL5(nodes, edges);
      const file5 = currentProject ? `${currentProject.name.replace(/\s+/g, '_')}_v${currentProject.version}.mq5` : (isInd ? 'MyInd_v1.mq5' : 'MyEA_v1.mq5');
      const ok = await saveToDisk(code5, file5, 'mq5');
      if (ok) successCount++;
    }
    
    if (target === 'mq4' || target === 'both') {
      const code4 = isInd ? generateIndMQL4(nodes, edges, currentProject?.name || 'Indicator') : generateMQL4(nodes, edges);
      const file4 = currentProject ? `${currentProject.name.replace(/\s+/g, '_')}_v${currentProject.version}.mq4` : (isInd ? 'MyInd_v1.mq4' : 'MyEA_v1.mq4');
      const ok = await saveToDisk(code4, file4, 'mq4');
      if (ok) successCount++;
    }

    if (successCount > 0) {
      alert(`Successfully saved ${successCount} file(s)!`);
      if (currentProject) {
        const saved = localStorage.getItem('ea_projects');
        const projects = JSON.parse(saved);
        const idx = projects.findIndex(p => p.id === currentProject.id);
        if (idx !== -1) {
           projects[idx].version += 1;
           projects[idx].updatedAt = new Date().toISOString();
           localStorage.setItem('ea_projects', JSON.stringify(projects));
           setCurrentProject(projects[idx]);
        }
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: 'var(--bg-canvas)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h2 style={{ fontSize: '14px', margin: 0, fontWeight: 500 }}>
            Visual Editor {currentProject && <span style={{ color: 'var(--accent)', marginLeft: '8px' }}>- {currentProject.name} (v{currentProject.version})</span>}
          </h2>
          {currentProject && <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}><Save size={12}/> Auto-saved</div>}
        </div>
        <div style={{ position: 'relative' }}>
          <button className="btn-primary" onClick={() => setShowExportMenu(!showExportMenu)} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Play size={14} /> Generate EA
          </button>
          
          {showExportMenu && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '8px',
              backgroundColor: 'var(--bg-panel)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '6px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              minWidth: '160px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
              zIndex: 100
            }}>
              <button className="btn-secondary" onClick={() => handleGenerate('mq4')} style={{ textAlign: 'left' }}>Export MT4 (.mq4)</button>
              <button className="btn-secondary" onClick={() => handleGenerate('mq5')} style={{ textAlign: 'left' }}>Export MT5 (.mq5)</button>
              <button className="btn-secondary" onClick={() => handleGenerate('both')} style={{ textAlign: 'left', borderTop: '1px solid var(--border)', marginTop: '4px' }}>Export Both</button>
            </div>
          )}
        </div>
      </div>
      
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <ReactFlowProvider>
          {/* Editor Sidebar */}
          <NodePalette projectType={currentProject?.type || 'EA'} />
          
          {/* React Flow Canvas */}
          <div className="main-canvas" ref={reactFlowWrapper} style={{ position: 'relative' }}>
              <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onInit={setReactFlowInstance}
              onDrop={onDrop}
              onDragOver={onDragOver}
              nodeTypes={nodeTypes}
              defaultEdgeOptions={{ animated: true }}
              fitView
              theme="dark"
            >
              <Controls />
              <MiniMap 
                style={{ bottom: 40, right: 20, backgroundColor: '#ffffff' }}
                nodeStrokeColor={(n) => {
                  if (n.type === 'indicator') return '#8b5cf6'; // Purple
                  if (n.type === 'action') return '#0ea5e9'; // Teal
                if (n.type === 'risk') return '#ef4444'; // Red
                return '#333';
              }} nodeColor={(n) => 'rgba(20, 20, 25, 0.8)'} maskColor="rgba(0,0,0,0.8)" />
              <Background color="#2e323e" gap={16} size={1} />
            </ReactFlow>
            <AIAssistant />
          </div>
        </ReactFlowProvider>
      </div>
    </div>
  );
}
