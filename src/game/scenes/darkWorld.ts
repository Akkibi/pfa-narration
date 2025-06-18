import * as THREE from "three";
import BaseScene from "./BaseScene";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
import { eventEmitterInstance } from "../../utils/eventEmitter";
import { InteractiveObject } from "../InteractiveObject";
import { InteractiveObjects } from "../../data/objectsData";

export class DarkWorld extends BaseScene {
    private gltfModel: THREE.Group | null = null;

    constructor() {
        super("dark_world");
        this.generateSpawns([
            {
                position: new THREE.Vector3(-10, 5, -105),
                userData: {
                    from: "test",
                },
            },
            {
                position: new THREE.Vector3(-10, 5, -105),
                userData: {
                    from: "falling",
                },
            },
        ]);

        this.generateZoomZones([
            {
                position: new THREE.Vector3(0, 5, -85),
                userData: {
                    size: 10,
                    zoom: 0.4,
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

        const chevaleret = new InteractiveObject(InteractiveObjects.chevaletDarkWorld, this);
        this.instance.add(chevaleret.instance);
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
