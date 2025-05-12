import * as THREE from "three";

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
}

export const InteractiveObjects: InteractiveObjectType[] = [
    {
        id: 1,
        name: 'object_1',
        gltf_src: './object_1.glb',
        position: new THREE.Vector3(-1, -0.8, 6),
        rotation: new THREE.Euler(0, Math.PI * 0.8, 0),
        scale: new THREE.Vector3(0.3, 0.3, 0.3),
        // Active Object View
        activePosition: new THREE.Vector3(0, 1.8, -2),
        hiddenPosition: new THREE.Vector3(0, 4, 0),
        activeRotation: new THREE.Euler(0, Math.PI, 0)

    },
    {
        id: 2,
        name: 'object_2',
        gltf_src: './object_2.glb',
        position: new THREE.Vector3(1, -1, 6),
        rotation: new THREE.Euler(0, Math.PI, 0),
        scale: new THREE.Vector3(0.3, 0.3, 0.3),
        // Active Object View
        activePosition: new THREE.Vector3(0, 1, -2),
        hiddenPosition: new THREE.Vector3(0, 4, 0),
        activeRotation: new THREE.Euler(0, Math.PI, 0)

    }
]