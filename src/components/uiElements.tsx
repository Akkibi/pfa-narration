import { useRef } from "react";
import "./style.css";
import { eventEmitterInstance } from "../utils/eventEmitter";

const UiElements = () => {
    const testButtonRef = useRef<HTMLButtonElement>(null);

    return (
        <div className="scene ui-elements">
            <h1 className="title">UiElements</h1>
            <button
                className="btn-test"
                onClick={() => {
                    console.log("button clicked");
                    eventEmitterInstance.trigger("nextScene");
                }}
                ref={testButtonRef}
            >
                button test
            </button>
        </div>
    );
};

export default UiElements;
