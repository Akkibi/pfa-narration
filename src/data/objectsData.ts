import * as THREE from "three";
import { Subtitle } from "./subsData";

export type InteractiveObjectType = {
    id: number;
    name: string;
    position: THREE.Vector3;
    rotation: THREE.Euler;
    activePosition: THREE.Vector3;
    hiddenPosition: THREE.Vector3;
    activeRotation: THREE.Euler;
    scale: THREE.Vector3;
    texture_src?: string;
    gltf_src: string;
    subtitle: Subtitle;
};

export const InteractiveObjects: InteractiveObjectType[] = [
    {
        id: 1,
        name: "susane",
        gltf_src: "./susane.glb",
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
    {
        id: 2,
        name: "object_2",
        gltf_src: "./object_2.glb",
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
];
