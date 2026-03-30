import { Attribution } from "ox/erc8021"
import { type Address } from "viem"
import { createConfig, http } from "wagmi"
import { coinbaseWallet, injected } from "wagmi/connectors"
import { base } from "wagmi/chains"

export const POMODORO_CONTRACT = "0xc87c8C8A33B4eFedAF38f8a3C1f553e47dd5D98a" as Address

export const pomodoroAbi = [
  { type: "function", name: "startSession", stateMutability: "nonpayable", inputs: [], outputs: [] },
  { type: "function", name: "completeSession", stateMutability: "nonpayable", inputs: [], outputs: [] },
  { type: "function", name: "cancelSession", stateMutability: "nonpayable", inputs: [], outputs: [] },
  { type: "function", name: "timeLeft", stateMutability: "view", inputs: [{ name: "user", type: "address" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "completedCount", stateMutability: "view", inputs: [{ name: "user", type: "address" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "sessions", stateMutability: "view", inputs: [{ name: "", type: "address" }], outputs: [{ type: "uint256" }, { type: "bool" }] }
] as const

export const DATA_SUFFIX = Attribution.toDataSuffix({
  codes: ["BUILDER_CODE_PLACEHOLDER"]
})

export const wagmiConfig = createConfig({
  chains: [base],
  connectors: [
    coinbaseWallet({
      appName: "Pomodoro"
    }),
    injected()
  ],
  transports: {
    [base.id]: http()
  },
  dataSuffix: DATA_SUFFIX
} as any)
