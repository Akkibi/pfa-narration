import * as THREE from "three";
import { PointsNodeMaterial } from "three/webgpu";
import { instancedDynamicBufferAttribute } from "three/tsl";
import { Floor } from "./floor";
import { SurfaceColor } from "./surfaceColor";

const MAX_PARTICLES = 512;
const LIGHTNESS_OFFSET = 0.15;
const tmp = new THREE.Vector2();
const tmpColor = new THREE.Color();
const tmpHsl = { h: 0, s: 0, l: 0 };

// All particles share one instanced sprite: a single draw call, no per-particle allocation.
export class ParticleSystem {
    public instance: THREE.Sprite;
    private floor: Floor;
    private surface: SurfaceColor;
    private count = 0;
    private positions: Float32Array;
    private colors: Float32Array;
    private velocities = new Float32Array(MAX_PARTICLES * 3);
    private ages = new Float32Array(MAX_PARTICLES);
    private lifespans = new Float32Array(MAX_PARTICLES);
    private onFloor = new Uint8Array(MAX_PARTICLES);
    private positionAttribute: THREE.InstancedBufferAttribute;
    private colorAttribute: THREE.InstancedBufferAttribute;
    private material: PointsNodeMaterial;

    constructor(scene: THREE.Scene, floor: Floor, surface: SurfaceColor) {
        this.floor = floor;
        this.surface = surface;
        this.positions = new Float32Array(MAX_PARTICLES * 3);
        this.colors = new Float32Array(MAX_PARTICLES * 3);
        this.positionAttribute = new THREE.InstancedBufferAttribute(this.positions, 3);
        this.positionAttribute.setUsage(THREE.DynamicDrawUsage);
        this.colorAttribute = new THREE.InstancedBufferAttribute(this.colors, 3);
        this.colorAttribute.setUsage(THREE.DynamicDrawUsage);
        this.material = new PointsNodeMaterial({
            size: 0.04,
            opacity: 0.5,
            transparent: true,
            depthWrite: false,
            fog: false,
        });
        this.material.positionNode = instancedDynamicBufferAttribute(
            this.positionAttribute,
            "vec3",
        );
        this.material.colorNode = instancedDynamicBufferAttribute(this.colorAttribute, "vec3");
        this.instance = new THREE.Sprite(this.material);
        this.instance.count = 0;
        this.instance.frustumCulled = false;
        scene.add(this.instance);
    }

    spawnParticle(position: THREE.Vector3, speed: THREE.Vector3) {
        if (this.count >= MAX_PARTICLES) return;
        const i = this.count++;
        const i3 = i * 3;
        this.positions[i3] = position.x;
        this.positions[i3 + 1] = position.y;
        this.positions[i3 + 2] = position.z;
        this.velocities[i3] = speed.x;
        this.velocities[i3 + 1] = speed.y;
        this.velocities[i3 + 2] = speed.z;
        this.surface.sample(position).getHSL(tmpHsl, THREE.SRGBColorSpace);
        tmpColor.setHSL(
            tmpHsl.h,
            tmpHsl.s,
            THREE.MathUtils.clamp(tmpHsl.l + (Math.random() * 2 - 1) * LIGHTNESS_OFFSET, 0, 1),
            THREE.SRGBColorSpace,
        );
        this.colors[i3] = tmpColor.r;
        this.colors[i3 + 1] = tmpColor.g;
        this.colors[i3 + 2] = tmpColor.b;
        this.ages[i] = 0;
        this.lifespans[i] = 50 + Math.floor(Math.random() * 100);
        this.onFloor[i] = 0;
    }

    private moveParticle(i: number, dt: number, decay: number) {
        const p = this.positions;
        const v = this.velocities;
        const i3 = i * 3;
        p[i3] += v[i3] * dt;
        const floorPosition = this.floor.raycastFrom(tmp.set(p[i3], p[i3 + 2]));
        if (floorPosition !== null) {
            p[i3 + 1] = Math.max(p[i3 + 1] + v[i3 + 1] * dt, floorPosition);
            if (p[i3 + 1] <= floorPosition) this.onFloor[i] = 1;
        } else {
            p[i3 + 1] += v[i3 + 1] * dt;
        }
        p[i3 + 2] += v[i3 + 2] * dt;
        v[i3] *= decay;
        v[i3 + 1] -= 0.002 * dt;
        v[i3 + 2] *= decay;
    }

    private copyParticle(from: number, to: number) {
        const f3 = from * 3;
        const t3 = to * 3;
        this.positions.copyWithin(t3, f3, f3 + 3);
        this.velocities.copyWithin(t3, f3, f3 + 3);
        this.colors.copyWithin(t3, f3, f3 + 3);
        this.ages[to] = this.ages[from];
        this.lifespans[to] = this.lifespans[from];
        this.onFloor[to] = this.onFloor[from];
    }

    update(dt: number) {
        if (this.count === 0 && this.instance.count === 0) return;
        const decay = Math.pow(0.9, dt);
        let i = 0;
        while (i < this.count) {
            if (!this.onFloor[i]) this.moveParticle(i, dt, decay);
            this.ages[i] += dt;
            if (this.ages[i] >= this.lifespans[i]) {
                this.count--;
                if (i !== this.count) this.copyParticle(this.count, i);
                continue;
            }
            i++;
        }
        this.instance.count = this.count;
        this.positionAttribute.needsUpdate = true;
        this.colorAttribute.needsUpdate = true;
    }

    dispose() {
        this.instance.removeFromParent();
        this.material.dispose();
        this.count = 0;
    }
}
