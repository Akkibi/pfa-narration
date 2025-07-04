import { useEffect, useRef, useState } from "react";
import { Subtitle } from "../data/subsData";
import { eventEmitterInstance } from "../utils/eventEmitter";
import "./style.css";
import { useTransitionContext } from "./contexts/TransitionManager";

export default function SubtitlesControls() {
    const { displayedPage } = useTransitionContext();
    const [currentLine, setCurrentLine] = useState<Subtitle | null>(null);
    const timeoutRef = useRef<number | null>(null);
    const [animationDelay, setAnimationDelay] = useState<number>(500);
    const [centered, setCentered] = useState<boolean>(false);
    // const [subs, setSubs] = useState<Subtitle[]>([]);

    // utility to clear any pending timeouts and hide subtitle
    const clearSubs = () => {
        if (timeoutRef.current != null) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = null;
        setCurrentLine(null);
    };

    // recursive runner
    const runSubs = (subs: Subtitle[], idx: number) => {
        if (idx >= subs.length) {
            // done
            clearSubs();
            return;
        }
        const sub = subs[idx];
        const letterDelay = sub.duration ? (sub.duration * 1000) / sub.text.length : 500;
        setAnimationDelay(letterDelay);
        const startDelay = (sub.delay ?? 0) * 1000;

        // wait for optional start‐delay
        timeoutRef.current = window.setTimeout(() => {
            setCurrentLine(sub);
            eventEmitterInstance.trigger("playSound", [sub.audio]);

            // schedule next line after (duration + 1.5s) or fallback
            const totalWait = (sub.duration ?? 0.5) * 1000 + 1500;
            timeoutRef.current = window.setTimeout(() => runSubs(subs, idx + 1), totalWait);
        }, startDelay);
    };

    useEffect(() => {
        const handler = (subs: Subtitle[], centered?: boolean) => {
            clearSubs();
            runSubs(subs, 0);
            setCentered(centered ?? false);
        };
        eventEmitterInstance.on("triggerSubs", handler);
        return () => {
            eventEmitterInstance.off("triggerSubs");
            clearSubs();
        };
    }, []);

    return (
        // currentLine && (
        <div className={"subtitles-container " + (centered && "centered")}>
            <p className="subtitles-line-text">
                {currentLine?.name}{" "}
                {currentLine?.text.split("").map((letter, i) => {
                    const delay = 500 + i * animationDelay;
                    return (
                        <span
                            key={i + letter + Math.random()}
                            className="letter"
                            style={{ animationDelay: `${delay}ms` }}
                        >
                            {letter}
                        </span>
                    );
                })}
            </p>
        </div>
        // )
    );
}
