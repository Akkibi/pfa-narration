const Controls = {
	keys: { forward: false, back: false, left: false, right: false },

	init() {
		window.addEventListener("keydown", (e) => this.handleKey(e, true));
		window.addEventListener("keyup", (e) => this.handleKey(e, false));
	},

	handleKey(event: KeyboardEvent, pressed: boolean) {
		switch (event.code) {
			case "KeyW":
				this.keys.forward = pressed;
				break;
			case "KeyS":
				this.keys.back = pressed;
				break;
			case "KeyA":
				this.keys.left = pressed;
				break;
			case "KeyD":
				this.keys.right = pressed;
				break;
		}
	},
};

export default Controls;
