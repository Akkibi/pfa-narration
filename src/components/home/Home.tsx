import { useState } from "react";
import Credits from "./Credits";
import "./style.css";

type HomeProps = {
    setStatus: (index: number) => void;
};

export default function Home({ setStatus }: HomeProps) {
    const [isCredits, setIsCredits] = useState(false);

    return (
        <>
            <div className="home">
                <div
                    style={{
                        position: "fixed",
                        width: "100%",
                        height: "100%",
                        zIndex: -1,
                    }}
                >
                    <video
                        autoPlay
                        loop
                        playsInline
                        preload="none"
                        muted
                        style={{ width: "100%", height: "100%", objectFit: "fill" }}
                    >
                        <source src="/videos/intro.mp4" type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                </div>
                {isCredits === false && (
                    <>
                        <img src="/images/logo.png" alt="logo" className="logo" />
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                setStatus(2);
                            }}
                            className="button"
                        >
                            enter
                        </button>
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                setIsCredits(true);
                            }}
                            className="credits-button"
                        >
                            credits
                        </button>
                    </>
                )}
                {isCredits === true && (
                    <div className={"credits " + (isCredits && "active")}>
                        <Credits setIsCredits={setIsCredits} />
                    </div>
                )}
            </div>
        </>
    );
}
