import * as THREE from "three";
import Animation from "../utils/animationManager";

export class InteractionIcon {
    public instance: THREE.Mesh;
    private animation: Animation;

    constructor(position: THREE.Vector3, owner: object) {
        const iconMaterial = new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: 1,
        });

        const iconPlane = new THREE.PlaneGeometry(2, 2);
        this.instance = new THREE.Mesh(iconPlane, iconMaterial);
        this.animation = new Animation(
            iconMaterial,
            owner,
            "./interaction-animation.webp",
            8,
            8,
            60,
            50,
        );
        this.instance.rotation.set(0, Math.PI, 0);
        this.instance.position.copy(position).y += 1.5;
    }

    public update(time: number, dt: number) {
        if (this.instance.visible) this.animation.update(time, dt);
    }

    public dispose() {
        this.animation.dispose();
    }
}
