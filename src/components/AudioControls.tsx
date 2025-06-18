import { useEffect, useRef, useState } from "react";
import { Howl } from "howler";
import "./style.css";
import { eventEmitterInstance } from "../utils/eventEmitter";
import { AudioData } from "../data/audioData";

type ActivePlayer = {
    name: string;
    player: Howl;
};

export function AudioControls() {
    const isMuteRef = useRef<boolean>(false);
    const [isHowlerReady, setIsHowlerReady] = useState(false);
    const activePlayersRef = useRef<ActivePlayer[]>([]);
    const mouseRef = useRef<HTMLDivElement>(null);
    const [isMute, setIsMute] = useState(false);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const { clientX, clientY } = e;
            if (mouseRef.current) {
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
            setIsHowlerReady(true);
            console.log("Howler ready");
            document.removeEventListener("mousemove", handleMouseMove);
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("click", handleClick, { once: true });

        eventEmitterInstance.on("playSound", (name: string, volume?: number) =>
            toggleSound(name, volume),
        );
        eventEmitterInstance.on("stopHowlers", (soundNames: string[]) => stopHowlers(soundNames));
    }, []);

    const toggleSound = (soundName: string, volume?: number) => {
        const sound = AudioData.find((a) => a.name === soundName);
        if (!sound) {
            console.error(`Impossible to play sound: ${soundName}`);
            return;
        }

        const existingPlayer = activePlayersRef.current.find((p) => p.name === soundName);

        if (existingPlayer) {
            if (existingPlayer.player.mute()) existingPlayer.player.mute(false);
            return;
        }

        const howl = new Howl({
            src: [sound.src],
            loop: sound.loop ?? false,
            volume: volume ?? sound.volume ?? 1,
            mute: isMuteRef.current,
            onend: () => {
                activePlayersRef.current = activePlayersRef.current.filter(
                    (p) => p.name !== soundName,
                );
            },
        });

        const startPlayback = () => {
            console.log("Playing sound:", soundName);
            howl.play();
            activePlayersRef.current.push({ name: soundName, player: howl });
        };

        if (sound.delay) {
            setTimeout(startPlayback, sound.delay);
        } else {
            startPlayback();
        }
    };

    const stopHowlers = (soundNames: string[]) => {
        console.log("Stopping sounds:", soundNames);
        soundNames.forEach((name) => {
            const player = activePlayersRef.current.find((p) => p.name.includes(name));
            if (player) {
                const currentVolume = player.player.volume();
                player.player.fade(currentVolume, 0, 1000); // Fade out over 1 second

                // Remove from active players after fade completes
                setTimeout(() => {
                    player.player.stop();
                    activePlayersRef.current = activePlayersRef.current.filter(
                        (p) => p.name !== name,
                    );
                    console.log(`Stopped sound after fade: ${name}`);
                }, 1000);
            }
        });
    };

    const toggleMuteAudio = () => {
        // Update mute state for existing players
        activePlayersRef.current.forEach(({ player }) => player.mute(!isMuteRef.current));
        // Update global mute state so new players will be created with this mute state
        isMuteRef.current = !isMuteRef.current;
        setIsMute(isMuteRef.current);
    };

    return (
        isHowlerReady && (
            <div id="audio-controls">
                <button className="audio-wave-button" tabIndex={-1} onClick={toggleMuteAudio}>
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
        )
    );
}
