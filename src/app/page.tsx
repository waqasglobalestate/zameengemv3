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
  Home
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

  // Featured Properties listing sorted by premium first, then latest
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

  // Latest Uploads: active properties sorted by ID timestamp (newest first)
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
      
      {/* 1. HERO SLIDER SECTION */}
      <section className="relative h-[85vh] w-full overflow-hidden bg-slate-950">
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
              className="w-full h-full object-cover scale-105 transition-transform duration-[6000ms] ease-out"
              style={{ transform: index === activeSlide ? "scale(1)" : "scale(1.05)" }}
            />
          </div>
        ))}

        {/* Subtle left-side dark gradient overlay for text readability and premium look */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/45 to-transparent z-10" />

        {/* Hero Content Overlay */}
        <div className="absolute inset-0 flex items-center justify-start p-6 sm:p-12 md:p-20 lg:p-32 z-25 pointer-events-none">
          <div className="max-w-2xl text-left space-y-6 animate-in fade-in slide-in-from-left-5 duration-700 pointer-events-auto">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 text-[10px] sm:text-xs font-bold bg-[#c5a85c]/25 border border-[#c5a85c]/50 rounded-full text-[#c5a85c] tracking-widest uppercase">
              Zameen Gem
            </span>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
              Your Trusted Partner in <br />
              <span className="text-[#c5a85c] gold-gradient-text font-black">Real Estate Investment</span>
            </h1>
            
            <p className="text-xs sm:text-sm md:text-lg text-slate-100 font-medium leading-relaxed drop-shadow-md">
              Buy, Sell & Invest in DHA Bahawalpur and Pakistan&apos;s Leading Housing Projects. Let chief consultant Waqas Ahmad Chaudhary guide your wealth.
            </p>
          </div>
        </div>

        {/* Slide Controls */}
        <button
          onClick={() => setActiveSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-all z-30"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => setActiveSlide((prev) => (prev + 1) % heroImages.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-all z-30"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </section>

      {/* 2. ADVANCED SEARCH WIDGET */}
      <section className="relative z-40 -mt-16 max-w-6xl mx-auto w-full px-4">
        <div className="bg-background border border-border-base rounded-2xl shadow-2xl p-5 md:p-6 glass">
          <form onSubmit={handleSearch} className="space-y-4">
            
            {/* Purpose Switch Tabs */}
            <div className="flex space-x-2 border-b border-border-base pb-3">
              {(["Buy", "Rent", "Project"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setPurpose(tab)}
                  className={`px-4 py-1.5 text-xs sm:text-sm font-bold rounded-lg transition-all ${
                    purpose === tab
                      ? "bg-royal text-white dark:bg-white dark:text-royal"
                      : "text-muted-text hover:bg-muted-bg"
                  }`}
                >
                  {tab === "Project" ? "Featured Projects" : tab === "Buy" ? "For Sale" : "For Rent"}
                </button>
              ))}
            </div>

            {/* Core Search Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              
              {/* City Selection */}
              <div>
                <label className="block text-[10px] font-extrabold uppercase text-muted-text tracking-wider mb-1 flex items-center space-x-1">
                  <MapPin className="w-3 h-3 text-gold" />
                  <span>City</span>
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full text-xs font-bold rounded-lg border border-border-base px-3 py-2.5 bg-muted-bg text-foreground outline-none focus:ring-1 focus:ring-royal"
                >
                  <option value="">All Cities</option>
                  {pakistanCities.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Society / Project */}
              <div>
                <label className="block text-[10px] font-extrabold uppercase text-muted-text tracking-wider mb-1 flex items-center space-x-1">
                  <Home className="w-3 h-3 text-gold" />
                  <span>Society / Project</span>
                </label>
                <select
                  value={society}
                  onChange={(e) => setSociety(e.target.value)}
                  className="w-full text-xs font-bold rounded-lg border border-border-base px-3 py-2.5 bg-muted-bg text-foreground outline-none focus:ring-1 focus:ring-royal"
                >
                  <option value="">All Societies</option>
                  <option value="DHA Bahawalpur">DHA Bahawalpur</option>
                  <option value="DHA Multan">DHA Multan</option>
                  <option value="DHA Lahore">DHA Lahore</option>
                  <option value="DHA Islamabad">DHA Islamabad</option>
                  <option value="Bahria Town Projects">Bahria Town Projects</option>
                </select>
              </div>

              {/* Property Type */}
              <div>
                <label className="block text-[10px] font-extrabold uppercase text-muted-text tracking-wider mb-1 flex items-center space-x-1">
                  <Building2 className="w-3 h-3 text-gold" />
                  <span>Property Type</span>
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full text-xs font-bold rounded-lg border border-border-base px-3 py-2.5 bg-muted-bg text-foreground outline-none focus:ring-1 focus:ring-royal"
                >
                  <option value="">All Types</option>
                  <option value="Residential Plot">Residential Plot</option>
                  <option value="Commercial Plot">Commercial Plot</option>
                  <option value="Villa">Villa</option>
                  <option value="House">House</option>
                </select>
              </div>

              {/* Plot Size */}
              <div>
                <label className="block text-[10px] font-extrabold uppercase text-muted-text tracking-wider mb-1 flex items-center space-x-1">
                  <Ruler className="w-3 h-3 text-gold" />
                  <span>Plot Size</span>
                </label>
                <select
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  className="w-full text-xs font-bold rounded-lg border border-border-base px-3 py-2.5 bg-muted-bg text-foreground outline-none focus:ring-1 focus:ring-royal"
                >
                  <option value="">Any Size</option>
                  <option value="5 Marla">5 Marla</option>
                  <option value="10 Marla">10 Marla</option>
                  <option value="1 Kanal">1 Kanal</option>
                  <option value="2 Kanal">2 Kanal</option>
                </select>
              </div>

              {/* Price Cap */}
              <div>
                <label className="block text-[10px] font-extrabold uppercase text-muted-text tracking-wider mb-1 flex items-center space-x-1">
                  <DollarSign className="w-3 h-3 text-gold" />
                  <span>Max Budget (PKR)</span>
                </label>
                <select
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  className="w-full text-xs font-bold rounded-lg border border-border-base px-3 py-2.5 bg-muted-bg text-foreground outline-none focus:ring-1 focus:ring-royal"
                >
                  <option value="">No Limit</option>
                  <option value="5000000">Under 50 Lakhs</option>
                  <option value="10000000">Under 1 Crore</option>
                  <option value="20000000">Under 2 Crore</option>
                  <option value="40000000">Under 4 Crore</option>
                </select>
              </div>

            </div>

            {/* Advanced Filters Expandable section */}
            {showAdvanced && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t border-border-base animate-in fade-in duration-300">
                {/* Sector */}
                <div>
                  <label className="block text-[10px] font-extrabold uppercase text-muted-text mb-1">Sector Block</label>
                  <input
                    type="text"
                    placeholder="e.g. Sector A"
                    value={sector}
                    onChange={(e) => setSector(e.target.value)}
                    className="w-full text-xs font-semibold rounded-lg border border-border-base px-3 py-2 bg-muted-bg text-foreground outline-none focus:ring-1 focus:ring-royal"
                  />
                </div>

                {/* Possession */}
                <div>
                  <label className="block text-[10px] font-extrabold uppercase text-muted-text mb-1">Possession Status</label>
                  <select
                    value={possession}
                    onChange={(e) => setPossession(e.target.value)}
                    className="w-full text-xs font-semibold rounded-lg border border-border-base px-3 py-2.5 bg-muted-bg text-foreground outline-none focus:ring-1 focus:ring-royal"
                  >
                    <option value="">Any Status</option>
                    <option value="Possession">Possession Ready</option>
                    <option value="Non-Possession">Non-Possession</option>
                  </select>
                </div>

                {/* Corner, Park, Main Boulevard check row */}
                <div className="col-span-2 flex flex-wrap gap-4 items-center pt-5">
                  <label className="flex items-center space-x-2 text-xs font-bold cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={corner} 
                      onChange={(e) => setCorner(e.target.checked)}
                      className="rounded accent-gold text-white" 
                    />
                    <span>Corner Plot</span>
                  </label>
                  <label className="flex items-center space-x-2 text-xs font-bold cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={parkFacing} 
                      onChange={(e) => setParkFacing(e.target.checked)}
                      className="rounded accent-gold text-white" 
                    />
                    <span>Park Facing</span>
                  </label>
                  <label className="flex items-center space-x-2 text-xs font-bold cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={mainBoulevard} 
                      onChange={(e) => setMainBoulevard(e.target.checked)}
                      className="rounded accent-gold text-white" 
                    />
                    <span>Main Boulevard</span>
                  </label>
                  <label className="flex items-center space-x-2 text-xs font-bold cursor-pointer">
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
            <div className="flex items-center justify-between pt-2 border-t border-border-base">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-xs font-bold text-muted-text hover:text-gold flex items-center space-x-1"
              >
                {showAdvanced ? (
                  <><span>Simple Search</span><ChevronUp className="w-3.5 h-3.5" /></>
                ) : (
                  <><span>Advanced Filters</span><ChevronDown className="w-3.5 h-3.5" /></>
                )}
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 bg-royal dark:bg-white text-white dark:text-royal font-bold text-xs sm:text-sm rounded-xl hover:bg-royal-hover dark:hover:bg-slate-200 transition-all flex items-center space-x-2 shadow-lg"
              >
                <Search className="w-4 h-4" />
                <span>Search Properties</span>
              </button>
            </div>

          </form>
        </div>
      </section>

      {/* 2. LATEST UPLOADS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-b border-border-base/50">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-gold uppercase tracking-widest bg-gold/10 px-2.5 py-1 rounded-md border border-gold/20">
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

      {/* 3. FEATURED PROPERTIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-gold bg-gold/10 px-3 py-1 rounded-full">
              Verified Listings
            </span>
            <h2 className="text-3xl font-black tracking-tight text-foreground mt-3">
              Featured Properties
            </h2>
            <p className="text-xs sm:text-sm text-muted-text mt-1">
              Top handpicked real estate investment opportunities currently on the market.
            </p>
          </div>
          <Link
            href="/properties"
            className="group inline-flex items-center space-x-1 text-sm font-bold text-royal dark:text-white hover:text-gold dark:hover:text-gold transition-colors mt-4 sm:mt-0"
          >
            <span>See All Listings</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProperties.map((prop) => (
            <PropertyCard key={prop.id} property={prop} />
          ))}
        </div>
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
