import { useEffect, useRef, useState } from "react";
import { Howl, Howler } from "howler";
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
    const [isMute, setIsMute] = useState(false);

    useEffect(() => {
        const handleClick = () => setIsHowlerReady(true);
        const handlePlay = (name: string, volume?: number) => toggleSound(name, volume);
        const handleStop = (soundNames: string[]) => stopHowlers(soundNames);

        document.addEventListener("click", handleClick, { once: true });
        eventEmitterInstance.on("playSound", handlePlay);
        eventEmitterInstance.on("stopHowlers", handleStop);

        return () => {
            document.removeEventListener("click", handleClick);
            eventEmitterInstance.off("playSound", handlePlay);
            eventEmitterInstance.off("stopHowlers", handleStop);
            activePlayersRef.current.forEach(({ player }) => player.unload());
            activePlayersRef.current = [];
        };
    }, []);

    const toggleSound = (soundName: string, volume?: number) => {
        const sound = AudioData.find((a) => a.name === soundName);
        if (!sound) {
            console.error(`Impossible to play sound: ${soundName}`);
            return;
        }

        const existingPlayer = activePlayersRef.current.find((p) => p.name === soundName);

        if (existingPlayer) return;

        const howl = new Howl({
            src: [sound.src],
            loop: sound.loop ?? false,
            volume: volume ?? sound.volume ?? 1,
            onend: () => {
                if (sound.loop) return;
                activePlayersRef.current = activePlayersRef.current.filter(
                    (p) => p.player !== howl,
                );
                howl.unload();
            },
        });

        const startPlayback = () => {
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
        soundNames.forEach((name) => {
            const player = activePlayersRef.current.find((p) => p.name.includes(name));
            if (player) {
                const currentVolume = player.player.volume();
                player.player.fade(currentVolume, 0, 1000); // Fade out over 1 second

                // Remove from active players after fade completes
                setTimeout(() => {
                    player.player.unload();
                    activePlayersRef.current = activePlayersRef.current.filter((p) => p !== player);
                }, 1000);
            }
        });
    };

    const toggleMuteAudio = () => {
        isMuteRef.current = !isMuteRef.current;
        Howler.mute(isMuteRef.current);
        setIsMute(isMuteRef.current);
    };

    return (
        isHowlerReady && (
            <div id="audio-controls">
                <button className="audio-wave-button" tabIndex={-1} onClick={toggleMuteAudio}>
                    {!isMute ? (
                        <img
                            src="/images/audio_wave.webp"
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
