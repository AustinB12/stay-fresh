import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import type { IScannerControls } from '@zxing/browser';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface BarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onDetected: (barcode: string) => void;
}

export function BarcodeScanner({
  isOpen,
  onClose,
  onDetected,
}: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const reader = new BrowserMultiFormatReader();
    setError(null);
    setScanning(true);

    let stopped = false;

    reader
      .decodeFromVideoDevice(
        undefined,
        videoRef.current!,
        (result, err, controls) => {
          if (stopped) return;
          if (result) {
            stopped = true;
            controls.stop();
            onDetected(result.getText());
          }
          if (err && err.name === 'NotAllowedError') {
            stopped = true;
            controls.stop();
            setError(
              'Camera permission denied. Please allow camera access and try again.',
            );
            setScanning(false);
          }
        },
      )
      .then((controls) => {
        controlsRef.current = controls;
      })
      .catch((e) => {
        if (e.name === 'NotAllowedError') {
          setError(
            'Camera permission denied. Please allow camera access and try again.',
          );
        } else if (e.name === 'NotFoundError') {
          setError('No camera found on this device.');
        } else {
          setError('Could not start camera: ' + e.message);
        }
        setScanning(false);
      });

    return () => {
      stopped = true;
      controlsRef.current?.stop();
      controlsRef.current = null;
    };
  }, [isOpen, onDetected]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Scan Barcode</DialogTitle>
        </DialogHeader>
        <div className='flex flex-col items-center gap-4'>
          {error ? (
            <div className='flex flex-col items-center gap-2 py-8 text-center text-red-500'>
              <AlertCircle className='h-10 w-10' />
              <p className='text-sm'>{error}</p>
              <Button variant='outline' className='mt-2' onClick={onClose}>
                Close
              </Button>
            </div>
          ) : (
            <>
              <div className='relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-black'>
                <video
                  ref={videoRef}
                  className='w-full h-full object-cover'
                  muted
                  playsInline
                />
                {scanning && (
                  <div className='absolute inset-0 flex items-center justify-center pointer-events-none'>
                    <div className='w-48 h-48 border-2 border-green-400 rounded-lg opacity-70' />
                  </div>
                )}
              </div>
              <p className='text-sm text-zinc-500 dark:text-zinc-400'>
                Point your camera at a barcode
              </p>
              <Button variant='outline' onClick={onClose}>
                Cancel
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
