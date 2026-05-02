'use client';

import type { ReactNode } from 'react';
import * as React from 'react';
import { ThemeProvider } from './theme-provider';
import { LocaleProvider } from './locale-provider';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <LocaleProvider>{children}</LocaleProvider>
    </ThemeProvider>
  );
}
