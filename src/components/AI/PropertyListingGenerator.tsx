"use client";

import React, { useState } from "react";
import { generatePropertyListing, GeneratedListing } from "@/utils/aiEngine";
import { Sparkles, Copy, Check, Wand2, RefreshCw, Eye } from "lucide-react";

interface PropertyListingGeneratorProps {
  onApply?: () => void;
}

export default function PropertyListingGenerator({ onApply }: PropertyListingGeneratorProps) {
  // Inputs
  const [propertyType, setPropertyType] = useState("House");
  const [areaSize, setAreaSize] = useState("");
  const [areaUnit, setAreaUnit] = useState("Marla");
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState("");
  const [features, setFeatures] = useState("");
  const [language, setLanguage] = useState<"en" | "ur">("en");

  // Output & Loading states
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [generatedResult, setGeneratedResult] = useState<GeneratedListing | null>(null);
  const [copyStatus, setCopyStatus] = useState<Record<string, boolean>>({});

  const handleGenerate = () => {
    setIsGenerating(true);
    setGenerationStep(0);
    setGeneratedResult(null);

    // Simulated multi-step AI process for premium UX
    const steps = [
      "Analyzing property specifications...",
      "Structuring SEO optimization vectors...",
      "Crafting human-like description...",
      "Generating meta tags and keywords..."
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < steps.length) {
        setGenerationStep(currentStep);
      } else {
        clearInterval(interval);
        
        // Execute the engine generation
        const cleanArea = areaSize ? `${areaSize} ${areaUnit}` : "";
        const result = generatePropertyListing({
          type: propertyType,
          area: cleanArea,
          location,
          price,
          features,
          language
        });
        
        setGeneratedResult(result);
        setIsGenerating(false);
      }
    }, 450);
  };

  const handleCopyText = (field: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopyStatus(prev => ({ ...prev, [field]: true }));
    setTimeout(() => {
      setCopyStatus(prev => ({ ...prev, [field]: false }));
    }, 1500);
  };

  const handleCopyAll = () => {
    if (!generatedResult) return;
    const allText = `
=== PROPERTY LISTING DATA ===
Title: ${generatedResult.title}
SEO Title: ${generatedResult.seoTitle}
Description:
${generatedResult.description}

Meta Description:
${generatedResult.metaDescription}

SEO Keywords: ${generatedResult.keywords}
=============================
    `.trim();

    handleCopyText("all", allText);
  };

  const handleUseInWizard = () => {
    if (!generatedResult) return;
    
    // Save details to localStorage to be read by AddPropertyWizard
    const listingData = {
      title: generatedResult.title,
      description: generatedResult.description,
      type: propertyType,
      area: areaSize,
      areaUnit: areaUnit,
      price: price.replace(/[^0-9]/g, ""), // Keep numerical parts if possible, or string
      location: location
    };

    localStorage.setItem("gem-ai-generated-listing", JSON.stringify(listingData));
    
    if (onApply) {
      onApply();
    } else {
      alert("Listing data saved! Navigate to the 'Add Listing Form' tab to see it pre-filled.");
    }
  };

  const stepsList = [
    "Analyzing property specifications...",
    "Structuring SEO optimization vectors...",
    "Crafting human-like description...",
    "Generating meta tags and keywords..."
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div>
        <h3 className="text-lg font-black text-foreground flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-gold animate-pulse" />
          <span>AI Property Listing Generator</span>
        </h3>
        <p className="text-xs text-muted-text mt-1">
          Auto-create SEO-optimized, human-sounding property descriptions, meta descriptions, titles, and tags in English and Urdu.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* INPUTS COLUMN */}
        <div className="lg:col-span-5 space-y-5 rounded-2xl border border-border-base p-6 bg-background/30 backdrop-blur-md glass">
          <h4 className="text-xs font-black uppercase tracking-wider text-gold flex items-center space-x-1.5">
            <Wand2 className="w-3.5 h-3.5" />
            <span>Listing Specifications</span>
          </h4>

          {/* Language Selector */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase text-muted-text">Output Language</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setLanguage("en")}
                className={`py-2 px-3 text-xs font-bold rounded-lg border text-center transition-all ${
                  language === "en"
                    ? "bg-royal text-white border-royal dark:bg-white dark:text-royal"
                    : "bg-background border-border-base text-muted-text hover:bg-muted-bg"
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLanguage("ur")}
                className={`py-2 px-3 text-xs font-bold rounded-lg border text-center transition-all font-sans ${
                  language === "ur"
                    ? "bg-royal text-white border-royal dark:bg-white dark:text-royal"
                    : "bg-background border-border-base text-muted-text hover:bg-muted-bg"
                }`}
              >
                اردو (Urdu)
              </button>
            </div>
          </div>

          {/* Property Type */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-muted-text mb-1">Property Type</label>
            <select
              value={propertyType}
              onChange={e => setPropertyType(e.target.value)}
              className="w-full text-xs rounded-lg border border-border-base px-3 py-2 bg-background text-foreground outline-none font-bold focus:ring-1 focus:ring-gold"
            >
              <option value="House">House</option>
              <option value="Villa">Villa</option>
              <option value="Apartment">Apartment</option>
              <option value="Residential Plot">Residential Plot</option>
              <option value="Commercial Plot">Commercial Plot</option>
              <option value="Shop">Shop</option>
              <option value="Office">Office</option>
              <option value="Building">Building</option>
              <option value="Farm House">Farm House</option>
            </select>
          </div>

          {/* Area size */}
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="block text-[10px] font-bold uppercase text-muted-text mb-1">Area Size</label>
              <input
                type="number"
                placeholder="e.g. 10 or 1"
                value={areaSize}
                onChange={e => setAreaSize(e.target.value)}
                className="w-full text-xs rounded-lg border border-border-base px-3 py-2 bg-background text-foreground outline-none font-bold focus:ring-1 focus:ring-gold"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-muted-text mb-1">Unit</label>
              <select
                value={areaUnit}
                onChange={e => setAreaUnit(e.target.value)}
                className="w-full text-xs rounded-lg border border-border-base px-2 py-2 bg-background text-foreground outline-none font-bold focus:ring-1 focus:ring-gold"
              >
                <option value="Marla">Marla</option>
                <option value="Kanal">Kanal</option>
                <option value="Sq. Ft.">Sq. Ft.</option>
              </select>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-muted-text mb-1">Location / Sector</label>
            <input
              type="text"
              placeholder="e.g. DHA Bahawalpur Sector A"
              value={location}
              onChange={e => setLocation(e.target.value)}
              className="w-full text-xs rounded-lg border border-border-base px-3 py-2 bg-background text-foreground outline-none font-bold focus:ring-1 focus:ring-gold"
            />
          </div>

          {/* Demand Price */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-muted-text mb-1">Demand Price (optional)</label>
            <input
              type="text"
              placeholder="e.g. 85 Lakhs or 3.2 Crore"
              value={price}
              onChange={e => setPrice(e.target.value)}
              className="w-full text-xs rounded-lg border border-border-base px-3 py-2 bg-background text-foreground outline-none font-bold focus:ring-1 focus:ring-gold"
            />
          </div>

          {/* Key Features */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-muted-text mb-1">Key Features (comma separated)</label>
            <textarea
              placeholder="e.g. Corner plot, Near Park, Double story, 4 Bedrooms, Modern kitchen"
              rows={3}
              value={features}
              onChange={e => setFeatures(e.target.value)}
              className="w-full text-xs rounded-lg border border-border-base px-3 py-2 bg-background text-foreground outline-none focus:ring-1 focus:ring-gold resize-none"
            />
          </div>

          {/* Submit */}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating || !location}
            className="w-full py-2.5 bg-gold hover:bg-gold-hover text-slate-950 text-xs font-black rounded-lg transition-colors flex items-center justify-center space-x-2 disabled:bg-slate-700 disabled:text-slate-400 cursor-pointer shadow-md"
          >
            <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
            <span>Generate AI Copy</span>
          </button>
        </div>

        {/* OUTPUTS COLUMN */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* SKELETON / LOADING LOOPER */}
          {isGenerating && (
            <div className="rounded-2xl border border-border-base p-8 bg-background/10 space-y-6 animate-pulse glass">
              <div className="space-y-2">
                <div className="h-4 bg-muted-bg rounded w-1/4"></div>
                <div className="h-3 bg-muted-bg rounded w-3/4"></div>
              </div>

              <div className="space-y-4 py-4 border-t border-b border-border-base/50">
                {stepsList.map((st, idx) => (
                  <div key={idx} className="flex items-center space-x-3 text-xs font-bold text-muted-text">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${
                      generationStep > idx 
                        ? "bg-emerald-500 text-white" 
                        : generationStep === idx 
                          ? "bg-gold text-slate-950 animate-bounce" 
                          : "bg-muted-bg text-slate-400"
                    }`}>
                      {generationStep > idx ? "✓" : idx + 1}
                    </div>
                    <span className={generationStep === idx ? "text-gold" : "text-muted-text"}>{st}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <div className="h-10 bg-muted-bg rounded"></div>
                <div className="h-28 bg-muted-bg rounded"></div>
              </div>
            </div>
          )}

          {/* INITIAL STATE */}
          {!isGenerating && !generatedResult && (
            <div className="h-full min-h-[300px] border-2 border-dashed border-border-base rounded-2xl flex flex-col items-center justify-center text-center p-8 bg-background/10 glass">
              <Wand2 className="w-12 h-12 text-slate-500 mb-3 animate-pulse" />
              <h4 className="font-bold text-foreground text-sm">Listing Output Sandbox</h4>
              <p className="text-xs text-muted-text max-w-sm mt-1">
                Enter your property details on the left and click generate. Your SEO optimized copy will appear here instantly.
              </p>
            </div>
          )}

          {/* AI GENERATED RESULTS */}
          {!isGenerating && generatedResult && (
            <div className="space-y-6">
              
              {/* Google Search SERP Snippet Preview */}
              <div className="rounded-2xl border border-border-base p-5 bg-white dark:bg-slate-900 shadow-md">
                <h4 className="text-[10px] font-bold uppercase text-slate-400 mb-3 flex items-center space-x-1.5">
                  <Eye className="w-3.5 h-3.5" />
                  <span>Google Search Result Snippet Preview</span>
                </h4>
                
                <div className="space-y-1 font-sans">
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    https://globalestate.com.pk &gt; property &gt; listing
                  </div>
                  <h3 className="text-lg text-[#1a0dab] dark:text-[#8ab4f8] hover:underline font-medium cursor-pointer leading-tight truncate">
                    {generatedResult.seoTitle}
                  </h3>
                  <p className="text-xs text-[#4d5156] dark:text-[#bdc1c6] leading-relaxed line-clamp-2">
                    {generatedResult.metaDescription}
                  </p>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex space-x-2">
                  <button
                    onClick={handleCopyAll}
                    className="px-3.5 py-1.5 border border-border-base hover:bg-muted-bg rounded-lg text-xs font-bold text-foreground transition-colors flex items-center space-x-1.5"
                  >
                    {copyStatus["all"] ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copyStatus["all"] ? "All Copied!" : "Copy All Fields"}</span>
                  </button>
                  <button
                    onClick={handleGenerate}
                    className="px-3.5 py-1.5 border border-border-base hover:bg-muted-bg rounded-lg text-xs font-bold text-foreground transition-colors flex items-center space-x-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Regenerate Variation</span>
                  </button>
                </div>

                <button
                  onClick={handleUseInWizard}
                  className="px-4 py-1.5 bg-royal dark:bg-white text-white dark:text-royal text-xs font-black rounded-lg transition-colors flex items-center space-x-1.5 shadow"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>Apply to Listing Wizard</span>
                </button>
              </div>

              {/* Data Cards */}
              <div className="space-y-4">
                
                {/* Property Title */}
                <div className="p-4 border border-border-base bg-background/25 rounded-xl space-y-1.5 glass">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold uppercase text-muted-text">Suggested Property Title</label>
                    <button
                      onClick={() => handleCopyText("title", generatedResult.title)}
                      className="text-muted-text hover:text-foreground p-1 transition-colors"
                      title="Copy title"
                    >
                      {copyStatus["title"] ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                  <input
                    type="text"
                    readOnly
                    value={generatedResult.title}
                    className="w-full text-xs font-bold bg-transparent text-foreground outline-none border-b border-transparent focus:border-gold pb-0.5"
                  />
                </div>

                {/* SEO Title */}
                <div className="p-4 border border-border-base bg-background/25 rounded-xl space-y-1.5 glass">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <label className="text-[10px] font-bold uppercase text-muted-text">Google SEO Title Tag</label>
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                        generatedResult.seoTitle.length >= 40 && generatedResult.seoTitle.length <= 60
                          ? "bg-emerald-500/10 text-emerald-500"
                          : "bg-amber-500/10 text-amber-500"
                      }`}>
                        {generatedResult.seoTitle.length} chars (Optimal 45-60)
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopyText("seoTitle", generatedResult.seoTitle)}
                      className="text-muted-text hover:text-foreground p-1 transition-colors"
                      title="Copy SEO Title"
                    >
                      {copyStatus["seoTitle"] ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                  <input
                    type="text"
                    readOnly
                    value={generatedResult.seoTitle}
                    className="w-full text-xs bg-transparent text-foreground outline-none border-b border-transparent focus:border-gold pb-0.5"
                  />
                </div>

                {/* Meta Description */}
                <div className="p-4 border border-border-base bg-background/25 rounded-xl space-y-1.5 glass">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <label className="text-[10px] font-bold uppercase text-muted-text">Meta Description Tag</label>
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                        generatedResult.metaDescription.length >= 140 && generatedResult.metaDescription.length <= 160
                          ? "bg-emerald-500/10 text-emerald-500"
                          : "bg-amber-500/10 text-amber-500"
                      }`}>
                        {generatedResult.metaDescription.length} chars (Optimal 150-160)
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopyText("metaDesc", generatedResult.metaDescription)}
                      className="text-muted-text hover:text-foreground p-1 transition-colors"
                      title="Copy Meta Description"
                    >
                      {copyStatus["metaDesc"] ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                  <textarea
                    readOnly
                    rows={2}
                    value={generatedResult.metaDescription}
                    className="w-full text-xs bg-transparent text-foreground outline-none resize-none"
                  />
                </div>

                {/* SEO Keywords */}
                <div className="p-4 border border-border-base bg-background/25 rounded-xl space-y-1.5 glass">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold uppercase text-muted-text">Target Keywords (Meta Keywords)</label>
                    <button
                      onClick={() => handleCopyText("keywords", generatedResult.keywords)}
                      className="text-muted-text hover:text-foreground p-1 transition-colors"
                      title="Copy Keywords"
                    >
                      {copyStatus["keywords"] ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                  <input
                    type="text"
                    readOnly
                    value={generatedResult.keywords}
                    className="w-full text-xs bg-transparent text-foreground outline-none border-b border-transparent focus:border-gold pb-0.5"
                  />
                </div>

                {/* Full Description */}
                <div className="p-4 border border-border-base bg-background/25 rounded-xl space-y-2.5 glass">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold uppercase text-muted-text">Full Property Description (Google Optimized)</label>
                    <button
                      onClick={() => handleCopyText("desc", generatedResult.description)}
                      className="text-muted-text hover:text-foreground p-1 transition-colors"
                      title="Copy Description"
                    >
                      {copyStatus["desc"] ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  
                  {/* Styled preview */}
                  <div 
                    className={`text-xs text-foreground leading-relaxed whitespace-pre-line border-t border-border-base/50 pt-2 ${
                      language === "ur" ? "text-right font-sans" : "text-left"
                    }`}
                  >
                    {generatedResult.description}
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
