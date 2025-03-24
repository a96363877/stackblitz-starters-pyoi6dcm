'use client';

import { Toaster as SonnerToaster } from 'sonner';

export function SonnerProvider() {
  return (
    <SonnerToaster
      position="top-center"
      toastOptions={{
        style: {
          background: 'white',
          color: 'black',
          border: '1px solid #e2e8f0',
          fontFamily: 'inherit',
          direction: 'rtl',
          textAlign: 'right',
        },
    
       
      }}
      closeButton
      richColors
    />
  );
}
