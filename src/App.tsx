import { useRef } from "react";
import * as Tone from "tone";
import { AudioControls } from "./components/AudioControls";
import { TransitionProvider } from "./components/contexts/TransitionManager";
import Pages from "./pages/Pages";
import UiElements from "./components/uiElements";
import SubtitlesControls from "./components/SubtitlesControls";

function App() {
    const playerRef = useRef<Tone.Player>(null);

    return (
        <TransitionProvider>
            <>
                {/* z-index:  */}
                <AudioControls playerRef={playerRef} />

                <SubtitlesControls />
                {/* z-index: 100 */}
                <UiElements />
                <Pages />
            </>
        </TransitionProvider>
    );
}

export default App;
