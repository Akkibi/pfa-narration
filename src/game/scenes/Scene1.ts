import * as THREE from "three";
import BaseScene from "./BaseScene";

export class Scene1 extends BaseScene {

    constructor() {
        super(0);

        const GROUND_WIDTH = 10;
        const GROUND_LENGHT = 10;

        const ground = new THREE.Mesh(
            new THREE.PlaneGeometry(GROUND_WIDTH, GROUND_LENGHT),
            new THREE.MeshStandardMaterial({ color: "white" })
        );

        ground.position.set(GROUND_WIDTH / 2, 0, GROUND_LENGHT / 2);
        ground.rotation.x = -Math.PI / 2;

        this.instance.add(ground);

        this.character.setPosition(new THREE.Vector3(GROUND_WIDTH / 2, 0, 1));

        // Adding a light source since MeshStandardMaterial requires light
        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(5, 10, 7.5);
        this.instance.add(light);
    }
}
