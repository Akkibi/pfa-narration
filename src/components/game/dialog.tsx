import { useEffect, useRef, useState } from "react";
import { DialogDataType } from "../../data/dialogData";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import "./style.css";
import { eventEmitterInstance } from "../../utils/eventEmitter";

gsap.registerPlugin(useGSAP);

interface DialogProps {
    currentDialogData: DialogDataType | null;
    showDialog: boolean;
}

const dialogData = {
    textSpeed: 30,
};

interface line {
    name: string;
    text: string;
    audio?: string;
    next?: string;
    options?: Array<{
        text: string;
        to: string;
    }>;
}

const Dialog = ({ currentDialogData, showDialog }: DialogProps) => {
    const [currentLine, setCurrentLine] = useState<line | null>(null);
    const [isVisible, setIsVisible] = useState<boolean>(false);
    const [dialogName, setDialogName] = useState<string>("start");
    const dialogBoxRef = useRef<HTMLDivElement>(null);
    const clipRef = useRef<HTMLDivElement>(null);
    const lineRef = useRef<HTMLDivElement>(null);
    const { contextSafe } = useGSAP({ scope: clipRef });
    const [activeButton, setActiveButton] = useState<number>(0);
    const [letterAnimationDelay, setLetterAnimationDelay] = useState<number>(0);
    const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

    const close = contextSafe(() => {
        const tl = gsap.timeline({ defaults: { duration: 0.5 } });
        tl.to(lineRef.current, {
            clipPath: "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)",
            duration: 0.5,
            ease: "power1.inOut",
        })
    });

    useEffect(() => {
        if (!showDialog) return;
        const handleKeyPress = (e: KeyboardEvent) => {
            let buttonCount = currentDialogData?.dialogs[dialogName].options?.length;
            if (!buttonCount) buttonCount = 1;
            if (e.key === "ArrowUp" || e.key === "w" || e.key === "z") {
                setActiveButton((activeButton + 1) % buttonCount);
            } else if (e.key === "ArrowDown" || e.key === "s") {
                setActiveButton(Math.abs(activeButton - 1) % buttonCount);
            } else if (e.key === "Enter") {
                const button = currentDialogData?.dialogs[dialogName].options?.[activeButton];
                if (button) {
                    reOpen(button.to);
                } else if (currentDialogData?.dialogs[dialogName].next) {
                    reOpen(currentDialogData.dialogs[dialogName].next);
                } else {
                    eventEmitterInstance.trigger("closeDialog");
                    if (currentDialogData) currentDialogData.done = true;
                }
            }
            console.log("activeButton", activeButton);
        };

        document.addEventListener("keydown", handleKeyPress);

        return () => {
            document.removeEventListener("keydown", handleKeyPress);
        };
    }, [currentDialogData, dialogName, activeButton, showDialog]);

    useEffect(() => {
        console.log("isVisible", isVisible);
    }, [isVisible]);

    const reOpen = contextSafe((dialog: string) => {
        const tl = gsap.timeline({
            defaults: { duration: 0.5 },
            onStart: () => {
                setIsVisible(false);
                console.log("start");
            },
        });
        tl.to(lineRef.current, {
            clipPath: "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)",
            duration: 0.5,
            ease: "expo.out",
            onComplete: () => {
                setDialogName(dialog);
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

    useEffect(() => {
        if (showDialog) {
            open();
            setIsVisible(true);
        } else {
            close();
            setIsVisible(false);
        }
    }, [showDialog]);

    useEffect(() => {
        if (showDialog) {
            const dialog = currentDialogData?.dialogs[dialogName];
            if (!dialog) return;
            const line = {
                name: dialog.isCharlie ? "Charlie" : currentDialogData.name,
                text: currentDialogData.done ? currentDialogData.fallback : dialog.text,
                next: dialog.next,
                options: dialog.options,
            };
            setCurrentLine(line);
            const delay = dialog.duration ? (dialog.duration * 1000) / dialog.text.length : 500;
            setLetterAnimationDelay(delay);
            if (!currentDialogData.done) eventEmitterInstance.trigger("playSound", [dialog.audio]);
        }
    }, [showDialog, currentDialogData, dialogName]);

    useGSAP(() => {
        if (currentDialogData) {
            setDialogName("start");
            setCurrentLine(null);
        }
    }, [currentDialogData]);

    console.log(
        currentLine && 500 + currentLine.text.split("").length * dialogData.textSpeed + "ms",
    );

    return (
        <div id="dialog">
            <section className={`dialog-container ${isVisible ? "" : "cliped"}`} ref={clipRef}>
                <div className="profile-pic-container">
                    <div
                        className="profile-pic"
                        style={{
                            background: `center / contain no-repeat url(/characters/${currentLine && currentLine.name.toLowerCase()}.png)`,
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
                                <p className="line-text">
                                    {currentLine &&
                                        currentLine.text.split("").map((letter, index) => {
                                            return (
                                                <span
                                                    className="letter"
                                                    key={index + letter + isVisible.toString()}
                                                    style={{
                                                        animationDelay:
                                                            500 +
                                                            index * letterAnimationDelay +
                                                            "ms",
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
                    <div
                        className="options-container"
                        key={isVisible.toString()}
                        style={
                            isVisible
                                ? {
                                      animationDelay: currentLine
                                          ? 500 +
                                            currentLine.text.split("").length *
                                                letterAnimationDelay +
                                            "ms"
                                          : "500ms",
                                  }
                                : {
                                      opacity: 0,
                                  }
                        }
                    >
                        {currentDialogData && currentDialogData.dialogs[dialogName].options ? (
                            currentDialogData.dialogs[dialogName].options.length > 0 &&
                            currentDialogData.dialogs[dialogName].options?.map((option, index) => {
                                return (
                                    <button
                                        className={`dialog-button ${activeButton === index ? "active-button" : ""}`}
                                        key={option.text[0]}
                                        onClick={() => {
                                            reOpen(option.to);
                                        }}
                                    >
                                        {activeButton === index ? (
                                            <img
                                                src="/images/arrow.png"
                                                className="active-button-indicator"
                                            />
                                        ) : (
                                            <div className="active-button-indicator" />
                                        )}
                                        <span>{option.text}</span>
                                    </button>
                                );
                            })
                        ) : currentDialogData && currentDialogData.dialogs[dialogName].next ? (
                            <button
                                className={`dialog-button ${activeButton === 0 ? "active-button" : ""}`}
                                onClick={() => {
                                    reOpen(currentDialogData.dialogs[dialogName].next ?? "start");
                                }}
                            >
                                <img src="/images/arrow.png" className="active-button-indicator" />
                                <span>Next</span>
                            </button>
                        ) : (
                            <button
                                className={`dialog-button ${activeButton === 0 ? "active-button" : ""}`}
                                onClick={() => {
                                    eventEmitterInstance.trigger("closeDialog");
                                    if (currentDialogData) currentDialogData.done = true;
                                }}
                            >
                                <img src="/images/arrow.png" className="active-button-indicator" />
                                <span>Leave Dialog</span>
                            </button>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Dialog;
