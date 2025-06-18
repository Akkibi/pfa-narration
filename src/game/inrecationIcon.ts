import * as THREE from "three";
import Animation from "../utils/animationManager";

export class InteractionIcon {
    private position: THREE.Vector3;
    public instance: THREE.Mesh;
    private scene_id;
    private animation: Animation;

    constructor(position: THREE.Vector3, scene_id: string) {
        this.position = position;
        this.scene_id = scene_id;
        // generate icon ping
        const iconMaterial = new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: 1,
        });

        const iconPlane = new THREE.PlaneGeometry(2, 2);
        this.instance = new THREE.Mesh(iconPlane, iconMaterial);
        this.animation = new Animation(iconMaterial, this.scene_id);
        const animList = [];
        for (let i = 0; i < 60; i++) {
            animList.push(`./interaction-animation/${i + 1}.png`);
        }
        this.animation.set(animList);

        this.animation.speed = 50;
        this.instance.rotation.set(0, Math.PI, 0);
        this.instance.position.copy(this.position.clone().add(new THREE.Vector3(0, 1.5, 0)));
    }
}
