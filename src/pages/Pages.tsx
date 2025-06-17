import { useEffect, useState } from "react";
import { Scenes, useTransitionContext } from "../components/contexts/TransitionManager";
import Home from "./home/Home";
import Player from "./player/Player";
import "./style.css";
import { eventEmitterInstance } from "../utils/eventEmitter";
import SceneManager from "../components/SceneManager";
import { Test } from "../game/scenes/test";
import { Souvenir } from "../game/scenes/souvenir";
import { Hub2 } from "../game/scenes/hub2";
import { Hub0Subs, IntroPrisonSubs } from "../data/subsData";
import { Hub } from "../game/scenes/hub";

interface SceneListType {
    [key: string]: Hub | Test | Souvenir | Hub2;
}

export default function Pages() {
    const [scenes, setScenes] = useState<SceneListType>();
    const { setPage, displayedPage } = useTransitionContext();

    useEffect(() => {
        const loaded_scenes: SceneListType = {
            test: new Test(),
            dream_3: new Souvenir(),
            hub_2: new Hub2(),
            hub_0: new Hub(),
            // dark_world: new Scene1(),
        };

        setScenes(loaded_scenes);
    }, []);

    useEffect(() => {
        console.log("displayedPage", displayedPage);
    }, [displayedPage]);

    useEffect(() => {
        const handleSkip = (key: KeyboardEvent) => {
            if (key.key === "$") {
                setPage("test");
            }
        };
        const sceneChangeHandler = (sceneId: Scenes) => {
            setPage(sceneId);
            console.log("changeSceneIndex", sceneId);
        };

        document.addEventListener("keydown", handleSkip);
        eventEmitterInstance.on("scene-change", sceneChangeHandler);

        return () => {
            document.removeEventListener("keydown", handleSkip);
        };
    }, [setPage]);

    /* {displayedPage === "home" && <Home changePage={changePage} />}
            {displayedPage === "intro_prison" && (
                <Player
                    src="/videos/intro_prison.mov"
                    onEnd={() => changePage("hub_1")}
                    subs={IntroPrisonSubs}
                />
            )}
            {displayedPage === "hub_0" && scenes && (
                <SceneManager currentSceneIndex="hub_0" scene={scenes["hub_0"]} />
            )}
            {displayedPage === "hub_1" && scenes && (
                <SceneManager currentSceneIndex="hub_1" scene={scenes["hub_1"]} />
            )}
            {displayedPage === "dream_3" && scenes && (
                <SceneManager currentSceneIndex="dream_3" scene={scenes["dream_3"]} />
            )}
            {displayedPage === "hub_2" && scenes && (
                <SceneManager currentSceneIndex="hub_2" scene={scenes["hub_2"]} />
            )}
            {displayedPage === "falling" && (
                <Player src="/videos/intro_prison.mp4" onEnd={() => changePage("hub_1")} />
            )}
            {displayedPage === "dark_world" && scenes && (
                <SceneManager currentSceneIndex="hub_2" scene={scenes["hub_2"]} />
            )} */

    if (scenes)
        switch (displayedPage) {
            case "home":
                return <Home />;
            case "intro_prison":
                return (
                    <Player
                        src="/videos/intro_prison.mov"
                        onEnd={() => setPage("hub_1")}
                        subs={IntroPrisonSubs}
                        sounds={["closing_door", "ambient_prison"]}
                    />
                );
            case "test":
                return <SceneManager currentSceneIndex="test" scene={scenes["test"]} />;
            case "hub_0":
                return (
                    <SceneManager
                        currentSceneIndex="hub_0"
                        scene={scenes["hub_0"]}
                        subs={Hub0Subs}
                    />
                );
            case "hub_1":
                return (
                    <SceneManager
                        currentSceneIndex="hub_1"
                        scene={scenes["hub_1"]}
                        subs={Hub0Subs}
                    />
                );
            case "dream_3":
                return <SceneManager currentSceneIndex="dream_3" scene={scenes["dream_3"]} />;
            case "hub_2":
                return <SceneManager currentSceneIndex="hub_2" scene={scenes["hub_2"]} />;
            case "falling":
                return (
                    <Player
                        src="/videos/intro_prison.mp4"
                        onEnd={() => setPage("hub_1")}
                        subs={IntroPrisonSubs}
                    />
                );
            case "dark_world":
                return <SceneManager currentSceneIndex="hub_2" scene={scenes["hub_2"]} />;
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
