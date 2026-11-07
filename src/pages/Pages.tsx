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
import { EndPrisonSubs, Hub0Subs, IntroPrisonSubs, Subtitle } from "../data/subsData";
import { useGameLoader } from "../game/loader";
import type { SceneManagerProps } from "../components/SceneManager";

export default function Pages() {
    const { setPage, displayedPage, setPageWithSubtitle } = useTransitionContext();
    const displayedPageRef = useRef(displayedPage);
    const { runtime, progress, ready } = useGameLoader();

    useEffect(() => {
        displayedPageRef.current = displayedPage;
        runtime?.prepareScenes(displayedPage);
    }, [displayedPage, runtime]);

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
        if (to === "hub_pano") runtime?.getScene("hub_pano")?.setZoom(true, 4);
        setPage(to);
    };

    const showScene = (props: Omit<SceneManagerProps, "scene">) => {
        const scene = runtime?.getScene(props.currentSceneIndex);
        if (!runtime || !scene) return null;
        return <runtime.SceneManager scene={scene} {...props} />;
    };

    switch (displayedPage) {
        case "test":
            return showScene({ currentSceneIndex: "test", subs: [], soundTrack: "hub" });
        case "home":
            return <Home progress={progress} ready={ready} />;
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
            return showScene({ currentSceneIndex: "hub_pano", soundTrack: "hub", subs: Hub0Subs });
        case "hub":
            return showScene({ currentSceneIndex: "hub", subs: Hub0Subs, soundTrack: "hub" });
        case "dream":
            return showScene({ currentSceneIndex: "dream", soundTrack: "souvenir" });
        case "hub_end":
            return showScene({ currentSceneIndex: "hub_end", soundTrack: "hub_end" });
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
            return showScene({ currentSceneIndex: "dark_world", soundTrack: "monde_noir" });
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
