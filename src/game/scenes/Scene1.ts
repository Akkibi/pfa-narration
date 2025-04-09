import * as THREE from "three";
import BaseScene from "./BaseScene";

export class Scene1 extends BaseScene {

    constructor() {
        super(1);

        const GROUND_WIDHT = 10;
        const GROUND_HEIGHT = 10;

        this.floor = new THREE.Mesh(
            new THREE.PlaneGeometry(GROUND_WIDHT, GROUND_HEIGHT),
            new THREE.MeshStandardMaterial({ color: "white" })
        );
        this.floor.name = "floor";
        this.floor.position.set(GROUND_WIDHT / 2, - this.character.vars.height / 2, GROUND_HEIGHT / 2);
        this.floor.rotation.x = -Math.PI / 2;
        this.instance.add(this.floor);

        this.character.getInstance().position.set(GROUND_WIDHT / 2, 0, 1);
        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(5, 10, 7.5);
        this.instance.add(light);
        this.character.addFloor(this.floor); // Store the loaded model
        this.character.addAxesHelper(this.axesHelper);
    }
}
