import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
import { charactersData } from "../data/characters_data";
import { eventEmitterInstance } from "../utils/eventEmitter";
import { lerpVector3 } from "../utils/lerp";
import { dialogData } from "../data/dialogData";
import { Scenes } from "../components/contexts/TransitionManager";

class Npc {
    private name: string;
    private sceneId: Scenes;
    public instance: THREE.Group;
    private position: THREE.Vector3;
    private isActive: boolean;
    private characterPosition: THREE.Vector3;
    private characterPositionTransition: THREE.Vector3;
    private characterPositionTarget: THREE.Vector3;
    private interactionDistance: number;
    private isDialogOpened: boolean;
    constructor(name: string, sceneId: Scenes) {
        this.isDialogOpened = false;
        this.interactionDistance = 1;
        this.name = name;
        this.sceneId = sceneId;
        this.isActive = false;
        this.instance = new THREE.Group();

        this.position = new THREE.Vector3(0, 0, 0).copy(charactersData[this.name].position);
        this.characterPositionTransition = new THREE.Vector3().copy(
            this.position.clone().add(charactersData[this.name].targetPosition),
        );
        this.characterPositionTarget = new THREE.Vector3().copy(this.characterPositionTransition);
        this.characterPosition = this.position.clone().add(new THREE.Vector3(1, 0, 1));

        this.instance.position.copy(this.position);
        // console.log("this.characterPositionTransition",charactersData[this.name].targetPosition, this.position, new THREE.Vector3(this.position.add(charactersData[this.name].targetPosition));
        console.log("this.characterPositionTransition", this.characterPositionTransition);
        this.instance.lookAt(this.characterPositionTransition);

        this.gltfLoader();
        this.instance.scale.set(0.2, 0.2, 0.2);

        eventEmitterInstance.on(`updateScene-${this.sceneId}`, this.update.bind(this));
        eventEmitterInstance.on(
            `characterPositionChanged-${this.sceneId}`,
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
                "./characters/character.glb",
                (gltf: { scene: THREE.Group }) => {
                    const GLTFGroup = gltf.scene as THREE.Group;
                    this.instance.add(GLTFGroup);
                    resolve(GLTFGroup);
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
            eventEmitterInstance.trigger(`zoom-${this.sceneId}`, [
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
