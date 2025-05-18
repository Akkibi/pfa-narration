import { useEffect, useRef, useState } from "react";
import { DialogDataType } from "../../data/dialogData";
import { dialogData } from "../../data/dialogData";
import { eventEmitterInstance } from "../../utils/eventEmitter";

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
    const [currentLine, setCurrentLine] = useState<line | null>(null);
    const [dialogName, setDialogName] = useState<string>("start");
    const dialogBoxRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (currentDialogData) {
            setDialogName("start");
            setCurrentLine(null);
        }
    }, [currentDialogData]);

    useEffect(() => {
        if (currentDialogData) {
            console.log("currentDialogData.done", currentDialogData.done);
            setTimeout(() => {
                if (!currentDialogData.done) {
                    if (currentDialogData.dialogs[dialogName].charlie) {
                        const dialog: line = {
                            name: "Charlie",
                            text: currentDialogData.dialogs[dialogName].charlie ?? ["..."],
                            color: "#fff",
                        };
                        setCurrentLine(dialog);
                    }
                    if (currentDialogData.dialogs[dialogName].text) {
                        const dialog: line = {
                            name: currentDialogData.name,
                            text: currentDialogData.dialogs[dialogName].text ?? ["..."],
                            color: currentDialogData.color,
                        };
                        setCurrentLine(dialog);
                    }
                } else {
                    const dialog: line = {
                        name: currentDialogData.name,
                        text: currentDialogData.fallback,
                        color: currentDialogData.color,
                    };
                    setCurrentLine(dialog);
                }
            }, 1000);
        }
    }, [currentDialogData, dialogName, showDialog]);

    return (
        <section className={`dialog-container ${showDialog ? "" : "cliped"}`}>
            <div className="profile-pic-container">
                <p className="profile-pic-name">{currentDialogData?.name}</p>
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
                        {currentLine && (
                            <div className="line">
                                <p
                                    className="line-name"
                                    style={{ backgroundColor: currentLine.color }}
                                >
                                    [{currentLine.name}]
                                </p>
                                <p className="line-text">
                                    {currentLine.text.map((text, index) => {
                                        return (
                                            <span
                                                className="sentence"
                                                key={index}
                                                data-count={index + 1}
                                                style={{
                                                    animationDelay: index * 700 + "ms",
                                                }}
                                            >
                                                {text}
                                            </span>
                                        );
                                    })}
                                </p>
                            </div>
                        )}
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
                                            setCurrentLine({
                                                name: "Charlie",
                                                text: option.text ?? ["..."],
                                                color: "#fff",
                                            });
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
                                    setCurrentLine(null);
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
