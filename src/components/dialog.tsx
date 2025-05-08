import { useEffect, useRef, useState } from "react";
import { DialogDataType } from "../data/dialogData";
import { dialogData } from "../data/dialogData";
import { eventEmitterInstance } from "../utils/eventEmitter";

interface DialogProps {
    currentDialogData: DialogDataType | null;
    showDialog: boolean;
}

interface line {
    name: string;
    text: string[];
    color: string;
}

const Dialog = ({ currentDialogData, showDialog }: DialogProps) => {
    const [dialogHistory, setDialogHistory] = useState<line[]>([]);
    const [dialogName, setDialogName] = useState<string>("start");
    const dialogBoxRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (currentDialogData) {
            setDialogName("start");
            setDialogHistory([]);
            console.log("dialogName", dialogName);
        }
    }, [currentDialogData]);

    useEffect(() => {
        if (currentDialogData) {
            console.log("currentDialogData.done", currentDialogData.done);
            if (!currentDialogData.done) {
                if (currentDialogData.dialogs[dialogName].charlie) {
                    setTimeout(() => {
                        const dialog: line = {
                            name: "Charlie",
                            text: currentDialogData.dialogs[dialogName].charlie ?? ["..."],
                            color: "#fff",
                        };
                        setDialogHistory((array) => [...array, dialog]);
                    }, 400);
                }
                if (currentDialogData.dialogs[dialogName].text) {
                    setTimeout(() => {
                        const dialog: line = {
                            name: currentDialogData.name,
                            text: currentDialogData.dialogs[dialogName].text ?? ["..."],
                            color: currentDialogData.color,
                        };
                        setDialogHistory((array) => [...array, dialog]);
                    }, 400);
                }
            } else {
                setTimeout(() => {
                    const dialog: line = {
                        name: currentDialogData.name,
                        text: currentDialogData.fallback,
                        color: currentDialogData.color,
                    };
                    setDialogHistory([dialog]);
                    console.log("dialogHistory", dialogHistory);
                }, 400);
            }
        }
    }, [currentDialogData, dialogName, showDialog]);

    return (
        <section className={`dialog-container ${showDialog ? "" : "cliped"}`}>
            <div className="profile-pic-container">
                <div
                    className="profile-pic"
                    style={{
                        background: `center / contain no-repeat url(/characters/${currentDialogData?.name.toLowerCase()}.png)`,
                    }}
                ></div>
            </div>
            <div className="dialog-text-container">
                <div className="dialog-box" ref={dialogBoxRef}>
                    <div className="line-wrapper">
                        {dialogHistory.length > 0 &&
                            dialogHistory.map((line, lineIndex) => {
                                return (
                                    <div key={lineIndex} className="appear-height">
                                        <div className="line">
                                            <p
                                                className="line-name"
                                                style={{ backgroundColor: line.color }}
                                            >
                                                {line.name}
                                            </p>
                                            <p className="line-text">
                                                {line.text.map((text, index) => {
                                                    return (
                                                        <span
                                                            className="sentence"
                                                            key={index}
                                                            data-count={index + 1}
                                                            style={{
                                                                animationDelay: index * 1000 + "ms",
                                                            }}
                                                        >
                                                            {text}
                                                        </span>
                                                    );
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                </div>
                <div className="options-container">
                    {currentDialogData &&
                        !currentDialogData.done &&
                        currentDialogData.dialogs[dialogName].options &&
                        currentDialogData.dialogs[dialogName].options.length > 0 &&
                        currentDialogData.dialogs[dialogName].options?.map((option, index) => {
                            return (
                                <>
                                    <button
                                        className="dialog-button"
                                        key={index}
                                        onClick={() => {
                                            setDialogName(option.to);
                                            setDialogHistory((array) => [
                                                ...array,
                                                {
                                                    name: "Charlie",
                                                    text: option.text ?? ["..."],
                                                    color: "#fff",
                                                },
                                            ]);
                                        }}
                                    >
                                        {option.text}
                                    </button>
                                </>
                            );
                        })}
                    {((currentDialogData && currentDialogData.done) ||
                        (currentDialogData && !currentDialogData.dialogs[dialogName].options)) && (
                        <button
                            className="dialog-button"
                            onClick={() => {
                                if (dialogData[currentDialogData.name.toLowerCase()]) {
                                    dialogData[currentDialogData.name.toLowerCase()].done = true;
                                    console.log(dialogData[currentDialogData.name.toLowerCase()]);
                                    setDialogName("start");
                                    setDialogHistory([]);
                                    eventEmitterInstance.trigger("closeDialog");
                                }
                            }}
                        >
                            Leave Dialog
                        </button>
                    )}
                </div>
            </div>
        </section>
    );
};

export default Dialog;
