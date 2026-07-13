"use client";

import React, { useState } from "react";
import { Compass, CheckCircle2, AlertCircle, TrendingUp } from "lucide-react";

interface SectorMapProps {
  onSectorSelect?: (sector: string) => void;
  selectedSector?: string;
}

interface SectorInfo {
  id: string;
  name: string;
  development: number; // percentage
  status: "Possession Ready" | "Under Development" | "Planning Phase";
  averagePrice: string;
  sizes: string[];
  description: string;
}

export default function SectorMap({ onSectorSelect, selectedSector }: SectorMapProps) {
  const [hoveredSector, setHoveredSector] = useState<SectorInfo | null>(null);

  const sectorsData: Record<string, SectorInfo> = {
    "Sector A": {
      id: "sec-a",
      name: "Sector A",
      development: 100,
      status: "Possession Ready",
      averagePrice: "85 Lakhs - 95 Lakhs",
      sizes: ["10 Marla", "1 Kanal"],
      description: "Directly located near the entrance. High-end developments with 100% operational utilities, parks, and schools."
    },
    "Sector B": {
      id: "sec-b",
      name: "Sector B",
      development: 100,
      status: "Possession Ready",
      averagePrice: "75 Lakhs - 3.8 Crore",
      sizes: ["10 Marla", "1 Kanal (Villas)"],
      description: "Home to the luxury DHA villas project. Modern infrastructure and community center are fully built."
    },
    "Sector C": {
      id: "sec-c",
      name: "Sector C",
      development: 85,
      status: "Possession Ready",
      averagePrice: "70 Lakhs - 1.9 Crore",
      sizes: ["5 Marla (Commercial)", "10 Marla", "1 Kanal"],
      description: "Central commercial hub. High density development with massive business plaza potential and parks."
    },
    "Sector D": {
      id: "sec-d",
      name: "Sector D",
      development: 70,
      status: "Under Development",
      averagePrice: "55 Lakhs - 90 Lakhs",
      sizes: ["10 Marla", "1 Kanal"],
      description: "High appreciation potential. Leveling and paving work is ongoing. Possession expected by Q4 2026."
    },
    "Sector E": {
      id: "sec-e",
      name: "Sector E",
      development: 40,
      status: "Under Development",
      averagePrice: "45 Lakhs - 65 Lakhs",
      sizes: ["10 Marla", "1 Kanal"],
      description: "Great for medium-term investments. Convenient access routes linked to the Southern Bypass road."
    },
    "Sector F": {
      id: "sec-f",
      name: "Sector F",
      development: 20,
      status: "Planning Phase",
      averagePrice: "35 Lakhs - 50 Lakhs",
      sizes: ["5 Marla", "10 Marla"],
      description: "Highly budget-friendly entry price. Ideal for long-term land bank investors."
    }
  };

  const handleSectorClick = (sectorName: string) => {
    if (onSectorSelect) {
      // Toggle selection
      if (selectedSector === sectorName) {
        onSectorSelect("");
      } else {
        onSectorSelect(sectorName);
      }
    }
  };

  const currentActive = hoveredSector || (selectedSector ? sectorsData[selectedSector] : null) || sectorsData["Sector A"];

  return (
    <div className="rounded-2xl border border-border-base bg-background/50 p-6 glass flex flex-col lg:flex-row gap-6">
      {/* SVG Interactive Map Container */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <Compass className="w-5 h-5 text-gold animate-spin-slow" />
            <h3 className="text-lg font-bold text-foreground">DHA Bahawalpur Interactive Sector Map</h3>
          </div>
          <p className="text-xs text-muted-text mb-4">
            Click on any sector in the blueprint layout to filter active property listings or hover to view sector development statistics.
          </p>
        </div>

        {/* SVG Drawing */}
        <div className="relative aspect-[4/3] w-full max-w-md mx-auto bg-slate-900/10 dark:bg-slate-950/40 rounded-xl border border-border-base overflow-hidden flex items-center justify-center p-4">
          <svg
            viewBox="0 0 400 300"
            className="w-full h-full select-none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Background grids */}
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-border-base/10" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Main Road Loop */}
            <path
              d="M 50 150 C 50 50, 350 50, 350 150 C 350 250, 50 250, 50 150 Z"
              fill="none"
              stroke="#c5a85c"
              strokeWidth="12"
              strokeLinecap="round"
              opacity="0.15"
            />
            {/* Main Boulevard Inner line */}
            <path
              d="M 50 150 C 50 50, 350 50, 350 150 C 350 250, 50 250, 50 150 Z"
              fill="none"
              stroke="#c5a85c"
              strokeWidth="2"
              strokeDasharray="4 4"
              opacity="0.5"
            />

            {/* Sector A */}
            <g
              className="cursor-pointer transition-all duration-200"
              onClick={() => handleSectorClick("Sector A")}
              onMouseEnter={() => setHoveredSector(sectorsData["Sector A"])}
              onMouseLeave={() => setHoveredSector(null)}
            >
              <polygon
                points="70,60 180,50 170,120 75,130"
                fill={selectedSector === "Sector A" ? "#c5a85c" : "#0f172a"}
                fillOpacity={selectedSector === "Sector A" ? "0.8" : "0.15"}
                stroke="#c5a85c"
                strokeWidth="2"
                className="hover:fill-gold hover:fill-opacity-50 dark:hover:fill-gold dark:hover:fill-opacity-40"
              />
              <text x="120" y="95" fill="currentColor" className="text-xs font-bold text-foreground text-center pointer-events-none fill-foreground dark:fill-white">
                Sector A
              </text>
            </g>

            {/* Sector B */}
            <g
              className="cursor-pointer transition-all duration-200"
              onClick={() => handleSectorClick("Sector B")}
              onMouseEnter={() => setHoveredSector(sectorsData["Sector B"])}
              onMouseLeave={() => setHoveredSector(null)}
            >
              <polygon
                points="180,50 330,60 320,130 170,120"
                fill={selectedSector === "Sector B" ? "#c5a85c" : "#0f172a"}
                fillOpacity={selectedSector === "Sector B" ? "0.8" : "0.15"}
                stroke="#c5a85c"
                strokeWidth="2"
                className="hover:fill-gold hover:fill-opacity-50 dark:hover:fill-gold dark:hover:fill-opacity-40"
              />
              <text x="240" y="95" fill="currentColor" className="text-xs font-bold text-foreground pointer-events-none fill-foreground dark:fill-white">
                Sector B
              </text>
            </g>

            {/* Sector C (Center) */}
            <g
              className="cursor-pointer transition-all duration-200"
              onClick={() => handleSectorClick("Sector C")}
              onMouseEnter={() => setHoveredSector(sectorsData["Sector C"])}
              onMouseLeave={() => setHoveredSector(null)}
            >
              <circle
                cx="200"
                cy="170"
                r="38"
                fill={selectedSector === "Sector C" ? "#c5a85c" : "#0f172a"}
                fillOpacity={selectedSector === "Sector C" ? "0.8" : "0.15"}
                stroke="#c5a85c"
                strokeWidth="2"
                className="hover:fill-gold hover:fill-opacity-50 dark:hover:fill-gold dark:hover:fill-opacity-40"
              />
              <text x="200" y="174" textAnchor="middle" fill="currentColor" className="text-[10px] font-extrabold text-foreground pointer-events-none fill-foreground dark:fill-white">
                Sector C
              </text>
            </g>

            {/* Sector D */}
            <g
              className="cursor-pointer transition-all duration-200"
              onClick={() => handleSectorClick("Sector D")}
              onMouseEnter={() => setHoveredSector(sectorsData["Sector D"])}
              onMouseLeave={() => setHoveredSector(null)}
            >
              <polygon
                points="75,130 160,135 150,230 65,210"
                fill={selectedSector === "Sector D" ? "#c5a85c" : "#0f172a"}
                fillOpacity={selectedSector === "Sector D" ? "0.8" : "0.15"}
                stroke="#c5a85c"
                strokeWidth="2"
                className="hover:fill-gold hover:fill-opacity-50 dark:hover:fill-gold dark:hover:fill-opacity-40"
              />
              <text x="105" y="180" fill="currentColor" className="text-xs font-bold text-foreground pointer-events-none fill-foreground dark:fill-white">
                Sector D
              </text>
            </g>

            {/* Sector E */}
            <g
              className="cursor-pointer transition-all duration-200"
              onClick={() => handleSectorClick("Sector E")}
              onMouseEnter={() => setHoveredSector(sectorsData["Sector E"])}
              onMouseLeave={() => setHoveredSector(null)}
            >
              <polygon
                points="240,140 320,130 330,210 250,230"
                fill={selectedSector === "Sector E" ? "#c5a85c" : "#0f172a"}
                fillOpacity={selectedSector === "Sector E" ? "0.8" : "0.15"}
                stroke="#c5a85c"
                strokeWidth="2"
                className="hover:fill-gold hover:fill-opacity-50 dark:hover:fill-gold dark:hover:fill-opacity-40"
              />
              <text x="275" y="180" fill="currentColor" className="text-xs font-bold text-foreground pointer-events-none fill-foreground dark:fill-white">
                Sector E
              </text>
            </g>

            {/* Sector F */}
            <g
              className="cursor-pointer transition-all duration-200"
              onClick={() => handleSectorClick("Sector F")}
              onMouseEnter={() => setHoveredSector(sectorsData["Sector F"])}
              onMouseLeave={() => setHoveredSector(null)}
            >
              <polygon
                points="150,230 250,230 240,280 160,280"
                fill={selectedSector === "Sector F" ? "#c5a85c" : "#0f172a"}
                fillOpacity={selectedSector === "Sector F" ? "0.8" : "0.15"}
                stroke="#c5a85c"
                strokeWidth="2"
                className="hover:fill-gold hover:fill-opacity-50 dark:hover:fill-gold dark:hover:fill-opacity-40"
              />
              <text x="190" y="260" fill="currentColor" className="text-xs font-bold text-foreground pointer-events-none fill-foreground dark:fill-white">
                Sector F
              </text>
            </g>
          </svg>

          {selectedSector && (
            <div className="absolute bottom-2 left-2 bg-royal text-white text-[10px] px-2 py-1 rounded font-bold">
              Filtering: {selectedSector} (Click map again to clear)
            </div>
          )}
        </div>
      </div>

      {/* Sector Live Status Display */}
      {currentActive && (
        <div className="w-full lg:w-72 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-border-base pt-6 lg:pt-0 lg:pl-6">
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <h4 className="text-xl font-extrabold text-foreground">{currentActive.name}</h4>
                <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                  currentActive.status === "Possession Ready" 
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                    : currentActive.status === "Under Development" 
                      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" 
                      : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                }`}>
                  {currentActive.status}
                </span>
              </div>
              <p className="text-xs text-muted-text mt-1">{currentActive.description}</p>
            </div>

            <hr className="border-border-base" />

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-text">Average Price</p>
                <p className="font-extrabold text-royal dark:text-white mt-0.5">{currentActive.averagePrice}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-text">Plot Sizes</p>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {currentActive.sizes.map(s => (
                    <span key={s} className="bg-muted-bg border border-border-base rounded px-1.5 py-0.5 text-[9px] font-bold">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs font-bold text-muted-text mb-1">
                <span>Development Completion</span>
                <span>{currentActive.development}%</span>
              </div>
              <div className="h-2 w-full bg-muted-bg rounded-full overflow-hidden border border-border-base">
                <div
                  className="h-full bg-gold transition-all duration-500"
                  style={{ width: `${currentActive.development}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-border-base space-y-2.5">
            <div className="flex items-center space-x-2 text-xs text-muted-text">
              {currentActive.status === "Possession Ready" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
              )}
              <span>
                {currentActive.status === "Possession Ready" 
                  ? "Construction allowed immediately" 
                  : "Excellent capital appreciation potential"}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-muted-text">
              <TrendingUp className="w-4 h-4 text-gold shrink-0" />
              <span>Stable resale & trade volume</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
