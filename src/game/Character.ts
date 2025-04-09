import { eventEmitterInstance } from "../utils/eventEmitter";
import Controls from "./Controls";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/Addons.js";

const CharacterVars = {
    height: 1,
    width: 0.5,
    depth: 0.5,
    moveSpeed: 0.01,
    turnSpeed: 0.05,  // Control how fast the character rotates
    friction: 0.9     // Friction factor to slow down movement
};

export class Character {
    public id: number;
    private instance: THREE.Group;
    private floorPosition: number = 2;
    private speed: THREE.Vector2;
    private position: THREE.Vector2;
    private rotation: THREE.Vector2;
    // private targetRotation: number;
    private height: number;
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
        // this.instance = new THREE.Mesh(
        //     new THREE.BoxGeometry(this.vars.width, this.vars.height, this.vars.depth),
        //     new THREE.MeshStandardMaterial({ color: 0xff0000 }),
        // );
        this.speed = new THREE.Vector2(0.1, 0.1);
        this.height = 2;
        this.heightSpeed = 0.1;
        this.raycaster = new THREE.Raycaster();
        this.position = new THREE.Vector2(0, 1);
        this.rotation = new THREE.Vector2(0, 0);
        // this.targetRotation = 0;
        this.maxGapSize = 0.5;
        this.instance = new THREE.Group;
        this.loadGLTFModel();
        Controls.init();
        eventEmitterInstance.on(`updateCharacterPhysics-${this.id}`, this.update.bind(this));
    }

    public addFloor(floor: THREE.Mesh) {
        this.floor = floor;
    }
    public addAxesHelper(axesHelper: THREE.AxesHelper) {
        this.axesHelper = axesHelper;
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

    private update() {
        // if (this.instance.userData.sceneIndex !== gameState.currentScene) return

        // console.log('update', Controls.keys)

        // const moveDirection = new THREE.Vector3(0, 0, 0);

        if (Controls.keys.forward) {
            this.speed.y += this.vars.moveSpeed;
        }
        if (Controls.keys.back) {
            this.speed.y -= this.vars.moveSpeed;
        }
        if (Controls.keys.left) {
            this.speed.x += this.vars.moveSpeed;
        }
        if (Controls.keys.right) {
            this.speed.x -= this.vars.moveSpeed;
        }
        if (Controls.keys.space && this.isOnGround) {
            this.heightSpeed += 0.30;
        }

        // console.log('Move Direction', moveDirection.length())

        // if (moveDirection.length() > 0) {
        //     // Calculate the target rotation based on movement direction
        //     this.targetRotation = Math.atan2(moveDirection.x, moveDirection.z);

        //     // Apply movement in the direction we're facing
        //     const speed = moveDirection.length();
        //     this.speed.x = Math.sin(this.targetRotation) * speed;
        //     this.speed.y = Math.cos(this.targetRotation) * speed;
        // }

        // Update the position based on the current speed
        this.updateSpeed();
        this.updatePosition();

        this.instance.position.copy(new THREE.Vector3(this.position.x, this.height, this.position.y));
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

    private updatePosition() {
        if (this.speed.x > 0.0001 || this.speed.x < -0.0001 || this.speed.y > 0.0001 || this.speed.y < -0.0001) {
            // console.log(this.instance.name, this.position)
            const newPos: THREE.Vector2 = new THREE.Vector2().copy(this.checkPosRecursive(this.position, this.speed, 0));
            this.setPosition(newPos)
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
        this.instance.position.copy(new THREE.Vector3(position.x, this.height, position.y));

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
