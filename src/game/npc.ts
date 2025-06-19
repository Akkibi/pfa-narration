import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
import { charactersData } from "../data/characters_data";
import { eventEmitterInstance } from "../utils/eventEmitter";
import { lerpVector3 } from "../utils/lerp";
import { dialogData } from "../data/dialogData";
import { InteractionIcon } from "./inrecationIcon";
import BaseScene from "./scenes/BaseScene";
import { NpcMaterial } from "./npcMaterial";

class Npc {
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

    constructor(name: string, scene: BaseScene) {
        this.isDialogOpened = false;
        this.interactionDistance = 1;
        this.name = name;
        this.scene = scene;
        this.isActive = false;
        this.instance = new THREE.Group();

        this.position = charactersData[this.name].position;
        this.characterPositionTransition = new THREE.Vector3().copy(
            this.position.clone().add(charactersData[this.name].targetPosition),
        );
        this.characterPositionTarget = new THREE.Vector3().copy(this.characterPositionTransition);
        this.characterPosition = this.position.clone().add(new THREE.Vector3(1, 0, 1));

        this.instance.position.copy(this.position);
        this.instance.lookAt(this.characterPositionTransition);

        // create icon
        this.icon = new InteractionIcon(this.position, this.scene.scene_id);
        if (this.icon.instance) this.scene.instance.add(this.icon.instance);

        this.gltfLoader();
        this.instance.scale.setScalar(0.15);

        eventEmitterInstance.on(`updateScene-${this.scene.scene_id}`, this.update.bind(this));
        eventEmitterInstance.on(
            `characterPositionChanged-${this.scene.scene_id}`,
            this.isCharacterInInteractiveArea.bind(this),
        );
        eventEmitterInstance.on("userInterractButtonPressed", this.interract.bind(this));
        eventEmitterInstance.on("closeDialog", this.closeInteraction.bind(this));
    }

    private gltfLoader() {
        return new Promise((resolve, reject) => {
            const loader = new GLTFLoader();
            loader.load(
                // `./characters/${this.name}.glb`,
                "./characters/npccharacter.glb",
                (gltf: { scene: THREE.Group }) => {
                    const gltfGroup = gltf.scene as THREE.Group;
                    const camera = this.scene.camera?.camera;
                    gltfGroup.traverse((child) => {
                        if (child.name.startsWith("shader") && camera) {
                            const npcMaterial = new NpcMaterial(this.scene.scene_id);
                            (child as THREE.Mesh).material = npcMaterial.getMaterial();
                        }
                    });

                    this.instance.add(gltfGroup);
                    resolve(gltfGroup);
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
        const characterPosition = new THREE.Vector3().copy(pos.clone());
        this.characterPosition.x = characterPosition.x;
        this.characterPosition.z = characterPosition.z;
        const distance = pos.distanceTo(this.position);
        if (distance < this.interactionDistance !== this.isActive) {
            eventEmitterInstance.trigger(`showInteractiveObjectControls`, [
                distance < this.interactionDistance,
            ]);
            eventEmitterInstance.trigger(`zoom-${this.scene.scene_id}`, [
                distance < this.interactionDistance,
                2,
            ]);
        }
        this.isActive = distance < this.interactionDistance;
    }

    private update = () => {
        if (this.isActive) {
            if (this.characterPositionTransition.distanceTo(this.characterPosition) > 0.05) {
                this.characterPositionTransition = lerpVector3(
                    this.characterPositionTransition,
                    this.characterPosition,
                    0.03,
                );
                this.instance.lookAt(this.characterPositionTransition);
            }
        } else {
            if (this.characterPositionTransition.distanceTo(this.characterPositionTarget) > 0.05) {
                this.characterPositionTransition = lerpVector3(
                    this.characterPositionTransition,
                    this.characterPositionTarget,
                    0.03,
                );
                this.instance.lookAt(this.characterPositionTransition);
            }
        }
    };

    private closeInteraction = () => {
        this.isDialogOpened = false;
        eventEmitterInstance.trigger(`toggleFreeze`, [false]);
    };

    private interract = () => {
        if (this.isActive) {
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
        }
    };
}

export default Npc;
