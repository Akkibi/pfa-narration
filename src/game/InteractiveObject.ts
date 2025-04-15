import * as THREE from "three";
import { eventEmitterInstance } from "../utils/eventEmitter";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
import { InteractiveObjectType } from "../data/interactive_objects";
import { lerp } from "../utils/lerp";

export class InteractiveObject {
    public instance: THREE.Mesh;
    public position: THREE.Vector3;
    private rotation: THREE.Euler;
    private scale: THREE.Vector3;
    private is_active: boolean;
    private is_shown: boolean;
    private material: THREE.MeshBasicMaterial;

    constructor(object: InteractiveObjectType, scene_id: number) {
        this.instance = new THREE.Mesh;
        this.position = object.position;
        this.rotation = object.rotation;
        this.scale = object.scale;
        this.is_active = false;
        this.is_shown = false;
        this.material = new THREE.MeshBasicMaterial({ color: new THREE.Color('red') });

        this.instance.position.copy(object.position);
        this.instance.rotation.copy(object.rotation);
        this.instance.scale.copy(object.scale);
        this.instance.material = this.material;

        this.loadGLTFModel(object.gltf_src);

        eventEmitterInstance.on(`characterPositionChanged-${scene_id}`, this.isCharacterInInteractiveArea.bind(this));
    }

    private loadGLTFModel(src: string): void {
        const loader = new GLTFLoader();
        loader.load(
            `./${src}`,
            (gltf: { scene: THREE.Group }) => {
                console.log("GLTF", gltf.scene)
                const GLTFMesh = gltf.scene.children[0] as THREE.Mesh; // Store the loaded model
                GLTFMesh.material = this.material;
                this.instance.add(GLTFMesh); // Add the model to the scene
            },
            undefined,
            (error) => {
                console.error("An error occurred while loading the GLTF model:", error);
            },
        );
    }

    private isCharacterInInteractiveArea(pos: THREE.Vector3) {
        if (pos.x > (this.position.x - 1) && pos.x < (this.position.x + 1) && pos.z > (this.position.z - 1) && pos.z < (this.position.z + 1)) {
            console.log("pos", pos, this.position)
            this.is_active = true;

            this.material.color = new THREE.Color('red');
            this.instance.material = this.material;
            this.instance.position.y = lerp(-0.8, 0.8, 0.1);
        }
        else {
            this.is_active = false;
            this.material.color = new THREE.Color('black');
            this.instance.material = this.material;
            this.instance.position.y = -0.8;
        }
    }
}
