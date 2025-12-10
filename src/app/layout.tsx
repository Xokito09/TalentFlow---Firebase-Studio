import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google'; // Import font optimizers
import { AppShell } from '@/components/app-shell';
import { Toaster } from "@/components/ui/toaster"
import './globals.css';
import { cn } from '@/lib/utils'; // Assuming cn utility exists for class concatenation

// Configure the fonts with variable support
const fontSans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const fontHeading = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'TalentFlow',
  description: 'A modern recruitment platform to manage clients, positions, and candidates.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* Removed the manual <link> tags for Google Fonts */}
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
          fontHeading.variable
        )}
      >
        <AppShell>
          {children}
        </AppShell>
        <Toaster />
      </body>
    </html>
  );
}
