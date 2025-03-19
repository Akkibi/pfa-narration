const Controls = {
    keys: { forward: false, back: false, left: false, right: false },

    init() {
        window.addEventListener("keydown", (e) => this.handleKey(e, true));
        window.addEventListener("keyup", (e) => this.handleKey(e, false));
    },

    handleKey(event: KeyboardEvent, pressed: boolean) {
        switch (event.code) {
            case "ArrowUp":
                this.keys.forward = pressed;
                console.log(`ArrowUp: ${pressed}`);
                break;
            case "ArrowDown":
                this.keys.back = pressed;
                console.log(`ArrowDown: ${pressed}`);
                break;
            case "ArrowLeft":
                this.keys.left = pressed;
                console.log(`ArrowLeft: ${pressed}`);
                break;
            case "ArrowRight":
                this.keys.right = pressed;
                console.log(`ArrowRight: ${pressed}`);
                break;
        }
    },
};

export default Controls;
