import { http } from "viem";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { monad } from "viem/chains";
import type { AppKitNetwork } from "@reown/appkit/networks";

export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;

if (!projectId) {
  throw new Error("NEXT_PUBLIC_PROJECT_ID is not defined");
}

// AppKit doesn't ship Monad, but viem/chains does (mainnet, id 143).
export const networks = [monad] as [AppKitNetwork, ...AppKitNetwork[]];

export const wagmiAdapter = new WagmiAdapter({
  ssr: true,
  projectId,
  networks,
  transports: {
    [monad.id]: http(
      process.env.NEXT_PUBLIC_MONAD_RPC_URL ?? "https://rpc.monad.xyz",
    ),
  },
});

export const config = wagmiAdapter.wagmiConfig;
