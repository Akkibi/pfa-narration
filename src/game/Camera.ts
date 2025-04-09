import * as THREE from "three";
import { Character } from "./Character";
import { eventEmitterInstance } from "../utils/eventEmitter";

export class Camera {
    public instance: THREE.PerspectiveCamera;
    public character: Character;

    constructor(character: Character) {
        this.instance = new THREE.PerspectiveCamera(
            50,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.instance.position.x = 0;
        this.instance.position.y = 5;
        this.instance.position.z = -5;
        this.character = character;

        eventEmitterInstance.on(`characterPositionChanged-${this.character.id}`, this.moveCamera.bind(this));
    }

    moveCamera(character_pos: THREE.Vector3) {
        console.log('Move Camera')
        const newPosition = new THREE.Vector3(character_pos.x, character_pos.y + 5, character_pos.z - 5);
        this.instance.position.copy(newPosition);
    };

    public handleResize = () => {
        this.instance.aspect = window.innerWidth / window.innerHeight;
        this.instance.updateProjectionMatrix();
    };
}