import * as THREE from "three";
import BaseScene from "./BaseScene";

export class Scene3 extends BaseScene {
    private torus: THREE.Mesh;

    constructor() {
        super(3);

        this.instance = new THREE.Scene();
        this.instance.background = new THREE.Color(0x000030);

        // Add cube to scene
        const geometry = new THREE.TorusGeometry(0.5, 0.25, 16, 16);
        const material = new THREE.MeshBasicMaterial({
            color: 0x0000ff,
            wireframe: true,
        });
        this.torus = new THREE.Mesh(geometry, material);
        this.torus.position.set(0, 0, 0);
        this.instance.add(this.torus);
    }
}
