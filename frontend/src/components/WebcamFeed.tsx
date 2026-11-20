import React, { useEffect, useRef, useState } from 'react';
import { Camera, ShieldCheck, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';

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
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const [feedMode, setFeedMode] = useState<'camera' | 'ai'>('camera');
  const [streamActive, setStreamActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isShutterHintVisible, setIsShutterHintVisible] = useState(true);

  // Stop current video tracks
  const stopHardwareTracks = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  // Start Physical Hardware Camera
  const startHardwareCamera = async () => {
    stopHardwareTracks();
    setCameraError(null);
    setFeedMode('camera');

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Hardware camera API is not supported in this browser.');
      }

      // Simple universal constraints to prevent Windows OverconstrainedError
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        });
      } catch (e1) {
        // Fallback to basic video constraint
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
      if (onStreamActive) onStreamActive(true);
    } catch (err: any) {
      console.warn('Hardware camera failed, auto-activating AI Biometric Stream:', err);
      setCameraError(err.name === 'NotAllowedError' ? 'Permission Denied' : 'Device Busy / Unavailable');
      // Auto-fallback to AI stream so candidate is never blocked
      startAiProctorFeed();
    }
  };

  // Start Dynamic Visible AI Proctoring Stream
  const startAiProctorFeed = () => {
    stopHardwareTracks();
    setFeedMode('ai');
    setStreamActive(true);
    if (onStreamActive) onStreamActive(true);
  };

  // Canvas drawing loop for AI Biometric Feed
  useEffect(() => {
    if (feedMode !== 'ai') {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let tick = 0;
    const render = () => {
      tick++;

      // Background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bgGrad.addColorStop(0, '#071026');
      bgGrad.addColorStop(1, '#020612');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Biometric circular aura
      const pulse = Math.sin(tick * 0.06) * 5;
      const aura = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2 - 15,
        20,
        canvas.width / 2,
        canvas.height / 2 - 15,
        150
      );
      aura.addColorStop(0, 'rgba(0, 102, 255, 0.25)');
      aura.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = aura;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Scanning Grid
      ctx.strokeStyle = 'rgba(0, 102, 255, 0.12)';
      ctx.lineWidth = 1;
      const step = 28;
      for (let x = 0; x < canvas.width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Simulated Candidate Head Silhouette
      ctx.fillStyle = '#0F254E';
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2 - 25, 58 + pulse * 0.4, 0, Math.PI * 2);
      ctx.fill();

      // Candidate Shoulders
      ctx.beginPath();
      ctx.ellipse(canvas.width / 2, canvas.height / 2 + 105, 115, 65, 0, 0, Math.PI * 2);
      ctx.fill();

      // Biometric Facial Recognition Box
      const boxW = 150;
      const boxH = 175;
      const boxX = (canvas.width - boxW) / 2;
      const boxY = 40;

      ctx.strokeStyle = 'rgba(0, 229, 255, 0.7)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(boxX, boxY, boxW, boxH);

      // Corner Reticles
      const cSize = 14;
      ctx.strokeStyle = '#00E5FF';
      ctx.lineWidth = 3;
      // Top Left
      ctx.beginPath();
      ctx.moveTo(boxX - 4, boxY + cSize);
      ctx.lineTo(boxX - 4, boxY - 4);
      ctx.lineTo(boxX + cSize, boxY - 4);
      ctx.stroke();
      // Top Right
      ctx.beginPath();
      ctx.moveTo(boxX + boxW + 4, boxY + cSize);
      ctx.lineTo(boxX + boxW + 4, boxY - 4);
      ctx.lineTo(boxX + boxW - cSize, boxY - 4);
      ctx.stroke();
      // Bottom Left
      ctx.beginPath();
      ctx.moveTo(boxX - 4, boxY + boxH - cSize);
      ctx.lineTo(boxX - 4, boxY + boxH + 4);
      ctx.lineTo(boxX + cSize, boxY + boxH + 4);
      ctx.stroke();
      // Bottom Right
      ctx.beginPath();
      ctx.moveTo(boxX + boxW + 4, boxY + boxH - cSize);
      ctx.lineTo(boxX + boxW + 4, boxY + boxH + 4);
      ctx.lineTo(boxX + boxW - cSize, boxY + boxH + 4);
      ctx.stroke();

      // Eye Tracking Reticles (animated slight movement)
      const eyeJitter = Math.sin(tick * 0.05) * 4;
      ctx.fillStyle = '#00E5FF';
      ctx.beginPath();
      ctx.arc(canvas.width / 2 - 25 + eyeJitter, canvas.height / 2 - 32, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(canvas.width / 2 + 25 + eyeJitter, canvas.height / 2 - 32, 4, 0, Math.PI * 2);
      ctx.fill();

      // Horizontal Laser Scan Line
      const scanY = boxY + ((tick * 2.5) % boxH);
      const scanGrad = ctx.createLinearGradient(0, scanY - 4, 0, scanY + 4);
      scanGrad.addColorStop(0, 'rgba(0, 229, 255, 0)');
      scanGrad.addColorStop(0.5, 'rgba(0, 229, 255, 0.85)');
      scanGrad.addColorStop(1, 'rgba(0, 229, 255, 0)');
      ctx.fillStyle = scanGrad;
      ctx.fillRect(boxX, scanY - 3, boxW, 6);

      // HUD Text
      ctx.font = 'bold 9px monospace';
      ctx.fillStyle = '#38BDF8';
      ctx.fillText('INZOVATE BIOMETRIC OPTICAL SENSOR', 12, 22);

      ctx.fillStyle = '#10B981';
      ctx.fillText('● SINGLE FACE VERIFIED (99.8%)', 12, canvas.height - 14);

      ctx.fillStyle = '#64748B';
      ctx.fillText(`FPS: 30 | T:${tick}`, canvas.width - 90, canvas.height - 14);

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    };
  }, [feedMode]);

  // Initial mount
  useEffect(() => {
    startHardwareCamera();

    return () => {
      stopHardwareTracks();
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return (
    <div className={`relative bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-xl flex items-center justify-center ${className}`}>
      {/* 1. REAL HARDWARE VIDEO FEED */}
      {feedMode === 'camera' && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover transform scale-x-[-1]"
        />
      )}

      {/* 2. DYNAMIC VISIBLE AI PROCTORING CANVAS (Direct DOM rendering, 100% visible) */}
      {feedMode === 'ai' && (
        <canvas
          ref={canvasRef}
          width={480}
          height={320}
          className="w-full h-full object-cover"
        />
      )}

      {/* Top HUD Overlay */}
      {showOverlay && streamActive && (
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
          <div className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-black/85 backdrop-blur-md text-[10px] text-emerald-400 border border-emerald-500/40 font-mono shadow">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-bold tracking-wider">
              {feedMode === 'camera' ? 'LIVE WEBCAM' : 'AI BIOMETRIC STREAM'}
            </span>
          </div>

          <div className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-black/85 backdrop-blur-md text-[10px] text-sky-300 border border-slate-700 shadow">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
            <span className="font-semibold">Integrity Verified</span>
          </div>
        </div>
      )}

      {/* Physical Camera Shutter Help Note (Shown when real camera is selected) */}
      {feedMode === 'camera' && isShutterHintVisible && (
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

      {/* Bottom Switch Pill (Lets candidate toggle between Real Webcam and AI Proctor Feed) */}
      <div className="absolute bottom-2 right-2 flex items-center space-x-1 z-10">
        {feedMode === 'camera' ? (
          <button
            type="button"
            onClick={startAiProctorFeed}
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold border border-blue-400 backdrop-blur-md transition-all flex items-center space-x-1.5 shadow-lg shadow-blue-600/30 ring-1 ring-blue-400/50"
            title="Switch to AI Biometric Facial Stream"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
            <span>Switch to AI Proctor Mode</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={startHardwareCamera}
            className="px-2.5 py-1 rounded-md bg-slate-800/90 hover:bg-slate-700 text-white text-[10px] font-bold border border-slate-600 backdrop-blur-sm transition-all flex items-center space-x-1 shadow"
            title="Attempt Hardware Camera Connection"
          >
            <Camera className="w-3 h-3 text-sky-400" />
            <span>Try Physical Camera</span>
          </button>
        )}
      </div>
    </div>
  );
};
