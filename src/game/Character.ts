import { eventEmitterInstance } from "../utils/eventEmitter";
import Controls from "./Controls";
import * as THREE from "three";

const CharacterVars = {
    height: 1.8,
    width: 0.5,
    depth: 0.5,
}

export class Character {
    public instance: THREE.Mesh;
    private position: THREE.Vector3;
    private direction: THREE.Vector3;
    private speed: THREE.Vector3;
    public vars = CharacterVars;

    constructor() {
        this.instance = new THREE.Mesh(
            new THREE.BoxGeometry(this.vars.width, this.vars.height, this.vars.depth),
            new THREE.MeshStandardMaterial({ color: 0xff0000 })
        );
        this.position = new THREE.Vector3(0, 0, 0);
        this.direction = new THREE.Vector3(0, 0, 0);
        this.speed = new THREE.Vector3(0, 0, 1);
        Controls.init();
        eventEmitterInstance.on("tick", this.update.bind(this));
    }

    update(deltaTime: number, tick: number) {
        // Handle movement based on controls
        if (Controls.keys.forward) {
            this.speed.z += 0.01 * deltaTime;
        }
        if (Controls.keys.back) {
            this.speed.z -= 0.01 * deltaTime;
        }
        if (Controls.keys.left) {
            this.speed.x += 0.01 * deltaTime;
        }
        if (Controls.keys.right) {
            this.speed.x -= 0.01 * deltaTime;
        }

        // Update the position based on the current speed
        this.updatePosition(deltaTime);

        // Log the current position for debugging
        console.log('this.position', this.position);
    }

    private updatePosition(deltaTime: number) {
        console.log(deltaTime)
        // Apply speed decay (e.g., friction or drag)
        const decayFactor = Math.pow(0.9, deltaTime / 8); // Adjust this value to control how quickly the speed decays
        this.speed.multiplyScalar(decayFactor);

        // Update the position based on the speed and deltaTime
        this.position.x += this.speed.x;
        this.position.y += this.speed.y;
        this.position.z += this.speed.z;

        // Update the instance's position to match the calculated position
        this.instance.position.copy(this.position);
    }
}
