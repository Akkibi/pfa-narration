import * as THREE from "three";
import BaseScene from "./BaseScene";
import { GLTFLoader } from "three/examples/jsm/Addons.js";

export class DarkWorld extends BaseScene {
    private gltfModel: THREE.Group | null = null;

    constructor() {
        super("dark_world");

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
                position: new THREE.Vector3(-10, 10, -110),
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

        this.generateBackgroundMaps(
            [
                "./dark-world/backgrounds/1.png",
                "./dark-world/backgrounds/2.png",
                "./dark-world/backgrounds/3.png",
                "./dark-world/backgrounds/4.png",
            ],
            new THREE.Vector3(0, 50, -100),
        );

        this.loadGLTFModel();
        this.instance.background = new THREE.Color(0x000000);
    }

    private loadGLTFModel(): void {
        const loader = new GLTFLoader();
        loader.load(
            "./dark-world/dunes.glb",
            (gltf: { scene: THREE.Group }) => {
                this.gltfModel = gltf.scene; // Store the loaded model
                this.instance.add(this.gltfModel); // Add the model to the scene
                // Optionally, adjust the model's position, rotation, or scale
                if (this.gltfModel) {
                    this.gltfModel.position.set(0, 0, 0);
                    this.gltfModel.scale.multiplyScalar(20);
                    this.gltfModel.rotation.set(0, Math.PI / 2, 0);
                }
            },
            undefined,
            (error) => {
                console.error("An error occurred while loading the GLTF model:", error);
            },
        );
        loader.load(
            "./dark-world/dunes-floor.glb",
            (gltf: { scene: THREE.Group }) => {
                // this.instance.add(this.floor); // Add the model to the scene
                const floor = gltf.scene.children[0] as THREE.Mesh;
                floor.name = "floor";
                floor.visible = false;
                this.instance.add(floor);
                // Optionally, adjust the model's position, rotation, or scale
                if (floor) {
                    floor.position.set(0, 0, 0);
                    floor.scale.multiplyScalar(20);
                    floor.rotation.set(0, Math.PI / 2, 0);
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
