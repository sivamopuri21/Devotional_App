import { useEffect, useRef, useState } from 'react';

/**
 * Global Om chanting background audio player.
 * Loops continuously until the browser/tab is closed.
 * Includes a small mute/unmute toggle in the bottom-right corner.
 */
export default function OmChantingPlayer() {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [muted, setMuted] = useState(false);
    const [started, setStarted] = useState(false);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        // Attempt autoplay — browsers may block until user interacts
        const tryPlay = () => {
            audio.play().then(() => setStarted(true)).catch(() => {
                // Autoplay blocked — wait for first user interaction
                const resume = () => {
                    audio.play().then(() => setStarted(true)).catch(() => {});
                    document.removeEventListener('click', resume);
                    document.removeEventListener('touchstart', resume);
                    document.removeEventListener('keydown', resume);
                };
                document.addEventListener('click', resume, { once: true });
                document.addEventListener('touchstart', resume, { once: true });
                document.addEventListener('keydown', resume, { once: true });
            });
        };

        tryPlay();
    }, []);

    const toggle = () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (!started) {
            audio.play().then(() => setStarted(true)).catch(() => {});
        }

        setMuted((prev) => {
            audio.muted = !prev;
            return !prev;
        });
    };

    return (
        <>
            <audio
                ref={audioRef}
                src="/assets/audio/om-chanting.mpeg"
                loop
                preload="auto"
            />
            <button
                onClick={toggle}
                aria-label={muted ? 'Unmute Om chanting' : 'Mute Om chanting'}
                title={muted ? 'Unmute Om chanting' : 'Mute Om chanting'}
                style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    zIndex: 9999,
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    border: 'none',
                    background: 'linear-gradient(135deg, #ff6b00, #8b0000)',
                    color: 'white',
                    fontSize: '20px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                }}
            >
                {muted ? '🔇' : '🔊'}
            </button>
        </>
    );
}
