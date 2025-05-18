import * as THREE from "three";

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
