import { useEffect, useState } from "react";
import "./style.css";
import { eventEmitterInstance } from "../utils/eventEmitter";
import { DialogDataType } from "../data/dialogData";
import { InteractiveObject } from "../game/InteractiveObject";
import { ObjectPanel } from "./game/objectPanel";
import Dialog from "./game/dialog";
import { InteractiveObjectType } from "../data/objectsData";

const UiElements = () => {
    const [isObjectActive, setIsObjectActive] = useState<boolean>(false);
    const [showDialog, setShowDialog] = useState<boolean>(false);
    const [dialogData, setDialogData] = useState<DialogDataType | null>(null);
    const [objectShown, setObjectShown] = useState<InteractiveObjectType | undefined>(undefined);

    useEffect(() => {
        eventEmitterInstance.on("showInteractiveObjectControls", (status: boolean) => {
            setIsObjectActive(status);
        });

        eventEmitterInstance.on("toggleInteractiveObjectPanel", (obj: InteractiveObjectType) => {
            setObjectShown(obj);
        });
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
        <div className="scene" style={{ zIndex: 10 }}>
            {/* <section className="square">square</section> */}
            {isObjectActive && !showDialog && (
                <>
                    {objectShown !== undefined && (
                        <ObjectPanel active={objectShown !== undefined} object={objectShown} />
                    )}
                    <div className="object-interact">
                        Press <img src="/images/keys/E.png" alt="E" /> to{" "}
                        {!objectShown ? "interact" : "close"}
                    </div>
                </>
            )}
            <Dialog currentDialogData={dialogData} showDialog={showDialog} />
        </div>
    );
};

export default UiElements;
