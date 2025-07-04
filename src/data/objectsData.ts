import * as THREE from "three";
import { DarkWorldSubs, Subtitle } from "./subsData";
import { eventEmitterInstance } from "../utils/eventEmitter";

type InteractiveObjectsType = {
    [key: string]: InteractiveObjectType;
};

export interface InteractiveObjectType {
    id: number;
    gltf_src: string;
    position: THREE.Vector3;
    rotation: THREE.Euler;
    scale: THREE.Vector3;
    isVisible: boolean;
    // Active Object View
    activePosition: THREE.Vector3;
    hiddenPosition: THREE.Vector3;
    activeRotation: THREE.Euler;
    activeScale?: THREE.Vector3; // Optional, used for some objects
    subtitle: Subtitle;
    onInteractionEnd?: () => void; // Optional callback for interaction end
}

export const InteractiveObjects: InteractiveObjectsType = {
    chevaletEnfer: {
        id: 2,
        gltf_src: "./objects/chevalet-enfer.glb",
        position: new THREE.Vector3(-31.4, 2.5, -9.5),
        rotation: new THREE.Euler(0, Math.PI / 1.5, 0),
        scale: new THREE.Vector3(0.3, 0.3, 0.3),
        isVisible: true,

        // Active Object View
        activePosition: new THREE.Vector3(0, 1.2, -2),
        hiddenPosition: new THREE.Vector3(0, 4, 0),
        activeRotation: new THREE.Euler(0, Math.PI, 0),
        activeScale: new THREE.Vector3(0.3, 0.3, 0.3),
        subtitle: {
            name: "object_01",
            text: "Peindre, c'est tout c'que j'sais faire pour gagner ma vie.",
            audio: "object_01",
            duration: 6,
        },
    },
    bottleGlass: {
        id: 3,
        gltf_src: "./objects/bottle-glass.glb",
        position: new THREE.Vector3(7, 0.2, -13),
        rotation: new THREE.Euler(0, Math.PI / 3, 0),
        scale: new THREE.Vector3(0.1, 0.1, 0.1),
        isVisible: true,

        // Active Object View
        activePosition: new THREE.Vector3(0, 2, -1),
        hiddenPosition: new THREE.Vector3(0, 4, 0),
        activeRotation: new THREE.Euler(0, Math.PI, 0),
        subtitle: {
            name: "object_00",
            text: "Franchement, là j'dirai pas non à ptit verre. Mais faut que j'me tienne à carreau. Pas question d'retomber.",
            audio: "object_00",
            duration: 3,
        },
    },
    bowl: {
        id: 4,
        gltf_src: "./objects/bowl.glb",
        position: new THREE.Vector3(-64.7, -5, -29.5),
        rotation: new THREE.Euler(0, Math.PI / 3, 0),
        scale: new THREE.Vector3(0.2, 0.2, 0.2),
        isVisible: true,
        // Active Object View
        activePosition: new THREE.Vector3(0, 1.5, -2),
        hiddenPosition: new THREE.Vector3(0, 4, 0),
        activeRotation: new THREE.Euler(0, Math.PI, 0),
        subtitle: {
            name: "object_02",
            text: "Les gens d'ici en ont rien à foutre de mon art. Pas un rond en un mois.",
            audio: "object_02",
            duration: 6,
        },
    },
    chevaletDarkWorld: {
        id: 5,
        gltf_src: "./objects/chevalet-enfer.glb",
        position: new THREE.Vector3(16, 6, -50),
        rotation: new THREE.Euler(0, Math.PI / 1.5, 0),
        isVisible: false,
        scale: new THREE.Vector3(0.3, 0.3, 0.3),
        // Active Object View
        activePosition: new THREE.Vector3(0, 1.2, -2),
        hiddenPosition: new THREE.Vector3(0, 4, 0),
        activeRotation: new THREE.Euler(0, Math.PI, 0),
        activeScale: new THREE.Vector3(0.3, 0.3, 0.3),
        subtitle: {
            name: "object_03",
            text: "J'sais même plus si cette toile est  la mienne ou celle de Manaïa. Ce mec m'a aidé et pour le remercier, j'ai volé ses oeuvres. Je les aies vendues, comme si c'étaient les miennes et pendant des années j'ai joué au génie en recopiant tout de mémoire. Mais en fait, j'suis qu'un imposteur.",
            audio: "object_03",
            duration: 18,
        },
        onInteractionEnd: () => {
            eventEmitterInstance.trigger("showInteractiveObjectControls", [false]);
            eventEmitterInstance.trigger("triggerSubs", [DarkWorldSubs]);
            setTimeout(() => {
                eventEmitterInstance.trigger("scene-change-ui", ["stairs"]);
            }, 21000);
        },
    },
};
