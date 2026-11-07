import * as THREE from "three";
import { Character } from "../Character";
import { Camera } from "../Camera";
import { ParticleSystem } from "../particles";
import { SurfaceColor } from "../surfaceColor";
import { Floor } from "../floor";
import { eventEmitterInstance } from "../../utils/eventEmitter";
import { charactersData } from "../../data/characters_data";
import Npc from "../npc";
import { Scenes } from "../../components/contexts/TransitionManager";
import { gameState } from "../gameState";
import { Subtitle } from "../../data/subsData";
import { disposeObject, loadModel, loadTexture, release, textureSize } from "../assets";

interface userData {
    [key: string]: number | Scenes | boolean | Subtitle;
}

export interface Zone {
    position: THREE.Vector3;
    userData: userData;
}

export interface SceneChild {
    update?(time: number, dt: number): void;
    onCharacterMove?(position: THREE.Vector3, lastPosition: THREE.Vector3): void;
    dispose(): void;
}

// Exit zones are 1.5x the original 0.5 radius, measured on the ground plane.
const EXIT_RADIUS = 0.75;
const EXIT_HEIGHT = 1.5;
const SPAWN_HELPER_RADIUS = 0.25;
const tmpPosition = new THREE.Vector2();

export default class BaseScene {
    public scene_id: Scenes;
    public instance: THREE.Scene;
    public camera: Camera | null = null;
    public floor: Floor | null = null;
    protected character: Character | null = null;
    private particleSystem: ParticleSystem | null = null;
    private sceneModels: THREE.Object3D[] = [];
    private spawns: Zone[] = [];
    private zoomZones: Zone[] = [];
    private subTriggerZones: Zone[] = [];
    private insideZones = new Set<Zone>();
    private suppressExits = false;
    private pendingSpawn: { from: Scenes; speed?: THREE.Vector2 } | null = null;
    private pendingZoom: [boolean, number] | null = null;
    protected children: SceneChild[] = [];
    protected disposed = false;

    constructor(scene_id: Scenes) {
        this.instance = new THREE.Scene();
        this.instance.background = new THREE.Color(0xffffff);
        this.scene_id = scene_id;
        this.generateNpcs();
    }

    protected createFloor(floorModel: THREE.Mesh) {
        if (this.disposed) return;
        this.floor = new Floor(floorModel);
        this.character = new Character(this.floor, this);
        this.camera = new Camera(this.character);
        this.particleSystem = new ParticleSystem(
            this.instance,
            this.floor,
            new SurfaceColor(this.sceneModels),
        );
        this.sceneModels = [];
        this.instance.add(this.camera.instance);
        this.instance.add(this.character.instance);
        this.character.instance.userData = { name: "character02", sceneIndex: 1 };
        this.character.onMove = this.onPositionChange;
        this.character.onParticle = this.particleSystem.spawnParticle.bind(this.particleSystem);

        if (this.pendingSpawn) {
            this.spawnFrom(this.pendingSpawn.from, this.pendingSpawn.speed);
            this.pendingSpawn = null;
        }
        if (this.pendingZoom) {
            this.camera.changeZoom(...this.pendingZoom);
            this.pendingZoom = null;
        }
    }

    public get isReady() {
        return this.camera !== null;
    }

    public spawnFrom(sceneFrom: Scenes, speed?: THREE.Vector2) {
        const spawn = this.spawns.find((zone) => zone.userData.from === sceneFrom);
        if (!spawn) return;
        const character = this.character;
        const camera = this.camera;
        if (!character || !camera || !this.floor) {
            this.pendingSpawn = { from: sceneFrom, speed };
            return;
        }
        tmpPosition.set(spawn.position.x, spawn.position.z);
        character.heightSpeed = 0;
        character.height = spawn.position.y;
        character.floorPosition = this.floor.raycastFrom(tmpPosition) ?? spawn.position.y;
        this.insideZones.clear();
        this.suppressExits = true;
        character.setPosition(tmpPosition);
        this.suppressExits = false;
        if (speed) character.speed.copy(speed);
        else character.speed.set(0, 0);
        character.currentPosition.copy(spawn.position);
        camera.snapToCharacter();
    }

    public setZoom(isZoom: boolean, amount: number) {
        if (this.camera) this.camera.changeZoom(isZoom, amount);
        else this.pendingZoom = [isZoom, amount];
    }

    public update(time: number, dt: number) {
        this.character?.update(dt);
        this.camera?.update(dt);
        this.particleSystem?.update(dt);
        for (const child of this.children) child.update?.(time, dt);
        this.onUpdate(time, dt);
    }

    protected onUpdate(_time: number, _dt: number) {}

    protected onCharacterMove(_position: THREE.Vector3) {}

    protected async loadSceneModel(url: string) {
        try {
            const model = await loadModel(url, this);
            if (this.disposed) return null;
            this.sceneModels.push(model.scene);
            return model;
        } catch (error) {
            console.error(`Failed to load ${url}:`, error);
            return null;
        }
    }

    private onPositionChange = (position: THREE.Vector3, lastPosition: THREE.Vector3) => {
        this.sceneChange(position);
        this.zoomChange(position, lastPosition);
        this.checkForTriggeringSubtitles(position, lastPosition);
        for (const child of this.children) child.onCharacterMove?.(position, lastPosition);
        this.onCharacterMove(position);
    };

    private isInExit(position: THREE.Vector3, zone: Zone) {
        const dx = position.x - zone.position.x;
        const dz = position.z - zone.position.z;
        return (
            dx * dx + dz * dz < EXIT_RADIUS * EXIT_RADIUS &&
            Math.abs(position.y - zone.position.y) < EXIT_HEIGHT
        );
    }

    // Exits fire on entry only, so arriving inside a nearby exit does not bounce the player back.
    private sceneChange(position: THREE.Vector3) {
        if (gameState.freezed && !this.suppressExits) return;
        for (const zone of this.spawns) {
            if (zone.userData.to === undefined) continue;
            if (!this.isInExit(position, zone)) {
                this.insideZones.delete(zone);
                continue;
            }
            if (this.insideZones.has(zone)) continue;
            this.insideZones.add(zone);
            if (this.suppressExits) continue;
            eventEmitterInstance.trigger(`scene-change-game`, [zone.userData.to, this.scene_id]);
            eventEmitterInstance.trigger("scene-change-ui", [
                zone.userData.to,
                zone.userData.subtitle ?? null,
            ]);
            eventEmitterInstance.trigger(`toggleFreeze`, [true]);
            break;
        }
    }

    private zoomChange(position: THREE.Vector3, lastPosition: THREE.Vector3) {
        for (const zone of this.zoomZones) {
            const { zoom, size } = zone.userData;
            if (typeof zoom !== "number" || typeof size !== "number") continue;
            const isInside = position.distanceTo(zone.position) < size;
            if (isInside !== lastPosition.distanceTo(zone.position) < size) {
                this.setZoom(isInside, zoom);
            }
        }
    }

    private checkForTriggeringSubtitles(position: THREE.Vector3, lastPosition: THREE.Vector3) {
        for (const zone of this.subTriggerZones) {
            const size = zone.userData.size;
            if (typeof size !== "number" || zone.userData.isDone) continue;
            const isInZoneNow = position.distanceTo(zone.position) < size;
            const wasInZoneBefore = lastPosition.distanceTo(zone.position) < size;
            if (isInZoneNow && !wasInZoneBefore) {
                eventEmitterInstance.trigger("triggerSubs", [[zone.userData.subtitle]]);
                zone.userData.isDone = true;
            }
        }
    }

    private addHelper(zone: Zone, radius: number, color: number) {
        if (!import.meta.env.DEV) return;
        const helper = new THREE.PolarGridHelper(radius, 0, 0, 32, color, color);
        helper.position.copy(zone.position);
        this.instance.add(helper);
    }

    protected generateSpawns(spawns: Zone[]) {
        for (const spawn of spawns) {
            this.spawns.push(spawn);
            const isExit = spawn.userData.to !== undefined;
            this.addHelper(
                spawn,
                isExit ? EXIT_RADIUS : SPAWN_HELPER_RADIUS,
                spawn.userData.from ? 0x0000ff : 0x00ff00,
            );
        }
    }

    protected generateZoomZones(zoomZones: Zone[]) {
        for (const zone of zoomZones) {
            this.zoomZones.push(zone);
            this.addHelper(zone, Number(zone.userData.size ?? 1), 0xff0000);
        }
    }

    protected generateSubtitlesTriggerZones(subTriggerZones: Zone[]) {
        for (const zone of subTriggerZones) {
            this.subTriggerZones.push(zone);
            this.addHelper(zone, Number(zone.userData.size ?? 1), 0xffa500);
        }
    }

    protected generateNpcs() {
        for (const [key, value] of Object.entries(charactersData)) {
            if (value.sceneId === this.scene_id) {
                const npc = new Npc(key, this);
                this.instance.add(npc.instance);
                this.children.push(npc);
            }
        }
    }

    protected generateBackgroundMaps(backgroundMaps: string[], position?: THREE.Vector3) {
        const group = new THREE.Group();
        backgroundMaps.forEach((backgroundMap, index) => {
            loadTexture(backgroundMap, this, THREE.SRGBColorSpace).then(
                (texture) => {
                    if (this.disposed) return;
                    const { width, height } = textureSize(texture);
                    const plane = new THREE.PlaneGeometry(
                        (width / 80) * 20,
                        (height / 80) * 20,
                        1,
                        1,
                    );
                    const material = new THREE.MeshBasicMaterial({
                        transparent: true,
                        map: texture,
                    });
                    const mesh = new THREE.Mesh(plane, material);
                    mesh.rotateY(Math.PI);
                    mesh.position.set(0, -190 + index * 48, 900 - index * 240);
                    const scale = 3.5 - index / 1.1;
                    mesh.scale.set(scale, scale, scale);
                    mesh.lookAt(new THREE.Vector3(0, 1, -5).add(mesh.position));
                    group.add(mesh);
                },
                (error) => console.error("Failed to load background:", error),
            );
        });
        if (position) group.position.copy(position);
        this.instance.add(group);
    }

    public dispose() {
        if (this.disposed) return;
        this.disposed = true;
        for (const child of this.children) child.dispose();
        this.children = [];
        this.character?.dispose();
        this.particleSystem?.dispose();
        disposeObject(this.instance);
        this.instance.clear();
        release(this);
        this.character = null;
        this.camera = null;
        this.floor = null;
        this.particleSystem = null;
    }
}
