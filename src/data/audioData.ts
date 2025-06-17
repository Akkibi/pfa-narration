type PlayerType = {
    name: string;
    src: string;
    delay?: number;
    autostart?: boolean;
    loop?: boolean;
    volume?: number;
    fadeIn?: number;
};

const SoundTracks: PlayerType[] = [
    { name: "soundtrack_0", src: "/sounds/soundtrack/hub.mp3", volume: 0.4 },
    { name: "soundtrack_1", src: "/sounds/soundtrack/monde_noir.mp3", volume: 0.4 },
    { name: "soundtrack_2", src: "/sounds/soundtrack/onirique.mp3", volume: 0.4 },
    { name: "soundtrack_3", src: "/sounds/soundtrack/outro.mp3", volume: 0.4 },
];

const SoundEffects: PlayerType[] = [
    { name: "closing_door", src: "/sounds/effects/intro_prison/closing_door.mp3", fadeIn: 0.5 },
    {
        name: "ambient_prison",
        src: "/sounds/effects/intro_prison/ambient_prison.mp3",
        fadeIn: 0.5,
        delay: 2,
        volume: 0.2,
    },
    { name: "walking", src: "/sounds/effects/walking_short.mp3", fadeIn: 0.5 },
];

const Dialogues: PlayerType[] = [
    { name: "capitain_00", src: "/sounds/dialogues/capitain/capitain_00.mp3" },
    { name: "capitain_01_A", src: "/sounds/dialogues/capitain/capitain_01_A.mp3" },
    { name: "capitain_01_B", src: "/sounds/dialogues/capitain/capitain_01_B.mp3" },
    { name: "capitain_02_A", src: "/sounds/dialogues/capitain/capitain_02_A.mp3" },
    { name: "capitain_02_B", src: "/sounds/dialogues/capitain/capitain_02_B.mp3" },
];

const VoiceOff: PlayerType[] = [
    {
        name: "intro_prison_01",
        src: "/sounds/voice_off/intro_prison/intro_prison_01.mp3",
    },
    { name: "intro_prison_02", src: "/sounds/voice_off/intro_prison/intro_prison_02.mp3" },
    { name: "intro_prison_03", src: "/sounds/voice_off/intro_prison/intro_prison_03.mp3" },
    { name: "hub_01", src: "/sounds/voice_off/hub_0/hub_01.mp3" },
    { name: "object_00", src: "/sounds/voice_off/objects/object_00.mp3" },
];

export const AudioData: PlayerType[] = [...SoundEffects, ...SoundTracks, ...Dialogues, ...VoiceOff];
