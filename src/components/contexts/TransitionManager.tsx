import { useGSAP } from "@gsap/react";
import { createContext, ReactNode, useContext, useRef, useState } from "react";
import gsap from "gsap";
import { eventEmitterInstance } from "../../utils/eventEmitter";
import { Subtitle } from "../../data/subsData";
import SkipButton from "../SkipButton";

export const ScenesSequence: Scenes[] = [
    "home",
    "intro_prison",
    "hub_pano",
    "hub",
    "dream",
    "hub_end",
    "falling",
    "dark_world",
    "stairs",
    "end",
    "credits",
    "test",
];

export type Scenes =
    | "home"
    | "intro_prison"
    | "hub_pano"
    | "hub"
    | "dream"
    | "hub_end"
    | "falling"
    | "dark_world"
    | "stairs"
    | "end"
    | "credits"
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
    const [displayedPage, setDisplayedPage] = useState<Scenes>("home");
    const [page, setPage] = useState<Scenes>("home");
    const [subtitle, setSubtitle] = useState<Subtitle | null>(null);
    const [isHolding, setIsHolding] = useState(false);
    const timelineRef = useRef<gsap.core.Timeline | null>(null);

    useGSAP(() => {
        if (!fadeRef.current || page === displayedPage) return;

        const tl = gsap.timeline({ paused: true });
        timelineRef.current = tl;

        // Fade to white
        tl.to(fadeRef.current, {
            duration: 0.5,
            opacity: 1,
            backgroundColor: "white",
            ease: "power1.inOut",
            onComplete: () => {
                if (subtitle !== null && subtitle.text && page === "dream") {
                    eventEmitterInstance.trigger(`triggerSubs`, [[subtitle], true]);
                    eventEmitterInstance.trigger("playSound", ["sail_boat"]);
                    eventEmitterInstance.trigger("stopHowlers", [
                        ["hub", "souvenir", "monde_noir", "outro"],
                    ]);
                    setDisplayedPage(page);
                    setIsHolding(true);
                } else {
                    setDisplayedPage(page);
                }
            },
        });

        if (subtitle && subtitle.duration && page === "dream") {
            tl.to(fadeRef.current, {
                duration: subtitle.duration + 2,
            });
        }

        // Fade from white
        tl.addLabel("reveal");
        tl.to(fadeRef.current, {
            duration: 0.5,
            backgroundColor: "transparent",
            ease: "power1.inOut",
            onStart: () => {
                setIsHolding(false);
                eventEmitterInstance.trigger(`toggleFreeze`, [false]);
                eventEmitterInstance.trigger("stopHowlers", [["sail_boat"]]);
            },
        });

        tl.progress(0).play();
    }, [page]);

    const setPageWithSubtitle = (newPage: Scenes, newSubtitle: Subtitle) => {
        if (newSubtitle) {
            setSubtitle(newSubtitle);
        }
        setPage(newPage);
    };

    const skipHold = () => {
        setIsHolding(false);
        if (subtitle) eventEmitterInstance.trigger("stopHowlers", [[subtitle.audio]]);
        eventEmitterInstance.trigger("triggerSubs", [[]]);
        timelineRef.current?.seek("reveal");
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
            {isHolding && <SkipButton onSkip={skipHold} />}
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
