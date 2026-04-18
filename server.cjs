'use strict';

const path = require('path');
const express = require('express');
const fetch = (...args) =>
    import('node-fetch').then(({ default: fetch }) => fetch(...args));

const app = express();

app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/nanny', async (req, res) =>
{
    try
    {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey)
        {
            return res.status(500).json({ error: 'Missing OPENAI_API_KEY' });
        }

        const history   = Array.isArray(req.body?.history) ? req.body.history : [];
        const mode      = req.body?.mode || 'chat';
        const character = req.body?.character || 'princess';

        if (history.length === 0)
        {
            return res.json({
                text: 'Привіт! Я тут 💜',
                audio: null
            });
        }

        /* 🔵 БАЗОВІ ІНСТРУКЦІЇ */
        const systemPrompt = `
Ти — добра, жива мульт-няня для дитини 5–8 років.
Говори українською мовою.
НЕ повторюйся.
Памʼятай, що дитина вже чула твої попередні відповіді.
Старайся відповідати по суті питання.
Будь теплою, але не шаблонною.
НЕ використовуй жодних емодзі або смайликів у відповідях.
`.trim();

        const modePrompt = {
            chat: 'Веди природну розмову.',
            story: 'Розкажи коротку добру казку.',
            game: 'Запропонуй просту інтерактивну гру.',
            calm: 'Допоможи заспокоїтись.',
        }[mode] || 'Будь лагідною.';

        /* 🔵 ПРАВИЛЬНИЙ PAYLOAD З ІСТОРІЄЮ */
        const payload = {
            model: 'gpt-4.1-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'system', content: modePrompt },
                ...history
            ]
        };

        const r = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await r.json();
        const answer =
            data.choices?.[0]?.message?.content?.trim() ||
            'Я тут, сонечко 🙂';

        /* 🔊 TTS (не ламаємо, але без фанатизму) */
        let audio = null;

        try
        {
            const ttsRes = await fetch('http://localhost:5001/tts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: answer, character })
            });

            if (ttsRes.ok)
            {
                const ttsData = await ttsRes.json();
                audio = ttsData.url || null;
            }
        }
        catch (e)
        {
            // fallback на браузер
        }

        return res.json({ text: answer, audio });
    }
    catch (e)
    {
        console.error(e);
        return res.status(500).json({
            text: 'Ой, я трохи розгубилась 🙈 Спробуй ще раз.',
            audio: null
        });
    }
});

const PORT = 3000;
app.listen(PORT, () =>
{
    console.log(`✅ Nanny running: http://localhost:${PORT}`);
});
