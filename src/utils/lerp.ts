import * as THREE from "three";

export const lerp = (a: number, b: number, t: number) => a * (1 - t) + b * t;

export const lerpVector3 = (a: THREE.Vector3, b: THREE.Vector3, t: number) =>
    new THREE.Vector3().addVectors(a.clone().multiplyScalar(1 - t), b.clone().multiplyScalar(t));
