import { useEffect, useState } from "react";
import "./style.css";
import { eventEmitterInstance } from "../utils/eventEmitter";
import { DialogDataType } from "../data/dialogData";
import Dialog from "./dialog";
import { ObjectPanel } from "./objectPanel";
import { InteractiveObject } from "../game/InteractiveObject";

const UiElements = () => {
    const [isObjectActive, setIsObjectActive] = useState<boolean>(false);
    const [showDialog, setShowDialog] = useState<boolean>(false);
    const [dialogData, setDialogData] = useState<DialogDataType | null>(null);
    const [objectShown, setObjectShown] = useState<InteractiveObject | undefined>(undefined);

    useEffect(() => {
        eventEmitterInstance.on(
            "showInteractiveObjectControls",
            (status: boolean) => {
                setIsObjectActive(status);
            },
        );

        eventEmitterInstance.on(
            "toggleInteractiveObjectPanel",
            (obj: InteractiveObject) => {
                setObjectShown(obj);
            }
        )
        eventEmitterInstance.on("showInteractiveObjectControls", (status: boolean) => {
            setIsObjectActive(status);
        });
        eventEmitterInstance.on("openDialog", (data: DialogDataType) => {
            setShowDialog(true);
            setDialogData(data);
            console.log(data);
        });
        eventEmitterInstance.on("closeDialog", () => {
            setShowDialog(false);
        });
    }, []);

    return (
        <div className="scene ui-elements">
            <h1 className="title">UiElements</h1>
            <button
                className="btn-test"
                onClick={() => {
                    eventEmitterInstance.trigger("scene-change", [2]);
                }}
            >
                button test
            </button>
            {isObjectActive && (
                <>
                    <ObjectPanel active={objectShown !== undefined} />
                    <div className="object-interact">
                        Press <img src="/images/keys/E.png" alt="E" /> to {!objectShown ? "interact" : "close"}
                    </div>
                </>
            )}
            {isObjectActive && !showDialog && (
                <Dialog currentDialogData={dialogData} showDialog={showDialog} />
            )}
        </div>
    );
};

export default UiElements;
