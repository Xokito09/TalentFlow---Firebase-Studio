"use client";

import dynamic from 'next/dynamic';
import React from 'react';

// Dynamically import AppShell with SSR disabled
const AppShell = dynamic(() => import('@/components/app-shell').then(mod => mod.AppShell), {
  ssr: false,
});

export function AppShellProvider({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
