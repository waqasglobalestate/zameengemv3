"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAppState } from "@/context/AppStateContext";
import { Property } from "@/data/initialProperties";
import Link from "next/link";
import { 
  LayoutGrid, 
  X, 
  Check, 
  ArrowLeft, 
  ArrowRight, 
  Plus, 
  Coins, 
  Ruler, 
  MapPin, 
  Bed, 
  Bath, 
  Building, 
  TrendingUp, 
  Sliders
} from "lucide-react";

function CompareContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { properties } = useAppState();

  const [compareProps, setCompareProps] = useState<Property[]>([]);
  const [activeSlotSearch, setActiveSlotSearch] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Parse ids from query string on mount/change
  useEffect(() => {
    const idsString = searchParams.get("ids");
    const timer = setTimeout(() => {
      if (idsString) {
        const ids = idsString.split(",");
        const matched = properties.filter((p) => ids.includes(p.id));
        setCompareProps(matched.slice(0, 4)); // Force limit to 4 properties max
      } else {
        setCompareProps([]);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [searchParams, properties]);

  const handleRemoveCompare = (id: string) => {
    const remainingIds = compareProps.filter((p) => p.id !== id).map((p) => p.id);
    if (remainingIds.length > 0) {
      router.replace(`/compare?ids=${remainingIds.join(",")}`);
    } else {
      router.replace("/compare");
    }
  };

  const handleAddProperty = (id: string) => {
    const currentIds = compareProps.map((p) => p.id);
    if (currentIds.includes(id)) return;
    if (currentIds.length >= 4) return;
    const newIds = [...currentIds, id];
    router.replace(`/compare?ids=${newIds.join(",")}`);
    setActiveSlotSearch(null);
    setSearchQuery("");
  };

  const formatPrice = (priceVal: number) => {
    if (priceVal >= 10000000) {
      return `${(priceVal / 10000000).toFixed(2)} Crore`;
    }
    return `${(priceVal / 100000).toFixed(0)} Lakhs`;
  };

  const getSizeInSqFt = (sizeStr: string): number => {
    const val = parseFloat(sizeStr);
    if (isNaN(val)) return 0;
    const lower = sizeStr.toLowerCase();
    if (lower.includes("kanal")) {
      return val * 20 * 225; // 1 Kanal = 20 Marla = 4500 sqft
    }
    if (lower.includes("marla")) {
      return val * 225;
    }
    if (lower.includes("sq yard") || lower.includes("sq. yard") || lower.includes("sqyd")) {
      return val * 9;
    }
    return val; // Assume sqft if not specified
  };

  // 4 Slot array representation
  const slots = Array.from({ length: 4 }, (_, idx) => compareProps[idx] || null);

  // Math benchmarks for Highlights
  const prices = compareProps.map((p) => p.price);
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;

  const sizesSqFt = compareProps.map((p) => getSizeInSqFt(p.size));
  const maxSizeSqFt = sizesSqFt.length > 0 ? Math.max(...sizesSqFt) : 0;

  const maxBedrooms = compareProps.length > 0 ? Math.max(...compareProps.map((p) => p.bedrooms || 0)) : 0;
  const maxBathrooms = compareProps.length > 0 ? Math.max(...compareProps.map((p) => p.bathrooms || 0)) : 0;

  const maxROI = compareProps.length > 0 ? Math.max(...compareProps.map((p) => parseFloat(p.roiPotential) || 0)) : 0;
  const maxAmenitiesCount = compareProps.length > 0 ? Math.max(...compareProps.map((p) => p.amenities.length)) : 0;

  // Compile all unique amenities across compared items for comparison checklist
  const allAmenities = Array.from(
    new Set(compareProps.flatMap((p) => p.amenities))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      
      {/* 1. Header Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-base pb-6">
        <div className="space-y-1">
          <Link 
            href="/properties" 
            className="inline-flex items-center space-x-1 text-xs font-bold text-muted-text hover:text-foreground mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Property Directory</span>
          </Link>
          <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center space-x-2.5">
            <LayoutGrid className="w-8 h-8 text-gold" />
            <span>Property Comparison Tool</span>
          </h1>
          <p className="text-xs text-muted-text">
            Compare key parameters side-by-side to assess ROI, sizes, and pricing structures. Up to 4 properties supported.
          </p>
        </div>
      </div>

      {/* 2. Compare Table Panel */}
      <div className="space-y-6">
        {compareProps.length === 0 && (
          <div className="text-center py-10 px-6 border border-border-base rounded-2xl bg-muted-bg/30 flex flex-col items-center justify-center max-w-xl mx-auto shadow-sm">
            <LayoutGrid className="w-8 h-8 text-gold mb-3 animate-pulse" />
            <h3 className="text-sm font-bold text-foreground">Add Properties to Compare</h3>
            <p className="text-[10px] text-muted-text mt-1 text-center">
              You can search and select up to 4 properties side-by-side using the dropdowns in the slots below, or select properties directly from our properties directory.
            </p>
            <Link
              href="/properties"
              className="mt-4 inline-flex items-center space-x-1 px-4 py-2 bg-royal text-white font-bold text-xs rounded-xl hover:bg-royal/95 transition-colors shadow-sm"
            >
              <span>Browse Listings</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        <div className="overflow-x-auto border border-border-base rounded-2xl bg-background/50 glass shadow-sm">
          <table className="w-full border-collapse text-left table-fixed">
            <thead>
              <tr className="border-b border-border-base bg-muted-bg/50">
                {/* Info Column Header */}
                <th className="p-4 text-xs font-black text-muted-text uppercase tracking-wider w-56 min-w-[200px] sticky left-0 z-30 bg-muted-bg border-r border-border-base shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
                  Specs Comparison
                </th>
                
                {/* Selected properties headers */}
                {slots.map((p, idx) => {
                  if (p) {
                    return (
                      <th key={p.id} className="p-4 w-72 min-w-[280px] border-r border-border-base relative bg-background/40">
                        <button
                          onClick={() => handleRemoveCompare(p.id)}
                          className="absolute top-4 right-4 p-1.5 rounded-full bg-background hover:bg-red-500 hover:text-white border border-border-base text-muted-text transition-all shadow-sm z-10"
                          title="Remove from comparison"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                        
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={p.images[0]} 
                          alt={p.title} 
                          className="w-full h-32 object-cover rounded-xl mb-3 shadow-sm"
                        />
                        
                        <div className="space-y-1">
                          <span className="text-[9px] uppercase font-black text-gold tracking-wider px-2 py-0.5 bg-gold/15 rounded-full border border-gold/20 inline-block">{p.type}</span>
                          <h4 className="font-extrabold text-xs text-foreground line-clamp-1 mt-1">{p.title}</h4>
                          <p className="text-sm font-black text-royal dark:text-white mt-1">PKR {formatPrice(p.price)}</p>
                        </div>
                      </th>
                    );
                  } else {
                    return (
                      <th key={`empty-${idx}`} className="p-4 w-72 min-w-[280px] border-r border-border-base relative bg-muted-bg/15">
                        {activeSlotSearch === idx ? (
                          <div className="space-y-3 text-left">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] uppercase font-black text-muted-text tracking-wider">Select Property</span>
                              <button 
                                onClick={() => { setActiveSlotSearch(null); setSearchQuery(""); }}
                                className="text-muted-text hover:text-foreground p-0.5"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <input
                              type="text"
                              placeholder="Search title, location..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="w-full text-xs rounded-lg border border-border-base px-2.5 py-1.5 bg-background focus:ring-1 focus:ring-royal outline-none font-bold text-foreground shadow-sm"
                              autoFocus
                            />
                            <div className="max-h-48 overflow-y-auto space-y-1.5 border border-border-base/50 rounded-lg p-1.5 bg-background shadow-inner">
                              {(() => {
                                const matched = properties.filter((prop) => {
                                  if (prop.isApproved === false) return false;
                                  // Exclude already selected
                                  if (compareProps.some((cp) => cp.id === prop.id)) return false;
                                  if (!searchQuery) return true;
                                  return prop.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                         prop.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                         prop.sector.toLowerCase().includes(searchQuery.toLowerCase());
                                });

                                if (matched.length === 0) {
                                  return <div className="text-[10px] text-muted-text text-center py-4 font-bold">No matching properties</div>;
                                }

                                return matched.map((prop) => (
                                  <button
                                    key={prop.id}
                                    onClick={() => handleAddProperty(prop.id)}
                                    className="w-full flex items-center space-x-2.5 p-1.5 hover:bg-muted-bg rounded-lg text-left transition-all border border-transparent hover:border-border-base"
                                  >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img 
                                      src={prop.images[0]} 
                                      alt={prop.title} 
                                      className="w-8 h-8 object-cover rounded-md shadow-sm"
                                    />
                                    <div className="flex-grow min-w-0">
                                      <h5 className="text-[10px] font-black text-foreground truncate">{prop.title}</h5>
                                      <div className="flex justify-between text-[8px] text-muted-text font-bold">
                                        <span>{prop.size}</span>
                                        <span className="text-gold">PKR {formatPrice(prop.price)}</span>
                                      </div>
                                    </div>
                                  </button>
                                ));
                              })()}
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-44 border-2 border-dashed border-border-base hover:border-gold/30 rounded-2xl p-4 transition-all">
                            <div className="w-10 h-10 rounded-full bg-background border border-border-base flex items-center justify-center text-muted-text mb-2.5 shadow-sm">
                              <Plus className="w-5 h-5 text-muted-text" />
                            </div>
                            <button
                              onClick={() => { setActiveSlotSearch(idx); setSearchQuery(""); }}
                              className="px-3.5 py-1.5 bg-royal text-white dark:bg-white dark:text-royal rounded-xl font-bold text-[10px] uppercase tracking-wider hover:bg-royal/90 dark:hover:bg-white/90 shadow-sm transition-all"
                            >
                              Add Property
                            </button>
                          </div>
                        )}
                      </th>
                    );
                  }
                })}
              </tr>
            </thead>
            
            <tbody className="text-xs">
              
              {/* Row: Price */}
              <tr className="border-b border-border-base hover:bg-muted-bg/10">
                <td className="p-4 font-bold text-muted-text sticky left-0 z-20 bg-background dark:bg-slate-900 border-r border-border-base shadow-[2px_0_5px_rgba(0,0,0,0.05)] flex items-center space-x-2">
                  <Coins className="w-4 h-4 text-gold" />
                  <span>Price</span>
                </td>
                {slots.map((p, idx) => {
                  if (!p) return <td key={`price-${idx}`} className="p-4 border-r border-border-base text-muted-text text-center">-</td>;
                  const isBest = p.price === minPrice && compareProps.length > 1;
                  return (
                    <td key={p.id} className={`p-4 border-r border-border-base font-bold transition-all ${
                      isBest ? "bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 font-extrabold" : "text-foreground"
                    }`}>
                      <div className="flex items-center justify-between">
                        <span>PKR {formatPrice(p.price)}</span>
                        {isBest && (
                          <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-500 border border-emerald-500/30">Lowest</span>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>

              {/* Row: Area Size */}
              <tr className="border-b border-border-base hover:bg-muted-bg/10">
                <td className="p-4 font-bold text-muted-text sticky left-0 z-20 bg-background dark:bg-slate-900 border-r border-border-base shadow-[2px_0_5px_rgba(0,0,0,0.05)] flex items-center space-x-2">
                  <Ruler className="w-4 h-4 text-gold" />
                  <span>Area Size</span>
                </td>
                {slots.map((p, idx) => {
                  if (!p) return <td key={`size-${idx}`} className="p-4 border-r border-border-base text-muted-text text-center">-</td>;
                  const isBest = getSizeInSqFt(p.size) === maxSizeSqFt && compareProps.length > 1 && maxSizeSqFt > 0;
                  return (
                    <td key={p.id} className={`p-4 border-r border-border-base font-bold transition-all ${
                      isBest ? "bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 font-extrabold" : "text-foreground"
                    }`}>
                      <div className="flex items-center justify-between">
                        <span>{p.size}</span>
                        {isBest && (
                          <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-500 border border-emerald-500/30">Largest</span>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>

              {/* Row: Location */}
              <tr className="border-b border-border-base hover:bg-muted-bg/10">
                <td className="p-4 font-bold text-muted-text sticky left-0 z-20 bg-background dark:bg-slate-900 border-r border-border-base shadow-[2px_0_5px_rgba(0,0,0,0.05)] flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gold" />
                  <span>Location</span>
                </td>
                {slots.map((p, idx) => {
                  if (!p) return <td key={`loc-${idx}`} className="p-4 border-r border-border-base text-muted-text text-center">-</td>;
                  return (
                    <td key={p.id} className="p-4 border-r border-border-base font-semibold text-foreground">
                      <div>{p.location}</div>
                      {p.sector && <div className="text-[10px] text-muted-text mt-0.5">{p.sector}</div>}
                    </td>
                  );
                })}
              </tr>

              {/* Row: Bedrooms */}
              <tr className="border-b border-border-base hover:bg-muted-bg/10">
                <td className="p-4 font-bold text-muted-text sticky left-0 z-20 bg-background dark:bg-slate-900 border-r border-border-base shadow-[2px_0_5px_rgba(0,0,0,0.05)] flex items-center space-x-2">
                  <Bed className="w-4 h-4 text-gold" />
                  <span>Bedrooms</span>
                </td>
                {slots.map((p, idx) => {
                  if (!p) return <td key={`beds-${idx}`} className="p-4 border-r border-border-base text-muted-text text-center">-</td>;
                  const isBest = p.bedrooms === maxBedrooms && compareProps.length > 1 && maxBedrooms > 0;
                  return (
                    <td key={p.id} className={`p-4 border-r border-border-base font-bold transition-all ${
                      isBest ? "bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 font-extrabold" : "text-foreground"
                    }`}>
                      <div className="flex items-center justify-between">
                        <span>{p.bedrooms || "N/A"}</span>
                        {isBest && (
                          <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-500 border border-emerald-500/30">Most</span>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>

              {/* Row: Bathrooms */}
              <tr className="border-b border-border-base hover:bg-muted-bg/10">
                <td className="p-4 font-bold text-muted-text sticky left-0 z-20 bg-background dark:bg-slate-900 border-r border-border-base shadow-[2px_0_5px_rgba(0,0,0,0.05)] flex items-center space-x-2">
                  <Bath className="w-4 h-4 text-gold" />
                  <span>Bathrooms</span>
                </td>
                {slots.map((p, idx) => {
                  if (!p) return <td key={`baths-${idx}`} className="p-4 border-r border-border-base text-muted-text text-center">-</td>;
                  const isBest = p.bathrooms === maxBathrooms && compareProps.length > 1 && maxBathrooms > 0;
                  return (
                    <td key={p.id} className={`p-4 border-r border-border-base font-bold transition-all ${
                      isBest ? "bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 font-extrabold" : "text-foreground"
                    }`}>
                      <div className="flex items-center justify-between">
                        <span>{p.bathrooms || "N/A"}</span>
                        {isBest && (
                          <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-500 border border-emerald-500/30">Most</span>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>

              {/* Row: Possession Status */}
              <tr className="border-b border-border-base hover:bg-muted-bg/10">
                <td className="p-4 font-bold text-muted-text sticky left-0 z-20 bg-background dark:bg-slate-900 border-r border-border-base shadow-[2px_0_5px_rgba(0,0,0,0.05)] flex items-center space-x-2">
                  <Building className="w-4 h-4 text-gold" />
                  <span>Possession Status</span>
                </td>
                {slots.map((p, idx) => {
                  if (!p) return <td key={`poss-${idx}`} className="p-4 border-r border-border-base text-muted-text text-center">-</td>;
                  return (
                    <td key={p.id} className="p-4 border-r border-border-base">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        p.possessionStatus === "Possession" 
                          ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" 
                          : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                      }`}>
                        {p.possessionStatus}
                      </span>
                    </td>
                  );
                })}
              </tr>

              {/* Row: ROI Potential */}
              <tr className="border-b border-border-base hover:bg-muted-bg/10">
                <td className="p-4 font-bold text-muted-text sticky left-0 z-20 bg-background dark:bg-slate-900 border-r border-border-base shadow-[2px_0_5px_rgba(0,0,0,0.05)] flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-gold" />
                  <span>ROI Appreciation</span>
                </td>
                {slots.map((p, idx) => {
                  if (!p) return <td key={`roi-${idx}`} className="p-4 border-r border-border-base text-muted-text text-center">-</td>;
                  const isBest = parseFloat(p.roiPotential) === maxROI && compareProps.length > 1 && maxROI > 0;
                  return (
                    <td key={p.id} className={`p-4 border-r border-border-base font-bold transition-all ${
                      isBest ? "bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 font-extrabold" : "text-foreground"
                    }`}>
                      <div className="flex items-center justify-between">
                        <span>{p.roiPotential}</span>
                        {isBest && (
                          <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-500 border border-emerald-500/30">Highest</span>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>

              {/* Row: Amenities Count */}
              <tr className="border-b border-border-base hover:bg-muted-bg/10">
                <td className="p-4 font-bold text-muted-text sticky left-0 z-20 bg-background dark:bg-slate-900 border-r border-border-base shadow-[2px_0_5px_rgba(0,0,0,0.05)] flex items-center space-x-2">
                  <Sliders className="w-4 h-4 text-gold" />
                  <span>Amenities Count</span>
                </td>
                {slots.map((p, idx) => {
                  if (!p) return <td key={`am-cnt-${idx}`} className="p-4 border-r border-border-base text-muted-text text-center">-</td>;
                  const isBest = p.amenities.length === maxAmenitiesCount && compareProps.length > 1 && maxAmenitiesCount > 0;
                  return (
                    <td key={p.id} className={`p-4 border-r border-border-base font-bold transition-all ${
                      isBest ? "bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 font-extrabold" : "text-foreground"
                    }`}>
                      <div className="flex items-center justify-between">
                        <span>{p.amenities.length} amenities</span>
                        {isBest && (
                          <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-500 border border-emerald-500/30">Most</span>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>

              {/* Row: Amenities Checklist Header */}
              {allAmenities.length > 0 && (
                <tr className="bg-muted-bg/40 font-bold border-b border-border-base">
                  <td className="p-4 sticky left-0 z-20 bg-muted-bg/90 dark:bg-slate-800 border-r border-border-base shadow-[2px_0_5px_rgba(0,0,0,0.05)] uppercase tracking-wider text-[10px] text-muted-text">
                    Amenities Checklist
                  </td>
                  {slots.map((p, idx) => (
                    <td key={`amenities-header-${idx}`} className="p-4 border-r border-border-base bg-muted-bg/25"></td>
                  ))}
                </tr>
              )}

              {/* Rows for each unique amenity */}
              {allAmenities.map((amenity) => (
                <tr key={amenity} className="border-b border-border-base hover:bg-muted-bg/10">
                  <td className="p-4 text-muted-text sticky left-0 z-20 bg-background dark:bg-slate-900 border-r border-border-base shadow-[2px_0_5px_rgba(0,0,0,0.05)] font-medium">
                    {amenity}
                  </td>
                  {slots.map((p, idx) => {
                    if (!p) return <td key={`am-val-${amenity}-${idx}`} className="p-4 border-r border-border-base text-center text-muted-text">-</td>;
                    const hasAmenity = p.amenities.includes(amenity);
                    return (
                      <td key={`am-val-${amenity}-${p.id}`} className="p-4 border-r border-border-base transition-all">
                        {hasAmenity ? (
                          <Check className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <span className="text-slate-300 dark:text-slate-700">✕</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* Action row at bottom */}
              {compareProps.length > 0 && (
                <tr className="hover:bg-transparent">
                  <td className="p-4 sticky left-0 z-20 bg-background dark:bg-slate-900 border-r border-border-base shadow-[2px_0_5px_rgba(0,0,0,0.05)] font-bold text-muted-text">
                    Actions
                  </td>
                  {slots.map((p, idx) => {
                    if (!p) return <td key={`act-${idx}`} className="p-4 border-r border-border-base"></td>;
                    return (
                      <td key={`act-${p.id}`} className="p-4 border-r border-border-base bg-background/25">
                        <Link
                          href={`/properties/${p.id}`}
                          className="inline-flex w-full justify-center px-4 py-2.5 bg-royal dark:bg-white text-white dark:text-royal font-bold rounded-xl text-[10px] sm:text-xs hover:bg-royal/90 dark:hover:bg-white/90 shadow-sm transition-all text-center"
                        >
                          View Full Details
                        </Link>
                      </td>
                    );
                  })}
                </tr>
              )}

            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="text-center py-20 font-bold text-muted-text">Loading comparison matrix...</div>}>
      <CompareContent />
    </Suspense>
  );
}
