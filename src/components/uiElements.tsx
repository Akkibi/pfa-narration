import { useEffect, useState } from "react";
import "./style.css";
import { eventEmitterInstance } from "../utils/eventEmitter";
import type { DialogDataType } from "../data/dialogData";
import { ObjectPanel } from "./game/objectPanel";
import Dialog from "./game/dialog";
import type { InteractiveObjectType } from "../data/objectsData";

const UiElements = () => {
    const [isObjectActive, setIsObjectActive] = useState<boolean>(false);
    const [showDialog, setShowDialog] = useState<boolean>(false);
    const [dialogData, setDialogData] = useState<DialogDataType | null>(null);
    const [objectShown, setObjectShown] = useState<InteractiveObjectType | undefined>(undefined);

    useEffect(() => {
        const handleControls = (status: boolean) => setIsObjectActive(status);
        const handlePanel = (obj: InteractiveObjectType) => setObjectShown(obj);
        const handleOpen = (data: DialogDataType) => {
            setShowDialog(true);
            setDialogData(data);
        };
        const handleClose = () => setShowDialog(false);

        eventEmitterInstance.on("showInteractiveObjectControls", handleControls);
        eventEmitterInstance.on("toggleInteractiveObjectPanel", handlePanel);
        eventEmitterInstance.on("openDialog", handleOpen);
        eventEmitterInstance.on("closeDialog", handleClose);

        return () => {
            eventEmitterInstance.off("showInteractiveObjectControls", handleControls);
            eventEmitterInstance.off("toggleInteractiveObjectPanel", handlePanel);
            eventEmitterInstance.off("openDialog", handleOpen);
            eventEmitterInstance.off("closeDialog", handleClose);
        };
    }, []);

    return (
        <div className="scene" style={{ zIndex: 10 }}>
            {/* <section className="square">square</section> */}
            {isObjectActive && !showDialog && (
                <>
                    {objectShown !== undefined && (
                        <ObjectPanel active={objectShown !== undefined} object={objectShown} />
                    )}
                    <div className="object-interact">
                        Press <img src="/images/keys/E.webp" alt="E" /> to{" "}
                        {!objectShown ? "interact" : "close"}
                    </div>
                </>
            )}
            <Dialog currentDialogData={dialogData} showDialog={showDialog} />
        </div>
    );
};

export default UiElements;
