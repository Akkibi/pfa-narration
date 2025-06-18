import * as THREE from "three";
import { Scenes } from "../components/contexts/TransitionManager";

export type CharactersDataType = {
    [key: string]: CharacterDataType;
};

export type CharacterDataType = {
    sceneId: Scenes;
    position: THREE.Vector3;
    targetPosition: THREE.Vector3;
};

export const charactersData: CharactersDataType = {
    capitaine: {
        sceneId: "dream_3",
        position: new THREE.Vector3(23, 6, 5),
        targetPosition: new THREE.Vector3(-1, 0, -1),
    },
    talua: {
        sceneId: "dream_3",
        position: new THREE.Vector3(4, 1.5, 2),
        targetPosition: new THREE.Vector3(-1, 0, -2),
    },
    tahani: {
        sceneId: "dream_3",
        position: new THREE.Vector3(-4, 1.5, -5),
        targetPosition: new THREE.Vector3(-1, 0, -2),
    },
};
