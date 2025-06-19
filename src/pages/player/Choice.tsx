import { useEffect, useRef, useState } from "react";
import "./style.css";

type Choice = "yes" | "no";

type ChoiceProps = {
    onChoice: (choice: Choice) => void;
};

export default function Choice({ onChoice }: ChoiceProps) {
    const choiceRef = useRef<Choice>("yes");
    const onChoiceRef = useRef(onChoice);

    // keep the latest callback in a ref
    useEffect(() => {
        onChoiceRef.current = onChoice;
    }, [onChoice]);

    const [selected, setSelected] = useState<Choice>("yes");

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                e.preventDefault();
                choiceRef.current = choiceRef.current === "yes" ? "no" : "yes";
                setSelected(choiceRef.current);
            } else if (e.key === "Enter") {
                e.preventDefault();
                onChoiceRef.current(choiceRef.current);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    return (
        <div
            style={{
                position: "fixed",
                width: "100%",
                height: "100%",
                zIndex: 1000,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <div style={{ width: "100%", textAlign: "center" }}>
                <div style={{ marginBottom: "16px", textAlign: "center", fontSize: "40px" }}>
                    Souhaitez vous réapparaître?
                </div>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: "8px",
                        marginRight: "64px",
                    }}
                >
                    <img
                        src="/images/arrow.png"
                        style={{ marginRight: "8px", opacity: selected === "yes" ? 1 : 0 }}
                        className="active-button-indicator"
                    />
                    <span
                        style={{
                            textAlign: "center",
                            fontSize: "30px",
                            fontWeight: selected === "yes" ? 600 : 400,
                        }}
                    >
                        Oui
                    </span>
                </div>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "30px",
                        marginRight: "64px",
                    }}
                >
                    <img
                        src="/images/arrow.png"
                        style={{
                            marginRight: "8px",
                            opacity: selected === "no" ? 1 : 0,
                        }}
                        className="active-button-indicator"
                    />

                    <span
                        style={{ textAlign: "center", fontWeight: selected === "no" ? 600 : 400 }}
                    >
                        Non
                    </span>
                </div>
            </div>
        </div>
    );
}
