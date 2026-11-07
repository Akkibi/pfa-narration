import * as THREE from "three";
import BaseScene from "./BaseScene";

export class HubPano extends BaseScene {
    constructor() {
        super("hub_pano");

        this.generateSpawns([
            {
                position: new THREE.Vector3(-4, 0, -0.5),
                userData: {
                    to: "hub",
                },
            },
            {
                position: new THREE.Vector3(-3.5, 0, -0.5),
                userData: {
                    from: "hub",
                },
            },
            {
                position: new THREE.Vector3(0, 1, 0),
                userData: {
                    from: "intro_prison",
                },
            },
            {
                position: new THREE.Vector3(0, 1, 0),
                userData: {
                    from: "test",
                },
            },
        ]);

        this.generateZoomZones([
            {
                position: new THREE.Vector3(0, 1, 0),
                userData: {
                    size: 0.5,
                    zoom: 3,
                },
            },
            {
                position: new THREE.Vector3(0, 0, -5.5),
                userData: {
                    size: 5,
                    zoom: 0.5,
                },
            },
        ]);

        this.loadModels();
        this.instance.background = new THREE.Color(0x000000);
    }

    private async loadModels() {
        const [model, floorModel] = await Promise.all([
            this.loadSceneModel("./hub/hub.glb"),
            this.loadSceneModel("./hub/floor.glb"),
        ]);

        if (model) {
            model.scene.scale.set(3, 3, 3);
            model.scene.rotation.set(0, -Math.PI / 2, 0);
            this.instance.add(model.scene);
        }

        if (floorModel) {
            const floor = floorModel.scene.children[0] as THREE.Mesh;
            floor.name = "floor";
            floor.visible = false;
            floor.position.set(0, 0, 0);
            floor.scale.set(3, 3, 3);
            floor.rotation.set(0, -Math.PI / 2 + 0.1, 0);
            this.instance.add(floor);
            this.createFloor(floor);
        }
    }
}
