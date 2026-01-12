export function Princess()
{
    return {
        id: 'princess',
        name: '👸 Принцеса',

        mouthSelector: '#mouthGroup',

        tts: {
            rate: 0.8,
            pitch: 1.25
        },

        svg: `
<svg width="260" height="260" viewBox="0 0 260 260">
    <ellipse cx="130" cy="120" rx="95" ry="105" fill="#f4c96d"/>
    <circle cx="130" cy="130" r="75" fill="#ffe6d5"/>

    <polygon points="95,55 115,80 130,55 145,80 165,55"
        fill="#ffd966" stroke="#d4aa00" stroke-width="2"/>

    <circle class="eye" cx="105" cy="125" r="7" fill="#fff"/>
    <circle class="eye" cx="155" cy="125" r="7" fill="#fff"/>
    <circle cx="107" cy="127" r="3" fill="#5a3e36"/>
    <circle cx="157" cy="127" r="3" fill="#5a3e36"/>

    <g id="mouthGroup">
        <ellipse cx="130" cy="160" rx="10" ry="6"
            fill="rgba(0,0,0,.4)" opacity="0"/>
        <ellipse cx="130" cy="158" rx="16" ry="6"
            fill="#e27c7c"/>
    </g>
</svg>`
    };
}
