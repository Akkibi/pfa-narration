import * as THREE from "three";
import { Character } from "./Character";
import { eventEmitterInstance } from "../utils/eventEmitter";
import { lerp, lerpVector3 } from "../utils/lerp";
export class Camera {
    public instance: THREE.Group;
    public camera: THREE.PerspectiveCamera;
    private character: Character;
    public currentPosition: THREE.Vector3;
    private lerpAmount: number;
    private zoomAmount: number;
    private defaultZoomAmount: number;
    private zoomDirection: THREE.Vector3;
    private targetZoomPosition: THREE.Vector3;
    private currentZoomPosition: THREE.Vector3;
    constructor(character: Character) {
        this.instance = new THREE.Group();
        this.camera = new THREE.PerspectiveCamera(
            50,
            window.innerWidth / window.innerHeight,
            0.1,
            1000,
        );
        this.currentPosition = new THREE.Vector3(0, 0, 0);
        this.zoomDirection = new THREE.Vector3(0, 2, -5);
        this.camera.position.copy(this.zoomDirection);
        this.camera.lookAt(0, 1, 0);
        this.instance.add(this.camera);
        this.lerpAmount = 0.05;
        this.character = character;
        this.zoomAmount = 1;
        this.defaultZoomAmount = 1;
        this.targetZoomPosition = this.zoomDirection.clone();
        this.currentZoomPosition = this.zoomDirection.clone();
        eventEmitterInstance.on(`updateScene-${this.character.id}`, this.moveCamera.bind(this));
        eventEmitterInstance.on(`zoom-${this.character.id}`, this.changeZoom.bind(this));
    }

    private changeZoom(isZoom: boolean, zoomAmount: number) {
        if (isZoom) {
            this.zoomAmount = zoomAmount;
            this.targetZoomPosition.copy(
                this.zoomDirection.clone().multiplyScalar(1 / this.zoomAmount),
            );
        } else {
            this.zoomAmount = this.defaultZoomAmount;
            this.targetZoomPosition.copy(this.zoomDirection);
        }
        console.log(
            "zoom",
            this.currentZoomPosition,
            this.targetZoomPosition,
            this.currentZoomPosition.distanceTo(this.targetZoomPosition),
        );
    }

    private moveCamera() {
        const characterPosition = new THREE.Vector3().set(
            this.character.position.x,
            lerp(this.character.floorPosition, this.character.height, 0.5),
            this.character.position.y,
        );
        if (this.currentPosition.distanceTo(characterPosition) > 0.05) {
            this.currentPosition.copy(
                lerpVector3(this.currentPosition, characterPosition, this.lerpAmount),
            );
            this.instance.position.copy(this.currentPosition);
        }
        if (this.currentZoomPosition.distanceTo(this.targetZoomPosition) > 0.05) {
            this.currentZoomPosition.copy(
                lerpVector3(
                    this.currentZoomPosition,
                    this.targetZoomPosition,
                    this.lerpAmount * 0.25,
                ),
            );
            this.camera.position.copy(this.currentZoomPosition);
        }
    }

    public handleResize = () => {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
    };
}
