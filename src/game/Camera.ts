import * as THREE from "three";
import { Character } from "./Character";
import { eventEmitterInstance } from "../utils/eventEmitter";
import { lerp } from "../utils/lerp";
export class Camera {
    public instance: THREE.PerspectiveCamera;
    public character: Character;
    public currentPosition: THREE.Vector3;
    private lerpAmount: number;
    constructor(character: Character) {
        this.instance = new THREE.PerspectiveCamera(
            50,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        )
        this.lerpAmount = 0.05;
        this.character = character;
        this.instance.position.set(0, 4, -8);
        this.currentPosition = new THREE.Vector3(0, 0, 0);
        eventEmitterInstance.on(`characterPositionChanged-${this.character.id}`, this.moveCamera.bind(this));
    }

    moveCamera() {
        this.currentPosition.set(lerp(this.currentPosition.x, this.character.position.x, this.lerpAmount), lerp(this.currentPosition.y, lerp(this.character.floorPosition, this.character.height, 0.5) + 2, this.lerpAmount), lerp(this.currentPosition.z, this.character.position.y - 5, this.lerpAmount));
        this.instance.position.copy(this.currentPosition);
    };

    public handleResize = () => {
        this.instance.aspect = window.innerWidth / window.innerHeight;
        this.instance.updateProjectionMatrix();
    };
}
