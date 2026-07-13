"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppState } from "@/context/AppStateContext";
import PropertyMap from "@/components/Property/PropertyMap";
import { 
  Heart, 
  Phone, 
  Eye, 
  Compass, 
  Calendar, 
  Share2, 
  CheckCircle, 
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  UserCheck,
  Mail,
  MessageSquare
} from "lucide-react";

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { properties, addInquiry, savedProperties, toggleSavedProperty, incrementViews, isLoaded, addLead } = useAppState();

  const propertyId = params.id as string;
  const property = properties.find((p) => p.id === propertyId);

  // Extract contact numbers and uploader details dynamically
  const contactName = property?.contactDetails?.name || property?.agent.name || "Global Estate Agent";
  const contactPhone = property?.contactDetails?.phone || property?.agent.phone || "+92300-0066255";
  const whatsappNumber = property?.agent.whatsapp || contactPhone.replace(/[^0-9]/g, "");
  const publisherType = property?.contactDetails?.type || (property?.agent.experience.includes("CEO") ? "Admin" : "Agent");
  const agencyName = property?.contactDetails?.agencyName || (property?.agent.experience.includes("CEO") ? "Global Estate & Marketing" : "");

  // Instant Query state
  const [showQueryModal, setShowQueryModal] = useState(false);
  const [queryName, setQueryName] = useState("");
  const [queryEmail, setQueryEmail] = useState("");
  const [queryPhone, setQueryPhone] = useState("");
  const [queryMsg, setQueryMsg] = useState("Hi, I am interested in this property. Please share details.");
  const [isQuerySuccess, setIsQuerySuccess] = useState(false);

  // Gallery state
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  // 360 Virtual Tour state
  const [show360, setShow360] = useState(false);
  const [panAngle, setPanAngle] = useState(0); // in degrees for panoramic scroll simulation

  // Inquiry/Schedule Form state
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientMsg, setClientMsg] = useState("");
  const [isSubmitSuccess, setIsSubmitSuccess] = useState(false);

  // Copy share link
  const [shareCopied, setShareCopied] = useState(false);

  // Increment views on client-side mount
  useEffect(() => {
    if (isLoaded && propertyId) {
      incrementViews(propertyId);
    }
  }, [isLoaded, propertyId]);

  if (!isLoaded) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center font-bold text-muted-text">
        Fetching property details...
      </div>
    );
  }

  if (!property) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-red-500 mx-auto" />
        <h3 className="text-xl font-bold text-foreground">Property Listing Not Found</h3>
        <p className="text-xs text-muted-text">The property listing with ID &ldquo;{propertyId}&rdquo; does not exist or has been removed.</p>
        <button
          onClick={() => router.push("/properties")}
          className="px-4 py-2 bg-royal text-white font-bold text-xs rounded-lg hover:bg-slate-800 transition-colors"
        >
          Return to Properties Directory
        </button>
      </div>
    );
  }

  const isSaved = savedProperties.includes(property.id);

  // Share Property handler
  const handleShare = () => {
    try {
      navigator.clipboard.writeText(window.location.href);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2500);
    } catch (e) {
      alert("Failed to copy link. Please manually copy the URL bar.");
    }
  };

  // Inquiry submit handler
  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientPhone) {
      alert("Please enter your name and phone number.");
      return;
    }

    addInquiry({
      propertyId: property.id,
      propertyName: property.title,
      clientName,
      clientEmail,
      clientPhone,
      clientMessage: `Schedule Visit Request on ${scheduleDate} at ${scheduleTime}. Additional message: ${clientMsg}`,
      agentName: property.agent.name
    });

    setIsSubmitSuccess(true);
    setClientName("");
    setClientEmail("");
    setClientPhone("");
    setClientMsg("");
    setScheduleDate("");
    setScheduleTime("");

    setTimeout(() => {
      setIsSubmitSuccess(false);
      setShowScheduleModal(false);
    }, 2500);
  };

  // Instant Query Submit Handler
  const handleQuerySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryName || !queryPhone) {
      alert("Please enter your name and phone number.");
      return;
    }

    addInquiry({
      propertyId: property.id,
      propertyName: property.title,
      clientName: queryName,
      clientEmail: queryEmail,
      clientPhone: queryPhone,
      clientMessage: `Instant Query: "${queryMsg}"`,
      agentName: property.agent.name
    });

    setIsQuerySuccess(true);

    // Capture as CRM Lead
    addLead({
      name: queryName,
      phone: queryPhone,
      email: queryEmail || "N/A",
      whatsApp: "Yes",
      propertyInterested: `Instant Query: "${property.title}" (ID: ${property.id})`,
      source: "Contact Forms",
      agentId: property.agent.name
    });

    // Clear fields
    setQueryName("");
    setQueryEmail("");
    setQueryPhone("");
    setQueryMsg("Hi, I am interested in this property. Please share details.");

    setTimeout(() => {
      setIsQuerySuccess(false);
      setShowQueryModal(false);
    }, 3000);
  };

  const formatPrice = (priceVal: number) => {
    if (priceVal >= 10000000) {
      return `${(priceVal / 10000000).toFixed(2)} Crore`;
    }
    return `${(priceVal / 100000).toFixed(0)} Lakhs`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* 1. Detail Title & Header actions */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 border-b border-border-base pb-6">
        <div>
          <div className="flex flex-wrap gap-2 items-center mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-royal dark:bg-white text-white dark:text-royal px-2.5 py-1 rounded">
              {property.purpose === "Project" ? "Featured Project" : `For ${property.purpose}`}
            </span>
            <span className="text-[10px] font-bold bg-gold/15 text-gold border border-gold/25 px-2.5 py-1 rounded">
              {property.type}
            </span>
            <span className="text-[10px] font-bold bg-muted-bg text-foreground border border-border-base px-2.5 py-1 rounded">
              {property.size}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight leading-tight">
            {property.title}
          </h1>

          <div className="flex items-center space-x-1.5 text-xs text-muted-text mt-2">
            <Compass className="w-4 h-4 text-gold" />
            <span>{property.sector ? `${property.sector}, ` : ""}{property.location}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5 items-center">
          <div className="text-left md:text-right shrink-0">
            <p className="text-[9px] uppercase font-bold text-muted-text tracking-wider">Demand Price</p>
            <p className="text-2xl font-black text-royal dark:text-white">PKR {formatPrice(property.price)}</p>
          </div>

          <button
            onClick={() => toggleSavedProperty(property.id)}
            className={`p-3 border rounded-xl shadow-sm transition-colors ${
              isSaved
                ? "bg-red-500 border-red-500 text-white hover:bg-red-600"
                : "bg-background border-border-base text-muted-text hover:text-foreground"
            }`}
            title={isSaved ? "Saved" : "Save Property"}
          >
            <Heart className="w-5 h-5" fill={isSaved ? "currentColor" : "none"} />
          </button>

          <button
            onClick={handleShare}
            className={`px-4 py-3 border border-border-base rounded-xl bg-background text-muted-text hover:text-foreground transition-all flex items-center space-x-1.5 shadow-sm text-xs font-bold ${
              shareCopied ? "border-gold text-gold" : ""
            }`}
          >
            <Share2 className="w-4 h-4" />
            <span>{shareCopied ? "Link Copied!" : "Share Link"}</span>
          </button>
        </div>
      </div>

      {/* 2. Visual Media Panel (Photo Gallery vs 360 Tour Toggle) */}
      <div className="rounded-2xl border border-border-base bg-background/50 overflow-hidden shadow-xl glass">
        
        {/* Gallery / 360 Selector Bar */}
        <div className="p-3 bg-muted-bg border-b border-border-base flex items-center justify-between">
          <div className="flex space-x-1">
            <button
              onClick={() => setShow360(false)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                !show360 
                  ? "bg-background text-gold shadow-sm" 
                  : "text-muted-text hover:text-foreground"
              }`}
            >
              Photo Gallery
            </button>
            <button
              onClick={() => setShow360(true)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
                show360 
                  ? "bg-background text-gold shadow-sm" 
                  : "text-muted-text hover:text-foreground"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>360° Virtual Tour</span>
            </button>
          </div>
          
          <div className="flex items-center space-x-1 text-[10px] font-bold text-muted-text bg-background border border-border-base px-2.5 py-1 rounded-lg">
            <Eye className="w-3.5 h-3.5 text-gold" />
            <span>{property.viewsCount} total visitors</span>
          </div>
        </div>

        {/* Media Window Panel */}
        <div className="relative aspect-video w-full bg-slate-950 flex items-center justify-center">
          
          {!show360 ? (
            /* STANDARD PHOTO WINDOW */
            <div className="w-full h-full relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={property.images[activeImageIdx]}
                alt={property.title}
                className="w-full h-full object-cover"
              />
              
              {/* Nav arrows */}
              {property.images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImageIdx(prev => (prev - 1 + property.images.length) % property.images.length)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/45 hover:bg-black/60 rounded-full text-white"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setActiveImageIdx(prev => (prev + 1) % property.images.length)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/45 hover:bg-black/60 rounded-full text-white"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          ) : (
            /* 360 PANORAMA BLUEPRINT SIMULATOR */
            <div className="relative w-full h-full overflow-hidden select-none">
              {/* Panoramic image wrapper with panning angle offset */}
              <div 
                className="w-[200%] h-full transition-transform duration-200 ease-out"
                style={{ transform: `translateX(-${panAngle}%)` }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={property.images[0]}
                  alt="360 view panorama"
                  className="w-full h-full object-cover blur-[0.5px]"
                />
              </div>

              {/* Angle Pan controls Overlay */}
              <div className="absolute inset-x-0 bottom-6 flex justify-center space-x-3 z-10">
                <button
                  onClick={() => setPanAngle(prev => Math.max(prev - 8, 0))}
                  className="px-3.5 py-1.5 bg-black/75 hover:bg-black text-white text-xs font-bold rounded-lg border border-slate-700"
                >
                  ◀ Rotate Left
                </button>
                <button
                  onClick={() => setPanAngle(prev => Math.min(prev + 8, 50))}
                  className="px-3.5 py-1.5 bg-black/75 hover:bg-black text-white text-xs font-bold rounded-lg border border-slate-700"
                >
                  Rotate Right ▶
                </button>
              </div>

              <div className="absolute top-4 left-4 bg-gold/90 text-slate-900 border border-white text-[10px] font-extrabold px-2.5 py-1 rounded shadow-lg uppercase tracking-wider animate-pulse z-10">
                Simulated 360° Panorama Tour Mode (Drag or Use Buttons)
              </div>
            </div>
          )}

        </div>

        {/* Thumbnail grid */}
        {!show360 && property.images.length > 1 && (
          <div className="p-3 bg-muted-bg border-t border-border-base flex space-x-2.5 overflow-x-auto">
            {property.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIdx(idx)}
                className={`relative w-20 h-14 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                  idx === activeImageIdx ? "border-gold scale-102" : "border-transparent opacity-75 hover:opacity-100"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img} alt="Property thumbnail" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 3. Description & Details vs Agent Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Description, Amenities, Map */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Description Card */}
          <div className="rounded-2xl border border-border-base bg-background/50 p-6 glass space-y-4">
            <h3 className="text-xl font-bold text-foreground">Property Description</h3>
            <p className="text-xs sm:text-sm text-muted-text leading-relaxed whitespace-pre-wrap">
              {property.description}
            </p>
          </div>

          {/* Amenities Grid */}
          <div className="rounded-2xl border border-border-base bg-background/50 p-6 glass space-y-4">
            <h3 className="text-xl font-bold text-foreground">Amenities & Property Features</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {property.amenities.map((amenity) => (
                <div key={amenity} className="flex items-center space-x-2 text-xs font-bold text-foreground">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Location Map integration */}
          <PropertyMap 
            location={property.location} 
            sector={property.sector} 
            nearby={property.nearby} 
          />
        </div>

        {/* Right Column: Agent Profile and Inquiry Actions */}
        <div className="lg:col-span-4 space-y-6">
               {/* Agent & Uploader Card */}
          <div className="rounded-2xl border border-border-base bg-background/50 p-6 glass text-center space-y-4">
            {/* Agent/Agency image */}
            <div className="relative w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-gold shadow-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={property.agent.image} 
                alt={contactName} 
                className="w-full h-full object-cover"
              />
            </div>
            
            <div>
              <span className="inline-block text-[9px] uppercase font-bold tracking-widest text-gold bg-gold/10 px-2.5 py-0.5 rounded mb-1">
                {publisherType === "Admin" ? "Super Admin" : publisherType}
              </span>
              <h4 className="font-extrabold text-base text-foreground">{contactName}</h4>
              {agencyName && (
                <p className="text-[10px] text-gold font-semibold mt-0.5">{agencyName}</p>
              )}
              <p className="text-[10px] text-muted-text mt-0.5">Exp: {property.agent.experience}</p>
            </div>

            <hr className="border-border-base" />

            <div className="space-y-3">
              {/* Phone Contacts */}
              <div className="text-left space-y-1.5">
                <p className="text-[9px] font-bold text-muted-text uppercase tracking-wider">Contact Numbers</p>
                <div className="flex items-center justify-between gap-2 p-2 bg-muted-bg border border-border-base rounded-lg text-xs">
                  <span className="font-medium text-foreground flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-royal dark:text-white" />
                    Call: {contactPhone}
                  </span>
                  <a
                    href={`tel:${contactPhone}`}
                    className="px-2 py-1 bg-royal text-white dark:bg-white dark:text-royal font-bold rounded hover:opacity-90 transition-all text-[10px]"
                  >
                    Call
                  </a>
                </div>

                <div className="flex items-center justify-between gap-2 p-2 bg-muted-bg border border-border-base rounded-lg text-xs">
                  <span className="font-medium text-foreground flex items-center gap-1.5">
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-emerald-500">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    WhatsApp: {contactPhone}
                  </span>
                  <a
                    href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Assalam-o-Alaikum, I am inquiring about: "${property.title}" (ID: ${property.id}). Let's discuss.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2 py-1 bg-emerald-600 text-white font-bold rounded hover:bg-emerald-700 transition-all text-[10px]"
                  >
                    Chat
                  </a>
                </div>
              </div>

              {/* Direct query button CTA */}
              <button
                onClick={() => setShowQueryModal(true)}
                className="w-full bg-gold hover:bg-gold-hover text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center space-x-2 text-xs shadow-lg shadow-gold/25"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Query / Connect Now</span>
              </button>

              <button
                onClick={() => setShowScheduleModal(true)}
                className="w-full border border-border-base hover:bg-muted-bg text-foreground py-2.5 rounded-lg font-bold transition-all flex items-center justify-center space-x-2 text-xs"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Schedule Visit Tour</span>
              </button>
            </div>

            {/* CEO verification tag */}
            {contactName.includes("Waqas") && (
              <div className="pt-2 flex items-center justify-center space-x-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                <UserCheck className="w-3.5 h-3.5" />
                <span>Global Estate Verified Lead Consultant</span>
              </div>
            )}
          </div>

          {/* Investment Highlight details */}
          <div className="rounded-2xl border border-border-base bg-[#c5a85c]/5 p-5 space-y-3">
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-gold">Investment Appraisal</h4>
            <div className="space-y-2 text-xs leading-relaxed text-muted-text">
              <p>• Estimated ROI Potential: <strong>{property.roiPotential} per annum</strong>.</p>
              <p>• Gated secure sector layout planning protects asset capital depreciation risk.</p>
              <p>• Possession Status: <strong>{property.possessionStatus}</strong>.</p>
              {property.installmentAvailable && (
                <p className="text-emerald-600 dark:text-emerald-400 font-bold">
                  ✓ Installment options available for this listing.
                </p>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* 4. INQUIRY / SCHEDULE VISIT DIALOG MODAL */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl bg-background border border-border-base shadow-2xl p-6 glass space-y-4">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-extrabold text-foreground">Schedule a Visit Tour</h3>
                <p className="text-[11px] text-muted-text mt-0.5">Submit request details. Our consultant will contact you back.</p>
              </div>
              <button 
                onClick={() => setShowScheduleModal(false)}
                className="p-1 rounded-lg border border-border-base text-muted-text hover:text-foreground hover:bg-muted-bg"
              >
                ✕
              </button>
            </div>

            {isSubmitSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="mx-auto w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center">
                  ✓
                </div>
                <h4 className="font-bold text-foreground">Lead Submitted Successfully!</h4>
                <p className="text-xs text-muted-text">Your visit request has been logged and assigned to {property.agent.name}.</p>
              </div>
            ) : (
              <form onSubmit={handleScheduleSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-muted-text mb-1">Date</label>
                    <input 
                      type="date" 
                      required
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      className="w-full text-xs font-semibold rounded-lg border border-border-base px-2.5 py-1.5 bg-muted-bg outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-muted-text mb-1">Time</label>
                    <input 
                      type="time" 
                      required
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      className="w-full text-xs font-semibold rounded-lg border border-border-base px-2.5 py-1.5 bg-muted-bg outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-muted-text mb-1">Your Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ali Khan" 
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full text-xs font-semibold rounded-lg border border-border-base px-3 py-1.5 bg-muted-bg outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-muted-text mb-1">Phone Number</label>
                    <input 
                      type="tel" 
                      required
                      placeholder="0300-1234567" 
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      className="w-full text-xs font-semibold rounded-lg border border-border-base px-3 py-1.5 bg-muted-bg outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-muted-text mb-1">Email (Optional)</label>
                    <input 
                      type="email" 
                      placeholder="ali@gmail.com" 
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      className="w-full text-xs font-semibold rounded-lg border border-border-base px-3 py-1.5 bg-muted-bg outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-muted-text mb-1">Additional Message</label>
                  <textarea 
                    placeholder="Please call me before confirming..." 
                    rows={2}
                    value={clientMsg}
                    onChange={(e) => setClientMsg(e.target.value)}
                    className="w-full text-xs font-semibold rounded-lg border border-border-base px-3 py-1.5 bg-muted-bg outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-royal hover:bg-slate-800 text-white font-bold rounded-lg text-xs transition-colors"
                >
                  Book Visit
                </button>
              </form>
            )}

          </div>
        </div>
      )}

      {/* 5. INSTANT QUERY MODAL */}
      {showQueryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl bg-background border border-border-base shadow-2xl p-6 glass space-y-4">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-extrabold text-foreground">Send Instant Query</h3>
                <p className="text-[11px] text-muted-text mt-0.5">Directly connect with the seller, agent or agency of this property.</p>
              </div>
              <button 
                onClick={() => setShowQueryModal(false)}
                className="p-1 rounded-lg border border-border-base text-muted-text hover:text-foreground hover:bg-muted-bg"
              >
                ✕
              </button>
            </div>

            {isQuerySuccess ? (
              <div className="py-8 text-center space-y-4">
                <div className="mx-auto w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center text-xl font-bold">
                  ✓
                </div>
                <div>
                  <h4 className="font-bold text-foreground">Query Sent Successfully!</h4>
                  <p className="text-xs text-muted-text px-2">Your contact request is logged. Click below to chat directly with {contactName} on WhatsApp.</p>
                </div>
                <div className="flex flex-col gap-2 pt-2">
                  <a
                    href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Assalam-o-Alaikum, my name is ${queryName || "Visitor"}. I sent an inquiry about your listing "${property.title}" (ID: ${property.id}). Let's chat.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    Connect on WhatsApp Chat
                  </a>
                  <a
                    href={`tel:${contactPhone}`}
                    className="w-full py-2.5 border border-border-base text-foreground font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 hover:bg-muted-bg transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" /> Call: {contactPhone}
                  </a>
                </div>
              </div>
            ) : (
              <form onSubmit={handleQuerySubmit} className="space-y-3.5">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-muted-text mb-1">Your Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Waseem Khan" 
                    value={queryName}
                    onChange={(e) => setQueryName(e.target.value)}
                    className="w-full text-xs font-semibold rounded-lg border border-border-base px-3 py-2 bg-muted-bg outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-muted-text mb-1">WhatsApp / Phone Number</label>
                  <input 
                    type="tel" 
                    required
                    placeholder="0300-1234567" 
                    value={queryPhone}
                    onChange={(e) => setQueryPhone(e.target.value)}
                    className="w-full text-xs font-semibold rounded-lg border border-border-base px-3 py-2 bg-muted-bg outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-muted-text mb-1">Email Address (Optional)</label>
                  <input 
                    type="email" 
                    placeholder="waseem@gmail.com" 
                    value={queryEmail}
                    onChange={(e) => setQueryEmail(e.target.value)}
                    className="w-full text-xs font-semibold rounded-lg border border-border-base px-3 py-2 bg-muted-bg outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-muted-text mb-1">Message</label>
                  <textarea 
                    rows={3}
                    value={queryMsg}
                    onChange={(e) => setQueryMsg(e.target.value)}
                    className="w-full text-xs font-semibold rounded-lg border border-border-base px-3 py-2 bg-muted-bg outline-none resize-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-royal hover:bg-slate-800 text-white font-bold rounded-lg text-xs transition-colors"
                  >
                    Submit &amp; Connect Uploader
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
