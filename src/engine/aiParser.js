export const parseCustomIndicator = async (fileContent, fileName) => {
  if (!window.ipcRenderer) throw new Error("IPC Renderer not available (running in browser)");

  const resG = await window.ipcRenderer.invoke('secure-get', { encryptedHex: localStorage.getItem('gemini_api_key_enc') });
  if (!resG.success || !resG.decrypted) throw new Error("Gemini API Key missing. Please set it in Settings.");

  const apiKey = resG.decrypted;
  
  const systemPrompt = `You are an expert MQL4 and MQL5 developer. 
I will provide you with the source code of a custom indicator (mq4 or mq5).
Your task is to analyze it and extract its input parameters (extern or input variables) into a JSON schema compatible with our visual EA Builder.

Return ONLY a valid JSON object with the following structure. No markdown, no comments.
{
  "name": "IndicatorName",
  "category": "Custom",
  "icon": "Activity",
  "buffers": [ { "id": 0, "name": "Main Line" } ], // determine what output buffers exist based on SetIndexBuffer
  "schema": [
    { "name": "varName", "label": "User Friendly Label", "type": "number|string|boolean", "default": value }
  ]
}

If you cannot parse it, return {"error": "Could not parse indicator"}.

Source Code File Name: ${fileName}
`;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: systemPrompt },
          { text: `--- MQL SOURCE ---\n${fileContent.substring(0, 50000)}\n--- END SOURCE ---` }
        ]
      }]
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini API Error: ${response.status}`);
  }

  const data = await response.json();
  const resultText = data.candidates[0].content.parts[0].text;
  
  // Clean up potential markdown formatting from AI output
  const jsonStr = resultText.replace(/```json/g, '').replace(/```/g, '').trim();
  
  try {
    const parsed = JSON.parse(jsonStr);
    if (parsed.error) throw new Error(parsed.error);
    
    // Add unique ID
    parsed.id = `custom_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    parsed.isCustom = true;
    return parsed;
  } catch (err) {
    console.error("Failed to parse JSON from AI", resultText);
    throw new Error("Failed to parse indicator schema: " + err.message);
  }
};
