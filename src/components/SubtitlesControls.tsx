import { useEffect, useState } from "react";
import { Subtitle } from "../data/subsData";
import { eventEmitterInstance } from "../utils/eventEmitter";
import "./style.css";

export default function SubtitlesControls() {
    const [subs, setSubs] = useState<Subtitle[]>([]);
    const [currentLine, setCurrentLine] = useState<Subtitle | null>(null);
    const [animationDelay, setAnimationDelay] = useState<number>(0);

    useEffect(() => {
        eventEmitterInstance.on("triggerSubs", (subs: Subtitle[]) => loadAndStartSubtitles(subs));
    }, []);

    useEffect(() => {
        if (subs && subs.length > 0) {
            playSub(0);
        } else {
            console.warn("No subtitles loaded");
        }
    }, [subs]);

    function loadAndStartSubtitles(subs: Subtitle[]) {
        console.log("loadAndStartSubtitles", subs);
        setSubs(subs);
    }

    const playSub = (index: number) => {
        if (index < subs.length) {
            const currentSub = subs[index];
            const delay = currentSub.duration
                ? (currentSub.duration * 1000) / currentSub.text.length
                : 500;
            setAnimationDelay(delay);

            // If there's a startDelay property, wait before showing the subtitle
            const startDelay = currentSub.delay ? currentSub.delay * 1000 : 0;

            setTimeout(() => {
                setCurrentLine(currentSub);
                eventEmitterInstance.trigger("playSound", [currentSub.audio]);

                if (currentSub.duration) {
                    setTimeout(
                        () => {
                            playSub(index + 1);
                        },
                        currentSub.duration * 1000 + 1500,
                    );
                }
            }, startDelay);
        } else {
            setCurrentLine(null);
        }
    };

    return (
        <div className="subtitles-container">
            <p className="subtitles-line-text">
                {currentLine && currentLine.name}{" "}
                {currentLine &&
                    currentLine.text.split("").map((letter, index) => {
                        return (
                            <span
                                className="letter"
                                key={index + letter + Math.random()}
                                style={{
                                    animationDelay: 500 + index * animationDelay + "ms",
                                }}
                            >
                                {letter}
                            </span>
                        );
                    })}
            </p>
        </div>
    );
}
