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
    const [isMute, setIsMute] = useState(false);
    const [isHowlerReady, setIsHowlerReady] = useState(false);
    const activePlayersRef = useRef<ActivePlayer[]>([]);
    const mouseRef = useRef<HTMLDivElement>(null);

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
        eventEmitterInstance.on("toggleSoundtrack", () => toggleSoundtrack());
    }, []);

    const toggleSound = (soundName: string, volume?: number) => {
        const sound = AudioData.find((a) => a.name === soundName);
        if (!sound) {
            console.error(`Impossible to play sound: ${soundName}`);
            return;
        }

        // Prevent duplicate playbacks
        if (activePlayersRef.current.find((p) => p.name === soundName)) return;

        console.log("toggleSound", soundName, sound);

        const howl = new Howl({
            src: [sound.src],
            loop: sound.loop ?? false,
            volume: volume ?? sound.volume ?? 1,
            mute: isMute,
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

    const toggleSoundtrack = () => {
        console.log("Toggling soundtrack");
        const soundTrack = activePlayersRef.current.find((p) => p.name.includes("soundtrack"));
        if (!soundTrack) return;

        const currentVolume = soundTrack.player.volume();
        const targetVolume = currentVolume > 0.05 ? 0 : 1;

        soundTrack.player.fade(currentVolume, targetVolume, 1000);
        console.log(`Soundtrack ${targetVolume === 0 ? "faded out" : "faded in"}`);
    };

    const toggleMuteAudio = () => {
        // Update mute state for existing players
        activePlayersRef.current.forEach(({ player }) => player.mute(!isMute));
        // Update global mute state so new players will be created with this mute state
        setIsMute(!isMute);
    };

    return !isHowlerReady ? (
        <div ref={mouseRef} className="move">
            click to play soundtrack
        </div>
    ) : (
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
    );
}
