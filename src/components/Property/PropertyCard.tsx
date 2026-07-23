"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Property } from "@/data/initialProperties";
import { useAppState } from "@/context/AppStateContext";
import { Heart, Phone, Eye, Compass, LayoutGrid, Flame } from "lucide-react";

interface PropertyCardProps {
  property: Property;
  onCompareToggle?: (id: string) => void;
  isComparing?: boolean;
}

export default function PropertyCard({ property, onCompareToggle, isComparing = false }: PropertyCardProps) {
  const { savedProperties, toggleSavedProperty, addRecentlyViewed, incrementViews } = useAppState();
  const [imgSrc, setImgSrc] = useState(property.images?.[0] || "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80");

  const isSaved = savedProperties.includes(property.id);

  // Format price into local notation (Lakhs / Crore)
  const formatPrice = (priceVal: number) => {
    if (priceVal >= 10000000) {
      return `${(priceVal / 10000000).toFixed(2)} Crore`;
    }
    return `${(priceVal / 100000).toFixed(0)} Lakhs`;
  };

  const handleCardClick = () => {
    addRecentlyViewed(property.id);
    incrementViews(property.id);
  };

  return (
    <div 
      onClick={handleCardClick}
      className="group relative flex flex-col rounded-2xl border border-border-base bg-background/50 hover:bg-background transition-all duration-300 hover:shadow-2xl overflow-hidden glass"
    >
      {/* Property Image & Badges */}
      <div className="relative aspect-video w-full overflow-hidden bg-muted-bg">
        <Image 
          src={imgSrc} 
          alt={property.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          onError={() => setImgSrc("https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80")}
        />
        
        {/* Purpose Badge (Buy/Rent/Project) */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md text-white ${
            property.purpose === "Buy" 
              ? "bg-royal" 
              : property.purpose === "Rent" 
                ? "bg-amber-600" 
                : "bg-emerald-600"
          }`}>
            {property.purpose === "Project" ? "Featured Project" : property.purpose}
          </span>
          {property.isFeatured && (
            <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md bg-gold text-white">
              Featured
            </span>
          )}
          {property.isHot && (
            <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md bg-rose-600 text-white flex items-center gap-1 shadow-lg animate-pulse">
              <Flame className="w-3 h-3 fill-white text-white" />
              <span>Hot</span>
            </span>
          )}
        </div>

        {/* Feature Highlights: Corner, Park Facing, Main Boulevard */}
        <div className="absolute bottom-3 left-3 flex flex-wrap gap-1 z-10">
          {property.isCorner && (
            <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded bg-black/60 text-white backdrop-blur-sm">
              Corner
            </span>
          )}
          {property.isParkFacing && (
            <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded bg-black/60 text-white backdrop-blur-sm">
              Park Facing
            </span>
          )}
          {property.isMainBoulevard && (
            <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded bg-black/60 text-white backdrop-blur-sm">
              Main Boulevard
            </span>
          )}
        </div>

        {/* Favorite & Compare Overlay */}
        <div className="absolute top-3 right-3 flex flex-col space-y-2 z-10">
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleSavedProperty(property.id);
            }}
            className={`p-2 rounded-full backdrop-blur-md transition-all shadow-md ${
              isSaved 
                ? "bg-red-500 text-white hover:bg-red-600" 
                : "bg-white/80 dark:bg-slate-950/80 text-foreground hover:bg-white dark:hover:bg-slate-900"
            }`}
            title={isSaved ? "Saved" : "Save Property"}
          >
            <Heart className="w-4 h-4" fill={isSaved ? "currentColor" : "none"} />
          </button>

          {onCompareToggle && (
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onCompareToggle(property.id);
              }}
              className={`p-2 rounded-full backdrop-blur-md transition-all shadow-md ${
                isComparing 
                  ? "bg-gold text-white hover:bg-gold-hover" 
                  : "bg-white/80 dark:bg-slate-950/80 text-foreground hover:bg-white dark:hover:bg-slate-900"
              }`}
              title="Add to Compare"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Property Details */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-baseline justify-between mb-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-text">
            {property.type}
          </span>
          <span className="text-xs font-semibold bg-muted-bg text-foreground px-2 py-0.5 rounded border border-border-base">
            {property.size}
          </span>
        </div>

        <h3 className="text-base font-bold text-foreground line-clamp-1 group-hover:text-gold transition-colors mb-2">
          <Link href={`/properties/${property.id}`}>
            {property.title}
          </Link>
        </h3>

        <div className="flex items-center space-x-1.5 text-xs text-muted-text mb-4">
          <Compass className="w-3.5 h-3.5 text-gold shrink-0" />
          <span className="truncate">{property.sector ? `${property.sector}, ` : ""}{property.location}</span>
        </div>

        <div className="mt-auto pt-3 border-t border-border-base">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-text tracking-wider">Price</p>
              <p className="text-lg font-extrabold text-royal dark:text-white">PKR {formatPrice(property.price)}</p>
            </div>
            
            <div className="flex items-center space-x-1 text-[11px] text-muted-text bg-muted-bg px-2 py-1 rounded">
              <Eye className="w-3 h-3 text-gold" />
              <span>{property.viewsCount} views</span>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex space-x-2">
            <Link 
              href={`/properties/${property.id}`}
              onClick={() => incrementViews(property.id)}
              className="flex-grow text-center text-xs font-bold py-2 bg-royal hover:bg-royal-hover dark:bg-white dark:hover:bg-slate-200 dark:text-royal text-white rounded-lg transition-colors flex items-center justify-center"
            >
              Details
            </Link>
            
            <a 
              href={`tel:${property.agent.phone}`}
              className="p-2 border border-border-base text-muted-text hover:text-royal dark:hover:text-white hover:bg-muted-bg rounded-lg transition-colors"
              title={`Call ${property.agent.name}`}
              onClick={(e) => { e.stopPropagation(); incrementViews(property.id); }}
            >
              <Phone className="w-4 h-4" />
            </a>
            
            <a 
              href={`https://wa.me/${property.agent.whatsapp}?text=${encodeURIComponent(`Assalam-o-Alaikum, I am interested in your property listing: ${property.title} (ID: ${property.id}). Please share more details.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 border border-emerald-500/30 text-emerald-600 hover:text-white hover:bg-emerald-600 rounded-lg transition-colors"
              title="Chat on WhatsApp"
              onClick={(e) => { e.stopPropagation(); incrementViews(property.id); }}
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
