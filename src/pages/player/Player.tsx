import { useEffect, useRef, useState } from "react";
import { Subtitle } from "../../data/subsData";
import "./style.css";
import { eventEmitterInstance } from "../../utils/eventEmitter";
import Choice from "./Choice";
import { Scenes } from "../../components/contexts/TransitionManager";
import SkipButton from "../../components/SkipButton";

type PlayerProps = {
    src: string;
    onEnd: (nextScene?: Scenes) => void;
    subs?: Subtitle[];
    sounds?: string[];
    soundTrack?: boolean;
    choice?: boolean;
};

export default function Player({
    src,
    onEnd,
    subs = undefined,
    sounds = undefined,
    soundTrack = false,
    choice = false,
}: PlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [showChoice, setShowChoice] = useState<boolean>(false);
    const [isFinished, setIsFinished] = useState<boolean>(false);
    const isFinishedRef = useRef(false);

    const finish = () => {
        if (isFinishedRef.current) return;
        isFinishedRef.current = true;
        setIsFinished(true);
        if (choice) {
            setShowChoice(true);
            eventEmitterInstance.trigger("toggleFreeze", [true]);
        } else {
            onEnd();
        }
    };

    const skip = () => {
        if (isFinishedRef.current) return;
        const video = videoRef.current;
        if (video) {
            video.pause();
            // The choice shows over the last frame.
            if (choice && Number.isFinite(video.duration)) video.currentTime = video.duration;
        }
        eventEmitterInstance.trigger("stopHowlers", [
            [...(sounds ?? []), ...(subs ?? []).map((sub) => sub.audio)],
        ]);
        eventEmitterInstance.trigger("triggerSubs", [[]]);
        finish();
    };

    // Handle video end
    useEffect(() => {
        if (videoRef.current && videoRef.current.onended === null) {
            videoRef.current.onended = finish;
        }
        if (sounds && sounds.length > 0)
            sounds.forEach((sound) => {
                eventEmitterInstance.trigger("playSound", [sound]);
            });
        if (!soundTrack)
            eventEmitterInstance.trigger("stopHowlers", [
                ["hub", "souvenir", "monde_noir", "outro"],
            ]);
        if (subs && subs.length > 0) eventEmitterInstance.trigger("triggerSubs", [subs]);
    }, [sounds, subs]);

    // Reload and play video when src changes
    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.load();
            videoRef.current.play().catch((error) => {
                console.error("Failed to play video:", error);
            });
        }
    }, [src]);

    const handleChoice = (choice: "yes" | "no") => {
        if (choice === "yes") {
            onEnd("hub_end");
        } else {
            onEnd("dark_world");
        }
    };

    return (
        <div
            style={{
                position: "fixed",
                width: "100%",
                height: "100%",
                zIndex: -1,
            }}
        >
            {showChoice && <Choice onChoice={handleChoice} />}
            {!isFinished && <SkipButton onSkip={skip} />}
            <video
                ref={videoRef}
                autoPlay
                playsInline
                preload="none"
                // muted
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
            >
                <source src={src} type={src.endsWith(".webm") ? "video/webm" : "video/mp4"} />
                Your browser does not support the video tag.
            </video>
        </div>
    );
}
