import * as THREE from "three";

const SAMPLE_SIZE = 128;
const RAY_REACH = 2;
const RESAMPLE_DISTANCE = 0.1;

const down = new THREE.Vector3(0, -1, 0);
const origin = new THREE.Vector3();
const texel = new THREE.Color();
const pixelsBySource = new WeakMap<THREE.Texture["source"], ImageData | null>();

// One small copy per image, read once: the GPU copy cannot be read back cheaply.
const readPixels = (texture: THREE.Texture) => {
    const source = texture.source;
    const cached = pixelsBySource.get(source);
    if (cached !== undefined) return cached;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = SAMPLE_SIZE;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    let pixels: ImageData | null = null;
    const image = source.data as HTMLImageElement | ImageBitmap | HTMLCanvasElement | null;
    if (context && image?.width) {
        context.drawImage(image, 0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
        pixels = context.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
    }
    pixelsBySource.set(source, pixels);
    return pixels;
};

const readHitColor = (hit: THREE.Intersection, target: THREE.Color) => {
    const materials = (hit.object as THREE.Mesh).material;
    const material = (
        Array.isArray(materials) ? materials[hit.face?.materialIndex ?? 0] : materials
    ) as THREE.MeshStandardMaterial;
    target.copy(material.color ?? texel.setRGB(1, 1, 1));
    const pixels = material.map && hit.uv ? readPixels(material.map) : null;
    if (!material.map || !hit.uv || !pixels) return;
    const uv = material.map.transformUv(hit.uv);
    const x = Math.min(SAMPLE_SIZE - 1, Math.floor(uv.x * SAMPLE_SIZE));
    const y = Math.min(SAMPLE_SIZE - 1, Math.floor(uv.y * SAMPLE_SIZE));
    const i = (y * SAMPLE_SIZE + x) * 4;
    target.multiply(
        texel.setRGB(
            pixels.data[i] / 255,
            pixels.data[i + 1] / 255,
            pixels.data[i + 2] / 255,
            THREE.SRGBColorSpace,
        ),
    );
};

// The walkable floor is an invisible collision mesh, so colors come from the visible models under it.
export class SurfaceColor {
    private meshes: THREE.Mesh[] = [];
    private raycaster = new THREE.Raycaster();
    private hits: THREE.Intersection[] = [];
    private lastPosition = new THREE.Vector3(Infinity, 0, 0);
    private color = new THREE.Color(1, 1, 1);

    constructor(models: THREE.Object3D[]) {
        for (const model of models) {
            model.traverseVisible((object) => {
                const mesh = object as THREE.Mesh;
                if (!mesh.isMesh) return;
                const material = mesh.material as THREE.Material;
                if (Array.isArray(material) || !material.transparent) this.meshes.push(mesh);
            });
        }
    }

    public sample(position: THREE.Vector3) {
        if (position.distanceTo(this.lastPosition) < RESAMPLE_DISTANCE) return this.color;
        this.lastPosition.copy(position);
        origin.copy(position);
        origin.y += RAY_REACH;
        this.raycaster.set(origin, down);
        this.raycaster.far = RAY_REACH * 2;
        this.hits.length = 0;
        this.raycaster.intersectObjects(this.meshes, false, this.hits);
        // Collision floors do not match the models exactly, and ceilings can be double sided.
        let closest: THREE.Intersection | null = null;
        for (const hit of this.hits) {
            const gap = Math.abs(hit.point.y - position.y);
            if (!closest || gap < Math.abs(closest.point.y - position.y)) closest = hit;
        }
        if (closest) readHitColor(closest, this.color);
        return this.color;
    }
}
