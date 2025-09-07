"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { generateDilithiumKeys, generateRSAKeys, generateECDSAKeys } from "@/lib/crypto-utils"

export function KeyGenerationDemo() {
  const [keys, setKeys] = useState<any>(null)
  const [algorithm, setAlgorithm] = useState<string>("")
  const [loading, setLoading] = useState(false)

  const handleKeyGeneration = async (algo: string) => {
    setLoading(true)
    setAlgorithm(algo)

    try {
      let generatedKeys
      const startTime = performance.now()

      switch (algo) {
        case "dilithium3":
          generatedKeys = await generateDilithiumKeys("dilithium3")
          break
        case "rsa2048":
          generatedKeys = await generateRSAKeys(2048)
          break
        case "ecdsa":
          generatedKeys = await generateECDSAKeys()
          break
        default:
          throw new Error("Unknown algorithm")
      }

      const endTime = performance.now()
      generatedKeys.generationTime = endTime - startTime

      setKeys(generatedKeys)
    } catch (error) {
      console.error("Key generation failed:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Key Generation Comparison</CardTitle>
          <CardDescription>Generate and compare key pairs across different algorithms</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button
              onClick={() => handleKeyGeneration("dilithium3")}
              disabled={loading}
              variant={algorithm === "dilithium3" ? "default" : "outline"}
            >
              Generate Dilithium3 Keys
            </Button>
            <Button
              onClick={() => handleKeyGeneration("rsa2048")}
              disabled={loading}
              variant={algorithm === "rsa2048" ? "default" : "outline"}
            >
              Generate RSA-2048 Keys
            </Button>
            <Button
              onClick={() => handleKeyGeneration("ecdsa")}
              disabled={loading}
              variant={algorithm === "ecdsa" ? "default" : "outline"}
            >
              Generate ECDSA Keys
            </Button>
          </div>
        </CardContent>
      </Card>

      {keys && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Key Metrics
                <Badge variant="secondary">{algorithm.toUpperCase()}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Public Key Size</p>
                  <p className="text-2xl font-bold text-primary">{keys.publicKeySize} bytes</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Private Key Size</p>
                  <p className="text-2xl font-bold text-primary">{keys.privateKeySize} bytes</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Generation Time</p>
                  <p className="text-2xl font-bold text-primary">{keys.generationTime.toFixed(2)}ms</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Security Level</p>
                  <p className="text-2xl font-bold text-primary">{keys.securityLevel}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Public Key Preview</CardTitle>
              <CardDescription>First 200 characters of the public key</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={keys.publicKey.substring(0, 200) + "..."}
                readOnly
                className="font-mono text-xs"
                rows={8}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
