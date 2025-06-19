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
                isCharlie: true,
                text: "Votre stand là, j'pourrai le'repeindre si vous voulez. J'suis peintre, c'est dans mes cordes",
                audio: "tehani_02_A",
                next: "C",
                duration: 3,
            },
            B: {
                isCharlie: true,
                text: "C'est cette camelote que vous appelez une affaire ? On se croirait au vide grenier d'une décharge.",
                audio: "tehani_02_B",
                next: "D",
                duration: 6,
            },
            C: {
                isCharlie: false,
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
    manaia: {
        name: "Manaia",
        done: false,
        fallback: "On se retrouve au sommet de la colline.",
        dialogs: {
            start: {
                isCharlie: true,
                text: "Salut mec, t'as pas un ptit billet à me dépanner. Ça fait des semaines que j'suis à sec, j'crève la dalle.",
                audio: "manaia_00",
                next: "bonjour",
                duration: 8,
            },
            // Initial greeting by Manaia in response to Charlie's "Salut mec…"
            bonjour: {
                isCharlie: false,
                text: "J'te reconnais ! T'es le gars qui peint au village. Qu'est-ce que t'es venu foutre dans un trou pareil ?",
                audio: "manaia_01",
                duration: 6,
                options: [
                    { text: "J'crois pas qu'ça te regarde.", to: "bloc0A" },
                    { text: "J'cherche un avenir meilleur, mec.", to: "bloc0B" },
                ],
            },

            bloc0A: {
                isCharlie: true,
                text: " J'crois pas qu'ça te regarde. Et qu'est-ce que t'en as à faire de toutes façons ?",
                audio: "manaia_02_A",
                duration: 4,
                next: "bloc1A",
            },

            bloc0B: {
                isCharlie: true,
                text: "J'cherche un avenir meilleur, mec. J'pensais trouver ça ici.",
                audio: "manaia_02_B",
                duration: 4,
                next: "bloc1B",
            },

            // MANAIA's reply if Charlie chose Bloc 1 A
            bloc1A: {
                isCharlie: false,
                text: "Doucement mon gars, on est pas ennemis. On a plus de points communs que ce que tu crois.",
                audio: "manaia_03_A",
                duration: 5,
                options: [
                    {
                        text: "Qu'est-ce que j'peux avoir en commun avec un gars comme toi ?",
                        to: "bloc2A",
                    },
                    { text: "J'peux savoir c'qui te fais penser ça ?", to: "bloc2B" },
                ],
            },

            // MANAIA's reply if Charlie chose Bloc 1 B
            bloc1B: {
                isCharlie: false,
                text: "Comme tout le monde y paraît. On a plus de points communs que ce que tu crois.",
                audio: "manaia_03_B",
                duration: 4,
                options: [
                    {
                        text: "Qu'est-ce que j'peux avoir en commun avec un gars comme toi ?",
                        to: "bloc2A",
                    },
                    { text: "J'peux savoir c'qui te fais penser ça ?", to: "bloc2B" },
                ],
            },

            // MANAIA's reply if Charlie in Bloc 3 chose OPT.A
            bloc2A: {
                isCharlie: true,
                text: "Qu'est-ce que j'peux avoir en commun avec un gars comme toi ? Sérieux, tu t'es vu ?",
                audio: "manaia_04_A",
                duration: 4,
                next: "bloc3",
                // no further options here, Charlie's next line would be the end of the scene
            },

            // MANAIA's reply if Charlie in Bloc 3 chose OPT.B
            bloc2B: {
                isCharlie: true,
                text: "Ah ouai? J'peux savoir c'qui te fais penser ça ? Perso, les faux sourires et les chapeaux à fleurs c'est pas mon truc.",
                audio: "manaia_04_B",
                duration: 8,
                next: "bloc3",
            },

            // Invitation to visit the atelier (shared for both Bloc1 branches)
            bloc3: {
                isCharlie: false,
                text: "Tu le sait peut être pas? Mais toi et moi on a choisi la vie d'artiste. J'ai un atelier un peu plus haut sur la colline, ça te dit de visiter ?",
                audio: "manaia_05",
                duration: 7,
                options: [
                    { text: "Et pourquoi je f'rai ça ?", to: "bloc4A" },
                    { text: "Ouais, ça s'tente.", to: "bloc4B" },
                ],
            },

            bloc4A: {
                isCharlie: true,
                text: "Et pourquoi je f'rai ça ? J'te connais même pas, sérieux...",
                audio: "manaia_06_A",
                duration: 3,
                next: "bloc5",
                // no further options here, Charlie's next line would be the end of the scene
            },

            bloc4B: {
                isCharlie: true,
                text: "Ouais, ça s'tente. J'ai rien d'mieux à faire de toutes façons.",
                audio: "manaia_06_B",
                duration: 4,
                next: "bloc5",
            },
            bloc5: {
                isCharlie: false,
                text: "Allez. Ça sera l'occasion de faire connaissance. Tu me suis ?",
                audio: "manaia_07",
                duration: 3,
            },
        },
    },
};
