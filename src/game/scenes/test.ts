import * as THREE from "three";
import BaseScene from "./BaseScene";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
import { eventEmitterInstance } from "../../utils/eventEmitter";

export class Test extends BaseScene {
    private gltfModel: THREE.Group | null = null;
    private mixer: THREE.AnimationMixer | null; // Store the animation
    constructor() {
        super("test");
        this.instance.background = new THREE.Color(0x000000);
        this.mixer = null;

        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(-1, 1, -0.5);
        light.intensity = 1;
        this.instance.add(light);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.instance.add(ambientLight);

        this.instance.add(new THREE.HemisphereLight(0xffffff, 0x000000, 0.5));

        this.generateSpawns([
            {
                position: new THREE.Vector3(3, -0.99, 1),
                userData: {
                    to: "dream",
                },
            },
            {
                position: new THREE.Vector3(2, -0.99, 1),
                userData: {
                    from: "dream",
                },
            },
            {
                position: new THREE.Vector3(3, -0.99, 1.75),
                userData: {
                    to: "hub_end",
                },
            },
            {
                position: new THREE.Vector3(2, -0.99, 1.75),
                userData: {
                    from: "hub_end",
                },
            },
            {
                position: new THREE.Vector3(3, -0.99, 2.5),
                userData: {
                    to: "hub_pano",
                },
            },
            {
                position: new THREE.Vector3(2, -0.99, 2.5),
                userData: {
                    from: "hub_pano",
                },
            },
            {
                position: new THREE.Vector3(3, -0.99, 3.25),
                userData: {
                    to: "hub",
                },
            },
            {
                position: new THREE.Vector3(2, -0.99, 3.25),
                userData: {
                    from: "hub",
                },
            },
            {
                position: new THREE.Vector3(0, -0.99, 3.25),
                userData: {
                    to: "dark_world",
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

        this.instance.background = new THREE.Color(0xaabbcc);

        this.loadGLTFModel();
        eventEmitterInstance.on(`updateScene-${this.scene_id}`, this.update.bind(this));
    }

    private update = () => {
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
