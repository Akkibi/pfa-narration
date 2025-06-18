import * as THREE from "three";
import { Subtitle } from "./subsData";

type InteractiveObjectsType = {
    [key: string]: InteractiveObjectType;
};

export interface InteractiveObjectType {
    id: number;
    gltf_src: string;
    position: THREE.Vector3;
    rotation: THREE.Euler;
    scale: THREE.Vector3;
    // Active Object View
    activePosition: THREE.Vector3;
    hiddenPosition: THREE.Vector3;
    activeRotation: THREE.Euler;
    subtitle: Subtitle;
}

export const InteractiveObjects: InteractiveObjectsType = {
    susane: {
        id: 1,
        gltf_src: "./objects/susane.glb",
        position: new THREE.Vector3(-1, -0.8, 6),
        rotation: new THREE.Euler(0, Math.PI * 0.8, 0),
        scale: new THREE.Vector3(0.3, 0.3, 0.3),
        // Active Object View
        activePosition: new THREE.Vector3(0, 1.8, -2),
        hiddenPosition: new THREE.Vector3(0, 4, 0),
        activeRotation: new THREE.Euler(0, Math.PI, 0),
        subtitle: {
            name: "object_00",
            text: "Franchement, là j'dirai pas non à ptit verre. Mais faut que j'me tienne à carreau. Pas question d'retomber.",
            audio: "object_00",
            duration: 6,
        },
    },
    chevalet: {
        id: 2,
        gltf_src: "./objects/chevalet.glb",
        position: new THREE.Vector3(0, -1, 20),
        rotation: new THREE.Euler(0, Math.PI, 0),
        scale: new THREE.Vector3(0.3, 0.3, 0.3),
        // Active Object View
        activePosition: new THREE.Vector3(0, 1, -2),
        hiddenPosition: new THREE.Vector3(0, 4, 0),
        activeRotation: new THREE.Euler(0, Math.PI, 0),
        subtitle: {
            name: "object_00",
            text: "Franchement, là j'dirai pas non à ptit verre. Mais faut que j'me tienne à carreau. Pas question d'retomber.",
            audio: "object_00",
            duration: 6,
        },
    },
    chevaletEnfer: {
        id: 3,
        gltf_src: "./objects/chevalet-enfer.glb",
        position: new THREE.Vector3(-31.4, 2.5, -9.5),
        rotation: new THREE.Euler(0, Math.PI / 1.5, 0),
        scale: new THREE.Vector3(0.3, 0.3, 0.3),
        // Active Object View
        activePosition: new THREE.Vector3(0, 1, -2),
        hiddenPosition: new THREE.Vector3(0, 4, 0),
        activeRotation: new THREE.Euler(0, Math.PI, 0),
        subtitle: {
            name: "object_00",
            text: "Franchement, là j'dirai pas non à ptit verre. Mais faut que j'me tienne à carreau. Pas question d'retomber.",
            audio: "object_00",
            duration: 6,
        },
    },
    bottleGlass: {
        id: 3,
        gltf_src: "./objects/bottle-glass.glb",
        position: new THREE.Vector3(7, 0.2, -13),
        rotation: new THREE.Euler(0, Math.PI / 3, 0),
        scale: new THREE.Vector3(0.1, 0.1, 0.1),
        // Active Object View
        activePosition: new THREE.Vector3(0, 2, -1),
        hiddenPosition: new THREE.Vector3(0, 4, 0),
        activeRotation: new THREE.Euler(0, Math.PI, 0),
        subtitle: {
            name: "object_00",
            text: "Franchement, là j'dirai pas non à ptit verre. Mais faut que j'me tienne à carreau. Pas question d'retomber.",
            audio: "object_00",
            duration: 6,
        },
    },
    bowl: {
        id: 4,
        gltf_src: "./objects/bowl.glb",
        position: new THREE.Vector3(-32.7, 2.5, -9.5),
        rotation: new THREE.Euler(0, Math.PI / 3, 0),
        scale: new THREE.Vector3(0.2, 0.2, 0.2),
        // Active Object View
        activePosition: new THREE.Vector3(0, 1, -2),
        hiddenPosition: new THREE.Vector3(0, 4, 0),
        activeRotation: new THREE.Euler(0, Math.PI, 0),
        subtitle: {
            name: "object_00",
            text: "Franchement, là j'dirai pas non à ptit verre. Mais faut que j'me tienne à carreau. Pas question d'retomber.",
            audio: "object_00",
            duration: 6,
        },
    },
};
