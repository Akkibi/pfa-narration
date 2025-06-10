type PlayerType = {
    name: string;
    src: string;
    autostart?: boolean;
    loop?: boolean;
    volume?: number;
    fadeIn?: number;
};

const SoundTracks: PlayerType[] = [
    { name: "soundtrack_0", src: "/sounds/soundtrack/home_page.mp3", volume: -4 },
    { name: "soundtrack_1", src: "/sounds/soundtrack/monde_noir.mp3", volume: -4 },
    { name: "soundtrack_2", src: "/sounds/soundtrack/onirique.mp3", volume: -4 },
    { name: "soundtrack_3", src: "/sounds/soundtrack/outro.mp3", volume: -4 },
];

const SoundEffects: PlayerType[] = [
    { name: "walking", src: "/sounds/effects/walking_short.mp3", fadeIn: 0.5 },
];

const Dialogues: PlayerType[] = [
    { name: "capitain_01", src: "/sounds/dialogues/capitain/capitain_01.m4a" },
];

export const AudioData: PlayerType[] = [...SoundEffects, ...SoundTracks, ...Dialogues];
