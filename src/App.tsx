import { AudioControls } from "./components/AudioControls";
import { TransitionProvider } from "./components/contexts/TransitionManager";
import Pages from "./pages/Pages";
import UiElements from "./components/uiElements";
import SubtitlesControls from "./components/SubtitlesControls";
import SettingsMenu from "./components/SettingsMenu";

function App() {
    return (
        <TransitionProvider>
            <AudioControls />
            <SubtitlesControls />
            <SettingsMenu />
            <UiElements />
            <Pages />
        </TransitionProvider>
    );
}

export default App;
