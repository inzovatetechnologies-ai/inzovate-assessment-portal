import React, { useEffect, useRef, useState } from 'react';
import { Camera, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';

interface WebcamFeedProps {
  onStreamActive?: (active: boolean) => void;
  className?: string;
  showOverlay?: boolean;
}

export const WebcamFeed: React.FC<WebcamFeedProps> = ({
  onStreamActive,
  className = '',
  showOverlay = true,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [streamActive, setStreamActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(true);
  const [isShutterHintVisible, setIsShutterHintVisible] = useState(true);

  const stopHardwareTracks = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const startHardwareCamera = async () => {
    stopHardwareTracks();
    setCameraError(null);
    setConnecting(true);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API is not supported in this browser.');
      }

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        });
      } catch (e1) {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.setAttribute('autoplay', '');
        videoRef.current.setAttribute('muted', '');
        videoRef.current.setAttribute('playsinline', '');
        videoRef.current.muted = true;
        videoRef.current.playsInline = true;
        videoRef.current.srcObject = stream;

        try {
          await videoRef.current.play();
        } catch (playErr) {
          console.warn('Video element play() caught:', playErr);
        }
      }

      setStreamActive(true);
      setCameraError(null);
      if (onStreamActive) onStreamActive(true);
    } catch (err: any) {
      setStreamActive(false);
      if (onStreamActive) onStreamActive(false);
      if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
        setCameraError('Please click "Allow" on the browser camera prompt to turn on your physical camera.');
      } else if (err?.name === 'NotFoundError' || err?.name === 'DevicesNotFoundError') {
        setCameraError('No physical webcam detected. Please connect or enable your camera.');
      } else {
        setCameraError('Camera is busy or unavailable. Close other camera apps and retry.');
      }
    } finally {
      setConnecting(false);
    }
  };

  useEffect(() => {
    startHardwareCamera();

    // Auto-start physical camera as soon as permission changes to 'granted'
    let permStatus: PermissionStatus | null = null;
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: 'camera' as PermissionName })
        .then((status) => {
          permStatus = status;
          status.onchange = () => {
            if (status.state === 'granted') {
              startHardwareCamera();
            }
          };
        })
        .catch(() => {});
    }

    return () => {
      if (permStatus) permStatus.onchange = null;
      stopHardwareTracks();
    };
  }, []);

  return (
    <div className={`relative bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-xl flex items-center justify-center ${className}`}>
      {/* REAL PHYSICAL HARDWARE VIDEO FEED */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`w-full h-full object-cover transform scale-x-[-1] ${streamActive ? 'block' : 'hidden'}`}
      />

      {/* Camera Connecting / Permission Prompt State */}
      {!streamActive && (
        <div className="p-6 text-center space-y-3 max-w-xs">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center mx-auto">
            <Camera className={`w-6 h-6 text-sky-400 ${connecting ? 'animate-pulse' : ''}`} />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-white">
              {connecting ? 'Activating Physical Camera...' : 'Physical Camera Permission Needed'}
            </p>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              {cameraError || 'Please click "Allow" when prompted by your browser.'}
            </p>
          </div>
          {!connecting && (
            <button
              type="button"
              onClick={startHardwareCamera}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold inline-flex items-center space-x-1.5 shadow-md transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Allow &amp; Turn On Camera</span>
            </button>
          )}
        </div>
      )}

      {/* Top HUD Overlay */}
      {showOverlay && streamActive && (
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
          <div className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-black/85 backdrop-blur-md text-[10px] text-emerald-400 border border-emerald-500/40 font-mono shadow">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-bold tracking-wider">LIVE WEBCAM</span>
          </div>

          <div className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-black/85 backdrop-blur-md text-[10px] text-sky-300 border border-slate-700 shadow">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
            <span className="font-semibold">Integrity Verified</span>
          </div>
        </div>
      )}

      {/* Physical Camera Shutter Help Note */}
      {streamActive && isShutterHintVisible && (
        <div className="absolute top-9 left-2 right-2 bg-slate-900/90 backdrop-blur-sm border border-slate-700/80 rounded-lg p-1.5 text-[10px] text-slate-300 flex items-start justify-between space-x-1 shadow-lg">
          <div className="flex items-start space-x-1">
            <AlertCircle className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
            <span>
              <strong>Note:</strong> If screen shows camera-off icon, slide open laptop camera shutter or press <strong>Fn+F8 / F10</strong>.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsShutterHintVisible(false)}
            className="text-slate-400 hover:text-white px-1 text-xs"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};
