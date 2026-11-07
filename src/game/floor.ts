import * as THREE from "three";

const down = new THREE.Vector3(0, -1, 0);

export class Floor {
    public instance: THREE.Mesh;
    private raycaster: THREE.Raycaster;
    private origin = new THREE.Vector3();
    private hits: THREE.Intersection[] = [];

    constructor(floorModel: THREE.Mesh) {
        this.instance = floorModel;
        this.raycaster = new THREE.Raycaster();
    }

    public raycastFrom(position: THREE.Vector2): number | null {
        if (this.instance === null) {
            return null;
        }
        let posY = null;
        this.origin.set(position.x, 50, position.y);
        this.raycaster.set(this.origin, down);
        this.hits.length = 0;
        this.raycaster.intersectObject(this.instance, true, this.hits);
        for (const hit of this.hits) {
            if (hit.object.name === "floor") posY = hit.point.y;
        }
        return posY;
    }
}
