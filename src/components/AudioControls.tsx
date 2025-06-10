import { useEffect, useRef, useState } from "react";
import * as Tone from "tone";
import "./style.css";
import { eventEmitterInstance } from "../utils/eventEmitter";
import { AudioData } from "../data/audio";

type ActivePlayer = {
    name: string;
    player: Tone.Player;
};

type AudioControlsProps = {
    playerRef: React.RefObject<Tone.Player | null>;
};

export function AudioControls({ playerRef }: AudioControlsProps) {
    const [isMute, setIsMute] = useState(false);
    const [isToneStarted, setIsToneStarted] = useState(false);
    const activePlayersRef = useRef<ActivePlayer[]>([]);
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

        const handleClick = async () => {
            await Tone.start();
            setIsToneStarted(true);
            document.removeEventListener("mousemove", handleMouseMove);
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("click", handleClick, { once: true });

        eventEmitterInstance.on(`playSound`, (name: string, volume?: number) =>
            toggleSound(name, volume),
        );
    }, []);

    const toggleSound = (soundName: string, volume?: number) => {
        const sound = AudioData.find((a) => a.name === soundName);

        if (sound) {
            const buffer = new Tone.ToneAudioBuffer(sound.src, () => {
                if (!activePlayersRef.current.find((p) => p.name === soundName)) {
                    const player = new Tone.Player({ url: buffer }).toDestination();

                    player.loop = sound.loop ?? false;
                    player.volume.value = volume ?? sound.volume ?? 0;

                    if (!player) return;

                    player.fadeIn = sound.fadeIn ?? 0;
                    player.mute = isMute;

                    player.start();

                    const newPlayer = {
                        name: soundName,
                        player,
                    };

                    player.onstop = () => {
                        activePlayersRef.current = activePlayersRef.current.filter(
                            (p) => p.name !== soundName,
                        );
                    };

                    activePlayersRef.current.push(newPlayer);
                }
            });
        } else {
            console.error(`Impossible to play sound: ${soundName}`);
        }
    };

    const toggleMuteAudio = () => {
        if (activePlayersRef.current.length === 0) return;

        if (!isMute) {
            activePlayersRef.current.forEach((p) => (p.player.mute = true));
        } else {
            activePlayersRef.current.forEach((p) => (p.player.mute = false));
        }

        setIsMute(!isMute);
    };

    return isToneStarted === false ? (
        <div ref={mouseRef} className="move">
            click to play soundtrack
        </div>
    ) : (
        <div id="audio-controls">
            <button className="audio-wave-button" tabIndex={-1} onClick={() => toggleMuteAudio()}>
                {!isMute ? (
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
        </div>
    );
}
