import React, { useEffect, useRef } from 'react';

// Use the QRCode object from the CDN script
declare var QRCode: any;

interface QrCodeGeneratorProps {
  value: string;
}

const QrCodeGenerator: React.FC<QrCodeGeneratorProps> = ({ value }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && value && typeof QRCode !== 'undefined') {
      QRCode.toCanvas(canvasRef.current, value, { width: 224, margin: 1 }, (error: any) => {
        if (error) console.error("QR Code generation error:", error);
      });
    }
  }, [value]);

  return <canvas ref={canvasRef} />;
};

export default QrCodeGenerator;
