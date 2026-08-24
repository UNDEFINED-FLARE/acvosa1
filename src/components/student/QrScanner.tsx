import { useEffect, useRef, useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';

interface QrScannerProps {
  /** Called with the raw decoded text whenever a QR code is found in frame. */
  onDetected: (text: string) => void;
  /** Pause scanning (e.g. while a scanned code is being verified). */
  paused?: boolean;
}

type CameraState = 'starting' | 'scanning' | 'unsupported' | 'denied' | 'error';

// Not all browsers ship BarcodeDetector yet (notably Safari/iOS as of writing).
declare global {
  interface Window {
    BarcodeDetector?: new (options: { formats: string[] }) => {
      detect: (source: CanvasImageSource) => Promise<Array<{ rawValue: string }>>;
    };
  }
}

export function QrScanner({ onDetected, paused }: QrScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>();
  const [state, setState] = useState<CameraState>('starting');

  useEffect(() => {
    let cancelled = false;

    async function start() {
      if (!window.BarcodeDetector) {
        setState('unsupported');
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setState('scanning');

        const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
        const tick = async () => {
          if (cancelled) return;
          if (!paused && videoRef.current && videoRef.current.readyState >= 2) {
            try {
              const codes = await detector.detect(videoRef.current);
              if (codes.length > 0) {
                onDetected(codes[0].rawValue);
              }
            } catch {
              // transient decode errors are expected between frames; ignore
            }
          }
          rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
      } catch (err: any) {
        if (cancelled) return;
        setState(err?.name === 'NotAllowedError' ? 'denied' : 'error');
      }
    }

    start();

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (state === 'unsupported' || state === 'denied' || state === 'error') {
    return (
      <div className="w-full aspect-square rounded-2xl bg-ink-light-grey flex flex-col items-center justify-center gap-2 p-6 text-center">
        <AlertCircle size={28} className="text-ink-dark-grey/50" />
        <p className="text-sm font-medium text-ink-charcoal tracking-tight">
          {state === 'unsupported' && "Your browser doesn't support QR scanning"}
          {state === 'denied' && 'Camera access was denied'}
          {state === 'error' && "Couldn't start the camera"}
        </p>
        <p className="text-xs text-ink-dark-grey/55 tracking-tight max-w-xs">
          {state === 'unsupported'
            ? 'Try Chrome or Edge on this device, or ask an admin to check you in manually.'
            : 'Allow camera access and try again, or ask an admin to check you in manually.'}
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-square rounded-2xl bg-black overflow-hidden">
      <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
      <div className="absolute inset-6 rounded-xl border-2 border-ink-white/80" />
      {state === 'starting' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <Loader2 size={28} className="text-ink-white animate-spin-slow" />
        </div>
      )}
    </div>
  );
}
