import * as THREE from "three";
import { Character } from "../Character";

import { eventEmitterInstance } from "../../utils/eventEmitter";

class BaseScene {
    public instance: THREE.Scene;
    public camera: THREE.PerspectiveCamera;

    private playerMesh: THREE.Mesh;
    private character: Character;

    constructor() {
        this.instance = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(
            50,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.z = -5;
        this.camera.position.y = 3;


        // this.camera.lookAt(0, 0, 1);

        this.character = new Character();

        this.playerMesh = new THREE.Mesh(
            new THREE.BoxGeometry(0.5, 1, 0.5),
            new THREE.MeshStandardMaterial({ color: 0xff0000 })
        );

        this.camera.lookAt(this.playerMesh.position);
        this.playerMesh.add(this.camera);
        // this.playerMesh.position.x = 1;

        this.instance.add(this.playerMesh);

        // Add AxesHelper
        const axesHelper = new THREE.AxesHelper(5);
        this.instance.add(axesHelper);

        eventEmitterInstance.on("positionChanged", this.move.bind(this));
    }

    move(pos) {
        this.playerMesh.position.copy(pos);
    };

    public handleResize = () => {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
    };
}

export default BaseScene;
