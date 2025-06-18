import * as THREE from "three";
import { Character } from "../Character";
import { Camera } from "../Camera";
import { ParticleSystem } from "../particles";
import { Floor } from "../floor";
import { eventEmitterInstance } from "../../utils/eventEmitter";
import { charactersData } from "../../data/characters_data";
import Npc from "../npc";
import { loadImage } from "../../utils/loadImage";
import { Scenes } from "../../components/contexts/TransitionManager";
import { gameState } from "../gameState";
import { Subtitle } from "../../data/subsData";

interface spawnData {
    position: THREE.Vector3;
    userData: userData;
}

interface zoomZone {
    position: THREE.Vector3;
    userData: userData;
}

interface subTriggerZone {
    position: THREE.Vector3;
    userData: userData;
}

interface userData {
    [key: string]: number | Scenes | boolean | Subtitle;
}

export default class BaseScene {
    public scene_id: Scenes;
    public instance: THREE.Scene;
    public camera: Camera | null;
    public floor: Floor | null;
    protected character: Character | null;
    protected axesHelper: THREE.AxesHelper;
    private particleSystem: ParticleSystem | null;
    public spawnArray: THREE.PolarGridHelper[] = [];
    public zoomZoneArray: THREE.PolarGridHelper[] = [];
    public subTriggerZones: THREE.PolarGridHelper[] = [];
    protected backgroundMaps: string[] = [];

    constructor(scene_id: Scenes) {
        console.log("Initiating Scene:", scene_id);
        this.instance = new THREE.Scene();
        this.instance.background = new THREE.Color(0xffffff);
        this.scene_id = scene_id;
        this.particleSystem = null;
        this.floor = null;
        this.character = null;
        this.camera = null;

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
        eventEmitterInstance.on(`scene-change-game`, this.updateSceneChange.bind(this));
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

    private updateSceneChange(sceneTo: Scenes, sceneFrom: Scenes, speed?: THREE.Vector2) {
        console.log(
            `scene-change-game: Changing scene from ${this.scene_id} to ${sceneTo} with speed`,
            speed,
            this.spawnArray,
        );
        if (sceneTo !== this.scene_id) return;
        this.spawnArray?.forEach((spawn) => {
            console.log(`Checking spawn:`, spawn.userData.from, spawn.userData.to);
            if (
                spawn.userData.from !== undefined &&
                spawn.userData.from === sceneFrom &&
                this.character !== null &&
                this.camera !== null
            ) {
                console.log("spawn userData", this.scene_id, spawn.userData, spawn.position);
                this.character.setPosition(new THREE.Vector2(spawn.position.x, spawn.position.z));
                this.character.setFloor();
                this.character.speed.copy(speed ?? new THREE.Vector2(0, 0));
                this.character.heightSpeed = 0;
                this.character.height = spawn.position.y;
                this.character.currentPosition.copy(spawn.position);
                this.camera.currentPosition.copy(spawn.position);
                // console.log("character pos ", this.character.getPosition());
                // console.log("character speed ", this.character.getSpeed());
            }
        });
    }

    private onPositionChange(position: THREE.Vector3, lastPosition: THREE.Vector3) {
        this.sceneChange(position);
        this.zoomChange(position, lastPosition);
        this.checkForTriggeringSubtitles(position, lastPosition);
    }

    private sceneChange(position: THREE.Vector3) {
        if (gameState.freezed === true) return;
        this.spawnArray?.forEach((spawn) => {
            if (position.distanceTo(spawn.position) < 0.5 && spawn.userData.to !== undefined) {
                console.log(spawn.userData.to);
                eventEmitterInstance.trigger(`scene-change-game`, [
                    spawn.userData.to,
                    this.scene_id,
                    spawn.userData.speed ?? new THREE.Vector2(0, 0),
                ]);
                eventEmitterInstance.trigger("scene-change-ui", [
                    spawn.userData.to,
                    spawn.userData.subtitle,
                ]);
                eventEmitterInstance.trigger(`toggleFreeze`, [true]);
            }
        });
    }

    private zoomChange(position: THREE.Vector3, lastPosition: THREE.Vector3) {
        this.zoomZoneArray?.forEach((zoomZone) => {
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
    private checkForTriggeringSubtitles(position: THREE.Vector3, lastPosition: THREE.Vector3) {
        this.subTriggerZones?.forEach((triggerZone) => {
            if (triggerZone.userData.size !== undefined && !triggerZone.userData.isDone) {
                const isInZoneNow =
                    position.distanceTo(triggerZone.position) < triggerZone.userData.size;
                const wasInZoneBefore =
                    lastPosition.distanceTo(triggerZone.position) < triggerZone.userData.size;

                // Only trigger when entering the zone
                if (isInZoneNow && !wasInZoneBefore) {
                    console.log("triggering subtitle", triggerZone.userData.subtitle);
                    eventEmitterInstance.trigger("triggerSubs", [[triggerZone.userData.subtitle]]);
                    triggerZone.userData.isDone = true;
                }
            }
        });
    }

    protected generateSpawns(spawns: spawnData[]) {
        spawns.forEach((spawnData) => {
            const color = spawnData.userData.from
                ? new THREE.Color(0x0000ff)
                : new THREE.Color(0x00ff00);
            const spawn = new THREE.PolarGridHelper(0.25, 0, 0, 32, color, color);
            // const spawn = new THREE.PolarGridHelper(0.25, 0, 2, 32, color, color);
            spawn.position.copy(spawnData.position);
            spawn.userData = spawnData.userData;
            this.instance.add(spawn);
            this.spawnArray.push(spawn);
        });
    }

    protected generateZoomZones(zoomZones: zoomZone[]) {
        zoomZones.forEach((zoomZone) => {
            const size = zoomZone.userData.size ?? 1;
            const color = new THREE.Color(0xff0000);
            const spawn = new THREE.PolarGridHelper(Number(size), 0, 0, 32, color, color);
            spawn.position.copy(zoomZone.position);
            spawn.userData = zoomZone.userData;
            this.instance.add(spawn);
            this.zoomZoneArray.push(spawn);
            // console.log("add zoom zones", this.spawnArray);
        });
    }

    protected generateSubtitlesTriggerZones(subTriggerZones: subTriggerZone[]) {
        subTriggerZones.forEach((subTriggerZone) => {
            const size = subTriggerZone.userData.size ?? 1;
            const color = new THREE.Color(0xffa500);
            const spawn = new THREE.PolarGridHelper(Number(size), 0, 0, 32, color, color);
            spawn.position.copy(subTriggerZone.position);
            this.instance.add(spawn);
            spawn.userData = subTriggerZone.userData;
            this.subTriggerZones.push(spawn);
        });
    }

    protected generateNpcs() {
        for (const [key, value] of Object.entries(charactersData)) {
            if (value.sceneId === this.scene_id) {
                console.log(`generate character ${key} in ${value.sceneId}`);
                const npc = new Npc(key, this);
                this.instance.add(npc.instance);
            }
        }
    }

    protected generateBackgroundMaps(backgroundMaps: string[], position?: THREE.Vector3) {
        const group = new THREE.Group();
        backgroundMaps.map((backgroundMap, index) => {
            loadImage(backgroundMap, (texture) => {
                const plane = new THREE.PlaneGeometry(
                    (texture.image.width / 80) * 20,
                    (texture.image.height / 80) * 20,
                    1,
                    1,
                );
                texture.colorSpace = THREE.SRGBColorSpace;
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
                // console.log("backgrounds position", mesh.position);
                group.add(mesh);
            });
        });
        group.position.copy(position ?? new THREE.Vector3(0, 0, 0));
        this.instance.add(group);
    }
}
