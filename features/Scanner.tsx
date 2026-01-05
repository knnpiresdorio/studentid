import React, { useState, useEffect, useRef } from 'react';
import { Camera, X, Check, Loader2 } from 'lucide-react';

interface ScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

export const Scanner: React.FC<ScannerProps> = ({ onScan, onClose }) => {
  const [scanning, setScanning] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Simulate camera request
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera error", err);
        // Fallback for demo if no camera or permission denied
      }
    };

    if (scanning) {
      startCamera();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [scanning]);

  const handleSimulateScan = () => {
    setScanning(false);
    // Simulate finding a valid QR code after 1 second
    setTimeout(() => {
      onScan('s1'); // Scanning "Ana Silva" ID by default for demo
    }, 800);
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />

        {/* Scanner Overlay UI */}
        <div className="relative z-10 w-64 h-64 border-2 border-blue-400 rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.7)] flex flex-col items-center justify-center">
          <div className="w-full h-0.5 bg-red-500 absolute top-1/2 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div>
          <p className="mt-72 text-white font-medium text-sm bg-black/50 px-3 py-1 rounded-full">Aponte para o QR Code</p>
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white p-2 bg-white/10 rounded-full backdrop-blur-md"
        >
          <X size={24} />
        </button>
      </div>

      <div className="bg-slate-900 p-6 pb-10 rounded-t-2xl -mt-4 z-20 border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <h3 className="text-center font-bold text-white mb-4">Scanner de Validação</h3>
        <p className="text-center text-slate-400 text-sm mb-6">Mantenha o código do estudante dentro da área demarcada.</p>

        {/* Demo Button since we can't really scan a QR from screen easily in a mock */}
        <button
          onClick={handleSimulateScan}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-blue-500/20"
        >
          {scanning ? <Camera size={20} /> : <Loader2 className="animate-spin" size={20} />}
          {scanning ? 'Simular Leitura (Demo)' : 'Processando...'}
        </button>
      </div>
    </div>
  );
};