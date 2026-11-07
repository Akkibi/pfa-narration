import * as THREE from "three";
import { GLTFLoader, type GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";

const dracoLoader = new DRACOLoader().setDecoderPath("/draco/");
const gltfLoader = new GLTFLoader().setDRACOLoader(dracoLoader);
const textureLoader = new THREE.TextureLoader();

const models = new Map<string, Promise<GLTF>>();
const textures = new Map<string, Promise<THREE.Texture>>();
const owners = new Map<object, Set<string>>();

let maxTextureSize = Infinity;

type Load = { loaded: number; total: number; done: boolean };
const loads = new Set<Load>();
let tracking = true;
let failedLoads = 0;
const FALLBACK_BYTES = 256 * 1024;

const track = <T>(start: (onProgress: (event: ProgressEvent) => void) => Promise<T>) => {
    if (!tracking) return start(() => {});
    const load: Load = { loaded: 0, total: 0, done: false };
    loads.add(load);
    const promise = start((event) => {
        load.loaded = event.loaded;
        load.total = event.total;
    });
    promise.then(
        () => (load.done = true),
        () => {
            load.done = true;
            failedLoads++;
        },
    );
    return promise;
};

// Byte-weighted progress of every load since page start, read by the startup loader only.
export const loadProgress = () => {
    let pending = 0;
    let weight = 0;
    let loaded = 0;
    for (const load of loads) {
        const size = load.total || FALLBACK_BYTES;
        weight += size;
        loaded += load.done ? size : Math.min(load.loaded, size);
        if (!load.done) pending++;
    }
    return { progress: weight ? loaded / weight : 0, pending, failed: failedLoads };
};

export const stopLoadTracking = () => {
    tracking = false;
    loads.clear();
};

const normalize = (url: string) => "/" + url.replace(/^\.?\//, "");

export const setMaxTextureSize = (size: number) => {
    maxTextureSize = size;
};

export const preferLowRes = () =>
    maxTextureSize < 8192 || window.matchMedia("(pointer: coarse)").matches;

const retain = (owner: object, url: string) => {
    let urls = owners.get(owner);
    if (!urls) owners.set(owner, (urls = new Set()));
    urls.add(url);
};

const isRetained = (url: string) => {
    for (const urls of owners.values()) if (urls.has(url)) return true;
    return false;
};

const markShared = (root: THREE.Object3D) => {
    root.traverse((object) => {
        const mesh = object as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.userData.shared = true;
        forEachMaterial(mesh, (material) => {
            material.userData.shared = true;
            forEachTexture(material, (texture) => (texture.userData.shared = true));
        });
    });
};

const forEachMaterial = (object: THREE.Object3D, fn: (material: THREE.Material) => void) => {
    const material = (object as THREE.Mesh).material;
    if (!material) return;
    if (Array.isArray(material)) material.forEach(fn);
    else fn(material);
};

const forEachTexture = (material: THREE.Material, fn: (texture: THREE.Texture) => void) => {
    for (const value of Object.values(material)) {
        if (value instanceof THREE.Texture) fn(value);
    }
    const uniforms = (material as THREE.ShaderMaterial).uniforms;
    if (uniforms) {
        for (const uniform of Object.values(uniforms)) {
            if (uniform.value instanceof THREE.Texture) fn(uniform.value);
        }
    }
};

export const loadModel = async (url: string, owner: object) => {
    const key = normalize(url);
    retain(owner, key);
    let promise = models.get(key);
    if (!promise) {
        promise = track((onProgress) => gltfLoader.loadAsync(key, onProgress)).then((gltf) => {
            markShared(gltf.scene);
            return gltf;
        });
        models.set(key, promise);
        promise.catch(() => models.delete(key));
    }
    const gltf = await promise;
    return { scene: clone(gltf.scene) as THREE.Group, animations: gltf.animations };
};

export const loadTexture = (url: string, owner: object, colorSpace: THREE.ColorSpace) => {
    const key = normalize(url);
    retain(owner, key);
    let promise = textures.get(key);
    if (!promise) {
        promise = track(() => textureLoader.loadAsync(key)).then((texture) => {
            texture.colorSpace = colorSpace;
            texture.userData.shared = true;
            return texture;
        });
        textures.set(key, promise);
        promise.catch(() => textures.delete(key));
    }
    return promise;
};

export const disposeObject = (root: THREE.Object3D) => {
    root.traverse((object) => {
        const mesh = object as THREE.Mesh;
        if (mesh.geometry && !mesh.geometry.userData.shared) mesh.geometry.dispose();
        forEachMaterial(mesh, (material) => {
            if (material.userData.shared) return;
            forEachTexture(material, (texture) => {
                if (!texture.userData.shared) texture.dispose();
            });
            material.dispose();
        });
    });
};

export const release = (owner: object) => {
    const urls = owners.get(owner);
    if (!urls) return;
    owners.delete(owner);
    for (const key of urls) {
        if (isRetained(key)) continue;
        const model = models.get(key);
        if (model) {
            models.delete(key);
            model.then(
                (gltf) => {
                    gltf.scene.traverse((object) => {
                        const mesh = object as THREE.Mesh;
                        mesh.geometry?.dispose();
                        forEachMaterial(mesh, (material) => {
                            forEachTexture(material, (texture) => texture.dispose());
                            material.dispose();
                        });
                    });
                },
                () => {},
            );
        }
        const texture = textures.get(key);
        if (texture) {
            textures.delete(key);
            texture.then(
                (t) => t.dispose(),
                () => {},
            );
        }
    }
};
