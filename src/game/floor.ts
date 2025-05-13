import * as THREE from "three";

export class Floor {
    public instance: THREE.Mesh;
    private raycaster: THREE.Raycaster;

    constructor(floorModel: THREE.Mesh) {
        this.instance = floorModel;
        this.raycaster = new THREE.Raycaster();
    }

    public raycastFrom(position: THREE.Vector2): number | null {
        if (this.instance === null) {
            return null;
        }
        let posY = null;
        const newPos = new THREE.Vector3(position.x, 50, position.y);
        this.raycaster.set(newPos, new THREE.Vector3(0, -1, 0));
        const intersects = this.raycaster.intersectObject(this.instance);
        if (intersects.length > 0) {
            intersects.forEach((intersect) => {
                if (intersect.object.name === "floor") {
                    posY = intersect.point.y;
                }
            });
        }
        // console.log("intersect", intersects, posY);
        return posY;
    }
}
