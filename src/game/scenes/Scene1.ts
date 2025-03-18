import * as THREE from "three";
import BaseScene from "./BaseScene";

export class Scene1 extends BaseScene {

    constructor() {
        super();

        const ground = new THREE.Mesh(
            new THREE.PlaneGeometry(10, 20),
            new THREE.MeshStandardMaterial({ color: "white" })
        );

        ground.position.set(0, -2, 8);
        ground.rotation.x = -Math.PI / 2;

        this.instance.add(ground);

        // Adding a light source since MeshStandardMaterial requires light
        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(5, 10, 7.5);
        this.instance.add(light);
    }
}
