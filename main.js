import { initChat } from './index.js';

import { Princess } from './characters/princess.js';
import { Bunny } from './characters/bunny.js';
import { Robot } from './characters/robot.js';
import { Dino } from './characters/dino.js';

const characters = {
    princess: Princess,
    bunny: Bunny,
    robot: Robot,
    dino: Dino
};

const characterRoot = document.getElementById('character');
const characterSelect = document.getElementById('characterSelect');

// 🔹 поточний персонаж (єдине джерело істини)
let currentCharacter = 'princess';

function renderCharacter(name)
{
    const factory = characters[name] || characters.princess;
    const character = factory();

    characterRoot.innerHTML = character.svg;

    // mouthSelector для анімації рота
    window.__MOUTH_SELECTOR__ = character.mouthSelector;

    // зберігаємо id персонажа для чату / сервера
    currentCharacter = name;
}

// початковий рендер
renderCharacter(characterSelect.value);

// перемикач персонажів
characterSelect.addEventListener('change', () =>
{
    renderCharacter(characterSelect.value);
});

// 🔹 ІНІЦІАЛІЗУЄМО ЧАТ
initChat({
    mouthSelector: () => window.__MOUTH_SELECTOR__ || '#mouthGroup',

    // 🔥 ОСЬ ЧОГО НЕ ВИСТАЧАЛО
    getCharacter: () => currentCharacter
});
