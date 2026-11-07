import * as THREE from "three";
import BaseScene from "./BaseScene";

export class Test extends BaseScene {
    private mixer: THREE.AnimationMixer | null = null;

    constructor() {
        super("test");

        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(-1, 1, -0.5);
        this.instance.add(light);
        this.instance.add(new THREE.AmbientLight(0xffffff, 0.5));
        this.instance.add(new THREE.HemisphereLight(0xffffff, 0x000000, 0.5));

        this.generateSpawns([
            {
                position: new THREE.Vector3(3, -0.99, 1),
                userData: {
                    to: "dream",
                },
            },
            {
                position: new THREE.Vector3(2, -0.99, 1),
                userData: {
                    from: "dream",
                },
            },
            {
                position: new THREE.Vector3(3, -0.99, 1.75),
                userData: {
                    to: "hub_end",
                },
            },
            {
                position: new THREE.Vector3(2, -0.99, 1.75),
                userData: {
                    from: "hub_end",
                },
            },
            {
                position: new THREE.Vector3(3, -0.99, 2.5),
                userData: {
                    to: "hub_pano",
                },
            },
            {
                position: new THREE.Vector3(2, -0.99, 2.5),
                userData: {
                    from: "hub_pano",
                },
            },
            {
                position: new THREE.Vector3(3, -0.99, 3.25),
                userData: {
                    to: "hub",
                },
            },
            {
                position: new THREE.Vector3(2, -0.99, 3.25),
                userData: {
                    from: "hub",
                },
            },
            {
                position: new THREE.Vector3(0, -0.99, 3.25),
                userData: {
                    to: "dark_world",
                },
            },
        ]);

        this.generateBackgroundMaps([
            "./scene1/backgrounds/background-1.webp",
            "./scene1/backgrounds/background-2.webp",
            "./scene1/backgrounds/background-3.webp",
            "./scene1/backgrounds/background-4.webp",
        ]);

        this.generateZoomZones([
            {
                position: new THREE.Vector3(10, -0.99, 2),
                userData: {
                    size: 5,
                    zoom: 0.25,
                },
            },
            {
                position: new THREE.Vector3(-8, -1, 2),
                userData: {
                    size: 4,
                    zoom: 0.5,
                },
            },
            {
                position: new THREE.Vector3(0, -0.99, 30),
                userData: {
                    size: 1,
                    zoom: 4,
                },
            },
        ]);

        this.instance.background = new THREE.Color(0xaabbcc);
        this.loadModels();
    }

    protected onUpdate(_time: number, dt: number) {
        this.mixer?.update(0.025 * dt);
    }

    private async loadModels() {
        const [model, floorModel] = await Promise.all([
            this.loadSceneModel("./scene1/scene.glb"),
            this.loadSceneModel("./scene1/floor.glb"),
        ]);

        if (model) {
            model.scene.rotation.set(0, Math.PI, 0);
            this.instance.add(model.scene);
            if (model.animations.length > 0) {
                this.mixer = new THREE.AnimationMixer(model.scene);
                for (const clip of model.animations) this.mixer.clipAction(clip).play();
            }
        }

        if (floorModel) {
            const floor = floorModel.scene.children[0] as THREE.Mesh;
            floor.visible = false;
            floor.position.set(0, 0, 0);
            floor.scale.set(1, 1, 1);
            floor.rotation.set(0, Math.PI, 0);
            this.instance.add(floor);
            this.createFloor(floor);
        }
    }

    public dispose() {
        this.mixer?.stopAllAction();
        this.mixer = null;
        super.dispose();
    }
}
