import * as THREE from "three";
import { Character } from "../Character";
import { Camera } from "../Camera";
import { ParticleSystem } from "../particles";
import { Floor } from "../floor";
import { eventEmitterInstance } from "../../utils/eventEmitter";
import { gameState } from "../gameState";


interface spawnData {
    position: THREE.Vector3;
    userData: userData;
}

interface userData {
    [key: string]: number
}


export default class BaseScene {
    public id: number;
    public instance: THREE.Scene;
    public camera: Camera;
    public floor: Floor;
    protected character: Character;
    protected axesHelper: THREE.AxesHelper;
    private particleSystem: ParticleSystem
    public spawnArray: THREE.PolarGridHelper[] = [];

    constructor(id: number) {
        this.instance = new THREE.Scene()
        this.instance.background = new THREE.Color(0xffffff);
        this.floor = new Floor();
        this.character = new Character(id, this.floor);
        this.camera = new Camera(this.character);
        this.id = id;
        this.particleSystem = new ParticleSystem(this.instance, this.floor, id);

        // console.log(this.character.id, " position: ", this.character.getPosition());

        this.instance.add(this.camera.instance);
        this.instance.add(this.character.getInstance());
        console.log('lookAt', this.character.getPosition());
        // this.camera.camera.lookAt(this.character.getPosition());

        // Add AxesHelper
        const axesHelper = new THREE.AxesHelper(5);
        this.axesHelper = axesHelper;
        this.instance.add(axesHelper);

        eventEmitterInstance.on(`characterPositionChanged-${this.id}`, this.sceneChange.bind(this));
        eventEmitterInstance.on(`scene-change`, this.updateSceneChange.bind(this));
    }

    private updateSceneChange(sceneTo: number, sceneFrom: number) {
        if (sceneTo !== this.id) return
        console.log("teleport")
        this.spawnArray?.forEach((spawn) => {
            if (spawn.userData.from !== undefined && spawn.userData.from === sceneFrom) {
                this.character.position.set(spawn.position.x, spawn.position.z);
                this.character.speed.set(0.01, 0.01);
                this.character.heightSpeed = 0
                this.character.height = spawn.position.y
                this.character.currentPosition.copy(spawn.position);
                this.camera.currentPosition.copy(spawn.position);
            }
        })
    }

    private sceneChange(position: THREE.Vector3) {
        // console.log("trigger scene", this.spawnArray)
        if (this.id !== gameState.currentScene) return
        this.spawnArray?.forEach((spawn) => {
            if (spawn.userData.to !== undefined && this.checkDistance(position, spawn.position) < 0.25) {
                console.log(spawn.userData.to)
                eventEmitterInstance.trigger("scene-change", [spawn.userData.to, this.id])
            }
        })

    }

    private checkDistance(vector1: THREE.Vector3, vector2: THREE.Vector3): number {
        const difference = new THREE.Vector3().subVectors(vector1, vector2)
        return Math.sqrt(difference.x * difference.x + difference.z * difference.z);
    }

    protected generateSpawns(spawns: spawnData[]) {
        spawns.forEach(spawnData => {
            const color = spawnData.userData.from ? new THREE.Color(0x0000ff) : new THREE.Color(0x00ff00)
            const spawn = new THREE.PolarGridHelper(0.25, 0, 2, 32, color, color)
            spawn.position.copy(spawnData.position);
            spawn.userData = spawnData.userData;
            this.instance.add(spawn);
            this.spawnArray.push(spawn);
            console.log("add spawns", this.spawnArray)
        })
    }
}
