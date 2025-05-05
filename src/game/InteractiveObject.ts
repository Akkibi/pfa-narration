import * as THREE from "three";
import { eventEmitterInstance } from "../utils/eventEmitter";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
import { InteractiveObjectType } from "../data/interactive_objects";
import BaseScene from "./scenes/BaseScene";
import Controls from "./Controls";
import checkDistance from "../utils/utils";


export class InteractiveObject {
    private id: number;
    public loaded: boolean;
    public instance: THREE.Mesh;
    public activeInstance: THREE.Mesh;
    public position: THREE.Vector3;
    private baseObject: InteractiveObjectType;
    private rotation: THREE.Euler;
    private scale: THREE.Vector3;
    private is_active: boolean;
    private is_shown: boolean;
    private material: THREE.MeshBasicMaterial;
    private scene: BaseScene;

    constructor(object: InteractiveObjectType, scene: BaseScene) {
        this.id = object.id;
        this.loaded = false;
        this.baseObject = object;
        this.instance = new THREE.Mesh;
        this.activeInstance = new THREE.Mesh;
        this.position = object.position;
        this.rotation = object.rotation;
        this.scale = object.scale;
        this.is_active = false;
        this.is_shown = false;
        this.material = new THREE.MeshBasicMaterial({ color: new THREE.Color('red') });
        this.scene = scene;

        this.instance.position.copy(object.position);
        this.instance.rotation.copy(object.rotation);
        this.instance.scale.copy(object.scale);
        this.instance.material = this.material;

        this.loadObject(this.baseObject.gltf_src, this.instance);

        Controls.init();

        // Listeners
        eventEmitterInstance.on(`updateScene-${this.id}`, this.update.bind(this));
        eventEmitterInstance.on(`characterPositionChanged-${this.id}`, this.isCharacterInInteractiveArea.bind(this));
        // window.addEventListener('keypress', () => !this.is_shown ? this.showObject() : this.hideObject())s
    }

    private async loadObject(gltf_src: string, instance: THREE.Mesh) {
        console.log('loadObject')
        try {
            const mesh = await this.loadGLTFModel(gltf_src);

            instance.add(mesh);

            this.loaded = true;
        } catch (error) {
            console.error("Failed to load model:", error);
        }
    }

    private loadGLTFModel(src: string): Promise<THREE.Mesh> {
        return new Promise((resolve, reject) => {
            const loader = new GLTFLoader();

            loader.load(
                `./${src}`,
                (gltf: { scene: THREE.Group }) => {
                    const GLTFMesh = gltf.scene.children[0] as THREE.Mesh;
                    GLTFMesh.material = this.material;

                    resolve(GLTFMesh)
                },
                undefined,
                (error) => {
                    console.error("An error occurred while loading the GLTF model:", error);
                    reject(error)
                },
            );
        })
    }

    private isCharacterInInteractiveArea(pos: THREE.Vector3) {
        const distance = checkDistance(pos, this.position);
        console.log(distance < 0.5)
        eventEmitterInstance.trigger(`showInteractiveObjectControls`, [distance < 0.5]);
        // eventEmitterInstance.trigger(`toggleInteractiveObject`, [distance < 0.5]);
        this.is_active = distance < 0.5;
    }

    private showObject() {
        console.log('showObject')

        this.loadObject(this.baseObject.gltf_src, this.activeInstance);
        // Prevent character from moving when the object is active
        eventEmitterInstance.trigger(`toggleInteractiveObject`, [true]);

        this.activeInstance.material = this.material;
        this.activeInstance.position.x = this.scene.camera.camera.position.x - 0.5;
        this.activeInstance.position.y = this.scene.camera.camera.position.y - 1.3;
        this.activeInstance.position.z = this.scene.camera.camera.position.z + 6.5;

        this.is_shown = true;
    }

    private hideObject() {
        console.log('hideObject')
        eventEmitterInstance.trigger(`toggleInteractiveObject`, [false]);
        this.is_shown = false;

        this.activeInstance.material = new THREE.MeshBasicMaterial({ color : "blue"});
        this.activeInstance.position.x = this.scene.camera.camera.position.x - 0.5;
        this.activeInstance.position.y = this.scene.camera.camera.position.y - 1.3;
        this.activeInstance.position.z = this.scene.camera.camera.position.z + 6.5;
    }

    private update() {

        if (this.is_active && Controls.keys.interaction && !this.is_shown) {
            this.showObject()
        }
        else if (this.is_shown && Controls.keys.interaction) {
            this.hideObject();
        }
    }
}
