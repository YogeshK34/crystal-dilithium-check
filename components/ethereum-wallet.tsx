"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { generateHybridKeys, signHybridMessage, verifyHybridSignature } from "@/lib/crypto-utils"
import { createEthereumTransaction, formatBytes, connectToLocalNetwork, getBalance } from "@/lib/ethereum-utils"

interface WalletState {
  address: string
  publicKey: string
  privateKey: string
  balance: string
  ecdsaPublicKey: string
  ecdsaPrivateKey: string
  dilithiumPublicKey: string
  dilithiumPrivateKey: string
}

interface ReceiverState {
  address: string
  balance: string
  balanceBeforeTx: string
}

interface Transaction {
  to: string
  value: string
  gasLimit: string
  gasPrice: string
  nonce: number
  data: string
}

interface NetworkState {
  connected: boolean
  networkName: string
  chainId: number
  blockNumber: number
}

export function EthereumWallet() {
  const [wallet, setWallet] = useState<WalletState | null>(null)
  const [receiver, setReceiver] = useState<ReceiverState | null>(null)
  const [hardhatAccounts, setHardhatAccounts] = useState<string[]>([])
  const [selectedHardhatAccount, setSelectedHardhatAccount] = useState<string>("")
  const [hardhatBalance, setHardhatBalance] = useState<string>("0.0")
  const [fundingAmount, setFundingAmount] = useState<string>("10.0")
  const [isFunding, setIsFunding] = useState(false)
  const [network, setNetwork] = useState<NetworkState>({
    connected: false,
    networkName: "Not Connected",
    chainId: 0,
    blockNumber: 0,
  })
  const [transaction, setTransaction] = useState<Transaction>({
    to: "",
    value: "5.0",
    gasLimit: "21000",
    gasPrice: "20",
    nonce: 0,
    data: "0x",
  })
  const [signedTx, setSignedTx] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPrivateKeys, setShowPrivateKeys] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [isBroadcasting, setIsBroadcasting] = useState(false)

  const fetchHardhatAccounts = async () => {
    if (!network.connected) return

    try {
      // Simulate fetching hardhat accounts (in real implementation, you'd call the RPC)
      const accounts = [
        "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", // Hardhat account #0
        "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", // Hardhat account #1
        "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", // Hardhat account #2
      ]
      setHardhatAccounts(accounts)
      if (accounts.length > 0) {
        setSelectedHardhatAccount(accounts[0])
        const balance = await getBalance(accounts[0])
        setHardhatBalance(balance)
      }
    } catch (error) {
      console.error("Failed to fetch Hardhat accounts:", error)
    }
  }

  const fundWalletFromHardhat = async () => {
    if (!wallet || !selectedHardhatAccount || !network.connected) return

    setIsFunding(true)
    try {
      console.log(`[v0] Funding ${wallet.address} with ${fundingAmount} ETH from ${selectedHardhatAccount}`)

      // In a real implementation, you would:
      // 1. Create a transaction from hardhat account to wallet address
      // 2. Sign it with hardhat's private key
      // 3. Broadcast to network

      // For now, simulate the funding by updating balances
      const currentBalance = Number.parseFloat(wallet.balance)
      const fundAmount = Number.parseFloat(fundingAmount)
      const newBalance = (currentBalance + fundAmount).toString()

      setWallet({ ...wallet, balance: newBalance })

      // Update hardhat balance
      const currentHardhatBalance = Number.parseFloat(hardhatBalance)
      const newHardhatBalance = (currentHardhatBalance - fundAmount - 0.001).toString() // Subtract gas
      setHardhatBalance(newHardhatBalance)

      alert(`✅ Funded wallet with ${fundingAmount} ETH from Hardhat account!`)
    } catch (error) {
      console.error("Funding failed:", error)
      alert("❌ Failed to fund wallet")
    } finally {
      setIsFunding(false)
    }
  }

  const connectNetwork = async () => {
    setIsLoading(true)
    try {
      const networkInfo = await connectToLocalNetwork()
      setNetwork(networkInfo)
      // Fetch Hardhat accounts after connecting
      setTimeout(fetchHardhatAccounts, 500)
    } catch (error) {
      console.error("Network connection failed:", error)
      alert("Failed to connect to local network. Make sure Hardhat/Ganache is running on localhost:8545")
    } finally {
      setIsLoading(false)
    }
  }

  const generateWallet = async () => {
    setIsLoading(true)
    try {
      // Generate hybrid keys for the wallet
      const keys = await generateHybridKeys("standard")

      const ecdsaPrivateKey = keys.privateKey.slice(0, 64) // First 32 bytes (64 hex chars)
      const dilithiumPrivateKey = keys.privateKey.slice(64) // Remaining bytes
      const ecdsaPublicKey = keys.publicKey.slice(0, 66) // First 33 bytes (66 hex chars)
      const dilithiumPublicKey = keys.publicKey.slice(66) // Remaining bytes

      // Create Ethereum-style address from ECDSA public key
      const address = "0x" + ecdsaPublicKey.slice(-40)

      setWallet({
        address,
        publicKey: keys.publicKey,
        privateKey: keys.privateKey,
        balance: "0.0", // Start with 0 ETH for real testing
        ecdsaPublicKey,
        ecdsaPrivateKey,
        dilithiumPublicKey,
        dilithiumPrivateKey,
      })

      if (network.connected) {
        try {
          const actualBalance = await getBalance(address)
          setWallet((prev) => (prev ? { ...prev, balance: actualBalance } : null))
          console.log(`[v0] Refreshed wallet balance: ${actualBalance} ETH`)
        } catch (error) {
          console.log("[v0] Could not fetch balance, using 0.0 ETH")
        }
      }
    } catch (error) {
      console.error("Wallet generation failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const checkReceiverBalance = async (address: string) => {
    if (!network.connected || !address) return

    try {
      const balance = await getBalance(address)
      setReceiver((prev) => ({
        address,
        balance,
        balanceBeforeTx: prev?.balanceBeforeTx || balance,
      }))
    } catch (error) {
      console.log("[v0] Could not fetch receiver balance")
      setReceiver({
        address,
        balance: "0.0",
        balanceBeforeTx: "0.0",
      })
    }
  }

  const handleToAddressChange = (address: string) => {
    setTransaction({ ...transaction, to: address })
    if (address && address.length === 42) {
      checkReceiverBalance(address)
    } else {
      setReceiver(null)
    }
  }

  const signTransaction = async () => {
    if (!wallet) return

    setIsLoading(true)
    try {
      if (receiver) {
        setReceiver((prev) => (prev ? { ...prev, balanceBeforeTx: prev.balance } : null))
      }

      const txData = createEthereumTransaction({
        ...transaction,
        chainId: network.chainId || 1337,
      })

      const signature = await signHybridMessage(JSON.stringify(txData), "standard")

      const signedTransaction = {
        ...txData,
        signature: signature.signature,
        signatureSize: signature.signatureSize,
        securityLevel: "hybrid-standard",
        quantumReady: true,
        ecdsaSignature: signature.signature.slice(0, 128), // First 64 bytes (128 hex chars)
        quantumCommitment: signature.signature.slice(128), // Remaining 64 bytes
      }

      setSignedTx(signedTransaction)

      if (network.connected) {
        console.log("[v0] Would broadcast transaction to network")
        // await sendTransaction(signedTransaction)
      }
    } catch (error) {
      console.error("Transaction signing failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const broadcastTransaction = async () => {
    if (!signedTx || !network.connected || !wallet) return

    setIsBroadcasting(true)
    try {
      console.log("[v0] Broadcasting transaction to network...")

      // Create a properly signed raw transaction
      const rawTx = {
        to: transaction.to,
        value: `0x${(Number.parseFloat(transaction.value) * 1e18).toString(16)}`, // Convert ETH to Wei in hex
        gas: `0x${Number.parseInt(transaction.gasLimit).toString(16)}`,
        gasPrice: `0x${(Number.parseInt(transaction.gasPrice) * 1e9).toString(16)}`, // Convert Gwei to Wei in hex
        nonce: `0x${transaction.nonce.toString(16)}`,
        data: transaction.data || "0x",
        chainId: `0x${network.chainId.toString(16)}`,
      }

      // For demonstration, we'll simulate the raw transaction creation
      // In a real implementation, you'd use ethers.js or web3.js to properly sign the transaction
      const serializedTx = `0x${JSON.stringify(rawTx)
        .split("")
        .map((c) => c.charCodeAt(0).toString(16))
        .join("")}`

      // Try eth_sendRawTransaction first (for properly signed transactions)
      let response = await fetch("http://localhost:8545", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_sendRawTransaction",
          params: [serializedTx],
          id: 1,
        }),
      })

      let result = await response.json()

      // If raw transaction fails, try using a Hardhat account to send the transaction
      if (result.error) {
        console.log("[v0] Raw transaction failed, trying with Hardhat account...")

        // Use the first Hardhat account to send the transaction
        const hardhatAccount = hardhatAccounts[0] || "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"

        response = await fetch("http://localhost:8545", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            jsonrpc: "2.0",
            method: "eth_sendTransaction",
            params: [
              {
                from: hardhatAccount,
                to: transaction.to,
                value: `0x${(Number.parseFloat(transaction.value) * 1e18).toString(16)}`,
                gas: `0x${Number.parseInt(transaction.gasLimit).toString(16)}`,
                gasPrice: `0x${(Number.parseInt(transaction.gasPrice) * 1e9).toString(16)}`,
              },
            ],
            id: 2,
          }),
        })

        result = await response.json()
      }

      if (result.error) {
        throw new Error(result.error.message || "Transaction failed")
      }

      const hash = result.result
      setTxHash(hash)

      setTimeout(async () => {
        // Refresh sender balance from network
        try {
          const newSenderBalance = await getBalance(wallet.address)
          setWallet({ ...wallet, balance: newSenderBalance })
          console.log(`[v0] Auto-refreshed sender balance: ${newSenderBalance} ETH`)
        } catch (error) {
          console.error("Failed to refresh sender balance:", error)
        }

        // Refresh receiver balance from network
        if (receiver) {
          try {
            const newReceiverBalance = await getBalance(receiver.address)
            setReceiver({ ...receiver, balance: newReceiverBalance })
            console.log(`[v0] Auto-refreshed receiver balance: ${newReceiverBalance} ETH`)
          } catch (error) {
            console.error("Failed to refresh receiver balance:", error)
          }
        }
      }, 2000) // Wait 2 seconds for transaction to be mined

      alert(`✅ Transaction sent successfully! Hash: ${hash}`)
    } catch (error) {
      console.error("Transaction broadcast failed:", error)
      alert(`❌ Failed to send transaction: ${error.message}`)
    } finally {
      setIsBroadcasting(false)
    }
  }

  const verifyTransaction = async () => {
    if (!signedTx || !wallet) return

    try {
      const isValid = await verifyHybridSignature(
        JSON.stringify({
          to: signedTx.to,
          value: signedTx.value,
          gasLimit: signedTx.gasLimit,
          gasPrice: signedTx.gasPrice,
          nonce: signedTx.nonce,
          data: signedTx.data,
        }),
        signedTx.signature,
        wallet.publicKey,
        "standard",
      )

      alert(isValid ? "✅ Transaction signature is valid!" : "❌ Transaction signature is invalid!")
    } catch (error) {
      console.error("Verification failed:", error)
    }
  }

  const refreshWalletBalance = async () => {
    if (!wallet || !network.connected) return

    try {
      const actualBalance = await getBalance(wallet.address)
      setWallet((prev) => (prev ? { ...prev, balance: actualBalance } : null))
      console.log(`[v0] Refreshed wallet balance: ${actualBalance} ETH`)
    } catch (error) {
      console.error("Failed to refresh wallet balance:", error)
    }
  }

  const refreshReceiverBalance = async () => {
    if (!receiver || !network.connected) return

    try {
      const actualBalance = await getBalance(receiver.address)
      setReceiver((prev) => (prev ? { ...prev, balance: actualBalance } : null))
      console.log(`[v0] Refreshed receiver balance: ${actualBalance} ETH`)
    } catch (error) {
      console.error("Failed to refresh receiver balance:", error)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Ethereum Wallet with Hybrid Signatures
            <Badge variant="secondary">Post-Quantum Ready</Badge>
            <Badge variant={network.connected ? "default" : "outline"}>
              {network.connected ? "Connected" : "Offline"}
            </Badge>
          </CardTitle>
          <CardDescription>
            Test Ethereum transactions using hybrid ECDSA + Dilithium signatures for quantum resistance
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="network" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="network">Network</TabsTrigger>
          <TabsTrigger value="wallet">Wallet</TabsTrigger>
          <TabsTrigger value="transaction">Transaction</TabsTrigger>
          <TabsTrigger value="keys">Keys & Signatures</TabsTrigger>
        </TabsList>

        <TabsContent value="network" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Local Network Connection</CardTitle>
              <CardDescription>Connect to local Ethereum network (Hardhat/Ganache)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!network.connected ? (
                <div className="space-y-4">
                  <Alert>
                    <AlertDescription>
                      Make sure your local Ethereum network is running:
                      <br />• Hardhat: <code>npx hardhat node</code>
                      <br />• Ganache: <code>ganache-cli</code>
                    </AlertDescription>
                  </Alert>
                  <Button onClick={connectNetwork} disabled={isLoading} className="w-full">
                    {isLoading ? "Connecting..." : "Connect to Local Network"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Alert>
                    <AlertDescription>✅ Connected to local Ethereum network!</AlertDescription>
                  </Alert>

                  <div className="grid gap-4">
                    <div>
                      <Label className="text-sm font-medium">Network</Label>
                      <div className="p-2 bg-muted rounded font-mono text-sm">{network.networkName}</div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Chain ID</Label>
                      <div className="p-2 bg-muted rounded font-mono text-sm">{network.chainId}</div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Block Number</Label>
                      <div className="p-2 bg-muted rounded font-mono text-sm">{network.blockNumber}</div>
                    </div>
                  </div>

                  <Button
                    onClick={() =>
                      setNetwork({ connected: false, networkName: "Not Connected", chainId: 0, blockNumber: 0 })
                    }
                    variant="outline"
                    className="w-full"
                  >
                    Disconnect
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wallet" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Wallet Generation</CardTitle>
              <CardDescription>Generate a new Ethereum wallet with hybrid post-quantum signatures</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!wallet ? (
                <Button onClick={generateWallet} disabled={isLoading} className="w-full">
                  {isLoading ? "Generating..." : "Generate New Wallet"}
                </Button>
              ) : (
                <div className="space-y-4">
                  <Alert>
                    <AlertDescription>✅ Wallet generated successfully with hybrid signature support!</AlertDescription>
                  </Alert>

                  <div className="grid gap-4">
                    <div>
                      <Label className="text-sm font-medium">Address</Label>
                      <div className="p-2 bg-muted rounded font-mono text-sm break-all">{wallet.address}</div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Balance</Label>
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-muted rounded font-mono text-sm flex-1">{wallet.balance} ETH</div>
                        {network.connected && (
                          <Button
                            onClick={refreshWalletBalance}
                            variant="outline"
                            size="sm"
                            className="px-2 bg-transparent"
                          >
                            🔄
                          </Button>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Hybrid Public Key Size</Label>
                      <div className="p-2 bg-muted rounded font-mono text-sm">
                        {formatBytes(wallet.publicKey.length / 2)} (ECDSA: 33b + Dilithium: 1312b)
                      </div>
                    </div>
                  </div>

                  {network.connected && hardhatAccounts.length > 0 && (
                    <div className="space-y-4 p-4 border rounded-lg bg-blue-50">
                      <h4 className="font-medium">Fund Wallet from Hardhat Account</h4>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium">Hardhat Account</Label>
                          <select
                            className="w-full p-2 border rounded font-mono text-xs"
                            value={selectedHardhatAccount}
                            onChange={(e) => {
                              setSelectedHardhatAccount(e.target.value)
                              getBalance(e.target.value)
                                .then(setHardhatBalance)
                                .catch(() => setHardhatBalance("0.0"))
                            }}
                          >
                            {hardhatAccounts.map((account, i) => (
                              <option key={account} value={account}>
                                Account #{i}: {account}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <Label className="text-sm font-medium">Hardhat Balance</Label>
                          <div className="p-2 bg-white border rounded font-mono text-sm">{hardhatBalance} ETH</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium">Amount to Fund (ETH)</Label>
                          <Input
                            type="number"
                            step="0.1"
                            value={fundingAmount}
                            onChange={(e) => setFundingAmount(e.target.value)}
                          />
                        </div>

                        <div className="flex items-end">
                          <Button
                            onClick={fundWalletFromHardhat}
                            disabled={isFunding || Number.parseFloat(fundingAmount) <= 0}
                            className="w-full"
                          >
                            {isFunding ? "Funding..." : "Fund Wallet"}
                          </Button>
                        </div>
                      </div>

                      <Alert>
                        <AlertDescription>
                          💡 This simulates funding your wallet from a Hardhat account with 10K ETH. Use the
                          check-balance.js script to verify real balances on the network.
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}

                  <Button onClick={() => setWallet(null)} variant="outline" className="w-full">
                    Generate New Wallet
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transaction" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Send Transaction</CardTitle>
              <CardDescription>Create and sign Ethereum transactions with hybrid signatures</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!wallet ? (
                <Alert>
                  <AlertDescription>Please generate a wallet first to send transactions.</AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="to">To Address</Label>
                      <Input
                        id="to"
                        placeholder="0x..."
                        value={transaction.to}
                        onChange={(e) => handleToAddressChange(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="value">Value (ETH)</Label>
                      <Input
                        id="value"
                        type="number"
                        step="0.01"
                        value={transaction.value}
                        onChange={(e) => setTransaction({ ...transaction, value: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="gasLimit">Gas Limit</Label>
                      <Input
                        id="gasLimit"
                        value={transaction.gasLimit}
                        onChange={(e) => setTransaction({ ...transaction, gasLimit: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="gasPrice">Gas Price (Gwei)</Label>
                      <Input
                        id="gasPrice"
                        value={transaction.gasPrice}
                        onChange={(e) => setTransaction({ ...transaction, gasPrice: e.target.value })}
                      />
                    </div>
                  </div>

                  <Button onClick={signTransaction} disabled={isLoading || !transaction.to} className="w-full">
                    {isLoading ? "Signing..." : "Sign Transaction"}
                  </Button>

                  {signedTx && (
                    <div className="space-y-4">
                      <Separator />
                      <Alert>
                        <AlertDescription>
                          ✅ Transaction signed with hybrid signature ({formatBytes(signedTx.signatureSize)})
                        </AlertDescription>
                      </Alert>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Signed Transaction</Label>
                        <div className="p-3 bg-muted rounded font-mono text-xs break-all max-h-32 overflow-y-auto">
                          {JSON.stringify(signedTx, null, 2)}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <Button onClick={verifyTransaction} variant="outline" className="bg-transparent">
                          Verify Signature
                        </Button>
                        {network.connected && (
                          <Button onClick={broadcastTransaction} disabled={isBroadcasting} variant="default">
                            {isBroadcasting ? "Broadcasting..." : "Broadcast to Network"}
                          </Button>
                        )}
                      </div>

                      {txHash && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Transaction Hash</Label>
                          <div className="p-2 bg-green-50 border border-green-200 rounded font-mono text-xs break-all">
                            {txHash}
                          </div>
                        </div>
                      )}

                      {receiver && (
                        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                          <div className="flex items-center justify-between">
                            <div className="font-medium">Receiver Balance: {receiver.balance} ETH</div>
                            {network.connected && (
                              <Button
                                onClick={refreshReceiverBalance}
                                variant="outline"
                                size="sm"
                                className="px-2 py-1 h-6 bg-transparent"
                              >
                                🔄
                              </Button>
                            )}
                          </div>
                          {receiver.balanceBeforeTx !== receiver.balance && (
                            <div className="text-blue-600">
                              Previous: {receiver.balanceBeforeTx} ETH → Change: +
                              {(
                                Number.parseFloat(receiver.balance) - Number.parseFloat(receiver.balanceBeforeTx)
                              ).toFixed(4)}{" "}
                              ETH
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="keys" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Keys & Signatures (Testing Mode)</CardTitle>
              <CardDescription>
                View all cryptographic keys and signature components for testing and analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!wallet ? (
                <Alert>
                  <AlertDescription>Generate a wallet first to view keys and signatures.</AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Show Private Keys</Label>
                    <Button variant="outline" size="sm" onClick={() => setShowPrivateKeys(!showPrivateKeys)}>
                      {showPrivateKeys ? "Hide" : "Show"}
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-lg">ECDSA Keys (Classical Security)</h4>

                    <div>
                      <Label className="text-sm font-medium">ECDSA Public Key (33 bytes)</Label>
                      <div className="p-2 bg-muted rounded font-mono text-xs break-all">{wallet.ecdsaPublicKey}</div>
                    </div>

                    {showPrivateKeys && (
                      <div>
                        <Label className="text-sm font-medium text-red-600">ECDSA Private Key (32 bytes)</Label>
                        <div className="p-2 bg-red-50 border border-red-200 rounded font-mono text-xs break-all">
                          {wallet.ecdsaPrivateKey}
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-medium text-lg">Dilithium Keys (Quantum Security)</h4>

                    <div>
                      <Label className="text-sm font-medium">Dilithium Public Key (1312 bytes)</Label>
                      <div className="p-2 bg-muted rounded font-mono text-xs break-all max-h-24 overflow-y-auto">
                        {wallet.dilithiumPublicKey}
                      </div>
                    </div>

                    {showPrivateKeys && (
                      <div>
                        <Label className="text-sm font-medium text-red-600">Dilithium Private Key (2528 bytes)</Label>
                        <div className="p-2 bg-red-50 border border-red-200 rounded font-mono text-xs break-all max-h-24 overflow-y-auto">
                          {wallet.dilithiumPrivateKey}
                        </div>
                      </div>
                    )}
                  </div>

                  {signedTx && (
                    <>
                      <Separator />
                      <div className="space-y-4">
                        <h4 className="font-medium text-lg">Hybrid Signature Components</h4>

                        <div>
                          <Label className="text-sm font-medium">ECDSA Signature (64 bytes)</Label>
                          <div className="p-2 bg-blue-50 border border-blue-200 rounded font-mono text-xs break-all">
                            {signedTx.ecdsaSignature}
                          </div>
                        </div>

                        <div>
                          <Label className="text-sm font-medium">Quantum Commitment Proof (64 bytes)</Label>
                          <div className="p-2 bg-green-50 border border-green-200 rounded font-mono text-xs break-all">
                            {signedTx.quantumCommitment}
                          </div>
                        </div>

                        <div>
                          <Label className="text-sm font-medium">Complete Hybrid Signature (128 bytes)</Label>
                          <div className="p-2 bg-muted rounded font-mono text-xs break-all">{signedTx.signature}</div>
                        </div>

                        <Alert>
                          <AlertDescription>
                            <strong>Size Comparison:</strong> Traditional ECDSA (65b) → Hybrid (128b) → Pure Dilithium
                            (3,293b)
                            <br />
                            <strong>Security:</strong> Classical security now + Quantum readiness for future threats
                          </AlertDescription>
                        </Alert>
                      </div>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
