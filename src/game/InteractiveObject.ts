import * as THREE from "three";
import { eventEmitterInstance } from "../utils/eventEmitter";
import { InteractiveObjectType } from "../data/objectsData";
import type BaseScene from "./scenes/BaseScene";
import type { SceneChild } from "./scenes/BaseScene";
import Controls from "./Controls";
import checkDistance from "../utils/utils";
import { damp } from "../utils/lerp";
import { InteractionIcon } from "./inrecationIcon";
import { loadModel } from "./assets";
import { gameState } from "./gameState";

export class InteractiveObject implements SceneChild {
    public instance: THREE.Mesh;
    public activeInstance: THREE.Mesh | null;
    public position: THREE.Vector3;
    public baseObject: InteractiveObjectType;
    private rotation: THREE.Euler;
    private scale: THREE.Vector3;
    private is_active: boolean;
    private is_shown: boolean;
    private scene: BaseScene;
    private lerpFromTo: LerpFromTo | null;
    private icon: InteractionIcon;
    private is_object_hidden: boolean;
    private disposed = false;

    constructor(object: InteractiveObjectType, scene: BaseScene) {
        this.is_object_hidden = object.isVisible;
        this.baseObject = object;
        this.instance = new THREE.Mesh();
        this.activeInstance = null;
        this.position = object.position;
        this.rotation = object.rotation;
        this.scale = object.scale;
        this.is_active = false;
        this.is_shown = false;
        this.scene = scene;
        this.lerpFromTo = null;

        this.icon = new InteractionIcon(this.position, scene);
        this.scene.instance.add(this.icon.instance);

        this.loadObject(this.baseObject.gltf_src);

        eventEmitterInstance.on(`userInterractButtonPressed`, this.onInteract);
    }

    private onInteract = () => {
        if (!this.is_active || gameState.currentScene !== this.scene.scene_id) return;
        if (this.is_shown) {
            this.hideObject();
        } else {
            this.showObject();
            this.icon.instance.visible = false;
        }
    };

    private async loadObject(gltf_src: string) {
        try {
            const { scene } = await loadModel(gltf_src, this.scene);
            if (this.disposed) return;
            const mesh = scene.children[0] as THREE.Mesh;

            this.instance = mesh;
            if (this.is_object_hidden) {
                this.instance.position.copy(this.position);
                this.instance.rotation.copy(this.rotation);
                this.instance.scale.copy(this.scale);
                this.scene.instance.add(this.instance);
            }
            this.activeInstance = mesh.clone();
            this.activeInstance.position.set(0, 0, 0);
            this.scene.instance.add(this.activeInstance);
            this.lerpFromTo = new LerpFromTo(this.activeInstance, this.position);
            this.activeInstance.visible = false;
        } catch (error) {
            console.error("Failed to load model:", error);
        }
    }

    public onCharacterMove(pos: THREE.Vector3) {
        const distance = checkDistance(pos, this.position);
        if (distance < 1 !== this.is_active)
            eventEmitterInstance.trigger(`showInteractiveObjectControls`, [distance < 1]);
        if (this.is_shown && this.lerpFromTo && this.scene.camera) {
            this.lerpFromTo.setTarget(
                this.scene.camera.instance.position.clone().add(this.baseObject.activePosition),
            );
        }
        this.is_active = distance < 1;
    }

    private hideObject() {
        if (!this.activeInstance) return;
        this.is_shown = false;

        if (!this.scene.camera) return;
        const cameraPosition = this.scene.camera.instance.position;
        const starting_position = cameraPosition.clone().add(this.baseObject.activePosition);
        const targetPosition = cameraPosition.clone().add(this.baseObject.hiddenPosition);

        if (this.lerpFromTo) {
            this.lerpFromTo.setCurrentPosition(starting_position);
            this.lerpFromTo.setTarget(targetPosition);
            this.lerpFromTo.setAction(() => {
                if (this.activeInstance) this.activeInstance.visible = false;
                this.is_active = false;
            });
        }
        eventEmitterInstance.trigger(`toggleInteractiveObjectPanel`, [undefined]);
        if (this.baseObject.onInteractionEnd) {
            this.baseObject.onInteractionEnd();
        } else {
            eventEmitterInstance.trigger(`toggleFreeze`, [false]);
        }
    }

    private showObject() {
        if (!this.activeInstance || !this.scene.camera) return;
        this.is_active = true;
        this.is_shown = true;

        const cameraPosition = this.scene.camera.instance.position;
        const starting_position = cameraPosition.clone().add(this.baseObject.hiddenPosition);
        const targetPosition = cameraPosition.clone().add(this.baseObject.activePosition);

        this.activeInstance.rotation.copy(this.baseObject.activeRotation);
        if (this.baseObject.activeScale) {
            this.activeInstance.scale.copy(this.baseObject.activeScale);
        } else {
            this.activeInstance.scale.set(0.5, 0.5, 0.5);
        }
        this.activeInstance.position.copy(starting_position);
        this.activeInstance.visible = true;

        if (this.lerpFromTo) {
            this.lerpFromTo.setCurrentPosition(starting_position);
            this.lerpFromTo.setTarget(targetPosition);
        }
        eventEmitterInstance.trigger(`toggleFreeze`, [true]);
        eventEmitterInstance.trigger(`toggleInteractiveObjectPanel`, [this.baseObject]);
    }

    public update(time: number, dt: number) {
        this.icon.update(time, dt);
        this.lerpFromTo?.update(dt);
        if (this.is_shown && this.activeInstance) {
            let rotationSpeed = 0.01;

            if (Controls.scroll !== 0) {
                rotationSpeed += Controls.scroll * 0.005;
                Controls.scroll *= Math.pow(0.9, dt);
            }

            this.activeInstance.rotation.y += rotationSpeed * dt;
        }
    }

    public dispose() {
        this.disposed = true;
        eventEmitterInstance.off(`userInterractButtonPressed`, this.onInteract);
        this.icon.dispose();
    }
}

class LerpFromTo {
    private object: THREE.Mesh;
    private currentPosition = new THREE.Vector3();
    private targetPosition = new THREE.Vector3();
    private isMoving = false;
    private action: null | (() => void) = null;

    constructor(object: THREE.Mesh, startPosition: THREE.Vector3) {
        this.object = object;
        this.currentPosition.copy(startPosition);
        this.targetPosition.copy(startPosition);
    }

    public setTarget(targetPosition: THREE.Vector3) {
        this.targetPosition.copy(targetPosition);
        this.isMoving = true;
    }

    public setAction(action: () => void) {
        this.action = action;
    }

    public setCurrentPosition(position: THREE.Vector3) {
        this.currentPosition.copy(position);
    }

    public update(dt: number) {
        if (!this.isMoving) return;
        this.currentPosition.lerp(this.targetPosition, damp(0.09, dt));

        if (this.currentPosition.distanceTo(this.targetPosition) < 0.1) {
            this.isMoving = false;
            if (this.action) {
                this.action();
                this.action = null;
            }
            return;
        }

        this.object.position.copy(this.currentPosition);
    }
}
