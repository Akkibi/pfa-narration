import { useEffect, useRef } from "react";
import "./style.css";
import { eventEmitterInstance } from "../utils/eventEmitter";

const UiElements = () => {
  const testButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!testButtonRef.current) return;
    testButtonRef.current.addEventListener("click", () => {
      eventEmitterInstance.trigger("testclick");
    });
  }, []);

  return (
    <div className="scene ui-elements">
      <h1 className="title">UiElements</h1>
      <button className="btn-test" ref={testButtonRef}>
        button test
      </button>
    </div>
  );
};

export default UiElements;
