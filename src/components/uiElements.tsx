import { useEffect, useRef, useState } from "react";
import "./style.css";
import { eventEmitterInstance } from "../utils/eventEmitter";
import { ObjectPanel } from "./objectPanel";
import { InteractiveObject } from "../game/InteractiveObject";

const UiElements = () => {
    const testButtonRef = useRef<HTMLButtonElement>(null);
    const [isObjectActive, setIsObjectActive] = useState<boolean>(false);
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
    }, []);

    return (
        <div className="scene ui-elements">
            <h1 className="title">UiElements</h1>
            <button
                className="btn-test"
                onClick={() => {
                    eventEmitterInstance.trigger("scene-change", [2]);
                }}
                ref={testButtonRef}
            >
                button test
            </button>
            <ObjectPanel active={objectShown !== undefined} />
            {isObjectActive && (
                <div className="object-interact">
                    Press <img src="/images/keys/E.png" alt="E" /> to {!objectShown ? "interact" : "close"}
                </div>
            )}
        </div>
    );
};

export default UiElements;
