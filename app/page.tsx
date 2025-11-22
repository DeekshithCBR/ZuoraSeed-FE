"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronDown,
  Search,
  Bell,
  HelpCircle,
  User,
  Briefcase,
  Tag,
  CheckCircle,
  Layers,
} from "lucide-react";

type Persona = "product-manager" | "sales" | "qa" | "architect" | null;

export default function WelcomePage() {
  const [selectedPersona, setSelectedPersona] = useState<Persona>(null);
  const router = useRouter();



  const handleGetStarted = (personaId: Persona) => {
    if (personaId) {
      router.push(`/workspace/${personaId}`);
    }
  };

  
  const personas = [
    {
      id: "product-manager" as const,
      title: "Product Manager",
      description: "Review and approve product and pricing setup.",
      badge: "Planning & Governance",
      icon: Briefcase,
      color: "blue",
      ctaLabel: "Open Product Manager Workspace",
    },
    {
      id: "architect" as const,
      title: "Architect",
      description:
        "Design and govern multi-module configurations across environments.",
      badge: "Architecture & Integration",
      icon: Layers,
      color: "purple",
      ctaLabel: "Open Architect Console",
    },

    {
      id: "qa" as const,
      title: "QA / Tester",
      description: "Validate and simulate billing scenarios.",
      badge: "Validation & Accuracy",
      icon: CheckCircle,
      color: "green",
      ctaLabel: "Open QA Workspace",
    },
    {
      id: "sales" as const,
      title: "Sales",
      description: "Manage catalogs, offers, and customer packages.",
      badge: "Catalog & Offers",
      icon: Tag,
      color: "blue",
      ctaLabel: "Open Sales Workspace",
    },
  ];

  const getButtonLabel = () => {
    if (!selectedPersona) return "Get Started";
    return (
      personas.find((p) => p.id === selectedPersona)?.ctaLabel || "Get Started"
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
          {/* Logo with badge */}
          <div className="flex items-center gap-3">
            <div className="text-xl font-bold text-white">Zuora Seed</div>
            <span className="rounded bg-cyan-500 px-2 py-0.5 text-xs font-semibold text-white">
              v1
            </span>
          </div>

          {/* Center - Workspace Dropdown */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-300">Viewing:</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="gap-2 border-slate-600 bg-slate-700 text-white hover:bg-slate-600 hover:text-white"
                >
                  <span className="text-sm">Acme Corp Global</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-56">
                <DropdownMenuItem>Acme Corp Global</DropdownMenuItem>
                <DropdownMenuItem>Switch Workspace</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs font-medium text-green-400">
              Active
            </span>
          </div>

          {/* Right - Search and Icons */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search Config IDs, Audit Reports..."
                className="h-9 w-64 rounded-md border border-slate-600 bg-slate-700 pl-9 pr-3 text-sm text-white placeholder:text-gray-400 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
            <button className="relative text-gray-300 hover:text-white">
              <Bell className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-cyan-500" />
            </button>
            <button className="text-gray-300 hover:text-white">
              <HelpCircle className="h-5 w-5" />
            </button>
            <button className="text-gray-300 hover:text-white">
              <User className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-16">
        {/* Title Section */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900">
            Welcome to Zuora Seed
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Your AI-powered workspace for building and managing Zuora
            configurations.
          </p>
        </div>

        <p className="mb-8 text-left text-2xl font-semibold text-gray-700">
          Choose your persona to get started
        </p>

        <div
          className="mb-12 grid gap-6 md:grid-cols-2"
          role="radiogroup"
          aria-label="Select your persona"
        >
          {personas.map((persona) => {
            const Icon = persona.icon;
            const isSelected = selectedPersona === persona.id;

            const colorClasses = {
              blue: {
                border: isSelected
                  ? "border-[#2B6CF3] shadow-[#2B6CF3]/20"
                  : "border-gray-200 hover:border-[#2B6CF3]/30",
                icon: "bg-blue-100 text-blue-600",
                badge: "bg-blue-100 text-blue-700",
                badgeDot: "bg-blue-500",
                checkmark: "bg-[#2B6CF3]",
                glow: isSelected
                  ? "shadow-xl shadow-[#2B6CF3]/20"
                  : "hover:shadow-lg",
              },
              green: {
                border: isSelected
                  ? "border-green-500 shadow-green-500/20"
                  : "border-gray-200 hover:border-green-300",
                icon: "bg-green-100 text-green-600",
                badge: "bg-green-100 text-green-700",
                badgeDot: "bg-green-500",
                checkmark: "bg-green-500",
                glow: isSelected
                  ? "shadow-xl shadow-green-500/20"
                  : "hover:shadow-lg",
              },
              purple: {
                border: isSelected
                  ? "border-purple-500 shadow-purple-500/20"
                  : "border-gray-200 hover:border-purple-300",
                icon: "bg-purple-100 text-purple-600",
                badge: "bg-purple-100 text-purple-700",
                badgeDot: "bg-purple-500",
                checkmark: "bg-purple-500",
                glow: isSelected
                  ? "shadow-xl shadow-purple-500/20"
                  : "hover:shadow-lg",
              },
            }[persona.color];

            return (
              <button
                key={persona.id}

                onClick={() => {
                  setSelectedPersona(persona.id);
                  handleGetStarted(persona.id); // 🔥 trigger navigation on click
                }}


                role="radio"
                aria-checked={isSelected}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedPersona(persona.id);

                  }
                  handleGetStarted(persona.id); // 🔥 trigger navigation on click


                }}
                className={`group relative rounded-xl border-2 bg-white p-6 text-left transition-all duration-200 hover:-translate-y-1 ${colorClasses.border} ${colorClasses.glow}`}
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className={`rounded-lg p-3 ${colorClasses.icon}`}>
                    <Icon className="h-7 w-7" />
                  </div>
                  {isSelected && (
                    <div
                      className={`rounded-full p-1 ${colorClasses.checkmark}`}
                    >
                      <CheckCircle className="h-5 w-5 text-white" />
                    </div>
                  )}
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-900">
                  {persona.title}
                </h3>
                <p className="mb-4 text-sm text-gray-600">
                  {persona.description}
                </p>
                <div className="mt-auto">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${colorClasses.badge}`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${colorClasses.badgeDot}`}
                    ></span>
                    {persona.badge}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* <div className="flex flex-col items-center gap-3">
          <Button
            size="lg"
            onClick={handleGetStarted}
            disabled={!selectedPersona}
            className={`px-12 text-base font-semibold transition-all duration-200 ${
              selectedPersona
                ? "bg-[#2B6CF3] hover:bg-[#1E4FBF] text-white shadow-lg hover:scale-[1.02] hover:shadow-xl"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            <span className="transition-opacity duration-150">{getButtonLabel()}</span>
          </Button>
          <p className="text-sm text-gray-500">You can change persona anytime from the header.</p>
        </div> */}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white opacity-70">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-6">
            <span className="text-sm font-medium text-gray-700">
              System Status:
            </span>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-sm text-gray-600">Core</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-sm text-gray-600">API Sync</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-sm text-gray-600">Billing Engine</span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>Zuora Seed © 2025</span>
            <span className="text-gray-300">|</span>
            <a href="#" className="hover:text-[#2B6CF3]">
              Terms of Service
            </a>
            <span className="text-gray-300">|</span>
            <a href="#" className="hover:text-[#2B6CF3]">
              Privacy Policy
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}