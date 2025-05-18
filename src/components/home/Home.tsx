import { useEffect, useRef, useState } from "react";
import Credits from "./Credits";
import "./style.css";
// Causes warning only by being imported
import * as Tone from "tone";

type HomeProps = {
    setStatus: (index: number) => void;
};

export default function Home({ setStatus }: HomeProps) {
    const [isCredits, setIsCredits] = useState(false);
    const [isAudioPlaying, setIsAudioPlaying] = useState<boolean | null>(null);
    const mouseRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<Tone.Player>(null);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const { clientX, clientY } = e;

            if (mouseRef.current !== null) {
                mouseRef.current.animate(
                    {
                        left: `${clientX}px`,
                        top: `${clientY}px`,
                    },
                    { duration: 1000, fill: "forwards" },
                );
            }
        };

        const handleClick = () => {
            startAudio();
            document.removeEventListener("mousemove", handleMouseMove);
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("click", handleClick, { once: true });
    }, []);

    const startAudio = async () => {
        console.log("startAudio");
        if (isAudioPlaying === null) {
            await Tone.start();

            playerRef.current = new Tone.Player("/sounds/soundtrack/home.wav").toDestination();
            playerRef.current.autostart = true;
            playerRef.current.loop = true;
        } else {
            const player = playerRef.current;
            if (player && player.mute) {
                player.mute = false;
            }
        }
        setIsAudioPlaying(true);
    };

    const stopAudio = async () => {
        const player = playerRef.current;

        if (player && player.state === "started" && !player.mute) {
            player.mute = true;
            setIsAudioPlaying(false);
        }
    };

    return (
        <>
            {isAudioPlaying === null ? (
                <div ref={mouseRef} className="move">
                    click to play soundtrack
                </div>
            ) : (
                <button
                    className="audio-wave-button"
                    onClick={() => (isAudioPlaying ? stopAudio() : startAudio())}
                >
                    {isAudioPlaying ? (
                        <img
                            src="/images/audio_wave.gif"
                            className="audio-wave-playing"
                            alt="audio_wave"
                        />
                    ) : (
                        <div className="audio-wave-not-playing">
                            <div />
                        </div>
                    )}
                </button>
            )}
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
                        <button onClick={() => setStatus(2)} className="button">
                            enter
                        </button>
                        <button onClick={() => setIsCredits(true)} className="credits-button">
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
