import * as THREE from "three";
import { Character } from "../Character";
import { Camera } from "../Camera";

class BaseScene {
    public instance: THREE.Scene;
    public camera: Camera;
    protected character: Character;

    constructor(scene_id: number) {
        this.instance = new THREE.Scene()
        this.instance.background = new THREE.Color(0xffffff);
        this.character = new Character(scene_id);
        this.camera = new Camera(this.character);

        console.log("Character position: ", this.character.getPosition());

        this.instance.add(this.camera.instance);
        this.instance.add(this.character.getInstance());
        this.camera.instance.lookAt(this.character.getPosition());

        // Add AxesHelper
        const axesHelper = new THREE.AxesHelper(5);
        this.instance.add(axesHelper);

    }
}

export default BaseScene;
