export const INDICATORS_CONFIG = {
  // --- TREND INDICATORS ---
  MovingAverage: {
    name: 'Moving Average', icon: 'TrendingUp', category: 'Trend',
    schema: [
      { name: 'period', label: 'Period', type: 'number', default: 14 },
      { name: 'method', label: 'Method', type: 'select', options: ['SMA', 'EMA', 'SMMA', 'LWMA'], default: 'SMA' },
      { name: 'applied_price', label: 'Applied Price', type: 'select', options: ['Close', 'Open', 'High', 'Low'], default: 'Close' }
    ]
  },
  BollingerBands: {
    name: 'Bollinger Bands', icon: 'TrendingUp', category: 'Trend',
    schema: [
      { name: 'period', label: 'Period', type: 'number', default: 20 },
      { name: 'shift', label: 'Shift', type: 'number', default: 0 },
      { name: 'deviation', label: 'Deviation', type: 'number', step: 0.1, default: 2.0 },
      { name: 'applied_price', label: 'Applied Price', type: 'select', options: ['Close', 'Open', 'High', 'Low'], default: 'Close' }
    ]
  },
  ParabolicSAR: {
    name: 'Parabolic SAR', icon: 'TrendingUp', category: 'Trend',
    schema: [
      { name: 'step', label: 'Step', type: 'number', step: 0.01, default: 0.02 },
      { name: 'maximum', label: 'Maximum', type: 'number', step: 0.1, default: 0.2 }
    ]
  },
  ADX: {
    name: 'ADX', icon: 'TrendingUp', category: 'Trend',
    schema: [
      { name: 'period', label: 'Period', type: 'number', default: 14 }
    ]
  },
  Ichimoku: {
    name: 'Ichimoku Kinko Hyo', icon: 'TrendingUp', category: 'Trend',
    schema: [
      { name: 'tenkan_sen', label: 'Tenkan-sen', type: 'number', default: 9 },
      { name: 'kijun_sen', label: 'Kijun-sen', type: 'number', default: 26 },
      { name: 'senkou_span_b', label: 'Senkou Span B', type: 'number', default: 52 }
    ]
  },
  StandardDeviation: {
    name: 'Standard Deviation', icon: 'TrendingUp', category: 'Trend',
    schema: [
      { name: 'period', label: 'Period', type: 'number', default: 20 },
      { name: 'method', label: 'Method', type: 'select', options: ['SMA', 'EMA', 'SMMA', 'LWMA'], default: 'SMA' },
      { name: 'applied_price', label: 'Applied Price', type: 'select', options: ['Close', 'Open', 'High', 'Low'], default: 'Close' }
    ]
  },
  DEMA: {
    name: 'Double EMA', icon: 'TrendingUp', category: 'Trend',
    schema: [
      { name: 'period', label: 'Period', type: 'number', default: 14 },
      { name: 'applied_price', label: 'Applied Price', type: 'select', options: ['Close', 'Open', 'High', 'Low'], default: 'Close' }
    ]
  },
  TEMA: {
    name: 'Triple EMA', icon: 'TrendingUp', category: 'Trend',
    schema: [
      { name: 'period', label: 'Period', type: 'number', default: 14 },
      { name: 'applied_price', label: 'Applied Price', type: 'select', options: ['Close', 'Open', 'High', 'Low'], default: 'Close' }
    ]
  },
  AMA: {
    name: 'Adaptive MA', icon: 'TrendingUp', category: 'Trend',
    schema: [
      { name: 'period', label: 'Period', type: 'number', default: 9 },
      { name: 'fast_ema', label: 'Fast EMA', type: 'number', default: 2 },
      { name: 'slow_ema', label: 'Slow EMA', type: 'number', default: 30 },
      { name: 'applied_price', label: 'Applied Price', type: 'select', options: ['Close', 'Open', 'High', 'Low'], default: 'Close' }
    ]
  },

  // --- OSCILLATORS ---
  MACD: {
    name: 'MACD', icon: 'Activity', category: 'Oscillators',
    schema: [
      { name: 'fast_ema', label: 'Fast EMA', type: 'number', default: 12 },
      { name: 'slow_ema', label: 'Slow EMA', type: 'number', default: 26 },
      { name: 'signal_sma', label: 'Signal SMA', type: 'number', default: 9 },
      { name: 'applied_price', label: 'Applied Price', type: 'select', options: ['Close', 'Open', 'High', 'Low'], default: 'Close' }
    ]
  },
  OsMA: {
    name: 'Moving Average of Oscillator', icon: 'Activity', category: 'Oscillators',
    schema: [
      { name: 'fast_ema', label: 'Fast EMA', type: 'number', default: 12 },
      { name: 'slow_ema', label: 'Slow EMA', type: 'number', default: 26 },
      { name: 'signal_sma', label: 'Signal SMA', type: 'number', default: 9 },
      { name: 'applied_price', label: 'Applied Price', type: 'select', options: ['Close', 'Open', 'High', 'Low'], default: 'Close' }
    ]
  },
  RSI: {
    name: 'RSI', icon: 'Activity', category: 'Oscillators',
    schema: [
      { name: 'period', label: 'Period', type: 'number', default: 14 },
      { name: 'applied_price', label: 'Applied Price', type: 'select', options: ['Close', 'Open', 'High', 'Low'], default: 'Close' }
    ]
  },
  Stochastic: {
    name: 'Stochastic', icon: 'Activity', category: 'Oscillators',
    schema: [
      { name: 'k_period', label: '%K Period', type: 'number', default: 5 },
      { name: 'd_period', label: '%D Period', type: 'number', default: 3 },
      { name: 'slowing', label: 'Slowing', type: 'number', default: 3 },
      { name: 'method', label: 'Method', type: 'select', options: ['SMA', 'EMA', 'SMMA', 'LWMA'], default: 'SMA' },
      { name: 'price_field', label: 'Price Field', type: 'select', options: ['Low/High', 'Close/Close'], default: 'Low/High' }
    ]
  },
  ATR: {
    name: 'ATR', icon: 'Activity', category: 'Oscillators',
    schema: [
      { name: 'period', label: 'Period', type: 'number', default: 14 }
    ]
  },
  CCI: {
    name: 'CCI', icon: 'Activity', category: 'Oscillators',
    schema: [
      { name: 'period', label: 'Period', type: 'number', default: 14 },
      { name: 'applied_price', label: 'Applied Price', type: 'select', options: ['Close', 'Open', 'High', 'Low', 'Typical'], default: 'Typical' }
    ]
  },
  Momentum: {
    name: 'Momentum', icon: 'Activity', category: 'Oscillators',
    schema: [
      { name: 'period', label: 'Period', type: 'number', default: 14 },
      { name: 'applied_price', label: 'Applied Price', type: 'select', options: ['Close', 'Open', 'High', 'Low'], default: 'Close' }
    ]
  },
  DeMarker: {
    name: 'DeMarker', icon: 'Activity', category: 'Oscillators',
    schema: [
      { name: 'period', label: 'Period', type: 'number', default: 14 }
    ]
  },
  WilliamsR: {
    name: 'Williams %R', icon: 'Activity', category: 'Oscillators',
    schema: [
      { name: 'period', label: 'Period', type: 'number', default: 14 }
    ]
  },
  RVI: {
    name: 'Relative Vigor Index', icon: 'Activity', category: 'Oscillators',
    schema: [
      { name: 'period', label: 'Period', type: 'number', default: 10 }
    ]
  },

  // --- VOLUMES ---
  Volumes: {
    name: 'Volumes', icon: 'BarChart', category: 'Volumes',
    schema: [
      { name: 'applied_volume', label: 'Applied Volume', type: 'select', options: ['Tick', 'Real'], default: 'Tick' }
    ]
  },
  MFI: {
    name: 'Money Flow Index', icon: 'BarChart', category: 'Volumes',
    schema: [
      { name: 'period', label: 'Period', type: 'number', default: 14 },
      { name: 'applied_volume', label: 'Applied Volume', type: 'select', options: ['Tick', 'Real'], default: 'Tick' }
    ]
  },
  OBV: {
    name: 'On Balance Volume', icon: 'BarChart', category: 'Volumes',
    schema: [
      { name: 'applied_price', label: 'Applied Price', type: 'select', options: ['Close', 'Open', 'High', 'Low'], default: 'Close' }
    ]
  },
  AccumulationDistribution: {
    name: 'Accumulation / Distribution', icon: 'BarChart', category: 'Volumes',
    schema: [
      { name: 'applied_volume', label: 'Applied Volume', type: 'select', options: ['Tick', 'Real'], default: 'Tick' }
    ]
  },

  // --- BILL WILLIAMS ---
  Alligator: {
    name: 'Alligator', icon: 'TrendingUp', category: 'Bill Williams',
    schema: [
      { name: 'jaws_period', label: 'Jaws Period', type: 'number', default: 13 },
      { name: 'jaws_shift', label: 'Jaws Shift', type: 'number', default: 8 },
      { name: 'teeth_period', label: 'Teeth Period', type: 'number', default: 8 },
      { name: 'teeth_shift', label: 'Teeth Shift', type: 'number', default: 5 },
      { name: 'lips_period', label: 'Lips Period', type: 'number', default: 5 },
      { name: 'lips_shift', label: 'Lips Shift', type: 'number', default: 3 },
      { name: 'method', label: 'Method', type: 'select', options: ['SMA', 'EMA', 'SMMA', 'LWMA'], default: 'SMMA' },
      { name: 'applied_price', label: 'Applied Price', type: 'select', options: ['Close', 'Median'], default: 'Median' }
    ]
  },
  AwesomeOscillator: {
    name: 'Awesome Oscillator', icon: 'Activity', category: 'Bill Williams',
    schema: [] // AO does not have input parameters in standard MT5, it runs on Median price
  },
  Fractals: {
    name: 'Fractals', icon: 'Activity', category: 'Bill Williams',
    schema: [] // Standard MT5 fractals do not have inputs
  },
  GatorOscillator: {
    name: 'Gator Oscillator', icon: 'Activity', category: 'Bill Williams',
    schema: [
      { name: 'jaws_period', label: 'Jaws Period', type: 'number', default: 13 },
      { name: 'jaws_shift', label: 'Jaws Shift', type: 'number', default: 8 },
      { name: 'teeth_period', label: 'Teeth Period', type: 'number', default: 8 },
      { name: 'teeth_shift', label: 'Teeth Shift', type: 'number', default: 5 },
      { name: 'lips_period', label: 'Lips Period', type: 'number', default: 5 },
      { name: 'lips_shift', label: 'Lips Shift', type: 'number', default: 3 },
      { name: 'method', label: 'Method', type: 'select', options: ['SMA', 'EMA', 'SMMA', 'LWMA'], default: 'SMMA' },
      { name: 'applied_price', label: 'Applied Price', type: 'select', options: ['Close', 'Median'], default: 'Median' }
    ]
  },
  MarketFacilitationIndex: {
    name: 'Market Facilitation Index', icon: 'BarChart', category: 'Bill Williams',
    schema: [
      { name: 'applied_volume', label: 'Applied Volume', type: 'select', options: ['Tick', 'Real'], default: 'Tick' }
    ]
  }
};
