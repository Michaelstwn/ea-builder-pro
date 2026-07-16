import React, { useState, useEffect, useRef } from 'react';
import Papa from 'papaparse';
import { createChart } from 'lightweight-charts';
import { Upload, Play, CheckCircle, Activity, BarChart2 } from 'lucide-react';
import { runSimulation } from '../engine/SimulatorEngine';

export default function Preview() {
  const chartContainerRef = useRef(null);
  const equityContainerRef = useRef(null);
  const [chart, setChart] = useState(null);
  const [equityChart, setEquityChart] = useState(null);
  const [candlestickSeries, setCandlestickSeries] = useState(null);
  const [equitySeries, setEquitySeries] = useState(null);
  
  const [data, setData] = useState([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [metrics, setMetrics] = useState(null);
  
  useEffect(() => {
    if (chartContainerRef.current) {
      const newChart = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height: chartContainerRef.current.clientHeight,
        layout: { background: { color: 'transparent' }, textColor: '#A0AEC0' },
        grid: { vertLines: { color: '#2d3748' }, horzLines: { color: '#2d3748' } },
        timeScale: { timeVisible: true, secondsVisible: false }
      });
      const newSeries = newChart.addCandlestickSeries({
        upColor: '#10b981', downColor: '#ef4444', borderVisible: false,
        wickUpColor: '#10b981', wickDownColor: '#ef4444'
      });
      setChart(newChart);
      setCandlestickSeries(newSeries);
      
      const handleResize = () => {
        if(chartContainerRef.current) {
           newChart.applyOptions({ width: chartContainerRef.current.clientWidth, height: chartContainerRef.current.clientHeight });
        }
      };
      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('resize', handleResize);
        newChart.remove();
      };
    }
  }, []);

  useEffect(() => {
    if (equityContainerRef.current && !equityChart) {
      const eqChart = createChart(equityContainerRef.current, {
        width: equityContainerRef.current.clientWidth,
        height: equityContainerRef.current.clientHeight,
        layout: { background: { color: 'transparent' }, textColor: '#A0AEC0' },
        grid: { vertLines: { color: '#2d3748' }, horzLines: { color: '#2d3748' } },
        timeScale: { timeVisible: true, secondsVisible: false }
      });
      const eqSeries = eqChart.addLineSeries({
        color: '#3b82f6', lineWidth: 2
      });
      setEquityChart(eqChart);
      setEquitySeries(eqSeries);

      const handleResize = () => {
        if(equityContainerRef.current) {
           eqChart.applyOptions({ width: equityContainerRef.current.clientWidth, height: equityContainerRef.current.clientHeight });
        }
      };
      window.addEventListener('resize', handleResize);
      return () => {
         window.removeEventListener('resize', handleResize);
         eqChart.remove();
      };
    }
  }, [equityChart]);

  // Sync the two charts
  useEffect(() => {
    if (chart && equityChart) {
      chart.timeScale().subscribeVisibleLogicalRangeChange((range) => {
        if (range) equityChart.timeScale().setVisibleLogicalRange(range);
      });
      equityChart.timeScale().subscribeVisibleLogicalRangeChange((range) => {
        if (range) chart.timeScale().setVisibleLogicalRange(range);
      });
    }
  }, [chart, equityChart]);

  const parseCSVData = (csvInput) => {
    Papa.parse(csvInput, {
      header: true, skipEmptyLines: true,
      complete: (results) => {
        try {
          const parsedData = results.data.map(row => {
            const dateStr = row['<DATE>'] && row['<TIME>'] ? `${row['<DATE>']} ${row['<TIME>']}` : row['Date'] || row['Time'];
            const timeObj = new Date(dateStr);
            const time = timeObj.getTime() / 1000;
            return {
              time: isNaN(time) ? dateStr : time, 
              open: parseFloat(row['<OPEN>'] || row['Open']),
              high: parseFloat(row['<HIGH>'] || row['High']),
              low: parseFloat(row['<LOW>'] || row['Low']),
              close: parseFloat(row['<CLOSE>'] || row['Close']),
            };
          }).filter(d => d.open && d.high && d.low && d.close);
          
          parsedData.sort((a,b) => a.time - b.time);
          setData(parsedData);
          if (candlestickSeries) {
            candlestickSeries.setData(parsedData);
            chart.timeScale().fitContent();
          }
        } catch (err) {
          alert("Error parsing CSV data. Please ensure it has standard Date/Open/High/Low/Close headers.");
        }
      }
    });
  };

  useEffect(() => {
    const loadDefaultData = async () => {
      const defaultPath = localStorage.getItem('default_mt5_data_path');
      if (defaultPath && window.ipcRenderer) {
        try {
          const res = await window.ipcRenderer.invoke('read-file', { filePath: defaultPath });
          if (res.success) parseCSVData(res.content);
        } catch (err) { }
      }
    };
    if (candlestickSeries) loadDefaultData();
  }, [candlestickSeries]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    parseCSVData(file);
  };

  const fetchLiveData = async () => {
    try {
      const res = await fetch('http://127.0.0.1:5000/ohlcv?symbol=EURUSD&timeframe=H1');
      if (!res.ok) throw new Error("Server error");
      const jsonData = await res.json();
      
      const parsedData = jsonData.map(row => {
        const timeObj = new Date(row.time);
        return {
          time: timeObj.getTime() / 1000,
          open: row.open,
          high: row.high,
          low: row.low,
          close: row.close
        };
      }).filter(d => d.open && d.high && d.low && d.close);
      
      parsedData.sort((a,b) => a.time - b.time);
      setData(parsedData);
      if (candlestickSeries) {
        candlestickSeries.setData(parsedData);
        chart.timeScale().fitContent();
      }
    } catch (err) {
      alert("Failed to fetch from Python MT5 Server. Make sure backend/server.py is running!");
    }
  };

  const handleRunSimulation = () => {
    if (data.length === 0) {
      alert("Please upload a CSV file first.");
      return;
    }
    setIsSimulating(true);
    
    setTimeout(() => {
      // Get current project nodes & edges
      const saved = localStorage.getItem('ea_projects');
      let nodes = [];
      let edges = [];
      if (saved) {
        const projects = JSON.parse(saved);
        if (projects.length > 0) {
          nodes = projects[0].nodes || [];
          edges = projects[0].edges || [];
        }
      }

      if (nodes.length === 0) {
        alert("No valid project found. Please create nodes in the Editor first.");
        setIsSimulating(false);
        return;
      }

      const simResult = runSimulation(nodes, edges, data);
      
      let markers = [];
      simResult.trades.forEach((t) => {
        if (t.type.includes('Open')) {
          const isBuy = t.type === 'OpenBuy';
          markers.push({
            time: t.time,
            position: isBuy ? 'belowBar' : 'aboveBar',
            color: isBuy ? '#10b981' : '#ef4444',
            shape: isBuy ? 'arrowUp' : 'arrowDown',
            text: isBuy ? 'Buy' : 'Sell',
            size: 2
          });
        }
      });
      
      if (candlestickSeries) candlestickSeries.setMarkers(markers);
      if (equitySeries) {
         equitySeries.setData(simResult.equityCurve);
         equityChart.timeScale().fitContent();
      }
      
      setMetrics(simResult.metrics);
      setIsSimulating(false);
    }, 500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: 'var(--bg-canvas)', borderBottom: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: '14px', margin: 0, fontWeight: 500 }}>Advanced Backtesting Engine</h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            className="btn-secondary"
            onClick={fetchLiveData}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Activity size={16} /> Fetch MT5 Live Data
          </button>
          <label className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            <Upload size={14} /> Upload Data (CSV)
            <input type="file" accept=".csv" onChange={handleFileUpload} style={{ display: 'none' }} />
          </label>
          <button className="btn-primary" onClick={handleRunSimulation} disabled={isSimulating} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {isSimulating ? <><Activity size={14} className="spin" /> Simulating...</> : <><Play size={14} /> Run Simulation</>}
          </button>
        </div>
      </div>
      
      <div style={{ display: 'flex', flex: 1, backgroundColor: '#1c1e26' }}>
         <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
           <div style={{ flex: 2, position: 'relative', borderBottom: '1px solid #2d3748' }}>
             {data.length === 0 && (
               <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: 'var(--text-muted)', textAlign: 'center' }}>
                 <BarChart2 size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
                 <p>Upload MT5/MT4 Historical Data (CSV) to preview EA behavior</p>
               </div>
             )}
             <div ref={chartContainerRef} style={{ width: '100%', height: '100%' }} />
           </div>
           <div style={{ flex: 1, position: 'relative' }}>
             <div ref={equityContainerRef} style={{ width: '100%', height: '100%' }} />
           </div>
         </div>

         {/* Metrics Sidebar */}
         {metrics && (
           <div style={{ width: '250px', backgroundColor: 'var(--bg-panel)', borderLeft: '1px solid var(--border)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
             <h3 style={{ fontSize: '14px', color: 'var(--text)', borderBottom: '1px solid var(--border)', paddingBottom: '8px', marginBottom: '8px' }}>Simulation Results</h3>
             
             <div>
               <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Net Profit</div>
               <div style={{ fontSize: '18px', fontWeight: 600, color: metrics.finalBalance >= metrics.initialBalance ? '#10b981' : '#ef4444' }}>
                 ${(metrics.finalBalance - metrics.initialBalance).toFixed(2)}
               </div>
             </div>

             <div>
               <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Total Trades</div>
               <div style={{ fontSize: '16px', fontWeight: 500, color: 'var(--text)' }}>
                 {metrics.totalTrades}
               </div>
             </div>

             <div>
               <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Win Rate</div>
               <div style={{ fontSize: '16px', fontWeight: 500, color: 'var(--text)' }}>
                 {metrics.winRate}%
               </div>
             </div>

             <div>
               <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Max Drawdown</div>
               <div style={{ fontSize: '16px', fontWeight: 500, color: 'var(--text)' }}>
                 {metrics.maxDrawdown}%
               </div>
             </div>
           </div>
         )}
      </div>
    </div>
  );
}
