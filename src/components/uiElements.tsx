import { useEffect, useState } from "react";
import "./style.css";
import { eventEmitterInstance } from "../utils/eventEmitter";
import { DialogDataType } from "../data/dialogData";
import Dialog from "./dialog";

const UiElements = () => {
    const [isObjectActive, setIsObjectActive] = useState<boolean>(false);
    const [showDialog, setShowDialog] = useState<boolean>(false);
    const [dialogData, setDialogData] = useState<DialogDataType | null>(null);
    useEffect(() => {
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
            {<Dialog currentDialogData={dialogData} showDialog={showDialog} />}
            {isObjectActive && !showDialog && (
                <div className="object-interact">
                    Press <img src="/images/keys/E.png" alt="E" /> to interact
                </div>
            )}
        </div>
    );
};

export default UiElements;
