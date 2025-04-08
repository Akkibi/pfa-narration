import { eventEmitterInstance } from "../utils/eventEmitter";
import Controls from "./Controls";
import * as THREE from "three";
import { gameState } from "./gameState";

const CharacterVars = {
    height: 1,
    width: 0.5,
    depth: 0.5,
};

export class Character {
    public instance: THREE.Mesh;
    private floorPosition: number = 2;
    private speed: THREE.Vector2;
    private position: THREE.Vector2;
    private height: number;
    private heightSpeed: number;
    private gravity = 0.02;
    public vars = CharacterVars;
    private raycaster: THREE.Raycaster;
    private floor: THREE.Mesh | null = null;
    private isOnGround: boolean = true;
    private axesHelper: THREE.AxesHelper | null = null;
    private maxGapSize: number

    constructor() {
        this.instance = new THREE.Mesh(
            new THREE.BoxGeometry(this.vars.width, this.vars.height, this.vars.depth),
            new THREE.MeshStandardMaterial({ color: 0xff0000 }),
        );
        this.speed = new THREE.Vector2(0.1, 0.1);
        this.height = 2;
        this.heightSpeed = 0.1;
        this.raycaster = new THREE.Raycaster();
        this.position = new THREE.Vector2(1, 1);
        this.maxGapSize = 0.5;
        Controls.init();
        eventEmitterInstance.on("updatePhysics", this.update.bind(this));
        // eventEmitterInstance.on("updatePhysics", () => { this.update() });
    }

    public addFloor(floor: THREE.Mesh) {
        this.floor = floor;
    }
    public addAxesHelper(axesHelper: THREE.AxesHelper) {
        this.axesHelper = axesHelper;
    }

    private update() {
        if (this.instance.userData.sceneIndex !== gameState.currentScene) return
        if (Controls.keys.forward) {
            this.speed.y += 0.01;
        }
        if (Controls.keys.back) {
            this.speed.y -= 0.01;
        }
        if (Controls.keys.left) {
            this.speed.x += 0.01;
        }
        if (Controls.keys.right) {
            this.speed.x -= 0.01;
        }
        if (Controls.keys.space && this.isOnGround) {
            this.heightSpeed += 0.30;
        }

        // Update the position based on the current speed
        this.instance.position.copy(new THREE.Vector3(this.position.x, this.height, this.position.y));
        this.updateSpeed();
        this.updatePosition();
        if (this.axesHelper) this.axesHelper.position.copy(new THREE.Vector3(this.position.x, this.height, this.position.y));

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
        this.speed.multiplyScalar(0.92);
    }

    // private updatePositions() {
    //     this.speed.multiplyScalar(0.92);
    //     this.speed.y -= 0.02;
    //     const currentPos = this.instance.position;;
    //     const newPos: THREE.Vector3 = new THREE.Vector3(
    //         this.position.x + this.speed.x,
    //         this.position.y + this.speed.y,
    //         this.position.z + this.speed.z,
    //     );
    //     const newReversePos: THREE.Vector3 = new THREE.Vector3(
    //         this.position.x - this.speed.x,
    //         this.position.y - this.speed.y,
    //         this.position.z - this.speed.z,
    //     );
    //     if (this.raycastFrom(newPos) === null) {
    //         // console.log("raycast", this.raycastFrom(newPos), newPos);
    //     }
    //     if (this.raycastFrom(newPos) !== null) {
    //         this.position.copy(
    //             new THREE.Vector3(newPos.x, this.position.y, newPos.z),
    //         );
    //         this.floorPosition = this.raycastFrom(newPos) ?? 0;
    //     } else if (this.raycastFrom(new THREE.Vector3(newPos.x, 0, currentPos.z))) {
    //         this.position.copy(new THREE.Vector3(newPos.x, 0, newReversePos.z));
    //         this.speed.z *= -1;
    //         this.floorPosition =
    //             this.raycastFrom(
    //                 new THREE.Vector3(newPos.x, this.position.y, currentPos.z),
    //             ) ?? 0;
    //     } else if (this.raycastFrom(new THREE.Vector3(currentPos.x, 0, newPos.z))) {
    //         this.position.copy(
    //             new THREE.Vector3(newReversePos.x, this.position.y, newPos.z),
    //         );
    //         this.speed.x *= -1;
    //         this.floorPosition =
    //             this.raycastFrom(new THREE.Vector3(currentPos.x, 0, newPos.z)) ?? 0;
    //     }

    //     this.position.y += this.speed.y;
    //     this.position.y = Math.max(this.position.y, this.floorPosition);
    //     if (this.floorPosition === this.position.y) {
    //         this.speed.y = 0;
    //         this.isOnGround = true;
    //     } else {
    //         this.isOnGround = false;
    //     }
    //     // Update the instance's position to match the calculated position
    //     this.instance.position.copy(this.position);
    // }

    private updatePosition() {
        if (this.speed.x > 0.0001 || this.speed.x < -0.0001 || this.speed.y > 0.0001 || this.speed.y < -0.0001) {
            // console.log(this.instance.name, this.position)
            const newPos: THREE.Vector2 = new THREE.Vector2().copy(this.checkPosRecursive(this.position, this.speed, 0));
            this.position.copy(newPos);
        }
    }

    private checkPosRecursive(position: THREE.Vector2, speed: THREE.Vector2, angle: number): THREE.Vector2 {
        const currentAngle = Math.atan2(speed.y, speed.x) + angle;
        const currentSpeed = Math.sqrt(speed.x * speed.x + speed.y * speed.y);
        const newSpeed: THREE.Vector2 = new THREE.Vector2(Math.cos(currentAngle) * currentSpeed, Math.sin(currentAngle) * currentSpeed);
        const newPos: THREE.Vector2 = new THREE.Vector2(position.x + newSpeed.x, position.y + newSpeed.y);
        const height: number | null = this.raycastFrom(newPos);
        // console.log(position)
        if (height === null || this.checkBadDistance(height, this.height)) {
            const newAngle = angle > 0 ? (angle + 0.15) * -1 : (angle - 0.15) * -1;
            if (newAngle > Math.PI / 2) {
                return position;
            }
            console.log(angle);
            return this.checkPosRecursive(position, speed, newAngle)
            // return position;
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
        // console.log("intersects", this.floor);
        if (intersects.length > 0) {
            intersects.forEach((intersect) => {
                // console.log(intersect.object.name);
                if (intersect.object.name === "floor") {
                    posY = intersect.point.y + 0.6;
                }
            });
        }
        return posY;
    }
}
