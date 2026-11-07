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
    { name: "hub", src: "/sounds/soundtrack/hub.opus", volume: 0.4 },
    { name: "souvenir", src: "/sounds/soundtrack/souvenir.opus", volume: 0.4 },
    { name: "monde_noir", src: "/sounds/soundtrack/monde_noir.opus", volume: 0.4 },
    { name: "outro", src: "/sounds/soundtrack/outro.opus", volume: 0.4 },
    { name: "hub_end", src: "/sounds/soundtrack/hub_end.opus", volume: 0.4 },
];

const SoundEffects: PlayerType[] = [
    { name: "closing_door", src: "/sounds/effects/intro_prison/closing_door.opus", fadeIn: 0.5 },
    {
        name: "ambient_prison",
        src: "/sounds/effects/intro_prison/ambient_prison.opus",
        fadeIn: 0.5,
        delay: 2,
        volume: 0.2,
    },
    { name: "sail_boat", src: "/sounds/effects/sail_boat.opus", fadeIn: 0.5, volume: 0.2 },
    { name: "walking", src: "/sounds/effects/walking_short.opus", fadeIn: 0.5 },
];

const Dialogues: PlayerType[] = [
    { name: "capitain_00", src: "/sounds/dialogues/capitain/capitain_00.opus" },
    { name: "capitain_01_A", src: "/sounds/dialogues/capitain/capitain_01_A.opus" },
    { name: "capitain_01_B", src: "/sounds/dialogues/capitain/capitain_01_B.opus" },
    { name: "capitain_02_A", src: "/sounds/dialogues/capitain/capitain_02_A.opus" },
    { name: "capitain_02_B", src: "/sounds/dialogues/capitain/capitain_02_B.opus" },
    { name: "talua_00", src: "/sounds/dialogues/talua/talua_00.opus" },
    { name: "talua_01", src: "/sounds/dialogues/talua/talua_01.opus" },
    { name: "talua_02_A", src: "/sounds/dialogues/talua/talua_02_A.opus" },
    { name: "talua_02_B", src: "/sounds/dialogues/talua/talua_02_B.opus" },
    { name: "talua_03_A", src: "/sounds/dialogues/talua/talua_03_A.opus" },
    { name: "talua_03_B", src: "/sounds/dialogues/talua/talua_03_B.opus" },
    { name: "tehani_00", src: "/sounds/dialogues/tehani/tehani_00.opus" },
    { name: "tehani_01", src: "/sounds/dialogues/tehani/tehani_01.opus" },
    { name: "tehani_02_A", src: "/sounds/dialogues/tehani/tehani_02_A.opus" },
    { name: "tehani_02_B", src: "/sounds/dialogues/tehani/tehani_02_B.opus" },
    { name: "tehani_03_A", src: "/sounds/dialogues/tehani/tehani_03_A.opus" },
    { name: "tehani_03_B", src: "/sounds/dialogues/tehani/tehani_03_B.opus" },
    { name: "manaia_00", src: "/sounds/dialogues/manaia/manaia_00.opus" },
    { name: "manaia_01", src: "/sounds/dialogues/manaia/manaia_01.opus" },
    { name: "manaia_02_A", src: "/sounds/dialogues/manaia/manaia_02_A.opus" },
    { name: "manaia_02_B", src: "/sounds/dialogues/manaia/manaia_02_B.opus" },
    { name: "manaia_03_A", src: "/sounds/dialogues/manaia/manaia_03_A.opus" },
    { name: "manaia_03_B", src: "/sounds/dialogues/manaia/manaia_03_B.opus" },
    { name: "manaia_04_A", src: "/sounds/dialogues/manaia/manaia_04_A.opus" },
    { name: "manaia_04_B", src: "/sounds/dialogues/manaia/manaia_04_B.opus" },
    { name: "manaia_05", src: "/sounds/dialogues/manaia/manaia_05.opus" },
    { name: "manaia_06_A", src: "/sounds/dialogues/manaia/manaia_06_A.opus" },
    { name: "manaia_06_B", src: "/sounds/dialogues/manaia/manaia_06_B.opus" },
    { name: "manaia_07", src: "/sounds/dialogues/manaia/manaia_07.opus" },
];

const VoiceOff: PlayerType[] = [
    {
        name: "intro_prison_01",
        src: "/sounds/voice_off/intro_prison/intro_prison_01.opus",
    },
    { name: "intro_prison_02", src: "/sounds/voice_off/intro_prison/intro_prison_02.opus" },
    { name: "intro_prison_03", src: "/sounds/voice_off/intro_prison/intro_prison_03.opus" },
    { name: "hub_0_00", src: "/sounds/voice_off/hub_0/hub_00.opus" },
    { name: "hub_1_00", src: "/sounds/voice_off/hub_1/hub_00.opus" },
    { name: "dream_3_00", src: "/sounds/voice_off/dream_3/dream_00.opus" },
    { name: "dream_3_01", src: "/sounds/voice_off/dream_3/dream_01.opus" },
    { name: "dream_3_02", src: "/sounds/voice_off/dream_3/dream_02.opus" },
    { name: "dark_world_00", src: "/sounds/voice_off/dark_world/dark_world_00.opus" },
    { name: "dark_world_01", src: "/sounds/voice_off/dark_world/dark_world_01.opus" },
    { name: "object_00", src: "/sounds/voice_off/objects/object_00.opus" },
    { name: "object_01", src: "/sounds/voice_off/objects/object_01.opus" },
    { name: "object_02", src: "/sounds/voice_off/objects/object_02.opus" },
    { name: "object_03", src: "/sounds/voice_off/objects/object_03.opus" },
    { name: "end_prison_00", src: "/sounds/voice_off/end_prison/end_prison_00.opus" },
    { name: "end_prison_01", src: "/sounds/voice_off/end_prison/end_prison_01.opus" },
    { name: "end_prison_02", src: "/sounds/voice_off/end_prison/end_prison_02.opus" },
    { name: "end_prison_03", src: "/sounds/voice_off/end_prison/end_prison_03.opus" },
    { name: "end_prison_04", src: "/sounds/voice_off/end_prison/end_prison_04.opus" },
    { name: "end_prison_05", src: "/sounds/voice_off/end_prison/end_prison_05.opus" },
    { name: "end_prison_06", src: "/sounds/voice_off/end_prison/end_prison_06.opus" },
];

export const AudioData: PlayerType[] = [...SoundEffects, ...SoundTracks, ...Dialogues, ...VoiceOff];
