const Controls = {
    keys: { forward: false, back: false, left: false, right: false, space: false, run: false, interaction: false },

    init() {
        console.log("Controls initialized");
        window.addEventListener("keydown", (e) => this.handleKeyUpDown(e, true));
        window.addEventListener("keyup", (e) => this.handleKeyUpDown(e, false));
        window.addEventListener('keypress', (e) => this.handleKeyPress(e));
    },

    handleKeyUpDown(event: KeyboardEvent, pressed: boolean) {
        switch (event.code) {
            case "ShiftLeft":
                this.keys.run = pressed;
                // console.log(`ShiftLeft: ${pressed}`);
                break;
            case "KeyW":
                this.keys.forward = pressed;
                // console.log(`KeyW: ${pressed}`);
                break;
            case "KeyS":
                this.keys.back = pressed;
                // console.log(`KeyS: ${pressed}`);
                break;
            case "KeyA":
                this.keys.left = pressed;
                // console.log(`KeyA: ${pressed}`);
                break;
            case "KeyD":
                this.keys.right = pressed;
                // console.log(`KeyD: ${pressed}`);
                break;
            case "ArrowUp":
                this.keys.forward = pressed;
                // console.log(`ArrowUp: ${pressed}`);
                break;
            case "ArrowDown":
                this.keys.back = pressed;
                // console.log(`ArrowDown: ${pressed}`);
                break;
            case "ArrowLeft":
                this.keys.left = pressed;
                // console.log(`ArrowLeft: ${pressed}`);
                break;
            case "ArrowRight":
                this.keys.right = pressed;
                // console.log(`ArrowRight: ${pressed}`);
                break;
            case "Space":
                this.keys.space = pressed;
                console.log(`Space: ${pressed}`);
                break;
        }
    },

    handleKeyPress(event: KeyboardEvent) {
        console.log(event.code);
        switch (event.code) {
            case "KeyE":
                this.keys.interaction = !this.keys.interaction;
                break;
        }
    }

};

Controls.init();

export default Controls;
