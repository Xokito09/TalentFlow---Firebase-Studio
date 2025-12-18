'use client';

import { useEffect } from 'react';

export default function PositionDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('POSITION_DETAIL_ERROR', {
      message: error.message,
      stack: error.stack,
      digest: (error as any).digest,
    });
  }, [error]);

  return (
    <div
      style={{
        padding: '2rem',
        margin: '2rem',
        border: '1px solid #fecaca',
        backgroundColor: '#fef2f2',
        color: '#b91c1c',
        borderRadius: '8px',
      }}
    >
      <h2 style={{ marginBottom: '1rem', fontWeight: 'bold' }}>
        Error loading Position details
      </h2>
      <div
        style={{
          fontFamily: 'monospace',
          fontSize: '0.875rem',
          whiteSpace: 'pre-wrap',
        }}
      >
        <p>{error.message || 'An unknown error occurred.'}</p>
        {error.digest && (
          <p style={{ marginTop: '0.5rem' }}>
            <strong>Digest:</strong> {error.digest}
          </p>
        )}
      </div>
      <button
        onClick={() => reset()}
        style={{
          marginTop: '1.5rem',
          padding: '0.5rem 1rem',
          color: 'white',
          backgroundColor: '#3b82f6',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Try again
      </button>
    </div>
  );
}
