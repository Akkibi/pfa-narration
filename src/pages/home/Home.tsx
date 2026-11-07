import { useEffect, useState } from "react";
import Credits from "./Credits";
import "./style.css";
import { eventEmitterInstance } from "../../utils/eventEmitter";

type HomeProps = { progress: number; ready: boolean };

export default function Home({ progress, ready }: HomeProps) {
    const [isCredits, setIsCredits] = useState(false);

    useEffect(() => {
        eventEmitterInstance.trigger("playSound", ["hub"]);
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
                        poster="/images/home-poster.webp"
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
                            <img src="/images/logo.webp" alt="logo" className="logo" />
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    // setPage("intro_prison");
                                    eventEmitterInstance.trigger("scene-change-ui", [
                                        "intro_prison",
                                    ]);
                                }}
                                className="button"
                                disabled={!ready}
                            >
                                <img src="/images/arrow.webp" className="active-button-indicator" />
                                enter
                            </button>
                            <div
                                className={"home-loader" + (ready ? " done" : "")}
                                role="progressbar"
                                aria-label="Loading the game"
                                aria-valuemin={0}
                                aria-valuemax={100}
                                aria-valuenow={Math.round(progress * 100)}
                            >
                                <div
                                    className="home-loader-fill"
                                    style={{ transform: `scaleX(${progress})` }}
                                />
                            </div>
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
