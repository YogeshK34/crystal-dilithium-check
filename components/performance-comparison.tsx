"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { runEnhancedPerformanceBenchmark } from "@/lib/crypto-utils"

export function PerformanceComparison() {
  const [benchmarkResults, setBenchmarkResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)

  const runBenchmark = async () => {
    setLoading(true)
    setProgress(0)

    try {
      const results = await runEnhancedPerformanceBenchmark((progress) => {
        setProgress(progress)
      })
      setBenchmarkResults(results)
    } catch (error) {
      console.error("Benchmark failed:", error)
    } finally {
      setLoading(false)
      setProgress(100)
    }
  }

  const getAlgorithmName = (algo: string) => {
    const names: { [key: string]: string } = {
      dilithium3: "Dilithium 3 (Standard)",
      "dilithium3-optimized": "Dilithium 3 (Optimized)",
      "dilithium3-hybrid": "Dilithium 3 (Hybrid)",
      rsa2048: "RSA-2048",
      ecdsa: "ECDSA P-256",
    }
    return names[algo] || algo.toUpperCase()
  }

  const getSecurityBadgeColor = (algo: string) => {
    if (algo.includes("dilithium")) return "default"
    if (algo === "rsa2048") return "secondary"
    return "outline"
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Enhanced Performance Benchmark</CardTitle>
          <CardDescription>
            Compare Dilithium variants with optimizations against traditional algorithms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button onClick={runBenchmark} disabled={loading} className="w-full">
              {loading ? "Running Enhanced Benchmark..." : "Start Comprehensive Test"}
            </Button>
            {loading && (
              <div className="space-y-2">
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-muted-foreground text-center">
                  Testing algorithms with optimizations... {progress.toFixed(0)}%
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {benchmarkResults && (
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Key Generation Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(benchmarkResults.keyGeneration).map(([algo, data]: [string, any]) => (
                  <div key={algo} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">{getAlgorithmName(algo)}</span>
                      <span className="text-sm text-muted-foreground">{data.avgTime.toFixed(2)}ms avg</span>
                    </div>
                    <Progress value={(data.avgTime / benchmarkResults.maxKeyGenTime) * 100} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Signing Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(benchmarkResults.signing).map(([algo, data]: [string, any]) => (
                  <div key={algo} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">{getAlgorithmName(algo)}</span>
                      <span className="text-sm text-muted-foreground">{data.avgTime.toFixed(2)}ms avg</span>
                    </div>
                    <Progress value={(data.avgTime / benchmarkResults.maxSignTime) * 100} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Size Comparison with Optimizations</CardTitle>
              <CardDescription>
                Key and signature sizes showing the impact of various optimization techniques
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Object.entries(benchmarkResults.sizes).map(([algo, data]: [string, any]) => (
                  <div key={algo} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{getAlgorithmName(algo)}</h4>
                      <Badge variant={getSecurityBadgeColor(algo)}>
                        {algo.includes("dilithium") ? "Quantum-Safe" : "Classical"}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Public Key</span>
                        <span className="font-mono text-sm">{data.publicKey} bytes</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Signature</span>
                        <span className="font-mono text-sm">{data.signature} bytes</span>
                      </div>
                      {algo.includes("optimized") && (
                        <div className="text-xs text-green-600 font-medium">~28% smaller than standard Dilithium</div>
                      )}
                      {algo.includes("hybrid") && (
                        <div className="text-xs text-blue-600 font-medium">
                          ~98% smaller signatures in standard mode
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security Analysis & Tradeoffs</CardTitle>
              <CardDescription>
                Understanding the security implications and potential risks of each optimization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(benchmarkResults.securityAnalysis).map(([algo, analysis]: [string, any]) => (
                  <div key={algo} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{getAlgorithmName(algo)}</h4>
                      <Badge variant={getSecurityBadgeColor(algo)}>{analysis.security}</Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium text-muted-foreground">Tradeoffs: </span>
                        <span>{analysis.tradeoffs}</span>
                      </div>
                      <div>
                        <span className="font-medium text-muted-foreground">Risks: </span>
                        <span className={algo.includes("dilithium") ? "text-green-700" : "text-amber-700"}>
                          {analysis.risks}
                        </span>
                      </div>
                      <Alert className="mt-2">
                        <AlertDescription className="text-xs">
                          <strong>Recommendation:</strong> {analysis.recommendation}
                        </AlertDescription>
                      </Alert>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
