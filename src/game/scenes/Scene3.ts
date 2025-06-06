import * as THREE from "three";
import BaseScene from "./BaseScene";
import { GLTFLoader } from "three/examples/jsm/Addons.js";

export class Scene3 extends BaseScene {
    public spawnArray: THREE.PolarGridHelper[] = [];
    private gltfModel: THREE.Group | null = null;

    constructor() {
        super(3);

        this.generateSpawns([
            {
                position: new THREE.Vector3(6, 0, -3),
                userData: {
                    to: 1,
                },
            },
            {
                position: new THREE.Vector3(7, 0, -3),
                userData: {
                    from: 1,
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

        // this.character.setPosition(new THREE.Vector2(10, -5));
        // this.character.setFloor();

        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(-1, 1, -0.5);
        light.intensity = 1;
        this.instance.add(light);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.instance.add(ambientLight);

        // this.floor.addFloor(floor); // Store the loaded model
        // this.character.addAxesHelper(this.axesHelper);

        this.loadGLTFModel();
    }

    private loadGLTFModel(): void {
        const loader = new GLTFLoader();

        // Replace 'path/to/your/model.gltf' with the actual path to your GLTF file
        loader.load(
            "./scene2/scene.glb",
            (gltf: { scene: THREE.Group }) => {
                this.gltfModel = gltf.scene; // Store the loaded model
                this.instance.add(this.gltfModel); // Add the model to the scene
                console.log(this.gltfModel);
                // Optionally, adjust the model's position, rotation, or scale
                if (this.gltfModel) {
                    this.gltfModel.position.set(0, 0, 0);
                    this.gltfModel.scale.set(1, 1, 1);
                    this.gltfModel.rotation.set(0, Math.PI, 0);
                }
                this.instance.background = new THREE.Color(0x00ffff);
            },
            undefined,
            (error) => {
                console.error("An error occurred while loading the GLTF model:", error);
            },
        );
        loader.load(
            "./scene2/floor.glb",
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
