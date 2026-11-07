import * as THREE from "three";
import { Floor } from "./floor";

const MAX_PARTICLES = 512;
const COLORS = [
    [1, 1, 1],
    [1, 1, 0],
    [0, 1, 1],
    [1, 0, 1],
];
const tmp = new THREE.Vector2();

// All particles share one Points object: a single draw call, no per-particle allocation.
export class ParticleSystem {
    public instance: THREE.Points;
    private floor: Floor;
    private count = 0;
    private positions: Float32Array;
    private colors: Float32Array;
    private velocities = new Float32Array(MAX_PARTICLES * 3);
    private ages = new Float32Array(MAX_PARTICLES);
    private lifespans = new Float32Array(MAX_PARTICLES);
    private onFloor = new Uint8Array(MAX_PARTICLES);
    private geometry: THREE.BufferGeometry;
    private material: THREE.PointsMaterial;

    constructor(scene: THREE.Scene, floor: Floor) {
        this.floor = floor;
        this.positions = new Float32Array(MAX_PARTICLES * 3);
        this.colors = new Float32Array(MAX_PARTICLES * 3);
        this.geometry = new THREE.BufferGeometry();
        this.geometry.setAttribute(
            "position",
            new THREE.BufferAttribute(this.positions, 3).setUsage(THREE.DynamicDrawUsage),
        );
        this.geometry.setAttribute(
            "color",
            new THREE.BufferAttribute(this.colors, 3).setUsage(THREE.DynamicDrawUsage),
        );
        this.geometry.setDrawRange(0, 0);
        this.material = new THREE.PointsMaterial({
            size: 0.04,
            vertexColors: true,
            opacity: 0.5,
            transparent: true,
            depthWrite: false,
            fog: false,
        });
        this.instance = new THREE.Points(this.geometry, this.material);
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
        const color = COLORS[Math.floor(Math.random() * COLORS.length)];
        this.colors[i3] = color[0];
        this.colors[i3 + 1] = color[1];
        this.colors[i3 + 2] = color[2];
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
        if (this.count === 0 && this.geometry.drawRange.count === 0) return;
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
        this.geometry.setDrawRange(0, this.count);
        this.geometry.attributes.position.needsUpdate = true;
        this.geometry.attributes.color.needsUpdate = true;
    }

    dispose() {
        this.instance.removeFromParent();
        this.geometry.dispose();
        this.material.dispose();
        this.count = 0;
    }
}
