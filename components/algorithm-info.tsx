import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function AlgorithmInfo() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>CRYSTALS Dilithium (ML-DSA)</CardTitle>
          <CardDescription>Post-quantum digital signature algorithm</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Key Features</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Quantum-resistant security</li>
              <li>• Based on lattice problems</li>
              <li>• NIST standardized (FIPS 204)</li>
              <li>• Three security levels available</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Security Levels</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">ML-DSA-44 (Dilithium2)</span>
                <Badge variant="outline">Level 1</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">ML-DSA-65 (Dilithium3)</span>
                <Badge variant="secondary">Level 3 (Recommended)</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">ML-DSA-87 (Dilithium5)</span>
                <Badge variant="outline">Level 5</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Traditional Algorithms</CardTitle>
          <CardDescription>Current widely-used signature schemes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">RSA</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Based on integer factorization</li>
              <li>• Vulnerable to quantum attacks</li>
              <li>• Large key sizes (2048-4096 bits)</li>
              <li>• Widely deployed</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">ECDSA</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Based on elliptic curve discrete log</li>
              <li>• Vulnerable to quantum attacks</li>
              <li>• Smaller keys than RSA</li>
              <li>• Fast performance</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
