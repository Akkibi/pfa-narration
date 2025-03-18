import { eventEmitterInstance } from "../utils/eventEmitter";
import Controls from "./Controls";

type Point = {
	x: number;
	y: number;
	z: number;
};

export class Character {
	private position: Point;
	private direction: Point;

	constructor() {
		this.position = { x: 0, y: 0, z: 0 };
		this.direction = { x: 0, y: 0, z: 0 };
		Controls.init();
		eventEmitterInstance.on("tick", this.update);
	}

	public moveForward(distance: number): void {
		this.position.x += this.direction.x * distance;
		this.position.y += this.direction.y * distance;
		this.position.z += this.direction.z * distance;

		eventEmitterInstance.trigger("positionChanged", [this.position]);
	}

	public setDirection(direction: Point): void {
		this.direction = direction;
		eventEmitterInstance.trigger("directionChanged", [this.direction]);
	}

	update(deltaTime) {
		if (Controls.keys.forward) this.moveForward(-0.1);
		if (Controls.keys.back) this.moveForward(0.1);
		if (Controls.keys.left) {
			this.setDirection({ x: -1, y: 0, z: 0 });
			this.moveForward(0.1);
		}
		if (Controls.keys.right) {
			this.setDirection({ x: 1, y: 0, z: 0 });
			this.moveForward(0.1);
		}
	}
}
