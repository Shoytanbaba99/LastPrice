"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes";

/**
 * Thin wrapper around next-themes <ThemeProvider>.
 * Must be a Client Component because next-themes uses React context.
 * Mounted in the root layout alongside TRPCReactProvider.
 *
 * attribute="class" → adds/removes the `.dark` class on <html>,
 * which is what our CSS custom-property system keys off.
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange={false}
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
