import UiElements from "./components/game/uiElements";
import ThreeScene from "./components/game/threeScene";
import { useState } from "react";
import Home from "./components/home/Home";
import Loading from "./components/home/Loading";

function App() {
    const [status, setStatus] = useState(1);

    if (status === 0) {
        <Loading />;
    } else if (status === 1) {
        return <Home setStatus={setStatus} />;
    }

    return (
        <>
            <ThreeScene />
            <UiElements />
        </>
    );
}

export default App;
