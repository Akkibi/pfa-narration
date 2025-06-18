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
import SceneManager from "../components/SceneManager";
import { Test } from "../game/scenes/test";
import { Dream3Subs, Hub0Subs, IntroPrisonSubs, Subtitle } from "../data/subsData";
import { Dream } from "../game/scenes/dream";
import { HubEnd } from "../game/scenes/hubEnd";
import { Hub } from "../game/scenes/hub";
import { HubPano } from "../game/scenes/hubPano";

interface SceneListType {
    [key: string]: Hub | Test | Dream | HubPano | HubEnd;
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
            // dark_world: new Scene1(),
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
        eventEmitterInstance.trigger(`zoom-${to}`, [true, 4]);
        setPage(to);
    };

    const changeScene = (to: Scenes) => {
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
                        sounds={[]}
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
                        subs={Dream3Subs}
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
                        src="/videos/intro_prison.mp4"
                        onEnd={() => setPage("falling")}
                        subs={IntroPrisonSubs}
                        sounds={[]}
                    />
                );
            case "dark_world":
                return <SceneManager currentSceneIndex="dark_world" scene={scenes["dark_world"]} />;
            // case "stairs":
            //     return (
            //         <Player
            //             src="/videos/intro_prison.mp4"
            //             onEnd={() => setPage("falling")}
            //             subs={IntroPrisonSubs}
            //             sounds={[]}
            //         />
            //     );
            // case "dark_world_2":
            //     return <SceneManager currentSceneIndex="dark_world_2" scene={scenes["dark_world_2"]} />;
            case "end":
                return (
                    <Player
                        src="/videos/intro_prison.mp4"
                        onEnd={() => setPage("hub_1")}
                        subs={IntroPrisonSubs}
                    />
                );
            default:
                return <></>;
        }
}
