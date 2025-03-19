import * as THREE from "three";
import { Character } from "../Character";

import { eventEmitterInstance } from "../../utils/eventEmitter";

class BaseScene {
    public instance: THREE.Scene;
    public camera: THREE.PerspectiveCamera;

    private playerMesh: THREE.Mesh;
    private character: Character;

    constructor() {
        this.instance = new THREE.Scene()
        this.instance.background = new THREE.Color(0xffffff);

        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.z = 2;
        this.instance.add(this.camera);
        this.character = new Character();

        // this.playerMesh = new THREE.Mesh(
        //     new THREE.BoxGeometry(1, 1, 1),
        //     new THREE.MeshBasicMaterial({ color: 0xff0000 })
        // );

        // this.instance.add(this.playerMesh);
        this.init();
    }

    init() {
        eventEmitterInstance.on("positionChanged", (pos) => {
            this.playerMesh.position.copy(pos);
        });
    }

    public handleResize = () => {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
    };
}

export default BaseScene;
