"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { signMessage, verifySignature } from "@/lib/crypto-utils"

export function SignatureDemo() {
  const [message, setMessage] = useState("Hello, post-quantum world!")
  const [signature, setSignature] = useState<any>(null)
  const [verification, setVerification] = useState<boolean | null>(null)
  const [algorithm, setAlgorithm] = useState<string>("")
  const [loading, setLoading] = useState(false)

  const handleSigning = async (algo: string) => {
    setLoading(true)
    setAlgorithm(algo)
    setVerification(null)

    try {
      const startTime = performance.now()
      const result = await signMessage(message, algo)
      const endTime = performance.now()

      result.signingTime = endTime - startTime
      setSignature(result)
    } catch (error) {
      console.error("Signing failed:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleVerification = async () => {
    if (!signature) return

    setLoading(true)
    try {
      const startTime = performance.now()
      const isValid = await verifySignature(message, signature.signature, signature.publicKey, algorithm)
      const endTime = performance.now()

      setVerification(isValid)
      setSignature((prev) => ({ ...prev, verificationTime: endTime - startTime }))
    } catch (error) {
      console.error("Verification failed:", error)
      setVerification(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Digital Signature Testing</CardTitle>
          <CardDescription>Sign messages and verify signatures with different algorithms</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Message to Sign</label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your message here..."
              rows={3}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Button
              onClick={() => handleSigning("dilithium3")}
              disabled={loading || !message.trim()}
              variant={algorithm === "dilithium3" ? "default" : "outline"}
            >
              Sign with Dilithium3
            </Button>
            <Button
              onClick={() => handleSigning("rsa2048")}
              disabled={loading || !message.trim()}
              variant={algorithm === "rsa2048" ? "default" : "outline"}
            >
              Sign with RSA-2048
            </Button>
            <Button
              onClick={() => handleSigning("ecdsa")}
              disabled={loading || !message.trim()}
              variant={algorithm === "ecdsa" ? "default" : "outline"}
            >
              Sign with ECDSA
            </Button>
          </div>
        </CardContent>
      </Card>

      {signature && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Signature Metrics
                <Badge variant="secondary">{algorithm.toUpperCase()}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Signature Size</p>
                  <p className="text-2xl font-bold text-primary">{signature.signatureSize} bytes</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Signing Time</p>
                  <p className="text-2xl font-bold text-primary">{signature.signingTime.toFixed(2)}ms</p>
                </div>
                {signature.verificationTime && (
                  <div>
                    <p className="text-sm font-medium">Verification Time</p>
                    <p className="text-2xl font-bold text-primary">{signature.verificationTime.toFixed(2)}ms</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium">Status</p>
                  {verification === null ? (
                    <Button onClick={handleVerification} disabled={loading} size="sm">
                      Verify Signature
                    </Button>
                  ) : (
                    <Badge variant={verification ? "default" : "destructive"}>
                      {verification ? "Valid" : "Invalid"}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Signature Preview</CardTitle>
              <CardDescription>First 200 characters of the signature</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={signature.signature.substring(0, 200) + "..."}
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
