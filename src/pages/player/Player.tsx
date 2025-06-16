import { useEffect, useRef } from "react";

type PlayerProps = {
    src: string;
    onEnd: () => void;
};

export default function Player({ src, onEnd }: PlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        console.log(videoRef.current, videoRef.current?.onended);
        if (videoRef.current && videoRef.current.onended === null) {
            videoRef.current.onended = onEnd;
        }
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
