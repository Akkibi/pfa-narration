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
    { name: "hub", src: "/sounds/soundtrack/hub.mp3", volume: 0.4 },
    { name: "souvenir", src: "/sounds/soundtrack/souvenir.mp3", volume: 0.4 },
    { name: "monde_noir", src: "/sounds/soundtrack/monde_noir.mp3", volume: 0.4 },
    { name: "outro", src: "/sounds/soundtrack/outro.mp3", volume: 0.4 },
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
    { name: "sail_boat", src: "/sounds/effects/sail_boat.mp3", fadeIn: 0.5, volume: 0.2 },
    { name: "walking", src: "/sounds/effects/walking_short.mp3", fadeIn: 0.5 },
];

const Dialogues: PlayerType[] = [
    { name: "capitain_00", src: "/sounds/dialogues/capitain/capitain_00.mp3" },
    { name: "capitain_01_A", src: "/sounds/dialogues/capitain/capitain_01_A.mp3" },
    { name: "capitain_01_B", src: "/sounds/dialogues/capitain/capitain_01_B.mp3" },
    { name: "capitain_02_A", src: "/sounds/dialogues/capitain/capitain_02_A.mp3" },
    { name: "capitain_02_B", src: "/sounds/dialogues/capitain/capitain_02_B.mp3" },
    { name: "talua_00", src: "/sounds/dialogues/talua/talua_00.mp3" },
    { name: "talua_01", src: "/sounds/dialogues/talua/talua_01.mp3" },
    { name: "talua_02_A", src: "/sounds/dialogues/talua/talua_02_A.mp3" },
    { name: "talua_02_B", src: "/sounds/dialogues/talua/talua_02_B.mp3" },
    { name: "talua_03_A", src: "/sounds/dialogues/talua/talua_03_A.mp3" },
    { name: "talua_03_B", src: "/sounds/dialogues/talua/talua_03_B.mp3" },
    { name: "tehani_00", src: "/sounds/dialogues/tehani/tehani_00.mp3" },
    { name: "tehani_01", src: "/sounds/dialogues/tehani/tehani_01.mp3" },
    { name: "tehani_02_A", src: "/sounds/dialogues/tehani/tehani_02_A.mp3" },
    { name: "tehani_02_B", src: "/sounds/dialogues/tehani/tehani_02_B.mp3" },
    { name: "tehani_03_A", src: "/sounds/dialogues/tehani/tehani_03_A.mp3" },
    { name: "tehani_03_B", src: "/sounds/dialogues/tehani/tehani_03_B.mp3" },
    { name: "manaia_00", src: "/sounds/dialogues/manaia/manaia_00.mp3" },
    { name: "manaia_01", src: "/sounds/dialogues/manaia/manaia_01.mp3" },
    { name: "manaia_02_A", src: "/sounds/dialogues/manaia/manaia_02_A.mp3" },
    { name: "manaia_02_B", src: "/sounds/dialogues/manaia/manaia_02_B.mp3" },
    { name: "manaia_03_A", src: "/sounds/dialogues/manaia/manaia_03_A.mp3" },
    { name: "manaia_03_B", src: "/sounds/dialogues/manaia/manaia_03_B.mp3" },
    { name: "manaia_04_A", src: "/sounds/dialogues/manaia/manaia_04_A.mp3" },
    { name: "manaia_04_B", src: "/sounds/dialogues/manaia/manaia_04_B.mp3" },
    { name: "manaia_05", src: "/sounds/dialogues/manaia/manaia_05.mp3" },
    { name: "manaia_06_A", src: "/sounds/dialogues/manaia/manaia_06_A.mp3" },
    { name: "manaia_06_B", src: "/sounds/dialogues/manaia/manaia_06_B.mp3" },
    { name: "manaia_07", src: "/sounds/dialogues/manaia/manaia_07.mp3" },
];

const VoiceOff: PlayerType[] = [
    {
        name: "intro_prison_01",
        src: "/sounds/voice_off/intro_prison/intro_prison_01.mp3",
    },
    { name: "intro_prison_02", src: "/sounds/voice_off/intro_prison/intro_prison_02.mp3" },
    { name: "intro_prison_03", src: "/sounds/voice_off/intro_prison/intro_prison_03.mp3" },
    { name: "hub_0_00", src: "/sounds/voice_off/hub_0/hub_00.mp3" },
    { name: "hub_1_00", src: "/sounds/voice_off/hub_1/hub_00.mp3" },
    { name: "dream_3_00", src: "/sounds/voice_off/dream_3/dream_00.mp3" },
    { name: "dream_3_01", src: "/sounds/voice_off/dream_3/dream_01.mp3" },
    { name: "dream_3_02", src: "/sounds/voice_off/dream_3/dream_02.mp3" },
    { name: "object_00", src: "/sounds/voice_off/objects/object_00.mp3" },
    { name: "object_01", src: "/sounds/voice_off/objects/object_01.mp3" },
    { name: "object_02", src: "/sounds/voice_off/objects/object_02.mp3" },
];

export const AudioData: PlayerType[] = [...SoundEffects, ...SoundTracks, ...Dialogues, ...VoiceOff];
