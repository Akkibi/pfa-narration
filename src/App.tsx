import UiElements from "./components/game/uiElements";
import ThreeScene from "./components/game/threeScene";
import { useRef, useState } from "react";
import Home from "./components/home/Home";
import * as Tone from "tone";
import { AudioControls } from "./components/AudioControls";

function App() {
    const [status, setStatus] = useState(1);
    const playerRef = useRef<Tone.Player>(null);

    return (
        <>
            <AudioControls playerRef={playerRef} />
            {status === 1 ? (
                <Home setStatus={setStatus} />
            ) : (
                <>
                    <ThreeScene />
                    <UiElements />
                </>
            )}
        </>
    );
}

export default App;
