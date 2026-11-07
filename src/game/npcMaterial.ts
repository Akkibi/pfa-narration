import * as THREE from "three";
import { MeshBasicNodeMaterial } from "three/webgpu";
import { color, dot, normalView, positionViewDirection } from "three/tsl";

const EDGE_COLOR = 0x8033ff;
const FRESNEL_POWER = 1.4;

// Transparent body, purple rim: opacity rises toward grazing angles.
export class NpcMaterial {
    private material: MeshBasicNodeMaterial;

    constructor() {
        this.material = new MeshBasicNodeMaterial({
            side: THREE.FrontSide,
            transparent: true,
            depthWrite: false,
        });
        const facing = dot(normalView, positionViewDirection).saturate();
        this.material.colorNode = color(EDGE_COLOR);
        this.material.opacityNode = facing.oneMinus().pow(FRESNEL_POWER);
    }

    getMaterial() {
        return this.material;
    }
}
