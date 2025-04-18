import { eventEmitterInstance } from "../utils/eventEmitter";
import { lerp } from "../utils/lerp";
import Controls from "./Controls";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
import { Floor } from "./floor";

const CharacterVars = {
    height: 1,
    width: 0.5,
    depth: 0.5,
    moveSpeed: 0.005,
    turnSpeed: 0.2,
    friction: 0.92,
    jumpSpeed: 0.25,
};

export class Character {
    private lerpAmount: number;
    private instance: THREE.Group;
    public id: number;
    public loaded: boolean;
    public floorPosition: number = 2;
    public speed: THREE.Vector2;
    private lastSpeed: THREE.Vector2;

    public position: THREE.Vector2;
    public currentPosition: THREE.Vector3;
    private rotation: THREE.Vector2;
    private targetRotation: number;
    public height: number;
    public heightSpeed: number;
    private gravity = 0.02;
    public vars = CharacterVars;
    private floor: Floor;
    private isOnGround: boolean = true;
    private axesHelper: THREE.AxesHelper | null = null;
    private maxGapSize: number;
    private isObjectActive: boolean;
    private bones: THREE.Object3D<THREE.Object3DEventMap>[] = [];

    constructor(id: number, floor: Floor) {
        this.floor = floor
        this.id = id;
        this.loaded = false;
        this.speed = new THREE.Vector2(0.1, 0.1);
        this.height = 2;
        this.heightSpeed = 0.1;
        this.lerpAmount = 0.4;
        this.position = new THREE.Vector2(0, 1);
        this.currentPosition = new THREE.Vector3(this.position.x, this.height, this.position.y);
        this.rotation = new THREE.Vector2(0, 0);
        this.targetRotation = 0;
        this.maxGapSize = 0.25;
        this.instance = new THREE.Group;
        this.lastSpeed = new THREE.Vector2(this.speed.x, this.speed.y);
        this.isObjectActive = false;

        this.loadObject('./character.glb');

        this.instance.position.z = -0.2;
        this.instance.scale.set(0.2, 0.2, 0.2);
        console.log("this.instance", this.instance)
        console.log("this.bones", this.bones)
        Controls.init();
        eventEmitterInstance.on(`updateScene-${this.id}`, this.update.bind(this));
        eventEmitterInstance.on(`toggleInteractiveObject`, (status: boolean) => this.isObjectActive = status)
    }

    private updateCharacterModelSmooth() {
        this.currentPosition.set(lerp(this.currentPosition.x, this.position.x, this.lerpAmount), lerp(this.currentPosition.y, this.height, this.lerpAmount), lerp(this.currentPosition.z, this.position.y, this.lerpAmount));
        this.instance.position.copy(this.currentPosition);
    }

    public addAxesHelper(axesHelper: THREE.AxesHelper) {
        this.axesHelper = axesHelper;
    }

    private async loadObject(gltf_src: string) {
        try {
            const group = await this.loadGLTFModel(gltf_src);

            this.instance.add(group)

            this.loaded = true;

            this.storeBones()
        } catch (error) {
            console.error("Failed to load model:", error);
        }
    }

    private loadGLTFModel(src: string): Promise<THREE.Group> {
        return new Promise((resolve, reject) => {
            const loader = new GLTFLoader();

            loader.load(
                `./${src}`,
                (gltf: { scene: THREE.Group }) => {
                    const GLTFGroup = gltf.scene as THREE.Group;
                    // GLTFMesh.material = this.material;

                    resolve(GLTFGroup)
                },
                undefined,
                (error) => {
                    console.error("An error occurred while loading the GLTF model:", error);
                    reject(error)
                },
            );
        })
    }

    private storeBones() {
        const bones: THREE.Object3D<THREE.Object3DEventMap>[] = [];

        for (let i = 0; i <= 4; i++) {
            const bone = this.instance.getObjectByName(`head-${i}_1`);
            if (bone) bones.push(bone);
        }
        this.bones = bones;
    }

    private moveCape() {

        this.bones.map((b, i) => {

            // Difference between last speed and new speed to decide the direction to rotate the bones
            const speedDif = new THREE.Vector2().subVectors(this.lastSpeed, this.speed);

            // Multiply to increase effect amplitude
            speedDif.multiplyScalar(17)

            // Add speed to increase the angle when advanci
            const newBoneAngle = (speedDif.x - (this.speed.x / 2)) * i * Math.sin(this.rotation.y) + (speedDif.y - (this.speed.y / 2)) * i * Math.cos(this.rotation.y);

            // TO DO: Try to implement the Damped Spring Oscillations: https://phrogz.net/damped-spring-oscillations-in-javascript

            // newVelocity = oldVelocity * (1 - damping);
            // newVelocity -= (oldPosition - restValue) * springTension;
            // newPosition = oldPosition + newVelocity;

            b.rotation.z = lerp(b.rotation.z, newBoneAngle, 0.1);
        })
    }

    private update() {

        if (this.isObjectActive === true)
            return;

        let moveSpeedFactor = this.vars.moveSpeed;
        if (Controls.keys.run) {
            moveSpeedFactor *= 2
        }
        if (Controls.keys.forward) {
            this.speed.y += moveSpeedFactor;
        }
        if (Controls.keys.back) {
            this.speed.y -= moveSpeedFactor;
        }
        if (Controls.keys.left) {
            this.speed.x += moveSpeedFactor;
        }
        if (Controls.keys.right) {
            this.speed.x -= moveSpeedFactor;
        }
        if (Controls.keys.space && this.isOnGround) {
            this.heightSpeed += this.vars.jumpSpeed;
            this.jumpParticles()
        }

        if (this.speed.length() > 0) {
            // Calculate the target rotation based on movement direction
            this.targetRotation = Math.atan2(this.speed.x, this.speed.y);

            // Apply movement in the direction we're facing
            const speed = this.speed.length();
            this.speed.x = Math.sin(this.targetRotation) * speed;
            this.speed.y = Math.cos(this.targetRotation) * speed;

            this.moveCape();
        }

        // Update the position based on the current speed
        this.updateSpeed();
        this.updatePosition();
        this.updateCharacterModelSmooth();
        // this.instance.position.set(this.position.x, this.height, this.position.y);
        if (this.axesHelper) {
            this.axesHelper.position.set(this.position.x, this.height + 1.2, this.position.y)
            this.axesHelper.scale.set(this.speed.x, this.heightSpeed, this.speed.y)
        };

    }
    private updateSpeed() {
        // Save speed before applying friction
        this.lastSpeed.copy(this.speed);
        this.heightSpeed -= this.gravity;
        this.height += this.heightSpeed;
        this.height = Math.max(this.height, this.floorPosition);
        if (this.floorPosition === this.height) {
            this.heightSpeed = 0;
            this.isOnGround = true;
        } else {
            this.isOnGround = false;
        }
        this.speed.multiplyScalar(this.vars.friction);
    }

    private updateRotation() {
        const currentYRotation = this.rotation.y;

        // Find the shortest path to the target angle
        let angleDiff = this.targetRotation - currentYRotation;

        // Normalize the angle difference to be between -PI and PI
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

        // Gradually rotate toward the target
        return new THREE.Euler(
            0,
            currentYRotation + angleDiff * this.vars.turnSpeed,
            0
        );
    }

    private checkMinSpeed(min: number) {
        return this.speed.x > min || this.speed.x < -min || this.speed.y > min || this.speed.y < -min || Math.abs(this.heightSpeed) > min
    }

    private updatePosition() {
        if (this.checkMinSpeed(0.0001)) {
            const newPos: THREE.Vector2 = new THREE.Vector2().copy(this.checkPosRecursive(this.position, this.speed, 0));
            this.setPosition(newPos, this.updateRotation())
            this.updatePositionParticles()
        }
    }

    private jumpParticles() {
        for (let i = 0; i <= 20; i++) {
            const speedRandomizer = new THREE.Vector3().set((Math.random() - 0.5) * 0.1, (Math.random() - 0.5) * 0.1, (Math.random()) * 0.1)
            const particlePosition = new THREE.Vector3().set(this.position.x, this.height - 0.1, this.position.y)
            eventEmitterInstance.trigger("trigger-particle", [particlePosition, speedRandomizer, this.id])
        }
    }

    private updatePositionParticles() {
        const currentSpeed = Math.sqrt(this.speed.x * this.speed.x + this.speed.y * this.speed.y) * 0.3 + 0.01;
        if (this.isOnGround && Math.random() * 0.15 < currentSpeed) {
            const speedRandomizer = new THREE.Vector2().set((Math.random() - 0.5) * 0.1, (Math.random() - 0.5) * 0.1)
            const particlePosition = new THREE.Vector3().set(this.position.x - (this.speed.x * 5), this.height - 0.1, this.position.y - (this.speed.y * 5))
            const particleVelocity = new THREE.Vector3().set(this.speed.x * -0.2 + speedRandomizer.x, currentSpeed, this.speed.y * -0.2 + speedRandomizer.y);
            eventEmitterInstance.trigger("trigger-particle", [particlePosition, particleVelocity, this.id])
        }
    }

    private checkPosRecursive(position: THREE.Vector2, speed: THREE.Vector2, angle: number): THREE.Vector2 {
        const currentAngle = Math.atan2(speed.y, speed.x) + angle;
        const currentSpeed = Math.sqrt(speed.x * speed.x + speed.y * speed.y);
        const newSpeed: THREE.Vector2 = new THREE.Vector2(Math.cos(currentAngle) * currentSpeed, Math.sin(currentAngle) * currentSpeed);
        const newPos: THREE.Vector2 = new THREE.Vector2(position.x + newSpeed.x, position.y + newSpeed.y);
        const height: number | null = this.floor.raycastFrom(newPos);
        if (height === null || this.checkBadDistance(height, this.height)) {
            const newAngle = angle > 0 ? (angle + 0.15) * -1 : (angle - 0.15) * -1;
            if (newAngle > Math.PI / 2) {
                return position;
            }
            // console.log(angle);
            return this.checkPosRecursive(position, new THREE.Vector2(speed.x * this.vars.friction, speed.y * this.vars.friction), newAngle)
        } else if (height !== null) {
            this.floorPosition = height;
            return newPos;
        }
        return position
    }

    private checkBadDistance(newPos: number, currentPos: number) {
        return newPos - currentPos > this.maxGapSize;
    }

    public getInstance() {
        return this.instance;
    }

    public setPosition(position: THREE.Vector2, rotation?: THREE.Euler) {
        this.position.copy(position);
        this.instance.position.set(position.x, this.height, position.y);

        if (rotation) {
            this.rotation.copy(rotation);
            this.instance.rotation.copy(rotation);
        }

        eventEmitterInstance.trigger(`characterPositionChanged-${this.id}`, [new THREE.Vector3(position.x, this.height, position.y)]);
    }

    public getPosition() {
        return new THREE.Vector3(this.position.x, this.height, this.position.y);
    }
}
