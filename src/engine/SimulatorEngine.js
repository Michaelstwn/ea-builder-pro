/**
 * MVP Simulator Engine
 * Executes React Flow Logic (Nodes & Edges) over historical CSV bar data.
 */

function calculateSMA(data, period, index, priceType = 'close') {
  if (index < period - 1) return null;
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += data[index - i][priceType];
  }
  return sum / period;
}

export function runSimulation(nodes, edges, data, initialBalance = 10000) {
  let balance = initialBalance;
  let equity = initialBalance;
  let equityCurve = [];
  let trades = [];
  let openPosition = null;

  const actions = nodes.filter(n => n.type === 'action');
  const indicators = nodes.filter(n => n.type === 'indicator');
  const logics = nodes.filter(n => n.type === 'logic');

  // Pre-calculate buffers (MVP: only Moving Average supported for now)
  const buffers = {};
  indicators.forEach(ind => {
    buffers[ind.id] = new Array(data.length).fill(null);
    const period = ind.data.params?.period || 14;
    const isMA = ind.data.name.toLowerCase().includes('moving average');
    
    for (let i = 0; i < data.length; i++) {
      if (isMA) {
        buffers[ind.id][i] = calculateSMA(data, period, i);
      } else {
        // Fallback mock value
        buffers[ind.id][i] = data[i].close; 
      }
    }
  });

  // Loop through bars
  for (let i = 2; i < data.length; i++) {
    const currentBar = data[i];

    // Check open position (simulate TP/SL or close logic if any)
    if (openPosition) {
      // In MVP, we hold position until opposite signal or just fixed pip TP
      // Let's do a simple 50 pip TP/SL for MVP if not specified
      const pips = 0.0001;
      const tpDist = 50 * pips;
      const slDist = 50 * pips;
      
      let closed = false;
      let closePrice = 0;

      if (openPosition.type === 'Buy') {
         if (currentBar.high >= openPosition.price + tpDist) { closed = true; closePrice = openPosition.price + tpDist; }
         else if (currentBar.low <= openPosition.price - slDist) { closed = true; closePrice = openPosition.price - slDist; }
      } else {
         if (currentBar.low <= openPosition.price - tpDist) { closed = true; closePrice = openPosition.price - tpDist; }
         else if (currentBar.high >= openPosition.price + slDist) { closed = true; closePrice = openPosition.price + slDist; }
      }

      if (closed) {
        const pnl = openPosition.type === 'Buy' ? (closePrice - openPosition.price) : (openPosition.price - closePrice);
        // Assumes 1 lot = 100000 units
        const profit = pnl * 100000 * openPosition.lots;
        balance += profit;
        trades.push({
          time: currentBar.time,
          type: openPosition.type === 'Buy' ? 'CloseBuy' : 'CloseSell',
          profit,
          balance
        });
        openPosition = null;
      }
    }
    
    equity = openPosition ? balance + ((openPosition.type === 'Buy' ? (currentBar.close - openPosition.price) : (openPosition.price - currentBar.close)) * 100000 * openPosition.lots) : balance;
    
    // Evaluate logic for new positions
    if (!openPosition) {
      for (const logic of logics) {
        const edgeIn1 = edges.find(e => e.target === logic.id && e.targetHandle === 'in1');
        const edgeIn2 = edges.find(e => e.target === logic.id && e.targetHandle === 'in2');
        
        if (!edgeIn1 || !edgeIn2) continue;
        
        const val1_0 = buffers[edgeIn1.source][i-1];
        const val2_0 = buffers[edgeIn2.source][i-1];
        const val1_1 = buffers[edgeIn1.source][i-2];
        const val2_1 = buffers[edgeIn2.source][i-2];

        if (val1_0 === null || val2_0 === null) continue;

        const op = logic.data.operator;
        let cond = false;

        if (op === 'Crosses Above') cond = (val1_0 > val2_0 && val1_1 <= val2_1);
        else if (op === 'Crosses Below') cond = (val1_0 < val2_0 && val1_1 >= val2_1);
        else if (op === '>') cond = val1_0 > val2_0;
        else if (op === '<') cond = val1_0 < val2_0;

        if (cond) {
          // Find action
          const outEdge = edges.find(e => e.source === logic.id);
          if (outEdge) {
            const action = actions.find(a => a.id === outEdge.target);
            if (action) {
              const type = action.data.action.includes('Buy') ? 'Buy' : 'Sell';
              const lots = action.data.lots || 0.1;
              openPosition = {
                type,
                lots,
                price: currentBar.close,
                time: currentBar.time
              };
              trades.push({
                time: currentBar.time,
                type: 'Open' + type,
                price: currentBar.close
              });
            }
          }
        }
      }
    }

    equityCurve.push({ time: currentBar.time, value: equity });
  }

  // Calculate Metrics
  const closedTrades = trades.filter(t => t.profit !== undefined);
  const wins = closedTrades.filter(t => t.profit > 0).length;
  const losses = closedTrades.filter(t => t.profit < 0).length;
  const winRate = closedTrades.length > 0 ? (wins / closedTrades.length) * 100 : 0;
  
  let maxDrawdown = 0;
  let peak = initialBalance;
  equityCurve.forEach(p => {
    if (p.value > peak) peak = p.value;
    const dd = ((peak - p.value) / peak) * 100;
    if (dd > maxDrawdown) maxDrawdown = dd;
  });

  return {
    equityCurve,
    trades,
    metrics: {
      initialBalance,
      finalBalance: balance,
      totalTrades: closedTrades.length,
      winRate: winRate.toFixed(2),
      maxDrawdown: maxDrawdown.toFixed(2)
    }
  };
}
