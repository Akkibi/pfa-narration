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
                text: "Bonjour m'sieur par hasard, vous auriez du boulot pour moi, ou un toit. J'y connais rien, mais j'apprends vite. J'pourrais vous aider.",
                next: "bonjour",
                audio: "talua_00",
                duration: 8,
            },
            bonjour: {
                isCharlie: false,
                text: "Ah...J'taurai bien aidé, p'tit frère. Mais y'a pas de travail ici.",
                audio: "talua_01",
                duration: 5,
                options: [
                    {
                        text: "S'il vous plaît...",
                        to: "A",
                    },
                    {
                        text: "Tu parles d'une île paradisiaque...",
                        to: "B",
                    },
                ],
            },
            A: {
                isCharlie: true,
                text: "S'il vous plaît...Laissez-moi ma chance sérieux...J'vous décevrai pas, c'est juré.",
                next: "C",
                audio: "talua_02_A",
                duration: 5,
            },
            B: {
                isCharlie: true,
                text: "Tu parles d'une île paradisiaque... On se croirait plutôt dans un congélateur.",
                next: "D",
                audio: "talua_02_B",
                duration: 3,
            },
            C: {
                isCharlie: false,
                text: "Désolé mec, j'suis pas le bon gars.",
                audio: "talua_03_A",
                duration: 2,
            },
            D: {
                isCharlie: false,
                text: "Ah...Fais gaffe à ce que tu dis si tu veux pas de problèmes avec les gens du coin. Moi j'peux rien pour toi.",
                audio: "talua_03_B",
                duration: 5,
            },
        },
    },
    tehani: {
        name: "Tehani",
        done: false,
        fallback: "Je t'ai déjà dit non, va voir ailleurs.",
        dialogs: {
            start: {
                isCharlie: true,
                text: "Bonjour M'dame, dites vous auriez pas du boulot pour moi ? Je suis peintre, mais j'peux tout faire si y faut.",
                audio: "tehani_00",
                next: "bonjour",
                duration: 6,
            },
            bonjour: {
                isCharlie: false,
                text: "Oh là garçon ! T'es pas du coin, pas vrai ? On embauche pas les étrangers ici. C'est mauvais pour les affaires.",
                audio: "tehani_01",
                duration: 8,
                options: [
                    {
                        text: "Votre stand là, j'pourrai le'repeindre si vous voulez.",
                        to: "A",
                    },
                    {
                        text: "C'est cette camelote que vous appelez une affaire ?",
                        to: "B",
                    },
                ],
            },
            A: {
                isCharlie: false,
                text: "Votre stand là, j'pourrai le'repeindre si vous voulez. J'suis peintre, c'est dans mes cordes",
                audio: "tehani_02_A",
                duration: 3,
            },
            B: {
                isCharlie: false,
                text: "C'est cette camelote que vous appelez une affaire ? On se croirait au vide grenier d'une décharge.",
                audio: "tehani_02_B",
                duration: 6,
            },
            C: {
                isCharlie: true,
                text: "T'as du coton dans les oreilles ? J'ai dis non ! Allez, ouste !",
                next: "D",
                audio: "tehani_03_A",
                duration: 3,
            },
            D: {
                isCharlie: false,
                text: "Du balais morveux ! Avant que j'te dresse à coup d'pieds !",
                audio: "tehani_03_B",
                duration: 3,
            },
        },
    },
};
