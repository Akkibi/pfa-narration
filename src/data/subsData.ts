export type Subtitle = {
    name: string; // Optional, can be used for grouping or identification
    text: string;
    audio: string;
    delay?: number; // Delay before the subtitle appears, optional
    duration?: number; // Duration in seconds, optional
};

// type SubtitleGroup = {
//     name: string;
//     subs: Subtitle[];
// };

export const IntroPrisonSubs: Subtitle[] = [
    {
        delay: 3,
        name: "[POLICIÈRE]",
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

export const Hub0Subs: Subtitle[] = [
    {
        name: "[CHARLIE]",
        text: "Allez Charlie... faut comprendre pourquoi t'as lâché l'affaire au point t'te retrouver en tôle. Un peintre qui crée rien, c'est juste un raté qui s'prend pour quelqu'un.",
        audio: "hub_0_00",
        duration: 9,
    },
];

export const DarkWorldSubs: Subtitle[] = [
    {
        name: "[CHARLIE]",
        text: "J'me prenais pour un artiste. Mais tout c'que j'sais faire, c'est mentir. Aux autres. A moi-même. J'ai jamais rien créé qui vienne de moi. Et j'ai jamais cherché à savoir pourquoi. Mais maintenant, j'crois que j'comprends. Tu vaux mieux qu'ça, Charlie.",
        audio: "dark_world_01",
        duration: 20,
    },
];

export const EndPrisonSubs: Subtitle[] = [
    {
        name: "[POLICIÈRE]",
        text: "Ta femme portera pas plainte, mon gars. On a aucune raison t'de garder ici. Rentre chez toi et tiens toi, à carreau, c'est compris ?",
        audio: "end_prison_00",
        duration: 8,
    },
    {
        name: "[CHARLIE]",
        text: "Merci m'dame.",
        audio: "end_prison_01",
        duration: 1,
    },
    {
        name: "[CHARLIE]",
        text: "Dites, vous croyez qu'vous pouvez m'aider ?",
        audio: "end_prison_02",
        duration: 2,
    },
    {
        name: "[POLICIÈRE]",
        text: "Dis toujours ?",
        audio: "end_prison_03",
        duration: 1,
    },
    {
        name: "[CHARLIE]",
        text: "J'cherche le magasin d'art le plus proche, vous sauriez m'trouver ça ?",
        audio: "end_prison_04",
        duration: 4,
    },
    {
        name: "[POLICIÈRE]",
        text: "T'empeste, gamin. Vas te doucher. C'est pas l'moment d'faire des emplettes.",
        audio: "end_prison_05",
        duration: 4,
    },
    {
        name: "[CHARLIE]",
        text: "Au contraire, m'dame. Y'a jamais eu d'meilleur moment.",
        audio: "end_prison_06",
        duration: 4,
    },
];
