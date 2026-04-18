export function Dino()
{
    return {
        id: 'dino',
        name: '🦖 Динозавр',

        mouthSelector: '#mouthGroup',
        eyesSelector: '#eyesGroup',

        tts: {
            rate: 0.75,
            pitch: 0.9   // трохи нижчий, «мʼякший» голос
        },

        svg: `
<svg width="260" height="260" viewBox="0 0 260 260" class="character trex">

    <!-- потилиця / шия -->
    <ellipse cx="150" cy="155" rx="95" ry="75" fill="#7bcf9b"/>

    <!-- морда -->
    <ellipse cx="120" cy="145" rx="90" ry="70" fill="#86ddb0"/>

    <!-- надбрівʼя -->
    <ellipse cx="95" cy="115" rx="30" ry="18" fill="#6fbf8e"/>
    <ellipse cx="145" cy="115" rx="30" ry="18" fill="#6fbf8e"/>

    <!-- очі -->
    <g id="eyesGroup">
        <ellipse cx="100" cy="125" rx="9" ry="11" fill="#fff"/>
        <ellipse cx="140" cy="125" rx="9" ry="11" fill="#fff"/>

        <circle class="pupil" cx="100" cy="128" r="4" fill="#222"/>
        <circle class="pupil" cx="140" cy="128" r="4" fill="#222"/>
    </g>

    <!-- ніздрі -->
    <ellipse cx="90" cy="150" rx="3" ry="4" fill="#4f8f6f"/>
    <ellipse cx="110" cy="150" rx="3" ry="4" fill="#4f8f6f"/>

    <!-- щелепа -->
    <g id="mouthGroup">

        <!-- верхня щелепа -->
        <path d="
            M 60 160
            Q 120 140 180 160
            L 180 175
            Q 120 190 60 175
            Z"
            fill="#2f6f4f"/>

        <!-- зуби -->
        <polygon points="80,165 85,175 90,165" fill="#fff"/>
        <polygon points="95,165 100,175 105,165" fill="#fff"/>
        <polygon points="110,165 115,175 120,165" fill="#fff"/>
        <polygon points="125,165 130,175 135,165" fill="#fff"/>

        <!-- нижня губа -->
        <ellipse cx="120" cy="178" rx="35" ry="6"
            fill="#1e4f3a" opacity="0.5"/>
    </g>

    <!-- шипи -->
    <polygon points="190,85 205,65 215,90" fill="#6fbf8e"/>
    <polygon points="200,105 215,85 225,110" fill="#6fbf8e"/>

</svg>`
    };
}
