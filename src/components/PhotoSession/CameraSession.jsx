import React, { useEffect, useRef, useState } from 'react';

const CameraSession = ({ frameIndex, totalFrames, onCapture }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [countdown, setCountdown] = useState(5);
  const [isCounting, setIsCounting] = useState(false);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;
      } catch (err) {
        console.error('Failed to access camera:', err);
      }
    };
    startCamera();
  }, []);

  useEffect(() => {
    if (!isCounting) return;
    if (countdown === 0) {
      handleCapture();
      return;
    }

    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, isCounting]);

  const startCountdown = () => {
    setCountdown(5);
    setIsCounting(true);
  };

  const handleCapture = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    const img = new Image();
    img.onload = () => {
      onCapture(img);
      setIsCounting(false);
    };
    img.src = canvas.toDataURL('image/jpeg');
  };

  return (
    <div className="relative w-full h-full flex justify-center items-center bg-black">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover rounded"
      />
      <canvas ref={canvasRef} width={640} height={480} className="hidden" />

      <div className="absolute bottom-10 text-center">
        {!isCounting ? (
          <button
            onClick={startCountdown}
            className="bg-white text-black px-8 py-4 rounded-full text-xl font-bold"
          >
            Foto ke-{frameIndex + 1} dari {totalFrames}
          </button>
        ) : (
          <div className="text-5xl text-white font-bold">{countdown}</div>
        )}
      </div>
    </div>
  );
};

export default CameraSession;
