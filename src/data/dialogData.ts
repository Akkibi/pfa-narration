export interface DialogsDataType {
    [key: string]: DialogDataType;
}

export interface DialogDataType {
    name: string;
    done: boolean;
    fallback: string;
    dialogs: {
        [key: string]: {
            text: string;
            audio?: string;
            duration?: number;
            options?: Array<{
                text: string;
                to: string;
            }>;
            isCharlie: boolean;
            next?: string;
        };
    };
}

export const dialogData: DialogsDataType = {
    capitaine: {
        name: "Capitaine",
        done: false,
        fallback: "J'ai plus rien à te dire.",
        dialogs: {
            start: {
                isCharlie: false,
                text: "On débarque, on dépose la cargaison et on repart. T'as fait le taff donc pas d'histoires entre nous. Mais l'océan lave pas tout gamin. On revient dans 6 mois. À toi de voir si tu veux rembarquer.",
                audio: "capitain_00",
                duration: 11,
                options: [
                    {
                        text: "J'compte pas rentrer",
                        to: "A",
                    },
                    {
                        text: "J'm'en souviendrai",
                        to: "B",
                    },
                ],
            },
            A: {
                isCharlie: true,
                text: "J'compte pas rentrer. Plus rien m'attend sur l'continent.",
                next: "C",
                audio: "capitain_01_A",
                duration: 3,
            },
            B: {
                isCharlie: true,
                text: "J'm'en souviendrai. Avoir une porte de sortie, ça fait jamais d'mal.",
                next: "D",
                audio: "capitain_01_B",
                duration: 4,
            },
            C: {
                isCharlie: false,
                text: "Y a qu'les imbéciles pour être aussi sûrs d'eux. Et t'es pas un imbécile Charlie alors réfléchis bien à c'que tu veux.",
                audio: "capitain_02_A",
                duration: 7,
            },
            D: {
                isCharlie: false,
                text: "Alors p'têtre qu'on s'reverra, gamin.",
                audio: "capitain_02_B",
                duration: 2,
            },
        },
    },
    talua: {
        name: "Talua",
        done: false,
        fallback: "Je t'ai dit je peut rien pour toi.",
        dialogs: {
            start: {
                isCharlie: true,
                text: "Bonjour m'sieur par hasard, vous auriez du boulot pour moi, ou un toit. J'y connais rien, mais j'apprends vite. J'pourrais vous",
                next: "bonjour",
            },
            bonjour: {
                isCharlie: true,
                text: "Ah...J'taurai bien aidé, p'tit frère. Mais y'a pas de travail ici.",
                options: [
                    {
                        text: "S'il vous plaît...Laissez-moi ma chance sérieux...J'vous décevrai pas, c'est juré.",
                        to: "A",
                    },
                    {
                        text: "Trop cool, ouais. Une île paradisiaque...avec l'ambiance d'un congélateur.",
                        to: "B",
                    },
                ],
            },
            A: {
                isCharlie: true,
                text: "Désolé mec, j'suis pas le bongars.",
            },
            B: {
                isCharlie: true,
                text: "Ah...Fais gaffe à ce que tu dis si tu veux pas de problèmes avec les gens du coin. Moi j'peux rien pour toi.",
            },
        },
    },
};
