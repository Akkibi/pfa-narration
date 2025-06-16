import * as THREE from "three";
import { Character } from "../Character";
import { Camera } from "../Camera";
import { ParticleSystem } from "../particles";
import { Floor } from "../floor";
import { eventEmitterInstance } from "../../utils/eventEmitter";
import { charactersData } from "../../data/characters_data";
import Npc from "../npc";
import { loadImage } from "../../utils/loadImage";

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
    public camera: Camera | null;
    public floor: Floor | null;
    protected character: Character | null;
    protected axesHelper: THREE.AxesHelper;
    private particleSystem: ParticleSystem | null;
    public spawnArray: THREE.PolarGridHelper[] = [];
    public zoomZoneArray: THREE.PolarGridHelper[] = [];
    protected backgroundMaps: string[] = [];

    constructor(scene_id: number) {
        this.instance = new THREE.Scene();
        this.instance.background = new THREE.Color(0xffffff);
        this.scene_id = scene_id;
        this.particleSystem = null;
        this.floor = null;
        this.character = null;
        this.camera = null;
        // console.log(this.character.id, " position: ", this.character.getPosition());

        // Add AxesHelper
        const axesHelper = new THREE.AxesHelper(5);
        this.axesHelper = axesHelper;
        this.instance.add(axesHelper);

        // generate npcs
        this.generateNpcs();

        eventEmitterInstance.on(
            `characterPositionChanged-${this.scene_id}`,
            this.onPositionChange.bind(this),
        );
        eventEmitterInstance.on(`scene-change`, this.updateSceneChange.bind(this));
    }

    protected createFloor(floorModel: THREE.Mesh) {
        this.floor = new Floor(floorModel);
        this.character = new Character(this.scene_id, this.floor);
        this.camera = new Camera(this.character);
        this.particleSystem = new ParticleSystem(this.instance, this.floor, this.scene_id);
        this.instance.add(this.camera.instance);
        this.instance.add(this.character.getInstance());
        this.character.getInstance().userData = { name: "character02", sceneIndex: 1 };
        this.character.addAxesHelper(this.axesHelper);
    }

    private updateSceneChange(sceneTo: number, sceneFrom: number, speed: THREE.Vector2) {
        if (sceneTo !== this.scene_id) return;
        console.log("teleport");
        this.spawnArray?.forEach((spawn) => {
            if (
                spawn.userData.from !== undefined &&
                spawn.userData.from === sceneFrom &&
                this.character !== null &&
                this.camera !== null
            ) {
                this.character.setPosition(new THREE.Vector2(spawn.position.x, spawn.position.z));
                this.character.setFloor();
                this.character.speed.copy(speed);
                this.character.heightSpeed = 0;
                this.character.height = spawn.position.y;
                this.character.currentPosition.copy(spawn.position);
                this.camera.currentPosition.copy(spawn.position);
                console.log("character pos ", this.character.getPosition());
                console.log("character speed ", this.character.getSpeed());
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
                eventEmitterInstance.trigger("scene-change", [
                    spawn.userData.to,
                    this.scene_id,
                    this.character?.speed,
                ]);
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
                    eventEmitterInstance.trigger(`zoom-${this.scene_id}`, [
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

    protected generateNpcs() {
        for (const [key, value] of Object.entries(charactersData)) {
            if (value.sceneId === this.scene_id) {
                console.log(`generate character ${key} in ${value.sceneId}`);
                const npc = new Npc(key, value.sceneId);
                this.instance.add(npc.instance);
            }
        }
    }

    protected generateBackgroundMaps(backgroundMaps: string[]) {
        backgroundMaps.map((backgroundMap, index) => {
            loadImage(backgroundMap, (texture) => {
                const plane = new THREE.PlaneGeometry(
                    (texture.image.width / 80) * 20,
                    (texture.image.height / 80) * 20,
                    1,
                    1,
                );
                const material = new THREE.MeshBasicMaterial({
                    transparent: true,
                    map: texture,
                });

                // const material = new THREE.MeshBasicMaterial({ color: "red" });
                const mesh = new THREE.Mesh(plane, material);
                mesh.rotateY(Math.PI);
                mesh.position.set(0, -190 + index * 48, 900 - index * 240);
                const scale = 3.5 - index / 1.1;
                mesh.scale.set(scale, scale, scale);
                mesh.lookAt(new THREE.Vector3(0, 1, -5).add(mesh.position));
                console.log("backgrounds position", mesh.position);
                this.instance.add(mesh);
            });
        });
    }
}
