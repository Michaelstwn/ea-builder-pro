import React, { useState, useEffect } from 'react';
import { Activity, ArrowRightLeft, Play, TrendingUp, BarChart, Hash, ChevronDown, ChevronRight, Shield, Clock, Grid3X3, ShieldAlert, Bell, UploadCloud, Lock, Code } from 'lucide-react';
import { INDICATORS_CONFIG } from '../engine/indicators';
import { parseCustomIndicator } from '../engine/aiParser';

const iconMap = {
  TrendingUp: <TrendingUp size={16} color="var(--accent)" />,
  Activity: <Activity size={16} color="#c084fc" />,
  BarChart: <BarChart size={16} color="#10b981" />
};

export default function NodePalette({ projectType = 'EA' }) {
  const [expanded, setExpanded] = useState({
    'Trend': true,
    'Oscillators': false,
    'Volumes': false,
    'Bill Williams': false,
    'Logic': true,
    'Market Actions': true,
    'Pending Orders': false,
    'Risk Management': false,
    'Custom': true,
    'Security': true,
    'Advanced': true
  });

  const toggleCategory = (cat) => {
    setExpanded(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const onDragStart = (event, nodeType, nodeData) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('application/json', JSON.stringify(nodeData));
    event.dataTransfer.effectAllowed = 'move';
  };

  const [customIndicators, setCustomIndicators] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('custom_indicators');
    if (saved) {
      try { setCustomIndicators(JSON.parse(saved)); } catch (e) { }
    }
  }, []);

  const handleCustomUpload = async (file) => {
    if (!file) return;
    setIsUploading(true);
    try {
      const text = await file.text();
      const parsed = await parseCustomIndicator(text, file.name);
      
      const newInds = [...customIndicators, parsed];
      setCustomIndicators(newInds);
      localStorage.setItem('custom_indicators', JSON.stringify(newInds));
      alert(`Successfully imported: ${parsed.name}`);
    } catch (err) {
      alert(`Error importing indicator: ${err.message}`);
    }
    setIsUploading(false);
  };

  const renderIndicatorsByCategory = (categoryTitle) => {
    if (!expanded[categoryTitle]) return null;
    
    // Built-in indicators
    const builtIns = Object.keys(INDICATORS_CONFIG)
      .filter(key => INDICATORS_CONFIG[key].category === categoryTitle)
      .map(key => {
        const ind = INDICATORS_CONFIG[key];
        const defaultParams = {};
        if (ind.schema) {
          ind.schema.forEach(field => {
            defaultParams[field.name] = field.default;
          });
        }

        return (
          <div 
            key={key}
            className="draggable-item" 
            onDragStart={(e) => onDragStart(e, 'indicator', { 
              name: ind.name, 
              indicatorId: key, 
              schema: ind.schema,
              params: defaultParams,
              isCustom: false
            })} 
            draggable
          >
            {iconMap[ind.icon] || <Activity size={16} color="var(--accent)" />}
            {ind.name}
          </div>
        );
      });

    // Custom indicators matching this category (or default to Trend if not matching standard)
    const customs = customIndicators
      .filter(ind => (ind.category === categoryTitle) || (categoryTitle === 'Trend' && !['Oscillators', 'Volumes', 'Bill Williams'].includes(ind.category)))
      .map(ind => {
        const defaultParams = {};
        if (ind.schema) {
          ind.schema.forEach(field => {
            defaultParams[field.name] = field.default;
          });
        }

        return (
          <div 
            key={ind.id}
            className="draggable-item" style={{ borderLeft: '3px solid #8b5cf6' }}
            onDragStart={(e) => onDragStart(e, 'indicator', { 
              name: ind.name, 
              indicatorId: ind.id, 
              schema: ind.schema,
              params: defaultParams,
              isCustom: true
            })} 
            draggable
          >
            {iconMap[ind.icon] || <Activity size={16} color="#8b5cf6" />}
            {ind.name} (Custom)
          </div>
        );
      });

    return [...builtIns, ...customs];
  };

  return (
    <aside className="sidebar" style={{ width: '280px', overflowY: 'auto', paddingBottom: '120px' }}>
      
      <div 
        style={{ margin: '16px 16px 8px', padding: '16px', border: '1px dashed var(--border)', borderRadius: '8px', textAlign: 'center', cursor: 'pointer', fontSize: '12px', color: 'var(--text-muted)' }}
        onClick={() => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = '.mq4,.mq5';
          input.onchange = (e) => handleCustomUpload(e.target.files[0]);
          input.click();
        }}
      >
        <UploadCloud size={24} style={{ margin: '0 auto 8px' }} />
        {isUploading ? "AI is Parsing MQL..." : "Import Custom Indicator (.mq4/.mq5)"}
      </div>
      {projectType === 'EA' && (
        <>
          <div className="section-title" onClick={() => toggleCategory('Timeframe')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            Time Filters {expanded['Timeframe'] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </div>
          {expanded['Timeframe'] && (
            <>
              <div className="draggable-item" onDragStart={(e) => onDragStart(e, 'timeframe', { session: 'Always' })} draggable>
                <Clock size={16} color="#8b5cf6" /> Time Filter / Session
              </div>
            </>
          )}

          <div className="section-title" onClick={() => toggleCategory('Power Features')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            Power Features {expanded['Power Features'] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </div>
          {expanded['Power Features'] && (
            <>
              <div className="draggable-item" onDragStart={(event) => onDragStart(event, 'timeframe', { session: 'London' })} draggable>
                <Clock size={16} color="#8b5cf6" /> Time Filter
              </div>
              <div className="draggable-item" onDragStart={(event) => onDragStart(event, 'grid', { multiplier: 2.0, step: 20 })} draggable>
                <Grid3X3 size={16} color="#f59e0b" /> Grid / Martingale
              </div>
              <div className="draggable-item" onDragStart={(event) => onDragStart(event, 'drawdown', { maxDrawdown: 5.0 })} draggable>
                <ShieldAlert size={16} color="#f43f5e" /> Drawdown Protector
              </div>
              <div className="draggable-item" onDragStart={(e) => onDragStart(e, 'partialClose', { 
                triggerPips: 50, closePercent: 50
              })} draggable>
                <Shield size={16} color="#f43f5e" /> Partial Close
              </div>
              <div className="draggable-item" onDragStart={(e) => onDragStart(e, 'newsFilter', { 
                minsBefore: 30, minsAfter: 30, impact: 'High'
              })} draggable>
                <Bell size={16} color="#6366f1" /> News Filter
              </div>
              <div className="draggable-item" onDragStart={(event) => onDragStart(event, 'tradeManagement', { trailingStop: 20, breakEven: 15 })} draggable>
                <ShieldAlert size={16} color="#fbbf24" /> Trade Management
              </div>
            </>
          )}
        </>
      )}

      {projectType === 'Indicator' && (
        <>
          <div className="section-title" onClick={() => toggleCategory('Outputs')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            Indicator Outputs {expanded['Outputs'] !== false ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </div>
          {expanded['Outputs'] !== false && (
            <div className="draggable-item" onDragStart={(e) => onDragStart(e, 'buffer', { bufferId: 0, style: 'DRAW_LINE', color: 'clrRed' })} draggable>
              <Activity size={16} color="#8b5cf6" /> Buffer Output
            </div>
          )}
        </>
      )}

      <div className="section-title" onClick={() => toggleCategory('Trend')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        Trend Indicators {expanded['Trend'] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </div>
      {renderIndicatorsByCategory('Trend')}

      <div className="section-title" onClick={() => toggleCategory('Oscillators')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        Oscillators {expanded['Oscillators'] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </div>
      {renderIndicatorsByCategory('Oscillators')}

      <div className="section-title" onClick={() => toggleCategory('Volumes')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        Volumes {expanded['Volumes'] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </div>
      {renderIndicatorsByCategory('Volumes')}
      
      <div className="section-title" onClick={() => toggleCategory('Bill Williams')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        Bill Williams {expanded['Bill Williams'] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </div>
      {renderIndicatorsByCategory('Bill Williams')}

      {projectType === 'EA' && (
        <>
          <div className="section-title" onClick={() => toggleCategory('Actions')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            Actions {expanded['Actions'] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </div>
          {expanded['Actions'] && (
            <>
              <div className="draggable-item" onDragStart={(e) => onDragStart(e, 'action', { action: 'Buy' })} draggable>
                <Play size={16} color="var(--buy-color)" /> Buy Action
              </div>
              <div className="draggable-item" onDragStart={(e) => onDragStart(e, 'action', { action: 'Sell' })} draggable>
                <Play size={16} color="var(--sell-color)" /> Sell Action
              </div>
              <div className="draggable-item" onDragStart={(e) => onDragStart(e, 'alert', { alertType: 'Popup Alert', message: 'Signal Triggered!' })} draggable>
                <Bell size={16} color="var(--accent)" /> Send Alert
              </div>
            </>
          )}
        </>
      )}

      <div className="section-title" onClick={() => toggleCategory('Logic')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        Logic / Condition {expanded['Logic'] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </div>
      {expanded['Logic'] && (
        <>
          <div className="draggable-item" onDragStart={(e) => onDragStart(e, 'logic', { operator: 'Crossover' })} draggable>
            <ArrowRightLeft size={16} color="#eab308" /> Crosses Over
          </div>
          <div className="draggable-item" onDragStart={(e) => onDragStart(e, 'logic', { operator: 'Crossunder' })} draggable>
            <ArrowRightLeft size={16} color="#eab308" /> Crosses Under
          </div>
          <div className="draggable-item" onDragStart={(e) => onDragStart(e, 'logic', { operator: 'Greater Than' })} draggable>
            <Hash size={16} color="#eab308" /> Greater Than ({'>'})
          </div>
          <div className="draggable-item" onDragStart={(e) => onDragStart(e, 'logic', { operator: 'Less Than' })} draggable>
            <Hash size={16} color="#eab308" /> Less Than ({'<'})
          </div>
        </>
      )}

      {projectType === 'EA' && (
        <>
          <div className="section-title" onClick={() => toggleCategory('Market Actions')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            Market Actions {expanded['Market Actions'] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </div>
          {expanded['Market Actions'] && (
            <>
              <div className="draggable-item" onDragStart={(e) => onDragStart(e, 'action', { 
                action: 'Buy Market', 
                schema: [ { name: 'lots', label: 'Lot Size', type: 'number', step: 0.01, default: 0.1 } ],
                params: { lots: 0.1 }
              })} draggable style={{ borderLeft: '3px solid var(--buy-color)' }}>
                <Play size={16} color="var(--buy-color)" /> Buy Market
              </div>
              <div className="draggable-item" onDragStart={(e) => onDragStart(e, 'action', { 
                action: 'Sell Market',
                schema: [ { name: 'lots', label: 'Lot Size', type: 'number', step: 0.01, default: 0.1 } ],
                params: { lots: 0.1 }
              })} draggable style={{ borderLeft: '3px solid var(--sell-color)' }}>
                <Play size={16} color="var(--sell-color)" /> Sell Market
              </div>
            </>
          )}
        </>
      )}

      {projectType === 'EA' && (
        <>
          <div className="section-title" onClick={() => toggleCategory('Pending Orders')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            Pending Orders {expanded['Pending Orders'] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </div>
          {expanded['Pending Orders'] && (
            <>
              <div className="draggable-item" onDragStart={(e) => onDragStart(e, 'action', { 
                action: 'Buy Limit',
                schema: [ 
                  { name: 'lots', label: 'Lot Size', type: 'number', step: 0.01, default: 0.1 },
                  { name: 'distance', label: 'Distance (Points)', type: 'number', step: 10, default: 100 }
                ],
                params: { lots: 0.1, distance: 100 }
              })} draggable style={{ borderLeft: '3px solid var(--buy-color)' }}>
                <Play size={16} color="var(--buy-color)" /> Buy Limit
              </div>
              <div className="draggable-item" onDragStart={(e) => onDragStart(e, 'action', { 
                action: 'Sell Limit',
                schema: [ 
                  { name: 'lots', label: 'Lot Size', type: 'number', step: 0.01, default: 0.1 },
                  { name: 'distance', label: 'Distance (Points)', type: 'number', step: 10, default: 100 }
                ],
                params: { lots: 0.1, distance: 100 }
              })} draggable style={{ borderLeft: '3px solid var(--sell-color)' }}>
                <Play size={16} color="var(--sell-color)" /> Sell Limit
              </div>
              <div className="draggable-item" onDragStart={(e) => onDragStart(e, 'action', { 
                action: 'Buy Stop',
                schema: [ 
                  { name: 'lots', label: 'Lot Size', type: 'number', step: 0.01, default: 0.1 },
                  { name: 'distance', label: 'Distance (Points)', type: 'number', step: 10, default: 100 }
                ],
                params: { lots: 0.1, distance: 100 }
              })} draggable style={{ borderLeft: '3px solid var(--buy-color)' }}>
                <Play size={16} color="var(--buy-color)" /> Buy Stop
              </div>
              <div className="draggable-item" onDragStart={(e) => onDragStart(e, 'action', { 
                action: 'Sell Stop',
                schema: [ 
                  { name: 'lots', label: 'Lot Size', type: 'number', step: 0.01, default: 0.1 },
                  { name: 'distance', label: 'Distance (Points)', type: 'number', step: 10, default: 100 }
                ],
                params: { lots: 0.1, distance: 100 }
              })} draggable style={{ borderLeft: '3px solid var(--sell-color)' }}>
                <Play size={16} color="var(--sell-color)" /> Sell Stop
              </div>
            </>
          )}
        </>
      )}

      {projectType === 'EA' && (
        <>
          <div className="section-title" onClick={() => toggleCategory('Risk Management')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            Risk Management {expanded['Risk Management'] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </div>
          {expanded['Risk Management'] && (
            <>
              <div className="draggable-item" onDragStart={(e) => onDragStart(e, 'risk', { 
                type: 'Trailing Stop',
                params: { distance_points: 150, step_points: 50 }
              })} draggable>
                <Shield size={16} color="#fbbf24" /> Trailing Stop
              </div>
              <div className="draggable-item" onDragStart={(e) => onDragStart(e, 'risk', { 
                type: 'Break Even',
                params: { activation_points: 200, offset_points: 10 }
              })} draggable>
                <Shield size={16} color="#fbbf24" /> Break Even
              </div>
              <div className="draggable-item" onDragStart={(e) => onDragStart(e, 'risk', { sl: 50, tp: 100 })} draggable>
                <Shield size={16} color="#ef4444" /> Stop Loss / Take Profit
              </div>
            </>
          )}
        </>
      )}

      {projectType === 'EA' && (
        <>
          <div className="section-title" onClick={() => toggleCategory('Security')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            Security {expanded['Security'] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </div>
          {expanded['Security'] && (
            <>
              <div className="draggable-item" onDragStart={(e) => onDragStart(e, 'license', { accountNumber: '', expiryDate: '' })} draggable>
                <Lock size={16} color="#8b5cf6" /> EA License Protection
              </div>
            </>
          )}

          <div className="section-title" onClick={() => toggleCategory('Advanced')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            Advanced {expanded['Advanced'] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </div>
          {expanded['Advanced'] && (
            <>
              <div className="draggable-item" onDragStart={(e) => onDragStart(e, 'customCode', { location: 'OnTick', code: '' })} draggable>
                <Code size={16} color="#6366f1" /> Custom MQL Code
              </div>
            </>
          )}
        </>
      )}
    </aside>
  );
}
