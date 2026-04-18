export function initChat({
    mouthSelector,
    getCharacter = () => 'princess'
}) {
    const logEl = document.getElementById('log');
    const inputEl = document.getElementById('input');
    const sendBtn = document.getElementById('send');
    const badgeEl = document.getElementById('badge');
    const voiceOnEl = document.getElementById('voiceOn');
    const btnListen = document.getElementById('btnListen');

    let state = 'ready';
    let chatHistory = [];
    let currentAudio = null; // Поточне аудіо

    // UI для налаштувань (для GH Pages)
    const toggleSettings = document.getElementById('toggleSettings');
    const settingsContainer = document.getElementById('settingsContainer');
    const apiKeyInput = document.getElementById('apiKeyInput');

    if (toggleSettings) {
        toggleSettings.onclick = () => {
            const isHidden = settingsContainer.style.display === 'none';
            settingsContainer.style.display = isHidden ? 'block' : 'none';
        };
    }

    if (apiKeyInput) {
        apiKeyInput.value = localStorage.getItem('__nanny_openai_key') || '';
        apiKeyInput.onchange = () => {
            localStorage.setItem('__nanny_openai_key', apiKeyInput.value);
        };
    }

    const getMouthSelector = () => {
        if (typeof mouthSelector === 'function') return mouthSelector();
        return mouthSelector || '#mouthGroup';
    };

    function getCharacterRoot() {
        return document.querySelector('#character svg');
    }

    function mouthOn() {
        const svg = getCharacterRoot();
        if (!svg) return;

        svg.classList.add('speaking');
    }

    function mouthOff() {
        const svg = getCharacterRoot();
        if (!svg) return;

        svg.classList.remove('speaking');
    }


    function setState(s) {
        state = s;
        badgeEl.className = 'badge';

        if (s === 'loading') {
            badgeEl.textContent = 'Я думаю… 🤔';
            badgeEl.classList.add('loading');
        }
        else if (s === 'listening') {
            badgeEl.textContent = 'Я слухаю… 🎧';
            badgeEl.classList.add('listening');
        }
        else if (s === 'speaking') {
            badgeEl.textContent = 'Я говорю… 💬';
            badgeEl.classList.add('speaking');
        }
        else {
            badgeEl.textContent = 'Я готова 😊';
        }
    }

    function addMessage(text, who) {
        const d = document.createElement('div');
        d.className = 'msg ' + who;
        d.textContent = text;
        logEl.appendChild(d);
        logEl.scrollTop = logEl.scrollHeight;
    }

    function stopAll() {
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
            currentAudio = null;
        }
        if (window.speechSynthesis) {
            speechSynthesis.cancel();
        }
        mouthOff();
        setState('ready');
    }

    function playServerAudio(url) {
        stopAll();
        currentAudio = new Audio(url);

        currentAudio.onplay = () => {
            mouthOn();
            setState('speaking');
        };

        currentAudio.onended = () => {
            mouthOff();
            setState('ready');
            currentAudio = null;
        };

        currentAudio.onerror = () => {
            mouthOff();
            setState('ready');
            currentAudio = null;
        };

        currentAudio.play();
    }


    function browserSpeak(text) {
        if (!voiceOnEl.checked || !window.speechSynthesis) return;

        stopAll();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'uk-UA';
        u.rate = 0.75;
        u.pitch = 0.9;

        u.onstart = () => {
            mouthOn();
            setState('speaking');
        };

        u.onend = () => {
            mouthOff();
            setState('ready');
        };

        speechSynthesis.speak(u);
    }

    async function send(text, mode = 'chat') {
        const clean = (text || '').trim();
        if (!clean) return;

        stopAll();
        addMessage(clean, 'me');
        chatHistory.push({ role: 'user', content: clean });

        setState('loading');

        const localKey = localStorage.getItem('__nanny_openai_key');
        let data;

        if (localKey && (window.location.hostname.includes('github.io') || !r_check_backend())) {
            // Прямий запит до OpenAI (для GH Pages або якщо немає бекенду)
            const payload = {
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: 'Ти — добра, жива мульт-няня для дитини 5–8 років. Говори українською мовою.' },
                    ...chatHistory.slice(-6)
                ]
            };

            const openAiRes = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            const openAiData = await openAiRes.json();
            data = {
                text: openAiData.choices?.[0]?.message?.content || 'Ой, щось пішло не так...',
                audio: null
            };
        } else {
            // Стандартний запит до власного бекенду
            const r = await fetch('/api/nanny', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    history: chatHistory.slice(-6),
                    mode,
                    character: getCharacter()
                })
            });
            data = await r.json();
        }

        function r_check_backend() {
            // Проста евристика чи ми на локалхості/власному сервері
            return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        }
        addMessage(data.text, 'ai');

        chatHistory.push({ role: 'assistant', content: data.text });

        if (data.audio) {
            playServerAudio(data.audio);
        }
        else {
            browserSpeak(data.text);
        }
    }

    sendBtn.onclick = () => {
        send(inputEl.value);
        inputEl.value = '';
    };

    document.getElementById('btnStory').onclick = () => send('Розкажи казку 🙂', 'story');
    document.getElementById('btnGame').onclick = () => send('Давай пограємо!', 'game');
    document.getElementById('btnCalm').onclick = () => send('Я хвилююсь', 'calm');

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR) {
        const rec = new SR();
        rec.lang = 'uk-UA';

        btnListen.onclick = () => rec.start();
        rec.onstart = () => setState('listening');
        rec.onresult = e => send(e.results[0][0].transcript);
        rec.onend = () => setState('ready');
    }

    addMessage('Привіт! Я тут 💜', 'ai');
}
