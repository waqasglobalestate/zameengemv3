"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAppState } from "@/context/AppStateContext";
import PropertyCard from "@/components/Property/PropertyCard";
import SectorMap from "@/components/Property/SectorMap";
import { 
  Grid, 
  List as ListIcon, 
  Map as MapIcon, 
  SlidersHorizontal, 
  Trash2, 
  MapPin,
  Building2,
  Ruler,
  DollarSign,
  Flame
} from "lucide-react";

// Wrap the main content in a component that accesses search params
const pakistanCities = [
  "Abbottabad", "Ahmadpur East", "Arifwala", "Attock", "Badin", "Bahawalnagar", "Bahawalpur", "Bannu", "Bhakkar", "Bhalwal", "Bhimber", "Burewala", "Chaman", "Chiniot", "Chishtian", "Dadu", "Daska", "Dera Ghazi Khan", "Dera Ismail Khan", "Faisalabad", "Ferozwala", "Ghotki", "Gilgit", "Gujranwala", "Gujrat", "Gwadar", "Hafizabad", "Haroonabad", "Hasilpur", "Hub", "Hyderabad", "Islamabad", "Jacobabad", "Jalalpur Jattan", "Jaranwala", "Jhang", "Jhelum", "Kamalia", "Kamber Ali Khan", "Kamoke", "Karachi", "Karak", "Kasur", "Khairpur", "Khanewal", "Khanpur", "Khushab", "Khuzdar", "Kohat", "Kot Abdul Malik", "Kot Addu", "Kotli", "Lahore", "Larkana", "Layyah", "Loralai", "Mardan", "Mianwali", "Mirpur", "Mirpur Khas", "Multan", "Muridke", "Muzaffargarh", "Muzaffarabad", "Nawabshah", "Nowshera", "Okara", "Pakpattan", "Peshawar", "Quetta", "Rahim Yar Khan", "Rawalpindi", "Sadiqabad", "Sahiwal", "Sambrial", "Samundri", "Sargodha", "Shahdadkot", "Shekhupura", "Shikarpur", "Sialkot", "Skardu", "Sukkur", "Swabi", "Tando Adam", "Tando Allahyar", "Taxila", "Turbat", "Umerkot", "Vehari", "Wah Cantt", "Wazirabad", "Zhob"
];

function SearchPropertiesContent() {
  const { properties } = useAppState();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Layout View Mode (Grid, List, Map)
  const [viewMode, setViewMode] = useState<"grid" | "list" | "map">("grid");

  // Filters State (initialized from URL if present, otherwise default)
  const [purpose, setPurpose] = useState<string>(searchParams.get("purpose") || "Buy");
  const [city, setCity] = useState<string>(searchParams.get("city") || "");
  const [location, setLocation] = useState<string>(searchParams.get("location") || searchParams.get("society") || "");
  const [type, setType] = useState<string>(searchParams.get("type") || "");
  const [size, setSize] = useState<string>(searchParams.get("size") || "");
  const [priceMax, setPriceMax] = useState<string>(searchParams.get("priceMax") || "");
  const [sector, setSector] = useState<string>(searchParams.get("sector") || "");
  const [corner, setCorner] = useState<boolean>(searchParams.get("corner") === "true");
  const [parkFacing, setParkFacing] = useState<boolean>(searchParams.get("parkFacing") === "true");
  const [mainBoulevard, setMainBoulevard] = useState<boolean>(searchParams.get("mainBoulevard") === "true");
  const [possession, setPossession] = useState<string>(searchParams.get("possessionStatus") || "");
  const [installment, setInstallment] = useState<boolean>(searchParams.get("installmentAvailable") === "true");
  const [globalQuery, setGlobalQuery] = useState<string>(searchParams.get("query") || "");
  const [hotOnly, setHotOnly] = useState<boolean>(searchParams.get("hotOnly") === "true");

  // Sync URL search params to local state variables on change
  useEffect(() => {
    setPurpose(searchParams.get("purpose") || "Buy");
    setCity(searchParams.get("city") || "");
    setLocation(searchParams.get("location") || searchParams.get("society") || "");
    setType(searchParams.get("type") || "");
    setSize(searchParams.get("size") || "");
    setPriceMax(searchParams.get("priceMax") || "");
    setSector(searchParams.get("sector") || "");
    setCorner(searchParams.get("corner") === "true");
    setParkFacing(searchParams.get("parkFacing") === "true");
    setMainBoulevard(searchParams.get("mainBoulevard") === "true");
    setPossession(searchParams.get("possessionStatus") || "");
    setInstallment(searchParams.get("installmentAvailable") === "true");
    setGlobalQuery(searchParams.get("query") || "");
    setHotOnly(searchParams.get("hotOnly") === "true");
  }, [searchParams]);

  // Sorting
  const [sortOption, setSortOption] = useState<string>("latest");

  // Multi-property comparison accumulator state
  const [comparingIds, setComparingIds] = useState<string[]>([]);

  // Update sector selection on map click
  const handleSectorSelect = (secName: string) => {
    setSector(secName);
    // If selecting a sector, also ensure location is set to DHA Bahawalpur (since the sector map is of DHA Bahawalpur)
    if (secName) {
      setLocation("DHA Bahawalpur");
    }
  };

  // Reset all filters
  const handleResetFilters = () => {
    setPurpose("Buy");
    setCity("");
    setLocation("");
    setGlobalQuery("");
    setType("");
    setSize("");
    setPriceMax("");
    setSector("");
    setCorner(false);
    setParkFacing(false);
    setMainBoulevard(false);
    setPossession("");
    setInstallment(false);
    setHotOnly(false);
    setSortOption("latest");
    router.replace("/properties");
  };

  // Toggle Property comparison selection
  const handleCompareToggle = (id: string) => {
    setComparingIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      }
      if (prev.length >= 4) {
        alert("You can compare a maximum of 4 properties at a time.");
        return prev;
      }
      return [...prev, id];
    });
  };

  // Filter listings
  const filteredProperties = properties.filter((p) => {
    if (p.isApproved === false) return false;
    
    // Global Query Search (Property ID, Title, Location, Sector, Description)
    if (globalQuery) {
      const q = globalQuery.toLowerCase();
      const matchesQuery = 
        p.id.toLowerCase().includes(q) ||
        p.title.toLowerCase().includes(q) ||
        (p.location && p.location.toLowerCase().includes(q)) ||
        (p.sector && p.sector.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q));
      
      if (!matchesQuery) return false;
    }

    if (purpose && p.purpose !== purpose) return false;
    
    // City filter
    if (city) {
      const propCity = p.locationDetails?.city || "";
      const matchesCity = propCity.toLowerCase() === city.toLowerCase() || p.location.toLowerCase().includes(city.toLowerCase());
      if (!matchesCity) return false;
    }

    if (location && p.location !== location) return false;
    if (type && p.type !== type) return false;
    if (size && p.size !== size) return false;
    if (priceMax && p.price > Number(priceMax)) return false;
    if (sector && (!p.sector || !p.sector.toLowerCase().includes(sector.toLowerCase()))) return false;
    if (corner && !p.isCorner) return false;
    if (parkFacing && !p.isParkFacing) return false;
    if (mainBoulevard && !p.isMainBoulevard) return false;
    if (possession && p.possessionStatus !== possession) return false;
    if (installment && !p.installmentAvailable) return false;
    if (hotOnly && !p.isHot) return false;
    return true;
  });

  // Sort listings: Premium first, then by user sort option
  const sortedProperties = [...filteredProperties].sort((a, b) => {
    const hotA = a.isHot ? 1 : 0;
    const hotB = b.isHot ? 1 : 0;
    if (hotA !== hotB) {
      return hotB - hotA;
    }

    const premiumA = a.isPremium ? 1 : 0;
    const premiumB = b.isPremium ? 1 : 0;
    if (premiumA !== premiumB) {
      return premiumB - premiumA;
    }
    
    if (sortOption === "priceLow") return a.price - b.price;
    if (sortOption === "priceHigh") return b.price - a.price;
    if (sortOption === "views") return b.viewsCount - a.viewsCount;
    // Default "latest": dynamic ID sorting simulation
    return b.id.localeCompare(a.id);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* 1. Page Header & Comparison bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4 border-b border-border-base pb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
              Explore Property Directory
            </h1>
            <p className="text-xs text-muted-text mt-1">
              Found {filteredProperties.length} active listings matching your query parameters.
            </p>
          </div>
          
          <Link
            href="/properties/map"
            className="flex items-center space-x-2 px-4 py-2.5 bg-royal text-white hover:bg-royal-hover dark:bg-white dark:text-royal dark:hover:bg-white/90 text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 w-fit"
          >
            <MapPin className="w-4 h-4" />
            <span>Interactive Map Search</span>
          </Link>
        </div>

        {/* Floating comparison status bar */}
        {comparingIds.length > 0 && (
          <div className="bg-gold/10 border border-gold rounded-xl p-3 flex items-center space-x-4 animate-in fade-in duration-300">
            <span className="text-xs font-bold text-gold">
              Comparing {comparingIds.length}/4 properties
            </span>
            <div className="flex space-x-2">
              <Link 
                href={`/compare?ids=${comparingIds.join(",")}`}
                className="text-xs font-bold px-3 py-1.5 bg-gold hover:bg-gold-hover text-white rounded-lg transition-colors"
              >
                Compare Now
              </Link>
              <button 
                onClick={() => setComparingIds([])}
                className="text-xs font-bold px-2 py-1.5 bg-muted-bg border border-border-base text-muted-text hover:text-foreground rounded-lg transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. Top Filter Inputs Bar */}
      <div className="p-4 rounded-xl border border-border-base bg-background/50 glass mb-8 space-y-4">
        
        {/* Core Quick Selectors */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          
          {/* Purpose */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-muted-text tracking-wider mb-1">Purpose</label>
            <select
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full text-xs font-bold rounded-lg border border-border-base px-2.5 py-2 bg-muted-bg text-foreground outline-none focus:ring-1 focus:ring-royal"
            >
              <option value="Buy">For Sale</option>
              <option value="Rent">For Rent</option>
              <option value="Project">Featured Projects</option>
            </select>
          </div>

          {/* City */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-muted-text tracking-wider mb-1">City</label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full text-xs font-bold rounded-lg border border-border-base px-2.5 py-2 bg-muted-bg text-foreground outline-none focus:ring-1 focus:ring-royal"
            >
              <option value="">All Cities</option>
              {pakistanCities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Location / Society */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-muted-text tracking-wider mb-1">Society / Project</label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full text-xs font-bold rounded-lg border border-border-base px-2.5 py-2 bg-muted-bg text-foreground outline-none focus:ring-1 focus:ring-royal"
            >
              <option value="">All Societies</option>
              <option value="DHA Bahawalpur">DHA Bahawalpur</option>
              <option value="DHA Multan">DHA Multan</option>
              <option value="DHA Lahore">DHA Lahore</option>
              <option value="DHA Islamabad">DHA Islamabad</option>
              <option value="Bahria Town Projects">Bahria Town Projects</option>
            </select>
          </div>

          {/* Type */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-muted-text tracking-wider mb-1">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full text-xs font-bold rounded-lg border border-border-base px-2.5 py-2 bg-muted-bg text-foreground outline-none focus:ring-1 focus:ring-royal"
            >
              <option value="">All Types</option>
              <option value="Residential Plot">Residential Plot</option>
              <option value="Commercial Plot">Commercial Plot</option>
              <option value="Villa">Villa</option>
              <option value="House">House</option>
            </select>
          </div>

          {/* Size */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-muted-text tracking-wider mb-1">Plot Size</label>
            <select
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className="w-full text-xs font-bold rounded-lg border border-border-base px-2.5 py-2 bg-muted-bg text-foreground outline-none focus:ring-1 focus:ring-royal"
            >
              <option value="">Any Size</option>
              <option value="5 Marla">5 Marla</option>
              <option value="10 Marla">10 Marla</option>
              <option value="1 Kanal">1 Kanal</option>
              <option value="2 Kanal">2 Kanal</option>
            </select>
          </div>

          {/* Max Budget */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-muted-text tracking-wider mb-1">Budget</label>
            <select
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
              className="w-full text-xs font-bold rounded-lg border border-border-base px-2.5 py-2 bg-muted-bg text-foreground outline-none focus:ring-1 focus:ring-royal"
            >
              <option value="">No Limit</option>
              <option value="5000000">Under 50 Lakhs</option>
              <option value="10000000">Under 1 Crore</option>
              <option value="20000000">Under 2 Crore</option>
              <option value="40000000">Under 4 Crore</option>
            </select>
          </div>

        </div>

        {/* Advanced Filter check row */}
        <div className="flex flex-wrap gap-4 items-center justify-between pt-3 border-t border-border-base/50">
          <div className="flex flex-wrap gap-4 items-center">
            
            {/* Sector input */}
            <input 
              type="text"
              placeholder="Filter by Sector (e.g. Sector A)"
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="text-xs font-bold rounded-lg border border-border-base px-3 py-1.5 bg-muted-bg text-foreground outline-none focus:ring-1 focus:ring-royal w-48"
            />

            {/* Checkboxes */}
            <label className="flex items-center space-x-1.5 text-xs font-bold text-muted-text hover:text-foreground cursor-pointer">
              <input type="checkbox" checked={corner} onChange={(e) => setCorner(e.target.checked)} className="rounded accent-gold text-white" />
              <span>Corner Plot</span>
            </label>
            <label className="flex items-center space-x-1.5 text-xs font-bold text-muted-text hover:text-foreground cursor-pointer">
              <input type="checkbox" checked={parkFacing} onChange={(e) => setParkFacing(e.target.checked)} className="rounded accent-gold text-white" />
              <span>Park Facing</span>
            </label>
            <label className="flex items-center space-x-1.5 text-xs font-bold text-muted-text hover:text-foreground cursor-pointer">
              <input type="checkbox" checked={mainBoulevard} onChange={(e) => setMainBoulevard(e.target.checked)} className="rounded accent-gold text-white" />
              <span>Main Boulevard</span>
            </label>
            <label className="flex items-center space-x-1.5 text-xs font-bold text-muted-text hover:text-foreground cursor-pointer">
              <input type="checkbox" checked={installment} onChange={(e) => setInstallment(e.target.checked)} className="rounded accent-gold text-white" />
              <span>Installments Available</span>
            </label>
            <label className="flex items-center space-x-1.5 text-xs font-bold text-rose-500 hover:text-rose-600 cursor-pointer">
              <input type="checkbox" checked={hotOnly} onChange={(e) => setHotOnly(e.target.checked)} className="rounded accent-rose-500 text-white" />
              <Flame className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
              <span>Hot Listings</span>
            </label>
          </div>

          {/* Reset Filters button */}
          <button
            onClick={handleResetFilters}
            className="flex items-center space-x-1 px-3 py-1.5 text-xs font-bold rounded-lg border border-border-base bg-background text-muted-text hover:text-red-600 hover:border-red-600/30 transition-all shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        </div>

      </div>

      {/* 3. View mode & Sort Toggle Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        {/* Sorting selection */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-muted-text">Sort By:</span>
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="text-xs font-bold rounded-lg border border-border-base px-2 py-1.5 bg-background text-foreground outline-none focus:ring-1 focus:ring-royal"
          >
            <option value="latest">Latest Listed</option>
            <option value="priceLow">Price: Low to High</option>
            <option value="priceHigh">Price: High to Low</option>
            <option value="views">Most Popular (Views)</option>
          </select>
        </div>

        {/* View Mode buttons */}
        <div className="flex items-center space-x-1 bg-muted-bg border border-border-base p-1 rounded-xl shrink-0">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-lg transition-all ${
              viewMode === "grid" 
                ? "bg-background text-gold shadow-sm font-bold" 
                : "text-muted-text hover:text-foreground"
            }`}
            title="Grid View"
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-lg transition-all ${
              viewMode === "list" 
                ? "bg-background text-gold shadow-sm font-bold" 
                : "text-muted-text hover:text-foreground"
            }`}
            title="List View"
          >
            <ListIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("map")}
            className={`p-2 rounded-lg transition-all ${
              viewMode === "map" 
                ? "bg-background text-gold shadow-sm font-bold" 
                : "text-muted-text hover:text-foreground"
            }`}
            title="Interactive Sector Map"
          >
            <MapIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4. Display Content Panel based on Layout Selection */}
      <div className="min-h-[400px]">
        {sortedProperties.length === 0 ? (
          <div className="text-center py-20 border border-border-base rounded-2xl bg-muted-bg/50">
            <SlidersHorizontal className="w-10 h-10 text-muted-text mx-auto mb-4" />
            <h3 className="text-lg font-bold text-foreground">No Properties Found</h3>
            <p className="text-xs text-muted-text mt-1 max-w-sm mx-auto">
              We couldn&apos;t find any listings matching those criteria. Try relaxing your budget filters or search in a different sector block.
            </p>
            <button
              onClick={handleResetFilters}
              className="mt-6 px-4 py-2 bg-royal text-white font-bold text-xs rounded-lg hover:bg-slate-800 transition-colors"
            >
              Clear Search Criteria
            </button>
          </div>
        ) : viewMode === "grid" ? (
          /* GRID LAYOUT */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
            {sortedProperties.map((prop) => (
              <PropertyCard 
                key={prop.id} 
                property={prop} 
                onCompareToggle={handleCompareToggle} 
                isComparing={comparingIds.includes(prop.id)} 
              />
            ))}
          </div>
        ) : viewMode === "list" ? (
          /* LIST LAYOUT */
          <div className="space-y-4 animate-in fade-in duration-300">
            {sortedProperties.map((prop) => {
              const formatPrice = (priceVal: number) => {
                if (priceVal >= 10000000) {
                  return `${(priceVal / 10000000).toFixed(2)} Crore`;
                }
                return `${(priceVal / 100000).toFixed(0)} Lakhs`;
              };
              const isSaved = false; // Mocked inside
              return (
                <div 
                  key={prop.id}
                  className="group flex flex-col md:flex-row border border-border-base bg-background/50 hover:bg-background rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 glass"
                >
                  {/* Left Aspect Ratio Photo */}
                  <div className="relative w-full md:w-72 h-48 shrink-0 bg-muted-bg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={prop.images[0]} alt={prop.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102" />
                    
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                      <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded text-white ${
                        prop.purpose === "Buy" ? "bg-royal" : prop.purpose === "Rent" ? "bg-amber-600" : "bg-emerald-600"
                      }`}>
                        {prop.purpose === "Project" ? "Featured Project" : prop.purpose}
                      </span>
                    </div>
                  </div>

                  {/* Right Description */}
                  <div className="flex-grow p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-baseline justify-between mb-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-text">{prop.type}</span>
                        <span className="text-[10px] font-bold bg-muted-bg text-foreground px-2 py-0.5 rounded border border-border-base">{prop.size}</span>
                      </div>
                      <h3 className="text-base font-bold text-foreground group-hover:text-gold transition-colors mb-2">
                        <Link href={`/properties/${prop.id}`}>{prop.title}</Link>
                      </h3>
                      <p className="text-xs text-muted-text line-clamp-2 leading-relaxed mb-4">{prop.description}</p>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-border-base pt-3 gap-3">
                      <div>
                        <p className="text-[9px] uppercase font-bold text-muted-text tracking-wider">Price</p>
                        <p className="text-base font-extrabold text-royal dark:text-white">PKR {formatPrice(prop.price)}</p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleCompareToggle(prop.id)}
                          className={`px-3 py-1.5 text-xs font-bold border rounded-lg transition-colors flex items-center space-x-1 ${
                            comparingIds.includes(prop.id) 
                              ? "bg-gold border-gold text-white" 
                              : "bg-background border-border-base text-muted-text hover:text-foreground"
                          }`}
                        >
                          <span>{comparingIds.includes(prop.id) ? "Comparing" : "Add Compare"}</span>
                        </button>
                        <Link 
                          href={`/properties/${prop.id}`} 
                          className="px-4 py-1.5 bg-royal dark:bg-white text-white dark:text-royal font-bold text-xs rounded-lg hover:bg-slate-800 transition-colors"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* MAP VIEW LAYOUT WITH SECTOR INTERACTIVE BLOCKS */
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Display Interactive SVG sector map */}
            <SectorMap onSectorSelect={handleSectorSelect} selectedSector={sector} />

            {/* List matching results beneath the map */}
            <div>
              <h4 className="font-extrabold text-base text-foreground mb-4">
                Listings in Selected Sector View ({filteredProperties.length} matches)
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedProperties.map((prop) => (
                  <PropertyCard 
                    key={prop.id} 
                    property={prop} 
                    onCompareToggle={handleCompareToggle} 
                    isComparing={comparingIds.includes(prop.id)} 
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

export default function PropertiesPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 font-bold text-muted-text">Loading properties directory...</div>}>
      <SearchPropertiesContent />
    </Suspense>
  );
}
