"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { KeyGenerationDemo } from "@/components/key-generation-demo"
import { SignatureDemo } from "@/components/signature-demo"
import { PerformanceComparison } from "@/components/performance-comparison"
import { AlgorithmInfo } from "@/components/algorithm-info"
import { OptimizationDemo } from "@/components/optimization-demo"

export default function DilithiumDemo() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 text-balance">CRYSTALS Dilithium Demo</h1>
          <p className="text-xl text-muted-foreground text-balance">
            Explore post-quantum digital signatures and compare with traditional algorithms
          </p>
          <div className="flex justify-center gap-2 mt-4">
            <Badge variant="secondary">Post-Quantum</Badge>
            <Badge variant="secondary">NIST Standardized</Badge>
            <Badge variant="secondary">ML-DSA</Badge>
          </div>
        </div>

        <Tabs defaultValue="info" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="info">Algorithm Info</TabsTrigger>
            <TabsTrigger value="keygen">Key Generation</TabsTrigger>
            <TabsTrigger value="signing">Signing & Verification</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="optimizations">Optimizations</TabsTrigger>
          </TabsList>

          <TabsContent value="info">
            <AlgorithmInfo />
          </TabsContent>

          <TabsContent value="keygen">
            <KeyGenerationDemo />
          </TabsContent>

          <TabsContent value="signing">
            <SignatureDemo />
          </TabsContent>

          <TabsContent value="performance">
            <PerformanceComparison />
          </TabsContent>

          <TabsContent value="optimizations">
            <OptimizationDemo />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
