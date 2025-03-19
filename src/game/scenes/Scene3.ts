import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { eventEmitterInstance } from "../../utils/eventEmitter";

export class Scene3 {
    public instance: THREE.Scene;
    public camera: THREE.PerspectiveCamera;
    private torus: THREE.Mesh;
    private gltfModel: THREE.Group | null = null; // To store the loaded GLTF model

    constructor() {
        this.instance = new THREE.Scene();
        this.instance.background = new THREE.Color(0x000030);

        // Add camera to scene
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000,
        );
        this.camera.position.z = 1.5;
        this.instance.add(this.camera);

        // Add cube to scene
        const geometry = new THREE.TorusGeometry(0.5, 0.25, 16, 16);
        const material = new THREE.MeshBasicMaterial({
            color: 0x0000ff,
            wireframe: true,
        });
        this.torus = new THREE.Mesh(geometry, material);
        this.torus.position.set(0, 0, 0);
        this.instance.add(this.torus);

        // Load GLTF model
        this.loadGLTFModel();

        // Register tick event
        this.registerEvents();
    }

    private loadGLTFModel(): void {
        const loader = new GLTFLoader();

        // Replace 'path/to/your/model.gltf' with the actual path to your GLTF file
        loader.load(
            "path/to/your/model.gltf",
            (gltf) => {
                this.gltfModel = gltf.scene; // Store the loaded model
                this.instance.add(this.gltfModel); // Add the model to the scene

                // Optionally, adjust the model's position, rotation, or scale
                if (this.gltfModel) {
                    this.gltfModel.position.set(0, 0, 0);
                    this.gltfModel.scale.set(1, 1, 1);
                }
            },
            undefined,
            (error) => {
                console.error("An error occurred while loading the GLTF model:", error);
            },
        );
    }

    private registerEvents(): void {
        // Bind the update method to the class instance
        const boundUpdate = this.update.bind(this);
        eventEmitterInstance.on("tick", boundUpdate);
    }

    private update(deltaTime: number): void {
        // Animate the cube
        this.torus.rotation.x += 0.5 * deltaTime;
        this.torus.rotation.y += 0.7 * deltaTime;

        // Optionally, animate the GLTF model if it exists
        if (this.gltfModel) {
            this.gltfModel.rotation.y += 0.5 * deltaTime;
        }
    }

    public handleResize = () => {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
    };
}
