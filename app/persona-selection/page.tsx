"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Briefcase, Tag, CheckCircle, ChevronDown, Search, Bell, HelpCircle, User } from "lucide-react"

type Persona = "product-manager" | "sales" | "qa-tester" | null

export default function PersonaSelectionPage() {
  const [selectedPersona, setSelectedPersona] = useState<Persona>(null)
  const router = useRouter()

  const handleContinue = () => {
    if (selectedPersona) {
      // Navigate to next step with selected persona
      router.push(`/workflow?persona=${selectedPersona}`)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="border-b border-slate-700 bg-slate-800">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-lg font-bold text-white">Zuora Seed</span>
              <span className="rounded bg-cyan-500 px-2 py-0.5 text-xs font-semibold text-white">v0</span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-400">Viewing:</span>
              <button className="flex items-center gap-2 rounded-md border border-slate-600 bg-slate-700 px-3 py-1.5 text-sm text-white hover:bg-slate-600">
                ACME Corp Global
                <ChevronDown className="h-4 w-4" />
              </button>
              <span className="rounded-full bg-green-500 px-2 py-0.5 text-xs font-medium text-white">Active</span>
            </div>

            <div className="ml-4 flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search Config IDs, Audit Reports..."
                  className="w-64 rounded-md border border-slate-600 bg-slate-700 py-1.5 pl-10 pr-4 text-sm text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
              <button className="relative text-slate-300 hover:text-white">
                <Bell className="h-5 w-5" />
                <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-cyan-500"></span>
              </button>
              <button className="text-slate-300 hover:text-white">
                <HelpCircle className="h-5 w-5" />
              </button>
              <button className="text-slate-300 hover:text-white">
                <User className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 px-6 py-16">
        <div className="mx-auto max-w-6xl">
          {/* Title Section */}
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-bold text-gray-900">Choose Your Persona</h1>
            <p className="mt-4 text-lg text-gray-600">
              Select how you'd like to use Zuora Seed. Each persona customizes your workflow.
            </p>
          </div>

          {/* Persona Cards Grid */}
          <div className="mb-12 grid gap-6 md:grid-cols-3">
            {/* Product Manager Card */}
            <button
              onClick={() => setSelectedPersona("product-manager")}
              className={`group relative rounded-xl border-2 bg-white p-6 text-left shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                selectedPersona === "product-manager"
                  ? "border-blue-500 shadow-blue-200"
                  : "border-transparent hover:shadow-blue-100"
              }`}
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="rounded-lg bg-blue-100 p-3">
                  <Briefcase className="h-6 w-6 text-blue-600" />
                </div>
                {selectedPersona === "product-manager" && (
                  <div className="rounded-full bg-blue-500 p-1">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                )}
              </div>
              <h3 className="mb-2 text-xl font-bold text-gray-900">Product Manager</h3>
              <p className="mb-2 text-sm font-medium text-gray-700">Review and approve product and pricing setup.</p>
              <p className="mb-4 text-sm text-gray-500">Define catalogs, rate plans, and charges.</p>
              <div className="mt-auto">
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                  Planning & Governance
                </span>
              </div>
            </button>

            {/* Sales Card */}
            <button
              onClick={() => setSelectedPersona("sales")}
              className={`group relative rounded-xl border-2 bg-white p-6 text-left shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                selectedPersona === "sales"
                  ? "border-cyan-500 shadow-cyan-200"
                  : "border-transparent hover:border-cyan-200 hover:shadow-cyan-100"
              }`}
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="rounded-lg bg-cyan-100 p-3">
                  <Tag className="h-6 w-6 text-cyan-600" />
                </div>
                {selectedPersona === "sales" && (
                  <div className="rounded-full bg-cyan-500 p-1">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                )}
              </div>
              <h3 className="mb-2 text-xl font-bold text-gray-900">Sales</h3>
              <p className="mb-2 text-sm font-medium text-gray-700">Manage catalogs, offers, and customer packages.</p>
              <p className="mb-4 text-sm text-gray-500">Bridge product and customer operations.</p>
              <div className="mt-auto">
                <span className="inline-flex items-center gap-1 rounded-full bg-cyan-100 px-3 py-1 text-xs font-medium text-cyan-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-500"></span>
                  Catalog & Offers
                </span>
              </div>
            </button>

            {/* QA / Tester Card */}
            <button
              onClick={() => setSelectedPersona("qa-tester")}
              className={`group relative rounded-xl border-2 bg-white p-6 text-left shadow-md transition-all duration-300 hover:-translate-y-1 ${
                selectedPersona === "qa-tester"
                  ? "border-green-500 shadow-green-200 shadow-xl"
                  : "border-transparent hover:shadow-xl hover:shadow-green-100"
              }`}
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="rounded-lg bg-green-100 p-3">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                {selectedPersona === "qa-tester" && (
                  <div className="rounded-full bg-green-500 p-1">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                )}
              </div>
              <h3 className="mb-2 text-xl font-bold text-gray-900">QA / Tester</h3>
              <p className="mb-2 text-sm font-medium text-gray-700">Validate and simulate billing scenarios.</p>
              <p className="mb-4 text-sm text-gray-500">Run tests, preview charges, and verify plans.</p>
              <div className="mt-auto">
                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                  Validation & Accuracy
                </span>
              </div>
            </button>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-center gap-4">
            <Link href="/" className="text-sm font-medium text-gray-600 hover:text-gray-900">
              Back
            </Link>
            <button
              onClick={handleContinue}
              disabled={!selectedPersona}
              className={`rounded-lg px-8 py-3 text-sm font-semibold text-white transition-all ${
                selectedPersona ? "bg-blue-600 hover:bg-blue-700 hover:shadow-lg" : "cursor-not-allowed bg-gray-300"
              }`}
            >
              Continue
            </button>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-200 bg-white py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-6 text-sm">
            <span className="font-medium text-gray-700">System Status:</span>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500"></span>
              <span className="text-gray-600">Core</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500"></span>
              <span className="text-gray-600">API Sync</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500"></span>
              <span className="text-gray-600">Billing Engine</span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>Zuora Seed © 2025</span>
            <span className="text-gray-300">|</span>
            <Link href="/terms" className="hover:text-gray-900">
              Terms of Service
            </Link>
            <span className="text-gray-300">|</span>
            <Link href="/privacy" className="hover:text-gray-900">
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
