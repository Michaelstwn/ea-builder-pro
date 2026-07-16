from flask import Flask, request, jsonify
from flask_cors import CORS
import MetaTrader5 as mt5
import pandas as pd
from datetime import datetime

app = Flask(__name__)
CORS(app) # Allow cross-origin requests from Electron/Vite

# Initialize MetaTrader 5
if not mt5.initialize():
    print("initialize() failed, error code =", mt5.last_error())
    # Note: For production, we might want to gracefully fail if MT5 isn't open
else:
    print("MetaTrader5 initialized successfully")

@app.route('/ohlcv', methods=['GET'])
def get_ohlcv():
    symbol = request.args.get('symbol', 'EURUSD')
    timeframe_str = request.args.get('timeframe', 'H1')
    count = int(request.args.get('count', 1000))

    # Map timeframe string to MT5 constant
    tf_map = {
        'M1': mt5.TIMEFRAME_M1,
        'M5': mt5.TIMEFRAME_M5,
        'M15': mt5.TIMEFRAME_M15,
        'M30': mt5.TIMEFRAME_M30,
        'H1': mt5.TIMEFRAME_H1,
        'H4': mt5.TIMEFRAME_H4,
        'D1': mt5.TIMEFRAME_D1
    }
    
    tf = tf_map.get(timeframe_str, mt5.TIMEFRAME_H1)

    rates = mt5.copy_rates_from_pos(symbol, tf, 0, count)
    
    if rates is None:
        return jsonify({"error": f"Failed to fetch rates for {symbol}, error code: {mt5.last_error()}"}), 500

    # Convert to DataFrame and format
    df = pd.DataFrame(rates)
    df['time'] = pd.to_datetime(df['time'], unit='s').dt.strftime('%Y-%m-%d %H:%M:%S')
    
    # Return as list of dicts
    return jsonify(df.to_dict(orient='records'))

@app.route('/status', methods=['GET'])
def get_status():
    if mt5.terminal_info() is None:
        return jsonify({"status": "error", "message": "MT5 not connected"})
    return jsonify({"status": "ok", "message": "Connected to MetaTrader 5"})

if __name__ == '__main__':
    # Run on port 5000
    app.run(host='127.0.0.1', port=5000, debug=True)
