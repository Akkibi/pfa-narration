import { AudioControls } from "./components/AudioControls";
import { TransitionProvider } from "./components/contexts/TransitionManager";
import Pages from "./pages/Pages";
import UiElements from "./components/uiElements";
import SubtitlesControls from "./components/SubtitlesControls";

function App() {
    return (
        <TransitionProvider>
            <>
                {/* z-index:  */}
                <AudioControls />

                <SubtitlesControls />
                {/* z-index: 100 */}
                <UiElements />
                <Pages />
            </>
        </TransitionProvider>
    );
}

export default App;
