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
        position: new THREE.Vector3(21, 6, 7),
        targetPosition: new THREE.Vector3(-1, 0, -1),
    },
    talua: {
        sceneId: "hub_1",
        position: new THREE.Vector3(5, 0, -1),
        targetPosition: new THREE.Vector3(-1, 0, 1),
    },
};
