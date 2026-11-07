import { createPortal } from "react-dom";
import "./settings.css";

// Portalled because pages sit under the UI layer, and over the white fade of a transition.
export default function SkipButton({ onSkip }: { onSkip: () => void }) {
    return createPortal(
        <button type="button" className="skip-button" onClick={onSkip}>
            Skip
        </button>,
        document.body,
    );
}
