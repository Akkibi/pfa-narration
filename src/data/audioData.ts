type PlayerType = {
    name: string;
    src: string;
    autostart?: boolean;
    loop?: boolean;
    volume?: number;
    fadeIn?: number;
};

const SoundTracks: PlayerType[] = [
    { name: "soundtrack_0", src: "/sounds/soundtrack/hub.mp3", volume: -4 },
    { name: "soundtrack_1", src: "/sounds/soundtrack/monde_noir.mp3", volume: -4 },
    { name: "soundtrack_2", src: "/sounds/soundtrack/onirique.mp3", volume: -4 },
    { name: "soundtrack_3", src: "/sounds/soundtrack/outro.mp3", volume: -4 },
];

const SoundEffects: PlayerType[] = [
    { name: "closing_door", src: "/sounds/effects/closing_door.mp3", fadeIn: 0.5 },
    { name: "ambient_prison", src: "/sounds/effects/ambient_prison.mp3", fadeIn: 0.5 },
    { name: "walking", src: "/sounds/effects/walking_short.mp3", fadeIn: 0.5 },
];

const Dialogues: PlayerType[] = [
    { name: "capitain_01", src: "/sounds/dialogues/capitain/capitain_01.m4a" },
];

const VoiceOff: PlayerType[] = [
    { name: "intro_prison_01", src: "/sounds/voice_off/intro_prison/intro_prison_01.mp3" },
    { name: "intro_prison_02", src: "/sounds/voice_off/intro_prison/intro_prison_02.mp3" },
    { name: "intro_prison_03", src: "/sounds/voice_off/intro_prison/intro_prison_03.mp3" },
];

export const AudioData: PlayerType[] = [...SoundEffects, ...SoundTracks, ...Dialogues, ...VoiceOff];
