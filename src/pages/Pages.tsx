import { useEffect, useRef } from "react";
import {
    Scenes,
    ScenesSequence,
    useTransitionContext,
} from "../components/contexts/TransitionManager";
import Home from "./home/Home";
import Player from "./player/Player";
import "./style.css";
import { eventEmitterInstance } from "../utils/eventEmitter";
import SceneManager from "../components/SceneManager";
import { EndPrisonSubs, Hub0Subs, IntroPrisonSubs, Subtitle } from "../data/subsData";
import { getScene, prepareScenes } from "../game/sceneRegistry";

export default function Pages() {
    const { setPage, displayedPage, setPageWithSubtitle } = useTransitionContext();
    const displayedPageRef = useRef(displayedPage);

    useEffect(() => {
        displayedPageRef.current = displayedPage;
        prepareScenes(displayedPage);
    }, [displayedPage]);

    useEffect(() => {
        const handleSkip = (key: KeyboardEvent) => {
            if (key.key === "$") {
                setPage("test");
                eventEmitterInstance.trigger("scene-change-game", [
                    "test",
                    displayedPageRef.current,
                ]);
            } else if (key.key === "[") {
                const currentIndex = ScenesSequence.findIndex(
                    (scene) => scene === displayedPageRef.current,
                );
                if (currentIndex !== -1 && currentIndex < ScenesSequence.length - 1) {
                    setPage(ScenesSequence[currentIndex + 1]);
                    eventEmitterInstance.trigger("stopHowlers", [
                        ["ambient_prison", "closing_door"],
                    ]);
                }
            }
        };
        const sceneChangeHandler = (to: Scenes, subtitle?: Subtitle) => {
            if (subtitle) {
                setPageWithSubtitle(to, subtitle);
            } else {
                setPage(to);
            }
        };

        if (import.meta.env.DEV) document.addEventListener("keydown", handleSkip);
        eventEmitterInstance.on("scene-change-ui", sceneChangeHandler);

        return () => {
            document.removeEventListener("keydown", handleSkip);
            eventEmitterInstance.off("scene-change-ui", sceneChangeHandler);
        };
    }, [setPage, setPageWithSubtitle]);

    const changePageToGame = (to: Scenes, from: Scenes) => {
        eventEmitterInstance.trigger("scene-change-game", [to, from]);
        if (to === "hub_pano") getScene("hub_pano")?.setZoom(true, 4);
        setPage(to);
    };

    const gameScene = getScene(displayedPage)!;

    switch (displayedPage) {
        case "test":
            return (
                <SceneManager
                    currentSceneIndex="test"
                    scene={gameScene}
                    subs={[]}
                    soundTrack="hub"
                />
            );
        case "home":
            return <Home />;
        case "intro_prison":
            return (
                <Player
                    src="/videos/intro_prison.webm"
                    onEnd={() => changePageToGame("hub_pano", "intro_prison")}
                    subs={IntroPrisonSubs}
                    sounds={["closing_door", "ambient_prison"]}
                />
            );
        case "hub_pano":
            return (
                <SceneManager
                    currentSceneIndex="hub_pano"
                    scene={gameScene}
                    soundTrack="hub"
                    subs={Hub0Subs}
                />
            );
        case "hub":
            return (
                <SceneManager
                    currentSceneIndex="hub"
                    scene={gameScene}
                    subs={Hub0Subs}
                    soundTrack="hub"
                />
            );
        case "dream":
            return (
                <SceneManager currentSceneIndex="dream" scene={gameScene} soundTrack="souvenir" />
            );
        case "hub_end":
            return (
                <SceneManager currentSceneIndex="hub_end" scene={gameScene} soundTrack="hub_end" />
            );
        case "falling":
            return (
                <Player
                    src="/videos/reaparition.webm"
                    onEnd={(nextScene?: Scenes) =>
                        changePageToGame(nextScene || "dark_world", "falling")
                    }
                    choice={true}
                />
            );
        case "dark_world":
            return (
                <SceneManager
                    currentSceneIndex="dark_world"
                    scene={gameScene}
                    soundTrack="monde_noir"
                />
            );
        case "stairs":
            return (
                <Player key={"stairs"} src="/videos/escalier.webm" onEnd={() => setPage("end")} />
            );
        case "end":
            return (
                <Player
                    key={"end_prison"}
                    src="/videos/end_prison.webm"
                    subs={EndPrisonSubs}
                    sounds={["ambient_prison"]}
                    onEnd={() => setPage("credits")}
                />
            );
        case "credits":
            return (
                <Player
                    key={"credits"}
                    src="/videos/credits.webm"
                    onEnd={() => setPage("home")}
                    sounds={undefined}
                    subs={undefined}
                />
            );
        default:
            return <></>;
    }
}
