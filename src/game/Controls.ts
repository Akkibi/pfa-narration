import { eventEmitterInstance } from "../utils/eventEmitter";

type Key = "forward" | "back" | "left" | "right" | "space" | "run";

const KEY_MAP: Record<string, Key> = {
    ShiftLeft: "run",
    KeyW: "forward",
    ArrowUp: "forward",
    KeyS: "back",
    ArrowDown: "back",
    KeyA: "left",
    ArrowLeft: "left",
    KeyD: "right",
    ArrowRight: "right",
    Space: "space",
};

const Controls = {
    keys: { forward: false, back: false, left: false, right: false, space: false, run: false },
    scroll: 0,

    init() {
        window.addEventListener("keydown", (e) => this.handleKeyUpDown(e, true));
        window.addEventListener("keyup", (e) => this.handleKeyUpDown(e, false));
        window.addEventListener("wheel", (e) => (this.scroll += e.deltaY / 10), { passive: true });
        window.addEventListener("blur", () => this.releaseAll());
    },

    handleKeyUpDown(event: KeyboardEvent, pressed: boolean) {
        if (event.metaKey || event.altKey || event.ctrlKey) return;
        const key = KEY_MAP[event.code];
        if (key) this.keys[key] = pressed;
        else if (event.code === "KeyE" && pressed && !event.repeat)
            eventEmitterInstance.trigger("userInterractButtonPressed");
    },

    releaseAll() {
        for (const key of Object.keys(this.keys) as Key[]) this.keys[key] = false;
    },
};
Controls.init();

export default Controls;
