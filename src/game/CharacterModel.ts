import { GLTFLoader } from "three/examples/jsm/Addons.js";
import * as THREE from "three";

export const loadGLTFModel = (src: string, imageSrc: string): Promise<THREE.Group> => {
    return new Promise((resolve, reject) => {
        const loader = new GLTFLoader();
        loader.load(
            `./${src}`,
            (gltf: { scene: THREE.Group }) => {
                const GLTFGroup = gltf.scene as THREE.Group;
                const material = new THREE.MeshBasicMaterial();

                GLTFGroup.traverse((object) => {
                    if (object instanceof THREE.Mesh) {
                        object.material = material;
                        console.log("set material to", object.name);
                    }
                });

                loadImage(imageSrc, (texture) => {
                    material.map = texture;
                });
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

export const loadImage = (url: string, onLoad: (texture: THREE.Texture) => void): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
        const loader = new THREE.TextureLoader();
        loader.load(
            url,
            (texture: THREE.Texture) => {
                texture.colorSpace = THREE.LinearSRGBColorSpace;
                onLoad(texture);
                resolve();
            },
            undefined,
            (err) => {
                console.error(`Error loading texture from ${url}`, err);
                reject(err);
            },
        );
    });
};
