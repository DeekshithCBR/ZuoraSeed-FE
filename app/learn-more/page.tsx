import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function LearnMorePage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200">
        <div className="mx-auto flex h-16 max-w-7xl items-center px-6">
          <div className="text-xl font-semibold text-gray-900">Zuora Seed</div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-12">
        <Link href="/">
          <Button variant="ghost" className="mb-8 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Welcome
          </Button>
        </Link>

        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900">About Zuora Seed</h1>
          <p className="text-gray-600">
            Learn more about how Zuora Seed can help you configure your products, rate plans, and subscriptions with
            AI-powered intelligence.
          </p>
        </div>
      </main>
    </div>
  )
}
