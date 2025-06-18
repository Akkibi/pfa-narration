import * as THREE from "three";
import BaseScene from "./BaseScene";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
import { eventEmitterInstance } from "../../utils/eventEmitter";
import Animation from "../../utils/animationManager";
import { sub } from "three/tsl";

interface FloatingElement {
    object: THREE.Object3D;
    number: number;
    startPosition: THREE.Vector3;
}
interface FlamesElement {
    object: THREE.Mesh;
    number: number;
}

export class Hub extends BaseScene {
    private gltfModel: THREE.Group | null = null;
    private floatingElements: FloatingElement[] = [];
    private flames: FlamesElement[] = [];
    constructor() {
        super("hub");

        this.generateSpawns([
            {
                position: new THREE.Vector3(-68.5, 0, 5),
                userData: {
                    to: "dream",
                    subtitle: {
                        name: "[CHARLIE]",
                        text: "J'suis monté dans ce cargo sans savoir où il allait. J'étais pas capable de me situer sur une carte, et c'était mieux comme ça. Ça voulait dire que personne viendrait me chercher. Le capitaine a jamais posé de questions. Il savait que c'était pas la peine. Que je lui répondrais pas. Il était plus lucide que moi, c'est clair. J'ai bossé sur le pont pendant des mois, j'ai serré les dents, et j'me souviens avoir pensé la même chose tout du long : « cette fois, pas d'came, pas d'alcool. Faut pas qu'tu déconnes. C'est ta seule chance. »",
                        audio: "dream_3_00",
                        duration: 26,
                    },
                },
            },
            {
                position: new THREE.Vector3(1, -0.1, 1),
                userData: {
                    from: "hub_pano",
                },
            },
            {
                position: new THREE.Vector3(-65, 0, 1),
                userData: {
                    from: "test",
                },
            },
            {
                position: new THREE.Vector3(1.5, -0.1, 1),
                userData: {
                    to: "hub_pano",
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
            {
                position: new THREE.Vector3(-30, 0, 1),
                userData: {
                    size: 10,
                    zoom: 0.25,
                },
            },
        ]);

        this.generateSubtitlesTriggerZones([
            {
                position: new THREE.Vector3(-65, 0, 0),
                userData: {
                    size: 5,
                    subtitle: {
                        name: "[CHARLIE]",
                        text: "Ça m'revient pas. J'dois creuser plus profond si j'veux comprendre.",
                        audio: "hub_1_00",
                        duration: 5,
                    },
                },
            },
            // {
            //     position: new THREE.Vector3(-92, 12, 5),
            //     userData: {
            //         size: 5,
            //         zoom: 0.3,
            //     },
            // },
        ]);

        this.generateBackgroundMaps(
            [
                "./full-hub/backgrounds/4.png",
                "./full-hub/backgrounds/3.png",
                "./full-hub/backgrounds/2.png",
                "./full-hub/backgrounds/1.png",
            ],
            new THREE.Vector3(-50, 0, 0),
        );
        this.loadGLTFModel();

        const imagePlane = new THREE.PlaneGeometry(10, 3);
        const imageMaterial = new THREE.MeshBasicMaterial({
            map: new THREE.TextureLoader().load("./full-hub/logo.png"),
            side: THREE.DoubleSide,
            transparent: true,
            alphaMap: new THREE.TextureLoader().load("./full-hub/logo-blend.png"),
        });
        const imageMesh = new THREE.Mesh(imagePlane, imageMaterial);
        imageMesh.position.set(-30, 5, 5);
        imageMesh.rotation.set(0, Math.PI, 0);
        this.instance.add(imageMesh);

        this.instance.background = new THREE.Color(0xeeeeaa);

        eventEmitterInstance.on(`updateScene-${this.scene_id}`, this.update.bind(this));
    }

    private update(tick: number) {
        if (this.floatingElements.length > 0) {
            this.floatingElements.forEach((element) => {
                const { object, number, startPosition } = element;
                // const startPositionClone = startPosition.clone();
                object.position.copy(
                    startPosition
                        .clone()
                        .add(
                            new THREE.Vector3(
                                Math.sin(tick / 125 + number) * 0.5,
                                Math.cos(tick / 125 + number + 173) * 0.5,
                                0,
                            ),
                        ),
                );
            });
        }
    }

    private generateFlames() {
        this.flames.forEach((element: FlamesElement, index: number): void => {
            const material = new THREE.MeshBasicMaterial({
                transparent: true,
                opacity: 1,
            });
            if (index > 1) {
                element.object.scale.z = 1;
            } else {
                element.object.scale.z = -1;
            }
            element.object.material = material;
            const anim = new Animation(material, this.scene_id);
            const name =
                index === 0
                    ? "flamegreen"
                    : index === 1
                      ? "flamered"
                      : index === 2
                        ? "flamepurple"
                        : "flameyellow";
            anim.set([
                `./full-hub/flames/${name}/1.png`,
                `./full-hub/flames/${name}/2.png`,
                `./full-hub/flames/${name}/3.png`,
                `./full-hub/flames/${name}/4.png`,
                `./full-hub/flames/${name}/5.png`,
                `./full-hub/flames/${name}/6.png`,
                `./full-hub/flames/${name}/7.png`,
                `./full-hub/flames/${name}/8.png`,
                `./full-hub/flames/${name}/9.png`,
                `./full-hub/flames/${name}/10.png`,
                `./full-hub/flames/${name}/11.png`,
                `./full-hub/flames/${name}/12.png`,
                `./full-hub/flames/${name}/13.png`,
                `./full-hub/flames/${name}/14.png`,
                `./full-hub/flames/${name}/15.png`,
            ]);
            anim.setFrame(element.number);
        });
    }

    private loadGLTFModel(): void {
        const loader = new GLTFLoader();

        // Replace 'path/to/your/model.gltf' with the actual path to your GLTF file
        loader.load(
            "./full-hub/scene.glb",
            (gltf: { scene: THREE.Group }) => {
                this.gltfModel = gltf.scene; // Store the loaded model
                this.instance.add(this.gltfModel); // Add the model to the scene
                // Optionally, adjust the model's position, rotation, or scale
                if (this.gltfModel) {
                    this.gltfModel.position.set(0, 0, 1);
                    this.gltfModel.scale.set(1, 1, 1);
                    this.gltfModel.rotation.set(0, Math.PI / 2, 0);

                    // traverse gltf objects and push element if name start with floating
                    this.gltfModel.traverse((child) => {
                        if (child.name.startsWith("floating")) {
                            this.floatingElements.push({
                                object: child,
                                number: Math.random() * 10,
                                startPosition: child.position.clone(),
                            });
                        }
                        if (child.name.startsWith("flame")) {
                            this.flames.push({
                                object: child as THREE.Mesh,
                                number: Math.random() * 10,
                            });
                        }
                        this.generateFlames();
                    });
                }
            },
            undefined,
            (error) => {
                console.error("An error occurred while loading the GLTF model:", error);
            },
        );
        loader.load(
            "./full-hub/floor.glb",
            (gltf: { scene: THREE.Group }) => {
                // this.instance.add(this.floor); // Add the model to the scene
                const floor = gltf.scene.children[0] as THREE.Mesh;
                floor.visible = false;
                this.instance.add(floor);
                // Optionally, adjust the model's position, rotation, or scale
                if (floor) {
                    floor.position.set(0, 0, 1);
                    floor.scale.set(1, 1, 1);
                    floor.rotation.set(0, Math.PI / 2, 0);
                }
                this.createFloor(floor);
            },
            undefined,
            (error) => {
                console.error("An error occurred while loading the GLTF model:", error);
            },
        );
    }
}
