export type Subtitle = {
    name: string; // Optional, can be used for grouping or identification
    text: string;
    audio: string;
    duration?: number; // Duration in seconds, optional
};

// type SubtitleGroup = {
//     name: string;
//     subs: Subtitle[];
// };

export const IntroPrisonSubs: Subtitle[] = [
    {
        name: "[POLICIERÉ]",
        text: "Allez mon gars, installe toi confortablement. On va jeter un oeil à ton dossier, ça risque de prendre un moment.",
        audio: "intro_prison_01",
        duration: 6,
    },
    {
        name: "[CHARLIE]",
        text: "Chapeau l'artiste, t'es vraiment au sommet là. Sérieux, même moi j'aurai pas parié sur un truc pareil.",
        audio: "intro_prison_02",
        duration: 6,
    },
    {
        name: "[CHARLIE]",
        text: "Bordel, qu'est-ce que j'ai foutu de ma vie ? Ça a commencé quand toute cette merde ? Réfléchis, mec...",
        audio: "intro_prison_03",
        duration: 7,
    },
];

// export const IntroPrisonSubs: Subtitle[] = [
//     {
//         name: "[POLICIERÉ]",
//         text: "Allez mon gars, installe toi confortablement. On va jeter un oeil à ton dossier, ça risque de prendre un moment.",
//         audio: "intro_prison_01",
//         duration: 6,
//     },
//     {
//         name: "[CHARLIE]",
//         text: "Chapeau l'artiste, t'es vraiment au sommet là. Sérieux, même moi j'aurai pas parié sur un truc pareil.",
//         audio: "intro_prison_02",
//         duration: 6,
//     },
//     {
//         name: "[CHARLIE]",
//         text: "Bordel, qu'est-ce que j'ai foutu de ma vie ? Ça a commencé quand toute cette merde ? Réfléchis, mec...",
//         audio: "intro_prison_03",
//         duration: 7,
//     },
// ];
