export function Robot()
{
    return {
        id: 'robot',
        name: '🤖 Робот',

        mouthSelector: '#robotMouth',

        tts: {
            rate: 0.65,
            pitch: 0.7
        },

        svg: `
<svg width="260" height="260" viewBox="0 0 260 260">
    <rect x="60" y="80" width="140" height="120" rx="10" fill="#bbb"/>

    <!-- очі -->
    <rect id="eyeLeft"  x="90"  y="110" width="20" height="20" fill="#000"/>
    <rect id="eyeRight" x="150" y="110" width="20" height="20" fill="#000"/>

    <!-- рот -->
    <g id="mouthGroup">
        <rect id="robotMouth" x="100" y="155" width="60" height="10" fill="#333"/>
    </g>
</svg>`
    };
}
