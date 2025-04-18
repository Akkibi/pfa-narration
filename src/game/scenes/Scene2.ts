import * as THREE from "three";
import BaseScene from "./BaseScene";
import { GLTFLoader } from "three/examples/jsm/Addons.js";

export class Scene2 extends BaseScene {
    public spawnArray: THREE.PolarGridHelper[] = [];
    private gltfModel: THREE.Group | null = null;

    constructor() {
        super(2);

        // const GROUND_WIDHT = 10;
        // const GROUND_HEIGHT = 10;

        // const floor = new THREE.Mesh(
        //     new THREE.PlaneGeometry(GROUND_WIDHT, GROUND_HEIGHT),
        //     new THREE.MeshStandardMaterial({ color: "white" })
        // );
        // floor.name = "floor";
        // floor.position.set(GROUND_WIDHT / 2, - this.character.vars.height / 2, GROUND_HEIGHT / 2);
        // floor.rotation.x = -Math.PI / 2;
        // this.instance.add(floor);


        this.generateSpawns([{
            position: new THREE.Vector3(6, 0, -3),
            userData: {
                to: 1
            }
        }, {
            position: new THREE.Vector3(7, 0, -3),
            userData: {
                from: 1
            }
        }
        ]);

        this.character.getInstance().position.set(0, 0, 1);
        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(5, 10, 7.5);
        this.instance.add(light);
        // this.floor.addFloor(floor); // Store the loaded model
        this.character.addAxesHelper(this.axesHelper);

        this.loadGLTFModel()
    }

    private loadGLTFModel(): void {
        const loader = new GLTFLoader();

        // Replace 'path/to/your/model.gltf' with the actual path to your GLTF file
        loader.load(
            "./scene2/scene.glb",
            (gltf: { scene: THREE.Group }) => {
                this.gltfModel = gltf.scene; // Store the loaded model
                this.instance.add(this.gltfModel); // Add the model to the scene
                console.log(this.gltfModel)
                // Optionally, adjust the model's position, rotation, or scale
                if (this.gltfModel) {
                    this.gltfModel.position.set(0, 0, 0);
                    this.gltfModel.scale.set(1, 1, 1);
                    this.gltfModel.rotation.set(0, Math.PI, 0);
                }
                this.instance.background = new THREE.Color(0x00ffff);

            },
            undefined,
            (error) => {
                console.error("An error occurred while loading the GLTF model:", error);
            },
        );
        loader.load(
            "./scene2/floor.glb",
            (gltf: { scene: THREE.Group }) => {
                // this.instance.add(this.floor); // Add the model to the scene
                const floor = gltf.scene.children[0] as THREE.Mesh;
                floor.visible = false;
                this.instance.add(floor);
                // Optionally, adjust the model's position, rotation, or scale
                if (floor) {
                    floor.position.set(0, 0, 0);
                    floor.scale.set(1, 1, 1);
                    floor.rotation.set(0, Math.PI, 0);
                }
                this.floor.addFloor(floor);
            },
            undefined,
            (error) => {
                console.error("An error occurred while loading the GLTF model:", error);
            },
        );
    }
}
