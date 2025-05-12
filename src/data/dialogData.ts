export interface DialogsDataType {
    [key: string]: DialogDataType;
}

export interface DialogDataType {
    name: string;
    done: boolean;
    fallback: string[];
    color: string;
    dialogs: {
        [key: string]: {
            text: string[];
            options?: Array<{
                text: string[];
                to: string;
            }>;
            charlie?: string[];
        };
    };
}

export const dialogData: DialogsDataType = {
    capitaine: {
        name: "Capitaine",
        done: false,
        color: "#afa",
        fallback: ["J'ai plus rien à te dire."],
        dialogs: {
            start: {
                text: [
                    "On débarque dans quelques minutes.",
                    "On laisse la cargaison et on repart.",
                    "C'est tout. ",
                    "J'sais pas c'que t'as fait pour te retrouver là, mais t'as fait le taff, donc pas d'histoire entre nous. ",
                    "Cela dit, l'océan lave pas tout, gamin.",
                    "On sera de retour dans six mois.",
                    "Si tu veux rembarquer, t'auras qu'à te pointer.",
                ],
                options: [
                    {
                        text: ["J'compte pas rentrer"],
                        to: "A",
                    },
                    {
                        text: ["J'm'en souviendrai"],
                        to: "B",
                    },
                ],
            },
            A: {
                text: [
                    "Y a qu'les imbéciles pour être aussi sûrs d'eux.",
                    "Et t'es pas un imbécile Charlie alors réfléchis bien à c'que tu veux.",
                ],
            },
            B: {
                text: ["Alors p'têtre qu'on s'reverra, gamin."],
            },
        },
    },
    talua: {
        name: "Talua",
        done: false,
        color: "#aaf",
        fallback: ["Je t'ai dit je peut rien pour toi."],
        dialogs: {
            start: {
                charlie: [
                    "Bonjour m'sieur par hasard, vous auriez du boulot pour moi, ou un toit.",
                    "J'y connais rien, mais j'apprends vite.",
                    "J'pourrais vous",
                ],
                text: ["Ah...", "J'taurai bien aidé, p'tit frère.", "Mais y'a pas de travail ici."],
                options: [
                    {
                        text: [
                            "S'il vous plaît...",
                            "Laissez-moi ma chance sérieux...",
                            "J'vous décevrai pas, c'est juré.",
                        ],
                        to: "A",
                    },
                    {
                        text: [
                            "Trop cool, ouais.",
                            "Une île paradisiaque...",
                            "avec l'ambiance d'un congélateur.",
                        ],
                        to: "B",
                    },
                ],
            },
            A: {
                text: ["Désolé mec, j'suis pas le bongars."],
            },
            B: {
                text: [
                    "Ah...",
                    "Fais gaffe à ce que tu dis si tu veux pas de problèmes avec les gens du coin.",
                    "Moi j'peux rien pour toi.",
                ],
            },
        },
    },
};
