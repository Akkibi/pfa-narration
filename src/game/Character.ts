import { eventEmitterInstance } from "../utils/eventEmitter";
import { lerp } from "../utils/lerp";
import Controls from "./Controls";
import * as THREE from "three";
import { Floor } from "./floor";
import { loadGLTFModel } from "./CharacterModel";
import { Scenes } from "../components/contexts/TransitionManager";
import { gameState } from "./gameState";

const CharacterVars = {
    height: 1,
    width: 0.5,
    depth: 0.5,
    moveSpeed: 0.005,
    turnSpeed: 0.2,
    friction: 0.92,
    jumpSpeed: 0.2,
    lerpAmount: 0.4,
};

export class Character {
    private lerpAmount: number;
    public instance: THREE.Group;
    public id: Scenes;
    public floorPosition: number;
    public speed: THREE.Vector2;
    private lastSpeed: THREE.Vector2;
    public position: THREE.Vector2;
    public currentPosition: THREE.Vector3;
    public lastPosition: THREE.Vector3;
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
    private bones: THREE.Object3D<THREE.Object3DEventMap>[] = [];

    constructor(id: Scenes, floor: Floor) {
        this.floor = floor;
        this.id = id;
        this.speed = new THREE.Vector2(0, -0.01);
        this.height = 0;
        this.heightSpeed = 0;
        this.lerpAmount = 0.4;
        this.position = new THREE.Vector2(0, 1);

        const floorPos = floor.raycastFrom(this.position);
        // console.log(floorPos);
        this.floorPosition = floorPos === null ? 0 : floorPos;

        this.currentPosition = new THREE.Vector3(this.position.x, this.height, this.position.y);
        this.lastPosition = new THREE.Vector3(this.position.x, this.height, this.position.y);
        this.rotation = new THREE.Vector2(0, 0);
        this.targetRotation = 0;
        this.maxGapSize = 0.25;
        this.instance = new THREE.Group();
        this.lastSpeed = new THREE.Vector2(this.speed.x, this.speed.y);
        gameState.freezed = false;

        this.loadObject("./character.glb");
        this.instance.scale.set(0.2, 0.2, 0.2);

        this.update();

        eventEmitterInstance.on(`updateScene-${this.id}`, this.update.bind(this));
        eventEmitterInstance.on(`toggleFreeze`, (status: boolean) => (gameState.freezed = status));
    }

    private updateCharacterModelSmooth() {
        this.currentPosition.set(
            lerp(this.currentPosition.x, this.position.x, this.lerpAmount),
            lerp(this.currentPosition.y, this.height, this.lerpAmount),
            lerp(this.currentPosition.z, this.position.y, this.lerpAmount),
        );
        this.instance.position.copy(this.currentPosition);
    }
    public addAxesHelper(axesHelper: THREE.AxesHelper) {
        this.axesHelper = axesHelper;
    }

    private async loadObject(gltf_src: string) {
        try {
            const group = await loadGLTFModel(gltf_src);
            // const group = await this.loadGLTFModel(gltf_src);
            this.instance.add(group);

            this.storeBones();
        } catch (error) {
            console.error("Failed to load model:", error);
        }
    }

    private storeBones() {
        const bones: THREE.Object3D<THREE.Object3DEventMap>[] = [];
        for (let i = 0; i <= 4; i++) {
            const bone = this.instance.getObjectByName(`head-${i}`);
            if (bone) bones.push(bone);
        }
        // console.log("bones", bones);
        this.bones = bones;
    }

    private moveCape() {
        this.bones.map((b, i) => {
            // Difference between last speed and new speed to decide the direction to rotate the bones
            const speedDif = new THREE.Vector2().subVectors(this.lastSpeed, this.speed);

            // Multiply to increase effect amplitude
            speedDif.multiplyScalar(17);

            // Add speed to increase the angle when advanci
            const newBoneAngle =
                (speedDif.x - this.speed.x / 2) * i * Math.sin(this.rotation.y) +
                (speedDif.y - this.speed.y / 2) * i * Math.cos(this.rotation.y);

            // TO DO: Try to implement the Damped Spring Oscillations: https://phrogz.net/damped-spring-oscillations-in-javascript

            // newVelocity = oldVelocity * (1 - damping);
            // newVelocity -= (oldPosition - restValue) * springTension;
            // newPosition = oldPosition + newVelocity;
            // console.log(b.rotation);
            b.rotation.z = lerp(b.rotation.z, newBoneAngle, 0.1);
        });
    }

    private update() {
        if (gameState.freezed === false) {
            let moveSpeedFactor = this.vars.moveSpeed;
            if (Controls.keys.run) {
                moveSpeedFactor *= 2;
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
                this.jumpParticles();
            }
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
            this.axesHelper.position.set(this.position.x, this.height + 1.2, this.position.y);
            this.axesHelper.scale.set(this.speed.x, this.heightSpeed, this.speed.y);
        }
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
        return new THREE.Euler(0, currentYRotation + angleDiff * this.vars.turnSpeed, 0);
    }

    private checkMinSpeed(min: number) {
        return (
            this.speed.x > min ||
            this.speed.x < -min ||
            this.speed.y > min ||
            this.speed.y < -min ||
            Math.abs(this.heightSpeed) > min
        );
    }

    private updatePosition() {
        if (this.checkMinSpeed(0.0001)) {
            const newPos: THREE.Vector2 = new THREE.Vector2().copy(
                this.checkPosRecursive(this.position, this.speed, 0),
            );
            // eventEmitterInstance.trigger("playSound", [
            //     "walking",
            //     (20 / 0.11) * Math.abs(this.speed.x + this.speed.y) - 20,
            // ]);
            this.setPosition(newPos, this.updateRotation());
            this.updatePositionParticles();
        }
    }

    private jumpParticles() {
        for (let i = 0; i <= 15; i++) {
            const speedRandomizer = new THREE.Vector3().set(
                (Math.random() - 0.5) * 0.1,
                Math.random() * 0.025,
                (Math.random() - 0.5) * 0.1,
            );
            const particlePosition = new THREE.Vector3().set(
                this.position.x,
                this.height + 0.01,
                this.position.y,
            );
            eventEmitterInstance.trigger("trigger-particle", [
                particlePosition,
                speedRandomizer,
                this.id,
            ]);
        }
    }

    private updatePositionParticles() {
        const currentSpeed =
            Math.sqrt(this.speed.x * this.speed.x + this.speed.y * this.speed.y) * 0.3;
        // console.log("currentSpeed", Math.random() * 0.1 < currentSpeed);
        if (this.isOnGround && Math.random() * 0.1 < currentSpeed) {
            const speedRandomizer = new THREE.Vector2().set(
                (Math.random() - 0.5) * 0.1,
                (Math.random() - 0.5) * 0.1,
            );
            const particlePosition = new THREE.Vector3().set(
                this.position.x - this.speed.x * 5,
                this.height + 0.01,
                this.position.y - this.speed.y * 5,
            );
            const particleVelocity = new THREE.Vector3().set(
                this.speed.x * -0.2 + speedRandomizer.x,
                currentSpeed + 0.01,
                this.speed.y * -0.2 + speedRandomizer.y,
            );
            eventEmitterInstance.trigger("trigger-particle", [
                particlePosition,
                particleVelocity,
                this.id,
            ]);
        }
    }

    private checkPosRecursive(
        position: THREE.Vector2,
        speed: THREE.Vector2,
        angle: number,
    ): THREE.Vector2 {
        const currentAngle = Math.atan2(speed.y, speed.x) + angle;
        const currentSpeed = Math.sqrt(speed.x * speed.x + speed.y * speed.y);
        const newSpeed: THREE.Vector2 = new THREE.Vector2(
            Math.cos(currentAngle) * currentSpeed,
            Math.sin(currentAngle) * currentSpeed,
        );
        const newPos: THREE.Vector2 = new THREE.Vector2(
            position.x + newSpeed.x,
            position.y + newSpeed.y,
        );
        const height: number | null = this.floor.raycastFrom(newPos);
        if (height === null || this.checkBadDistance(height, this.height)) {
            const newAngle = angle > 0 ? (angle + 0.15) * -1 : (angle - 0.15) * -1;
            if (newAngle > Math.PI / 2) {
                return position;
            }
            // console.log(angle);
            return this.checkPosRecursive(
                position,
                new THREE.Vector2(speed.x * this.vars.friction, speed.y * this.vars.friction),
                newAngle,
            );
        } else if (height !== null) {
            this.floorPosition = height;
            return newPos;
        }
        return position;
    }

    private checkBadDistance(newPos: number, currentPos: number) {
        return newPos - currentPos > this.maxGapSize;
    }

    public getInstance() {
        return this.instance;
    }

    public setPosition(position: THREE.Vector2, rotation?: THREE.Euler) {
        this.lastPosition.set(this.position.x, this.height, this.position.y);
        this.position.copy(position);

        const newPos = new THREE.Vector3(position.x, this.height, position.y);
        this.instance.position.copy(newPos);

        if (rotation) {
            this.rotation.copy(rotation);
            this.instance.rotation.copy(rotation);
        }
        eventEmitterInstance.trigger(`characterPositionChanged-${this.id}`, [
            newPos.clone(),
            this.lastPosition.clone(),
        ]);
    }

    public getPosition() {
        return new THREE.Vector3(this.position.x, this.height, this.position.y);
    }
    public getSpeed() {
        return new THREE.Vector3(this.speed.x, this.heightSpeed, this.speed.y);
    }
    public setFloor(floorHeight: number | null = null) {
        if (floorHeight === null) {
            this.height = this.floorPosition;
            this.heightSpeed = 0;
        } else {
            this.height = floorHeight;
            this.heightSpeed = 0;
        }
    }
}
