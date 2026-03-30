"use client"

import { type Address } from "viem"
import { useAccount, useReadContract } from "wagmi"
import { Navigation } from "@/components/navigation"
import { POMODORO_CONTRACT, pomodoroAbi } from "@/lib/web3"

const EMPTY_ADDRESS = "0x0000000000000000000000000000000000000000" as Address

export default function ProfilePage() {
  const { address, isConnected } = useAccount()
  const userAddress = (address ?? EMPTY_ADDRESS) as Address

  const { data: completedCountData } = useReadContract({
    address: POMODORO_CONTRACT,
    abi: pomodoroAbi,
    functionName: "completedCount",
    args: [userAddress],
    query: {
      enabled: Boolean(address),
      refetchInterval: 5000
    }
  })

  const completedCount = Number(completedCountData ?? 0n)

  return (
    <main className="shell">
      <section className="card">
        <h1 className="title">Profile</h1>
        <p className="caption">Focus summary</p>

        <div className="meter">
          <p className="label">Wallet</p>
          <p className="address">{isConnected ? address : "Not connected"}</p>
        </div>

        <div className="meter">
          <p className="label">Completed Sessions</p>
          <p className="value">{completedCount}</p>
        </div>
      </section>

      <Navigation />
    </main>
  )
}
