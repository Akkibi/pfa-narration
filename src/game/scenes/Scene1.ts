import * as THREE from "three";
import BaseScene from "./BaseScene";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
import { InteractiveObject } from "../InteractiveObject";
import { InteractiveObjects } from "../../data/interactive_objects";
import { eventEmitterInstance } from "../../utils/eventEmitter";

export class Scene1 extends BaseScene {
    private gltfModel: THREE.Group | null = null;
    private mixer: THREE.AnimationMixer | null; // Store the animation
    private time: number = 0;
    constructor() {
        super("hub_1");
        this.instance.background = new THREE.Color(0x000000);
        this.mixer = null;

        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(-1, 1, -0.5);
        light.intensity = 1;
        this.instance.add(light);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.instance.add(ambientLight);

        this.instance.add(new THREE.HemisphereLight(0xffffff, 0x000000, 0.5));

        const object_1 = new InteractiveObject(InteractiveObjects[0], this);
        this.instance.add(object_1.instance);

        const object_2 = new InteractiveObject(InteractiveObjects[1], this);
        this.instance.add(object_2.instance);

        this.generateSpawns([
            {
                position: new THREE.Vector3(3, -0.99, 1),
                userData: {
                    to: "dream_3",
                },
            },
            {
                position: new THREE.Vector3(2, -0.99, 1),
                userData: {
                    from: "dream_3",
                },
            },
            {
                position: new THREE.Vector3(3, -0.99, 2),
                userData: {
                    to: 3,
                },
            },
            {
                position: new THREE.Vector3(2, -0.99, 1),
                userData: {
                    from: 3,
                },
            },
        ]);

        this.generateBackgroundMaps([
            "./scene1/backgrounds/background-1.png",
            "./scene1/backgrounds/background-2.png",
            "./scene1/backgrounds/background-3.png",
            "./scene1/backgrounds/background-4.png",
        ]);

        this.generateZoomZones([
            {
                position: new THREE.Vector3(10, -0.99, 2),
                userData: {
                    size: 5,
                    zoom: 0.25,
                },
            },
            {
                position: new THREE.Vector3(-8, -1, 2),
                userData: {
                    size: 4,
                    zoom: 0.5,
                },
            },
            {
                position: new THREE.Vector3(0, -0.99, 30),
                userData: {
                    size: 1,
                    zoom: 4,
                },
            },
        ]);

        this.loadGLTFModel();
        eventEmitterInstance.on(`updateScene-${this.scene_id}`, this.update.bind(this));
    }

    private update = () => {
        // this.time += 0.01;
        this.mixer?.update(0.025);
    };

    private loadGLTFModel(): void {
        const loader = new GLTFLoader();
        // Replace 'path/to/your/model.gltf' with the actual path to your GLTF file
        loader.load(
            "./scene1/scene.glb",
            (gltf: { scene: THREE.Group; animations: THREE.AnimationClip[] }) => {
                this.gltfModel = gltf.scene;
                this.instance.add(this.gltfModel);
                // console.log("aniams, animations", gltf.animations);
                if (this.gltfModel) {
                    this.gltfModel.position.set(0, 0, 0);
                    this.gltfModel.scale.set(1, 1, 1);
                    this.gltfModel.rotation.set(0, Math.PI, 0);
                }
                if (gltf.animations && gltf.animations.length > 0) {
                    this.mixer = new THREE.AnimationMixer(this.gltfModel);
                    gltf.animations.forEach((clip) => {
                        const clipbat = clip.clone();
                        this.mixer?.clipAction(clipbat).play();
                    });
                }
            },
            undefined,
            (error) => {
                console.error("An error occurred while loading the GLTF model:", error);
            },
        );
        loader.load(
            "./scene1/floor.glb",
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
                this.createFloor(floor);
            },
            undefined,
            (error) => {
                console.error("An error occurred while loading the GLTF model:", error);
            },
        );
    }
}
