import * as THREE from "three";
import BaseScene from "./BaseScene";
import { loadTexture } from "../assets";
import { collectFloating, FloatingElement, updateFloating } from "./hub";

export class HubEnd extends BaseScene {
    private floatingElements: FloatingElement[] = [];

    constructor() {
        super("hub_end");

        this.generateSpawns([
            {
                position: new THREE.Vector3(-65, 0, 1),
                userData: {
                    from: "dream",
                },
            },
            {
                position: new THREE.Vector3(-65, 0, 1),
                userData: {
                    from: "falling",
                },
            },
            {
                position: new THREE.Vector3(-65, 0, 1),
                userData: {
                    from: "test",
                },
            },
            {
                position: new THREE.Vector3(-65, 0.2, 15),
                userData: {
                    to: "falling",
                },
            },
        ]);

        this.generateZoomZones([
            {
                position: new THREE.Vector3(-65, 0, -3),
                userData: {
                    size: 5,
                    zoom: 0.5,
                },
            },
        ]);

        this.loadModels();

        const imagePlane = new THREE.PlaneGeometry(10, 10);
        const imageMaterial = new THREE.MeshBasicMaterial({
            side: THREE.DoubleSide,
            transparent: true,
            visible: false,
        });
        loadTexture("./backgroundPortal.webp", this, THREE.NoColorSpace).then(
            (texture) => {
                if (this.disposed) return;
                imageMaterial.map = texture;
                imageMaterial.visible = true;
                imageMaterial.needsUpdate = true;
            },
            () => {},
        );
        const imageMesh = new THREE.Mesh(imagePlane, imageMaterial);
        imageMesh.position.set(-65, 4, 15);
        imageMesh.rotation.set(0, Math.PI, 0);
        this.instance.add(imageMesh);

        this.instance.background = new THREE.Color(0x222222);
    }

    protected onUpdate(time: number) {
        updateFloating(this.floatingElements, time * 1.2);
    }

    private async loadModels() {
        const [model, floorModel] = await Promise.all([
            this.loadSceneModel("./full-hub/scene.glb"),
            this.loadSceneModel("./full-hub/floor.glb"),
        ]);

        if (model) {
            const scene = model.scene;
            scene.position.set(0, 0, 1);
            scene.rotation.set(0, Math.PI / 2, 0);
            const { floating, flames } = collectFloating(scene);
            this.floatingElements = floating;
            for (const flame of flames) flame.visible = false;
            this.instance.add(scene);
        }

        if (floorModel) {
            const floor = floorModel.scene.children[0] as THREE.Mesh;
            floor.visible = false;
            floor.position.set(0, 0, 1);
            floor.scale.set(1, 1, 1);
            floor.rotation.set(0, Math.PI / 2, 0);
            this.instance.add(floor);
            this.createFloor(floor);
        }
    }

    public dispose() {
        this.floatingElements = [];
        super.dispose();
    }
}
