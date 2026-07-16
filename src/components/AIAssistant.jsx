import React, { useState, useEffect } from 'react';
import { Bot, Send, X, AlertTriangle, Image as ImageIcon } from 'lucide-react';
import { useReactFlow } from 'reactflow';

export default function AIAssistant() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [geminiModels, setGeminiModels] = useState([
    { id: 'gemini-1.0-pro', name: 'Google Gemini 1.0 Pro', description: 'Model standar.' },
    { id: 'gemini-1.5-flash', name: 'Google Gemini 1.5 Flash', description: 'Model super cepat, hemat token.' },
    { id: 'gemini-1.5-pro', name: 'Google Gemini 1.5 Pro', description: 'Tingkat nalar tinggi untuk logika kompleks.' },
    { id: 'gemini-2.0-flash', name: 'Google Gemini 2.0 Flash', description: 'Flash generasi terbaru.' },
    { id: 'gemini-2.0-pro', name: 'Google Gemini 2.0 Pro', description: 'Pro generasi terbaru.' },
    { id: 'gemini-2.5-flash', name: 'Google Gemini 2.5 Flash', description: 'Versi experimental.' },
    { id: 'gemini-2.5-pro', name: 'Google Gemini 2.5 Pro', description: 'Versi experimental pro.' }
  ]);
  const [imageFile, setImageFile] = useState(null);
  const [imageBase64, setImageBase64] = useState('');
  const [keys, setKeys] = useState({ gemini: null, openai: null, anthropic: null });
  const { setNodes, setEdges, getNodes, getEdges } = useReactFlow();

  useEffect(() => {
    const loadKeys = async () => {
      let loadedKeys = {
        gemini: localStorage.getItem('gemini_api_key'),
        openai: localStorage.getItem('openai_api_key'),
        anthropic: localStorage.getItem('anthropic_api_key')
      };

      if (window.ipcRenderer) {
        try {
          const res = await window.ipcRenderer.invoke('load-keys');
          if (res.success && res.keys) {
            loadedKeys = { ...loadedKeys, ...res.keys };
          }
        } catch (e) {
          console.warn("Failed to load keys from file", e);
        }
      }

      setKeys(loadedKeys);

      if (loadedKeys.gemini) {
        fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${loadedKeys.gemini}`)
          .then(res => res.json())
          .then(data => {
            if (data.models) {
              const liveModels = data.models
                .filter(m => m.supportedGenerationMethods.includes('generateContent') && m.name.includes('gemini'))
                .map(m => ({
                  id: m.name.replace('models/', ''),
                  name: m.displayName || m.name.replace('models/', ''),
                  description: m.description || ''
                }));
              if (liveModels.length > 0) setGeminiModels(liveModels.reverse());
            }
          })
          .catch(err => console.warn('Failed to fetch live Gemini models:', err));
      }
    };
    if (isOpen) loadKeys();
  }, [isOpen]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImageBase64(ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const findSimilarProject = (userPrompt, projects) => {
    const promptWords = userPrompt.toLowerCase().split(/\W+/).filter(w => w.length > 2);
    let best = null;
    let maxScore = 0;
    
    projects.forEach(p => {
      const pNameWords = p.name.toLowerCase().split(/\W+/).filter(w => w.length > 2);
      const matchCount = promptWords.filter(w => pNameWords.includes(w)).length;
      const score = pNameWords.length > 0 ? matchCount / pNameWords.length : 0;
      
      // If the prompt contains a majority of the project's name words
      if (score > maxScore && score >= 0.5) {
        maxScore = score;
        best = p;
      }
    });
    return best;
  };

  const handleGenerate = async () => {
    if (!prompt) return;
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    // 1. Try to find a local match to save tokens
    try {
      const savedProjects = JSON.parse(localStorage.getItem('ea_projects') || '[]');
      const localMatch = findSimilarProject(prompt, savedProjects);
      
      if (localMatch && localMatch.nodes && localMatch.edges) {
        setNodes(localMatch.nodes);
        setEdges(localMatch.edges);
        setSuccessMsg(`Smart Match: Reused components from project "${localMatch.name}" to save tokens!`);
        setLoading(false);
        setTimeout(() => setIsOpen(false), 2500);
        return;
      }
    } catch (err) {
      console.warn("Local project match failed:", err);
    }

    // 2. Fetch URLs from prompt if any
    let enrichedPrompt = prompt;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = prompt.match(urlRegex);
    if (urls && urls.length > 0 && window.ipcRenderer) {
       for (const url of urls) {
         try {
           const res = await window.ipcRenderer.invoke('fetch-url', { url });
           if (res.success) {
             enrichedPrompt += `\n\n--- Content from ${url} ---\n${res.data}\n--- End Content ---`;
           }
         } catch(e) { console.warn("Failed to fetch url", url); }
       }
    }

    let currentKeys = { ...keys };
    if (window.ipcRenderer) {
      try {
        const res = await window.ipcRenderer.invoke('load-keys');
        if (res.success && res.keys) {
          currentKeys = { ...currentKeys, ...res.keys };
        }
      } catch (e) {
        console.warn("Failed to load keys on generate", e);
      }
    }

    const systemPrompt = `You are an expert MQL/EA Builder AI assistant. Your job is to convert the user's trading strategy request into a valid JSON representation of a React Flow node graph.

AVAILABLE NODE TYPES:
1. "indicator" - e.g. Moving Average, RSI, MACD. data: { name: "Moving Average", isCustom: false, params: { period: 14 } }
2. "logic" - compares inputs. data: { condition: "Crosses Above" | "Crosses Below" | "Greater Than" | "Less Than" }
3. "action" - executes trades. data: { action: "Buy Market" | "Sell Market", params: { lots: 0.1 } }
4. "risk" - sets SL/TP. data: { type: "Stop Loss / Take Profit", sl: 50, tp: 100 }
5. "timeframe" - filters time. data: { startHour: 8, endHour: 17 }

RULES FOR EDGES:
- Indicators must connect their "out" handle to a logic node's "in1" or "in2" handle.
- Logic nodes must connect their "out" handle to an action node's "in" handle.
- Risk/Timeframe nodes do not need edges, their presence applies globally.

The JSON MUST have this exact structure:
{
  "nodes": [ { "id": "node_1", "type": "indicator", "position": {"x": 100, "y": 100}, "data": { ... } }, ... ],
  "edges": [ { "id": "edge_1", "source": "node_1", "target": "node_2", "sourceHandle": "out", "targetHandle": "in1" }, ... ]
}
ONLY OUTPUT VALID JSON. DO NOT use markdown code blocks (\`\`\`json). Just the raw JSON object.

Current Graph State (use this context to fix errors or add nodes):
Nodes: ${JSON.stringify(getNodes())}
Edges: ${JSON.stringify(getEdges())}
`;

    const tryGemini = async (model = selectedModel) => {
      if (!currentKeys.gemini) throw new Error("Gemini API Key missing");
      const modelId = model.includes('gemini') ? model : 'gemini-1.5-flash'; // fallback if not gemini
      
      let parts = [{ text: systemPrompt + '\\nUser Request: ' + enrichedPrompt }];
      if (imageBase64) {
        const mimeType = imageBase64.substring(imageBase64.indexOf(":")+1, imageBase64.indexOf(";"));
        const base64Data = imageBase64.split(',')[1];
        parts.push({ inline_data: { mime_type: mimeType, data: base64Data } });
      }
      
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${currentKeys.gemini}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: parts }] })
      });
      if (!res.ok) throw new Error("Gemini API Error");
      const data = await res.json();
      return data.candidates[0].content.parts[0].text;
    };

    const tryOpenAI = async (model = selectedModel) => {
      if (!currentKeys.openai) throw new Error("OpenAI API Key missing");
      const modelId = model.includes('gpt') ? model : 'gpt-4o-mini';
      
      let content = [{ type: 'text', text: enrichedPrompt }];
      if (imageBase64) {
        content.push({ type: 'image_url', image_url: { url: imageBase64 } });
      }
      
      const res = await fetch(`https://api.openai.com/v1/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentKeys.openai}` },
        body: JSON.stringify({
          model: modelId,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: content }
          ]
        })
      });
      if (!res.ok) throw new Error("OpenAI API Error");
      const data = await res.json();
      return data.choices[0].message.content;
    };

    const tryAnthropic = async (model = selectedModel) => {
      if (!currentKeys.anthropic) throw new Error("Anthropic API Key missing");
      let modelId = 'claude-3-5-sonnet-20240620';
      if (model === 'claude-3-5-haiku') modelId = 'claude-3-5-haiku-20241022';
      
      let content = [{ type: 'text', text: enrichedPrompt }];
      if (imageBase64) {
        const mimeType = imageBase64.substring(imageBase64.indexOf(":")+1, imageBase64.indexOf(";"));
        const base64Data = imageBase64.split(',')[1];
        content.push({ type: 'image', source: { type: 'base64', media_type: mimeType, data: base64Data } });
      }
      
      const res = await fetch(`https://api.anthropic.com/v1/messages`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'x-api-key': currentKeys.anthropic,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
          model: modelId,
          max_tokens: 1024,
          system: systemPrompt,
          messages: [{ role: 'user', content: content }]
        })
      });
      if (!res.ok) throw new Error("Anthropic API Error");
      const data = await res.json();
      return data.content[0].text;
    };

    let resultText = null;
    
    // Order of execution based on selection and fallback
    const executionPlan = [];
    if (selectedModel.includes('gemini')) executionPlan.push(() => tryGemini(selectedModel), () => tryOpenAI('gpt-4o-mini'), () => tryAnthropic('claude-3-5-sonnet'));
    else if (selectedModel.includes('gpt')) executionPlan.push(() => tryOpenAI(selectedModel), () => tryGemini('gemini-1.5-flash'), () => tryAnthropic('claude-3-5-sonnet'));
    else if (selectedModel.includes('claude')) executionPlan.push(() => tryAnthropic(selectedModel), () => tryOpenAI('gpt-4o-mini'), () => tryGemini('gemini-1.5-flash'));

    for (const fn of executionPlan) {
      try {
        resultText = await fn();
        break; // Success!
      } catch (err) {
        console.warn('Fallback triggered due to:', err.message);
      }
    }

    if (!resultText) {
      setErrorMsg("All available AI models failed or missing API keys.");
      setLoading(false);
      return;
    }

    try {
      let cleaned = resultText.replace(/```json/g, '').replace(/```/g, '');
      const graph = JSON.parse(cleaned);
      setNodes(graph.nodes);
      setEdges(graph.edges);
      setIsOpen(false);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to parse AI response. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const getModelInfo = () => {
    if (!selectedModel) return "Pilih model AI yang ingin Anda gunakan.";
    
    if (selectedModel.includes('gemini')) {
      const gModel = geminiModels.find(m => m.id === selectedModel);
      if (gModel && gModel.description) return gModel.description;
    }
    
    const m = selectedModel.toLowerCase();
    if (m.includes('pro')) return "Tingkat nalar tingkat tinggi. Sangat cocok untuk logika EA yang kompleks, namun membutuhkan waktu proses lebih lama.";
    if (m.includes('flash') || m.includes('haiku') || m.includes('mini')) return "Super cepat & ringan. Sangat ideal untuk membangun logika EA dasar dengan respons instan.";
    if (m.includes('sonnet') || m.includes('gpt-4o')) return "Model flagship andalan. Memiliki tingkat keseimbangan terbaik antara kecerdasan tinggi dan kecepatan.";
    if (m.includes('exp') || m.includes('latest')) return "Versi eksperimental/terbaru dari lab. Canggih namun performanya mungkin fluktuatif.";
    return "Model AI standar untuk pembuatan node dan edge EA.";
  };

  if (!isOpen) {
    return (
      <button 
        className="btn-primary" 
        onClick={() => setIsOpen(true)}
        style={{ position: 'absolute', bottom: '210px', right: '20px', zIndex: 9999, borderRadius: '50%', width: '56px', height: '56px', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
      >
        <Bot size={24} />
      </button>
    );
  }

  return (
    <div style={{
      position: 'absolute', bottom: '210px', right: '20px', width: '350px', zIndex: 9999,
      backgroundColor: 'var(--bg-panel)', backdropFilter: 'blur(10px)',
      border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden',
      display: 'flex', flexDirection: 'column', boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
    }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-sidebar)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Bot size={18} color="var(--accent)" />
          <span style={{ fontWeight: 600, fontSize: '14px' }}>AI EA Builder</span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <X size={16} style={{ cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setIsOpen(false)} />
        </div>
      </div>
      
      <div style={{ padding: '16px' }}>
        <div style={{ marginBottom: '12px' }}>
          <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Preferred Model</label>
          <select 
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            style={{ width: '100%', padding: '6px', borderRadius: '4px', background: 'var(--bg-canvas)', border: '1px solid var(--border)', color: 'white', fontSize: '12px' }}
          >
            {(!keys.gemini && !keys.openai && !keys.anthropic) && (
              <option value="" disabled style={{ backgroundColor: '#1c1e26', color: 'white' }}>No API Keys Configured (Go to Settings)</option>
            )}
            {keys.gemini && (
              <optgroup label="Google Gemini" style={{ backgroundColor: '#111' }}>
                {geminiModels.map(model => (
                  <option key={model.id} value={model.id} style={{ backgroundColor: '#1c1e26', color: 'white' }}>
                    {model.name}
                  </option>
                ))}
              </optgroup>
            )}
            {keys.openai && (
              <optgroup label="OpenAI" style={{ backgroundColor: '#111' }}>
                <option value="gpt-4o" style={{ backgroundColor: '#1c1e26', color: 'white' }}>OpenAI GPT-4o</option>
                <option value="gpt-4o-mini" style={{ backgroundColor: '#1c1e26', color: 'white' }}>OpenAI GPT-4o Mini</option>
              </optgroup>
            )}
            {keys.anthropic && (
              <optgroup label="Anthropic" style={{ backgroundColor: '#111' }}>
                <option value="claude-3-5-sonnet" style={{ backgroundColor: '#1c1e26', color: 'white' }}>Anthropic Claude 3.5 Sonnet</option>
                <option value="claude-3-5-haiku" style={{ backgroundColor: '#1c1e26', color: 'white' }}>Anthropic Claude 3.5 Haiku</option>
              </optgroup>
            )}
          </select>
          <div style={{ marginTop: '8px', padding: '8px', backgroundColor: 'rgba(0,0,0,0.2)', borderLeft: '2px solid var(--accent)', borderRadius: '0 4px 4px 0', fontSize: '10px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
            {getModelInfo()}
          </div>
        </div>

        <div style={{ position: 'relative', marginBottom: '12px' }}>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. Build an EA that buys when MA 50 crosses over MA 200..."
            style={{ width: '100%', minHeight: '90px', padding: '12px', paddingBottom: '32px', borderRadius: '16px', border: '1px solid var(--border)', background: 'rgba(0,0,0,0.2)', color: 'white', resize: 'none', fontFamily: 'inherit', fontSize: '13px' }}
          />
          <div style={{ position: 'absolute', bottom: '8px', left: '12px', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <label style={{ cursor: 'pointer', color: imageFile ? 'var(--accent)' : 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
              <ImageIcon size={16} title="Attach Image for AI to analyze" />
            </label>
            {imageFile && <span style={{ fontSize: '10px', color: 'var(--accent)', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{imageFile.name}</span>}
          </div>
        </div>

        {errorMsg && (
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', color: '#ef4444', fontSize: '11px', marginBottom: '12px' }}>
            <AlertTriangle size={12} /> {errorMsg}
          </div>
        )}

        {successMsg && (
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', color: '#10b981', fontSize: '11px', marginBottom: '12px' }}>
            <Bot size={12} /> {successMsg}
          </div>
        )}

        <button className="btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }} onClick={handleGenerate} disabled={loading}>
          {loading ? 'Generating...' : <><Send size={14} /> Generate Workflow</>}
        </button>
      </div>
    </div>
  );
}
