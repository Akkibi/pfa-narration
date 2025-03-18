import * as THREE from "three";
import BaseScene from "./BaseScene";

export class Scene2 extends BaseScene {
	constructor() {
		super();

		const ground = new THREE.Mesh(
			new THREE.PlaneGeometry(10, 10),
			new THREE.MeshStandardMaterial({ color: 0x00ff00 })
		);
		ground.rotation.x = -Math.PI / 2;
		this.instance.add(ground);
	}
}
