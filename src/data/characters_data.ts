import * as THREE from "three";

export type CharactersDataType = {
    [key: string]: CharacterDataType;
};

export type CharacterDataType = {
    sceneId: number;
    position: THREE.Vector3;
    targetPosition: THREE.Vector3;
};

export const charactersData: CharactersDataType = {
    capitaine: {
        sceneId: 1,
        position: new THREE.Vector3(1.5, -1, 5),
        targetPosition: new THREE.Vector3(-1, 0, -1),
    },
    talua: {
        sceneId: 2,
        position: new THREE.Vector3(10, 0, 0),
        targetPosition: new THREE.Vector3(-1, 0, 1),
    },
};
