"use client";

import React, { useState } from "react";
import { MapPin, School, Landmark, ShoppingBag, HeartPulse, Compass, ZoomIn, ZoomOut } from "lucide-react";

interface PropertyMapProps {
  location: string;
  sector?: string;
  nearby?: {
    schools?: string;
    hospitals?: string;
    mosques?: string;
    markets?: string;
  };
}

export default function PropertyMap({ location, sector, nearby }: PropertyMapProps) {
  const [zoom, setZoom] = useState(15);

  const places = [
    { name: sector || "Sector Area", type: "property", x: 190, y: 140, icon: <MapPin className="w-5 h-5 text-red-500 fill-red-100" /> },
    { name: nearby?.mosques || "Grand Mosque", type: "mosque", x: 260, y: 80, icon: <Landmark className="w-4 h-4 text-emerald-600" /> },
    { name: nearby?.schools || "DHA Public School", type: "school", x: 110, y: 90, icon: <School className="w-4 h-4 text-blue-600" /> },
    { name: nearby?.markets || "Commercial Market", type: "market", x: 280, y: 190, icon: <ShoppingBag className="w-4 h-4 text-amber-600" /> },
    { name: nearby?.hospitals || "Medical Center", type: "hospital", x: 90, y: 200, icon: <HeartPulse className="w-4 h-4 text-red-600" /> }
  ];

  return (
    <div className="rounded-2xl border border-border-base bg-background/50 overflow-hidden glass">
      {/* Map Control Header */}
      <div className="bg-muted-bg border-b border-border-base p-4 flex items-center justify-between">
        <div>
          <h4 className="font-bold text-sm text-foreground">Property Location & GIS Locator</h4>
          <p className="text-[11px] text-muted-text">{sector ? `${sector}, ` : ""}{location}</p>
        </div>
        
        <div className="flex items-center space-x-1.5">
          <button 
            onClick={() => setZoom(prev => Math.min(prev + 1, 18))}
            className="p-1.5 bg-background border border-border-base rounded-lg text-foreground hover:bg-muted-bg transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setZoom(prev => Math.max(prev - 1, 12))}
            className="p-1.5 bg-background border border-border-base rounded-lg text-foreground hover:bg-muted-bg transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-muted-text px-2 bg-background border border-border-base rounded-lg py-1">
            Zoom {zoom}x
          </span>
        </div>
      </div>

      {/* Stylized Visual Map Board */}
      <div className="relative h-72 w-full bg-[#1e293b] dark:bg-slate-950 overflow-hidden flex items-center justify-center">
        {/* Abstract road layouts */}
        <div className="absolute h-[500px] w-12 bg-slate-700/30 dark:bg-slate-900/40 rotate-[35deg] pointer-events-none"></div>
        <div className="absolute h-[500px] w-12 bg-slate-700/30 dark:bg-slate-900/40 -rotate-[45deg] pointer-events-none"></div>
        <div className="absolute h-8 w-[600px] bg-slate-700/30 dark:bg-slate-900/40 pointer-events-none top-36"></div>
        
        {/* Main Road overlay text */}
        <div className="absolute text-[8px] sm:text-[10px] tracking-[0.3em] font-bold text-slate-500/50 uppercase rotate-[-45deg] top-24 left-10 pointer-events-none">
          Main Sector Boulevard
        </div>

        {/* Compass indicator */}
        <div className="absolute bottom-4 right-4 text-slate-500/40 pointer-events-none flex flex-col items-center">
          <Compass className="w-8 h-8 animate-spin-slow" />
          <span className="text-[9px] font-bold mt-1">GIS NORTH</span>
        </div>

        {/* Grid Overlay */}
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none"></div>

        {/* Render Locations based on Zoom level scale factor */}
        {places.map((place) => {
          // Adjust positions slightly based on zoom level to simulate scale changes
          const scale = (zoom - 12) / 3; // 0 to 2
          const dx = (place.x - 200) * scale;
          const dy = (place.y - 150) * scale;
          const left = 200 + dx;
          const top = 150 + dy;

          // Don't render out of bounds
          if (left < 10 || left > 380 || top < 10 || top > 270) return null;

          return (
            <div
              key={place.name}
              className="absolute -translate-x-1/2 -translate-y-1/2 group z-20 cursor-pointer"
              style={{ left: `${left}px`, top: `${top}px` }}
            >
              <div className={`p-2 rounded-full shadow-lg border transition-all duration-300 ${
                place.type === "property"
                  ? "bg-red-500/20 border-red-500 animate-pulse scale-110"
                  : "bg-background/95 dark:bg-slate-900/95 border-border-base hover:scale-110 hover:border-gold"
              }`}>
                {place.icon}
              </div>
              
              {/* Tooltip text */}
              <div className="absolute top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900/95 text-white dark:bg-background/95 dark:text-foreground border border-slate-800 dark:border-border-base text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded shadow-xl opacity-80 group-hover:opacity-100 group-hover:scale-105 pointer-events-none transition-all">
                {place.name}
              </div>
            </div>
          );
        })}
      </div>

      {/* Map Legend */}
      <div className="p-4 bg-muted-bg border-t border-border-base grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-bold text-muted-text">
        <div className="flex items-center space-x-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
          <span>Property Site</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-600"></div>
          <span>Mosque</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
          <span>Schools</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-600"></div>
          <span>Markets / Parks</span>
        </div>
      </div>
    </div>
  );
}
