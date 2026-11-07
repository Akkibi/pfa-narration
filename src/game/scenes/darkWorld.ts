import * as THREE from "three";
import BaseScene from "./BaseScene";
import { InteractiveObject } from "../InteractiveObject";
import { InteractiveObjects } from "../../data/objectsData";

export class DarkWorld extends BaseScene {
    constructor() {
        super("dark_world");
        this.generateSpawns([
            {
                position: new THREE.Vector3(-10, 5, -105),
                userData: {
                    from: "test",
                },
            },
            {
                position: new THREE.Vector3(-10, 5, -105),
                userData: {
                    from: "falling",
                },
            },
        ]);

        this.generateZoomZones([
            {
                position: new THREE.Vector3(0, 5, -85),
                userData: {
                    size: 10,
                    zoom: 0.4,
                },
            },
        ]);

        this.generateBackgroundMaps(
            [
                "./dark-world/backgrounds/1.webp",
                "./dark-world/backgrounds/2.webp",
                "./dark-world/backgrounds/3.webp",
                "./dark-world/backgrounds/4.webp",
            ],
            new THREE.Vector3(0, 50, -100),
        );

        this.generateSubtitlesTriggerZones([
            {
                position: new THREE.Vector3(-4, 3, -96),
                userData: {
                    size: 5,
                    subtitle: {
                        name: "[CHARLIE]",
                        text: "Toutes ces images tournent en boucle. Et pourtant, j'comprends toujours rien. Merde... Pourquoi je tremble ?",
                        audio: "dark_world_00",
                        duration: 6,
                    },
                },
            },
        ]);

        this.loadModels();
        this.instance.background = new THREE.Color(0x000000);

        this.children.push(new InteractiveObject(InteractiveObjects.chevaletDarkWorld, this));
    }

    private async loadModels() {
        const [model, floorModel] = await Promise.all([
            this.loadSceneModel("./dark-world/dunes.glb"),
            this.loadSceneModel("./dark-world/dunes-floor.glb"),
        ]);

        if (model) {
            model.scene.scale.multiplyScalar(20);
            model.scene.rotation.set(0, Math.PI / 2, 0);
            this.instance.add(model.scene);
        }

        if (floorModel) {
            const floor = floorModel.scene.children[0] as THREE.Mesh;
            floor.name = "floor";
            floor.visible = false;
            floor.position.set(0, 0, 0);
            floor.scale.multiplyScalar(20);
            floor.rotation.set(0, Math.PI / 2, 0);
            this.instance.add(floor);
            this.createFloor(floor);
        }
    }
}
