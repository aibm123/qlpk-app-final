// pages/api/gemini.js

// IMPORTANT: This file contains sensitive information (API Key and Webhook URL).
// As per the user's request, they are hardcoded here.
// In a production environment, it is strongly recommended to use Environment Variables.
const WEBHOOK_URL = 'https://aps.aibm.space/webhook/qlpk1';
const GEMINI_API_KEY = 'AIzaSyA5A-vhRjC2QaQuMOlz40hYX7Ohn1AGXFU';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { task, ...data } = req.body;

    try {
        if (task === 'signin' || task === 'getdata' || task === 'CRUD' || task === 'chatbot') {
            // --- Webhook Tasks ---
            const webhookResponse = await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ task, ...data })
            });

            if (!webhookResponse.ok) {
                const errorText = await webhookResponse.text();
                console.error(`Webhook error for task [${task}]:`, errorText);
                return res.status(webhookResponse.status).json({ error: `Webhook request failed: ${errorText}` });
            }

            const result = await webhookResponse.json();
            return res.status(200).json(result);

        } else if (task === 'analyze') {
            // --- Gemini API Task for AI Analysis ---
            const { prompt, base64Data } = data;
            const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;
            
            const parts = [{ text: prompt }];
            if (base64Data) {
                parts.push({ inlineData: { mimeType: "image/jpeg", data: base64Data } });
            }

            const geminiResponse = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts }] })
            });

            if (!geminiResponse.ok) {
                const errorData = await geminiResponse.json();
                console.error("Gemini API Error:", errorData);
                return res.status(geminiResponse.status).json({ error: errorData.error.message || 'Lỗi từ Gemini API' });
            }

            const result = await geminiResponse.json();
            const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
            return res.status(200).json({ text });

        } else {
            return res.status(400).json({ error: 'Invalid task specified' });
        }
    } catch (error) {
        console.error(`Server-side error for task [${task}]:`, error);
        return res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
}
