"use client";

import { ChildProvider } from "../context/ChildContext";
import { ThemeProvider } from "../components/ThemeProvider";

export function Providers({ children }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <ChildProvider>{children}</ChildProvider>
    </ThemeProvider>
  );
}
