import * as THREE from "three";
import { Character } from "./Character";
import { eventEmitterInstance } from "../utils/eventEmitter";
import { lerp } from "../utils/lerp";
export class Camera {
    public instance: THREE.Group;
    public camera: THREE.PerspectiveCamera;
    private character: Character;
    public currentPosition: THREE.Vector3;
    private lerpAmount: number;
    constructor(character: Character) {

        this.instance = new THREE.Group();
        this.camera = new THREE.PerspectiveCamera(
            50,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.currentPosition = new THREE.Vector3(0, 0, 0);
        this.camera.position.set(0, 2, -5);
        this.camera.lookAt(0, 1, 0);
        this.instance.add(this.camera);
        this.lerpAmount = 0.05;
        this.character = character;
        eventEmitterInstance.on(`characterPositionChanged-${this.character.id}`, this.moveCamera.bind(this));
    }

    moveCamera() {
        this.currentPosition.set(lerp(this.currentPosition.x, this.character.position.x, this.lerpAmount), lerp(this.currentPosition.y, lerp(this.character.floorPosition, this.character.height, 0.5), this.lerpAmount), lerp(this.currentPosition.z, this.character.position.y, this.lerpAmount));
        this.instance.position.copy(this.currentPosition);
    };

    public handleResize = () => {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
    };
}
