"use client"

import { useMemo, useState } from "react"
import { type Address, type Hex } from "viem"
import { useAccount, useConnect, useDisconnect, usePublicClient, useReadContract, useWriteContract } from "wagmi"
import { Navigation } from "@/components/navigation"
import { DATA_SUFFIX, POMODORO_CONTRACT, pomodoroAbi } from "@/lib/web3"
import { trackTransaction } from "@/utils/track"

const EMPTY_ADDRESS = "0x0000000000000000000000000000000000000000" as Address

function formatTime(seconds: number) {
  const safeSeconds = Math.max(0, seconds)
  const m = Math.floor(safeSeconds / 60)
  const s = safeSeconds % 60
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

export default function HomePage() {
  const { address, isConnected } = useAccount()
  const { connectors, connectAsync, isPending: isConnecting } = useConnect()
  const { disconnect } = useDisconnect()
  const { writeContractAsync } = useWriteContract()
  const publicClient = usePublicClient()

  const [pendingAction, setPendingAction] = useState<"startSession" | "completeSession" | "cancelSession" | null>(null)
  const [txHash, setTxHash] = useState<Hex | null>(null)
  const [errorText, setErrorText] = useState("")

  const userAddress = (address ?? EMPTY_ADDRESS) as Address

  const { data: timeLeftData, refetch: refetchTimeLeft } = useReadContract({
    address: POMODORO_CONTRACT,
    abi: pomodoroAbi,
    functionName: "timeLeft",
    args: [userAddress],
    query: {
      enabled: Boolean(address),
      refetchInterval: 1000
    }
  })

  const { data: completedCountData, refetch: refetchCompletedCount } = useReadContract({
    address: POMODORO_CONTRACT,
    abi: pomodoroAbi,
    functionName: "completedCount",
    args: [userAddress],
    query: {
      enabled: Boolean(address),
      refetchInterval: 5000
    }
  })

  const timeLeft = useMemo(() => Number(timeLeftData ?? 0n), [timeLeftData])
  const completedCount = useMemo(() => Number(completedCountData ?? 0n), [completedCountData])
  const isFocusing = timeLeft > 0

  async function runAction(action: "startSession" | "completeSession" | "cancelSession") {
    if (!address || !publicClient) return

    setErrorText("")
    setPendingAction(action)
    try {
      const hash = await writeContractAsync({
        address: POMODORO_CONTRACT,
        abi: pomodoroAbi,
        functionName: action,
        args: [],
        dataSuffix: DATA_SUFFIX
      })

      setTxHash(hash)
      const receipt = await publicClient.waitForTransactionReceipt({ hash })

      if (receipt.status !== "success") {
        throw new Error("Transaction reverted")
      }

      await trackTransaction("app-002", "Pomodoro", address, hash)
      await Promise.all([refetchTimeLeft(), refetchCompletedCount()])
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : "Transaction failed")
    } finally {
      setPendingAction(null)
    }
  }

  async function handleConnect() {
    const preferred = connectors.find((connector) => connector.id.includes("coinbase")) ?? connectors[0]
    if (!preferred) return
    await connectAsync({ connector: preferred })
  }

  return (
    <main className="shell">
      <section className="card">
        <h1 className="title">Pomodoro</h1>
        <p className="caption">Onchain focus timer</p>

        {!isConnected ? (
          <button type="button" className="btn btn-primary" disabled={isConnecting} onClick={handleConnect}>
            {isConnecting ? "Connecting..." : "Connect Wallet"}
          </button>
        ) : (
          <div className="wallet-row">
            <span className="small">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
            <button type="button" className="btn btn-ghost" onClick={() => disconnect()}>
              Disconnect
            </button>
          </div>
        )}

        <div className="meter">
          <p className="label">Status</p>
          <p className="value">{isConnected ? (isFocusing ? "Focusing" : "Idle") : "Disconnected"}</p>
        </div>

        <div className="timer">{formatTime(timeLeft)}</div>

        <div className="actions">
          <button
            type="button"
            className="btn btn-primary"
            disabled={!isConnected || pendingAction !== null}
            onClick={() => runAction("startSession")}
          >
            {pendingAction === "startSession" ? "Starting..." : "Start"}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            disabled={!isConnected || pendingAction !== null}
            onClick={() => runAction("completeSession")}
          >
            {pendingAction === "completeSession" ? "Completing..." : "Complete"}
          </button>
          <button
            type="button"
            className="btn btn-outline"
            disabled={!isConnected || pendingAction !== null}
            onClick={() => runAction("cancelSession")}
          >
            {pendingAction === "cancelSession" ? "Canceling..." : "Cancel"}
          </button>
        </div>

        <div className="stats">
          <p className="small">Completed: {completedCount}</p>
          {txHash ? (
            <a className="hash" href={`https://basescan.org/tx/${txHash}`} target="_blank" rel="noreferrer">
              {txHash.slice(0, 12)}...{txHash.slice(-8)}
            </a>
          ) : (
            <p className="small">No tx yet</p>
          )}
        </div>

        {errorText ? <p className="error">{errorText}</p> : null}
      </section>

      <Navigation />
    </main>
  )
}
