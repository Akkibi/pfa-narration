import * as THREE from "three";
import { eventEmitterInstance } from "../../utils/eventEmitter";

export class Scene3 {
  public instance: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  private torus: THREE.Mesh;

  constructor() {
    this.instance = new THREE.Scene();
    this.instance.background = new THREE.Color(0x000030);

    // add camera to scene
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    this.camera.position.z = 1.5;
    this.instance.add(this.camera);

    // add cube to scene
    const geometry = new THREE.TorusGeometry(0.5, 0.25, 16, 16);
    const material = new THREE.MeshBasicMaterial({
      color: 0x0000ff,
      wireframe: true,
    });
    this.torus = new THREE.Mesh(geometry, material);
    this.torus.position.set(0, 0, 0);
    this.instance.add(this.torus);

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
    this.torus.rotation.x += 0.5 * deltaTime;
    this.torus.rotation.y += 0.7 * deltaTime;
  }

  public handleResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  };
}
