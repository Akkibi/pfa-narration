import { useEffect, useRef, useState } from "react";
import "./style.css";
import { useGSAP } from "@gsap/react";
import { InteractiveObjectType } from "../../data/objectsData";
import { Subtitle } from "../../data/subsData";
import { eventEmitterInstance } from "../../utils/eventEmitter";
import { gsap } from "gsap";

type ObjectPanelProps = {
    active: boolean;
    object: InteractiveObjectType;
};

export function ObjectPanel({ active, object }: ObjectPanelProps) {
    const [isVisible, setIsVisible] = useState<boolean>(false);
    // const [dialogName, setDialogName] = useState<string>("start");
    const [currentLine, setCurrentLine] = useState<Subtitle | null>(null);
    const dialogBoxRef = useRef<HTMLDivElement>(null);
    const clipRef = useRef<HTMLDivElement>(null);
    const lineRef = useRef<HTMLDivElement>(null);
    const { contextSafe } = useGSAP({ scope: clipRef });
    const [animationDelay, setAnimationDelay] = useState<number>(0);

    useEffect(() => {
        if (!active) return;
        console.log("ObjectPanel active", object);
        setCurrentLine(object?.subtitle || null);
        eventEmitterInstance.trigger("playSound", [object?.subtitle?.audio || ""]);
        if (object?.subtitle) {
            const delay = object.subtitle.duration
                ? (object.subtitle.duration * 1000) / object.subtitle.text.length
                : 500;
            setAnimationDelay(delay);
        }
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.key === "Enter") {
                eventEmitterInstance.trigger("showInteractiveObjectControls", [false]);
            }
        };

        document.addEventListener("keydown", handleKeyPress);

        return () => {
            document.removeEventListener("keydown", handleKeyPress);
        };
    }, [active]);

    const close = contextSafe(() => {
        const tl = gsap.timeline({ defaults: { duration: 0.5 } });
        tl.to(lineRef.current, {
            clipPath: "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)",
            duration: 0.5,
            ease: "power1.inOut",
        });
    });

    const open = contextSafe(() => {
        const tl = gsap.timeline({ defaults: { duration: 0.5 } });
        tl.to(lineRef.current, {
            clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
            duration: 0.5,
            delay: 0.5,
            ease: "expo.out",
        });
    });

    useEffect(() => {
        if (active) {
            open();
            setIsVisible(true);
        } else {
            close();
            setIsVisible(false);
        }
    }, [active]);

    return (
        <div id="object">
            <section className={`object-container ${isVisible ? "" : "cliped"}`} ref={clipRef}>
                <div className="object-text-container">
                    <div className="object-box" ref={dialogBoxRef}>
                        <div className="object-line-wrapper">
                            {/* {currentLine && ( */}
                            <div className="line">
                                <p className="line-name" ref={lineRef}>
                                    [CHARLIE]
                                </p>
                                <p className="line-text">
                                    {currentLine &&
                                        currentLine.text.split("").map((letter, index) => {
                                            return (
                                                <span
                                                    className="letter"
                                                    key={index + letter + isVisible.toString()}
                                                    style={{
                                                        animationDelay:
                                                            500 + index * animationDelay + "ms",
                                                    }}
                                                >
                                                    {letter}
                                                </span>
                                            );
                                        })}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );

    // return (
    //     <div className={"object-panel " + (active && "active")}>
    //         <div>
    //             Franchement, là j'dirai pas non à ptit verre. Mais faut que j'me tienne à carreau.
    //             Pas question d'retomber.
    //         </div>
    //     </div>
    // );
}
