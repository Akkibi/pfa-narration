import { useEffect, useRef, useState } from "react";
import {
    Scenes,
    ScenesSequence,
    useTransitionContext,
} from "../components/contexts/TransitionManager";
import Home from "./home/Home";
import Player from "./player/Player";
import "./style.css";
import { eventEmitterInstance } from "../utils/eventEmitter";
import SceneManager, { GameScenes } from "../components/SceneManager";
import { Test } from "../game/scenes/test";
import { EndPrisonSubs, Hub0Subs, IntroPrisonSubs, Subtitle } from "../data/subsData";
import { Dream } from "../game/scenes/dream";
import { HubEnd } from "../game/scenes/hubEnd";
import { Hub } from "../game/scenes/hub";
import { HubPano } from "../game/scenes/hubPano";
import { DarkWorld } from "../game/scenes/darkWorld";

interface SceneListType {
    [key: string]: GameScenes;
}

export default function Pages() {
    const [scenes, setScenes] = useState<SceneListType>();
    const { setPage, displayedPage, setPageWithSubtitle } = useTransitionContext();
    const displayedPageRef = useRef(useTransitionContext().displayedPage);

    useEffect(() => {
        const loaded_scenes: SceneListType = {
            test: new Test(),
            dream: new Dream(),
            hubEnd: new HubEnd(),
            hub: new Hub(),
            hubPano: new HubPano(),
            darkWorld: new DarkWorld(),
        };

        setScenes(loaded_scenes);
    }, []);

    useEffect(() => {
        displayedPageRef.current = displayedPage;
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

        document.addEventListener("keydown", handleSkip);
        eventEmitterInstance.on("scene-change-ui", sceneChangeHandler);

        return () => {
            document.removeEventListener("keydown", handleSkip);
        };
    }, [setPage]);

    const changePageToGame = (to: Scenes, from: Scenes) => {
        eventEmitterInstance.trigger("scene-change-game", [to, from]);
        if (to === "hub_pano") eventEmitterInstance.trigger(`zoom-${to}`, [true, 4]);
        console.log(`Changing page from ${from} to ${to}`);
        setPage(to);
    };

    if (scenes)
        switch (displayedPage) {
            case "test":
                return (
                    <SceneManager
                        currentSceneIndex="test"
                        scene={scenes["test"]}
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
                        scene={scenes["hubPano"]}
                        soundTrack="hub"
                        subs={Hub0Subs}
                    />
                );
            case "hub":
                return (
                    <SceneManager
                        currentSceneIndex="hub"
                        scene={scenes["hub"]}
                        subs={Hub0Subs}
                        soundTrack="hub"
                    />
                );
            case "dream":
                return (
                    <SceneManager
                        currentSceneIndex="dream"
                        scene={scenes["dream"]}
                        soundTrack="souvenir"
                    />
                );
            case "hub_end":
                return (
                    <SceneManager
                        currentSceneIndex="hub_end"
                        scene={scenes["hubEnd"]}
                        soundTrack="hub_end"
                    />
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
                        scene={scenes["darkWorld"]}
                        soundTrack="monde_noir"
                    />
                );
            case "stairs":
                return (
                    <Player
                        key={"stairs"}
                        src="/videos/escalier.webm"
                        onEnd={() => setPage("end")}
                    />
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
