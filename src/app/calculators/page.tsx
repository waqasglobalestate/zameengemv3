"use client";
/* eslint-disable react-hooks/preserve-manual-memoization */

import React, { useState, useEffect, useCallback } from "react";
import { 
  calculateROI, 
  calculateRentalYield, 
  calculateHomeLoan, 
  calculateProfessionalConstruction, 
  ProfessionalConstructionInput,
  ProfessionalConstructionResult,
  ProAreaUnit,
  convertAreaPro,
  ConversionTableEntry,
  calculatePropertyValue,
  PropertyValueInput,
  PropertyValueResult
} from "@/utils/calculators";
import { 
  TrendingUp, 
  DollarSign, 
  Home, 
  Wrench, 
  Ruler,
  Coins,
  X
} from "lucide-react";
import { useAppState } from "@/context/AppStateContext";

export default function CalculatorsPage() {
  const { addLead } = useAppState();
  const [activeTab, setActiveTab] = useState<"roi" | "yield" | "loan" | "construction" | "converter" | "value">("roi");

  // Lead Modal Capture States
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [leadTargetType, setLeadTargetType] = useState<"construction" | "value" | null>(null);
  const [leadTargetData, setLeadTargetData] = useState<ProfessionalConstructionResult | PropertyValueResult | null>(null);
  const [leadName, setLeadName] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [leadEmail, setLeadEmail] = useState("");

  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName || !leadPhone) {
      alert("Name and Phone number are required.");
      return;
    }

    if (leadTargetType === "construction" && leadTargetData) {
      handleSaveCalculation(leadTargetData as ProfessionalConstructionResult);
      addLead({
        name: leadName,
        phone: leadPhone,
        email: leadEmail || "N/A",
        whatsApp: leadPhone,
        propertyInterested: `Construction: ${profPlotSize} ${profUnit} - ${profHouseType} (${profQualityLevel})`,
        source: "Calculator Forms",
        agentId: "Chaudhary Waqas"
      });
    } else if (leadTargetType === "value" && leadTargetData) {
      handleSaveValue(leadTargetData as PropertyValueResult);
      addLead({
        name: leadName,
        phone: leadPhone,
        email: leadEmail || "N/A",
        whatsApp: leadPhone,
        propertyInterested: `Property Value: ${valArea} ${valUnit} @ PKR ${valPricePerUnit}/${valUnit}`,
        source: "Calculator Forms",
        agentId: "Chaudhary Waqas"
      });
    }

    // Reset & Close
    setShowLeadModal(false);
    setLeadName("");
    setLeadPhone("");
    setLeadEmail("");
    setLeadTargetType(null);
    setLeadTargetData(null);
  };

  // 1. ROI State
  const [roiPrice, setRoiPrice] = useState(8500000); // 85 Lakh
  const [roiSale, setRoiSale] = useState(12000000); // 1.2 Crore
  const [roiHolding, setRoiHolding] = useState(24); // 2 years
  const [roiCosts, setRoiCosts] = useState(300000);

  // 2. Rental Yield State
  const [yieldValue, setYieldValue] = useState(25000000); // 2.5 Crore
  const [yieldRent, setYieldRent] = useState(95000); // 95k
  const [yieldExpenses, setYieldExpenses] = useState(80000); // Annual maintenance

  // 3. Home Loan State
  const [loanVal, setLoanVal] = useState(15000000); // 1.5 Crore
  const [loanDown, setLoanDown] = useState(20); // 20%
  const [loanRate, setLoanRate] = useState(12.5); // 12.5%
  const [loanTerm, setLoanTerm] = useState(15); // 15 years

  // 4. Professional Construction Cost State
  const [profPlotSize, setProfPlotSize] = useState<number>(10);
  const [profUnit, setProfUnit] = useState<"Marla" | "Kanal" | "Sq Ft" | "Sq Yard">("Marla");
  const [profConstructionType, setProfConstructionType] = useState<"Grey Structure" | "Complete House">("Complete House");
  const [profHouseType, setProfHouseType] = useState<"Single Story" | "Double Story" | "Triple Story">("Double Story");
  const [profQualityLevel, setProfQualityLevel] = useState<"Economy" | "Standard" | "Premium" | "Luxury">("Standard");
  const [profHasBasement, setProfHasBasement] = useState(false);
  const [profHasPool, setProfHasPool] = useState(false);
  const [profHasSolar, setProfHasSolar] = useState(false);
  const [profHasSmartHome, setProfHasSmartHome] = useState(false);
  const [profHistory, setProfHistory] = useState<{
    id: string;
    timestamp: string;
    input: ProfessionalConstructionInput;
    result: ProfessionalConstructionResult;
  }[]>([]);
  const [hoveredMaterial, setHoveredMaterial] = useState<string | null>(null);

  // 5. Area Converter Pro State
  const [convProAmount, setConvProAmount] = useState<number>(10);
  const [convProFrom, setConvProFrom] = useState<ProAreaUnit>("Marla");
  const [convProHistory, setConvProHistory] = useState<{ id: string; timestamp: string; amount: number; unit: ProAreaUnit }[]>([]);

  // 6. Property Value State
  const [valArea, setValArea] = useState<number>(10);
  const [valUnit, setValUnit] = useState<"Marla" | "Kanal" | "Sq Ft" | "Sq Yard">("Marla");
  const [valPricePerUnit, setValPricePerUnit] = useState<number>(1500000);
  const [valHistory, setValHistory] = useState<{
    id: string;
    timestamp: string;
    input: PropertyValueInput;
    result: PropertyValueResult;
  }[]>([]);
  const [hoveredValCostType, setHoveredValCostType] = useState<string | null>(null);

  // Format PKR currency
  const formatPKR = (amount: number) => {
    return "Rs. " + amount.toLocaleString("en-PK");
  };

  // Load history from localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("gem-construction-history");
        if (stored) {
          try {
            setProfHistory(JSON.parse(stored));
          } catch (e) {
            console.error(e);
          }
        }
        const storedConv = localStorage.getItem("gem-converter-history");
        if (storedConv) {
          try {
            setConvProHistory(JSON.parse(storedConv));
          } catch (e) {
            console.error(e);
          }
        }
        const storedVal = localStorage.getItem("gem-value-history");
        if (storedVal) {
          try {
            setValHistory(JSON.parse(storedVal));
          } catch (e) {
            console.error(e);
          }
        }
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleSaveCalculation = useCallback((result: ProfessionalConstructionResult) => {
    const historyItem = {
      id: "calc-" + Date.now(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " " + new Date().toLocaleDateString(),
      input: {
        plotSize: profPlotSize,
        unit: profUnit,
        constructionType: profConstructionType,
        houseType: profHouseType,
        qualityLevel: profQualityLevel,
        hasBasement: profHasBasement,
        hasPool: profHasPool,
        hasSolar: profHasSolar,
        hasSmartHome: profHasSmartHome
      },
      result
    };

    const newHistory = [historyItem, ...profHistory].slice(0, 10);
    setProfHistory(newHistory);
    localStorage.setItem("gem-construction-history", JSON.stringify(newHistory));
    alert("Calculation saved to history successfully!");
  }, [
    profPlotSize,
    profUnit,
    profConstructionType,
    profHouseType,
    profQualityLevel,
    profHasBasement,
    profHasPool,
    profHasSolar,
    profHasSmartHome,
    profHistory
  ]);

  const handleDeleteHistoryItem = useCallback((id: string) => {
    const newHistory = profHistory.filter(h => h.id !== id);
    setProfHistory(newHistory);
    localStorage.setItem("gem-construction-history", JSON.stringify(newHistory));
  }, [profHistory, setProfHistory]);

  const handleLoadHistoryItem = useCallback((item: {
    id: string;
    timestamp: string;
    input: ProfessionalConstructionInput;
    result: ProfessionalConstructionResult;
  }) => {
    const { plotSize, unit, constructionType, houseType, qualityLevel, hasBasement, hasPool, hasSolar, hasSmartHome } = item.input;
    setProfPlotSize(plotSize);
    setProfUnit(unit);
    setProfConstructionType(constructionType);
    setProfHouseType(houseType);
    setProfQualityLevel(qualityLevel);
    setProfHasBasement(hasBasement);
    setProfHasPool(hasPool);
    setProfHasSolar(hasSolar);
    setProfHasSmartHome(hasSmartHome);
  }, [setProfPlotSize, setProfUnit, setProfConstructionType, setProfHouseType, setProfQualityLevel, setProfHasBasement, setProfHasPool, setProfHasSolar, setProfHasSmartHome]);

  const handleSaveConverter = useCallback(() => {
    if (!convProAmount || convProAmount <= 0) return;
    const historyItem = {
      id: "conv-" + Date.now(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " " + new Date().toLocaleDateString(),
      amount: convProAmount,
      unit: convProFrom
    };

    const newHistory = [historyItem, ...convProHistory].slice(0, 10);
    setConvProHistory(newHistory);
    localStorage.setItem("gem-converter-history", JSON.stringify(newHistory));
    alert("Conversion saved to history successfully!");
  }, [convProAmount, convProFrom, convProHistory, setConvProHistory]);

  const handleDeleteConverterItem = useCallback((id: string) => {
    const newHistory = convProHistory.filter(h => h.id !== id);
    setConvProHistory(newHistory);
    localStorage.setItem("gem-converter-history", JSON.stringify(newHistory));
  }, [convProHistory, setConvProHistory]);

  const handleLoadConverterItem = useCallback((item: { amount: number; unit: ProAreaUnit }) => {
    setConvProAmount(item.amount);
    setConvProFrom(item.unit);
  }, [setConvProAmount, setConvProFrom]);

  const handleSaveValue = useCallback((result: PropertyValueResult) => {
    const historyItem = {
      id: "val-" + Date.now(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " " + new Date().toLocaleDateString(),
      input: {
        area: valArea,
        unit: valUnit,
        pricePerUnit: valPricePerUnit
      },
      result
    };

    const newHistory = [historyItem, ...valHistory].slice(0, 10);
    setValHistory(newHistory);
    localStorage.setItem("gem-value-history", JSON.stringify(newHistory));
    alert("Valuation saved to history successfully!");
  }, [valArea, valUnit, valPricePerUnit, valHistory, setValHistory]);

  const handleDeleteValueItem = useCallback((id: string) => {
    const newHistory = valHistory.filter(h => h.id !== id);
    setValHistory(newHistory);
    localStorage.setItem("gem-value-history", JSON.stringify(newHistory));
  }, [valHistory, setValHistory]);

  const handleLoadValueItem = useCallback((item: {
    id: string;
    timestamp: string;
    input: PropertyValueInput;
    result: PropertyValueResult;
  }) => {
    const { area, unit, pricePerUnit } = item.input;
    setValArea(area);
    setValUnit(unit);
    setValPricePerUnit(pricePerUnit);
  }, [setValArea, setValUnit, setValPricePerUnit]);

  const tabs = [
    { id: "roi", name: "ROI Yield", icon: <TrendingUp className="w-4 h-4" /> },
    { id: "yield", name: "Rental Yield", icon: <DollarSign className="w-4 h-4" /> },
    { id: "loan", name: "Home Loan", icon: <Home className="w-4 h-4" /> },
    { id: "construction", name: "Construction Cost", icon: <Wrench className="w-4 h-4" /> },
    { id: "converter", name: "Area Converter", icon: <Ruler className="w-4 h-4" /> },
    { id: "value", name: "Property Value", icon: <Coins className="w-4 h-4" /> }
  ] as const;

  // Calculators triggers
  const roiRes = calculateROI({
    purchasePrice: roiPrice,
    salePrice: roiSale,
    holdingPeriodMonths: roiHolding,
    additionalCosts: roiCosts
  });

  const yieldRes = calculateRentalYield({
    propertyValue: yieldValue,
    monthlyRent: yieldRent,
    annualExpenses: yieldExpenses
  });

  const loanRes = calculateHomeLoan({
    propertyValue: loanVal,
    downPaymentPercentage: loanDown,
    interestRateAnnual: loanRate,
    loanTermYears: loanTerm
  });

  const constRes = calculateProfessionalConstruction({
    plotSize: profPlotSize,
    unit: profUnit,
    constructionType: profConstructionType,
    houseType: profHouseType,
    qualityLevel: profQualityLevel,
    hasBasement: profHasBasement,
    hasPool: profHasPool,
    hasSolar: profHasSolar,
    hasSmartHome: profHasSmartHome
  });

  const convProRes = convertAreaPro(convProAmount, convProFrom);

  const valRes = calculatePropertyValue({
    area: valArea,
    unit: valUnit,
    pricePerUnit: valPricePerUnit
  });

  const formatPKRShort = (amount: number) => {
    if (amount >= 10000000) {
      return `Rs. ${(amount / 10000000).toFixed(2)} Crore`;
    }
    if (amount >= 100000) {
      return `Rs. ${(amount / 100000).toFixed(2)} Lakh`;
    }
    return `Rs. ${amount.toLocaleString("en-PK")}`;
  };

  const handleCopyConverterTable = (amount: number, unit: string, tableData: ConversionTableEntry[]) => {
    const reportText = `ZAMEEN GEM - LAND CONVERSION STATEMENT
Report Date: ${new Date().toLocaleDateString()}
Source Measurement: ${amount} ${unit}

Unit Code\tFull Name\tConverted Value\tClassification
${tableData.map(r => `${r.unit}\t${r.label}\t${r.value}\t${r.isPakistan ? 'Pakistan Standard' : 'International'}`).join("\n")}
`;
    navigator.clipboard.writeText(reportText);
    alert("Full conversion report copied to clipboard!");
  };

  const handleCopySingleValue = (val: number, label: string) => {
    navigator.clipboard.writeText(`${val} ${label}`);
    alert(`Copied: ${val} ${label}`);
  };

  const handleExportPDF = (amount: number, unit: string, tableData: ConversionTableEntry[]) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return alert("Pop-up blocked! Please allow pop-ups to print.");

    const tableRows = tableData.map(row => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 12px; font-weight: 600; color: #1e293b;">${row.unit}</td>
        <td style="padding: 12px; color: #475569;">${row.label}</td>
        <td style="padding: 12px; font-weight: 700; text-align: right; color: #0f172a;">${row.value.toLocaleString()}</td>
        <td style="padding: 12px; text-align: right; font-size: 11px; font-weight: 700; color: ${row.isPakistan ? '#b45309' : '#1d4ed8'};">
          ${row.isPakistan ? 'Pakistan Standard' : 'International'}
        </td>
      </tr>
    `).join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>Area Conversion Report - Zameen Gem</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #334155; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: 900; color: #1e3a8a; }
            .subtitle { font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; }
            .title { font-size: 20px; font-weight: 800; color: #0f172a; margin-top: 5px; }
            .summary { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 30px; display: flex; gap: 40px; }
            .summary-item { display: flex; flex-direction: column; }
            .summary-label { font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
            .summary-value { font-size: 20px; font-weight: 900; color: #0f172a; margin-top: 4px; }
            table { width: 100%; border-collapse: collapse; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
            th { background: #f1f5f9; padding: 12px; font-size: 11px; font-weight: 800; text-transform: uppercase; text-align: left; color: #475569; border-bottom: 2px solid #e2e8f0; }
            td { font-size: 13px; }
            .footer { margin-top: 50px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">ZAMEEN GEM</div>
              <div class="title">Land Area Conversion Statement</div>
            </div>
            <div style="text-align: right;">
              <div class="subtitle">Report Generated</div>
              <div style="font-weight: 700; font-size: 13px; color: #0f172a; margin-top: 4px;">${new Date().toLocaleDateString()}</div>
            </div>
          </div>

          <div class="summary">
            <div class="summary-item">
              <div class="summary-label">Source Value</div>
              <div class="summary-value">${amount}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Source Unit</div>
              <div class="summary-value" style="color: #b45309;">${unit}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Unit Code</th>
                <th>Full Name</th>
                <th style="text-align: right;">Converted Value</th>
                <th style="text-align: right;">Standard Classification</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>

          <div class="footer">
            © ${new Date().getFullYear()} Zameen Gem. All rights reserved. This statement is for information purposes and is computed using standard society land measures.
          </div>

          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const materialsList = [
    { key: "cement", label: "Cement", color: "stroke-slate-500", colorHex: "#64748b", bg: "bg-slate-500" },
    { key: "steel", label: "Steel", color: "stroke-blue-500", colorHex: "#3b82f6", bg: "bg-blue-500" },
    { key: "sand", label: "Sand", color: "stroke-amber-500", colorHex: "#f59e0b", bg: "bg-amber-500" },
    { key: "crush", label: "Crush", color: "stroke-yellow-800", colorHex: "#854d0e", bg: "bg-yellow-800" },
    { key: "tiles", label: "Tiles & Marble", color: "stroke-pink-500", colorHex: "#ec4899", bg: "bg-pink-500" },
    { key: "paint", label: "Paint & Finishing", color: "stroke-emerald-500", colorHex: "#10b981", bg: "bg-emerald-500" },
    { key: "plumbing", label: "Plumbing", color: "stroke-cyan-500", colorHex: "#06b6d4", bg: "bg-cyan-500" },
    { key: "electrical", label: "Electrical", color: "stroke-violet-500", colorHex: "#8b5cf6", bg: "bg-violet-500" },
    { key: "other", label: "Other Structure", color: "stroke-gray-400", colorHex: "#9ca3af", bg: "bg-gray-400" }
  ] as const;

  const totalCost = constRes.totalCost;
  const radius = 50;
  const circumference = 2 * Math.PI * radius; // ~314.159265
  
  let currentAccumulated = 0;
  const chartSlices = materialsList.map((mat) => {
    const val = constRes.materialBreakdown[mat.key as keyof typeof constRes.materialBreakdown] || 0;
    const percent = totalCost > 0 ? (val / totalCost) * 100 : 0;
    const slice = {
      ...mat,
      value: val,
      percent,
      strokeDashoffset: circumference - (currentAccumulated / 100) * circumference,
      strokeDashArray: `${(percent / 100) * circumference} ${circumference}`
    };
    currentAccumulated += percent;
    return slice;
  }).filter(s => s.percent > 0);

  const activeHoveredSlice = chartSlices.find(s => s.key === hoveredMaterial);

  const getMilestones = (type: "Grey Structure" | "Complete House", months: number) => {
    const total = months;
    if (type === "Grey Structure") {
      return [
        { title: "Foundation & Excavation", range: `Month 1 - ${Math.max(1, Math.round(total * 0.25))}`, desc: "Plinth beam, foundation excavation, and backfilling." },
        { title: "Superstructure Frame", range: `Month ${Math.round(total * 0.25) + 1} - ${Math.round(total * 0.70)}`, desc: "Pillars, brick masonry, lintel beams, and concrete roof slabs." },
        { title: "Structure Finish & Piping", range: `Month ${Math.round(total * 0.70) + 1} - ${total}`, desc: "Underground electrical conduit pipelines and plumbing drainage layout." }
      ];
    } else {
      return [
        { title: "Foundation & Structure", range: `Month 1 - ${Math.max(1, Math.round(total * 0.35))}`, desc: "Excavation, base structure, concrete beams, and brick masonry walls." },
        { title: "Rough-Ins & Plastering", range: `Month ${Math.round(total * 0.35) + 1} - ${Math.round(total * 0.60)}`, desc: "Plumbing, electrical wiring channels, plastering, and floor levelling." },
        { title: "Finishing & Fixtures", range: `Month ${Math.round(total * 0.60) + 1} - ${Math.round(total * 0.85)}`, desc: "Tile installation, wood frames, false ceiling, and exterior paint." },
        { title: "Final Trim & Turnkey Handover", range: `Month ${Math.round(total * 0.85) + 1} - ${total}`, desc: "Electrical fixtures, bathroom vanity fits, final paint coat, and smart setup." }
      ];
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <span className="text-xs font-bold uppercase tracking-wider text-gold bg-gold/10 px-3 py-1 rounded-full">
          Financial Advisory
        </span>
        <h1 className="text-4xl font-extrabold text-foreground tracking-tight mt-3">
          Real Estate Investment Calculators
        </h1>
        <p className="text-sm text-muted-text mt-3">
          Make data-driven property decisions. Calculate potential capital appreciation, rental yield ratios, construction estimates, mortgage plans, and area unit measurements.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Sidebar Navigation */}
        <div className="w-full lg:w-64 flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-4 lg:pb-0 shrink-0 border-b lg:border-b-0 lg:border-r border-border-base lg:pr-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-3 px-4 py-3 text-sm font-bold rounded-xl whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "bg-royal text-white dark:bg-white dark:text-royal shadow-lg"
                  : "text-muted-text hover:bg-muted-bg hover:text-foreground"
              }`}
            >
              {tab.icon}
              <span>{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Calculator Body Panel */}
        <div className="flex-grow w-full rounded-2xl border border-border-base p-6 md:p-8 bg-background/50 glass">
          
          {/* TAB 1: ROI CALCULATOR */}
          {activeTab === "roi" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-foreground flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-gold" />
                  <span>ROI (Return on Investment) Calculator</span>
                </h3>
                <p className="text-xs text-muted-text mt-1">Estimate capital gains and annualized yields over holding periods.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Inputs */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-muted-text mb-1.5">Purchase Price (PKR)</label>
                    <input 
                      type="number" 
                      value={roiPrice} 
                      onChange={(e) => setRoiPrice(Number(e.target.value))}
                      className="w-full text-sm rounded-lg border border-border-base px-3 py-2 bg-muted-bg focus:ring-1 focus:ring-royal outline-none font-semibold"
                    />
                    <span className="text-[10px] text-muted-text mt-1 block font-medium">{formatPKR(roiPrice)}</span>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-muted-text mb-1.5">Selling Price (PKR)</label>
                    <input 
                      type="number" 
                      value={roiSale} 
                      onChange={(e) => setRoiSale(Number(e.target.value))}
                      className="w-full text-sm rounded-lg border border-border-base px-3 py-2 bg-muted-bg focus:ring-1 focus:ring-royal outline-none font-semibold"
                    />
                    <span className="text-[10px] text-muted-text mt-1 block font-medium">{formatPKR(roiSale)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-muted-text mb-1.5">Holding Period (Months)</label>
                      <input 
                        type="number" 
                        value={roiHolding} 
                        onChange={(e) => setRoiHolding(Number(e.target.value))}
                        className="w-full text-sm rounded-lg border border-border-base px-3 py-2 bg-muted-bg focus:ring-1 focus:ring-royal outline-none font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-muted-text mb-1.5">Additional Costs (PKR)</label>
                      <input 
                        type="number" 
                        value={roiCosts} 
                        onChange={(e) => setRoiCosts(Number(e.target.value))}
                        className="w-full text-sm rounded-lg border border-border-base px-3 py-2 bg-muted-bg focus:ring-1 focus:ring-royal outline-none font-semibold"
                      />
                    </div>
                  </div>
                </div>

                {/* Outputs */}
                <div className="bg-muted-bg border border-border-base rounded-2xl p-6 flex flex-col justify-between">
                  <div className="space-y-6">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-muted-text tracking-wider">Total Net Profit</span>
                      <h4 className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                        {formatPKR(roiRes.totalProfit)}
                      </h4>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-muted-text tracking-wider">Total ROI</span>
                        <p className="text-xl font-bold text-royal dark:text-white mt-0.5">{roiRes.totalPercentageReturn}%</p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-muted-text tracking-wider">Annualized ROI</span>
                        <p className="text-xl font-bold text-gold mt-0.5">{roiRes.annualizedRoi}%</p>
                      </div>
                    </div>
                  </div>

                  <p className="text-[10px] text-muted-text leading-relaxed border-t border-border-base pt-4 mt-6">
                    Note: Annualized ROI accounts for compounding over the holding months. Registry fees and commission rates vary per development sector.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: RENTAL YIELD */}
          {activeTab === "yield" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-foreground flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-gold" />
                  <span>Rental Yield Calculator</span>
                </h3>
                <p className="text-xs text-muted-text mt-1">Check gross and net yields for houses, villas, or commercial plazas.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Inputs */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-muted-text mb-1.5">Property Value (PKR)</label>
                    <input 
                      type="number" 
                      value={yieldValue} 
                      onChange={(e) => setYieldValue(Number(e.target.value))}
                      className="w-full text-sm rounded-lg border border-border-base px-3 py-2 bg-muted-bg focus:ring-1 focus:ring-royal outline-none font-semibold"
                    />
                    <span className="text-[10px] text-muted-text mt-1 block font-medium">{formatPKR(yieldValue)}</span>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-muted-text mb-1.5">Expected Monthly Rent (PKR)</label>
                    <input 
                      type="number" 
                      value={yieldRent} 
                      onChange={(e) => setYieldRent(Number(e.target.value))}
                      className="w-full text-sm rounded-lg border border-border-base px-3 py-2 bg-muted-bg focus:ring-1 focus:ring-royal outline-none font-semibold"
                    />
                    <span className="text-[10px] text-muted-text mt-1 block font-medium">{formatPKR(yieldRent)}</span>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-muted-text mb-1.5">Annual Operating Expenses (PKR)</label>
                    <input 
                      type="number" 
                      value={yieldExpenses} 
                      onChange={(e) => setYieldExpenses(Number(e.target.value))}
                      className="w-full text-sm rounded-lg border border-border-base px-3 py-2 bg-muted-bg focus:ring-1 focus:ring-royal outline-none font-semibold"
                    />
                  </div>
                </div>

                {/* Outputs */}
                <div className="bg-muted-bg border border-border-base rounded-2xl p-6 flex flex-col justify-between">
                  <div className="space-y-6">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-muted-text tracking-wider">Gross Rental Yield</span>
                      <h4 className="text-3xl font-black text-royal dark:text-white mt-1">
                        {yieldRes.grossYield}%
                      </h4>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-muted-text tracking-wider">Net Rental Yield</span>
                        <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{yieldRes.netYield}%</p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-muted-text tracking-wider">Annual Income</span>
                        <p className="text-lg font-bold text-gold mt-0.5">{formatPKR(yieldRes.annualRentalIncome)}</p>
                      </div>
                    </div>
                  </div>

                  <p className="text-[10px] text-muted-text leading-relaxed border-t border-border-base pt-4 mt-6">
                    Gross yield is before expenses. Net yield factors in maintenance costs, property tax, and vacancy rates.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: HOME LOAN */}
          {activeTab === "loan" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-foreground flex items-center space-x-2">
                  <Home className="w-5 h-5 text-gold" />
                  <span>Home Loan Mortgage Calculator</span>
                </h3>
                <p className="text-xs text-muted-text mt-1">Estimate monthly amortization schedules and down payment distributions.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Inputs */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-muted-text mb-1.5">Property Purchase Value (PKR)</label>
                    <input 
                      type="number" 
                      value={loanVal} 
                      onChange={(e) => setLoanVal(Number(e.target.value))}
                      className="w-full text-sm rounded-lg border border-border-base px-3 py-2 bg-muted-bg focus:ring-1 focus:ring-royal outline-none font-semibold"
                    />
                    <span className="text-[10px] text-muted-text mt-1 block font-medium">{formatPKR(loanVal)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-muted-text mb-1.5">Down Payment (%)</label>
                      <input 
                        type="number" 
                        value={loanDown} 
                        onChange={(e) => setLoanDown(Number(e.target.value))}
                        className="w-full text-sm rounded-lg border border-border-base px-3 py-2 bg-muted-bg focus:ring-1 focus:ring-royal outline-none font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-muted-text mb-1.5">Annual Interest (%)</label>
                      <input 
                        type="number" 
                        step="0.1"
                        value={loanRate} 
                        onChange={(e) => setLoanRate(Number(e.target.value))}
                        className="w-full text-sm rounded-lg border border-border-base px-3 py-2 bg-muted-bg focus:ring-1 focus:ring-royal outline-none font-semibold"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-muted-text mb-1.5">Loan Term (Years)</label>
                    <input 
                      type="range" 
                      min="3" 
                      max="25" 
                      value={loanTerm} 
                      onChange={(e) => setLoanTerm(Number(e.target.value))}
                      className="w-full accent-gold cursor-pointer"
                    />
                    <span className="text-xs font-bold text-foreground mt-1 block">{loanTerm} Years</span>
                  </div>
                </div>

                {/* Outputs */}
                <div className="bg-muted-bg border border-border-base rounded-2xl p-6 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-muted-text tracking-wider">Monthly Installment (EMI)</span>
                      <h4 className="text-3xl font-black text-royal dark:text-white mt-1">
                        {formatPKR(loanRes.monthlyPayment)}
                      </h4>
                    </div>

                    <hr className="border-border-base" />

                    <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs font-semibold text-foreground">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-muted-text block">Down Payment</span>
                        <p className="mt-0.5">{formatPKR(loanRes.downPaymentAmount)}</p>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase font-bold text-muted-text block">Loan Amount</span>
                        <p className="mt-0.5">{formatPKR(loanRes.loanAmount)}</p>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase font-bold text-muted-text block">Total Interest</span>
                        <p className="mt-0.5 text-amber-600">{formatPKR(loanRes.totalInterestPaid)}</p>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase font-bold text-muted-text block">Total Repayment</span>
                        <p className="mt-0.5">{formatPKR(loanRes.totalPayment)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CONSTRUCTION COST */}
          {activeTab === "construction" && (
            <div className="space-y-8">
              <style>{`
                @keyframes specialDance {
                  0%, 100% { transform: scale(1); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
                  50% { transform: scale(1.04); box-shadow: 0 0 20px rgba(16, 185, 129, 0.6); }
                  25% { transform: scale(1.02) rotate(-1deg); }
                  75% { transform: scale(1.02) rotate(1deg); }
                }
                .animate-special-dance {
                  animation: specialDance 2.5s infinite ease-in-out;
                }
              `}</style>
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-base pb-6">
                <div>
                  <h3 className="text-2xl font-black text-foreground flex items-center space-x-2.5">
                    <Wrench className="w-6 h-6 text-gold" />
                    <span>Professional Construction Cost Calculator</span>
                  </h3>
                  <p className="text-xs text-muted-text mt-1">
                    Calculate turnkey residential and grey structure estimation rates in Pakistan, complete with dynamic material specifications and timeline projections.
                  </p>
                </div>
                {profHistory.length > 0 && (
                  <span className="text-xs font-bold px-3 py-1 bg-gold/10 text-gold rounded-full border border-gold/25">
                    {profHistory.length} saved estimates
                  </span>
                )}
              </div>

              {/* Responsive Layout Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Side: Form Inputs */}
                <div className="lg:col-span-5 space-y-6">
                  
                  {/* Property Details */}
                  <div className="bg-background/40 border border-border-base rounded-2xl p-6 space-y-5 shadow-sm">
                    <h4 className="text-sm font-bold uppercase text-foreground tracking-wider border-b border-border-base pb-2 flex items-center space-x-2">
                      <span className="w-1.5 h-3 bg-gold rounded-full"></span>
                      <span>1. Property Size &amp; Area</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase text-muted-text mb-1.5">Plot Size</label>
                        <input 
                          type="number" 
                          min="1"
                          step="any"
                          value={profPlotSize || ""} 
                          onChange={(e) => setProfPlotSize(Math.max(0, Number(e.target.value)))}
                          className="w-full text-sm rounded-lg border border-border-base px-3 py-2 bg-muted-bg focus:ring-1 focus:ring-royal outline-none font-semibold text-foreground"
                          placeholder="e.g. 5, 10, 20"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-muted-text mb-1.5">Area Unit</label>
                        <select
                          value={profUnit}
                          onChange={(e) => setProfUnit(e.target.value as "Marla" | "Kanal" | "Sq Ft" | "Sq Yard")}
                          className="w-full text-sm rounded-lg border border-border-base px-3 py-2 bg-muted-bg focus:ring-1 focus:ring-royal outline-none font-bold text-foreground"
                        >
                          <option value="Marla">Marla</option>
                          <option value="Kanal">Kanal</option>
                          <option value="Sq Ft">Square Feet</option>
                          <option value="Sq Yard">Square Yard</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Scope & Story */}
                  <div className="bg-background/40 border border-border-base rounded-2xl p-6 space-y-5 shadow-sm">
                    <h4 className="text-sm font-bold uppercase text-foreground tracking-wider border-b border-border-base pb-2 flex items-center space-x-2">
                      <span className="w-1.5 h-3 bg-royal rounded-full"></span>
                      <span>2. Build Structure Scope</span>
                    </h4>

                    {/* Scope button tags */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold uppercase text-muted-text">Scope of Work</label>
                      <div className="grid grid-cols-2 gap-3">
                        {(["Grey Structure", "Complete House"] as const).map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setProfConstructionType(t)}
                            className={`py-2 px-3 text-xs font-bold border rounded-xl transition-all flex flex-col items-center justify-center text-center ${
                              profConstructionType === t
                                ? "bg-royal text-white border-royal dark:bg-white dark:text-royal shadow-sm"
                                : "bg-muted-bg border-border-base hover:bg-background text-muted-text hover:text-foreground"
                            }`}
                          >
                            <span className="font-bold text-[13px]">{t}</span>
                            <span className="text-[9px] mt-0.5 opacity-80 font-medium leading-none">
                              {t === "Grey Structure" ? "Base frame & brick masonry" : "Turnkey turnkey finishings"}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Story buttons */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold uppercase text-muted-text">Stories / Floors</label>
                      <div className="grid grid-cols-3 gap-2">
                        {(["Single Story", "Double Story", "Triple Story"] as const).map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setProfHouseType(s)}
                            className={`py-2 px-1 text-xs font-bold border rounded-xl transition-all text-center ${
                              profHouseType === s
                                ? "bg-royal text-white border-royal dark:bg-white dark:text-royal shadow-sm"
                                : "bg-muted-bg border-border-base hover:bg-background text-muted-text hover:text-foreground"
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Quality Standard */}
                  <div className="bg-background/40 border border-border-base rounded-2xl p-6 space-y-4 shadow-sm">
                    <h4 className="text-sm font-bold uppercase text-foreground tracking-wider border-b border-border-base pb-2 flex items-center space-x-2">
                      <span className="w-1.5 h-3 bg-amber-500 rounded-full"></span>
                      <span>3. Quality Standard &amp; Grades</span>
                    </h4>

                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { level: "Economy" as const, rate: profConstructionType === "Complete House" ? 4400 : 2450, desc: "Standard local cement &amp; layout" },
                        { level: "Standard" as const, rate: profConstructionType === "Complete House" ? 5600 : 3000, desc: "Durable high-grade local brands" },
                        { level: "Premium" as const, rate: profConstructionType === "Complete House" ? 6800 : 3350, desc: "Imported tiles &amp; custom wood" },
                        { level: "Luxury" as const, rate: profConstructionType === "Complete House" ? 9100 : 4100, desc: "Designer layouts &amp; smart integrations" }
                      ].map((item) => (
                        <button
                          key={item.level}
                          type="button"
                          onClick={() => setProfQualityLevel(item.level)}
                          className={`p-3 text-left border rounded-xl transition-all flex flex-col justify-between h-24 ${
                            profQualityLevel === item.level
                              ? "border-gold bg-gold/5 dark:bg-gold/10 shadow-sm ring-1 ring-gold"
                              : "bg-muted-bg border-border-base hover:bg-background"
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className={`text-xs font-black ${profQualityLevel === item.level ? "text-gold" : "text-foreground"}`}>
                              {item.level}
                            </span>
                            {profQualityLevel === item.level && (
                              <span className="w-2 h-2 bg-gold rounded-full animate-ping"></span>
                            )}
                          </div>
                          <div>
                            <span className="text-[11px] font-bold text-foreground">
                              PKR {item.rate}/sft
                            </span>
                            <p className="text-[9px] text-muted-text mt-0.5 leading-tight font-medium truncate w-full">
                              {item.desc}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Addons */}
                  <div className="bg-background/40 border border-border-base rounded-2xl p-6 space-y-4 shadow-sm">
                    <h4 className="text-sm font-bold uppercase text-foreground tracking-wider border-b border-border-base pb-2 flex items-center space-x-2">
                      <span className="w-1.5 h-3 bg-emerald-500 rounded-full"></span>
                      <span>4. Premium Add-on Features</span>
                    </h4>

                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { state: profHasBasement, setter: setProfHasBasement, label: "Basement", desc: "+70% covered structure" },
                        { state: profHasPool, setter: setProfHasPool, label: "Swimming Pool", desc: "Reinforced structure" },
                        { state: profHasSolar, setter: setProfHasSolar, label: "Solar System", desc: "Basic to premium hybrid grid" },
                        { state: profHasSmartHome, setter: setProfHasSmartHome, label: "Smart Home", desc: "Central app controls" }
                      ].map((item) => (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => item.setter(!item.state)}
                          className={`p-3 text-left border rounded-xl transition-all flex flex-col justify-between h-20 ${
                            item.state
                              ? "border-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10 shadow-sm"
                              : "bg-muted-bg border-border-base hover:bg-background"
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className={`text-xs font-bold ${item.state ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"}`}>
                              {item.label}
                            </span>
                            <div className={`w-3.5 h-3.5 rounded-md border flex items-center justify-center transition-all ${
                              item.state ? "bg-emerald-500 border-emerald-500 text-white" : "border-border-base bg-background"
                            }`}>
                              {item.state && <span className="text-[9px] font-bold">✓</span>}
                            </div>
                          </div>
                          <p className="text-[9px] text-muted-text leading-none font-medium mt-1">
                            {item.desc}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setLeadTargetType("construction");
                        setLeadTargetData(constRes);
                        setShowLeadModal(true);
                      }}
                      disabled={!profPlotSize || profPlotSize <= 0}
                      className="flex-grow bg-royal hover:bg-royal/95 disabled:bg-royal/40 text-white py-3 rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center space-x-2"
                    >
                      <span>Save Calculation History</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setProfPlotSize(10);
                        setProfUnit("Marla");
                        setProfConstructionType("Complete House");
                        setProfHouseType("Double Story");
                        setProfQualityLevel("Standard");
                        setProfHasBasement(false);
                        setProfHasPool(false);
                        setProfHasSolar(false);
                        setProfHasSmartHome(false);
                      }}
                      className="bg-muted-bg hover:bg-background text-muted-text border border-border-base px-4 py-3 rounded-xl font-bold text-sm transition-all"
                    >
                      Reset
                    </button>
                  </div>

                </div>

                {/* Right Side: LIVE RESULTS & CHARTS */}
                <div className="lg:col-span-7 space-y-6">
                  
                  {/* Total Cost card */}
                  <div className="bg-muted-bg/70 border border-border-base rounded-3xl p-6 md:p-8 space-y-6 relative overflow-hidden">
                    <div className="absolute -right-24 -top-24 w-48 h-48 bg-gold/10 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="absolute -left-24 -bottom-24 w-48 h-48 bg-royal/10 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-base/50 pb-6 relative z-10">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-muted-text tracking-wider">Estimated Total Cost</span>
                        <h4 className="text-4xl md:text-5xl font-black text-royal dark:text-white tracking-tight mt-1 flex items-baseline">
                          {formatPKR(constRes.totalCost)}
                        </h4>
                      </div>
                      <div className="text-left md:text-right">
                        <span className="text-[9px] uppercase font-bold text-muted-text block">Rate Per Sq Ft</span>
                        <p className="text-xl font-black text-gold mt-0.5">PKR {constRes.costPerSqFt.toLocaleString("en-PK")} / sft</p>
                      </div>
                    </div>

                    {/* Stats overview */}
                    <div className="grid grid-cols-3 gap-4 text-xs font-semibold text-foreground relative z-10">
                      <div className="bg-background/50 border border-border-base/40 rounded-2xl p-4">
                        <span className="text-[9px] uppercase font-bold text-muted-text block mb-1">Covered Area</span>
                        <p className="text-base font-black text-foreground">{constRes.coveredAreaSqFt.toLocaleString("en-PK")} <span className="text-[10px] font-normal text-muted-text">sqft</span></p>
                      </div>
                      <div className="bg-background/50 border border-border-base/40 rounded-2xl p-4">
                        <span className="text-[9px] uppercase font-bold text-muted-text block mb-1">Construction Timeline</span>
                        <p className="text-base font-black text-emerald-600 dark:text-emerald-400">{constRes.timelineMonths} <span className="text-[10px] font-normal text-muted-text">Months</span></p>
                      </div>
                      <div className="bg-background/50 border border-border-base/40 rounded-2xl p-4">
                        <span className="text-[9px] uppercase font-bold text-muted-text block mb-1">Plot Land Area</span>
                        <p className="text-base font-black text-foreground">{profPlotSize} <span className="text-[10px] font-normal text-muted-text">{profUnit}</span></p>
                      </div>
                    </div>

                    {/* Progress Bar of Grey vs Finishing Split */}
                    {constRes.finishingCost > 0 && (
                      <div className="space-y-2.5 relative z-10">
                        <div className="flex justify-between text-xs font-bold text-foreground">
                          <span className="flex items-center"><span className="w-2.5 h-2.5 bg-royal rounded-full mr-1.5"></span>Grey Structure ({Math.round((constRes.greyCost / constRes.totalCost) * 100)}%)</span>
                          <span className="flex items-center"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-full mr-1.5"></span>Finishing Cost ({Math.round((constRes.finishingCost / constRes.totalCost) * 100)}%)</span>
                        </div>
                        <div className="w-full h-4 bg-border-base rounded-full overflow-hidden flex">
                          <div 
                            style={{ width: `${(constRes.greyCost / constRes.totalCost) * 100}%` }}
                            className="bg-royal h-full transition-all duration-500"
                            title={`Grey Cost: ${formatPKR(constRes.greyCost)}`}
                          ></div>
                          <div 
                            style={{ width: `${(constRes.finishingCost / constRes.totalCost) * 100}%` }}
                            className="bg-emerald-500 h-full transition-all duration-500"
                            title={`Finishing Cost: ${formatPKR(constRes.finishingCost)}`}
                          ></div>
                        </div>
                        <div className="flex justify-between text-[10px] font-semibold text-muted-text">
                          <span>{formatPKRShort(constRes.greyCost)}</span>
                          <span>{formatPKRShort(constRes.finishingCost)}</span>
                        </div>
                      </div>
                    )}

                    {/* Special WhatsApp Consult Button */}
                    <div className="pt-2 relative z-10 flex flex-col sm:flex-row items-center gap-4 bg-background/30 border border-border-base/30 rounded-2xl p-4">
                      <div className="flex-grow text-center sm:text-left">
                        <h5 className="text-xs font-bold text-foreground">Thinking of Building?</h5>
                        <p className="text-[10px] text-muted-text mt-0.5">Consult with our premier engineering team for a professional construction quote.</p>
                      </div>
                      <a
                        href="https://wa.me/923000066255?text=Consult%20with%20us%20for%20construction"
                        onClick={() => {
                          addLead({
                            name: "WhatsApp Construction Lead",
                            phone: "N/A",
                            email: "N/A",
                            whatsApp: "Yes",
                            propertyInterested: `WhatsApp Consult: ${profPlotSize} ${profUnit} Construction`,
                            source: "WhatsApp Clicks",
                            agentId: "Chaudhary Waqas"
                          });
                        }}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="animate-special-dance bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-md flex items-center justify-center space-x-2 shrink-0 w-full sm:w-auto"
                      >
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                        </svg>
                        <span>Consult with us for construction</span>
                      </a>
                    </div>
                  </div>

                  {/* Materials breakdown details */}
                  <div className="bg-background/40 border border-border-base rounded-3xl p-6 md:p-8 space-y-6">
                    <div>
                      <h4 className="text-sm font-bold uppercase text-foreground tracking-wider flex items-center space-x-2">
                        <span className="w-1.5 h-3 bg-gold rounded-full"></span>
                        <span>Estimated Material Allocation Breakdown</span>
                      </h4>
                      <p className="text-[11px] text-muted-text mt-0.5">Hover or select a material category below to highlight it on the chart.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                      
                      {/* Left: Interactive SVG Donut Chart */}
                      <div className="md:col-span-5 flex justify-center">
                        <div className="relative w-40 h-40">
                          <svg className="w-full h-full transform" viewBox="0 0 140 140">
                            <circle 
                              cx="70" 
                              cy="70" 
                              r="50" 
                              fill="transparent" 
                              stroke="currentColor" 
                              strokeWidth="11" 
                              className="text-border-base dark:text-muted-bg" 
                            />
                            {chartSlices.map((slice) => {
                              const isHovered = hoveredMaterial === slice.key;
                              return (
                                <circle
                                  key={slice.key}
                                  cx="70"
                                  cy="70"
                                  r="50"
                                  fill="transparent"
                                  stroke={slice.colorHex}
                                  strokeWidth={isHovered ? 15 : 11}
                                  strokeDasharray={slice.strokeDashArray}
                                  strokeDashoffset={slice.strokeDashoffset}
                                  transform="rotate(-90 70 70)"
                                  className="transition-all duration-200 cursor-pointer"
                                  onMouseEnter={() => setHoveredMaterial(slice.key)}
                                  onMouseLeave={() => setHoveredMaterial(null)}
                                />
                              );
                            })}
                          </svg>

                          {/* Central Label */}
                          <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-4 pointer-events-none select-none">
                            <span className="text-[9px] uppercase font-bold text-muted-text tracking-wider truncate w-24">
                              {activeHoveredSlice ? activeHoveredSlice.label : "Estimated"}
                            </span>
                            <span className="text-sm font-black text-foreground mt-0.5">
                              {activeHoveredSlice 
                                ? `${activeHoveredSlice.percent.toFixed(1)}%` 
                                : formatPKRShort(totalCost)
                              }
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Detailed Materials list */}
                      <div className="md:col-span-7 space-y-3.5 max-h-[280px] overflow-y-auto pr-1">
                        {materialsList.map((mat) => {
                          const val = constRes.materialBreakdown[mat.key as keyof typeof constRes.materialBreakdown] || 0;
                          const percent = totalCost > 0 ? (val / totalCost) * 100 : 0;
                          const isHovered = hoveredMaterial === mat.key;
                          
                          if (val === 0 && (mat.key === "tiles" || mat.key === "paint")) return null;

                          return (
                            <div 
                              key={mat.key}
                              onMouseEnter={() => setHoveredMaterial(mat.key)}
                              onMouseLeave={() => setHoveredMaterial(null)}
                              className={`p-2 rounded-xl transition-all duration-150 ${
                                isHovered ? "bg-muted-bg border border-border-base/50 shadow-sm" : "border border-transparent"
                              }`}
                            >
                              <div className="flex justify-between items-center text-xs font-semibold text-foreground mb-1">
                                <div className="flex items-center space-x-2">
                                  <span className={`w-2.5 h-2.5 rounded-full ${mat.bg}`}></span>
                                  <span className={isHovered ? "font-bold text-gold" : "text-foreground"}>{mat.label}</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                  <span className="text-muted-text text-[10px] font-bold">{percent.toFixed(1)}%</span>
                                  <span className="font-bold">{formatPKRShort(val)}</span>
                                </div>
                              </div>
                              <div className="w-full h-1.5 bg-border-base/50 rounded-full overflow-hidden">
                                <div 
                                  style={{ width: `${percent}%` }}
                                  className={`h-full transition-all duration-300 ${mat.bg}`}
                                ></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                    </div>
                  </div>

                  {/* Timeline Forecast and Milestones */}
                  <div className="bg-background/40 border border-border-base rounded-3xl p-6 md:p-8 space-y-5">
                    <div>
                      <h4 className="text-sm font-bold uppercase text-foreground tracking-wider flex items-center space-x-2">
                        <span className="w-1.5 h-3 bg-emerald-500 rounded-full"></span>
                        <span>Estimated Construction Timeline Forecast</span>
                      </h4>
                      <p className="text-[11px] text-muted-text mt-0.5">Approximate milestones scheduled over a {constRes.timelineMonths} months timeline.</p>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {getMilestones(profConstructionType, constRes.timelineMonths).map((step, idx) => (
                        <div key={idx} className="flex gap-4 items-start relative pl-2 group">
                          {idx !== getMilestones(profConstructionType, constRes.timelineMonths).length - 1 && (
                            <span className="absolute left-[13px] top-[26px] bottom-[-22px] w-[1.5px] bg-border-base group-hover:bg-gold transition-colors"></span>
                          )}
                          <div className="w-7 h-7 rounded-full bg-muted-bg border border-border-base/60 flex items-center justify-center font-bold text-xs text-muted-text shrink-0 z-10 group-hover:border-gold group-hover:text-gold transition-colors">
                            {idx + 1}
                          </div>
                          <div>
                            <div className="flex items-baseline space-x-2">
                              <h5 className="text-xs font-black text-foreground group-hover:text-gold transition-colors">{step.title}</h5>
                              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">{step.range}</span>
                            </div>
                            <p className="text-[10px] text-muted-text mt-1 leading-normal font-medium">{step.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>

              {/* Saved Estimates History Drawer */}
              {profHistory.length > 0 && (
                <div className="border-t border-border-base pt-8 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-bold uppercase text-foreground tracking-wider flex items-center space-x-2">
                      <span className="w-1.5 h-3 bg-gold rounded-full"></span>
                      <span>Your Saved Cost Estimates ({profHistory.length})</span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm("Are you sure you want to clear all history?")) {
                          setProfHistory([]);
                          localStorage.removeItem("gem-construction-history");
                        }
                      }}
                      className="text-[10px] font-bold uppercase text-red-500 hover:text-red-600 transition-colors"
                    >
                      Clear All History
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {profHistory.map((item) => (
                      <div 
                        key={item.id} 
                        className="bg-background/40 border border-border-base rounded-2xl p-4 flex flex-col justify-between hover:border-gold/50 transition-all shadow-sm"
                      >
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[9px] uppercase font-bold text-gold tracking-wider">
                                {item.input.qualityLevel} • {item.input.constructionType}
                              </span>
                              <h5 className="text-base font-black text-foreground tracking-tight mt-0.5">
                                {item.input.plotSize} {item.input.unit}
                              </h5>
                              <p className="text-[9px] text-muted-text mt-0.5 font-medium">{item.input.houseType}</p>
                            </div>
                            <div className="text-right">
                              <span className="text-[9px] text-muted-text block">{item.timestamp}</span>
                              <span className="text-sm font-black text-royal dark:text-white block mt-0.5">
                                {formatPKRShort(item.result.totalCost)}
                              </span>
                            </div>
                          </div>

                          {/* Mini badges for additional features */}
                          <div className="flex flex-wrap gap-1">
                            {item.input.hasBasement && <span className="text-[8px] font-bold px-1.5 py-0.5 bg-muted-bg rounded-md text-foreground">Basement</span>}
                            {item.input.hasPool && <span className="text-[8px] font-bold px-1.5 py-0.5 bg-muted-bg rounded-md text-foreground">Pool</span>}
                            {item.input.hasSolar && <span className="text-[8px] font-bold px-1.5 py-0.5 bg-muted-bg rounded-md text-foreground">Solar</span>}
                            {item.input.hasSmartHome && <span className="text-[8px] font-bold px-1.5 py-0.5 bg-muted-bg rounded-md text-foreground">Smart</span>}
                            {!item.input.hasBasement && !item.input.hasPool && !item.input.hasSolar && !item.input.hasSmartHome && (
                              <span className="text-[8px] font-bold px-1.5 py-0.5 bg-muted-bg rounded-md text-muted-text">No Add-ons</span>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-border-base/50">
                          <button
                            type="button"
                            onClick={() => handleLoadHistoryItem(item)}
                            className="bg-royal/10 hover:bg-royal/20 text-royal dark:bg-white/10 dark:hover:bg-white/20 dark:text-white py-1.5 rounded-lg text-[10px] font-bold transition-all text-center"
                          >
                            Load Estimate
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteHistoryItem(item.id)}
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-500 py-1.5 rounded-lg text-[10px] font-bold transition-all text-center"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 5: AREA CONVERTER PRO */}
          {activeTab === "converter" && (
            <div className="space-y-8">
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-base pb-6">
                <div>
                  <h3 className="text-2xl font-black text-gold dark:text-gold flex items-center space-x-2.5 tracking-wide">
                    <Ruler className="w-6 h-6 text-gold" />
                    <span>Area Unit Converter Pro</span>
                  </h3>
                  <p className="text-xs text-muted-text mt-1">
                    Instantly convert land measurements across Pakistan standard units and international standard units.
                  </p>
                </div>
                {convProHistory.length > 0 && (
                  <span className="text-xs font-bold px-3 py-1 bg-gold/10 text-gold rounded-full border border-gold/25">
                    {convProHistory.length} cached conversions
                  </span>
                )}
              </div>

              {/* Grid Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Side: Input Panel */}
                <div className="lg:col-span-4 space-y-6">
                  <div className="bg-background/40 border border-border-base rounded-2xl p-6 space-y-5 shadow-sm">
                    <h4 className="text-sm font-bold uppercase text-foreground tracking-wider border-b border-border-base pb-2 flex items-center space-x-2">
                      <span className="w-1.5 h-3 bg-gold rounded-full"></span>
                      <span>Conversion Source</span>
                    </h4>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-black uppercase text-gold mb-1.5 tracking-wider">Enter Value</label>
                        <input 
                          type="number" 
                          min="0"
                          step="any"
                          value={convProAmount || ""} 
                          onChange={(e) => setConvProAmount(Math.max(0, Number(e.target.value)))}
                          className="w-full text-sm rounded-lg border border-border-base px-3 py-2 bg-muted-bg focus:ring-1 focus:ring-royal outline-none font-bold text-foreground"
                          placeholder="e.g. 10, 1500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-black uppercase text-gold mb-1.5 tracking-wider">Source Unit</label>
                        <select
                          value={convProFrom}
                          onChange={(e) => setConvProFrom(e.target.value as ProAreaUnit)}
                          className="w-full text-sm rounded-lg border border-border-base px-3 py-2.5 bg-muted-bg focus:ring-1 focus:ring-royal outline-none font-bold text-foreground"
                        >
                          <optgroup label="Pakistan Units">
                            <option value="Marla">Marla</option>
                            <option value="Kanal">Kanal</option>
                            <option value="Sq Ft">Square Feet (Sq Ft)</option>
                            <option value="Sq Yard">Square Yard (Sq Yard)</option>
                          </optgroup>
                          <optgroup label="International Units">
                            <option value="Acre">Acre</option>
                            <option value="Hectare">Hectare</option>
                            <option value="Square Meter">Square Meter (Sq M)</option>
                          </optgroup>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleSaveConverter}
                      disabled={!convProAmount || convProAmount <= 0}
                      className="flex-grow bg-royal hover:bg-royal/95 disabled:bg-royal/40 text-white py-3 rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center space-x-2"
                    >
                      <span>Save to Cache</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setConvProAmount(10);
                        setConvProFrom("Marla");
                      }}
                      className="bg-muted-bg hover:bg-background text-muted-text border border-border-base px-4 py-3 rounded-xl font-bold text-sm transition-all"
                    >
                      Reset
                    </button>
                  </div>
                </div>

                {/* Right Side: Comparison Matrix */}
                <div className="lg:col-span-8 space-y-6">
                  
                  {/* Results Card */}
                  <div className="bg-muted-bg/70 border border-border-base rounded-3xl p-6 md:p-8 space-y-6 relative overflow-hidden">
                    <div className="absolute -right-24 -top-24 w-48 h-48 bg-gold/5 rounded-full blur-3xl pointer-events-none"></div>
                    
                    {/* Toolbar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-base/50 pb-4 relative z-10">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-muted-text tracking-wider">Equivalent Conversion Matrix</span>
                        <h4 className="text-xl font-black text-foreground mt-0.5">
                          {convProAmount} {convProFrom} Convert Report
                        </h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleCopyConverterTable(convProAmount, convProFrom, convProRes)}
                          className="bg-background hover:bg-muted-bg border border-border-base px-3 py-1.5 rounded-lg text-xs font-bold text-foreground transition-all flex items-center space-x-1"
                        >
                          <span>Copy Report</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleExportPDF(convProAmount, convProFrom, convProRes)}
                          className="bg-gold text-white hover:bg-gold/90 px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 shadow-sm"
                        >
                          <span>Export Statement (PDF)</span>
                        </button>
                      </div>
                    </div>

                    {/* Results Table */}
                    <div className="space-y-2 relative z-10">
                      {convProRes.map((row) => {
                        const isSource = row.unit === convProFrom;
                        return (
                          <div 
                            key={row.unit}
                            className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl border transition-all duration-150 ${
                              isSource 
                                ? "bg-gold/5 border-gold/45 shadow-sm" 
                                : "bg-background/50 border-border-base/50 hover:bg-background hover:border-border-base"
                            }`}
                          >
                            <div className="flex items-center space-x-3 mb-2 sm:mb-0">
                              <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                                isSource ? "bg-gold text-white" : "bg-muted-bg text-muted-text border border-border-base/40"
                              }`}>
                                {row.unit.substring(0, 2)}
                              </span>
                              <div>
                                <span className={`text-xs font-black block ${isSource ? "text-gold" : "text-foreground"}`}>
                                  {row.unit}
                                </span>
                                <span className="text-[10px] text-muted-text font-semibold block leading-none mt-0.5">
                                  {row.label}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-4">
                              <div className="text-right">
                                <span className="text-base font-black text-foreground tracking-tight">
                                  {row.value.toLocaleString(undefined, { maximumFractionDigits: 6 })}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                                  row.isPakistan 
                                    ? "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400" 
                                    : "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
                                }`}>
                                  {row.isPakistan ? "Pakistan" : "Int&apos;l"}
                                </span>

                                <button
                                  type="button"
                                  onClick={() => handleCopySingleValue(row.value, row.label)}
                                  className="p-1 rounded-md bg-muted-bg hover:bg-border-base border border-border-base/40 text-muted-text hover:text-foreground transition-all"
                                  title="Copy measurement"
                                >
                                  <span className="text-[10px] font-bold px-1">Copy</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>

              </div>

              {/* Saved Converter Cache Drawer */}
              {convProHistory.length > 0 && (
                <div className="border-t border-border-base pt-8 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-bold uppercase text-foreground tracking-wider flex items-center space-x-2">
                      <span className="w-1.5 h-3 bg-gold rounded-full"></span>
                      <span>Recent Converter Cache ({convProHistory.length})</span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm("Are you sure you want to clear all history?")) {
                          setConvProHistory([]);
                          localStorage.removeItem("gem-converter-history");
                        }
                      }}
                      className="text-[10px] font-bold uppercase text-red-500 hover:text-red-600 transition-colors"
                    >
                      Clear Cache
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {convProHistory.map((item) => (
                      <div 
                        key={item.id} 
                        className="bg-background/40 border border-border-base rounded-2xl p-3 flex items-center justify-between gap-4 hover:border-gold/50 transition-all shadow-sm shrink-0"
                      >
                        <div>
                          <span className="text-[9px] text-muted-text block leading-none">{item.timestamp}</span>
                          <span className="text-sm font-black text-foreground block mt-1">
                            {item.amount} <span className="text-xs font-semibold text-gold">{item.unit}</span>
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 border-l border-border-base/50 pl-3">
                          <button
                            type="button"
                            onClick={() => handleLoadConverterItem(item)}
                            className="bg-royal/10 hover:bg-royal/20 text-royal dark:bg-white/10 dark:hover:bg-white/20 dark:text-white px-2 py-1 rounded-lg text-[9px] font-bold transition-all text-center"
                          >
                            Load
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteConverterItem(item.id)}
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-500 px-2 py-1 rounded-lg text-[9px] font-bold transition-all text-center"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 6: PROPERTY VALUE CALCULATOR */}
          {activeTab === "value" && (
            <div className="space-y-8">
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-base pb-6">
                <div>
                  <h3 className="text-2xl font-black text-gold dark:text-gold flex items-center space-x-2.5 tracking-wide">
                    <Coins className="w-6 h-6 text-gold" />
                    <span>Property Value &amp; Investment Estimator</span>
                  </h3>
                  <p className="text-xs text-muted-text mt-1">
                    Calculate standard market values and total required capital layout, including Pakistan registry, agent commission, and government taxes.
                  </p>
                </div>
                {valHistory.length > 0 && (
                  <span className="text-xs font-bold px-3 py-1 bg-gold/10 text-gold rounded-full border border-gold/25">
                    {valHistory.length} saved valuations
                  </span>
                )}
              </div>

              {/* Grid Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Side: Inputs */}
                <div className="lg:col-span-5 space-y-6">
                  
                  {/* Property specs */}
                  <div className="bg-background/40 border border-border-base rounded-2xl p-6 space-y-5 shadow-sm">
                    <h4 className="text-sm font-bold uppercase text-foreground tracking-wider border-b border-border-base pb-2 flex items-center space-x-2">
                      <span className="w-1.5 h-3 bg-gold rounded-full"></span>
                      <span>1. Property Dimensions</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase text-muted-text mb-1.5">Area Size</label>
                        <input 
                          type="number" 
                          min="0.01"
                          step="any"
                          value={valArea || ""} 
                          onChange={(e) => setValArea(Math.max(0, Number(e.target.value)))}
                          className="w-full text-sm rounded-lg border border-border-base px-3 py-2 bg-muted-bg focus:ring-1 focus:ring-royal outline-none font-bold text-foreground"
                          placeholder="e.g. 5, 10, 20"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-muted-text mb-1.5">Area Unit</label>
                        <select
                          value={valUnit}
                          onChange={(e) => setValUnit(e.target.value as "Marla" | "Kanal" | "Sq Ft" | "Sq Yard")}
                          className="w-full text-sm rounded-lg border border-border-base px-3 py-2 bg-muted-bg focus:ring-1 focus:ring-royal outline-none font-bold text-foreground"
                        >
                          <option value="Marla">Marla</option>
                          <option value="Kanal">Kanal</option>
                          <option value="Sq Ft">Square Feet</option>
                          <option value="Sq Yard">Square Yard</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Pricing specs */}
                  <div className="bg-background/40 border border-border-base rounded-2xl p-6 space-y-5 shadow-sm">
                    <h4 className="text-sm font-bold uppercase text-foreground tracking-wider border-b border-border-base pb-2 flex items-center space-x-2">
                      <span className="w-1.5 h-3 bg-royal rounded-full"></span>
                      <span>2. Pricing Parameters</span>
                    </h4>

                    <div>
                      <label className="block text-xs font-bold uppercase text-muted-text mb-1.5">Price Per Unit (PKR)</label>
                      <input 
                        type="number" 
                        min="1"
                        step="any"
                        value={valPricePerUnit || ""} 
                        onChange={(e) => setValPricePerUnit(Math.max(0, Number(e.target.value)))}
                        className="w-full text-sm rounded-lg border border-border-base px-3 py-2 bg-muted-bg focus:ring-1 focus:ring-royal outline-none font-bold text-foreground"
                        placeholder="e.g. 1500000"
                      />
                      <span className="text-[10px] text-muted-text mt-1.5 block font-medium">
                        Guideline value: {formatPKR(valPricePerUnit)} per {valUnit}
                      </span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setLeadTargetType("value");
                        setLeadTargetData(valRes);
                        setShowLeadModal(true);
                      }}
                      disabled={!valArea || valArea <= 0 || !valPricePerUnit || valPricePerUnit <= 0}
                      className="flex-grow bg-royal hover:bg-royal/95 disabled:bg-royal/40 text-white py-3 rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center space-x-2"
                    >
                      <span>Save Valuation Record</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setValArea(10);
                        setValUnit("Marla");
                        setValPricePerUnit(1500000);
                      }}
                      className="bg-muted-bg hover:bg-background text-muted-text border border-border-base px-4 py-3 rounded-xl font-bold text-sm transition-all"
                    >
                      Reset
                    </button>
                  </div>

                </div>

                {/* Right Side: Valuation Dashboard & Charts */}
                <div className="lg:col-span-7 space-y-6">
                  
                  {/* Results Summary */}
                  <div className="bg-muted-bg/70 border border-border-base rounded-3xl p-6 md:p-8 space-y-6 relative overflow-hidden">
                    <div className="absolute -right-24 -top-24 w-48 h-48 bg-gold/10 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-base/50 pb-6 relative z-10">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-muted-text tracking-wider">Property Base Market Value</span>
                        <h4 className="text-4xl md:text-5xl font-black text-royal dark:text-white tracking-tight mt-1 flex items-baseline">
                          {formatPKR(valRes.baseValue)}
                        </h4>
                      </div>
                      <div className="text-left md:text-right">
                        <span className="text-[9px] uppercase font-bold text-muted-text block">Price Rate</span>
                        <p className="text-lg font-black text-gold mt-0.5">PKR {valPricePerUnit.toLocaleString("en-PK")} / {valUnit}</p>
                      </div>
                    </div>

                    {/* Estimates Market range */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-foreground relative z-10">
                      <div className="bg-background/50 border border-border-base/40 rounded-2xl p-4">
                        <span className="text-[9px] uppercase font-bold text-muted-text block mb-1.5">Estimated Market Range (-3% to +5%)</span>
                        <p className="text-base font-black text-foreground">
                          {formatPKRShort(valRes.marketValueMin)} <span className="text-[10px] font-normal text-muted-text">to</span> {formatPKRShort(valRes.marketValueMax)}
                        </p>
                      </div>
                      <div className="bg-background/50 border border-border-base/40 rounded-2xl p-4">
                        <span className="text-[9px] uppercase font-bold text-muted-text block mb-1.5">Total Acquisition Layout (inc. taxes)</span>
                        <p className="text-base font-black text-emerald-600 dark:text-emerald-400">
                          {formatPKR(valRes.totalInvestment)}
                        </p>
                      </div>
                    </div>

                    {/* WhatsApp Consult Button */}
                    <div className="pt-2 relative z-10 flex flex-col sm:flex-row items-center gap-4 bg-background/30 border border-border-base/30 rounded-2xl p-4">
                      <div className="flex-grow text-center sm:text-left">
                        <h5 className="text-xs font-bold text-foreground">Thinking of Building?</h5>
                        <p className="text-[10px] text-muted-text mt-0.5">Consult with our premier engineering team for a professional construction quote.</p>
                      </div>
                      <a
                        href="https://wa.me/923000066255?text=Consult%20with%20us%20for%20construction"
                        onClick={() => {
                          addLead({
                            name: "WhatsApp Valuation Lead",
                            phone: "N/A",
                            email: "N/A",
                            whatsApp: "Yes",
                            propertyInterested: `WhatsApp Valuation: ${valArea} ${valUnit} @ PKR ${valPricePerUnit}/${valUnit}`,
                            source: "WhatsApp Clicks",
                            agentId: "Chaudhary Waqas"
                          });
                        }}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-md flex items-center justify-center space-x-2 shrink-0 w-full sm:w-auto"
                      >
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                        </svg>
                        <span>Consult with us for construction</span>
                      </a>
                    </div>
                  </div>

                  {/* SVG Donut Chart breakdown */}
                  <div className="bg-background/40 border border-border-base rounded-3xl p-6 md:p-8 space-y-6">
                    <div>
                      <h4 className="text-sm font-bold uppercase text-foreground tracking-wider flex items-center space-x-2">
                        <span className="w-1.5 h-3 bg-gold rounded-full"></span>
                        <span>Acquisition Overhead Costs Breakdown</span>
                      </h4>
                      <p className="text-[11px] text-muted-text mt-0.5">Hover or select a cost item category to check details.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                      
                      {/* Left: Interactive SVG Donut */}
                      <div className="md:col-span-5 flex justify-center">
                        <div className="relative w-40 h-40">
                          <svg className="w-full h-full transform" viewBox="0 0 140 140">
                            <circle cx="70" cy="70" r="50" fill="transparent" stroke="currentColor" strokeWidth="11" className="text-border-base dark:text-muted-bg" />
                            {(() => {
                              const valueCostItems = [
                                { key: "baseValue", label: "Base Price", value: valRes.baseValue, colorHex: "#3b82f6", bg: "bg-blue-500" },
                                { key: "registryFee", label: "Registry Fee (1.5%)", value: valRes.registryFee, colorHex: "#f59e0b", bg: "bg-amber-500" },
                                { key: "transferTax", label: "Transfer Tax (2.0%)", value: valRes.transferTax, colorHex: "#ef4444", bg: "bg-red-500" },
                                { key: "agentCommission", label: "Agent Commission (1.0%)", value: valRes.agentCommission, colorHex: "#10b981", bg: "bg-emerald-500" },
                                { key: "localTax", label: "Local Govt Tax (1.0%)", value: valRes.localTax, colorHex: "#06b6d4", bg: "bg-cyan-500" }
                              ] as const;

                              const totalInvestment = valRes.totalInvestment;
                              const valRadius = 50;
                              const valCircumference = 2 * Math.PI * valRadius; // ~314.159265
                              
                              let valCurrentAccumulated = 0;
                              const valChartSlices = valueCostItems.map((item) => {
                                const percent = totalInvestment > 0 ? (item.value / totalInvestment) * 100 : 0;
                                const slice = {
                                  ...item,
                                  percent,
                                  strokeDashoffset: valCircumference - (valCurrentAccumulated / 100) * valCircumference,
                                  strokeDashArray: `${(percent / 100) * valCircumference} ${valCircumference}`
                                };
                                valCurrentAccumulated += percent;
                                return slice;
                              }).filter(s => s.percent > 0);

                              const activeHoveredValSlice = valChartSlices.find(s => s.key === hoveredValCostType);

                              return (
                                <>
                                  {valChartSlices.map((slice) => {
                                    const isHovered = hoveredValCostType === slice.key;
                                    return (
                                      <circle
                                        key={slice.key}
                                        cx="70"
                                        cy="70"
                                        r="50"
                                        fill="transparent"
                                        stroke={slice.colorHex}
                                        strokeWidth={isHovered ? 15 : 11}
                                        strokeDasharray={slice.strokeDashArray}
                                        strokeDashoffset={slice.strokeDashoffset}
                                        transform="rotate(-90 70 70)"
                                        className="transition-all duration-200 cursor-pointer"
                                        onMouseEnter={() => setHoveredValCostType(slice.key)}
                                        onMouseLeave={() => setHoveredValCostType(null)}
                                      />
                                    );
                                  })}

                                  {/* Central Label */}
                                  <g className="text-center pointer-events-none select-none">
                                    <text x="70" y="65" textAnchor="middle" className="fill-muted-text font-bold text-[8px] uppercase tracking-wider">
                                      {activeHoveredValSlice ? activeHoveredValSlice.label : "Total Investment"}
                                    </text>
                                    <text x="70" y="82" textAnchor="middle" className="fill-foreground font-black text-[11px]">
                                      {activeHoveredValSlice 
                                        ? `${activeHoveredValSlice.percent.toFixed(1)}%` 
                                        : formatPKRShort(totalInvestment)
                                      }
                                    </text>
                                  </g>
                                </>
                              );
                            })()}
                          </svg>
                        </div>
                      </div>

                      {/* Right: Cost categories table */}
                      <div className="md:col-span-7 space-y-3.5">
                        {(() => {
                          const valueCostItems = [
                            { key: "baseValue", label: "Base Price", value: valRes.baseValue, colorHex: "#3b82f6", bg: "bg-blue-500" },
                            { key: "registryFee", label: "Registry Fee (1.5%)", value: valRes.registryFee, colorHex: "#f59e0b", bg: "bg-amber-500" },
                            { key: "transferTax", label: "Transfer Tax (2.0%)", value: valRes.transferTax, colorHex: "#ef4444", bg: "bg-red-500" },
                            { key: "agentCommission", label: "Agent Commission (1.0%)", value: valRes.agentCommission, colorHex: "#10b981", bg: "bg-emerald-500" },
                            { key: "localTax", label: "Local Govt Tax (1.0%)", value: valRes.localTax, colorHex: "#06b6d4", bg: "bg-cyan-500" }
                          ] as const;
                          const totalInvestment = valRes.totalInvestment;

                          return valueCostItems.map((item) => {
                            const percent = totalInvestment > 0 ? (item.value / totalInvestment) * 100 : 0;
                            const isHovered = hoveredValCostType === item.key;
                            return (
                              <div 
                                key={item.key}
                                onMouseEnter={() => setHoveredValCostType(item.key)}
                                onMouseLeave={() => setHoveredValCostType(null)}
                                className={`p-2 rounded-xl transition-all duration-150 ${
                                  isHovered ? "bg-muted-bg border border-border-base/50 shadow-sm" : "border border-transparent"
                                }`}
                              >
                                <div className="flex justify-between items-center text-xs font-semibold text-foreground mb-1">
                                  <div className="flex items-center space-x-2">
                                    <span className={`w-2.5 h-2.5 rounded-full ${item.bg}`}></span>
                                    <span className={isHovered ? "font-bold text-gold" : "text-foreground"}>{item.label}</span>
                                  </div>
                                  <div className="flex items-center space-x-3">
                                    <span className="text-muted-text text-[10px] font-bold">{percent.toFixed(1)}%</span>
                                    <span className="font-bold">{formatPKRShort(item.value)}</span>
                                  </div>
                                </div>
                                <div className="w-full h-1.5 bg-border-base/50 rounded-full overflow-hidden">
                                  <div 
                                    style={{ width: `${percent}%` }}
                                    className={`h-full transition-all duration-300 ${item.bg}`}
                                  ></div>
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>

                    </div>
                  </div>

                </div>

              </div>

              {/* Saved Valuations History drawer */}
              {valHistory.length > 0 && (
                <div className="border-t border-border-base pt-8 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-bold uppercase text-foreground tracking-wider flex items-center space-x-2">
                      <span className="w-1.5 h-3 bg-gold rounded-full"></span>
                      <span>Your Saved Property Valuations ({valHistory.length})</span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm("Are you sure you want to clear all history?")) {
                          setValHistory([]);
                          localStorage.removeItem("gem-value-history");
                        }
                      }}
                      className="text-[10px] font-bold uppercase text-red-500 hover:text-red-600 transition-colors"
                    >
                      Clear History
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {valHistory.map((item) => (
                      <div 
                        key={item.id} 
                        className="bg-background/40 border border-border-base rounded-2xl p-4 flex flex-col justify-between hover:border-gold/50 transition-all shadow-sm"
                      >
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[9px] uppercase font-bold text-gold tracking-wider">
                                {item.input.area} {item.input.unit}
                              </span>
                              <h5 className="text-base font-black text-foreground tracking-tight mt-0.5">
                                {formatPKRShort(item.result.baseValue)}
                              </h5>
                              <p className="text-[9px] text-muted-text mt-0.5 font-medium">Rate: {formatPKRShort(item.input.pricePerUnit)} / {item.input.unit}</p>
                            </div>
                            <div className="text-right">
                              <span className="text-[9px] text-muted-text block">{item.timestamp}</span>
                              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 block mt-1" title="Investment cost including taxes">
                                Est: {formatPKRShort(item.result.totalInvestment)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-border-base/50">
                          <button
                            type="button"
                            onClick={() => handleLoadValueItem(item)}
                            className="bg-royal/10 hover:bg-royal/20 text-royal dark:bg-white/10 dark:hover:bg-white/20 dark:text-white py-1.5 rounded-lg text-[10px] font-bold transition-all text-center"
                          >
                            Load Estimate
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteValueItem(item.id)}
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-500 py-1.5 rounded-lg text-[10px] font-bold transition-all text-center"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
      </div>

      {/* Lead Capture Modal */}
      {showLeadModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-background border border-border-base rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="absolute -right-16 -top-16 w-32 h-32 bg-gold/10 rounded-full blur-2xl"></div>
            
            <button 
              onClick={() => setShowLeadModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-muted-bg text-muted-text hover:text-foreground transition-all"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="text-center space-y-2 mb-6">
              <span className="text-[10px] font-black uppercase tracking-wider text-gold px-2.5 py-0.5 bg-gold/10 rounded-full inline-block">Save to Profile</span>
              <h4 className="text-lg font-black text-foreground">Save Estimate &amp; Consult</h4>
              <p className="text-xs text-muted-text leading-relaxed">Enter your contact details to save this calculation to your personal history drawer and request a free expert callback.</p>
            </div>
            
            <form onSubmit={handleLeadSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-muted-text mb-1.5">Full Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Chaudhary Ali"
                  value={leadName}
                  onChange={(e) => setLeadName(e.target.value)}
                  className="w-full text-sm rounded-lg border border-border-base px-3 py-2 bg-muted-bg focus:ring-1 focus:ring-royal outline-none font-bold text-foreground"
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-muted-text mb-1.5">Phone Number</label>
                  <input 
                    type="tel" 
                    required
                    placeholder="e.g. 03001234567"
                    value={leadPhone}
                    onChange={(e) => setLeadPhone(e.target.value)}
                    className="w-full text-sm rounded-lg border border-border-base px-3 py-2 bg-muted-bg focus:ring-1 focus:ring-royal outline-none font-bold text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-muted-text mb-1.5">Email Address</label>
                  <input 
                    type="email" 
                    placeholder="e.g. ali@gmail.com"
                    value={leadEmail}
                    onChange={(e) => setLeadEmail(e.target.value)}
                    className="w-full text-sm rounded-lg border border-border-base px-3 py-2 bg-muted-bg focus:ring-1 focus:ring-royal outline-none font-bold text-foreground"
                  />
                </div>
              </div>
              
              <button
                type="submit"
                className="w-full bg-royal hover:bg-royal/95 text-white py-3 rounded-xl font-bold text-sm transition-all shadow-md mt-2 flex items-center justify-center space-x-2"
              >
                <span>Save Calculation Report</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
