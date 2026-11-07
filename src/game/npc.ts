import * as THREE from "three";
import { charactersData } from "../data/characters_data";
import { eventEmitterInstance } from "../utils/eventEmitter";
import { damp } from "../utils/lerp";
import { dialogData } from "../data/dialogData";
import { InteractionIcon } from "./inrecationIcon";
import type BaseScene from "./scenes/BaseScene";
import type { SceneChild } from "./scenes/BaseScene";
import { NpcMaterial } from "./npcMaterial";
import { loadModel } from "./assets";
import { gameState } from "./gameState";

class Npc implements SceneChild {
    private name: string;
    private scene: BaseScene;
    public instance: THREE.Group;
    private position: THREE.Vector3;
    private isActive: boolean;
    private characterPosition: THREE.Vector3;
    private characterPositionTransition: THREE.Vector3;
    private characterPositionTarget: THREE.Vector3;
    private interactionDistance: number;
    private isDialogOpened: boolean;
    private icon: InteractionIcon;
    private material: NpcMaterial | null = null;
    private disposed = false;

    constructor(name: string, scene: BaseScene) {
        this.isDialogOpened = false;
        this.interactionDistance = 1;
        this.name = name;
        this.scene = scene;
        this.isActive = false;
        this.instance = new THREE.Group();

        this.position = charactersData[this.name].position;
        this.characterPositionTransition = this.position
            .clone()
            .add(charactersData[this.name].targetPosition);
        this.characterPositionTarget = this.characterPositionTransition.clone();
        this.characterPosition = this.position.clone().add(new THREE.Vector3(1, 0, 1));

        this.instance.position.copy(this.position);
        this.instance.lookAt(this.characterPositionTransition);

        this.icon = new InteractionIcon(this.position, scene);
        this.scene.instance.add(this.icon.instance);

        this.loadObject();
        this.instance.scale.setScalar(0.15);

        eventEmitterInstance.on("userInterractButtonPressed", this.interract);
        eventEmitterInstance.on("closeDialog", this.closeInteraction);
    }

    private async loadObject() {
        try {
            const { scene } = await loadModel("./characters/npccharacter.glb", this.scene);
            if (this.disposed) return;
            scene.traverse((child) => {
                if (child.name.startsWith("shader")) {
                    this.material ??= new NpcMaterial();
                    (child as THREE.Mesh).material = this.material.getMaterial();
                }
            });
            this.instance.add(scene);
        } catch (error) {
            console.error("An error occurred while loading the GLTF model:", error);
        }
    }

    public onCharacterMove(pos: THREE.Vector3) {
        this.characterPosition.x = pos.x;
        this.characterPosition.z = pos.z;
        const isActive = pos.distanceTo(this.position) < this.interactionDistance;
        if (isActive !== this.isActive) {
            eventEmitterInstance.trigger(`showInteractiveObjectControls`, [isActive]);
            this.scene.setZoom(isActive, 2);
        }
        this.isActive = isActive;
    }

    public update(time: number, dt: number) {
        this.icon.update(time, dt);
        const target = this.isActive ? this.characterPosition : this.characterPositionTarget;
        if (this.characterPositionTransition.distanceTo(target) > 0.05) {
            this.characterPositionTransition.lerp(target, damp(0.03, dt));
            this.instance.lookAt(this.characterPositionTransition);
        }
    }

    private closeInteraction = () => {
        this.isDialogOpened = false;
        eventEmitterInstance.trigger(`toggleFreeze`, [false]);
    };

    private interract = () => {
        if (!this.isActive || gameState.currentScene !== this.scene.scene_id) return;
        this.icon.instance.visible = false;
        if (this.isDialogOpened) {
            this.isDialogOpened = false;
            eventEmitterInstance.trigger("closeDialog", []);
            eventEmitterInstance.trigger(`toggleFreeze`, [false]);
        } else {
            this.isDialogOpened = true;
            eventEmitterInstance.trigger(`openDialog`, [dialogData[this.name]]);
            eventEmitterInstance.trigger(`toggleFreeze`, [true]);
        }
    };

    public dispose() {
        this.disposed = true;
        eventEmitterInstance.off("userInterractButtonPressed", this.interract);
        eventEmitterInstance.off("closeDialog", this.closeInteraction);
        this.icon.dispose();
    }
}

export default Npc;
