import * as THREE from "three";
import BaseScene from "./BaseScene";
import Animation from "../../utils/animationManager";
import { loadTexture } from "../assets";

export interface FloatingElement {
    object: THREE.Object3D;
    number: number;
    startPosition: THREE.Vector3;
}

const FLAME_SHEETS = ["flamegreen", "flamered", "flamepurple", "flameyellow"];

export const collectFloating = (root: THREE.Object3D) => {
    const floating: FloatingElement[] = [];
    const flames: THREE.Mesh[] = [];
    root.traverse((child) => {
        if (child.name.startsWith("floating")) {
            floating.push({
                object: child,
                number: Math.random() * 10,
                startPosition: child.position.clone(),
            });
        }
        if (child.name.startsWith("flame")) flames.push(child as THREE.Mesh);
    });
    return { floating, flames };
};

export const updateFloating = (elements: FloatingElement[], phase: number) => {
    for (const { object, number, startPosition } of elements) {
        object.position.set(
            startPosition.x + Math.sin(phase + number) * 0.5,
            startPosition.y + Math.cos(phase + number + 173) * 0.5,
            startPosition.z,
        );
    }
};

export class Hub extends BaseScene {
    private floatingElements: FloatingElement[] = [];
    private flames: Animation[] = [];

    constructor() {
        super("hub");

        this.generateSpawns([
            {
                position: new THREE.Vector3(-68.5, 0, 5),
                userData: {
                    to: "dream",
                    subtitle: {
                        name: "",
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
        ]);

        this.generateBackgroundMaps(
            [
                "./full-hub/backgrounds/4.webp",
                "./full-hub/backgrounds/3.webp",
                "./full-hub/backgrounds/2.webp",
                "./full-hub/backgrounds/1.webp",
            ],
            new THREE.Vector3(-50, 0, 0),
        );
        this.loadModels();

        const imagePlane = new THREE.PlaneGeometry(9.5, 2.1);
        const imageMaterial = new THREE.MeshBasicMaterial({
            color: 0x000000,
            side: THREE.DoubleSide,
            transparent: true,
            visible: false,
        });
        loadTexture("./logo.webp", this, THREE.NoColorSpace).then(
            (texture) => {
                if (this.disposed) return;
                imageMaterial.alphaMap = texture;
                imageMaterial.visible = true;
                imageMaterial.needsUpdate = true;
            },
            () => {},
        );
        const imageMesh = new THREE.Mesh(imagePlane, imageMaterial);
        imageMesh.position.set(-30, 5, 5);
        imageMesh.rotation.set(0, Math.PI, 0);
        this.instance.add(imageMesh);

        this.instance.background = new THREE.Color(0xeeeeaa);
    }

    protected onUpdate(time: number, dt: number) {
        updateFloating(this.floatingElements, time * 0.48);
        for (const flame of this.flames) flame.update(time, dt);
    }

    private generateFlames(meshes: THREE.Mesh[]) {
        meshes.forEach((mesh, index) => {
            const material = new THREE.MeshBasicMaterial({ transparent: true });
            mesh.scale.z = index > 1 ? 1 : -1;
            mesh.scale.multiplyScalar(0.75);
            mesh.position.y -= 0.25;
            mesh.material = material;
            const sheet = FLAME_SHEETS[Math.min(index, FLAME_SHEETS.length - 1)];
            const animation = new Animation(
                material,
                this,
                `./full-hub/flames/${sheet}.webp`,
                5,
                3,
                15,
                100,
            );
            animation.setFrame(Math.random() * 10);
            this.flames.push(animation);
        });
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
            this.generateFlames(flames);
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
        for (const flame of this.flames) flame.dispose();
        this.flames = [];
        this.floatingElements = [];
        super.dispose();
    }
}
