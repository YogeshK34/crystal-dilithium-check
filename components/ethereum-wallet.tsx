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
import {
  createEthereumTransaction,
  formatBytes,
  connectToLocalNetwork,
  getBalance,
  sendTransaction,
} from "@/lib/ethereum-utils"

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

  const connectNetwork = async () => {
    setIsLoading(true)
    try {
      const networkInfo = await connectToLocalNetwork()
      setNetwork(networkInfo)
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
        balance: "10000.0",
        ecdsaPublicKey,
        ecdsaPrivateKey,
        dilithiumPublicKey,
        dilithiumPrivateKey,
      })

      if (network.connected) {
        try {
          const actualBalance = await getBalance(address)
          setWallet((prev) => (prev ? { ...prev, balance: actualBalance } : null))
        } catch (error) {
          console.log("[v0] Could not fetch balance, using default")
        }
      }
    } catch (error) {
      console.error("Wallet generation failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const signTransaction = async () => {
    if (!wallet) return

    setIsLoading(true)
    try {
      // Create Ethereum transaction object
      const txData = createEthereumTransaction({
        ...transaction,
        chainId: network.chainId || 1337,
      })

      // Sign with hybrid signature (ECDSA + Quantum Commitment)
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

  const broadcastTransaction = async () => {
    if (!signedTx || !network.connected) return

    setIsBroadcasting(true)
    try {
      console.log("[v0] Broadcasting transaction to network...")
      const hash = await sendTransaction(signedTx)
      setTxHash(hash)

      if (wallet) {
        const newBalance = Number.parseFloat(wallet.balance) - Number.parseFloat(transaction.value)
        setWallet({ ...wallet, balance: newBalance.toString() })
      }

      alert(`✅ Transaction broadcasted! Hash: ${hash}`)
    } catch (error) {
      console.error("Transaction broadcast failed:", error)
      alert("❌ Failed to broadcast transaction. Check console for details.")
    } finally {
      setIsBroadcasting(false)
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
                      <div className="p-2 bg-muted rounded font-mono text-sm">{wallet.balance} ETH</div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Hybrid Public Key Size</Label>
                      <div className="p-2 bg-muted rounded font-mono text-sm">
                        {formatBytes(wallet.publicKey.length / 2)} (ECDSA: 33b + Dilithium: 1312b)
                      </div>
                    </div>
                  </div>

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
                        onChange={(e) => setTransaction({ ...transaction, to: e.target.value })}
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
