import { GLTFLoader } from "three/examples/jsm/Addons.js";
import * as THREE from "three";

export const loadGLTFModel = (src: string): Promise<THREE.Group> => {
    return new Promise((resolve, reject) => {
        const loader = new GLTFLoader();
        loader.load(
            `./${src}`,
            (gltf: { scene: THREE.Group }) => {
                const GLTFGroup = gltf.scene as THREE.Group;
                // const material = new THREE.MeshBasicMaterial();

                // GLTFGroup.traverse((object) => {
                //     if (object instanceof THREE.Mesh) {
                //         object.material = material;
                //         // console.log("set material to", object.name);
                //     }
                // });

                resolve(GLTFGroup);
            },
            undefined,
            (error) => {
                console.error("An error occurred while loading the GLTF model:", error);
                reject(error);
            },
        );
    });
};
