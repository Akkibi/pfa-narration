import { useGSAP } from "@gsap/react";
import { createContext, ReactNode, useContext, useRef, useState } from "react";
import gsap from "gsap";
import { eventEmitterInstance } from "../../utils/eventEmitter";
import { Subtitle } from "../../data/subsData";

export const ScenesSequence: Scenes[] = [
    "home",
    "intro_prison",
    "hub_0",
    "hub_1",
    "dream_3",
    "hub_2",
    "falling",
    "dark_world",
    "end",
    "test",
];

export type Scenes =
    | "home"
    | "intro_prison"
    | "hub_0"
    | "hub_1"
    | "dream_3"
    | "hub_2"
    | "falling"
    | "dark_world"
    | "end"
    | "test";

type TransitionContextProps = {
    displayedPage: Scenes;
    setPageWithSubtitle: (page: Scenes, subtitle: Subtitle, duration?: number) => void;
    // changePage: (page: Scenes) => void;
    setPage: (page: Scenes) => void;
};

const TransitionContext = createContext<TransitionContextProps | null>(null);

export function TransitionProvider({ children }: { children: ReactNode }) {
    const fadeRef = useRef<HTMLDivElement>(null);
    const [displayedPage, setDisplayedPage] = useState<Scenes>("dream_3");
    const [page, setPage] = useState<Scenes>("dream_3");
    const [subtitle, setSubtitle] = useState<Subtitle | null>(null);

    useGSAP(() => {
        if (!fadeRef.current || page === "home") return;

        const tl = gsap.timeline({ paused: true });

        // Fade to white
        tl.to(fadeRef.current, {
            duration: 0.5,
            opacity: 1,
            backgroundColor: "white",
            ease: "power1.inOut",
            onComplete: () => {
                if (subtitle) {
                    eventEmitterInstance.trigger(`triggerSubs`, [[subtitle], true]);
                } else if (!subtitle) {
                    setDisplayedPage(page);
                }
            },
        });

        if (subtitle && subtitle.duration) {
            tl.to(fadeRef.current, {
                duration: subtitle.duration + 2,
            });
        }

        // Fade from white
        tl.to(fadeRef.current, {
            duration: 0.5,
            backgroundColor: "transparent",
            ease: "power1.inOut",
        });

        tl.progress(0).play();
    }, [page]);

    const setPageWithSubtitle = (newPage: Scenes, newSubtitle: Subtitle) => {
        console.log("Setting page with subtitle:", newPage, newSubtitle);
        if (newSubtitle) {
            setSubtitle(newSubtitle);
        }
        setPage(newPage);
    };

    return (
        <TransitionContext.Provider
            value={{
                displayedPage,
                setPageWithSubtitle,
                setPage,
            }}
        >
            <div id="fade" ref={fadeRef}></div>
            {children}
        </TransitionContext.Provider>
    );
}

export const useTransitionContext = (): TransitionContextProps => {
    const context = useContext(TransitionContext);

    if (!context) {
        throw new Error("useTransitionContext must be used within a NavigationProvider");
    }

    return context;
};
