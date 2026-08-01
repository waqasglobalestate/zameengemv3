"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppState } from "@/context/AppStateContext";
import PropertyCard from "@/components/Property/PropertyCard";
import { 
  Search, 
  MapPin, 
  Building2, 
  Ruler, 
  DollarSign, 
  ShieldCheck, 
  Briefcase, 
  Award, 
  Star, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  ChevronDown, 
  ChevronUp,
  Home,
  Flame,
  Zap
} from "lucide-react";

const pakistanCities = [
  "Abbottabad", "Ahmadpur East", "Arifwala", "Attock", "Badin", "Bahawalnagar", "Bahawalpur", "Bannu", "Bhakkar", "Bhalwal", "Bhimber", "Burewala", "Chaman", "Chiniot", "Chishtian", "Dadu", "Daska", "Dera Ghazi Khan", "Dera Ismail Khan", "Faisalabad", "Ferozwala", "Ghotki", "Gilgit", "Gujranwala", "Gujrat", "Gwadar", "Hafizabad", "Haroonabad", "Hasilpur", "Hub", "Hyderabad", "Islamabad", "Jacobabad", "Jalalpur Jattan", "Jaranwala", "Jhang", "Jhelum", "Kamalia", "Kamber Ali Khan", "Kamoke", "Karachi", "Karak", "Kasur", "Khairpur", "Khanewal", "Khanpur", "Khushab", "Khuzdar", "Kohat", "Kot Abdul Malik", "Kot Addu", "Kotli", "Lahore", "Larkana", "Layyah", "Loralai", "Mardan", "Mianwali", "Mirpur", "Mirpur Khas", "Multan", "Muridke", "Muzaffargarh", "Muzaffarabad", "Nawabshah", "Nowshera", "Okara", "Pakpattan", "Peshawar", "Quetta", "Rahim Yar Khan", "Rawalpindi", "Sadiqabad", "Sahiwal", "Sambrial", "Samundri", "Sargodha", "Shahdadkot", "Shekhupura", "Shikarpur", "Sialkot", "Skardu", "Sukkur", "Swabi", "Tando Adam", "Tando Allahyar", "Taxila", "Turbat", "Umerkot", "Vehari", "Wah Cantt", "Wazirabad", "Zhob"
];

export default function HomePage() {
  const { properties } = useAppState();
  const router = useRouter();

  // Hero Slider images
  const heroImages = [
    "/images/hero_banner_1.png",
    "/images/hero_banner_2.jpg",
    "/images/hero_banner_3.jpg",
    "/images/hero_banner_4.png"
  ];

  const [activeSlide, setActiveSlide] = useState(0);

  // Auto transition hero slides
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroImages.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroImages.length]);

  // Search filter states
  const [purpose, setPurpose] = useState<"Buy" | "Rent" | "Project">("Buy");
  const [city, setCity] = useState("");
  const [society, setSociety] = useState("");
  const [type, setType] = useState("");
  const [size, setSize] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Advanced filter states
  const [sector, setSector] = useState("");
  const [corner, setCorner] = useState(false);
  const [parkFacing, setParkFacing] = useState(false);
  const [mainBoulevard, setMainBoulevard] = useState(false);
  const [possession, setPossession] = useState("");
  const [installment, setInstallment] = useState(false);

  // Testimonials Carousel states
  const testimonials = [
    {
      id: 1,
      name: "Tariq Mahmood",
      role: "Overseas Investor (UK)",
      rating: 5,
      comment: "Zameen Gem and CEO Waqas Ahmad provided stellar consultancy for our DHA Bahawalpur plot purchasing. Transparent, smooth, and highly professional transactions throughout. Highly recommended!",
      videoThumb: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80"
    },
    {
      id: 2,
      name: "Sajjad Ahmad",
      role: "Business Owner, Lahore",
      rating: 5,
      comment: "I purchased commercial plots in DHA Sector C through Waqas. His market insights are spot on. The appreciation we've gained in less than a year has surpassed our expectations.",
      videoThumb: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=400&q=80"
    }
  ];
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [playingVideoId, setPlayingVideoId] = useState<number | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Construct query parameters
    const params = new URLSearchParams();
    params.set("purpose", purpose);
    if (city) params.set("city", city);
    if (society) {
      params.set("society", society);
      params.set("location", society);
    }
    if (type) params.set("type", type);
    if (size) params.set("size", size);
    if (priceMax) params.set("priceMax", priceMax);
    if (sector) params.set("sector", sector);
    if (corner) params.set("corner", "true");
    if (parkFacing) params.set("parkFacing", "true");
    if (mainBoulevard) params.set("mainBoulevard", "true");
    if (possession) params.set("possessionStatus", possession);
    if (installment) params.set("installmentAvailable", "true");

    router.push(`/properties?${params.toString()}`);
  };

  // 0. Super Hot Listings: top priority spotlight for Pro/Premium members (max 1 per Premium account holder)
  const superHotListings = properties
    .filter((p) => p.isSuperHot && p.isApproved !== false)
    .sort((a, b) => {
      const timeA = parseInt(a.id.replace(/\D/g, "")) || 0;
      const timeB = parseInt(b.id.replace(/\D/g, "")) || 0;
      return timeB - timeA;
    });

  // Showcase fallback: If no custom listing has isSuperHot set yet, display top featured/hot listings so section is always filled
  const displaySuperHotListings = superHotListings.length > 0 
    ? superHotListings 
    : properties.filter((p) => (p.isHot || p.isPremium) && p.isApproved !== false).slice(0, 4);

  // 1. Hot Listings: exclusive listings for Pro members marked as isHot
  const hotListings = properties
    .filter((p) => p.isHot && p.isApproved !== false)
    .sort((a, b) => {
      const timeA = parseInt(a.id.replace(/\D/g, "")) || 0;
      const timeB = parseInt(b.id.replace(/\D/g, "")) || 0;
      return timeB - timeA;
    })
    .slice(0, 4);

  // 2. Featured Properties listing sorted by premium first, then latest
  const featuredProperties = properties
    .filter((p) => p.purpose === purpose && p.isApproved !== false)
    .sort((a, b) => {
      const premiumA = a.isPremium ? 1 : 0;
      const premiumB = b.isPremium ? 1 : 0;
      if (premiumA !== premiumB) {
        return premiumB - premiumA;
      }
      return b.id.localeCompare(a.id);
    })
    .slice(0, 8);

  // 3. Fresh Listings (Latest Uploads): active properties sorted by ID timestamp (newest first)
  const latestUploads = [...properties]
    .filter((p) => p.isApproved !== false)
    .sort((a, b) => {
      const timeA = parseInt(a.id.replace(/\D/g, "")) || 0;
      const timeB = parseInt(b.id.replace(/\D/g, "")) || 0;
      return timeB - timeA;
    })
    .slice(0, 4);

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* 1. HERO & SEARCH SECTION */}
      <section className="relative min-h-[85vh] w-full overflow-hidden bg-slate-950 flex flex-col justify-between">
        {/* Hero Background Slider Images */}
        <div className="absolute inset-0 w-full h-full">
          {heroImages.map((img, index) => (
            <div
              key={index}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                index === activeSlide ? "opacity-100" : "opacity-0"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img}
                alt="Luxury Real Estate Showcase"
                loading={index === 0 ? "eager" : "lazy"}
                decoding="async"
                className="w-full h-full object-cover scale-105 transition-transform duration-[6000ms] ease-out"
                style={{ transform: index === activeSlide ? "scale(1)" : "scale(1.05)" }}
              />
            </div>
          ))}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-transparent to-slate-950/80 z-10" />
        </div>

        {/* TOP: SEARCH WIDGET (Ultra-transparent crystal glass & compact layout) */}
        <div className="relative z-30 max-w-5xl mx-auto w-full px-3 pt-2 sm:pt-3 md:pt-4">
          <div className="bg-[#0f172a]/20 dark:bg-black/25 border border-white/20 hover:border-gold/40 rounded-2xl shadow-2xl p-2.5 sm:p-3 backdrop-blur-md transition-all duration-300">
            <form onSubmit={handleSearch} className="space-y-2">
              
              {/* Purpose Switch Tabs */}
              <div className="flex space-x-1 border-b border-white/15 pb-1.5">
                {(["Buy", "Rent", "Project"] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setPurpose(tab)}
                    className={`px-2.5 py-0.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                      purpose === tab
                        ? "bg-gold text-slate-950 shadow font-extrabold"
                        : "text-slate-200 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {tab === "Project" ? "Featured Projects" : tab === "Buy" ? "For Sale" : "For Rent"}
                  </button>
                ))}
              </div>

              {/* Core Search Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                
                {/* City Selection */}
                <div>
                  <label className="block text-[9px] font-extrabold uppercase text-gold tracking-wider mb-0.5 flex items-center space-x-1">
                    <MapPin className="w-2.5 h-2.5 text-gold" />
                    <span>City</span>
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full text-xs font-semibold rounded-md border border-white/20 px-2 py-1 bg-slate-950/40 text-white outline-none focus:border-gold focus:bg-slate-950/70 transition-all"
                  >
                    <option value="" className="bg-slate-900 text-white">All Cities</option>
                    {pakistanCities.map((c) => (
                      <option key={c} value={c} className="bg-slate-900 text-white">{c}</option>
                    ))}
                  </select>
                </div>

                {/* Society / Project */}
                <div>
                  <label className="block text-[9px] font-extrabold uppercase text-gold tracking-wider mb-0.5 flex items-center space-x-1">
                    <Home className="w-2.5 h-2.5 text-gold" />
                    <span>Society / Project</span>
                  </label>
                  <select
                    value={society}
                    onChange={(e) => setSociety(e.target.value)}
                    className="w-full text-xs font-semibold rounded-md border border-white/20 px-2 py-1 bg-slate-950/40 text-white outline-none focus:border-gold focus:bg-slate-950/70 transition-all"
                  >
                    <option value="" className="bg-slate-900 text-white">All Societies</option>
                    <option value="DHA Bahawalpur" className="bg-slate-900 text-white">DHA Bahawalpur</option>
                    <option value="DHA Multan" className="bg-slate-900 text-white">DHA Multan</option>
                    <option value="DHA Lahore" className="bg-slate-900 text-white">DHA Lahore</option>
                    <option value="DHA Islamabad" className="bg-slate-900 text-white">DHA Islamabad</option>
                    <option value="Bahria Town Projects" className="bg-slate-900 text-white">Bahria Town Projects</option>
                  </select>
                </div>

                {/* Property Type */}
                <div>
                  <label className="block text-[9px] font-extrabold uppercase text-gold tracking-wider mb-0.5 flex items-center space-x-1">
                    <Building2 className="w-2.5 h-2.5 text-gold" />
                    <span>Property Type</span>
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full text-xs font-semibold rounded-md border border-white/20 px-2 py-1 bg-slate-950/40 text-white outline-none focus:border-gold focus:bg-slate-950/70 transition-all"
                  >
                    <option value="" className="bg-slate-900 text-white">All Types</option>
                    <option value="Residential Plot" className="bg-slate-900 text-white">Residential Plot</option>
                    <option value="Commercial Plot" className="bg-slate-900 text-white">Commercial Plot</option>
                    <option value="Villa" className="bg-slate-900 text-white">Villa</option>
                    <option value="House" className="bg-slate-900 text-white">House</option>
                  </select>
                </div>

                {/* Plot Size */}
                <div>
                  <label className="block text-[9px] font-extrabold uppercase text-gold tracking-wider mb-0.5 flex items-center space-x-1">
                    <Ruler className="w-2.5 h-2.5 text-gold" />
                    <span>Plot Size</span>
                  </label>
                  <select
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    className="w-full text-xs font-semibold rounded-md border border-white/20 px-2 py-1 bg-slate-950/40 text-white outline-none focus:border-gold focus:bg-slate-950/70 transition-all"
                  >
                    <option value="" className="bg-slate-900 text-white">Any Size</option>
                    <option value="5 Marla" className="bg-slate-900 text-white">5 Marla</option>
                    <option value="10 Marla" className="bg-slate-900 text-white">10 Marla</option>
                    <option value="1 Kanal" className="bg-slate-900 text-white">1 Kanal</option>
                    <option value="2 Kanal" className="bg-slate-900 text-white">2 Kanal</option>
                  </select>
                </div>

                {/* Price Cap */}
                <div>
                  <label className="block text-[9px] font-extrabold uppercase text-gold tracking-wider mb-0.5 flex items-center space-x-1">
                    <DollarSign className="w-2.5 h-2.5 text-gold" />
                    <span>Max Budget (PKR)</span>
                  </label>
                  <select
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                    className="w-full text-xs font-semibold rounded-md border border-white/20 px-2 py-1 bg-slate-950/40 text-white outline-none focus:border-gold focus:bg-slate-950/70 transition-all"
                  >
                    <option value="" className="bg-slate-900 text-white">No Limit</option>
                    <option value="5000000" className="bg-slate-900 text-white">Under 50 Lakhs</option>
                    <option value="10000000" className="bg-slate-900 text-white">Under 1 Crore</option>
                    <option value="20000000" className="bg-slate-900 text-white">Under 2 Crore</option>
                    <option value="40000000" className="bg-slate-900 text-white">Under 4 Crore</option>
                  </select>
                </div>

              </div>

              {/* Advanced Filters Expandable section */}
              {showAdvanced && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 border-t border-white/15 animate-in fade-in duration-300">
                  {/* Sector */}
                  <div>
                    <label className="block text-[9px] font-extrabold uppercase text-gold mb-0.5">Sector Block</label>
                    <input
                      type="text"
                      placeholder="e.g. Sector A"
                      value={sector}
                      onChange={(e) => setSector(e.target.value)}
                      className="w-full text-xs font-semibold rounded-md border border-white/20 px-2 py-1 bg-slate-950/40 text-white placeholder-slate-400 outline-none focus:border-gold"
                    />
                  </div>

                  {/* Possession */}
                  <div>
                    <label className="block text-[9px] font-extrabold uppercase text-gold mb-0.5">Possession Status</label>
                    <select
                      value={possession}
                      onChange={(e) => setPossession(e.target.value)}
                      className="w-full text-xs font-semibold rounded-md border border-white/20 px-2 py-1 bg-slate-950/40 text-white outline-none focus:border-gold"
                    >
                      <option value="" className="bg-slate-900 text-white">Any Status</option>
                      <option value="Possession" className="bg-slate-900 text-white">Possession Ready</option>
                      <option value="Non-Possession" className="bg-slate-900 text-white">Non-Possession</option>
                    </select>
                  </div>

                  {/* Corner, Park, Main Boulevard check row */}
                  <div className="col-span-2 flex flex-wrap gap-2.5 items-center pt-3 text-slate-200">
                    <label className="flex items-center space-x-1 text-xs font-semibold cursor-pointer hover:text-white">
                      <input 
                        type="checkbox" 
                        checked={corner} 
                        onChange={(e) => setCorner(e.target.checked)}
                        className="rounded accent-gold text-white" 
                      />
                      <span>Corner Plot</span>
                    </label>
                    <label className="flex items-center space-x-1 text-xs font-semibold cursor-pointer hover:text-white">
                      <input 
                        type="checkbox" 
                        checked={parkFacing} 
                        onChange={(e) => setParkFacing(e.target.checked)}
                        className="rounded accent-gold text-white" 
                      />
                      <span>Park Facing</span>
                    </label>
                    <label className="flex items-center space-x-1 text-xs font-semibold cursor-pointer hover:text-white">
                      <input 
                        type="checkbox" 
                        checked={mainBoulevard} 
                        onChange={(e) => setMainBoulevard(e.target.checked)}
                        className="rounded accent-gold text-white" 
                      />
                      <span>Main Boulevard</span>
                    </label>
                    <label className="flex items-center space-x-1 text-xs font-semibold cursor-pointer hover:text-white">
                      <input 
                        type="checkbox" 
                        checked={installment} 
                        onChange={(e) => setInstallment(e.target.checked)}
                        className="rounded accent-gold text-white" 
                      />
                      <span>Installment Plan</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Actions Bar */}
              <div className="flex items-center justify-between pt-1 border-t border-white/15">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-xs font-semibold text-slate-300 hover:text-gold flex items-center space-x-1 cursor-pointer transition-colors"
                >
                  {showAdvanced ? (
                    <><span>Simple Search</span><ChevronUp className="w-3.5 h-3.5" /></>
                  ) : (
                    <><span>Advanced Filters</span><ChevronDown className="w-3.5 h-3.5" /></>
                  )}
                </button>

                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#c5a85c] hover:bg-[#b09248] text-slate-950 font-extrabold text-xs rounded-lg transition-all flex items-center space-x-1.5 shadow cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Search Properties</span>
                </button>
              </div>

            </form>
          </div>
        </div>

        {/* HERO CONTENT TEXT (Positioned on lower side of hero section) */}
        <div className="relative z-25 max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-8 mt-auto pt-6 pb-6 sm:pb-8 md:pb-12">
          <div className="w-full text-left space-y-2.5 animate-in fade-in slide-in-from-left-5 duration-700">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 text-[10px] sm:text-xs font-bold bg-[#c5a85c]/25 border border-[#c5a85c]/50 rounded-full text-[#c5a85c] tracking-widest uppercase">
              Zameen Gem
            </span>
            
            <h1 className="text-[14px] xs:text-[17px] sm:text-[22px] md:text-[28px] lg:text-[36px] xl:text-[44px] font-black text-white tracking-tight leading-none whitespace-nowrap flex items-center flex-nowrap gap-x-1.5 sm:gap-x-2.5 max-w-full overflow-hidden">
              <span className="shrink-0">Your Trusted Partner in</span>
              <span className="text-[#c5a85c] gold-gradient-text font-black shrink-0">Real Estate Investment</span>
            </h1>
            
            <p className="text-[10px] xs:text-[11px] sm:text-xs md:text-sm lg:text-base text-slate-100 font-medium leading-none drop-shadow-md whitespace-nowrap max-w-full overflow-hidden">
              Buy, Sell & Invest in DHA Bahawalpur and Pakistan&apos;s Leading Housing Projects. Let chief consultant Waqas Ahmad Chaudhary guide your wealth.
            </p>
          </div>
        </div>

        {/* Slide Controls */}
        <button
          onClick={() => setActiveSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-black/70 text-white transition-all z-30 cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => setActiveSlide((prev) => (prev + 1) % heroImages.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-black/70 text-white transition-all z-30 cursor-pointer"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </section>

      {/* 2. SUPER HOT LISTINGS SECTION (Top Priority - Exclusive 1 Listing per Premium Account Holder) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-b border-border-base/50">
        <div className="bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-amber-500/15 border-2 border-amber-500/40 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-md relative overflow-hidden">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 relative z-10">
            <div className="space-y-1.5">
              <span className="inline-flex items-center space-x-1.5 text-[10px] font-black text-amber-950 dark:text-amber-300 uppercase tracking-widest bg-gradient-to-r from-amber-400 to-rose-500 px-3 py-1 rounded-full shadow-lg border border-amber-300">
                <Zap className="w-3.5 h-3.5 fill-white text-white animate-bounce" />
                <span>⚡ Super Hot Spotlight</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-2 mt-2">
                Super Hot Listings
              </h2>
              <p className="text-xs sm:text-sm text-muted-text max-w-2xl">
                Top Priority Spotlight deals exclusive to Premium members. Premium account holders can list a maximum of <strong>1 Super Hot Listing</strong> out of 100 total listings.
              </p>
            </div>
            
            <Link
              href="/properties?superHot=true"
              className="inline-flex items-center space-x-2 text-xs sm:text-sm font-black text-slate-950 dark:text-amber-300 bg-gold hover:bg-gold-hover px-4 py-2 rounded-xl transition-all shadow-md shrink-0 cursor-pointer"
            >
              <span>View Super Hot Spotlight</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative z-10">
            {displaySuperHotListings.map((prop) => (
              <PropertyCard key={prop.id} property={{ ...prop, isSuperHot: true }} />
            ))}
          </div>

        </div>
      </section>

      {/* 3. HOT LISTINGS (Exclusive to Pro Members) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-b border-border-base/50">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div className="space-y-2">
            <span className="inline-flex items-center space-x-1.5 text-[10px] font-extrabold text-rose-500 uppercase tracking-widest bg-rose-500/10 px-2.5 py-1 rounded-md border border-rose-500/20">
              <Flame className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-pulse" />
              <span>Pro Exclusive</span>
            </span>
            <h2 className="text-3xl font-black tracking-tight text-foreground mt-3 flex items-center gap-2">
              Hot Listings
            </h2>
            <p className="text-xs sm:text-sm text-muted-text">
              Exclusive high-demand property deals posted by Pro members &amp; verified top agencies.
            </p>
          </div>
          <Link
            href="/properties?hotOnly=true"
            className="group inline-flex items-center space-x-1 text-sm font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 transition-colors mt-4 sm:mt-0 shrink-0"
          >
            <span>Explore All Hot Deals</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {hotListings.length === 0 ? (
          <div className="p-10 border border-dashed border-rose-500/30 rounded-2xl text-center bg-rose-500/5 text-muted-text">
            <Flame className="w-8 h-8 text-rose-500/50 mx-auto mb-2" />
            <p className="text-sm font-semibold text-foreground">No hot listings active at the moment.</p>
            <p className="text-xs text-muted-text mt-1">Upgrade to a Pro Member account to list high-visibility Hot Properties here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {hotListings.map((prop) => (
              <PropertyCard key={prop.id} property={prop} />
            ))}
          </div>
        )}
      </section>

      {/* 3. FEATURED PROPERTIES (2nd Priority) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-b border-border-base/50">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gold bg-gold/10 px-3 py-1 rounded-full border border-gold/20">
              Verified Listings
            </span>
            <h2 className="text-3xl font-black tracking-tight text-foreground mt-3">
              Featured Properties
            </h2>
            <p className="text-xs sm:text-sm text-muted-text">
              Top handpicked real estate investment opportunities currently on the market.
            </p>
          </div>
          <Link
            href="/properties"
            className="group inline-flex items-center space-x-1 text-sm font-bold text-royal dark:text-white hover:text-gold dark:hover:text-gold transition-colors mt-4 sm:mt-0 shrink-0"
          >
            <span>See All Listings</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {featuredProperties.length === 0 ? (
          <div className="p-10 border border-border-base rounded-2xl text-center text-muted-text bg-background/30">
            No featured properties found matching your selection.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProperties.map((prop) => (
              <PropertyCard key={prop.id} property={prop} />
            ))}
          </div>
        )}
      </section>

      {/* 4. FRESH LISTINGS / LATEST UPLOADS (3rd Priority) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
              Fresh Listings
            </span>
            <h2 className="text-3xl font-black tracking-tight text-foreground mt-3">
              Latest Uploads
            </h2>
            <p className="text-xs sm:text-sm text-muted-text">
              Explore the most recently listed properties on Zameen Gem, verified by our agents.
            </p>
          </div>
          <Link
            href="/properties?sort=newest"
            className="group inline-flex items-center space-x-1 text-sm font-bold text-royal dark:text-white hover:text-gold dark:hover:text-gold transition-colors mt-4 sm:mt-0 shrink-0"
          >
            <span>View All New Listings</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {latestUploads.length === 0 ? (
          <div className="p-10 border border-border-base rounded-2xl text-center text-muted-text bg-background/30">
            No properties uploaded recently.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {latestUploads.map((prop) => (
              <PropertyCard key={prop.id} property={prop} />
            ))}
          </div>
        )}
      </section>

      {/* 4. DHA BAHAWALPUR INVESTMENT FOCUS SECTION */}
      <section className="bg-muted-bg border-y border-border-base py-20 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left: Text & Stats */}
            <div className="lg:col-span-5 space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-royal dark:text-white bg-royal/10 dark:bg-white/10 px-3 py-1 rounded-full">
                Centerpiece Development
              </span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
                Invest in <br />
                <span className="text-gold gold-gradient-text">DHA Bahawalpur</span>
              </h2>
              <p className="text-sm text-muted-text leading-relaxed">
                As the leading residential and commercial hub in Southern Punjab, DHA Bahawalpur offers unparalleled modern living with massive investment growth potential. Featuring state-of-the-art road maps, secured gates, and underground utilities.
              </p>

              <div className="grid grid-cols-3 gap-4 border-t border-border-base pt-6">
                <div>
                  <h4 className="text-2xl sm:text-3xl font-black text-royal dark:text-white">12.5%</h4>
                  <p className="text-[10px] font-bold text-muted-text uppercase tracking-wider mt-1">Average ROI</p>
                </div>
                <div>
                  <h4 className="text-2xl sm:text-3xl font-black text-royal dark:text-white">100%</h4>
                  <p className="text-[10px] font-bold text-muted-text uppercase tracking-wider mt-1">Underground Gas</p>
                </div>
                <div>
                  <h4 className="text-2xl sm:text-3xl font-black text-royal dark:text-white">24/7</h4>
                  <p className="text-[10px] font-bold text-muted-text uppercase tracking-wider mt-1">Gated Security</p>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/properties?location=DHA+Bahawalpur"
                  className="inline-flex items-center space-x-2 px-5 py-3 bg-royal hover:bg-royal-hover dark:bg-white dark:hover:bg-slate-200 text-white dark:text-royal font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md"
                >
                  <span>Explore DHA Bahawalpur</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right: Grid of Premium Features */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Card 1 */}
              <div className="p-5 bg-background border border-border-base rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <h4 className="font-bold text-sm text-foreground mb-1">Modern Infrastructure</h4>
                <p className="text-xs text-muted-text leading-relaxed">
                  Wide carpeted boulevards (up to 120ft), central avenue corridors, and extensive street grid layouts.
                </p>
              </div>

              {/* Card 2 */}
              <div className="p-5 bg-background border border-border-base rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <h4 className="font-bold text-sm text-foreground mb-1">Underground Utilities</h4>
                <p className="text-xs text-muted-text leading-relaxed">
                  Completely integrated underground lines for electrical grids, clean water systems, and sui gas.
                </p>
              </div>

              {/* Card 3 */}
              <div className="p-5 bg-background border border-border-base rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <h4 className="font-bold text-sm text-foreground mb-1">Parks & Schools</h4>
                <p className="text-xs text-muted-text leading-relaxed">
                  Fully operational DHA school divisions, sector gardens, sports facilities, and golf clubs.
                </p>
              </div>

              {/* Card 4 */}
              <div className="p-5 bg-background border border-border-base rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <h4 className="font-bold text-sm text-foreground mb-1">Maximum Safety</h4>
                <p className="text-xs text-muted-text leading-relaxed">
                  Double gate entries, continuous security patrol cruisers, and state-of-the-art camera networks.
                </p>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 5. WHY CHOOSE US */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-gold bg-gold/10 px-3 py-1 rounded-full">
            Our Edge
          </span>
          <h2 className="text-3xl font-black tracking-tight text-foreground mt-3">
            Why Choose Zameen Gem
          </h2>
          <p className="text-xs sm:text-sm text-muted-text mt-2">
            Leading with transparency, market analysis, and high integrity property deals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1 */}
          <div className="p-6 bg-background/50 border border-border-base rounded-2xl text-center space-y-3 glass">
            <div className="mx-auto w-12 h-12 rounded-xl bg-gold/10 text-gold flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-foreground">Trusted Property Consultants</h3>
            <p className="text-xs text-muted-text leading-relaxed">
              Serving with 15+ years of verified consulting expertise under leadership of Waqas Ahmad Chaudhary.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 bg-background/50 border border-border-base rounded-2xl text-center space-y-3 glass">
            <div className="mx-auto w-12 h-12 rounded-xl bg-gold/10 text-gold flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-foreground">Secure Transactions</h3>
            <p className="text-xs text-muted-text leading-relaxed">
              We vet and certify all land documents to secure investments with 100% legal coverage.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 bg-background/50 border border-border-base rounded-2xl text-center space-y-3 glass">
            <div className="mx-auto w-12 h-12 rounded-xl bg-gold/10 text-gold flex items-center justify-center">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-foreground">Verified Listings Only</h3>
            <p className="text-xs text-muted-text leading-relaxed">
              Every house, plot, and villa on our site is verified with physical boundaries and possession states.
            </p>
          </div>

        </div>
      </section>

      {/* 6. TESTIMONIALS SECTION */}
      <section className="bg-slate-900 text-slate-100 py-20 border-t border-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Comments */}
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-[#d4af37] bg-[#d4af37]/20 px-3 py-1 rounded-full">
                Investor feedback
              </span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                What Our Clients Say
              </h2>

              {/* Slider comment */}
              <div className="space-y-4 pt-4 min-h-[160px]">
                <div className="flex space-x-1">
                  {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-[#d4af37] fill-[#d4af37]" />
                  ))}
                </div>
                <p className="text-sm sm:text-base italic text-slate-300 leading-relaxed">
                  &ldquo;{testimonials[activeTestimonial].comment}&rdquo;
                </p>
                <div>
                  <h4 className="font-bold text-sm text-white">{testimonials[activeTestimonial].name}</h4>
                  <p className="text-xs text-slate-500">{testimonials[activeTestimonial].role}</p>
                </div>
              </div>

              {/* Navigation Indicators */}
              <div className="flex items-center space-x-3 pt-6 border-t border-slate-800">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setActiveTestimonial(index);
                      setPlayingVideoId(null);
                    }}
                    className={`h-2.5 rounded-full transition-all ${
                      index === activeTestimonial ? "w-8 bg-[#d4af37]" : "w-2.5 bg-slate-700"
                    }`}
                  ></button>
                ))}
              </div>
            </div>

            {/* Right Column: Video Testimonial Card */}
            <div className="lg:col-span-6 flex justify-center">
              <div className="relative aspect-video w-full max-w-md bg-slate-950 rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
                {playingVideoId === testimonials[activeTestimonial].id ? (
                  <iframe
                    className="w-full h-full"
                    src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                    title="Testimonial Video Tour"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <div className="relative w-full h-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={testimonials[activeTestimonial].videoThumb} 
                      alt="Video thumbnail"
                      className="w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button
                        onClick={() => setPlayingVideoId(testimonials[activeTestimonial].id)}
                        className="p-4 bg-[#d4af37] text-slate-950 rounded-full hover:scale-110 active:scale-95 transition-all shadow-2xl flex items-center justify-center"
                        title="Play Video Testimonial"
                      >
                        <Play className="w-6 h-6 fill-slate-950 text-slate-950 ml-0.5" />
                      </button>
                    </div>
                    
                    <div className="absolute bottom-4 left-4 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-[10px] font-bold text-slate-200">
                      Watch Video Testimonial Tour
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 7. CALL TO ACTION SECTION */}
      <section className="bg-gradient-to-br from-royal to-royal-hover dark:from-slate-950 dark:to-slate-900 text-white py-20 border-t border-border-base transition-colors">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
            Ready To Make Your Next <br className="hidden sm:inline" />
            <span className="text-gold gold-gradient-text">Property Investment?</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Get personalized consultations on DHA Bahawalpur, DHA Multan, or residential plot segments from Waqas Ahmad Chaudhary.
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <a
              href="tel:+92300-0066255"
              className="px-6 py-3 bg-white text-royal hover:bg-slate-100 font-bold rounded-xl shadow-lg transition-colors text-sm"
            >
              Call Now (+92300-0066255)
            </a>
            <a
              href="https://wa.me/923000066255?text=Hello%2C%20I%20want%20to%20book%20a%20property%20consultation."
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 text-white font-bold rounded-xl shadow-lg transition-all text-sm flex items-center justify-center space-x-2 hover:scale-105"
              style={{ backgroundColor: "#25D366" }}
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              <span>WhatsApp Consultant</span>
            </a>
            <Link
              href="/contact"
              className="px-6 py-3 bg-transparent border border-slate-700 hover:bg-white/5 font-bold rounded-xl transition-all text-sm"
            >
              Book Consultation Form
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
