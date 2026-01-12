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

        const { history = [], mode = 'chat', character = 'princess' } = req.body;

        const instructions = `
Ти — добра, жива мульт-няня для дитини 5–8 років.
Говори українською мовою.
НЕ повторюйся.
Памʼятай, що дитина вже чула твої попередні відповіді.
Старайся відповідати по суті питання.
Будь теплою, але не шаблонною.
        `.trim();

        const payload = {
            model: 'gpt-4.1-mini',
            input: instructions + '\n' +
                history.map(m => `${m.role}: ${m.content}`).join('\n')
        };

        const r = await fetch('https://api.openai.com/v1/responses', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await r.json();
        const answer = data.output_text || 'Я тут, сонечко 🙂';

        let audio = null;

        if (ttsUrl)
        {
            const tts = await fetch(`${ttsUrl}/tts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: answer, character })
            });

            if (tts.ok)
            {
                const ttsData = await tts.json();
                audio = ttsData.url;
            }
        }

        res.json({ text: answer, audio });
    }
    catch
    {
        res.json({
            text: 'Я тут 💜',
            audio: null
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
{
    console.log(`✅ Nanny running on ${PORT}`);
});
