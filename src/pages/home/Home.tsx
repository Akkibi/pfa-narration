import { useEffect, useState } from "react";
import Credits from "./Credits";
import "./style.css";
import { eventEmitterInstance } from "../../utils/eventEmitter";
import { Scenes } from "../../components/contexts/TransitionManager";

type HomeProps = {
    changePage: (page: Scenes) => void;
};

export default function Home({ changePage }: HomeProps) {
    const [isCredits, setIsCredits] = useState(false);

    useEffect(() => {
        eventEmitterInstance.trigger("playSound", ["soundtrack_0"]);
    }, []);

    return (
        <>
            <div className={"home"}>
                <div
                    style={{
                        position: "fixed",
                        width: "100vw",
                        height: "100vh",
                    }}
                >
                    <video
                        autoPlay
                        loop
                        playsInline
                        preload="none"
                        muted
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    >
                        <source src="/videos/home.mp4" type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                </div>
                <div
                    style={{
                        display: "flex",
                        flexDirection: "row",
                        height: "100%",
                        flex: 1,
                        width: "100%",
                    }}
                >
                    <div
                        style={{
                            position: "relative",
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-start",
                            justifyContent: "center",
                            width: "100%",
                            paddingLeft: "15%",
                        }}
                    >
                        <div className={"home-content " + (isCredits && "active")}>
                            <img src="/images/logo.png" alt="logo" className="logo" />
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    changePage("intro_prison");
                                }}
                                className="button"
                            >
                                <img src="/images/arrow.png" className="active-button-indicator" />
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
                        </div>

                        <div className={"credits " + (isCredits && "active")}>
                            <Credits setIsCredits={setIsCredits} />
                        </div>
                    </div>
                    <div style={{ flex: 1, width: "100%" }} />
                </div>
            </div>
        </>
    );
}
