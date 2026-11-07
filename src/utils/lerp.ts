import * as THREE from "three";

export const lerp = (a: number, b: number, t: number) => a * (1 - t) + b * t;

export const lerpVector3 = (a: THREE.Vector3, b: THREE.Vector3, t: number) =>
    new THREE.Vector3().addVectors(a.clone().multiplyScalar(1 - t), b.clone().multiplyScalar(t));

// Frame-rate independent lerp factor: `amount` is the per-frame factor at 60fps, `dt` is in 60fps frames.
export const damp = (amount: number, dt: number) => 1 - Math.pow(1 - amount, dt);
