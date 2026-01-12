export function initChat({
    mouthSelector,
    getCharacter = () => 'princess'
})
{
    const logEl = document.getElementById('log');
    const inputEl = document.getElementById('input');
    const sendBtn = document.getElementById('send');
    const badgeEl = document.getElementById('badge');
    const voiceOnEl = document.getElementById('voiceOn');
    const btnListen = document.getElementById('btnListen');

    let state = 'ready';
    let chatHistory = [];

    const getMouthSelector = () =>
    {
        if (typeof mouthSelector === 'function') return mouthSelector();
        return mouthSelector || '#mouthGroup';
    };

    function getCharacterRoot()
    {
        return document.querySelector('#character svg');
    }

    function mouthOn()
    {
        const svg = getCharacterRoot();
        if (!svg) return;

        svg.classList.add('speaking');
    }

    function mouthOff()
    {
        const svg = getCharacterRoot();
        if (!svg) return;

        svg.classList.remove('speaking');
    }


    function setState(s)
    {
        state = s;
        badgeEl.className = 'badge';

        if (s === 'loading')
        {
            badgeEl.textContent = 'Я думаю… 🤔';
            badgeEl.classList.add('loading');
        }
        else if (s === 'listening')
        {
            badgeEl.textContent = 'Я слухаю… 🎧';
            badgeEl.classList.add('listening');
        }
        else if (s === 'speaking')
        {
            badgeEl.textContent = 'Я говорю… 💬';
            badgeEl.classList.add('speaking');
        }
        else
        {
            badgeEl.textContent = 'Я готова 😊';
        }
    }

    function addMessage(text, who)
    {
        const d = document.createElement('div');
        d.className = 'msg ' + who;
        d.textContent = text;
        logEl.appendChild(d);
        logEl.scrollTop = logEl.scrollHeight;
    }

    function playServerAudio(url)
    {
        const audio = new Audio(url);

        audio.onplay = () =>
        {
            mouthOn();
            setState('speaking');
        };

        audio.onended = () =>
        {
            mouthOff();
            setState('ready');
        };

        audio.onerror = () =>
        {
            mouthOff();
            setState('ready');
        };

        audio.play();
    }


    function browserSpeak(text)
    {
        if (!voiceOnEl.checked || !window.speechSynthesis) return;

        speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'uk-UA';
        u.rate = 0.75;
        u.pitch = 0.9;

        u.onstart = () =>
        {
            mouthOn();
            setState('speaking');
        };

        u.onend = () =>
        {
            mouthOff();
            setState('ready');
        };

        speechSynthesis.speak(u);
    }

    async function send(text, mode = 'chat')
    {
        const clean = (text || '').trim();
        if (!clean) return;

        addMessage(clean, 'me');
        chatHistory.push({ role: 'user', content: clean });

        setState('loading');

        const r = await fetch('/api/nanny', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                history: chatHistory.slice(-6),
                mode,
                character: getCharacter() // ✅ тепер гарантовано функція
            })
        });

        const data = await r.json();
        addMessage(data.text, 'ai');

        chatHistory.push({ role: 'assistant', content: data.text });

        if (data.audio)
        {
            playServerAudio(data.audio);
        }
        else
        {
            browserSpeak(data.text);
        }
    }

    sendBtn.onclick = () =>
    {
        send(inputEl.value);
        inputEl.value = '';
    };

    document.getElementById('btnStory').onclick = () => send('Розкажи казку 🙂', 'story');
    document.getElementById('btnGame').onclick  = () => send('Давай пограємо!', 'game');
    document.getElementById('btnCalm').onclick  = () => send('Я хвилююсь', 'calm');

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR)
    {
        const rec = new SR();
        rec.lang = 'uk-UA';

        btnListen.onclick = () => rec.start();
        rec.onstart = () => setState('listening');
        rec.onresult = e => send(e.results[0][0].transcript);
        rec.onend = () => setState('ready');
    }

    addMessage('Привіт! Я тут 💜', 'ai');
}
