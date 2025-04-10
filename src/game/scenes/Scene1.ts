import * as THREE from "three";
import BaseScene from "./BaseScene";
import { GLTFLoader } from "three/examples/jsm/Addons.js";

export class Scene1 extends BaseScene {
    private gltfModel: THREE.Group | null = null;
    constructor() {
        super(1);

        this.instance.background = new THREE.Color(0xffff00);

        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(1, 1, 1);
        light.intensity = 1;
        this.instance.add(light);

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
                this.floor = gltf.scene.children[0] as THREE.Mesh;
                this.floor.visible = false;
                this.instance.add(this.floor);
                // Optionally, adjust the model's position, rotation, or scale
                if (this.floor) {
                    this.floor.position.set(0, 0, 0);
                    this.floor.scale.set(1, 1, 1);
                    this.floor.rotation.set(0, Math.PI, 0);
                }
                this.character.addFloor(this.floor); // Store the loaded model
            },
            undefined,
            (error) => {
                console.error("An error occurred while loading the GLTF model:", error);
            },
        );
    }
}
