import * as THREE from "three";
import { Character } from "../Character";

import { eventEmitterInstance } from "../../utils/eventEmitter";

class BaseScene {
    public instance: THREE.Scene;
    public camera: THREE.PerspectiveCamera;
    protected floor: THREE.Mesh | null = null;
    protected character: Character;
    protected axesHelper: THREE.AxesHelper;


    constructor() {
        this.instance = new THREE.Scene()
        this.instance.background = new THREE.Color(0xffffff);

        this.camera = new THREE.PerspectiveCamera(
            50,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.z = -5;
        this.camera.position.y = 5;


        // this.camera.lookAt(0, 0, 1);
        // character
        this.character = new Character();

        this.camera.lookAt(this.character.instance.position);
        this.character.instance.add(this.camera);
        // this.character.instance.position.x = 1;

        this.instance.add(this.character.instance);

        // Add AxesHelper
        const axesHelper = new THREE.AxesHelper(1);
        this.axesHelper = axesHelper;
        this.instance.add(this.axesHelper);

        eventEmitterInstance.on("positionChanged", this.move.bind(this));
    }

    move(pos: THREE.Vector3) {
        console.log("Moving from", this.character.instance.position, "to", pos);

        const raycaster = new THREE.Raycaster();
        const down = new THREE.Vector3(0, -1, 0);
        raycaster.set(this.character.instance.position, down);
        const intersects = raycaster.intersectObjects(this.instance.children, true);
        if (intersects.length > 0) {
            this.character.instance.position.copy(pos);
            return true;
        } else {
            console.warn("Character is out of the map!");
        }
        return false;
    };

    public handleResize = () => {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
    };
}

export default BaseScene;
