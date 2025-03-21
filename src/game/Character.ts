import { GLTFLoader } from "three/examples/jsm/Addons.js";
import { eventEmitterInstance } from "../utils/eventEmitter";
import Controls from "./Controls";
import * as THREE from "three";

const CharacterVars = {
    height: 1.8,
    width: 0.5,
    depth: 0.5,
    moveSpeed: 0.05,
    turnSpeed: 0.05,  // Control how fast the character rotates
    friction: 0.9     // Friction factor to slow down movement
}

export class Character {
    private id: number;
    private instance: THREE.Group;
    private position: THREE.Vector3;
    private rotation: THREE.Euler;
    private speed: THREE.Vector3;
    private targetRotation: number;
    public vars = CharacterVars;

    constructor(id: number) {
        this.id = id;
        this.instance = new THREE.Group();
        this.rotation = new THREE.Euler(0, 0, 0);
        this.position = new THREE.Vector3(0, 0, 0);
        this.speed = new THREE.Vector3(0, 0, 0);
        this.targetRotation = 0;
        this.loadGLTFModel();
        Controls.init();
        eventEmitterInstance.on(`updateCharacterPhysics-${id}`, this.update.bind(this));
    }

    private loadGLTFModel(): void {
        const loader = new GLTFLoader();

        // Replace 'path/to/your/model.gltf' with the actual path to your GLTF file
        loader.load(
            "./character.glb",
            (gltf: { scene: THREE.Group }) => {
                const GLTFGroup = gltf.scene; // Store the loaded model
                this.instance.add(GLTFGroup); // Add the model to the scene

                // Optionally, adjust the model's position, rotation, or scale
                if (this.instance) {
                    // this.instance.position.set(0, 0, 0);
                    this.instance.scale.set(0.2, 0.2, 0.2);
                }
            },
            undefined,
            (error) => {
                console.error("An error occurred while loading the GLTF model:", error);
            },
        );
    }

    update() {
        // Create movement direction vector
        const moveDirection = new THREE.Vector3(0, 0, 0);

        // Handle movement based on controls
        if (Controls.keys.forward) {
            moveDirection.z += this.vars.moveSpeed;
        }
        if (Controls.keys.back) {
            moveDirection.z -= this.vars.moveSpeed;
        }
        if (Controls.keys.left) {
            moveDirection.x += this.vars.moveSpeed;
        }
        if (Controls.keys.right) {
            moveDirection.x -= this.vars.moveSpeed;
        }

        // Only update rotation if we're actually moving
        if (moveDirection.length() > 0) {
            // Calculate the target rotation based on movement direction
            this.targetRotation = Math.atan2(moveDirection.x, moveDirection.z);

            // Apply movement in the direction we're facing
            const speed = moveDirection.length();
            this.speed.x = Math.sin(this.targetRotation) * speed;
            this.speed.z = Math.cos(this.targetRotation) * speed;
        }

        // Update the position and rotation
        this.updatePosition();
    }

    private updatePosition() {
        // Apply friction
        this.speed.multiplyScalar(this.vars.friction);

        // Calculate new position
        const newPosition = new THREE.Vector3(
            this.position.x + this.speed.x,
            this.position.y + this.speed.y,
            this.position.z + this.speed.z
        );

        // Smoothly interpolate current rotation toward target rotation
        const currentYRotation = this.rotation.y;

        // Find the shortest path to the target angle
        let angleDiff = this.targetRotation - currentYRotation;

        // Normalize the angle difference to be between -PI and PI
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

        // Gradually rotate toward the target
        const newRotation = new THREE.Euler(
            0,
            currentYRotation + angleDiff * this.vars.turnSpeed,
            0
        );

        // Update position and rotation
        this.setPosition(newPosition, newRotation);
    }

    public getId() {
        return this.id;
    }

    public getInstance() {
        return this.instance;
    }

    public setPosition(position: THREE.Vector3, rotation?: THREE.Euler) {
        this.position.copy(position);
        this.instance.position.copy(position);

        if (rotation) {
            this.rotation.copy(rotation);
            this.instance.rotation.copy(rotation);
        }

        eventEmitterInstance.trigger(`characterPositionChanged-${this.id}`, [this.position]);
    }

    public getPosition() {
        return this.position;
    }
}