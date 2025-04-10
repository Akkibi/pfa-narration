import { eventEmitterInstance } from "../utils/eventEmitter";
import { lerp } from "../utils/lerp";
import Controls from "./Controls";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/Addons.js";

const CharacterVars = {
    height: 1,
    width: 0.5,
    depth: 0.5,
    moveSpeed: 0.005,
    turnSpeed: 0.2,
    friction: 0.92,
    jumpSpeed: 0.25
};

export class Character {
    private lerpAmount: number;
    public id: number;
    private instance: THREE.Group;
    public floorPosition: number = 2;
    private speed: THREE.Vector2;
    public position: THREE.Vector2;
    public currentPosition: THREE.Vector3;
    private rotation: THREE.Vector2;
    private targetRotation: number;
    public height: number;
    private heightSpeed: number;
    private gravity = 0.02;
    public vars = CharacterVars;
    private raycaster: THREE.Raycaster;
    private floor: THREE.Mesh | null = null;
    private isOnGround: boolean = true;
    private axesHelper: THREE.AxesHelper | null = null;
    private maxGapSize: number

    constructor(id: number) {
        this.id = id;
        this.speed = new THREE.Vector2(0.1, 0.1);
        this.height = 2;
        this.heightSpeed = 0.1;
        this.lerpAmount = 0.4;
        this.raycaster = new THREE.Raycaster();
        this.position = new THREE.Vector2(0, 1);
        this.currentPosition = new THREE.Vector3(this.position.x, this.height, this.position.y);
        this.rotation = new THREE.Vector2(0, 0);
        this.targetRotation = 0;
        this.maxGapSize = 0.5;
        this.instance = new THREE.Group;
        this.loadGLTFModel();
        Controls.init();
        eventEmitterInstance.on(`updateScene-${this.id}`, this.update.bind(this));
    }

    private updateCharacterModelSmooth() {
        this.currentPosition.set(lerp(this.currentPosition.x, this.position.x, this.lerpAmount), lerp(this.currentPosition.y, this.height, this.lerpAmount), lerp(this.currentPosition.z, this.position.y, this.lerpAmount));
        this.instance.position.copy(this.currentPosition);
    }

    public addFloor(floor: THREE.Mesh) {
        this.floor = floor;
    }
    public addAxesHelper(axesHelper: THREE.AxesHelper) {
        this.axesHelper = axesHelper;
    }

    private loadGLTFModel(): void {
        const loader = new GLTFLoader();
        loader.load(
            "./character.glb",
            (gltf: { scene: THREE.Group }) => {
                const GLTFGroup = gltf.scene; // Store the loaded model
                GLTFGroup.position.z = -0.7;
                this.instance.add(GLTFGroup); // Add the model to the scene
                if (this.instance) {
                    this.instance.scale.set(0.2, 0.2, 0.2);
                }
            },
            undefined,
            (error) => {
                console.error("An error occurred while loading the GLTF model:", error);
            },
        );
    }

    private update() {
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
        }

        if (this.speed.length() > 0) {
            // Calculate the target rotation based on movement direction
            this.targetRotation = Math.atan2(this.speed.x, this.speed.y);

            // Apply movement in the direction we're facing
            const speed = this.speed.length();
            this.speed.x = Math.sin(this.targetRotation) * speed;
            this.speed.y = Math.cos(this.targetRotation) * speed;
        }

        // Update the position based on the current speed
        this.updateSpeed();
        this.updatePosition();
        this.updateCharacterModelSmooth();
        // this.instance.position.set(this.position.x, this.height, this.position.y);
        // if (this.axesHelper) this.axesHelper.position.set(this.position.x + this.speed.x, this.height, this.position.y + this.speed.y);

    }
    private updateSpeed() {
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

        // console.log('updateRotation', angleDiff)

        // Gradually rotate toward the target
        return new THREE.Euler(
            0,
            currentYRotation + angleDiff * this.vars.turnSpeed,
            0
        );
    }

    private updatePosition() {
        if (this.speed.x > 0.0001 || this.speed.x < -0.0001 || this.speed.y > 0.0001 || this.speed.y < -0.0001 || Math.abs(this.heightSpeed) > 0.0001) {
            const newPos: THREE.Vector2 = new THREE.Vector2().copy(this.checkPosRecursive(this.position, this.speed, 0));
            this.setPosition(newPos, this.updateRotation())
        }
    }

    private checkPosRecursive(position: THREE.Vector2, speed: THREE.Vector2, angle: number): THREE.Vector2 {
        const currentAngle = Math.atan2(speed.y, speed.x) + angle;
        const currentSpeed = Math.sqrt(speed.x * speed.x + speed.y * speed.y);
        const newSpeed: THREE.Vector2 = new THREE.Vector2(Math.cos(currentAngle) * currentSpeed, Math.sin(currentAngle) * currentSpeed);
        const newPos: THREE.Vector2 = new THREE.Vector2(position.x + newSpeed.x, position.y + newSpeed.y);
        const height: number | null = this.raycastFrom(newPos);
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

    private raycastFrom(position: THREE.Vector2): number | null {
        if (this.floor === null) { return null };
        let posY = null;
        const newPos = new THREE.Vector3(position.x, 100, position.y);
        this.raycaster.set(newPos, new THREE.Vector3(0, -1, 0));
        const intersects = this.raycaster.intersectObject(this.floor);
        if (intersects.length > 0) {
            intersects.forEach((intersect) => {
                if (intersect.object.name === "floor") {
                    posY = intersect.point.y;
                }
            });
        }
        return posY;
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
