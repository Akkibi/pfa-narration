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
        if (subs.length > 0) {
            playSub(0);
        }
    }, [subs]);

    function loadAndStartSubtitles(subs: Subtitle[]) {
        console.log("loadAndStartSubtitles", subs);
        setSubs(subs);
    }

    const playSub = (index: number) => {
        if (index < subs.length) {
            setCurrentLine(subs[index]);
            const delay = subs[index].duration
                ? (subs[index].duration * 1000) / subs[index].text.length
                : 500;
            setAnimationDelay(delay);
            eventEmitterInstance.trigger("playSound", [subs[index].audio]);
            if (subs[index].duration)
                setTimeout(
                    () => {
                        playSub(index + 1);
                    },
                    subs[index].duration * 1000 + 1500,
                );
        } else {
            setCurrentLine(null);
        }
    };

    return (
        <div className="subtitles-container">
            <p className="line-text">
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
