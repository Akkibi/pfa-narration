import UiElements from "./components/game/uiElements";
import ThreeScene from "./components/game/threeScene";
import { useRef, useState } from "react";
import Home from "./components/home/Home";
import Loading from "./components/home/Loading";
import * as Tone from "tone";
import { AudioControls } from "./components/AudioControls";

function App() {
    const [status, setStatus] = useState(1);
    const playerRef = useRef<Tone.Player>(null);

    if (status === 0) {
        <Loading />;
    } else if (status === 1) {
        return (
            <>
                <AudioControls playerRef={playerRef} />
                <Home setStatus={setStatus} />
            </>
        );
    }

    return (
        <>
            <AudioControls playerRef={playerRef} />
            <ThreeScene />
            <UiElements />
        </>
    );
}

export default App;
