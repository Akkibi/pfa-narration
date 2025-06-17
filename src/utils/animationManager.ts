import * as THREE from "three";
import { eventEmitterInstance } from "./eventEmitter";

type AnimationType = string[] | null;

class Animation {
    private material: THREE.MeshBasicMaterial;
    private textureLoader: THREE.TextureLoader;
    public speed: number; // in ms
    private deltatime: number = 0;
    private currentIndex: number = 0;
    private loop: Array<THREE.Texture> = [];
    private sceneId: string;

    constructor(material: THREE.MeshBasicMaterial, sceneId: string) {
        this.speed = 100;
        this.sceneId = sceneId;
        this.material = material;
        this.textureLoader = new THREE.TextureLoader();
        this.material.map = this.textureLoader.load("./default.png");
        eventEmitterInstance.on(`updateScene-${this.sceneId}`, this.update.bind(this));
    }
    private loadTexture = (src: string): Promise<THREE.Texture> => {
        return new Promise((resolve, reject) => {
            this.textureLoader.load(
                src,
                (texture) => resolve(texture),
                undefined,
                (err) => reject(err),
            );
        });
    };

    public setSpeed = (speed: number) => {
        console.log("set animation speed", speed);
        this.speed = speed;
    };

    public set = async (animData: AnimationType) => {
        const loop = [];

        if (animData && animData.length > 0) {
            for (const src of animData) {
                const texture = await this.loadTexture(src);
                texture.colorSpace = THREE.SRGBColorSpace;
                loop.push(texture);
            }
        }
        this.currentIndex = 0;
        this.loop = loop;
        // console.log("loop", loop, loop.length);
    };

    private update = (_time: number, deltatime: number) => {
        this.deltatime += deltatime;
        if (this.deltatime < this.speed) return;
        this.deltatime = 0;

        if (this.loop.length > 0) {
            this.material.map = this.loop[this.currentIndex];

            this.currentIndex++;
            if (this.currentIndex >= this.loop.length) {
                this.currentIndex = 0;
            }
        }
    };
}

export default Animation;
