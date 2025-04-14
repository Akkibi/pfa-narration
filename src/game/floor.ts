import * as THREE from "three";

export class Floor {
    public instance: THREE.Mesh | null = null;
    private raycaster: THREE.Raycaster;

    constructor() {
        this.raycaster = new THREE.Raycaster();

    }

    public addFloor(floor: THREE.Mesh) {
        this.instance = floor;
    }

    public raycastFrom(position: THREE.Vector2): number | null {
        if (this.instance === null) { return null };
        let posY = null;
        const newPos = new THREE.Vector3(position.x, 100, position.y);
        this.raycaster.set(newPos, new THREE.Vector3(0, -1, 0));
        const intersects = this.raycaster.intersectObject(this.instance);
        if (intersects.length > 0) {
            intersects.forEach((intersect) => {
                if (intersect.object.name === "floor") {
                    posY = intersect.point.y;
                }
            });
        }
        return posY;
    }
}
