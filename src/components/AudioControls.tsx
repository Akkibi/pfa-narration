import { useEffect, useRef, useState } from "react";
import * as Tone from "tone";
import "./style.css";

type AudioControlsProps = {
    playerRef: React.RefObject<Tone.Player | null>;
};

export function AudioControls({ playerRef }: AudioControlsProps) {
    const [isAudioPlaying, setIsAudioPlaying] = useState<boolean | null>(null);
    const mouseRef = useRef<HTMLDivElement>(null);

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

    return isAudioPlaying === null ? (
        <div ref={mouseRef} className="move">
            click to play soundtrack
        </div>
    ) : (
        <button
            className="audio-wave-button"
            tabIndex={-1}
            onClick={() => (isAudioPlaying ? stopAudio() : startAudio())}
        >
            {isAudioPlaying ? (
                <img src="/images/audio_wave.gif" className="audio-wave-playing" alt="audio_wave" />
            ) : (
                <div className="audio-wave-not-playing">
                    <div />
                </div>
            )}
        </button>
    );
}
