"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Bell,
  HelpCircle,
  User,
  Search,
  Sparkles,
  Package,
  Send,
  CheckCircle2,
  RotateCcw,
  ChevronDown,
  Edit,
  Clock,
  Eye,
  AlertCircle,
  FileCode,
  XCircle,
  Zap,
  BookOpen,
  AlertTriangle,
} from "lucide-react";
import { he } from "date-fns/locale";

type ConversationFlow =
  | "idle"
  | "create-product"
  | "update-product"
  | "expire-product"
  | "view-product";

type CreateProductStep =
  | "name"
  | "sku"
  | "description"
  | "start-date"
  | "add-rate-plan"
  | "rate-plan-name"
  | "rate-plan-description"
  | "add-charges"
  | "charge-type"
  | "charge-fields"
  | "another-charge"
  | "another-rate-plan"
  | "summary"
  | "validation"
  | "execute";

type UpdateProductStep =
  | "identify"
  | "show-summary"
  | "select-attribute"
  | "update-value"
  | "confirm"
  | "execute"
  | "another-attribute";

type ExpireProductStep =
  | "identify"
  | "show-details"
  | "select-method"
  | "set-date"
  | "dependency-check"
  | "confirm"
  | "execute";

type ViewProductStep =
  | "choose-scope"
  | "identify"
  | "show-summary"
  | "select-detail"
  | "show-detail"
  | "another-product";

type ChargeType =
  | "flat-fee"
  | "per-unit"
  | "tiered"
  | "volume"
  | "usage"
  | "one-time"
  | "discount";

interface ChargeData {
  type: ChargeType;
  name: string;
  fields: Record<string, string>;
}

interface RatePlanData {
  name: string;
  description: string;
  charges: ChargeData[];
}

interface ProductData {
  name: string;
  sku: string;
  description: string;
  startDate: string;
  ratePlans: RatePlanData[];
}

interface ChatMessage {
  role: "assistant" | "user";
  content: string;
  timestamp: Date;
}

interface CompletedFlow {
  id: string;
  type: ConversationFlow;
  title: string;
  timestamp: Date;
  isExpanded: boolean;
  messages: ChatMessage[];
  summary?: string;
}

interface ValidationResult {
  category: string;
  status: "pass" | "fail";
  message: string;
}

// Add types near top of file
type EnvKey = "api-sandbox" | "sandbox" | "production";

function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100">
        <Sparkles className="h-4 w-4 text-[#2B6CF3]" />
      </div>
      <div className="flex-1">
        <div className="rounded-lg rounded-tl-none bg-gray-100 p-4">
          <div className="flex gap-1">
            <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]"></div>
            <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]"></div>
            <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-24 right-8 z-50 rounded-lg bg-green-600 px-6 py-3 text-white shadow-lg">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-5 w-5" />
        <span className="font-medium">{message}</span>
      </div>
    </div>
  );
}

export default function WorkflowPage() {
  const [isConnected, setIsConnected] = useState(false);
  const [environment, setEnvironment] = useState("");
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [currentFlow, setCurrentFlow] = useState<ConversationFlow>("idle");
  const [createProductStep, setCreateProductStep] =
    useState<CreateProductStep>("name");
  const [highlightConnect, setHighlightConnect] = useState(false);

  const [productData, setProductData] = useState<ProductData>({
    name: "",
    sku: "",
    description: "",
    startDate: "",
    ratePlans: [],
  });

  const [currentRatePlan, setCurrentRatePlan] = useState<RatePlanData>({
    name: "",
    description: "",
    charges: [],
  });

  const [currentCharge, setCurrentCharge] = useState<ChargeData>({
    type: "flat-fee",
    name: "",
    fields: {},
  });

  const [updateProductStep, setUpdateProductStep] =
    useState<UpdateProductStep>("identify");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedAttribute, setSelectedAttribute] = useState<string>("");
  const [newAttributeValue, setNewAttributeValue] = useState<string>("");

  const [expireProductStep, setExpireProductStep] =
    useState<ExpireProductStep>("identify");
  const [expireMethod, setExpireMethod] = useState<string>("");
  const [expireDate, setExpireDate] = useState<string>("");

  const [viewProductStep, setViewProductStep] =
    useState<ViewProductStep>("choose-scope");
  const [viewScope, setViewScope] = useState<"specific" | "all">("specific");
  const [viewDetailType, setViewDetailType] = useState<string>("");


  const [copying, setCopying] = useState(false);

const handleCopyPayload = async () => {
  const text = generateProductPayload(); // uses your existing function
  try {
    setCopying(true);
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      // Fallback for older/insecure contexts
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setToastMessage("Copied payload to clipboard");
  } catch (e) {
    setToastMessage("Copy failed. Select and copy manually.");
  } finally {
    setCopying(false);
  }
};



  const [validationResults, setValidationResults] = useState<
    ValidationResult[]
  >([]);
  const [executionResult, setExecutionResult] = useState<{
    productId: string;
    ratePlanIds: string[];
    chargeIds: string[];
  } | null>(null);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hi, I'm Zia — your AI configuration assistant. Let's connect to Zuora and manage your Product Catalog.",
      timestamp: new Date(),
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showPayload, setShowPayload] = useState(false);
  const [isUserAtBottom, setIsUserAtBottom] = useState(true);
  const [showNewMessagesPill, setShowNewMessagesPill] = useState(false);
  const [completedFlows, setCompletedFlows] = useState<CompletedFlow[]>([]);

  const [isTyping, setIsTyping] = useState(false);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = (smooth = true) => {
    // Prefer anchor scrolling (more reliable with dynamic content)
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({
        behavior: smooth ? "smooth" : "auto",
      });
      return;
    }
    // Fallback to container scroll
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: smooth ? "smooth" : "auto",
      });
    }
  };

  // Add states
  const [connecting, setConnecting] = useState(false);
  const [errors, setErrors] = useState<{
    environment?: string;
    clientId?: string;
    clientSecret?: string;
  }>({});
  const [tokenInfo, setTokenInfo] = useState<null | {
    accessToken: string;
    tokenType: string;
    expiresIn: number;
    baseUrl: string;
    scope?: string | null;
  }>(null);

  // Add a small validator
  const validateConnectForm = () => {
    const next: typeof errors = {};
    if (!environment) next.environment = "Please select an environment.";
    if (!clientId.trim()) next.clientId = "Client ID is required.";
    if (!clientSecret.trim()) next.clientSecret = "Client Secret is required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  useEffect(() => {
    if (chatContainerRef.current && isUserAtBottom) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
      setShowNewMessagesPill(false);
    } else if (!isUserAtBottom && chatMessages.length > 0) {
      setShowNewMessagesPill(true);
    }
  }, [chatMessages, isUserAtBottom]);



  useEffect(() => {
    const chatContainer = chatContainerRef.current;
    if (!chatContainer) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = chatContainer;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      const atBottom = distanceFromBottom <= 48;
      setIsUserAtBottom(atBottom);
      if (atBottom) {
        setShowNewMessagesPill(false);
      }
    };

    chatContainer.addEventListener("scroll", handleScroll);
    return () => chatContainer.removeEventListener("scroll", handleScroll);
  }, []);

  const addAssistantMessage = (content: string, delay = 300) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content, timestamp: new Date() },
      ]);
      requestAnimationFrame(() => scrollToBottom(true));
    }, delay);
  };

  const addUserMessage = (content: string) => {
    setChatMessages((prev) => [
      ...prev,
      { role: "user", content, timestamp: new Date() },
    ]);
  };

  const handleConnect = async () => {
    // validate fields first
    if (!validateConnectForm()) {
      addAssistantMessage(
        "Please fix the highlighted errors and try again.",
        200
      );
      return;
    }

    try {
      setConnecting(true);

      const res = await fetch("/api/zuora/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ environment, clientId, clientSecret }),
        cache: "no-store",
      });

      const data = await res.json().catch(() => ({}));

      if (!data?.ok) {
        setIsConnected(false);
        setTokenInfo(null);
        setToastMessage(`Connection failed: ${data?.error ?? "Unknown error"}`);
        addAssistantMessage(
          "I couldn't connect. Please check your credentials and environment.",
          200
        );
        return;
      }

      // success
      setIsConnected(true);
      setTokenInfo({
        accessToken: data.accessToken,
        tokenType: data.tokenType,
        expiresIn: data.expiresIn,
        baseUrl: data.baseUrl,
        scope: data.scope ?? null,
      });
      setToastMessage("Successfully connected to Zuora!");
      addAssistantMessage(
        "Great! You're now connected. What would you like to do first — Create, Update, Expire, or View a product?",
        600
      );
    } catch (e: any) {
      setIsConnected(false);
      setTokenInfo(null);
      setToastMessage(`Connection error: ${e?.message ?? "Unexpected error"}`);
    } finally {
      setConnecting(false);
    }
  };

  const handleQuickAction = (action: ConversationFlow) => {
    if (!isConnected && action !== "idle") {
      setHighlightConnect(true);
      setTimeout(() => setHighlightConnect(false), 3000);

      addAssistantMessage(
        "You're not connected yet. Please connect to Zuora first to continue.",
        300
      );
      return;
    }

    setCurrentFlow(action);
    setShowPayload(false);

    // Action confirmation message
    const actionNames = {
      "create-product": "Create Product",
      "update-product": "Update Product",
      "expire-product": "Expire Product",
      "view-product": "View Product",
    };

    if (action !== "idle") {
      addAssistantMessage(
        `Understood. Let's start with ${actionNames[action]}. I'm fetching relevant details from Zuora.`,
        300
      );
    }

    if (action === "create-product") {
      setCreateProductStep("name");
      addAssistantMessage("What's the Product name?", 900);
    } else if (action === "update-product") {
      setUpdateProductStep("identify");
      addAssistantMessage(
        "Sure. Could you please share the product name you'd like to update?",
        900
      );
    } else if (action === "expire-product") {
      setExpireProductStep("identify");
      addAssistantMessage(
        "Please provide how you want to identify the product — by Product Name, Product ID, or SKU.",
        900
      );
    } else if (action === "view-product") {
      setViewProductStep("choose-scope");
      addAssistantMessage(
        "Would you like to view details of a specific product or all products in the catalog?",
        900
      );
    }
  };

  const handleChatSubmit = () => {
    if (!chatInput.trim()) return;

    const input = chatInput.trim();
    addUserMessage(input);

    if (currentFlow === "create-product") {
      handleCreateProductFlow(input);
    } else if (currentFlow === "update-product") {
      handleUpdateProductFlow(input);
    } else if (currentFlow === "expire-product") {
      handleExpireProductFlow(input);
    } else if (currentFlow === "view-product") {
      handleViewProductFlow(input);
    }

    setChatInput("");
    requestAnimationFrame(() => scrollToBottom(true));
  };

  const handleCreateProductFlow = (input: string) => {
    if (createProductStep === "name") {
      setProductData((prev) => ({ ...prev, name: input }));
      setCreateProductStep("sku");
      setTimeout(() => {
        addAssistantMessage(
          "Great. What SKU would you like to use? Recommended patterns like PROD-001, but any format is OK."
        );
      }, 300);
    } else if (createProductStep === "sku") {
      setProductData((prev) => ({ ...prev, sku: input }));
      setCreateProductStep("description");
      setTimeout(() => {
        addAssistantMessage("Add a short description? ");
      }, 300);
    } else if (createProductStep === "description") {
      setProductData((prev) => ({ ...prev, description: input }));
      setCreateProductStep("start-date");
      setTimeout(() => {
        addAssistantMessage(
          "When should the product become effective? (e.g., 2025-01-01)"
        );
      }, 300);
    } else if (createProductStep === "start-date") {
      setProductData((prev) => ({ ...prev, startDate: input }));
      setCreateProductStep("add-rate-plan");
      setTimeout(() => {
        addAssistantMessage("Would you like to add a Rate Plan now?");
      }, 300);
    } else if (createProductStep === "add-rate-plan") {
      if (input.toLowerCase() === "yes" || input.toLowerCase() === "y") {
        setCreateProductStep("rate-plan-name");
        setTimeout(() => {
          addAssistantMessage("Rate Plan name?");
        }, 300);
      } else {
        setCreateProductStep("summary");
        setTimeout(() => {
          addAssistantMessage(
            "Perfect! Here's your product summary. Review and generate the payload when ready."
          );
        }, 300);
      }
    } else if (createProductStep === "rate-plan-name") {
      setCurrentRatePlan((prev) => ({ ...prev, name: input }));
      setCreateProductStep("rate-plan-description");
      setTimeout(() => {
        addAssistantMessage("Description? ");
      }, 300);
    } else if (createProductStep === "rate-plan-description") {
      setCurrentRatePlan((prev) => ({ ...prev, description: input }));
      setCreateProductStep("add-charges");
      setTimeout(() => {
        addAssistantMessage("Add charges to this rate plan?");
      }, 300);
    } else if (createProductStep === "add-charges") {
      if (input.toLowerCase() === "yes" || input.toLowerCase() === "y") {
        setCreateProductStep("charge-type");
        setTimeout(() => {
          addAssistantMessage(
            "Choose a charge type:\n1. Flat Fee\n2. Per-Unit\n3. Tiered\n4. Volume\n5. Usage\n6. One-Time\n7. Discount\n\nType the number or name."
          );
        }, 300);
      } else {
        // Save rate plan and ask for another
        setProductData((prev) => ({
          ...prev,
          ratePlans: [...prev.ratePlans, currentRatePlan],
        }));
        setCurrentRatePlan({ name: "", description: "", charges: [] });
        setCreateProductStep("another-rate-plan");
        setTimeout(() => {
          addAssistantMessage("Add another Rate Plan?");
        }, 300);
      }
    } else if (createProductStep === "charge-type") {
      const chargeTypeMap: Record<string, ChargeType> = {
        "1": "flat-fee",
        "flat fee": "flat-fee",
        flat: "flat-fee",
        "2": "per-unit",
        "per-unit": "per-unit",
        "per unit": "per-unit",
        "3": "tiered",
        tiered: "tiered",
        "4": "volume",

        volume: "volume",
        "5": "usage",
        usage: "usage",
        "6": "one-time",
        "one-time": "one-time",
        "one time": "one-time",
        "7": "discount",
        discount: "discount",
      };

      const selectedType = chargeTypeMap[input.toLowerCase()];
      if (selectedType) {
        setCurrentCharge((prev) => ({ ...prev, type: selectedType }));
        setCreateProductStep("charge-fields");
        setTimeout(() => {
          askChargeFields(selectedType);
        }, 300);
      } else {
        setTimeout(() => {
          addAssistantMessage(
            "Please choose a valid charge type (1-7 or type the name)."
          );
        }, 300);
      }
    } else if (createProductStep === "charge-fields") {
      // Handle charge field inputs based on type
      handleChargeFieldInput(input);
    } else if (createProductStep === "another-charge") {
      if (input.toLowerCase() === "yes" || input.toLowerCase() === "y") {
        setCreateProductStep("charge-type");
        setTimeout(() => {
          addAssistantMessage(
            "Choose a charge type:\n1. Flat Fee\n2. Per-Unit\n3. Tiered\n4. Volume\n5. Usage\n6. One-Time\n7. Discount"
          );
        }, 300);
      } else {
        // Save rate plan with charges
        setProductData((prev) => ({
          ...prev,
          ratePlans: [...prev.ratePlans, currentRatePlan],
        }));
        setCurrentRatePlan({ name: "", description: "", charges: [] });
        setCreateProductStep("another-rate-plan");
        setTimeout(() => {
          addAssistantMessage("Add another Rate Plan?");
        }, 300);
      }
    } else if (createProductStep === "another-rate-plan") {
      if (input.toLowerCase() === "yes" || input.toLowerCase() === "y") {
        setCreateProductStep("rate-plan-name");
        setTimeout(() => {
          addAssistantMessage("Rate Plan name?");
        }, 300);
      } else {
        setCreateProductStep("summary");
        setTimeout(() => {
          addAssistantMessage(
            "Perfect! Here's your complete product configuration. Review and proceed when ready."
          );
        }, 300);
      }
    }
  };

  const askChargeFields = (chargeType: ChargeType) => {
    const fieldPrompts: Record<ChargeType, string> = {
      "flat-fee":
        "For Recurring Flat Fee, I need:\n1. Billing Period (Monthly/Quarterly/Annual)\n2. List Price\n3. Currency (USD/EUR/GBP)\n\nProvide as: Monthly, 99.99, USD",
      "per-unit":
        "For Per-Unit pricing, I need:\n1. Billing Period\n2. Per Unit Price\n3. Currency\n\nProvide as: Monthly, 5.00, USD",
      tiered:
        "For Tiered pricing, I need:\n1. Billing Period\n2. Tier structure (e.g., 0-100: $1, 101-500: $0.75)\n3. Currency\n\nProvide tier details:",
      volume:
        "For Volume pricing, I need:\n1. Billing Period\n2. Volume tiers\n3. Currency\n\nProvide volume details:",
      usage:
        "For Usage-based pricing, I need:\n1. Unit of Measure (API Calls, GB, Hours)\n2. Rating Method\n3. Overage model\n\nProvide as: API Calls, Per Unit, Standard",
      "one-time":
        "For One-Time charge, I need:\n1. Amount\n2. Trigger (Contract Effective/Service Activation)\n\nProvide as: 500, Contract Effective",
      discount:
        "For Discount, I need:\n1. Discount Type (Percentage/Fixed)\n2. Discount Value\n3. Duration (months)\n\nProvide as: Percentage, 20, 12",
    };

    addAssistantMessage(fieldPrompts[chargeType]);
  };

  const handleChargeFieldInput = (input: string) => {
    const parts = input.split(",").map((p) => p.trim());

    // Save charge with fields
    const newCharge: ChargeData = {
      ...currentCharge,
      name: `${currentCharge.type} charge`,
      fields: {
        input: input, // Store raw input for display
      },
    };

    setCurrentRatePlan((prev) => ({
      ...prev,
      charges: [...prev.charges, newCharge],
    }));

    setCurrentCharge({ type: "flat-fee", name: "", fields: {} });
    setCreateProductStep("another-charge");

    setTimeout(() => {
      addAssistantMessage("Add another charge?");
    }, 300);
  };

  const handleUpdateProductFlow = (input: string) => {
    if (updateProductStep === "identify") {
      // Simulate fetching product
      const mockProduct = {
        id: "P-000234",
        name: input,
        sku: "SOLAR-001",
        description: "Solar Plan Basic",
        effectiveStart: "2024-01-01",
        effectiveEnd: "2026-12-31",
        currency: "US, Canada",
      };
      setSelectedProduct(mockProduct);
      setUpdateProductStep("show-summary");

      setTimeout(() => {
        addAssistantMessage(
          `Found product: ${mockProduct.description}\n\nProduct ID: ${mockProduct.id}\nSKU: ${mockProduct.sku}\nEffective Start: ${mockProduct.effectiveStart}\nEffective End: ${mockProduct.effectiveEnd}\nCurrency: ${mockProduct.currency}\n\nWhat would you like to update?`,
          600
        );
      }, 300);
    } else if (updateProductStep === "show-summary") {
      setUpdateProductStep("select-attribute");
      setTimeout(() => {
        addAssistantMessage(
          "Please select what you'd like to update:\n1. Name\n2. SKU\n3. Description\n4. Effective Start Date\n5. Effective End Date\n6. Custom Fields\n7. Product Rate Plans\n\nType the number or name.",
          300
        );
      }, 300);
    } else if (updateProductStep === "select-attribute") {
      const attributeMap: Record<string, string> = {
        "1": "Name",
        "2": "SKU",
        "3": "Description",
        "4": "Effective Start Date",
        "5": "Effective End Date",
        "6": "Custom Fields",
        "7": "Product Rate Plans",
        name: "Name",
        sku: "SKU",
        description: "Description",
        "start date": "Effective Start Date",
        "end date": "Effective End Date",
        "custom fields": "Custom Fields",
        "rate plans": "Product Rate Plans",
      };

      const selected = attributeMap[input.toLowerCase()];
      if (selected) {
        setSelectedAttribute(selected);
        setUpdateProductStep("update-value");
        setTimeout(() => {
          addAssistantMessage(`What's the new value for ${selected}?`, 300);
        }, 300);
      } else {
        setTimeout(() => {
          addAssistantMessage(
            "Please select a valid option (1-7 or type the attribute name).",
            300
          );
        }, 300);
      }
    } else if (updateProductStep === "update-value") {
      setNewAttributeValue(input);
      setUpdateProductStep("confirm");

      setTimeout(() => {
        addAssistantMessage(
          `⚠️ Note: This change will be effective for new subscriptions only.\n\n✅ Product: ${selectedProduct.description}\n🔁 Change: ${selectedAttribute} → ${input}\n\nDo you want me to proceed with this update?`,
          600
        );
      }, 300);
    } else if (updateProductStep === "confirm") {
      if (input.toLowerCase() === "yes" || input.toLowerCase() === "y") {
        setUpdateProductStep("execute");
        setTimeout(() => {
          addAssistantMessage("✅ Update submitted successfully.", 600);
          setTimeout(() => {
            addAssistantMessage(
              "Would you like to update another attribute?",
              300
            );
            setUpdateProductStep("another-attribute");
          }, 1200);
        }, 300);
      } else {
        setTimeout(() => {
          addAssistantMessage(
            "Okay, no changes applied. Would you like to update a different attribute?",
            300
          );
          setUpdateProductStep("another-attribute");
        }, 300);
      }
    } else if (updateProductStep === "another-attribute") {
      if (input.toLowerCase() === "yes" || input.toLowerCase() === "y") {
        setUpdateProductStep("select-attribute");
        setTimeout(() => {
          addAssistantMessage(
            "Please select what you'd like to update:\n1. Name\n2. SKU\n3. Description\n4. Effective Start Date\n5. Effective End Date\n6. Custom Fields\n7. Product Rate Plans",
            300
          );
        }, 300);
      } else {
        setTimeout(() => {
          addAssistantMessage(
            "Update complete! What would you like to do next?",
            300
          );
          completeCurrentFlow();
        }, 300);
      }
    }
  };

  const handleExpireProductFlow = (input: string) => {
    if (expireProductStep === "identify") {
      // Simulate fetching product
      const mockProduct = {
        id: "P-000567",
        name: input,
        sku: "SOLAR-PREM-001",
        description: "Solar Plan Premium",
        effectiveStart: "2024-01-01",
        effectiveEnd: "2027-12-31",
      };
      setSelectedProduct(mockProduct);
      setExpireProductStep("show-details");

      setTimeout(() => {
        addAssistantMessage(
          `Found product: ${mockProduct.description}\n\nProduct ID: ${mockProduct.id}\nEffective Start: ${mockProduct.effectiveStart}\nEffective End: ${mockProduct.effectiveEnd}\n\nWould you like to change its End Date to expire it?`,
          600
        );
      }, 300);
    } else if (expireProductStep === "show-details") {
      if (input.toLowerCase() === "yes" || input.toLowerCase() === "y") {
        setExpireProductStep("select-method");
        setTimeout(() => {
          addAssistantMessage(
            "Choose expiration method:\n1️⃣ Set a new Effective End Date\n2️⃣ Expire immediately (today's date)\n3️⃣ Schedule for a future date\n\nType 1, 2, or 3.",
            300
          );
        }, 300);
      } else {
        setTimeout(() => {
          addAssistantMessage(
            "Okay, no changes will be made. Returning to main menu.",
            300
          );
          completeCurrentFlow();
        }, 300);
      }
    } else if (expireProductStep === "select-method") {
      const methodMap: Record<string, string> = {
        "1": "new-date",
        "2": "immediate",
        "3": "scheduled",
      };

      const method = methodMap[input];
      if (method) {
        setExpireMethod(method);

        if (method === "immediate") {
          const today = new Date().toISOString().split("T")[0];
          setExpireDate(today);
          setExpireProductStep("dependency-check");
          setTimeout(() => {
            addAssistantMessage(
              `Setting End Date to today (${today}).\n\nBefore expiring the product, I'll check if there are any active or future-dated rate plans linked to it. Continue even if active rate plans exist?`,
              600
            );
          }, 300);
        } else if (method === "new-date" || method === "scheduled") {
          setExpireProductStep("set-date");
          setTimeout(() => {
            addAssistantMessage(
              "Please provide the date in YYYY-MM-DD format (e.g., 2025-10-30).",
              300
            );
          }, 300);
        }
      } else {
        setTimeout(() => {
          addAssistantMessage(
            "Please choose a valid option (1, 2, or 3).",
            300
          );
        }, 300);
      }
    } else if (expireProductStep === "set-date") {
      setExpireDate(input);
      setExpireProductStep("dependency-check");
      setTimeout(() => {
        addAssistantMessage(
          `Setting End Date to ${input}.\n\nBefore expiring the product, I'll check if there are any active or future-dated rate plans linked to it. Continue even if active rate plans exist?`,
          600
        );
      }, 300);
    } else if (expireProductStep === "dependency-check") {
      if (input.toLowerCase() === "yes" || input.toLowerCase() === "y") {
        setExpireProductStep("confirm");
        setTimeout(() => {
          addAssistantMessage(
            `✅ Product: ${selectedProduct.description}\n🗓️ New Effective End Date: ${expireDate}\n\nDo you confirm this update?`,
            600
          );
        }, 300);
      } else {
        setTimeout(() => {
          addAssistantMessage(
            "Okay, canceling expiration. No changes applied.",
            300
          );
          completeCurrentFlow();
        }, 300);
      }
    } else if (expireProductStep === "confirm") {
      if (input.toLowerCase() === "yes" || input.toLowerCase() === "y") {
        setExpireProductStep("execute");
        setTimeout(() => {
          addAssistantMessage("✅ Product expired successfully.", 600);
          setToastMessage("Product expired successfully");
          setTimeout(() => {
            completeCurrentFlow();
          }, 1500);
        }, 300);
      } else {
        setTimeout(() => {
          addAssistantMessage("Okay, no changes applied.", 300);
          completeCurrentFlow();
        }, 300);
      }
    }
  };

  const handleViewProductFlow = (input: string) => {
    if (viewProductStep === "choose-scope") {
      if (input.toLowerCase().includes("specific")) {
        setViewScope("specific");
        setViewProductStep("identify");
        setTimeout(() => {
          addAssistantMessage(
            "Please provide the Product Name, ID, or SKU.",
            300
          );
        }, 300);
      } else if (input.toLowerCase().includes("all")) {
        setViewScope("all");
        setViewProductStep("show-summary");
        setTimeout(() => {
          addAssistantMessage(
            "Here are all products in your catalog:\n\n1. Solar Plan Basic (SOLAR-001)\n2. Solar Plan Premium (SOLAR-PREM-001)\n3. Enterprise SaaS Plan (ENT-SAAS-001)\n\nWould you like to view details of a specific product?",
            600
          );
        }, 300);
      } else {
        setTimeout(() => {
          addAssistantMessage(
            "Please specify 'specific product' or 'all products'.",
            300
          );
        }, 300);
      }
    } else if (viewProductStep === "identify") {
      // Simulate fetching product
      const mockProduct = {
        id: "P-000234",
        name: input,
        sku: "SOLAR-PREM-001",
        description: "Solar Plan Premium",
        effectiveStart: "2024-01-01",
        effectiveEnd: "2027-12-31",
        orgUnits: "US, Canada, Europe",
      };
      setSelectedProduct(mockProduct);
      setViewProductStep("show-summary");

      setTimeout(() => {
        addAssistantMessage(
          `Product ID: ${mockProduct.id}\nSKU: ${mockProduct.sku}\nEffective Start: ${mockProduct.effectiveStart}\nEffective End: ${mockProduct.effectiveEnd}\nOrg Units: ${mockProduct.orgUnits}\n\nWould you like to view more details?`,
          600
        );
      }, 300);
    } else if (viewProductStep === "show-summary") {
      if (input.toLowerCase() === "yes" || input.toLowerCase() === "y") {
        setViewProductStep("select-detail");
        setTimeout(() => {
          addAssistantMessage(
            "What would you like to view?\n1️⃣ Product Info (Name, SKU, Description, Dates)\n2️⃣ Rate Plans & Charges (nested list view)\n3️⃣ Custom Fields\n\nType 1, 2, or 3.",
            300
          );
        }, 300);
      } else {
        setTimeout(() => {
          addAssistantMessage(
            "Okay. Would you like to view another product or return to the catalog list?",
            300
          );
          setViewProductStep("another-product");
        }, 300);
      }
    } else if (viewProductStep === "select-detail") {
      const detailMap: Record<string, string> = {
        "1": "Product Info",
        "2": "Rate Plans & Charges",
        "3": "Custom Fields",
      };

      const detail = detailMap[input];
      if (detail) {
        setViewDetailType(detail);
        setViewProductStep("show-detail");

        setTimeout(() => {
          if (detail === "Product Info") {
            addAssistantMessage(
              `Product Information:\n\nName: ${selectedProduct.description}\nSKU: ${selectedProduct.sku}\nDescription: Premium solar energy plan with advanced features\nEffective Start: ${selectedProduct.effectiveStart}\nEffective End: ${selectedProduct.effectiveEnd}\n\nWould you like to view another detail type?`,
              600
            );
          } else if (detail === "Rate Plans & Charges") {
            addAssistantMessage(
              `Rate Plans & Charges:\n\n📋 Annual Plan\n  └─ Flat Fee: $999/year\n  └─ Setup Fee: $100 (one-time)\n\n📋 Monthly Plan\n  └─ Per-Unit: $5/unit\n  └─ Usage: $0.10/API call\n\nWould you like to view another detail type?`,
              600
            );
          } else if (detail === "Custom Fields") {
            addAssistantMessage(
              `Custom Fields:\n\nRegion: North America\nTier: Premium\nContract Type: Enterprise\n\nWould you like to view another detail type?`,
              600
            );
          }
        }, 300);
      } else {
        setTimeout(() => {
          addAssistantMessage(
            "Please choose a valid option (1, 2, or 3).",
            300
          );
        }, 300);
      }
    } else if (viewProductStep === "show-detail") {
      if (input.toLowerCase() === "yes" || input.toLowerCase() === "y") {
        setViewProductStep("select-detail");
        setTimeout(() => {
          addAssistantMessage(
            "What would you like to view?\n1️⃣ Product Info\n2️⃣ Rate Plans & Charges\n3️⃣ Custom Fields",
            300
          );
        }, 300);
      } else {
        setViewProductStep("another-product");
        setTimeout(() => {
          addAssistantMessage(
            "Would you like to view another product or return to the catalog list?",
            300
          );
        }, 300);
      }
    } else if (viewProductStep === "another-product") {
      if (
        input.toLowerCase() === "yes" ||
        input.toLowerCase() === "y" ||
        input.toLowerCase().includes("another")
      ) {
        setViewProductStep("identify");
        setTimeout(() => {
          addAssistantMessage(
            "Please provide the Product Name, ID, or SKU.",
            300
          );
        }, 300);
      } else {
        setTimeout(() => {
          addAssistantMessage("Returning to main menu.", 300);
          completeCurrentFlow();
        }, 300);
      }
    }
  };

  const handleGeneratePayload = () => {
    setShowPayload(true);
    setTimeout(() => {
      addAssistantMessage(
        "Product payload generated! Check the workspace panel on the right."
      );
      setToastMessage("Product draft created successfully");
    }, 300);
  };

  const handleValidation = () => {
    setCreateProductStep("validation");
    setTimeout(() => {
      addAssistantMessage("Running validation checks...");

      // Simulate validation
      setTimeout(() => {
        const results: ValidationResult[] = [
          {
            category: "Structure",
            status: "pass",
            message: "All required fields present",
          },
          {
            category: "Business Rules",
            status: "pass",
            message: "Pricing logic validated",
          },
          {
            category: "Tenant Checks",
            status: "pass",
            message: "Compatible with tenant configuration",
          },
        ];
        setValidationResults(results);
        addAssistantMessage(
          "✅ Validation complete! All checks passed. Ready to create in Zuora."
        );
      }, 1500);
    }, 300);
  };

  const handleExecute = () => {
    setCreateProductStep("execute");
    setTimeout(() => {
      addAssistantMessage("Creating product in Zuora...");

      // Simulate API calls
      setTimeout(() => {
        const result = {
          productId:
            "PROD-" + Math.random().toString(36).substr(2, 9).toUpperCase(),
          ratePlanIds: productData.ratePlans.map(
            () => "RP-" + Math.random().toString(36).substr(2, 9).toUpperCase()
          ),
          chargeIds: productData.ratePlans.flatMap((rp) =>
            rp.charges.map(
              () =>
                "CHG-" + Math.random().toString(36).substr(2, 9).toUpperCase()
            )
          ),
        };
        setExecutionResult(result);

        addAssistantMessage(
          `✅ Created!\n\nProductId: ${
            result.productId
          }\nRatePlanIds: ${result.ratePlanIds.join(
            ", "
          )}\nChargeIds: ${result.chargeIds.join(
            ", "
          )}\n\nWhat would you like to do next?\n1. Create subscription\n2. Add more plans\n3. Go home`
        );

        setToastMessage("Product created successfully in Zuora!");

        setTimeout(() => {
          completeCurrentFlow();
        }, 3000);
      }, 2000);
    }, 300);
  };

  const generateProductPayload = () => {
    const payload = {
      name: productData.name,
      sku: productData.sku,
      description: productData.description,
      effectiveStartDate: productData.startDate,
      category: "Base Products",
      ratePlans: productData.ratePlans.map((rp) => ({
        name: rp.name,
        description: rp.description,
        charges: rp.charges.map((charge) => ({
          type: charge.type,
          name: charge.name,
          ...charge.fields,
        })),
      })),
    };
    return JSON.stringify(payload, null, 2);
  };

  const completeCurrentFlow = () => {
    if (currentFlow === "idle") return;

    const flowTitles = {
      "create-product": "Product Creation Flow",
      "update-product": "Product Update Flow",
      "expire-product": "Product Expiration Flow",
      "view-product": "Product View Flow",
    };

    const flowSummaries = {
      "create-product": `Created product: ${productData.name} (${productData.sku}) with ${productData.ratePlans.length} rate plan(s)`,
      "update-product": `Updated ${selectedAttribute} for ${
        selectedProduct?.description || "product"
      }`,
      "expire-product": `Expired ${
        selectedProduct?.description || "product"
      } with end date ${expireDate}`,
      "view-product": `Viewed details for ${
        selectedProduct?.description || "product"
      }`,
    };

    const completedFlow: CompletedFlow = {
      id: Date.now().toString(),
      type: currentFlow,
      title: flowTitles[currentFlow] || "Completed Flow",
      timestamp: new Date(),
      isExpanded: false,
      messages: chatMessages.slice(1),
      summary: flowSummaries[currentFlow],
    };

    setCompletedFlows((prev) => [...prev, completedFlow]);
    setChatMessages([
      {
        role: "assistant",
        content:
          "Hi, I'm Zia — your AI configuration assistant. Let's connect to Zuora and manage your Product Catalog.",
        timestamp: new Date(),
      },
    ]);
    setCurrentFlow("idle");

    setCreateProductStep("name");
    setUpdateProductStep("identify");
    setExpireProductStep("identify");
    setViewProductStep("choose-scope");

    setProductData({
      name: "",
      sku: "",
      description: "",
      startDate: "",
      ratePlans: [],
    });
    setCurrentRatePlan({ name: "", description: "", charges: [] });
    setSelectedProduct(null);
    setSelectedAttribute("");
    setNewAttributeValue("");
    setExpireMethod("");
    setExpireDate("");
    setViewScope("specific");
    setViewDetailType("");
    setValidationResults([]);
    setExecutionResult(null);
  };

  const toggleFlowExpansion = (flowId: string) => {
    setCompletedFlows((prev) =>
      prev.map((flow) =>
        flow.id === flowId ? { ...flow, isExpanded: !flow.isExpanded } : flow
      )
    );
  };

  const catalogData = [
    {
      product: "Enterprise SaaS Plan",
      ratePlan: "Annual Subscription",
      charges: "3 Charges",
      status: "Active",
    },
    {
      product: "Professional Plan",
      ratePlan: "Monthly Subscription",
      charges: "2 Charges",
      status: "Active",
    },
    {
      product: "Starter Plan",
      ratePlan: "Monthly Subscription",
      charges: "1 Charge",
      status: "Draft",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="border-b border-gray-200 bg-slate-800 text-white">
        <div className="flex h-14 items-center justify-between px-6">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-bold">Zuora Seed</span>
              <Badge className="bg-cyan-500 text-xs font-semibold hover:bg-cyan-500">
                v0
              </Badge>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-300">Viewing:</span>
              <Select defaultValue="acme">
                <SelectTrigger className="h-9 w-48 border-gray-600 bg-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="acme">ACME Corp Global</SelectItem>
                  <SelectItem value="demo">Demo Workspace</SelectItem>
                </SelectContent>
              </Select>
              <Badge className="bg-green-500 text-xs font-semibold hover:bg-green-500">
                Active
              </Badge>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search Config IDs, Audit Reports..."
                className="h-9 w-64 border-gray-600 bg-slate-700 pl-9 text-white placeholder:text-gray-400"
              />
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="relative text-gray-300 hover:text-white"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-blue-500" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-300 hover:text-white"
              >
                <HelpCircle className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-300 hover:text-white"
              >
                <User className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>
      {/* Page Title */}
      <div className="mb-1  bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="mx-auto flex h-14 max-w-7xl items-center px-6">
          <h1 className="text-base font-semibold text-gray-900">
            Architect 
          </h1>
        </div>
      </div>
    <div className="flex flex-1 overflow-hidden min-h-0">

        {/* Left Panel - Chat Assistant */}
        <div className="flex w-[40%] flex-col border-r border-gray-200
                  bg-gradient-to-b from-[#F9FAFB] to-white min-h-0"   style={{ height: "87vh" }}>
          <div className="border-b border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Chat Assistant
              </h2>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-gray-900"
                onClick={() => {
                  setChatMessages([
                    {
                      role: "assistant",
                      content:
                        "Hi, I'm Zia — your AI configuration assistant. Let's connect to Zuora and manage your Product Catalog.",
                      timestamp: new Date(),
                    },
                  ]);
                  setCurrentFlow("idle");
                  setCompletedFlows([]);
                }}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div
      ref={chatContainerRef}
      className="relative flex-1 overflow-y-auto p-6"
      style={{ overscrollBehavior: "contain", scrollbarGutter: "stable" }}
    >
            <div className="space-y-4">
              {completedFlows.map((flow) => (
                <Card key={flow.id} className="border-green-200 bg-green-50">
                  <CardHeader
                    className="cursor-pointer p-4"
                    onClick={() => toggleFlowExpansion(flow.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <div>
                          <CardTitle className="text-sm font-semibold text-green-900">
                            {flow.title}
                          </CardTitle>
                          {flow.summary && (
                            <p className="text-xs text-green-700">
                              {flow.summary}
                            </p>
                          )}
                        </div>
                      </div>
                      <ChevronDown
                        className={`h-4 w-4 text-green-600 transition-transform ${
                          flow.isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </CardHeader>
                  {flow.isExpanded && (
                    <CardContent className="space-y-3 border-t border-green-200 p-4">
                      {flow.messages.map((message, index) => (
                        <div key={index} className="text-sm">
                          <span className="font-medium">
                            {message.role === "assistant" ? "Zia:" : "You:"}
                          </span>{" "}
                          {message.content}
                        </div>
                      ))}
                    </CardContent>
                  )}
                </Card>
              ))}

              {chatMessages.map((message, index) => (
                <div key={index}>
                  {index > 0 && <div className="my-4 h-px bg-gray-100" />}
                  <div className="flex gap-3">
                    {message.role === "assistant" && (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100">
                        <Sparkles className="h-4 w-4 text-[#2B6CF3]" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div
                        className={`rounded-lg p-4 ${
                          message.role === "assistant"
                            ? "rounded-tl-none bg-gray-100"
                            : "ml-auto max-w-[80%] rounded-tr-none bg-[#2B6CF3] text-white"
                        }`}
                      >
                        <p className="whitespace-pre-line text-sm">
                          {message.content}
                        </p>
                      </div>
                      <p className="mt-1 text-xs text-[#9CA3AF]">
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    {message.role === "user" && (
                      <div className="h-8 w-8 shrink-0" />
                    )}
                  </div>
                </div>
              ))}

              {isTyping && <TypingIndicator />}
              {/* bottom anchor for smooth scroll */}
               <div ref={chatBottomRef} /> {/* keep this anchor */}

              {currentFlow === "create-product" &&
                createProductStep === "name" &&
                !isTyping && (
                  <Card className="border-blue-100 bg-blue-50">
                    <CardContent className="flex items-start gap-3 p-4">
                      <BookOpen className="h-5 w-5 text-[#2B6CF3]" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          Knowledge Center
                        </p>
                        <p className="mt-1 text-xs text-gray-600">
                          Need help? Check out{" "}
                          <a href="#" className="text-[#2B6CF3] underline">
                            Product Setup Best Practices
                          </a>{" "}
                          or ask me to summarize it.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}

              {currentFlow === "create-product" &&
                createProductStep === "summary" && (
                  <Card className="border-[#2B6CF3]">
                    <CardHeader>
                      <CardTitle className="text-base">
                        Product Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div>
                        <span className="font-medium">Name:</span>{" "}
                        {productData.name}
                      </div>
                      <div>
                        <span className="font-medium">SKU:</span>{" "}
                        {productData.sku}
                      </div>
                      <div>
                        <span className="font-medium">Description:</span>{" "}
                        {productData.description}
                      </div>
                      <div>
                        <span className="font-medium">Start Date:</span>{" "}
                        {productData.startDate}
                      </div>
                      {productData.ratePlans.length > 0 && (
                        <div>
                          <span className="font-medium">Rate Plans:</span>{" "}
                          {productData.ratePlans.length}
                          {productData.ratePlans.map((rp, idx) => (
                            <div
                              key={idx}
                              className="ml-4 mt-2 rounded bg-gray-50 p-2"
                            >
                              <div className="font-medium">{rp.name}</div>
                              <div className="text-xs text-gray-600">
                                {rp.charges.length} charge(s)
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="mt-4 space-y-2">
                        <Button
                          className="w-full bg-[#2B6CF3] hover:bg-[#2456c9]"
                          onClick={handleGeneratePayload}
                        >
                          <FileCode className="mr-2 h-4 w-4" />
                          Preview Payloads
                        </Button>
                        <Button
                          className="w-full bg-transparent"
                          variant="outline"
                          onClick={handleValidation}
                        >
                          <Zap className="mr-2 h-4 w-4" />
                          Validate Configuration
                        </Button>
                        <Button
                          className="w-full bg-transparent"
                          variant="outline"
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

              {createProductStep === "validation" &&
                validationResults.length > 0 && (
                  <Card className="border-green-200">
                    <CardHeader>
                      <CardTitle className="text-base">
                        Validation Results
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {validationResults.map((result, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          {result.status === "pass" ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600" />
                          )}
                          <div className="flex-1">
                            <div className="font-medium text-sm">
                              {result.category}
                            </div>
                            <div className="text-xs text-gray-600">
                              {result.message}
                            </div>
                          </div>
                        </div>
                      ))}
                      <Button
                        className="mt-4 w-full bg-green-600 hover:bg-green-700"
                        onClick={handleExecute}
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Create Product in Zuora
                      </Button>
                    </CardContent>
                  </Card>
                )}

              {/* Update Product Flow UI */}
              {currentFlow === "update-product" &&
                updateProductStep === "show-summary" &&
                selectedProduct && (
                  <Card className="border-blue-100 bg-blue-50">
                    <CardContent className="space-y-3 text-sm">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-blue-600" />
                        <h3 className="font-medium text-blue-900">
                          Product Found
                        </h3>
                      </div>
                      <div>
                        <span className="font-medium">Product Name:</span>{" "}
                        {selectedProduct.name}
                      </div>
                      <div>
                        <span className="font-medium">SKU:</span>{" "}
                        {selectedProduct.sku}
                      </div>
                      <div>
                        <span className="font-medium">Description:</span>{" "}
                        {selectedProduct.description}
                      </div>
                      <div>
                        <span className="font-medium">Effective Start:</span>{" "}
                        {selectedProduct.effectiveStart}
                      </div>
                      <div>
                        <span className="font-medium">Effective End:</span>{" "}
                        {selectedProduct.effectiveEnd}
                      </div>
                      <div>
                        <span className="font-medium">Currency:</span>{" "}
                        {selectedProduct.currency}
                      </div>
                    </CardContent>
                  </Card>
                )}

              {currentFlow === "update-product" &&
                updateProductStep === "confirm" &&
                selectedProduct && (
                  <Card className="border-orange-100 bg-orange-50">
                    <CardContent className="space-y-3 text-sm">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-orange-600" />
                        <h3 className="font-medium text-orange-900">
                          Confirm Update
                        </h3>
                      </div>
                      <div className="text-xs text-orange-800">
                        ⚠️ Note: This change will be effective for new
                        subscriptions only.
                      </div>
                      <div>
                        <span className="font-medium">Product:</span>{" "}
                        {selectedProduct.description}
                      </div>
                      <div>
                        <span className="font-medium">Change:</span>{" "}
                        {selectedAttribute} → {newAttributeValue}
                      </div>
                      <p>Do you want me to proceed with this update?</p>
                    </CardContent>
                  </Card>
                )}

              {/* Expire Product Flow UI */}
              {currentFlow === "expire-product" &&
                expireProductStep === "show-details" &&
                selectedProduct && (
                  <Card className="border-orange-100 bg-orange-50">
                    <CardContent className="space-y-3 text-sm">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-orange-600" />
                        <h3 className="font-medium text-orange-900">
                          Product Found
                        </h3>
                      </div>
                      <div>
                        <span className="font-medium">Product Name:</span>{" "}
                        {selectedProduct.name}
                      </div>
                      <div>
                        <span className="font-medium">SKU:</span>{" "}
                        {selectedProduct.sku}
                      </div>
                      <div>
                        <span className="font-medium">Effective Start:</span>{" "}
                        {selectedProduct.effectiveStart}
                      </div>
                      <div>
                        <span className="font-medium">Effective End:</span>{" "}
                        {selectedProduct.effectiveEnd}
                      </div>
                      <p className="mt-3">
                        Would you like to change its End Date to expire it?
                      </p>
                    </CardContent>
                  </Card>
                )}

              {currentFlow === "expire-product" &&
                expireProductStep === "dependency-check" &&
                selectedProduct && (
                  <Card className="border-green-100 bg-green-50">
                    <CardContent className="space-y-3 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <h3 className="font-medium text-green-900">
                          Expiration Settings
                        </h3>
                      </div>
                      <div>
                        <span className="font-medium">Product:</span>{" "}
                        {selectedProduct.description}
                      </div>
                      <div>
                        <span className="font-medium">
                          New Effective End Date:
                        </span>{" "}
                        {expireDate}
                      </div>
                      <p className="mt-3">
                        Before expiring the product, I'll check if there are any
                        active or future-dated rate plans linked to it. Continue
                        even if active rate plans exist?
                      </p>
                    </CardContent>
                  </Card>
                )}

              {currentFlow === "expire-product" &&
                expireProductStep === "confirm" &&
                selectedProduct && (
                  <Card className="border-blue-100 bg-blue-50">
                    <CardContent className="space-y-3 text-sm">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-blue-600" />
                        <h3 className="font-medium text-blue-900">
                          Confirm Expiration
                        </h3>
                      </div>
                      <div>
                        <span className="font-medium">Product:</span>{" "}
                        {selectedProduct.description}
                      </div>
                      <div>
                        <span className="font-medium">
                          New Effective End Date:
                        </span>{" "}
                        {expireDate}
                      </div>
                      <p className="mt-3">Do you confirm this update?</p>
                    </CardContent>
                  </Card>
                )}

              {/* View Product Flow UI */}
              {currentFlow === "view-product" &&
                viewProductStep === "show-summary" &&
                selectedProduct && (
                  <Card className="border-cyan-100 bg-cyan-50">
                    <CardContent className="space-y-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Eye className="h-5 w-5 text-cyan-600" />
                        <h3 className="font-medium text-cyan-900">
                          Product Details
                        </h3>
                      </div>
                      <div>
                        <span className="font-medium">Product ID:</span>{" "}
                        {selectedProduct.id}
                      </div>
                      <div>
                        <span className="font-medium">SKU:</span>{" "}
                        {selectedProduct.sku}
                      </div>
                      <div>
                        <span className="font-medium">Effective Start:</span>{" "}
                        {selectedProduct.effectiveStart}
                      </div>
                      <div>
                        <span className="font-medium">Effective End:</span>{" "}
                        {selectedProduct.effectiveEnd}
                      </div>
                      <div>
                        <span className="font-medium">Org Units:</span>{" "}
                        {selectedProduct.orgUnits}
                      </div>
                      <p className="mt-3">
                        Would you like to view more details?
                      </p>
                    </CardContent>
                  </Card>
                )}

              {currentFlow === "view-product" &&
                viewProductStep === "show-detail" &&
                selectedProduct && (
                  <Card className="border-purple-100 bg-purple-50">
                    <CardContent className="space-y-3 text-sm">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-purple-600" />
                        <h3 className="font-medium text-purple-900">
                          {viewDetailType === "Rate Plans & Charges"
                            ? "Rate Plans"
                            : viewDetailType}
                        </h3>
                      </div>
                      <p>Would you like to view another detail type?</p>
                    </CardContent>
                  </Card>
                )}

              {currentFlow === "idle" && !showPayload && (
                <div className="mt-6">
                  <p className="mb-3 text-sm font-medium text-gray-700">
                    Suggested Actions
                  </p>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2 border-gray-200 bg-white hover:border-[#2B6CF3] hover:bg-blue-50"
                      onClick={() => handleQuickAction("create-product")}
                    >
                      <Package className="h-4 w-4 text-[#2B6CF3]" />
                      <span className="text-sm">Create Product</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2 border-gray-200 bg-white hover:border-[#2B6CF3] hover:bg-blue-50"
                      onClick={() => handleQuickAction("update-product")}
                    >
                      <Edit className="h-4 w-4 text-[#2B6CF3]" />
                      <span className="text-sm">Update Product</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2 border-gray-200 bg-white hover:border-[#2B6CF3] hover:bg-blue-50"
                      onClick={() => handleQuickAction("expire-product")}
                    >
                      <Clock className="h-4 w-4 text-[#2B6CF3]" />
                      <span className="text-sm">Expire Product</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2 border-gray-200 bg-white hover:border-[#2B6CF3] hover:bg-blue-50"
                      onClick={() => handleQuickAction("view-product")}
                    >
                      <Eye className="h-4 w-4 text-[#2B6CF3]" />
                      <span className="text-sm">View Product</span>
                    </Button>
                  </div>
                </div>
              )}

              {showNewMessagesPill && (
                <button
                 onClick={() => scrollToBottom(true)}

                  className="absolute bottom-4 right-4 z-10 flex items-center gap-2 rounded-full bg-[#2B6CF3] px-4 py-2 text-sm font-medium text-white shadow-lg"
                >
                  <span>New messages</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <div className="sticky bottom-0 border-t border-gray-200 bg-white p-4">
            <div className="flex gap-2">
              <Input
                ref={chatInputRef}
                placeholder="Ask about your catalog setup or type a command…"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleChatSubmit();
                  }
                }}
                className="flex-1"
              />
              <Button
                size="icon"
                className="bg-[#2B6CF3] hover:bg-[#2456c9]"
                onClick={handleChatSubmit}
                disabled={!chatInput.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Try commands: /validate, /catalog status, /sync, /help
            </p>
          </div>
        </div>

        {/* Right Panel - Zuora Workspace */}
        <div
          className="w-[60%] overflow-y-auto p-8"
          style={{ overscrollBehavior: "contain" }}
        >
          {!isConnected ? (
            <div className="mx-auto max-w-2xl">
              <div
                className={`connection-card rounded-lg border bg-white p-8 shadow-sm transition-all duration-500 ${
                  highlightConnect
                    ? "border-gray-200"
                    : "border-gray-200"
                }`}
              >
                <div className="mb-6 flex items-start gap-3">
                  <AlertCircle className="h-6 w-6 text-[#2B6CF3]" />
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900">
                      Connect to Zuora
                    </h2>
                    <p className="mt-1 text-sm text-gray-600">
                      Connect your Zuora environment to start managing products
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    {/* Environment */}
                    <Label
                      htmlFor="environment"
                      className="text-sm font-medium text-gray-700"
                    >
                      Environment
                    </Label>
                    <Select value={environment} onValueChange={setEnvironment}>
                      <SelectTrigger
                        id="environment"
                        className={`mt-1.5 ${
                          errors.environment ? "border-red-500" : ""
                        }`}
                      >
                        <SelectValue placeholder="Select environment" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="api-sandbox">API Sandbox</SelectItem>
                        <SelectItem value="sandbox">Sandbox / Test</SelectItem>
                        <SelectItem value="production">Production</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.environment && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.environment}
                      </p>
                    )}
                  </div>

                  <div>
                    {/* Client ID */}
                    <Label
                      htmlFor="clientId"
                      className="text-sm font-medium text-gray-700"
                    >
                      Client ID
                    </Label>
                    <Input
                      id="clientId"
                      type="text"
                      placeholder="Enter your OAuth Client ID"
                      value={clientId}
                      onChange={(e) => setClientId(e.target.value)}
                      className={`mt-1.5 ${
                        errors.clientId ? "border-red-500" : ""
                      }`}
                    />
                    {errors.clientId && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.clientId}
                      </p>
                    )}
                  </div>

                  <div>
                    {/* Client Secret */}
                    <Label
                      htmlFor="clientSecret"
                      className="text-sm font-medium text-gray-700"
                    >
                      Client Secret
                    </Label>
                    <Input
                      id="clientSecret"
                      type="password"
                      placeholder="Enter your OAuth Client Secret"
                      value={clientSecret}
                      onChange={(e) => setClientSecret(e.target.value)}
                      className={`mt-1.5 ${
                        errors.clientSecret ? "border-red-500" : ""
                      }`}
                    />
                    {errors.clientSecret && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.clientSecret}
                      </p>
                    )}
                  </div>

                  <div className="rounded-lg bg-blue-50 p-4">
                    <h3 className="mb-2 text-sm font-semibold text-gray-900">
                      OAuth Endpoints Guide
                    </h3>
                    <div className="space-y-1 text-xs text-gray-600">
                      <p>
                        <span className="font-medium">API Sandbox:</span>{" "}
                        https://rest.test.zuora.com
                      </p>
                      <p>
                        <span className="font-medium">Sandbox/Test:</span>{" "}
                        https://rest.test.zuora.com
                      </p>
                      <p>
                        <span className="font-medium">Production:</span>{" "}
                        https://rest.zuora.com
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    onClick={handleConnect}
                    disabled={
                      connecting || !environment || !clientId || !clientSecret
                    }
                    className="w-full bg-[#2B6CF3] hover:bg-[#2456c9] disabled:opacity-60"
                  >
                    {connecting ? "Connecting…" : "Connect to Zuora"}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div>
              {showPayload && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Product Payload Preview</CardTitle>
                    <CardDescription>
                      JSON payload ready to send to Zuora API
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <pre className="overflow-x-auto rounded-lg bg-slate-900 p-4 text-sm text-green-400">
                      {generateProductPayload()}
                    </pre>
                    <div className="mt-4 flex gap-2">
                      <Button
                        className="bg-[#2B6CF3] hover:bg-[#2456c9]"
                        onClick={handleValidation}
                      >
                        Validate & Deploy
                      </Button>
                      <Button variant="outline" onClick={handleCopyPayload} disabled={copying}>
  {copying ? "Copying…" : "Copy to Clipboard"}
</Button>

                    </div>
                  </CardContent>
                </Card>
              )}

              {currentFlow === "idle" && !showPayload && (
                <div className="mx-auto max-w-2xl">
                  <Card className="border-green-200 bg-green-50">
                    <CardContent className="flex items-center gap-3 p-6">
                      <CheckCircle2 className="h-8 w-8 text-green-600" />
                      <div>
                        <h3 className="text-lg font-semibold text-green-900">
                          ✅ Connected to Zuora Sandbox
                        </h3>
                        <p className="text-sm text-green-700">
                          Environment:{" "}
                          {environment === "api-sandbox"
                            ? "API Sandbox"
                            : environment === "sandbox"
                            ? "Sandbox / Test"
                            : "Production"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="mt-8">
                    <h3 className="mb-4 text-lg font-semibold text-gray-900">
                      Quick Actions
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Button
                        variant="outline"
                        className="h-auto flex-col items-start gap-2 p-4 hover:border-[#2B6CF3] hover:bg-blue-50 bg-transparent"
                        onClick={() => handleQuickAction("create-product")}
                      >
                        <Package className="h-6 w-6 text-[#2B6CF3]" />
                        <div className="text-left">
                          <div className="font-semibold">Create Product</div>
                          <div className="text-xs text-gray-600">
                            Add a new product to your catalog
                          </div>
                        </div>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-auto flex-col items-start gap-2 p-4 hover:border-[#2B6CF3] hover:bg-blue-50 bg-transparent"
                        onClick={() => handleQuickAction("view-product")}
                      >
                        <Eye className="h-6 w-6 text-[#2B6CF3]" />
                        <div className="text-left">
                          <div className="font-semibold">View Product</div>
                          <div className="text-xs text-gray-600">
                            Browse your product catalog
                          </div>
                        </div>
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}
    </div>
  );
}
