import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { BillDocument } from '../../types';

/**
 * Builds a public URL containing full verification data of the bill.
 * Automatically handles localhost / dev environments by pointing to the live public endpoint.
 */
export function getBillVerificationUrl(bill: BillDocument): string {
  try {
    const payload = {
      id: bill.id,
      n: bill.billNumber,
      d: bill.billDate,
      c: bill.clientDetails.company || bill.clientDetails.name,
      p: bill.clientDetails.phone,
      a: bill.clientDetails.shippingSameAsBilling ? bill.clientDetails.billingAddress : bill.clientDetails.shippingAddress,
      city: bill.clientDetails.billingCity,
      g: bill.grandTotal,
      pd: bill.amountPaid,
      b: bill.balanceDue,
      it: bill.items.map((i) => ({
        n: i.name,
        q: i.quantity,
        u: i.unit,
        w: i.warranty || '',
        r: i.unitPrice,
        t: i.total,
      })),
    };

    const encoded = btoa(encodeURIComponent(JSON.stringify(payload)));
    
    // Check if running on localhost or development iframe
    const isLocal = typeof window !== 'undefined' && (
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.protocol === 'about:'
    );

    const publicBase = isLocal
      ? 'https://ais-dev-fawdte2o3quaikgv7rvsem-461681205419.asia-east1.run.app'
      : (typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}` : 'https://ais-dev-fawdte2o3quaikgv7rvsem-461681205419.asia-east1.run.app');

    return `${publicBase}?scan_invoice=${encodeURIComponent(bill.billNumber)}&data=${encoded}`;
  } catch (e) {
    return `https://ais-dev-fawdte2o3quaikgv7rvsem-461681205419.asia-east1.run.app?scan_invoice=${encodeURIComponent(bill.billNumber)}`;
  }
}

/**
 * Clean SVG Barcode representation for invoices
 */
export const SvgBarcode: React.FC<{ value: string; className?: string }> = ({
  value,
  className = 'h-8 w-44',
}) => {
  const bars: number[] = [];
  const cleanVal = (value || 'INV-2026-0001').toUpperCase();
  
  // Start guard
  bars.push(2, 1, 2, 1);
  for (let i = 0; i < cleanVal.length; i++) {
    const code = cleanVal.charCodeAt(i);
    const pattern = [(code % 3) + 1, ((code >> 1) % 2) + 1, ((code >> 2) % 3) + 1, ((code >> 3) % 2) + 1];
    bars.push(...pattern);
  }
  // Stop guard
  bars.push(2, 1, 2, 2, 1);

  let currentX = 0;
  const rects: { x: number; width: number }[] = [];

  bars.forEach((width, index) => {
    if (index % 2 === 0) {
      rects.push({ x: currentX, width });
    }
    currentX += width;
  });

  return (
    <svg
      viewBox={`0 0 ${currentX} 36`}
      preserveAspectRatio="none"
      className={className}
      fill="currentColor"
    >
      {rects.map((r, i) => (
        <rect key={i} x={r.x} y={0} width={r.width} height={36} fill="#0f172a" />
      ))}
    </svg>
  );
};

/**
 * Real-time Scannable QR Code using standard QR format
 */
export const SvgQrCode: React.FC<{ value: string; size?: number }> = ({
  value,
  size = 72,
}) => {
  const [dataUrl, setDataUrl] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    QRCode.toDataURL(value, {
      margin: 1,
      width: size * 3, // High DPI for crisp printing
      errorCorrectionLevel: 'M',
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((url) => {
        if (isMounted) setDataUrl(url);
      })
      .catch((err) => {
        console.error('QR code generation error:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [value, size]);

  if (!dataUrl) {
    return (
      <div
        style={{ width: size, height: size }}
        className="bg-slate-100 border border-slate-300 rounded flex items-center justify-center text-[9px] text-slate-400 font-mono"
      >
        QR
      </div>
    );
  }

  return (
    <div
      className="inline-block p-1 bg-white border border-slate-300 rounded shadow-2xs print:border-slate-800"
      title="Scan with phone camera to view full verified digital bill"
    >
      <img
        src={dataUrl}
        alt={`QR Code for ${value}`}
        style={{ width: size, height: size }}
        className="block"
      />
    </div>
  );
};
