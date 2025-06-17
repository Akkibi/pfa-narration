import * as THREE from "three";
import BaseScene from "./BaseScene";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
import { eventEmitterInstance } from "../../utils/eventEmitter";

interface FloatingElement {
    object: THREE.Object3D;
    number: number;
    startPosition: THREE.Vector3;
}

export class Hub2 extends BaseScene {
    public spawnArray: THREE.PolarGridHelper[] = [];
    private gltfModel: THREE.Group | null = null;
    private floatingElements: FloatingElement[] = [];
    constructor() {
        super("hub_2");

        this.generateSpawns([
            {
                position: new THREE.Vector3(6, 0, -3),
                userData: {
                    to: "hub_1",
                },
            },
            {
                position: new THREE.Vector3(1, 0, 1),
                userData: {
                    from: "hub_1",
                },
            },
        ]);

        this.generateZoomZones([
            {
                position: new THREE.Vector3(-65, 0, -3),
                userData: {
                    size: 5,
                    zoom: 0.5,
                },
            },
            {
                position: new THREE.Vector3(-30, 0, 1),
                userData: {
                    size: 10,
                    zoom: 0.25,
                },
            },
        ]);

        this.generateBackgroundMaps(
            [
                "./full-hub/backgrounds/4.png",
                "./full-hub/backgrounds/3.png",
                "./full-hub/backgrounds/2.png",
                "./full-hub/backgrounds/1.png",
            ],
            new THREE.Vector3(-50, 0, 0),
        );
        this.loadGLTFModel();

        const imagePlane = new THREE.PlaneGeometry(10, 3);
        const imageMaterial = new THREE.MeshBasicMaterial({
            map: new THREE.TextureLoader().load("./full-hub/logo.png"),
            side: THREE.DoubleSide,
            transparent: true,
            alphaMap: new THREE.TextureLoader().load("./full-hub/logo-blend.png"),
        });
        const imageMesh = new THREE.Mesh(imagePlane, imageMaterial);
        imageMesh.position.set(-30, 5, 5);
        imageMesh.rotation.set(0, Math.PI, 0);
        this.instance.add(imageMesh);

        this.instance.background = new THREE.Color(0xeeeeaa);

        eventEmitterInstance.on(`updateScene-${this.scene_id}`, this.update.bind(this));
    }

    private update(tick: number) {
        if (this.floatingElements.length > 0) {
            this.floatingElements.forEach((element) => {
                const { object, number, startPosition } = element;
                // const startPositionClone = startPosition.clone();
                object.position.copy(
                    startPosition
                        .clone()
                        .add(
                            new THREE.Vector3(
                                Math.sin(tick / 200 + number) * 0.5,
                                Math.cos(tick / 200 + number + 173) * 0.5,
                                0,
                            ),
                        ),
                );
            });
        }
    }

    private loadGLTFModel(): void {
        const loader = new GLTFLoader();

        // Replace 'path/to/your/model.gltf' with the actual path to your GLTF file
        loader.load(
            "./full-hub/scene.glb",
            (gltf: { scene: THREE.Group }) => {
                this.gltfModel = gltf.scene; // Store the loaded model
                this.instance.add(this.gltfModel); // Add the model to the scene
                console.log(this.gltfModel);
                // Optionally, adjust the model's position, rotation, or scale
                if (this.gltfModel) {
                    this.gltfModel.position.set(0, 0, 1);
                    this.gltfModel.scale.set(1, 1, 1);
                    this.gltfModel.rotation.set(0, Math.PI / 2, 0);

                    // traverse gltf objects and push element if name start with floating
                    this.gltfModel.traverse((child) => {
                        if (child.name.startsWith("floating")) {
                            this.floatingElements.push({
                                object: child,
                                number: Math.random() * 10,
                                startPosition: child.position.clone(),
                            });
                        }
                    });
                    console.log(this.floatingElements);
                }
            },
            undefined,
            (error) => {
                console.error("An error occurred while loading the GLTF model:", error);
            },
        );
        loader.load(
            "./full-hub/floor.glb",
            (gltf: { scene: THREE.Group }) => {
                // this.instance.add(this.floor); // Add the model to the scene
                const floor = gltf.scene.children[0] as THREE.Mesh;
                floor.visible = false;
                this.instance.add(floor);
                // Optionally, adjust the model's position, rotation, or scale
                if (floor) {
                    floor.position.set(0, 0, 1);
                    floor.scale.set(1, 1, 1);
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
