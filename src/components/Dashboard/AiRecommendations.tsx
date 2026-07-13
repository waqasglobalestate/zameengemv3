"use client";

import React, { useState } from "react";
import { useAppState } from "@/context/AppStateContext";
import PropertyCard from "@/components/Property/PropertyCard";
import { 
  extractUserPreferences, 
  UserPreferences,
  calculateRecommendationScore,
  calculateSectorAverages
} from "@/utils/recommendationEngine";
import { 
  Sparkles, 
  Sliders, 
  TrendingDown, 
  Building, 
  X, 
  Clock
} from "lucide-react";

export default function AiRecommendations() {
  const { 
    properties, 
    savedProperties: savedIds, 
    recentlyViewed: recentIds, 
    savedSearches 
  } = useAppState();

  // Map IDs to actual Property objects
  const savedProperties = properties.filter(p => savedIds.includes(p.id));
  const recentlyViewed = properties.filter(p => recentIds.includes(p.id));

  // Compute inferred preferences dynamically during render
  const inferredPrefs = extractUserPreferences(savedSearches, savedProperties, recentlyViewed);

  // User overrides/customizations (initialized to null to fall back to inferred values)
  const [customBudget, setCustomBudget] = useState<number | null>(null);
  const [customLocations, setCustomLocations] = useState<string[] | null>(null);
  const [customTypes, setCustomTypes] = useState<string[] | null>(null);
  const [customPurpose, setCustomPurpose] = useState<"Buy" | "Rent" | null>(null);
  
  // Controls
  const [isEditingPreferences, setIsEditingPreferences] = useState(false);
  const [newLocationInput, setNewLocationInput] = useState("");
  const [activeTab, setActiveTab] = useState<"similar" | "better" | "new">("similar");
  const [hoveredScoreId, setHoveredScoreId] = useState<string | null>(null);

  // Derive active preferences (overrides take precedence, else fall back to inferred)
  const activePreferences: UserPreferences = {
    targetBudget: customBudget !== null ? customBudget : inferredPrefs.targetBudget,
    locations: customLocations !== null ? customLocations : inferredPrefs.locations,
    propertyTypes: customTypes !== null ? customTypes : inferredPrefs.propertyTypes,
    purpose: customPurpose !== null ? customPurpose : inferredPrefs.purpose
  };

  const averages = calculateSectorAverages(properties);
  const savedIdsSet = new Set(savedIds);
  const candidateProperties = properties.filter(p => !savedIdsSet.has(p.id));

  // Score all candidate properties
  const scoredCandidates = candidateProperties.map(property => {
    const score = calculateRecommendationScore(property, activePreferences, averages);
    const groupKey = `${property.location}_${property.sector}_${property.type}_${property.size}`.toLowerCase().replace(/\s+/g, "");
    const avgPrice = averages[groupKey];
    const savings = avgPrice && property.price < avgPrice ? Math.round(avgPrice - property.price) : 0;
    return { property, score, savings };
  });

  // Sort candidates by recommendation score descending
  scoredCandidates.sort((a, b) => b.score.total - a.score.total);

  // Filter recommendations lists
  const similarRecommendations = scoredCandidates
    .filter(item => 
      activePreferences.propertyTypes.includes(item.property.type) && 
      item.score.total >= 65
    )
    .slice(0, 6);

  const betterDealRecommendations = scoredCandidates
    .filter(item => item.savings > 0 && item.score.total >= 55)
    .sort((a, b) => b.savings - a.savings)
    .slice(0, 6);

  const newRecommendations = [...scoredCandidates]
    .filter(item => item.score.total >= 60)
    .sort((a, b) => b.property.id.localeCompare(a.property.id))
    .slice(0, 6);

  // Add location helper
  const handleAddLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocationInput.trim()) return;
    const currentLocs = customLocations !== null ? customLocations : inferredPrefs.locations;
    if (!currentLocs.includes(newLocationInput.trim())) {
      setCustomLocations([...currentLocs, newLocationInput.trim()]);
    }
    setNewLocationInput("");
  };

  // Remove location helper
  const handleRemoveLocation = (loc: string) => {
    const currentLocs = customLocations !== null ? customLocations : inferredPrefs.locations;
    setCustomLocations(currentLocs.filter(l => l !== loc));
  };

  // Toggle property type
  const handleToggleType = (type: string) => {
    const currentTypes = customTypes !== null ? customTypes : inferredPrefs.propertyTypes;
    if (currentTypes.includes(type)) {
      setCustomTypes(currentTypes.filter(t => t !== type));
    } else {
      setCustomTypes([...currentTypes, type]);
    }
  };

  const ALL_PROPERTY_TYPES = [
    "Residential Plot", "Commercial Plot", "Villa", "House", "Plot", "Apartment", "Shop", "Office"
  ];

  return (
    <div className="space-y-6">
      
      {/* 1. Inferred Bio Summary & Tune Preferences */}
      <div className="border border-border-base rounded-2xl bg-muted-bg/15 dark:bg-slate-950/20 glass p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gold/10 text-gold-accent rounded-xl border border-gold/15">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-black text-sm text-foreground">AI Buyer Recommendation Engine</h3>
              <p className="text-[10px] text-muted-text mt-0.5">
                Tailoring listing recommendations based on your activity, views, and search history
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsEditingPreferences(!isEditingPreferences)}
            className="flex items-center space-x-1.5 px-3 py-1.5 border border-border-base bg-background hover:bg-muted-bg text-xs font-bold rounded-lg transition-colors shrink-0"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{isEditingPreferences ? "Save Profile" : "Tune Preferences"}</span>
          </button>
        </div>

        {/* PROFILE PREFERENCES SUMMARY BLOCK */}
        {!isEditingPreferences ? (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs pt-2 border-t border-border-base/40">
            <div>
              <span className="text-[9px] text-muted-text uppercase block">Target Budget</span>
              <span className="font-bold text-foreground mt-0.5 block">
                PKR {(activePreferences.targetBudget / 10000000).toFixed(2)} Crore
              </span>
            </div>
            <div>
              <span className="text-[9px] text-muted-text uppercase block">Preferred Areas</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {activePreferences.locations.map(loc => (
                  <span key={loc} className="px-2 py-0.5 bg-muted-bg border border-border-base rounded text-[9px] font-bold">
                    {loc}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <span className="text-[9px] text-muted-text uppercase block">Property Types</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {activePreferences.propertyTypes.map(t => (
                  <span key={t} className="px-2 py-0.5 bg-muted-bg border border-border-base rounded text-[9px] font-bold">
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <span className="text-[9px] text-muted-text uppercase block">Acquisition Intent</span>
              <span className="font-bold text-royal dark:text-royal-accent mt-0.5 block">
                For {activePreferences.purpose}
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-4 pt-4 border-t border-border-base/40 animate-in fade-in duration-200">
            <h4 className="text-xs font-bold text-foreground">Adjust Recommendation Preferences</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Left Column: Budget Slider & Purpose */}
              <div className="space-y-4">
                {/* Budget Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-muted-text">Target Budget:</span>
                    <span className="text-gold">PKR {(activePreferences.targetBudget / 10000000).toFixed(2)} Crore</span>
                  </div>
                  <input
                    type="range"
                    min={2000000} // 20 Lakh
                    max={100000000} // 10 Crore
                    step={500000}
                    value={activePreferences.targetBudget}
                    onChange={e => setCustomBudget(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-muted-bg rounded-lg appearance-none cursor-pointer accent-gold"
                  />
                  <div className="flex justify-between text-[9px] text-muted-text">
                    <span>20 Lakh</span>
                    <span>10 Crore</span>
                  </div>
                </div>

                {/* Purpose Selection */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-muted-text font-bold uppercase block">Acquisition Purpose</label>
                  <div className="flex space-x-2">
                    {["Buy", "Rent"].map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setCustomPurpose(p as typeof customPurpose)}
                        className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${
                          activePreferences.purpose === p 
                            ? "bg-royal text-white border-royal dark:bg-white dark:text-royal dark:border-white shadow" 
                            : "border-border-base hover:bg-muted-bg text-muted-text"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Locations & Types */}
              <div className="space-y-4">
                
                {/* Preferred Locations */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-muted-text font-bold uppercase block">Target Locations</label>
                  <form onSubmit={handleAddLocation} className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Add sector or society..."
                      value={newLocationInput}
                      onChange={e => setNewLocationInput(e.target.value)}
                      className="flex-1 text-xs border border-border-base rounded-xl px-3 py-1.5 bg-background outline-none focus:ring-1 focus:ring-gold"
                    />
                    <button
                      type="submit"
                      className="bg-gold hover:bg-gold-hover text-slate-950 px-3.5 rounded-xl font-bold text-xs active:scale-95"
                    >
                      Add
                    </button>
                  </form>

                  <div className="flex flex-wrap gap-1.5 pt-1.5">
                    {activePreferences.locations.map(loc => (
                      <span key={loc} className="flex items-center space-x-1 px-2 py-0.5 bg-background border border-border-base rounded-lg text-[9px] font-bold text-foreground">
                        <span>{loc}</span>
                        <button type="button" onClick={() => handleRemoveLocation(loc)} className="text-red-500 hover:text-red-700">
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Property Types */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-muted-text font-bold uppercase block">Preferred Types</label>
                  <div className="flex flex-wrap gap-1">
                    {ALL_PROPERTY_TYPES.map(type => {
                      const isSelected = activePreferences.propertyTypes.includes(type);
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => handleToggleType(type)}
                          className={`px-2.5 py-1 text-[9px] font-bold rounded-lg border transition-all ${
                            isSelected 
                              ? "bg-gold/15 text-gold-accent border-gold/45" 
                              : "border-border-base text-muted-text hover:bg-muted-bg"
                          }`}
                        >
                          {type}
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}
      </div>

      {/* 2. Recommendations Sub Tabs */}
      <div className="flex space-x-1.5 border-b border-border-base pb-3 overflow-x-auto">
        {[
          { id: "similar", name: "Similar Listings", icon: <Building className="w-4 h-4" />, count: similarRecommendations.length },
          { id: "better", name: "Bargain Value Deals", icon: <TrendingDown className="w-4 h-4 text-emerald-500" />, count: betterDealRecommendations.length },
          { id: "new", name: "Fresh Recommendations", icon: <Clock className="w-4 h-4 text-blue-500" />, count: newRecommendations.length }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center space-x-2 px-4 py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-royal text-white dark:bg-white dark:text-royal"
                : "text-muted-text hover:bg-muted-bg"
            }`}
          >
            {tab.icon}
            <span>{tab.name}</span>
            <span className={`px-1.5 py-0.25 text-[10px] font-bold rounded-full ${
              activeTab === tab.id ? "bg-white/20 text-white dark:bg-royal/10 dark:text-royal" : "bg-muted-bg text-muted-text border border-border-base"
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* 3. Recommendations display grid */}
      {(() => {
        let activeList: typeof similarRecommendations = [];
        let isBetterDeals = false;
        
        if (activeTab === "similar") {
          activeList = similarRecommendations;
        } else if (activeTab === "better") {
          activeList = betterDealRecommendations;
          isBetterDeals = true;
        } else {
          activeList = newRecommendations;
        }

        if (activeList.length === 0) {
          return (
            <div className="py-20 border border-dashed border-border-base rounded-3xl text-center space-y-3 glass">
              <Sparkles className="w-12 h-12 text-muted-text mx-auto opacity-40" />
              <h4 className="font-bold text-foreground">Analyzing recommendations database...</h4>
              <p className="text-xs text-muted-text max-w-sm mx-auto">
                No recommended listings match this tab constraints. Try adjusting your preferences target budget or location settings above.
              </p>
            </div>
          );
        }

        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeList.map(item => {
              const { property, score, savings } = item;
              
              // Color configurations for Match Score Ring
              const getScoreColor = (total: number) => {
                if (total >= 90) return "text-emerald-500 border-emerald-500/20 bg-emerald-500/10";
                if (total >= 75) return "text-amber-500 border-amber-500/20 bg-amber-500/10";
                return "text-blue-500 border-blue-500/20 bg-blue-500/10";
              };

              return (
                <div key={property.id} className="relative flex flex-col group">
                  
                  {/* Property Card base component */}
                  <PropertyCard property={property} />

                  {/* Bargain Tag overlays */}
                  {isBetterDeals && savings && (
                    <div className="absolute top-28 left-2.5 z-20 flex items-center space-x-1 py-1 px-2.5 bg-emerald-600 border border-emerald-500/30 text-white rounded-lg text-[9px] font-extrabold uppercase shadow shadow-emerald-950/20 animate-pulse">
                      <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
                      <span>PKR {(savings / 100000).toFixed(1)} Lakh Below Avg</span>
                    </div>
                  )}

                  {/* AI RECOMMENDATION MATCH SCORE BADGE */}
                  <div 
                    className="absolute top-2.5 left-2.5 z-20"
                    onMouseEnter={() => setHoveredScoreId(property.id)}
                    onMouseLeave={() => setHoveredScoreId(null)}
                  >
                    <div className={`flex items-center space-x-1.5 py-1 px-2.5 rounded-lg border text-[10px] font-black cursor-help shadow-lg backdrop-blur ${getScoreColor(score.total)}`}>
                      <Sparkles className="w-3 h-3 animate-pulse" />
                      <span>{score.total}% Match</span>
                    </div>

                    {/* AI Scoring breakdown Hover tooltip box */}
                    {hoveredScoreId === property.id && (
                      <div className="absolute left-0 mt-2 w-64 rounded-xl border border-border-base bg-background shadow-2xl p-4 z-40 glass text-xs font-semibold text-foreground space-y-3 animate-in fade-in slide-in-from-top-1 duration-150">
                        <div className="flex items-center space-x-1.5 border-b border-border-base/60 pb-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-gold animate-spin-slow" />
                          <span className="font-black">AI Match Score Breakdown</span>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-muted-text font-medium">Search History Match</span>
                            <span>{score.breakdown.searchHistory} / 30</span>
                          </div>
                          <div className="h-1 bg-muted-bg rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500" style={{ width: `${(score.breakdown.searchHistory / 30) * 100}%` }} />
                          </div>

                          <div className="flex justify-between">
                            <span className="text-muted-text font-medium">Location Proximity</span>
                            <span>{score.breakdown.locationMatch} / 25</span>
                          </div>
                          <div className="h-1 bg-muted-bg rounded-full overflow-hidden">
                            <div className="h-full bg-purple-500" style={{ width: `${(score.breakdown.locationMatch / 25) * 100}%` }} />
                          </div>

                          <div className="flex justify-between">
                            <span className="text-muted-text font-medium">Budget Suitability</span>
                            <span>{score.breakdown.budgetProximity} / 25</span>
                          </div>
                          <div className="h-1 bg-muted-bg rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500" style={{ width: `${(score.breakdown.budgetProximity / 25) * 100}%` }} />
                          </div>

                          <div className="flex justify-between">
                            <span className="text-muted-text font-medium">Deal Bargain Quality</span>
                            <span>{score.breakdown.dealValue} / 20</span>
                          </div>
                          <div className="h-1 bg-muted-bg rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500" style={{ width: `${(score.breakdown.dealValue / 20) * 100}%` }} />
                          </div>
                        </div>

                        <div className="pt-1.5 border-t border-border-base/50 text-[10px] text-muted-text leading-relaxed font-normal">
                          This score evaluates location overlaps, budget suitability (proximity to target), and discount rates against sector averages.
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        );
      })()}

    </div>
  );
}
