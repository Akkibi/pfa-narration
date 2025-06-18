import * as THREE from "three";
import BaseScene from "./BaseScene";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
import { InteractiveObject } from "../InteractiveObject";
import { InteractiveObjects } from "../../data/objectsData";
import { eventEmitterInstance } from "../../utils/eventEmitter";

export class Dream extends BaseScene {
    private gltfModel: THREE.Group | null = null;
    private eye: THREE.Mesh | null = null;
    constructor() {
        super("dream");

        this.generateSpawns([
            {
                position: new THREE.Vector3(-161, 11, 46.5),
                userData: {
                    to: "hub_end",
                },
            },
            {
                position: new THREE.Vector3(-80, 8, -3),
                userData: {
                    from: "test",
                },
            },
            {
                position: new THREE.Vector3(20, 9, 13),
                userData: {
                    from: "hub",
                },
            },
        ]);

        this.generateZoomZones([
            {
                position: new THREE.Vector3(5, 0, -5),
                userData: {
                    size: 5,
                    zoom: 0.5,
                },
            },
            {
                position: new THREE.Vector3(-120, 7, 20),
                userData: {
                    size: 15,
                    zoom: 0.1,
                },
            },
            {
                position: new THREE.Vector3(-92, 12, 5),
                userData: {
                    size: 5,
                    zoom: 0.3,
                },
            },
        ]);

        this.generateBackgroundMaps(
            [
                "./souvenir/backgrounds/1.png",
                "./souvenir/backgrounds/2.png",
                "./souvenir/backgrounds/3.png",
                "./souvenir/backgrounds/4.png",
            ],
            new THREE.Vector3(-50, 20, 0),
        );

        this.generateSubtitlesTriggerZones([
            {
                position: new THREE.Vector3(5, 0, -5),
                userData: {
                    size: 5,
                    subtitle: {
                        name: "[CHARLIE]",
                        text: "Pas d'toit, pas d'taf, pas d'plan... Allez mec, faut qu'tu bouges. Pas question d'dormir dehors. Pas encore. Y a forcément quelqu'un qui pourra t'aider.",
                        audio: "dream_3_01",
                        duration: 9,
                    },
                },
            },
            {
                position: new THREE.Vector3(-12, 0, -3),
                userData: {
                    size: 3,
                    subtitle: {
                        name: "[CHARLIE]",
                        text: "J'perds mon temps, c'est chacun pour sa pomme ici. Va falloir que j'me débrouille autrement.",
                        audio: "dream_3_02",
                        duration: 6,
                    },
                },
            },
        ]);
        const chevaleret = new InteractiveObject(InteractiveObjects.chevaletEnfer, this);
        this.instance.add(chevaleret.instance);
        const bottle = new InteractiveObject(InteractiveObjects.bottleGlass, this);
        this.instance.add(bottle.instance);
        const bowl = new InteractiveObject(InteractiveObjects.bowl, this);
        this.instance.add(bowl.instance);

        // this.loadGLTFModel();
        this.instance.background = new THREE.Color(0xd3c9f2);

        eventEmitterInstance.on(
            `characterPositionChanged-${this.scene_id}`,
            this.update.bind(this),
        );
    }

    private update(position: THREE.Vector3): void {
        if (this.eye) {
            this.eye.lookAt(position);
        }
    }
    private loadGLTFModel(): void {
        const loader = new GLTFLoader();

        // Replace 'path/to/your/model.gltf' with the actual path to your GLTF file
        loader.load(
            "./souvenir/scene2.glb",
            (gltf: { scene: THREE.Group }) => {
                this.gltfModel = gltf.scene; // Store the loaded model
                this.instance.add(this.gltfModel); // Add the model to the scene
                // Optionally, adjust the model's position, rotation, or scale
                if (this.gltfModel) {
                    this.gltfModel.position.set(5, 0, -3);
                    this.gltfModel.scale.set(1, 1, 1);
                    this.gltfModel.rotation.set(0, Math.PI, 0);

                    this.gltfModel.traverse((child) => {
                        if (child.name === "Sphere_007") {
                            this.eye = child as THREE.Mesh;
                        }
                    });
                }
            },
            undefined,
            (error) => {
                console.error("An error occuerred while loading the GLTF model:", error);
            },
        );
        loader.load(
            "./souvenir/floor.glb",
            (gltf: { scene: THREE.Group }) => {
                // this.instance.add(this.floor); // Add the model to the scene
                const floor = gltf.scene.children[0] as THREE.Mesh;
                floor.name = "floor";
                floor.visible = false;
                this.instance.add(floor);
                // Optionally, adjust the model's position, rotation, or scale
                if (floor) {
                    floor.position.set(5, 0, -3);
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
