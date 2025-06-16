import { useEffect, useState } from "react";
import { Scenes, useTransitionContext } from "../components/contexts/TransitionManager";
import Home from "./home/Home";
import Player from "./player/Player";
import "./style.css";
import { eventEmitterInstance } from "../utils/eventEmitter";
import SceneManager from "../components/SceneManager";
import { Scene1 } from "../game/scenes/Scene1";
import { Scene2 } from "../game/scenes/Scene2";
import { Scene3 } from "../game/scenes/Scene3";
import { IntroPrisonSubs } from "../data/subsData";

interface SceneListType {
    [key: string]: Scene1 | Scene2 | Scene3;
}

export default function Pages() {
    const [scenes, setScenes] = useState<SceneListType>();
    const { isFadingOut, changePage, displayedPage, handleTransitionEnd } = useTransitionContext();

    useEffect(() => {
        const loaded_scenes: SceneListType = {
            hub_1: new Scene1(),
            dream_3: new Scene2(),
            hub_2: new Scene3(),
            // dark_world: new Scene1(),
        };

        setScenes(loaded_scenes);
    }, []);

    useEffect(() => {
        console.log("displayedPage", displayedPage);
    }, [displayedPage]);

    const sceneChangeHandler = (sceneId: Scenes) => {
        changePage(sceneId);
        console.log("changeSceneIndex", sceneId);
    };

    // Listen for scene change events
    eventEmitterInstance.on("scene-change", sceneChangeHandler);

    return (
        <div
            className={`page ${isFadingOut ? "fade-out" : "fade-in"}`}
            onTransitionEnd={handleTransitionEnd}
        >
            {displayedPage === "home" && <Home changePage={changePage} />}
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
            )}
        </div>
    );
}
