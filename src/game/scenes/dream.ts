import * as THREE from "three";
import BaseScene from "./BaseScene";
import { InteractiveObject } from "../InteractiveObject";
import { InteractiveObjects } from "../../data/objectsData";
import { preferLowRes } from "../assets";

export class Dream extends BaseScene {
    private eye: THREE.Object3D | null = null;

    constructor() {
        super("dream");

        this.generateSpawns([
            {
                position: new THREE.Vector3(-161, 11, 46.5),
                userData: {
                    to: "hub_end",
                },
            },
            {
                position: new THREE.Vector3(-80, 8, -3),
                userData: {
                    from: "test",
                },
            },
            {
                position: new THREE.Vector3(20, 9, 13),
                userData: {
                    from: "hub",
                },
            },
        ]);

        this.generateZoomZones([
            {
                position: new THREE.Vector3(5, 0, -5),
                userData: {
                    size: 5,
                    zoom: 0.5,
                },
            },
            {
                position: new THREE.Vector3(-120, 7, 20),
                userData: {
                    size: 15,
                    zoom: 0.1,
                },
            },
            {
                position: new THREE.Vector3(-92, 12, 5),
                userData: {
                    size: 5,
                    zoom: 0.3,
                },
            },
        ]);

        this.generateBackgroundMaps(
            [
                "./souvenir/backgrounds/1.webp",
                "./souvenir/backgrounds/2.webp",
                "./souvenir/backgrounds/3.webp",
                "./souvenir/backgrounds/4.webp",
            ],
            new THREE.Vector3(-50, 20, 0),
        );

        this.generateSubtitlesTriggerZones([
            {
                position: new THREE.Vector3(5, 0, -5),
                userData: {
                    size: 5,
                    subtitle: {
                        name: "[CHARLIE]",
                        text: "Pas d'toit, pas d'taf, pas d'plan... Allez mec, faut qu'tu bouges. Pas question d'dormir dehors. Pas encore. Y a forcément quelqu'un qui pourra t'aider.",
                        audio: "dream_3_01",
                        duration: 9,
                    },
                },
            },
            {
                position: new THREE.Vector3(-12, 0, -3),
                userData: {
                    size: 3,
                    subtitle: {
                        name: "[CHARLIE]",
                        text: "J'perds mon temps, c'est chacun pour sa pomme ici. Va falloir que j'me débrouille autrement.",
                        audio: "dream_3_02",
                        duration: 6,
                    },
                },
            },
        ]);

        this.children.push(
            new InteractiveObject(InteractiveObjects.chevaletEnfer, this),
            new InteractiveObject(InteractiveObjects.bottleGlass, this),
            new InteractiveObject(InteractiveObjects.bowl, this),
        );

        this.loadModels();
        this.instance.background = new THREE.Color(0xd3c9f2);
    }

    protected onCharacterMove(position: THREE.Vector3) {
        this.eye?.lookAt(position);
    }

    private async loadModels() {
        const sceneUrl = preferLowRes() ? "./souvenir/scene2.mobile.glb" : "./souvenir/scene2.glb";
        const [model, floorModel] = await Promise.all([
            this.loadSceneModel(sceneUrl),
            this.loadSceneModel("./souvenir/floor.glb"),
        ]);

        if (model) {
            const scene = model.scene;
            scene.position.set(5, 0, -3);
            scene.rotation.set(0, Math.PI, 0);
            this.eye = scene.getObjectByName("Sphere_007") ?? null;
            this.instance.add(scene);
        }

        if (floorModel) {
            const floor = floorModel.scene.children[0] as THREE.Mesh;
            floor.name = "floor";
            floor.visible = false;
            floor.position.set(5, 0, -3);
            floor.scale.set(1, 1, 1);
            floor.rotation.set(0, Math.PI, 0);
            this.instance.add(floor);
            this.createFloor(floor);
        }
    }

    public dispose() {
        this.eye = null;
        super.dispose();
    }
}
