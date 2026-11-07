import { damp, lerp } from "../utils/lerp";
import Controls from "./Controls";
import * as THREE from "three";
import { Floor } from "./floor";
import { loadModel } from "./assets";
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

type MoveCallback = (position: THREE.Vector3, lastPosition: THREE.Vector3) => void;
type ParticleCallback = (position: THREE.Vector3, velocity: THREE.Vector3) => void;

const tmpSpeed = new THREE.Vector2();
const tmpStep = new THREE.Vector2();
const tmpPosition = new THREE.Vector2();
const tmpParticlePosition = new THREE.Vector3();
const tmpParticleVelocity = new THREE.Vector3();
const tmpEuler = new THREE.Euler();

export class Character {
    private lerpAmount: number;
    public instance: THREE.Group;
    public floorPosition: number;
    public speed: THREE.Vector2;
    private lastSpeed: THREE.Vector2;
    public position: THREE.Vector2;
    public currentPosition: THREE.Vector3;
    public lastPosition: THREE.Vector3;
    private newPosition: THREE.Vector3;
    private rotation: THREE.Vector2;
    private targetRotation: number;
    public height: number;
    public heightSpeed: number;
    private gravity = 0.02;
    public vars = CharacterVars;
    private floor: Floor;
    private isOnGround: boolean = true;
    private maxGapSize: number;
    private bones: THREE.Object3D[] = [];
    private disposed = false;
    public onMove: MoveCallback | null = null;
    public onParticle: ParticleCallback | null = null;

    constructor(floor: Floor, owner: object) {
        this.floor = floor;
        this.speed = new THREE.Vector2(0, -0.01);
        this.height = 0;
        this.heightSpeed = 0;
        this.lerpAmount = 0.4;
        this.position = new THREE.Vector2(0, 1);

        const floorPos = floor.raycastFrom(this.position);
        this.floorPosition = floorPos === null ? 0 : floorPos;

        this.currentPosition = new THREE.Vector3(this.position.x, this.height, this.position.y);
        this.lastPosition = new THREE.Vector3(this.position.x, this.height, this.position.y);
        this.newPosition = new THREE.Vector3();
        this.rotation = new THREE.Vector2(0, 0);
        this.targetRotation = 0;
        this.maxGapSize = 0.1;
        this.instance = new THREE.Group();
        this.lastSpeed = new THREE.Vector2(this.speed.x, this.speed.y);

        this.loadObject("character.glb", owner);
        this.instance.scale.set(0.2, 0.2, 0.2);
        this.instance.position.copy(this.currentPosition);
    }

    private updateCharacterModelSmooth(dt: number) {
        const amount = damp(this.lerpAmount, dt);
        this.currentPosition.set(
            lerp(this.currentPosition.x, this.position.x, amount),
            lerp(this.currentPosition.y, this.height, amount),
            lerp(this.currentPosition.z, this.position.y, amount),
        );
        this.instance.position.copy(this.currentPosition);
    }

    private async loadObject(src: string, owner: object) {
        try {
            const { scene } = await loadModel(src, owner);
            if (this.disposed) return;
            this.instance.add(scene);
            this.storeBones();
        } catch (error) {
            console.error("Failed to load model:", error);
        }
    }

    private storeBones() {
        const bones: THREE.Object3D[] = [];
        for (let i = 0; i <= 4; i++) {
            const bone = this.instance.getObjectByName(`head-${i}`);
            if (bone) bones.push(bone);
        }
        this.bones = bones;
    }

    private moveCape(dt: number) {
        // Speed change per 60fps frame decides which way the cape bones swing
        const speedDif = tmpSpeed.subVectors(this.lastSpeed, this.speed).multiplyScalar(17 / dt);
        const amount = damp(0.1, dt);
        const sin = Math.sin(this.rotation.y);
        const cos = Math.cos(this.rotation.y);
        this.bones.forEach((bone, i) => {
            const newBoneAngle =
                (speedDif.x - this.speed.x / 2) * i * sin +
                (speedDif.y - this.speed.y / 2) * i * cos;
            bone.rotation.z = lerp(bone.rotation.z, newBoneAngle, amount);
        });
    }

    public update(dt: number) {
        if (gameState.freezed === false) {
            let moveSpeedFactor = this.vars.moveSpeed * dt;
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
        if (this.speed.lengthSq() > 0) {
            // Face the movement direction
            this.targetRotation = Math.atan2(this.speed.x, this.speed.y);
            this.moveCape(dt);
        }

        this.updateSpeed(dt);
        this.updatePosition(dt);
        this.updateCharacterModelSmooth(dt);
    }

    private updateSpeed(dt: number) {
        // Save speed before applying friction
        this.lastSpeed.copy(this.speed);
        this.heightSpeed -= this.gravity * dt;
        this.height += this.heightSpeed * dt;
        this.height = Math.max(this.height, this.floorPosition);
        if (this.floorPosition === this.height) {
            this.heightSpeed = 0;
            this.isOnGround = true;
        } else {
            this.isOnGround = false;
        }
        this.speed.multiplyScalar(Math.pow(this.vars.friction, dt));
    }

    private updateRotation(dt: number) {
        const currentYRotation = this.rotation.y;

        // Shortest path to the target angle, normalized to [-PI, PI]
        let angleDiff = this.targetRotation - currentYRotation;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

        return tmpEuler.set(0, currentYRotation + angleDiff * damp(this.vars.turnSpeed, dt), 0);
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

    private updatePosition(dt: number) {
        if (this.checkMinSpeed(0.0001)) {
            const step = tmpStep.copy(this.speed).multiplyScalar(dt);
            tmpPosition.copy(this.checkPosRecursive(this.position, step, 0));
            this.setPosition(tmpPosition, this.updateRotation(dt));
            this.updatePositionParticles(dt);
        }
    }

    private jumpParticles() {
        if (!this.onParticle) return;
        for (let i = 0; i <= 15; i++) {
            tmpParticleVelocity.set(
                (Math.random() - 0.5) * 0.1,
                Math.random() * 0.025,
                (Math.random() - 0.5) * 0.1,
            );
            tmpParticlePosition.set(this.position.x, this.height + 0.01, this.position.y);
            this.onParticle(tmpParticlePosition, tmpParticleVelocity);
        }
    }

    private updatePositionParticles(dt: number) {
        if (!this.onParticle) return;
        const currentSpeed = this.speed.length() * 0.3;
        if (this.isOnGround && Math.random() * 0.1 < currentSpeed * dt) {
            tmpParticlePosition.set(
                this.position.x - this.speed.x * 5,
                this.height + 0.01,
                this.position.y - this.speed.y * 5,
            );
            tmpParticleVelocity.set(
                this.speed.x * -0.2 + (Math.random() - 0.5) * 0.1,
                currentSpeed + 0.01,
                this.speed.y * -0.2 + (Math.random() - 0.5) * 0.1,
            );
            this.onParticle(tmpParticlePosition, tmpParticleVelocity);
        }
    }

    private checkPosRecursive(
        position: THREE.Vector2,
        speed: THREE.Vector2,
        angle: number,
    ): THREE.Vector2 {
        const currentAngle = Math.atan2(speed.y, speed.x) + angle;
        const currentSpeed = Math.sqrt(speed.x * speed.x + speed.y * speed.y);
        const newPos: THREE.Vector2 = new THREE.Vector2(
            position.x + Math.cos(currentAngle) * currentSpeed,
            position.y + Math.sin(currentAngle) * currentSpeed,
        );
        const height: number | null = this.floor.raycastFrom(newPos);
        if (height === null || this.checkBadDistance(height, this.height)) {
            const newAngle = angle > 0 ? (angle + 0.15) * -1 : (angle - 0.15) * -1;
            if (newAngle > Math.PI / 2) {
                return position;
            }
            return this.checkPosRecursive(
                position,
                new THREE.Vector2(speed.x * this.vars.friction, speed.y * this.vars.friction),
                newAngle,
            );
        }
        this.floorPosition = height;
        return newPos;
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

        this.newPosition.set(position.x, this.height, position.y);
        this.instance.position.copy(this.newPosition);

        if (rotation) {
            this.rotation.set(rotation.x, rotation.y);
            this.instance.rotation.copy(rotation);
        }
        this.onMove?.(this.newPosition, this.lastPosition);
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

    public dispose() {
        this.disposed = true;
        this.onMove = null;
        this.onParticle = null;
        this.bones = [];
    }
}
