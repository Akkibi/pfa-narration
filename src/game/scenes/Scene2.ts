import * as THREE from "three";
import BaseScene from "./BaseScene";

export class Scene2 extends BaseScene {
    public spawnArray: THREE.PolarGridHelper[] = [];
    constructor() {
        super(2);

        const GROUND_WIDHT = 10;
        const GROUND_HEIGHT = 10;

        const floor = new THREE.Mesh(
            new THREE.PlaneGeometry(GROUND_WIDHT, GROUND_HEIGHT),
            new THREE.MeshStandardMaterial({ color: "white" })
        );
        floor.name = "floor";
        floor.position.set(GROUND_WIDHT / 2, - this.character.vars.height / 2, GROUND_HEIGHT / 2);
        floor.rotation.x = -Math.PI / 2;
        this.instance.add(floor);


        this.generateSpawns([{
            position: new THREE.Vector3(3, -0.49, 1),
            userData: {
                to: 1
            }
        }, {
            position: new THREE.Vector3(2, -0.49, 1),
            userData: {
                from: 1
            }
        }
        ]);

        this.character.getInstance().position.set(GROUND_WIDHT / 2, 0, 1);
        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(5, 10, 7.5);
        this.instance.add(light);
        this.floor.addFloor(floor); // Store the loaded model
        this.character.addAxesHelper(this.axesHelper);
    }
}
