import * as THREE from "three";
import { eventEmitterInstance } from "../utils/eventEmitter";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
import { InteractiveObjectType } from "../data/interactive_objects";
import BaseScene from "./scenes/BaseScene";
import Controls from "./Controls";
import { lerp } from "three/src/math/MathUtils.js";
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
        this.instance = new THREE.Mesh();
        this.activeInstance = new THREE.Mesh();
        this.position = object.position;
        this.rotation = object.rotation;
        this.scale = object.scale;
        this.is_active = false;
        this.is_shown = false;
        this.material = new THREE.MeshBasicMaterial({ color: new THREE.Color("red") });
        this.scene = scene;

        this.instance.position.copy(object.position);
        this.instance.rotation.copy(object.rotation);
        this.instance.scale.copy(object.scale);
        // this.instance.material = this.material;

        this.loadObject(this.baseObject.gltf_src, this.instance);

        // Listeners
        eventEmitterInstance.on(`updateScene-${this.scene.scene_id}`, this.update.bind(this));
        eventEmitterInstance.on(
            `characterPositionChanged-${this.scene.scene_id}`,
            this.isCharacterInInteractiveArea.bind(this),
        );
        eventEmitterInstance.on(`userInterractButtonPressed`, () => {
            if (this.is_active) {
                if (this.is_shown) {
                    this.hideObject();
                } else {
                    this.showObject();
                }
            }
        });
    }

    private async loadObject(gltf_src: string, instance: THREE.Mesh) {
        try {
            const mesh = await this.loadGLTFModel(gltf_src);

            instance.add(mesh);

            return true;
        } catch (error) {
            console.error("Failed to load model:", error);

            return false;
        }
    }

    private loadGLTFModel(src: string): Promise<THREE.Mesh> {
        return new Promise((resolve, reject) => {
            const loader = new GLTFLoader();

            loader.load(
                `./${src}`,
                (gltf: { scene: THREE.Group }) => {
                    const GLTFMesh = gltf.scene.children[0] as THREE.Mesh;
                    // GLTFMesh.material = this.material;

                    resolve(GLTFMesh);
                },
                undefined,
                (error) => {
                    console.error("An error occurred while loading the GLTF model:", error);
                    reject(error);
                },
            );
        });
    }

    private isCharacterInInteractiveArea(pos: THREE.Vector3) {
        const distance = checkDistance(pos, this.position);
        if (distance < 1 !== this.is_active)
            eventEmitterInstance.trigger(`showInteractiveObjectControls`, [distance < 1]);
        this.is_active = distance < 1;
    }

    private async showObject() {
        const res = await this.loadObject(this.baseObject.gltf_src, this.activeInstance);
        // Prevent character from moving when the object is active
        eventEmitterInstance.trigger(`toggleFreeze`, [true]);

        if (res) {
            this.scene.instance.add(this.activeInstance);
            // this.activeInstance.material = new THREE.MeshBasicMaterial({ color: new THREE.Color('red') });
            const starting_position = this.scene.camera.instance.position
                .clone()
                .add(this.baseObject.hiddenPosition);
            this.activeInstance.scale.set(0.5, 0.5, 0.5);
            this.activeInstance.rotation.copy(this.baseObject.activeRotation);
            this.activeInstance.position.copy(starting_position);
            this.is_shown = true;
            eventEmitterInstance.trigger(`toggleInteractiveObjectPanel`, [this]);
        }
    }

    private async moveObject() {
        let targetPosition = undefined;

        if (this.is_shown) {
            targetPosition = this.scene.camera.instance.position
                .clone()
                .add(this.baseObject.activePosition);
        } else {
            targetPosition = this.scene.camera.instance.position
                .clone()
                .add(this.baseObject.hiddenPosition);
        }

        if (targetPosition && this.activeInstance.position.distanceTo(targetPosition) > 0.1) {
            const lerpPosition = new THREE.Vector3(
                lerp(this.activeInstance.position.x, targetPosition.x, 0.09),
                lerp(this.activeInstance.position.y, targetPosition.y, 0.09),
                lerp(this.activeInstance.position.z, targetPosition.z, 0.09),
            );

            this.activeInstance.position.copy(lerpPosition);
        } else if (targetPosition && !this.is_shown) {
            this.scene.instance.remove(this.activeInstance);
        }
    }

    private hideObject() {
        this.is_shown = false;
        eventEmitterInstance.trigger(`toggleInteractiveObjectPanel`, [undefined]);
        eventEmitterInstance.trigger(`toggleFreeze`, [false]);
    }

    private update() {
        if (this.is_active) {
            this.moveObject();

            if (this.is_shown) {
                let rotationSpeed = 0.01;

                // Adjust rotation speed based on scroll
                if (Controls.scroll !== 0) {
                    rotationSpeed += Controls.scroll * 0.005;
                    Controls.scroll *= 0.9; // Reduce scroll effect over time
                }

                this.activeInstance.rotation.y += rotationSpeed;
            }
        }
    }
}
