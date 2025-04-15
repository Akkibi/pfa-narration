import * as THREE from "three";

export type InteractiveObjectType = {
    name: string;
    position: THREE.Vector3;
    rotation: THREE.Euler;
    scale: THREE.Vector3;
    texture_src?: string;
    gltf_src: string;
}

export const InteractiveObjects: InteractiveObjectType[] = [
    {
        name: 'object_1',
        position: new THREE.Vector3(-1, -0.8, 6),
        rotation: new THREE.Euler(0, Math.PI * 0.8, 0),
        scale: new THREE.Vector3(0.3, 0.3, 0.3),
        gltf_src: './object_1.glb'
    }
]