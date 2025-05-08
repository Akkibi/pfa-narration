import * as THREE from "three";
import { eventEmitterInstance } from "../utils/eventEmitter";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
import { InteractiveObjectType } from "../data/interactive_objects";
import BaseScene from "./scenes/BaseScene";
import Controls from "./Controls";
import { lerp } from "three/src/math/MathUtils.js";

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
        this.instance.material = this.material;

        this.loadObject(this.baseObject.gltf_src, this.instance);

        // Listeners
        eventEmitterInstance.on(`updateScene-${this.id}`, this.update.bind(this));
        eventEmitterInstance.on(
            `characterPositionChanged-${this.id}`,
            this.isCharacterInInteractiveArea.bind(this),
        );
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
                    GLTFMesh.material = this.material;

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
        const distance = pos.distanceTo(this.position);
        if (this.is_active !== distance < 0.5) {
            eventEmitterInstance.trigger(`showInteractiveObjectControls`, [distance < 0.5]);
        }
        this.is_active = distance < 0.5;
    }

    private async showObject() {
        console.log("showObject", this.scene.camera.camera.position);

        const res = await this.loadObject(this.baseObject.gltf_src, this.activeInstance);
        // Prevent character from moving when the object is active
        eventEmitterInstance.trigger(`toggleInteractiveObject`, [true]);

        if (res) {
            this.scene.instance.add(this.activeInstance);
            this.activeInstance.material = new THREE.MeshBasicMaterial({
                color: new THREE.Color("red"),
            });
            const starting_position = new THREE.Vector3(
                this.scene.camera.instance.position.x + 4,
                this.scene.camera.instance.position.y + 1,
                this.scene.camera.instance.position.z,
            );
            this.activeInstance.scale.set(0.5, 0.5, 0.5);
            this.activeInstance.position.copy(starting_position);
            console.log("activeInstance", this.activeInstance.position);
            console.log("camera", this.scene.camera.camera.position);
            console.log("char", this.scene.camera.instance.position);
            this.is_shown = true;
        }
    }

    private async moveObject(startPosition: THREE.Vector3, targetPosition: THREE.Vector3) {
        const lerpPosition = new THREE.Vector3(
            lerp(startPosition.x, targetPosition.x, 0.05),
            lerp(startPosition.y, targetPosition.y, 0.05),
            lerp(startPosition.z, targetPosition.z, 0.05),
        );

        this.activeInstance.position.copy(lerpPosition);
    }

    private hideObject() {
        console.log("hideObject");
        eventEmitterInstance.trigger(`toggleInteractiveObject`, [false]);
        this.is_shown = false;

        this.activeInstance.material = new THREE.MeshBasicMaterial({ color: "blue" });
    }

    private update() {
        if (this.is_active) {
            let targetPosition = undefined;

            if (this.is_shown) {
                targetPosition = new THREE.Vector3(
                    this.scene.camera.instance.position.x,
                    this.scene.camera.instance.position.y + 1,
                    this.scene.camera.instance.position.z,
                );
            } else {
                targetPosition = new THREE.Vector3(
                    this.scene.camera.instance.position.x + 4,
                    this.scene.camera.instance.position.y + 1,
                    this.scene.camera.instance.position.z,
                );
            }

            if (targetPosition && this.activeInstance.position.distanceTo(targetPosition) > 0.5) {
                this.moveObject(this.activeInstance.position, targetPosition);
            } else if (targetPosition && !this.is_shown) {
                this.scene.instance.remove(this.activeInstance);
            }

            if (Controls.keys.interaction && !this.is_shown) {
                this.showObject();
                Controls.keys.interaction = false;
            } else if (this.is_shown && Controls.keys.interaction) {
                this.hideObject();
                Controls.keys.interaction = false;
            }
        }
    }
}
