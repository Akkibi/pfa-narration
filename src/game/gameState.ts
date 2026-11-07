import { eventEmitterInstance } from "../utils/eventEmitter";

export const gameState = {
    currentScene: "hub_pano",
    freezed: false,
};

eventEmitterInstance.on("toggleFreeze", (status: boolean) => (gameState.freezed = status));
