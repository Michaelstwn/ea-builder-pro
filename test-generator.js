import { generateMQL5 } from './src/engine/generator.js';
import fs from 'fs';

const mockNodes = [
  { id: '1', type: 'indicator', data: { name: 'Moving Average', indicatorId: 'MA', params: { period: 50, method: 'MODE_SMA', shift: 0, applied_price: 'PRICE_CLOSE' } } },
  { id: '2', type: 'indicator', data: { name: 'Moving Average', indicatorId: 'MA', params: { period: 200, method: 'MODE_SMA', shift: 0, applied_price: 'PRICE_CLOSE' } } },
  { id: '3', type: 'logic', data: { operator: 'Crossover' } },
  { id: '4', type: 'action', data: { action: 'Buy Market', params: { lots: 0.1 } } }
];

const mockEdges = [
  { source: '1', target: '3', sourceHandle: 'out', targetHandle: 'in1' },
  { source: '2', target: '3', sourceHandle: 'out', targetHandle: 'in2' },
  { source: '3', target: '4', sourceHandle: 'out', targetHandle: 'in' }
];

try {
  const result = generateMQL5(mockNodes, mockEdges);
  console.log("SUCCESS!");
  fs.writeFileSync('test_output.mq5', result);
} catch (e) {
  console.error("FAILED TO GENERATE:", e);
}
