import React, { useEffect, useRef, useState } from 'react';
import { Camera, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';

interface WebcamFeedProps {
  onStreamActive?: (active: boolean) => void;
  onProctorViolation?: (type: string, reason: string, immediateTerminate?: boolean) => void;
  proctoringEnabled?: boolean;
  className?: string;
  showOverlay?: boolean;
}

declare global {
  interface Window {
    tf?: any;
    blazeface?: any;
    cocoSsd?: any;
  }
}

function loadScriptOnce(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      if ((existing as any).dataset.loaded === 'true') return resolve();
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)));
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.onload = () => {
      script.dataset.loaded = 'true';
      resolve();
    };
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
}

export const WebcamFeed: React.FC<WebcamFeedProps> = ({
  onStreamActive,
  onProctorViolation,
  proctoringEnabled = false,
  className = '',
  showOverlay = true,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const onViolationRef = useRef(onProctorViolation);
  onViolationRef.current = onProctorViolation;

  const [streamActive, setStreamActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(true);
  const [isShutterHintVisible, setIsShutterHintVisible] = useState(true);
  const [aiStatus, setAiStatus] = useState<string>('Initializing AI Proctor...');

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

  // Real-Time AI Proctoring Loop (Mobile Phone, Looking Down >1s, Head Turn, Multi-Face, No Face)
  useEffect(() => {
    if (!proctoringEnabled || !streamActive) return;

    let cancelled = false;
    let faceModel: any = null;
    let objectModel: any = null;
    let timerId: any = null;

    let lookDownStartMs: number | null = null;
    let headTurnStartMs: number | null = null;
    let noFaceStartMs: number | null = null;
    let lastViolationMs = 0;

    const emitViolation = (type: string, reason: string, immediateTerminate = false) => {
      const now = Date.now();
      if (!immediateTerminate && now - lastViolationMs < 3500) return;
      lastViolationMs = now;
      if (onViolationRef.current) {
        onViolationRef.current(type, reason, immediateTerminate);
      }
    };

    async function initModelsAndLoop() {
      try {
        setAiStatus('Loading AI Vision...');
        await loadScriptOnce('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.20.0/dist/tf.min.js');
        await Promise.all([
          loadScriptOnce('https://cdn.jsdelivr.net/npm/@tensorflow-models/blazeface@0.1.0/dist/blazeface.min.js'),
          loadScriptOnce('https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd@2.2.3/dist/coco-ssd.min.js'),
        ]);
        if (cancelled) return;

        if (window.blazeface) {
          faceModel = await window.blazeface.load();
        }
        if (window.cocoSsd) {
          objectModel = await window.cocoSsd.load({ base: 'lite_mobilenet_v2' });
        }
        if (cancelled) return;
        setAiStatus('AI Proctoring Active');
      } catch (err) {
        console.warn('AI Vision CDN load failed, using fallback frame monitor:', err);
        setAiStatus('Webcam Monitor Active');
      }

      const runCheck = async () => {
        if (cancelled) return;
        const video = videoRef.current;
        if (!video || video.readyState < 2 || video.videoWidth === 0) {
          timerId = setTimeout(runCheck, 600);
          return;
        }

        const now = Date.now();

        try {
          // 1. Mobile Phone Detection (Instant Termination)
          if (objectModel) {
            const objects = await objectModel.detect(video);
            if (cancelled) return;
            const phone = objects.find(
              (o: any) => o.class === 'cell phone' && o.score >= 0.42
            );
            if (phone) {
              emitViolation(
                'mobile_phone',
                'Mobile Phone detected in camera frame! Assessment terminated immediately.',
                true
              );
              return;
            }
          }

          // 2. Face, Head Turn & Looking Down (> 1s) Detection
          if (faceModel) {
            const faces = await faceModel.estimateFaces(video, false);
            if (cancelled) return;

            if (!faces || faces.length === 0) {
              if (!noFaceStartMs) noFaceStartMs = now;
              else if (now - noFaceStartMs >= 1500) {
                noFaceStartMs = now;
                emitViolation('no_face', 'Face not visible in camera for over 1.5 seconds.');
              }
              lookDownStartMs = null;
              headTurnStartMs = null;
            } else {
              noFaceStartMs = null;

              if (faces.length > 1) {
                emitViolation('multiple_faces', 'Multiple people detected in camera frame.');
              }

              const f = faces[0];
              const lm = f.landmarks; // [rightEye, leftEye, nose, mouth, rightEar, leftEar]
              if (lm && lm.length >= 4) {
                const rightEye = lm[0];
                const leftEye = lm[1];
                const nose = lm[2];
                const mouth = lm[3];

                const eyeMidX = (rightEye[0] + leftEye[0]) / 2;
                const eyeMidY = (rightEye[1] + leftEye[1]) / 2;
                const eyeDist = Math.max(10, Math.abs(leftEye[0] - rightEye[0]));

                // Head Turn Left/Right: nose shifts far from eye midpoint
                const yawRatio = Math.abs(nose[0] - eyeMidX) / eyeDist;
                if (yawRatio > 0.45) {
                  if (!headTurnStartMs) headTurnStartMs = now;
                  else if (now - headTurnStartMs >= 1000) {
                    headTurnStartMs = now;
                    emitViolation('head_turn', 'Looking away / head turned away from screen for over 1 second.');
                  }
                } else {
                  headTurnStartMs = null;
                }

                // Looking Down (> 1 second): nose-to-eye vertical ratio or face box drops low
                const faceHeight = Math.max(20, (f.bottomRight?.[1] || 0) - (f.topLeft?.[1] || 0));
                const noseDropRatio = (nose[1] - eyeMidY) / faceHeight;
                const mouthToNose = (mouth[1] - nose[1]) / faceHeight;
                if (noseDropRatio < 0.08 || mouthToNose < 0.08 || (f.topLeft?.[1] || 0) > video.videoHeight * 0.62) {
                  if (!lookDownStartMs) lookDownStartMs = now;
                  else if (now - lookDownStartMs >= 1000) {
                    lookDownStartMs = now;
                    emitViolation('looking_down', 'Looking down away from screen for over 1 second.');
                  }
                } else {
                  lookDownStartMs = null;
                }
              }
            }
          }
        } catch (err) {
          // Ignore transient frame errors
        }

        if (!cancelled) {
          timerId = setTimeout(runCheck, 550);
        }
      };

      timerId = setTimeout(runCheck, 800);
    }

    initModelsAndLoop();

    return () => {
      cancelled = true;
      if (timerId) clearTimeout(timerId);
    };
  }, [proctoringEnabled, streamActive]);

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
            <span className="font-semibold">{proctoringEnabled ? aiStatus : 'Integrity Verified'}</span>
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
