import { useEffect, useRef, useState } from "react";
import "./style.css";
import { eventEmitterInstance } from "../utils/eventEmitter";

const UiElements = () => {
    const testButtonRef = useRef<HTMLButtonElement>(null);
    const [isObjectActive, setIsObjectActive] = useState<boolean>(false);

    useEffect(() => {
        eventEmitterInstance.on(
            "showInteractiveObjectControls",
            (status: boolean) => {
                setIsObjectActive(status);
            },
        );
    }, []);

    return (
        <div className="scene ui-elements">
            <h1 className="title">UiElements</h1>
            <button
                className="btn-test"
                onClick={() => {
                    console.log("button clicked");
                    eventEmitterInstance.trigger("scene-change", [2]);
                }}
                ref={testButtonRef}
            >
        button test
            </button>
            {isObjectActive && (
                <div className="object-interact">
          Press <img src="/images/keys/E.png" alt="E" /> to interact
                </div>
            )}
        </div>
    );
};

export default UiElements;
