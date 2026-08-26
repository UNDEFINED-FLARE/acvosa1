import { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import { AlertCircle, Loader2 } from 'lucide-react';

interface QrScannerProps {
  /** Called with the raw decoded text whenever a QR code is found in frame. */
  onDetected: (text: string) => void;
  /** Pause scanning (e.g. while a scanned code is being verified). */
  paused?: boolean;
}

type CameraState = 'starting' | 'scanning' | 'denied' | 'unavailable' | 'insecure' | 'error';

export function QrScanner({ onDetected, paused }: QrScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>();
  const pausedRef = useRef(paused);
  const lockedRef = useRef(false);
  const [state, setState] = useState<CameraState>('starting');
  const [stuck, setStuck] = useState(false);
  const stuckTimerRef = useRef<number>();

  useEffect(() => {
    pausedRef.current = paused;
    // Once the parent un-pauses us again (e.g. after an invalid-code retry), release the lock
    // and give the stuck-hint a fresh window before it reappears.
    if (!paused) {
      lockedRef.current = false;
      setStuck(false);
      window.clearTimeout(stuckTimerRef.current);
      stuckTimerRef.current = window.setTimeout(() => setStuck(true), 7000);
    }
  }, [paused]);

  useEffect(() => {
    let cancelled = false;

    async function getStream(): Promise<MediaStream> {
      const constraints = { video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } } };
      try {
        return await navigator.mediaDevices.getUserMedia(constraints);
      } catch (err: any) {
        // Some devices/browsers (most laptops, some Android WebViews) reject a
        // constrained facingMode or resolution outright — retry with no constraints.
        if (err?.name === 'OverconstrainedError' || err?.name === 'NotFoundError') {
          return navigator.mediaDevices.getUserMedia({ video: true });
        }
        throw err;
      }
    }

    async function start() {
      if (window.isSecureContext === false) {
        setState('insecure');
        return;
      }
      if (!navigator.mediaDevices?.getUserMedia) {
        setState('unavailable');
        return;
      }

      try {
        const stream = await getStream();
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
        stuckTimerRef.current = window.setTimeout(() => setStuck(true), 7000);

        const canvas = document.createElement('canvas');
        canvasRef.current = canvas;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        const MAX_DIM = 720; // downscale from full camera res — keeps jsQR fast and frame-rate smooth on low-end phones

        const tick = () => {
          if (cancelled) return;
          const video = videoRef.current;
          if (!pausedRef.current && !lockedRef.current && video && ctx && video.readyState >= video.HAVE_ENOUGH_DATA) {
            const scale = Math.min(1, MAX_DIM / Math.max(video.videoWidth, video.videoHeight));
            const w = Math.round(video.videoWidth * scale);
            const h = Math.round(video.videoHeight * scale);
            if (canvas.width !== w) canvas.width = w;
            if (canvas.height !== h) canvas.height = h;
            ctx.drawImage(video, 0, 0, w, h);
            const frame = ctx.getImageData(0, 0, w, h);
            const code = jsQR(frame.data, frame.width, frame.height, { inversionAttempts: 'attemptBoth' });
            if (code?.data) {
              // Lock immediately so we don't fire onDetected again on the next
              // animation frame while the parent is still processing this scan.
              lockedRef.current = true;
              window.clearTimeout(stuckTimerRef.current);
              setStuck(false);
              onDetected(code.data);
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
      window.clearTimeout(stuckTimerRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (state === 'unavailable' || state === 'denied' || state === 'error' || state === 'insecure') {
    return (
      <div className="w-full aspect-square rounded-2xl bg-ink-light-grey flex flex-col items-center justify-center gap-2 p-6 text-center">
        <AlertCircle size={28} className="text-ink-dark-grey/50" />
        <p className="text-sm font-medium text-ink-charcoal tracking-tight">
          {state === 'unavailable' && 'Camera access is not available in this browser'}
          {state === 'denied' && 'Camera access was denied'}
          {state === 'error' && "Couldn't start the camera"}
          {state === 'insecure' && 'Camera requires a secure connection'}
        </p>
        <p className="text-xs text-ink-dark-grey/55 tracking-tight max-w-xs">
          {state === 'unavailable' && 'Try opening this page in a standard browser tab, or ask an admin to check you in manually.'}
          {state === 'denied' && 'Allow camera access in your browser settings and try again, or ask an admin to check you in manually.'}
          {state === 'error' && 'Try again, or ask an admin to check you in manually.'}
          {state === 'insecure' && 'This page needs to be loaded over HTTPS (or localhost) for camera access to work. Ask an admin to check you in manually for now.'}
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
      {state === 'scanning' && stuck && !paused && (
        <div className="absolute inset-x-0 bottom-0 bg-black/70 px-4 py-3">
          <p className="text-xs text-ink-white/90 text-center tracking-tight">
            Not picking it up? Move closer, improve lighting, or try manual entry below.
          </p>
        </div>
      )}
    </div>
  );
}

