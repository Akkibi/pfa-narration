import { useCallback, useEffect, useRef, useState } from "react";
import type { DialogDataType } from "../../data/dialogData";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import "./style.css";
import { eventEmitterInstance } from "../../utils/eventEmitter";
import { playVoice, preloadVoices, releaseVoices, stopVoice } from "../../utils/voice";
import SkipButton from "../SkipButton";

gsap.registerPlugin(useGSAP);

const BOX_OPEN_MS = 500;
const READ_LETTER_MS = 40;

interface DialogProps {
    currentDialogData: DialogDataType | null;
    showDialog: boolean;
}

interface Line {
    name: string;
    text: string;
    next?: string;
    options?: Array<{
        text: string;
        to: string;
    }>;
}

const Dialog = ({ currentDialogData, showDialog }: DialogProps) => {
    const [currentLine, setCurrentLine] = useState<Line | null>(null);
    const [lineId, setLineId] = useState(0);
    const [isVisible, setIsVisible] = useState<boolean>(false);
    const [letterDelay, setLetterDelay] = useState<number | null>(null);
    const [isLinePlaying, setIsLinePlaying] = useState<boolean>(false);
    const [activeButton, setActiveButton] = useState<number>(0);
    const dialogBoxRef = useRef<HTMLDivElement>(null);
    const clipRef = useRef<HTMLDivElement>(null);
    const lineRef = useRef<HTMLDivElement>(null);
    const startTimerRef = useRef<number | undefined>(undefined);
    const inputReadyRef = useRef(false);
    const { contextSafe } = useGSAP({ scope: clipRef });

    const showLine = useCallback(
        (name: string) => {
            const dialog = currentDialogData?.dialogs[name];
            if (!currentDialogData || !dialog) return;
            const done = currentDialogData.done;
            const line: Line = done
                ? { name: currentDialogData.name, text: currentDialogData.fallback }
                : {
                      name: dialog.isCharlie ? "Charlie" : currentDialogData.name,
                      text: dialog.text,
                      next: dialog.next,
                      options: dialog.options,
                  };
            stopVoice();
            clearTimeout(startTimerRef.current);
            inputReadyRef.current = false;
            setCurrentLine(line);
            setLineId((id) => id + 1);
            setLetterDelay(null);
            setIsLinePlaying(true);
            setActiveButton(0);

            const fallbackSeconds = !done && dialog.duration ? dialog.duration : 0;
            const startText = (seconds: number) => {
                const duration = seconds || fallbackSeconds;
                setLetterDelay(duration ? (duration * 1000) / line.text.length : READ_LETTER_MS);
            };
            startTimerRef.current = window.setTimeout(() => {
                if (!done && dialog.audio) playVoice(dialog.audio, startText);
                else startText(0);
            }, BOX_OPEN_MS);
        },
        [currentDialogData],
    );

    const revealLine = () => {
        stopVoice();
        clearTimeout(startTimerRef.current);
        setLetterDelay(0);
        setIsLinePlaying(false);
    };

    const close = contextSafe(() => {
        const tl = gsap.timeline({ defaults: { duration: 0.5 } });
        tl.to(lineRef.current, {
            clipPath: "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)",
            duration: 0.5,
            ease: "power1.inOut",
        });
    });

    const reOpen = contextSafe((dialog: string) => {
        inputReadyRef.current = false;
        const tl = gsap.timeline({
            defaults: { duration: 0.5 },
            onStart: () => {
                setIsVisible(false);
            },
        });
        tl.to(lineRef.current, {
            clipPath: "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)",
            duration: 0.5,
            ease: "expo.out",
            onComplete: () => {
                showLine(dialog);
                setIsVisible(true);
            },
        })
            .to(lineRef.current, {
                clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
                duration: 0.5,
                delay: 0.5,
                ease: "expo.out",
            })
            .progress(0)
            .play();
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

    const advance = (index: number) => {
        if (!inputReadyRef.current || !currentLine) return;
        const target = currentLine.options?.[index]?.to ?? currentLine.next;
        if (target) {
            reOpen(target);
        } else {
            inputReadyRef.current = false;
            eventEmitterInstance.trigger("closeDialog");
            if (currentDialogData) currentDialogData.done = true;
        }
    };

    useEffect(() => {
        if (!showDialog) return;
        const buttonCount = currentLine?.options?.length || 1;
        const handleKeyPress = (e: KeyboardEvent) => {
            if (isLinePlaying && e.key === "Enter" && !e.repeat) revealLine();
            if (!inputReadyRef.current) return;
            if (e.key === "ArrowUp" || e.key === "w" || e.key === "z") {
                setActiveButton((activeButton + 1) % buttonCount);
            } else if (e.key === "ArrowDown" || e.key === "s") {
                setActiveButton(Math.abs(activeButton - 1) % buttonCount);
            } else if (e.key === "Enter" && !e.repeat) {
                advance(activeButton);
            }
        };

        document.addEventListener("keydown", handleKeyPress);

        return () => {
            document.removeEventListener("keydown", handleKeyPress);
        };
    });

    useEffect(() => {
        if (showDialog && currentDialogData) {
            if (!currentDialogData.done) {
                preloadVoices(
                    Object.values(currentDialogData.dialogs).flatMap((d) => d.audio ?? []),
                );
            }
            open();
            setIsVisible(true);
            showLine("start");
        } else {
            close();
            setIsVisible(false);
            setIsLinePlaying(false);
            inputReadyRef.current = false;
            clearTimeout(startTimerRef.current);
            releaseVoices();
        }
    }, [showDialog, currentDialogData, showLine]);

    useEffect(
        () => () => {
            clearTimeout(startTimerRef.current);
            releaseVoices();
        },
        [],
    );

    return (
        <div id="dialog">
            {showDialog && isLinePlaying && <SkipButton onSkip={revealLine} />}
            <section className={`dialog-container ${isVisible ? "" : "cliped"}`} ref={clipRef}>
                <div className="profile-pic-container">
                    <div
                        className="profile-pic"
                        style={{
                            background: `center / contain no-repeat url(/characters/images_dialogues/${currentLine && currentLine.name.toLowerCase()}.webp)`,
                        }}
                    ></div>
                </div>
                <div className="dialog-text-container">
                    <div className="dialog-box" ref={dialogBoxRef}>
                        <div className="line-wrapper">
                            {/* {currentLine && ( */}
                            <div className="line">
                                <p className="line-name" ref={lineRef}>
                                    [{currentLine && currentLine.name}]
                                </p>
                                <p className="line-text" key={lineId}>
                                    {currentLine &&
                                        letterDelay !== null &&
                                        currentLine.text.split("").map((letter, index) => (
                                            <span
                                                className="letter"
                                                key={index}
                                                style={{
                                                    animationDelay: index * letterDelay + "ms",
                                                }}
                                            >
                                                {letter}
                                            </span>
                                        ))}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div
                        className="options-container"
                        key={`${lineId}-${letterDelay !== null}`}
                        style={
                            isVisible && currentLine && letterDelay !== null
                                ? { animationDelay: currentLine.text.length * letterDelay + "ms" }
                                : { animationName: "none" }
                        }
                        onAnimationStart={(e) => {
                            if (e.target !== e.currentTarget) return;
                            inputReadyRef.current = true;
                            setIsLinePlaying(false);
                        }}
                    >
                        {currentLine?.options?.length ? (
                            currentLine.options.map((option, index) => (
                                <button
                                    className={`dialog-button ${activeButton === index ? "active-button" : ""}`}
                                    key={option.text}
                                    onClick={() => advance(index)}
                                >
                                    {activeButton === index ? (
                                        <img
                                            src="/images/arrow.webp"
                                            className="active-button-indicator"
                                        />
                                    ) : (
                                        <div className="active-button-indicator" />
                                    )}
                                    <span>{option.text}</span>
                                </button>
                            ))
                        ) : (
                            <button
                                className={`dialog-button active-button`}
                                onClick={() => advance(0)}
                            >
                                <img src="/images/arrow.webp" className="active-button-indicator" />
                                <span>{currentLine?.next ? "Next" : "Leave Dialog"}</span>
                            </button>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Dialog;
