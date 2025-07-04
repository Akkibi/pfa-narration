import { eventEmitterInstance } from "../utils/eventEmitter";

const Controls = {
    keys: { forward: false, back: false, left: false, right: false, space: false, run: false },
    scroll: window.scrollY,

    init() {
        window.addEventListener("keydown", (e) => this.handleKeyUpDown(e, true));
        window.addEventListener("keyup", (e) => this.handleKeyUpDown(e, false));
        window.addEventListener("wheel", (e) => this.handleScroll(e));
    },

    handleKeyUpDown(event: KeyboardEvent, pressed: boolean) {
        if (event.metaKey || event.altKey || event.ctrlKey) return;

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
                break;
            case "KeyE":
                if (pressed === true) {
                    eventEmitterInstance.trigger("userInterractButtonPressed");
                }
                break;
        }
    },

    handleScroll(event: WheelEvent) {
        const delta = event.deltaY;
        this.scroll += delta / 10;
    },
};
Controls.init();

export default Controls;
