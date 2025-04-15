import * as THREE from "three";
import BaseScene from "./BaseScene";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
import { InteractiveObject } from "../InteractiveObject";
import { InteractiveObjects } from "../../data/interactive_objects";

export class Scene1 extends BaseScene {
    private gltfModel: THREE.Group | null = null;
    constructor() {
        super(1);
        this.instance.background = new THREE.Color(0x00ffff);

        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(-1, 1, -0.5);
        light.intensity = 1;
        this.instance.add(light);

        const object_1 = new InteractiveObject(InteractiveObjects[0], 1);
        this.instance.add(object_1.instance);


        this.character.getInstance().userData = { name: "character02", sceneIndex: 1 };
        this.character.addAxesHelper(this.axesHelper);
        this.loadGLTFModel();
    }

    private loadGLTFModel(): void {
        const loader = new GLTFLoader();

        // Replace 'path/to/your/model.gltf' with the actual path to your GLTF file
        loader.load(
            "./pfa.glb",
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
            },
            undefined,
            (error) => {
                console.error("An error occurred while loading the GLTF model:", error);
            },
        );
        loader.load(
            "./floor.glb",
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
