import { useRef } from "react";
import * as Tone from "tone";
import { AudioControls } from "./components/AudioControls";
import { TransitionProvider } from "./components/contexts/TransitionManager";
import Pages from "./pages/Pages";

function App() {
    const playerRef = useRef<Tone.Player>(null);

    return (
        <TransitionProvider>
            <>
                <AudioControls playerRef={playerRef} />
                <Pages />
            </>
        </TransitionProvider>
    );
}

export default App;
