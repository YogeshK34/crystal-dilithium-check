// Ethereum transaction utilities for hybrid signature testing

export interface EthereumTransaction {
  to: string
  value: string
  gasLimit: string
  gasPrice: string
  nonce: number
  data: string
  chainId?: number
}

export interface NetworkInfo {
  connected: boolean
  networkName: string
  chainId: number
  blockNumber: number
}

export async function connectToLocalNetwork(): Promise<NetworkInfo> {
  try {
    // Try to connect to local Ethereum node (Hardhat/Ganache default)
    const response = await fetch("http://localhost:8545", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_chainId",
        params: [],
        id: 1,
      }),
    })

    if (!response.ok) {
      throw new Error("Network not reachable")
    }

    const chainIdResult = await response.json()
    const chainId = Number.parseInt(chainIdResult.result, 16)

    // Get block number
    const blockResponse = await fetch("http://localhost:8545", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_blockNumber",
        params: [],
        id: 2,
      }),
    })

    const blockResult = await blockResponse.json()
    const blockNumber = Number.parseInt(blockResult.result, 16)

    return {
      connected: true,
      networkName:
        chainId === 1337 ? "Hardhat Local" : chainId === 1337 ? "Ganache Local" : `Local Network (${chainId})`,
      chainId,
      blockNumber,
    }
  } catch (error) {
    console.error("Failed to connect to local network:", error)
    throw error
  }
}

export async function getBalance(address: string): Promise<string> {
  try {
    const response = await fetch("http://localhost:8545", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_getBalance",
        params: [address, "latest"],
        id: 4,
      }),
    })

    const result = await response.json()
    const balanceWei = Number.parseInt(result.result, 16)
    const balanceEth = balanceWei / 1e18
    return balanceEth.toFixed(4)
  } catch (error) {
    console.error("Failed to get balance:", error)
    throw error
  }
}

export async function sendTransaction(signedTx: any): Promise<string> {
  try {
    // Create a proper Ethereum transaction for broadcasting
    const rawTx = {
      to: signedTx.to,
      value: "0x" + (Number.parseFloat(signedTx.value) * 1e18).toString(16), // Convert ETH to Wei
      gas: "0x" + Number.parseInt(signedTx.gasLimit).toString(16),
      gasPrice: "0x" + (Number.parseInt(signedTx.gasPrice) * 1e9).toString(16), // Convert Gwei to Wei
      nonce: "0x" + signedTx.nonce.toString(16),
      data: signedTx.data || "0x",
    }

    console.log("[v0] Sending transaction:", rawTx)

    // For demo purposes, we'll simulate a successful transaction
    // In a real implementation, you'd need to properly encode and sign the transaction
    const mockTxHash = "0x" + Math.random().toString(16).substr(2, 64)

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    console.log("[v0] Transaction simulated with hash:", mockTxHash)
    return mockTxHash
  } catch (error) {
    console.error("Failed to send transaction:", error)
    throw error
  }
}

export async function getTransactionCount(address: string): Promise<number> {
  try {
    const response = await fetch("http://localhost:8545", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_getTransactionCount",
        params: [address, "latest"],
        id: 5,
      }),
    })

    const result = await response.json()
    return Number.parseInt(result.result, 16)
  } catch (error) {
    console.error("Failed to get transaction count:", error)
    return 0
  }
}

export function createEthereumTransaction(tx: {
  to: string
  value: string
  gasLimit: string
  gasPrice: string
  nonce: number
  data: string
  chainId?: number
}): EthereumTransaction {
  return {
    to: tx.to,
    value: Number.parseFloat(tx.value).toString(),
    gasLimit: tx.gasLimit,
    gasPrice: tx.gasPrice,
    nonce: tx.nonce,
    data: tx.data || "0x",
    chainId: tx.chainId || 1337, // Default to local testnet
  }
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 bytes"

  const k = 1024
  const sizes = ["bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

export function calculateTransactionHash(tx: EthereumTransaction): string {
  // Simplified transaction hash calculation for demo
  const txString = JSON.stringify(tx)
  let hash = 0
  for (let i = 0; i < txString.length; i++) {
    const char = txString.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return "0x" + Math.abs(hash).toString(16).padStart(64, "0")
}

export function estimateGasCost(gasLimit: string, gasPrice: string): string {
  const cost = (Number.parseInt(gasLimit) * Number.parseInt(gasPrice)) / 1e9 // Convert from Gwei to ETH
  return cost.toFixed(6)
}
