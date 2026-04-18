export function Bunny()
{
    return {
        id: 'bunny',
        name: '🐰 Зайчик',

        mouthSelector: '#mouthGroup',
        eyesSelector: '#eyesGroup',

        tts: {
            rate: 0.9,
            pitch: 1.4
        },

        svg: `
<svg width="260" height="260" viewBox="0 0 260 260" class="character bunny">

    <!-- вушка -->
    <ellipse cx="90" cy="60" rx="25" ry="60" fill="#eee"/>
    <ellipse cx="170" cy="60" rx="25" ry="60" fill="#eee"/>

    <!-- голова -->
    <circle cx="130" cy="140" r="80" fill="#fff"/>

    <!-- очі -->
    <g id="eyesGroup">
        <ellipse cx="105" cy="130" rx="10" ry="12" fill="#fff"/>
        <ellipse cx="155" cy="130" rx="10" ry="12" fill="#fff"/>

        <circle class="pupil" cx="105" cy="132" r="4" fill="#333"/>
        <circle class="pupil" cx="155" cy="132" r="4" fill="#333"/>
    </g>

    <!-- рот -->
    <g id="mouthGroup">
        <ellipse cx="130" cy="160" rx="10" ry="5" fill="#f2a"/>
    </g>

</svg>`
    };
}
