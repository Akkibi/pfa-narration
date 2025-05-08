import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
import { charactersData } from "../data/characters_data";
import { eventEmitterInstance } from "../utils/eventEmitter";
import { lerpVector3 } from "../utils/lerp";
import { dialogData } from "../data/dialogData";

class Npc {
    private name: string;
    private sceneId: number;
    public instance: THREE.Group;
    private position: THREE.Vector3;
    private isActive: boolean;
    private characterPosition: THREE.Vector3;
    private characterPositionTransition: THREE.Vector3;
    private characterPositionTarget: THREE.Vector3;
    private interactionDistance: number;
    private isDialogOpened: boolean;
    constructor(name: string, sceneId: number) {
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
        this.characterPosition = new THREE.Vector3(0, 0, 0);

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
                `./characters/${this.name}.glb`,
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

    private loadGLTFModel(src: string): Promise<THREE.Group> {
        return new Promise((resolve, reject) => {
            const loader = new GLTFLoader();

            loader.load(
                `./${src}`,
                (gltf: { scene: THREE.Group }) => {
                    const GLTFGroup = gltf.scene as THREE.Group;
                    // GLTFMesh.material = this.material;

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
        this.characterPosition.copy(pos);
        const distance = pos.distanceTo(this.position);
        if (this.isActive !== distance < this.interactionDistance) {
            eventEmitterInstance.trigger(`showInteractiveObjectControls`, [
                distance < this.interactionDistance,
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
                    0.05,
                );
                this.instance.lookAt(this.characterPositionTransition);
            }
        } else {
            if (this.characterPositionTransition.distanceTo(this.characterPositionTarget) > 0.05) {
                this.characterPositionTransition = lerpVector3(
                    this.characterPositionTransition,
                    this.characterPositionTarget,
                    0.05,
                );
                this.instance.lookAt(this.characterPositionTransition);
            }
        }
    };

    private closeInteraction = () => {
        this.isDialogOpened = false;
    };

    private interract = () => {
        if (this.isActive) {
            if (this.isDialogOpened) {
                this.isDialogOpened = false;
                eventEmitterInstance.trigger("closeDialog", []);
            } else {
                this.isDialogOpened = true;
                eventEmitterInstance.trigger(`openDialog`, [dialogData[this.name]]);
            }
        }
    };
}

export default Npc;
