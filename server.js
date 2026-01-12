import express from 'express';
import path from 'path';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/nanny', async (req, res) =>
{
    try
    {
        const apiKey = process.env.OPENAI_API_KEY;
        const ttsUrl = process.env.TTS_URL;

        if (!apiKey)
        {
            return res.status(500).json({ error: 'Missing OPENAI_API_KEY' });
        }

        const {
            history = [],
            mode = 'chat',
            character = 'princess'
        } = req.body;

        // 🧠 системні інструкції
        const systemPrompt = `
Ти — добра, жива мульт-няня для дитини 5–8 років.
Говори українською мовою.
НЕ повторюйся.
Памʼятай попередні відповіді.
Відповідай по суті.
Будь теплою, але не шаблонною.
`.trim();

        // 🔁 обрізаємо історію
        const recentHistory = history.slice(-6);

        // ❗ гарантуємо user-повідомлення
        if (!recentHistory.some(m => m.role === 'user'))
        {
            recentHistory.push({
                role: 'user',
                content: 'Привіт'
            });
        }

        const inputText = [
            systemPrompt,
            ...recentHistory.map(m => `${m.role}: ${m.content}`)
        ].join('\n');

        const payload = {
            model: 'gpt-4.1-mini',
            input: inputText
        };

        const r = await fetch('https://api.openai.com/v1/responses', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!r.ok)
        {
            const err = await r.text();
            console.error('OpenAI error:', err);
            throw new Error('OpenAI request failed');
        }

        const data = await r.json();
        const answer = data.output_text?.trim() || 'Я тут, сонечко 🙂';

        let audio = null;

        // 🎧 серверний TTS
        if (ttsUrl)
        {
            try
            {
                const tts = await fetch(`${ttsUrl}/tts`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        text: answer,
                        character
                    })
                });

                if (tts.ok)
                {
                    const ttsData = await tts.json();
                    audio = ttsData.url || null;
                }
            }
            catch (e)
            {
                console.warn('TTS unavailable, fallback to browser voice');
            }
        }

        return res.json({
            text: answer,
            audio
        });
    }
    catch (e)
    {
        console.error('Server error:', e);

        return res.json({
            text: 'Я тут 💜 Давай спробуємо ще раз.',
            audio: null
        });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () =>
{
    console.log(`✅ Nanny running on port ${PORT}`);
});