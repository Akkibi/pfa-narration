import { createPortal } from "react-dom";
import "./settings.css";

export default function MenuButton({ onClick }: { onClick: () => void }) {
    return createPortal(
        <button type="button" className="menu-button" onClick={onClick}>
            Back to menu
        </button>,
        document.body,
    );
}
