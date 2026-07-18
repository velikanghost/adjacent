"use client";

import { createAppKit } from "@reown/appkit/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cookieToInitialState, WagmiProvider, type Config } from "wagmi";
import { useState, type ReactNode } from "react";
import { wagmiAdapter, projectId, networks } from "@/config";

const metadata = {
  name: "adjacent",
  description:
    "Monad DeFi copilot — see every position, understand every risk.",
  url:
    typeof window !== "undefined"
      ? window.location.origin
      : "http://localhost:3000",
  icons: ["https://avatars.githubusercontent.com/u/179229932"],
};

// Created once at module load (outside React) as AppKit requires.
export const modal = createAppKit({
  adapters: [wagmiAdapter],
  projectId: projectId!,
  networks,
  defaultNetwork: networks[0],
  metadata,
  themeMode: "dark",
  themeVariables: {
    "--w3m-accent": "#ff3b30",
    "--w3m-border-radius-master": "2px",
  },
  features: { analytics: false, email: false, socials: [] },
});

export function AppKitProvider({
  children,
  cookies,
}: {
  children: ReactNode;
  cookies: string | null;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  const initialState = cookieToInitialState(
    wagmiAdapter.wagmiConfig as Config,
    cookies,
  );

  return (
    <WagmiProvider
      config={wagmiAdapter.wagmiConfig as Config}
      initialState={initialState}
    >
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
