'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('GLOBAL_ERROR', {
      message: error.message,
      stack: error.stack,
      digest: (error as any).digest,
    });
  }, [error]);

  return (
    <html>
      <body>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            fontFamily: 'sans-serif',
          }}
        >
          <div style={{ padding: '2rem', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <h2 style={{ marginBottom: '1rem' }}>Something went wrong!</h2>
            <div style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #fecaca', backgroundColor: '#fef2f2', color: '#b91c1c' }}>
              <p>{error.message || 'Unknown server error'}</p>
              {error.digest && (
                <p style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
                  <strong>Digest:</strong> {error.digest}
                </p>
              )}
            </div>
            <button
              onClick={() => reset()}
              style={{
                padding: '0.5rem 1rem',
                color: 'white',
                backgroundColor: '#3b82f6',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Retry
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
