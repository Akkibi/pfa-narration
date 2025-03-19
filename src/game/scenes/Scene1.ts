import * as THREE from "three";
import BaseScene from "./BaseScene";

export class Scene1 extends BaseScene {

    constructor() {
        super();

        const GROUND_WIDHT = 10;
        const GROUND_HEIGHT = 10;

        const ground = new THREE.Mesh(
            new THREE.PlaneGeometry(GROUND_WIDHT, GROUND_HEIGHT),
            new THREE.MeshBasicMaterial({ color: "white" })
        );

        ground.position.set(GROUND_WIDHT / 2, - this.character.vars.height / 2, GROUND_HEIGHT / 2);
        ground.rotation.x = -Math.PI / 2;

        this.instance.add(ground);

        this.playerMesh.position.set(GROUND_WIDHT / 2, 0, 1);

        // Adding a light source since MeshStandardMaterial requires light
        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(5, 10, 7.5);
        this.instance.add(light);
    }
}
