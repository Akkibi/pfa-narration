import * as THREE from "three";
import { Character } from "./Character";
import { damp, lerp } from "../utils/lerp";

const target = new THREE.Vector3();

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
        this.snapToCharacter();
    }

    private readTarget() {
        return target.set(
            this.character.position.x,
            lerp(this.character.floorPosition, this.character.height, 0.5),
            this.character.position.y,
        );
    }

    public snapToCharacter() {
        this.currentPosition.copy(this.readTarget());
        this.instance.position.copy(this.currentPosition);
    }

    public changeZoom(isZoom: boolean, zoomAmount: number) {
        if (isZoom) {
            this.zoomAmount = zoomAmount;
            this.targetZoomPosition.copy(this.zoomDirection).multiplyScalar(1 / this.zoomAmount);
        } else {
            this.zoomAmount = this.defaultZoomAmount;
            this.targetZoomPosition.copy(this.zoomDirection);
        }
    }

    public update(dt: number) {
        this.readTarget();
        if (this.currentPosition.distanceTo(target) > 0.01) {
            this.currentPosition.lerp(target, damp(this.lerpAmount, dt));
            this.instance.position.copy(this.currentPosition);
        }
        if (this.currentZoomPosition.distanceTo(this.targetZoomPosition) > 0.05) {
            this.currentZoomPosition.lerp(
                this.targetZoomPosition,
                damp(this.lerpAmount * 0.25, dt),
            );
            this.camera.position.copy(this.currentZoomPosition);
        }
    }

    public handleResize = () => {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
    };
}
