import { useEffect, useRef, useState } from "react";
import { Subtitle } from "../../data/subsData";
import "./style.css";
import { eventEmitterInstance } from "../../utils/eventEmitter";

type PlayerProps = {
    src: string;
    onEnd: () => void;
    subs: Subtitle[];
    sounds: string[];
    soundTrack?: boolean;
};

export default function Player({ src, onEnd, subs, sounds, soundTrack = false }: PlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current && videoRef.current.onended === null) {
            videoRef.current.onended = () => {
                onEnd();
            };
        }

        sounds.forEach((sound) => {
            eventEmitterInstance.trigger("playSound", [sound]);
        });
        if (!soundTrack)
            eventEmitterInstance.trigger("stopHowlers", [
                ["hub", "souvenir", "monde_noir", "outro"],
            ]);
        eventEmitterInstance.trigger("triggerSubs", [subs]);
    }, [videoRef]);

    return (
        <div
            style={{
                position: "fixed",
                width: "100%",
                height: "100%",
                zIndex: -1,
            }}
        >
            <video
                ref={videoRef}
                autoPlay
                playsInline
                preload="none"
                muted
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
            >
                <source src={src} type="video/mp4" />
                Your browser does not support the video tag.
            </video>
        </div>
    );
}
