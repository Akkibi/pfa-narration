import * as THREE from "three";
import { Character } from "../Character";
import { Camera } from "../Camera";

export default class BaseScene {
    public id: number;
    public instance: THREE.Scene;
    public camera: Camera;
    protected floor: THREE.Mesh | null = null;
    protected character: Character;
    protected axesHelper: THREE.AxesHelper;

    constructor(id: number) {
        this.instance = new THREE.Scene()
        this.instance.background = new THREE.Color(0xffffff);
        this.character = new Character(id);
        this.camera = new Camera(this.character);
        this.id = id;

        console.log(this.character.id, " position: ", this.character.getPosition());

        this.instance.add(this.camera.instance);
        this.instance.add(this.character.getInstance());
        console.log('lookAt', this.character.getPosition())
        this.camera.instance.lookAt(this.character.getPosition());

        // Add AxesHelper
        const axesHelper = new THREE.AxesHelper(5);
        this.axesHelper = axesHelper;
        this.instance.add(axesHelper);

    }
}
