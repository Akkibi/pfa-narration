import * as THREE from "three";
import BaseScene from "./BaseScene";
import { GLTFLoader } from "three/examples/jsm/Addons.js";

export class HubPano extends BaseScene {
    private gltfModel: THREE.Group | null = null;

    constructor() {
        super("hub_pano");

        this.generateSpawns([
            {
                position: new THREE.Vector3(-4, 0, -0.5),
                userData: {
                    to: "hub",
                },
            },
            {
                position: new THREE.Vector3(-3.5, 0, -0.5),
                userData: {
                    from: "hub",
                },
            },
            {
                position: new THREE.Vector3(0, 1, 0),
                userData: {
                    from: "intro_prison",
                },
            },
            {
                position: new THREE.Vector3(0, 1, 0),
                userData: {
                    from: "test",
                },
            },
        ]);

        this.generateZoomZones([
            {
                position: new THREE.Vector3(0, 1, 0),
                userData: {
                    size: 0.5,
                    zoom: 3,
                },
            },
            {
                position: new THREE.Vector3(0, 0, -5.5),
                userData: {
                    size: 5,
                    zoom: 0.5,
                },
            },
        ]);

        this.loadGLTFModel();
        this.instance.background = new THREE.Color(0x000000);
    }

    private loadGLTFModel(): void {
        const loader = new GLTFLoader();

        // Replace 'path/to/your/model.gltf' with the actual path to your GLTF file
        loader.load(
            "./hub/hub.glb",
            (gltf: { scene: THREE.Group }) => {
                this.gltfModel = gltf.scene; // Store the loaded model
                this.instance.add(this.gltfModel); // Add the model to the scene
                // Optionally, adjust the model's position, rotation, or scale
                if (this.gltfModel) {
                    this.gltfModel.position.set(0, 0, 0);
                    this.gltfModel.scale.set(3, 3, 3);
                    this.gltfModel.rotation.set(0, -Math.PI / 2, 0);
                }
            },
            undefined,
            (error) => {
                console.error("An error occurred while loading the GLTF model:", error);
            },
        );
        loader.load(
            "./hub/floor.glb",
            (gltf: { scene: THREE.Group }) => {
                // this.instance.add(this.floor); // Add the model to the scene
                const floor = gltf.scene.children[0] as THREE.Mesh;
                floor.name = "floor";
                floor.visible = false;
                this.instance.add(floor);
                // Optionally, adjust the model's position, rotation, or scale
                if (floor) {
                    floor.position.set(0, 0, 0);
                    floor.scale.set(3, 3, 3);
                    floor.rotation.set(0, -Math.PI / 2 + 0.1, 0);
                }
                this.createFloor(floor);
            },
            undefined,
            (error) => {
                console.error("An error occurred while loading the GLTF model:", error);
            },
        );
    }
}
