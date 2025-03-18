import * as THREE from "three";
import { eventEmitterInstance } from "../../utils/eventEmitter";

export class Scene1 {
  public instance: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  private cube: THREE.Mesh;

  constructor() {
    this.instance = new THREE.Scene();
    this.instance.background = new THREE.Color(0x200000);

    // Add camera to scene
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    this.camera.position.z = 1.5;
    this.instance.add(this.camera);

    // Add cube to scene
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      wireframe: true,
    });
    this.cube = new THREE.Mesh(geometry, material);
    this.cube.position.set(0, 0, 0);
    this.instance.add(this.cube);

    // Register tick event
    this.registerEvents();
  }

  private registerEvents(): void {
    // Bind the update method to the class instance
    const boundUpdate = this.update.bind(this);
    eventEmitterInstance.on("tick", boundUpdate);
  }

  private update(deltaTime: number): void {
    // Animate the cube
    this.cube.rotation.x += 0.5 * deltaTime;
    this.cube.rotation.y += 0.7 * deltaTime;
  }

  public handleResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  };
}
