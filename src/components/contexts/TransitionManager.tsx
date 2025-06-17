import { useGSAP } from "@gsap/react";
import { createContext, ReactNode, useContext, useRef, useState } from "react";
import gsap from "gsap";
import { eventEmitterInstance } from "../../utils/eventEmitter";

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
    // changePage: (page: Scenes) => void;
    setPage: (page: Scenes) => void;
};

const TransitionContext = createContext<TransitionContextProps | null>(null);

export function TransitionProvider({ children }: { children: ReactNode }) {
    const fadeRef = useRef<HTMLDivElement>(null);
    const [displayedPage, setDisplayedPage] = useState<Scenes>("home");
    const [page, setPage] = useState<Scenes>("home");

    useGSAP(() => {
        if (!fadeRef.current || page === "home") return;
        console.log("scene transition to :", page);
        const tl = gsap.timeline({ paused: true });
        tl.to(fadeRef.current, {
            duration: 0.5,
            opacity: 1,
            ease: "power1.inOut",
            onComplete: () => {
                setDisplayedPage(page);
                eventEmitterInstance.trigger(`toggleFreeze`, [false]);
            },
            overwrite: true,
        }).to(fadeRef.current, {
            duration: 0.5,
            opacity: 0,
            ease: "power1.inOut",
        });
        tl.progress(0).play();
    }, [page]);

    return (
        <TransitionContext.Provider
            value={{
                displayedPage,
                setPage,
            }}
        >
            <div id="fade" ref={fadeRef}>
                fade
            </div>
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
