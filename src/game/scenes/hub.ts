import * as THREE from "three";
import BaseScene from "./BaseScene";
import { GLTFLoader } from "three/examples/jsm/Addons.js";

export class Hub extends BaseScene {
    public spawnArray: THREE.PolarGridHelper[] = [];
    private gltfModel: THREE.Group | null = null;

    constructor() {
        super("hub_0");

        this.generateSpawns([
            {
                position: new THREE.Vector3(6, 0, -3),
                userData: {
                    to: "hub_2",
                },
            },
            {
                position: new THREE.Vector3(0, 3, 0),
                userData: {
                    from: "intro_prison",
                },
            },
            {
                position: new THREE.Vector3(1, 3, 0),
                userData: {
                    from: "test",
                },
            },
        ]);

        this.generateZoomZones([
            {
                position: new THREE.Vector3(10, 0, -5),
                userData: {
                    size: 5,
                    zoom: 0.5,
                },
            },
            {
                position: new THREE.Vector3(-30, 10, 5),
                userData: {
                    size: 10,
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
                console.log(this.gltfModel);
                // Optionally, adjust the model's position, rotation, or scale
                if (this.gltfModel) {
                    this.gltfModel.position.set(10, 0, -3);
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
            "./hub/floor.glb",
            (gltf: { scene: THREE.Group }) => {
                // this.instance.add(this.floor); // Add the model to the scene
                const floor = gltf.scene.children[0] as THREE.Mesh;
                floor.name = "floor";
                floor.visible = false;
                this.instance.add(floor);
                // Optionally, adjust the model's position, rotation, or scale
                if (floor) {
                    floor.position.set(10, 0, -3);
                    floor.scale.set(1, 1, 1);
                    floor.rotation.set(0, Math.PI, 0);
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
