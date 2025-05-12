import * as THREE from "three";

export default function checkDistance(vector1: THREE.Vector3, vector2: THREE.Vector3): number {
    const difference = new THREE.Vector3().subVectors(vector1, vector2)
    return Math.sqrt(difference.x * difference.x + difference.z * difference.z);
}
