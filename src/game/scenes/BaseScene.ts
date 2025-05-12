import * as THREE from "three";
import { Character } from "../Character";
import { Camera } from "../Camera";
import { ParticleSystem } from "../particles";
import { Floor } from "../floor";
import { eventEmitterInstance } from "../../utils/eventEmitter";
import { charactersData } from "../../data/characters_data";
import Npc from "../npc";

interface spawnData {
    position: THREE.Vector3;
    userData: userData;
}

interface zoomZone {
    position: THREE.Vector3;
    userData: userData;
}

interface userData {
    [key: string]: number;
}

export default class BaseScene {
    public scene_id: number;
    public instance: THREE.Scene;
    public camera: Camera;
    public floor: Floor;
    protected character: Character;
    protected axesHelper: THREE.AxesHelper;
    private particleSystem: ParticleSystem;
    public spawnArray: THREE.PolarGridHelper[] = [];
    public zoomZoneArray: THREE.PolarGridHelper[] = [];

    constructor(id: number) {
        this.instance = new THREE.Scene();
        this.instance.background = new THREE.Color(0xffffff);
        this.floor = new Floor();
        this.character = new Character(scene_id, this.floor);
        this.camera = new Camera(this.character);
        this.scene_id = scene_id;
        this.particleSystem = new ParticleSystem(this.instance, this.floor, scene_id);

        // console.log(this.character.id, " position: ", this.character.getPosition());

        this.instance.add(this.camera.instance);
        this.instance.add(this.character.getInstance());
        console.log("lookAt", this.character.getPosition());
        // this.camera.camera.lookAt(this.character.getPosition());

        // Add AxesHelper
        const axesHelper = new THREE.AxesHelper(5);
        this.axesHelper = axesHelper;
        this.instance.add(axesHelper);

        // generate npcs
        this.generateNpcs();

        eventEmitterInstance.on(
            `characterPositionChanged-${this.id}`,
            this.onPositionChange.bind(this),
        );
        eventEmitterInstance.on(`scene-change`, this.updateSceneChange.bind(this));
    }

    private updateSceneChange(sceneTo: number, sceneFrom: number) {
        if (sceneTo !== this.id) return;
        console.log("teleport");
        this.spawnArray?.forEach((spawn) => {
            if (spawn.userData.from !== undefined && spawn.userData.from === sceneFrom) {
                this.character.setPosition(new THREE.Vector2(spawn.position.x, spawn.position.z));
                this.character.setFloor();
                this.character.speed.set(0.01, 0.01);
                this.character.heightSpeed = 0;
                this.character.height = spawn.position.y;
                this.character.currentPosition.copy(spawn.position);
                this.camera.currentPosition.copy(spawn.position);
            }
        });
    }

    private onPositionChange(position: THREE.Vector3, lastPosition: THREE.Vector3) {
        this.sceneChange(position);
        this.zoomChange(position, lastPosition);
    }

    private sceneChange(position: THREE.Vector3) {
        this.spawnArray?.forEach((spawn) => {
            if (position.distanceTo(spawn.position) < 0.25 && spawn.userData.to !== undefined) {
                console.log(spawn.userData.to);
                eventEmitterInstance.trigger("scene-change", [spawn.userData.to, this.id]);
                console.log("scenechange");
            }
        });
    }

    private zoomChange(position: THREE.Vector3, lastPosition: THREE.Vector3) {
        this.zoomZoneArray?.forEach((zoomZone) => {
            // console.log(zoomZone.userData);
            if (zoomZone.userData.zoom !== undefined && zoomZone.userData.size !== undefined) {
                if (
                    position.distanceTo(zoomZone.position) < zoomZone.userData.size !==
                    lastPosition.distanceTo(zoomZone.position) < zoomZone.userData.size
                ) {
                    eventEmitterInstance.trigger(`zoom-${this.id}`, [
                        position.distanceTo(zoomZone.position) < zoomZone.userData.size,
                        zoomZone.userData.zoom,
                    ]);
                }
            }
        });
    }

    protected generateSpawns(spawns: spawnData[]) {
        spawns.forEach((spawnData) => {
            const color = spawnData.userData.from
                ? new THREE.Color(0x0000ff)
                : new THREE.Color(0x00ff00);
            const spawn = new THREE.PolarGridHelper(0.25, 0, 2, 32, color, color);
            spawn.position.copy(spawnData.position);
            spawn.userData = spawnData.userData;
            this.instance.add(spawn);
            this.spawnArray.push(spawn);
            console.log("add spawns", this.spawnArray);
        });
    }

    protected generateZoomZones(zoomZones: zoomZone[]) {
        zoomZones.forEach((zoomZone) => {
            const size = zoomZone.userData.size ?? 1;
            const color = new THREE.Color(0xff0000);
            const spawn = new THREE.PolarGridHelper(size, 0, 2, 32, color, color);
            spawn.position.copy(zoomZone.position);
            spawn.userData = zoomZone.userData;
            this.instance.add(spawn);
            this.zoomZoneArray.push(spawn);
            console.log("add zoom zones", this.spawnArray);
        });
    }

    private generateNpcs() {
        for (const [key, value] of Object.entries(charactersData)) {
            if (value.sceneId === this.id) {
                console.log(`generate character ${key} in ${value.sceneId}`);
                const npc = new Npc(key, value.sceneId);
                this.instance.add(npc.instance);
            }
        }
    }
}
