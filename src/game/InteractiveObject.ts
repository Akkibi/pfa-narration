import * as THREE from "three";
import { eventEmitterInstance } from "../utils/eventEmitter";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
import { InteractiveObjectType } from "../data/objectsData";
import BaseScene from "./scenes/BaseScene";
import Controls from "./Controls";
import checkDistance from "../utils/utils";
import { lerp } from "../utils/lerp";
import Animation from "../utils/animationManager";

export class InteractiveObject {
    private id: number;
    public loaded: boolean;
    public instance: THREE.Mesh;
    public activeInstance: THREE.Mesh | null;
    public position: THREE.Vector3;
    public baseObject: InteractiveObjectType;
    private rotation: THREE.Euler;
    private scale: THREE.Vector3;
    private is_active: boolean;
    private is_shown: boolean;
    private material: THREE.MeshBasicMaterial;
    private scene: BaseScene;
    private lerpFromTo: LerpFromTo | null;
    private interactionIcon: THREE.Mesh;

    constructor(object: InteractiveObjectType, scene: BaseScene) {
        this.id = object.id;
        this.loaded = false;
        this.baseObject = object;
        this.instance = new THREE.Mesh();
        this.activeInstance = null;
        this.position = object.position;
        this.rotation = object.rotation;
        this.scale = object.scale;
        this.is_active = false;
        this.is_shown = false;
        this.material = new THREE.MeshBasicMaterial({ color: new THREE.Color("red") });
        this.scene = scene;
        this.lerpFromTo = null;

        // generate icon ping
        const iconMaterial = new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: 1,
        });
        const iconPlane = new THREE.PlaneGeometry(0.5, 0.5);
        this.interactionIcon = new THREE.Mesh(iconPlane, iconMaterial);
        const anim = new Animation(iconMaterial, this.scene.scene_id);
        anim.set([
            "./full-hub/flames/flamegreen/1.png",
            "./full-hub/flames/flamegreen/2.png",
            "./full-hub/flames/flamegreen/3.png",
            "./full-hub/flames/flamegreen/4.png",
            "./full-hub/flames/flamegreen/5.png",
            "./full-hub/flames/flamegreen/6.png",
            "./full-hub/flames/flamegreen/7.png",
            "./full-hub/flames/flamegreen/8.png",
            "./full-hub/flames/flamegreen/9.png",
            "./full-hub/flames/flamegreen/10.png",
            "./full-hub/flames/flamegreen/11.png",
            "./full-hub/flames/flamegreen/12.png",
            "./full-hub/flames/flamegreen/13.png",
            "./full-hub/flames/flamegreen/14.png",
            "./full-hub/flames/flamegreen/15.png",
        ]);
        this.interactionIcon.rotation.set(0, Math.PI, 0);
        this.interactionIcon.position.copy(this.position.clone().add(new THREE.Vector3(0, 1.5, 0)));
        this.scene.instance.add(this.interactionIcon);

        this.loadObject(this.baseObject.gltf_src);

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

    private async loadObject(gltf_src: string) {
        try {
            const mesh = await this.loadGLTFModel(gltf_src);

            this.instance = mesh;
            this.instance.position.copy(this.position);
            this.instance.rotation.copy(this.rotation);
            this.instance.scale.copy(this.scale);
            this.scene.instance.add(this.instance);

            this.activeInstance = mesh.clone();
            this.activeInstance.position.set(0, 0, 0);
            this.scene.instance.add(this.activeInstance);
            this.lerpFromTo = new LerpFromTo(this.activeInstance, this.position);
            this.activeInstance.visible = false;

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
        if (this.is_shown && this.lerpFromTo && this.scene.camera) {
            const targetPosition = this.scene.camera.instance.position
                .clone()
                .add(this.baseObject.activePosition);
            this.lerpFromTo.setTarget(targetPosition);
        }
        this.is_active = distance < 1;
    }

    private hideObject() {
        if (!this.activeInstance) return;
        this.is_shown = false;

        if (!this.scene.camera) {
            console.error("Camera is null");
            return;
        }
        const starting_position = this.scene.camera.instance.position
            .clone()
            .add(this.baseObject.activePosition);

        const targetPosition = this.scene.camera.instance.position
            .clone()
            .add(this.baseObject.hiddenPosition);

        if (this.lerpFromTo) {
            this.lerpFromTo.setCurrentPosition(starting_position);
            this.lerpFromTo.setTarget(targetPosition);
            this.lerpFromTo.setAction(() => {
                if (this.activeInstance) this.activeInstance.visible = false;
                this.is_active = false;
            });
        }
        eventEmitterInstance.trigger(`toggleInteractiveObjectPanel`, [undefined]);
        eventEmitterInstance.trigger(`toggleFreeze`, [false]);
    }

    private showObject() {
        if (!this.activeInstance) return;
        if (!this.scene.camera) {
            console.error("Camera is null");
            return;
        }
        this.is_active = true;
        this.is_shown = true;

        const starting_position = this.scene.camera.instance.position
            .clone()
            .add(this.baseObject.hiddenPosition);

        const targetPosition = this.scene.camera.instance.position
            .clone()
            .add(this.baseObject.activePosition);

        this.activeInstance.rotation.copy(this.baseObject.activeRotation);
        this.activeInstance.scale.set(0.5, 0.5, 0.5);
        this.activeInstance.position.copy(starting_position);
        this.activeInstance.visible = true;

        if (this.lerpFromTo) {
            this.lerpFromTo.setCurrentPosition(starting_position);
            this.lerpFromTo.setTarget(targetPosition);
        }
        eventEmitterInstance.trigger(`toggleFreeze`, [true]);
        eventEmitterInstance.trigger(`toggleInteractiveObjectPanel`, [this.baseObject]);
    }

    private update() {
        if (this.lerpFromTo) {
            this.lerpFromTo.update();
        }
        if (this.is_shown && this.activeInstance) {
            let rotationSpeed = 0.01;

            if (Controls.scroll !== 0) {
                rotationSpeed += Controls.scroll * 0.005;
                Controls.scroll *= 0.9;
            }

            this.activeInstance.rotation.y += rotationSpeed;
        }
    }
}

class LerpFromTo {
    private object: THREE.Mesh;
    private currentPosition: THREE.Vector3;
    private targetPosition: THREE.Vector3;
    private isMoving: boolean;
    private action: null | (() => void);

    constructor(object: THREE.Mesh, startPosition: THREE.Vector3) {
        this.object = object;
        this.currentPosition = startPosition;
        this.targetPosition = startPosition;
        this.isMoving = false;
        this.action = null;
    }

    public setTarget(targetPosition: THREE.Vector3) {
        this.targetPosition = targetPosition;
        this.isMoving = true;
    }

    public setAction(action: () => void) {
        this.action = action;
    }

    public setCurrentPosition(position: THREE.Vector3) {
        this.currentPosition = position;
    }

    public update() {
        if (!this.isMoving) return;
        const lerpPosition = new THREE.Vector3(
            lerp(this.currentPosition.x, this.targetPosition.x, 0.09),
            lerp(this.currentPosition.y, this.targetPosition.y, 0.09),
            lerp(this.currentPosition.z, this.targetPosition.z, 0.09),
        );

        if (lerpPosition.distanceTo(this.targetPosition) < 0.1) {
            this.isMoving = false;
            if (this.action) {
                this.action();
                this.action = null;
            }
            return;
        }

        this.object.position.copy(lerpPosition);
        this.currentPosition = lerpPosition;
    }
}
