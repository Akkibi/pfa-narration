import * as THREE from "three";
import { eventEmitterInstance } from "../utils/eventEmitter";
import { Floor } from "./floor";

// interface ParticleData {
//     position: THREE.Vector3;
//     speed: THREE.Vector3;
// }

class Particle {
    public instance: THREE.Points;
    private velocity: THREE.Vector3;
    private lifespan: number;
    private age: number;
    private floor: Floor;
    private onfloor: boolean;
    constructor(
        position: THREE.Vector3,
        speed: THREE.Vector3,
        material: THREE.PointsMaterial,
        floor: Floor,
    ) {
        this.onfloor = false;
        this.age = 0;
        this.floor = floor;
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute(
            "position",
            new THREE.Float32BufferAttribute([position.x, position.y, position.z], 3),
        );
        this.instance = new THREE.Points(geometry, material);
        this.velocity = speed.clone();
        this.lifespan = 50 + Math.floor(Math.random() * 100);
    }

    update(): boolean {
        if (!this.onfloor) {
            const pos = this.instance.geometry.attributes.position as THREE.BufferAttribute;
            pos.array[0] += this.velocity.x;
            // pos.array[1] += this.velocity.y;
            const floorPosition = this.floor.raycastFrom(
                new THREE.Vector2(pos.array[0], pos.array[2]),
            );
            if (floorPosition !== null) {
                pos.array[1] = Math.max(pos.array[1] + this.velocity.y, floorPosition);
                if (pos.array[1] <= floorPosition) {
                    this.onfloor = true;
                }
            } else {
                pos.array[1] += this.velocity.y;
            }
            pos.array[2] += this.velocity.z;
            pos.needsUpdate = true;

            this.velocity.x *= 0.9;
            this.velocity.y += -0.002;
            this.velocity.z *= 0.9;
        }
        this.age++;
        return this.age < this.lifespan;
    }

    dispose() {
        this.instance.geometry.dispose();
    }
}

export class ParticleSystem {
    private id: number;
    private scene: THREE.Scene;
    private particles: Particle[] = [];
    private sharedMaterial: THREE.PointsMaterial;
    private floor: Floor;
    private materialList: THREE.PointsMaterial[] = [];

    constructor(scene: THREE.Scene, floor: Floor, id: number) {
        console.log("new ParticleSystem !!");
        this.floor = floor;
        this.id = id;
        this.scene = scene;

        this.sharedMaterial = new THREE.PointsMaterial({
            size: 0.04,
            vertexColors: false,
            opacity: 0.5,
            transparent: true,
            fog: false,
            color: 0xffffff,
        });
        // change colors later
        this.materialList.push(this.sharedMaterial.clone());
        this.sharedMaterial.color.set(new THREE.Color("#ffff00"));
        this.materialList.push(this.sharedMaterial.clone());
        this.sharedMaterial.color.set(new THREE.Color("#00ffff"));
        this.materialList.push(this.sharedMaterial.clone());
        this.sharedMaterial.color.set(new THREE.Color("#ff00ff"));
        this.materialList.push(this.sharedMaterial.clone());
        eventEmitterInstance.on(
            "trigger-particle",
            (position: THREE.Vector3, speed: THREE.Vector3, id: number) => {
                if (this.id === id) this.spawnParticle(position, speed);
            },
        );
        eventEmitterInstance.on(`updateScene-${this.id}`, this.update.bind(this));
    }

    spawnParticle(position: THREE.Vector3, speed: THREE.Vector3) {
        // Clone shared material with a random hue (reuse base texture/geometry)
        // const color = new THREE.Color(`hsl(0, 0%, ${Math.random() * 100}%)`);
        // const material = this.sharedMaterial.clone();
        const material = this.materialList[Math.floor(Math.random() * this.materialList.length)];
        // material.color.set(color);

        const particle = new Particle(position, speed, material, this.floor);
        this.scene.add(particle.instance);
        this.particles.push(particle);
    }

    update() {
        // console.log(this.particles.length);
        this.particles = this.particles.filter((p) => {
            const alive = p.update();
            if (!alive) {
                this.scene.remove(p.instance);
                p.dispose();
            }
            return alive;
        });
    }
}
