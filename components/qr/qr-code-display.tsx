'use client';

import { useEffect, useState } from 'react';
import QRCode from 'react-qr-code';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QRCodeDisplayProps {
  data: string;
  title?: string;
  size?: number;
  showDownload?: boolean;
}

export function QRCodeDisplay({ data, title, size = 200, showDownload = true }: QRCodeDisplayProps) {
  const [svgString, setSvgString] = useState<string>('');

  useEffect(() => {
    // Generate SVG string for download
    setTimeout(() => {
      const svgElement = document.querySelector('#qr-code-svg svg');
      if (svgElement) {
        setSvgString(svgElement.outerHTML);
      }
    }, 100);
  }, [data, size]);

  const handleDownload = () => {
    if (!svgString) return;

    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `qr-code-${Date.now()}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4 bg-white rounded-lg border" role="region" aria-label={title || "QR Code"}>
      {title && <h3 className="font-semibold text-lg">{title}</h3>}
      <div className="p-4 bg-white rounded border-2 border-gray-200">
        <div id="qr-code-svg" aria-label="QR Code image">
          <QRCode
            value={data}
            size={size}
            level="M"
            style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
            viewBox="0 0 256 256"
            aria-label={`QR Code: ${title || 'Event registration'}`}
          />
        </div>
      </div>
      {showDownload && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleDownload}
          aria-label="Download QR code as SVG file"
        >
          <Download className="h-4 w-4 mr-2" aria-hidden="true" />
          Download QR Code
        </Button>
      )}
    </div>
  );
}

