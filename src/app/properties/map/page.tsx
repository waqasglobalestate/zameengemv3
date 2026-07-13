"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useAppState } from "@/context/AppStateContext";
import { 
  ChevronLeft, 
  Sliders, 
  Minimize2, 
  Sparkles, 
  Eye,
  Plus,
  Trash2,
  Navigation,
  Compass,
  Check
} from "lucide-react";

// 1. Static coordinates for properties
const PROPERTY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  "prop-1": { lat: 29.356, lng: 71.684 },
  "prop-2": { lat: 29.358, lng: 71.691 },
  "prop-3": { lat: 29.362, lng: 71.688 },
  "prop-4": { lat: 29.364, lng: 71.695 },
  "prop-5": { lat: 29.352, lng: 71.689 },
  "prop-6": { lat: 29.359, lng: 71.697 },
  "prop-7": { lat: 29.366, lng: 71.683 },
  "prop-8": { lat: 29.368, lng: 71.690 },
  "prop-9": { lat: 29.354, lng: 71.693 }
};

// Deterministic GPS coordinate generator for dynamic properties
const getPropertyCoordinates = (id: string) => {
  if (PROPERTY_COORDINATES[id]) return PROPERTY_COORDINATES[id];
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const latOffset = (Math.abs(hash % 100) / 100) * 0.016 - 0.008;
  const lngOffset = (Math.abs((hash >> 8) % 100) / 100) * 0.016 - 0.008;
  return {
    lat: 29.358 + latOffset,
    lng: 71.690 + lngOffset
  };
};

// 2. Points of Interest (POIs) Database
const POINTS_OF_INTEREST = [
  { id: "school-1", type: "School", name: "DHA Public School & College", lat: 29.355, lng: 71.685 },
  { id: "school-2", type: "School", name: "Army Public School (APS)", lat: 29.365, lng: 71.692 },
  { id: "hospital-1", type: "Hospital", name: "CMH Bahawalpur Clinic", lat: 29.360, lng: 71.690 },
  { id: "hospital-2", type: "Hospital", name: "DHA Care Centre", lat: 29.351, lng: 71.682 },
  { id: "mosque-1", type: "Mosque", name: "Jamia Mosque Sector A", lat: 29.357, lng: 71.686 },
  { id: "mosque-2", type: "Mosque", name: "Block B Mosque", lat: 29.363, lng: 71.694 },
  { id: "park-1", type: "Park", name: "DHA Sector Central Park", lat: 29.358, lng: 71.689 },
  { id: "park-2", type: "Park", name: "Community Theme Park", lat: 29.367, lng: 71.687 },
  { id: "comm-1", type: "Commercial", name: "Sector A Square Market", lat: 29.354, lng: 71.688 },
  { id: "comm-2", type: "Commercial", name: "DHA Broadway Boulevard", lat: 29.361, lng: 71.692 }
];

// Helper to calculate distance in meters
const getDistanceInMeters = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const dLat = (lat2 - lat1) * 111000;
  const dLng = (lng2 - lng1) * 111000 * Math.cos((lat1 * Math.PI) / 180);
  return Math.round(Math.sqrt(dLat * dLat + dLng * dLng));
};

// Coordinate boundary box mapping to SVG size
const MAP_WIDTH = 800;
const MAP_HEIGHT = 600;
const MIN_LAT = 29.350;
const MAX_LAT = 29.370;
const MIN_LNG = 71.680;
const MAX_LNG = 71.700;

const latToY = (lat: number) => MAP_HEIGHT - ((lat - MIN_LAT) / (MAX_LAT - MIN_LAT)) * MAP_HEIGHT;
const lngToX = (lng: number) => ((lng - MIN_LNG) / (MAX_LNG - MIN_LNG)) * MAP_WIDTH;

const yToLat = (y: number) => MAX_LAT - (y / MAP_HEIGHT) * (MAX_LAT - MIN_LAT);
const xToLng = (x: number) => MIN_LNG + (x / MAP_WIDTH) * (MAX_LNG - MIN_LNG);

// Point-in-polygon math checking for Draw Area Search
const isPointInPolygon = (point: [number, number], polygon: [number, number][]) => {
  const x = point[0], y = point[1];
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];
    const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
};

export default function InteractiveMapSearch() {
  const { properties } = useAppState();
  
  // Map View Settings
  const [mapMode, setMapMode] = useState<"roadmap" | "satellite">("roadmap");
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Map Tools Mode
  const [toolMode, setToolMode] = useState<"select" | "radius" | "draw">("select");
  
  // Radius Search State
  const [radiusCenter, setRadiusCenter] = useState<{ x: number; y: number } | null>(null);
  const [radiusSize, setRadiusSize] = useState(150); // pixels range
  
  // Draw Search Polygon Area State
  const [drawPolygon, setDrawPolygon] = useState<[number, number][]>([]);

  // POI Filters
  const [visiblePoiTypes, setVisiblePoiTypes] = useState<string[]>([
    "School", "Hospital", "Mosque", "Park", "Commercial"
  ]);

  // Selected Listing
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);

  // Reference to map container element for viewport boundary calculation
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Toggle POI Filters helper
  const togglePoiFilter = (type: string) => {
    if (visiblePoiTypes.includes(type)) {
      setVisiblePoiTypes(visiblePoiTypes.filter(t => t !== type));
    } else {
      setVisiblePoiTypes([...visiblePoiTypes, type]);
    }
  };


  // Calculate coordinates bounds currently visible based on zoom/pan
  const getMapViewportBoundaries = () => {
    // Top Left
    const xMin = -panX / zoom;
    const yMin = -panY / zoom;
    // Bottom Right
    const xMax = (MAP_WIDTH - panX) / zoom;
    const yMax = (MAP_HEIGHT - panY) / zoom;

    return {
      minLat: yToLat(yMax),
      maxLat: yToLat(yMin),
      minLng: xToLng(xMin),
      maxLng: xToLng(xMax)
    };
  };

  // Map mouse interactions
  const handleMapMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (toolMode !== "select") return;
    setIsPanning(true);
    setDragStart({ x: e.clientX - panX, y: e.clientY - panY });
  };

  const handleMapMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isPanning) {
      setPanX(e.clientX - dragStart.x);
      setPanY(e.clientY - dragStart.y);
    }
  };

  const handleMapMouseUp = () => {
    setIsPanning(false);
  };

  const handleMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!mapContainerRef.current) return;
    
    // Get local coordinate inside SVG
    const rect = mapContainerRef.current.getBoundingClientRect();
    const clickX = (e.clientX - rect.left - panX) / zoom;
    const clickY = (e.clientY - rect.top - panY) / zoom;

    if (toolMode === "radius") {
      setRadiusCenter({ x: clickX, y: clickY });
    } else if (toolMode === "draw") {
      setDrawPolygon([...drawPolygon, [clickX, clickY]]);
    }
  };

  // Zoom helpers
  const handleZoomIn = () => setZoom(z => Math.min(3, z + 0.25));
  const handleZoomOut = () => {
    setZoom(z => Math.max(0.75, z - 0.25));
    // Reset pan if zoom gets small
    if (zoom <= 1) {
      setPanX(0);
      setPanY(0);
    }
  };

  const handleClearFilters = () => {
    setRadiusCenter(null);
    setDrawPolygon([]);
    setToolMode("select");
  };

  // Filter listings based on map criteria
  const filteredProperties = properties.filter(p => {
    const coords = getPropertyCoordinates(p.id);
    const x = lngToX(coords.lng);
    const y = latToY(coords.lat);

    // 1. If Radius Search is active
    if (radiusCenter) {
      const dist = Math.sqrt(Math.pow(x - radiusCenter.x, 2) + Math.pow(y - radiusCenter.y, 2));
      if (dist > radiusSize / zoom) return false;
    }

    // 2. If Polygon Search is active
    if (drawPolygon.length >= 3) {
      if (!isPointInPolygon([x, y], drawPolygon)) return false;
    }

    // 3. Zoom search bounding box filter (automatic zoom viewport alignment)
    const bounds = getMapViewportBoundaries();
    const isInViewport = 
      coords.lat >= bounds.minLat && 
      coords.lat <= bounds.maxLat && 
      coords.lng >= bounds.minLng && 
      coords.lng <= bounds.maxLng;

    // Apply viewport bounds only if zoom is high (zoomed in) to represent zoom search
    if (zoom > 1.25 && !radiusCenter && drawPolygon.length < 3) {
      return isInViewport;
    }

    return true;
  });

  const selectedProperty = properties.find(p => p.id === selectedPropertyId);
  const selectedCoords = selectedProperty ? getPropertyCoordinates(selectedPropertyId!) : null;

  // Calculate nearby POIs to the selected property
  const nearbyPois = selectedCoords 
    ? POINTS_OF_INTEREST.map(poi => {
        const distance = getDistanceInMeters(selectedCoords.lat, selectedCoords.lng, poi.lat, poi.lng);
        // walking time: avg 80 meters per minute
        const walkTime = Math.round(distance / 80);
        return { ...poi, distance, walkTime };
      })
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5) // Show top 5 closest
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      
      {/* HEADER CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-base pb-5">
        <div className="flex items-center space-x-2.5">
          <Link
            href="/properties"
            className="p-2 border border-border-base hover:bg-muted-bg rounded-xl text-muted-text hover:text-foreground transition-colors shrink-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-foreground">Interactive Map Search</h1>
            <p className="text-xs text-muted-text mt-0.5">Explore properties around DHA Bahawalpur with custom radius & draw searches</p>
          </div>
        </div>

        {/* Info Count */}
        <span className="text-[10px] bg-gold/10 border border-gold/20 text-gold-accent px-3 py-1.5 rounded-xl font-bold uppercase tracking-wider block w-fit">
          Found {filteredProperties.length} properties in viewport
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: INTERACTIVE SVG MAP SEARCH CANVAS */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
          
          {/* MAP TOOLBAR LAYOUT */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-muted-bg/10 p-3 rounded-2xl border border-border-base glass text-xs">
            
            {/* Search Modes */}
            <div className="flex items-center space-x-1 bg-background dark:bg-slate-900 border border-border-base p-1 rounded-xl">
              {[
                { id: "select", name: "Navigate Map", icon: <Compass className="w-3.5 h-3.5" /> },
                { id: "radius", name: "Radius Circle", icon: <Sliders className="w-3.5 h-3.5" /> },
                { id: "draw", name: "Draw Search Area", icon: <Sparkles className="w-3.5 h-3.5" /> }
              ].map(mode => (
                <button
                  key={mode.id}
                  onClick={() => {
                    setToolMode(mode.id as typeof toolMode);
                    if (mode.id === "radius") setDrawPolygon([]);
                    if (mode.id === "draw") setRadiusCenter(null);
                  }}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                    toolMode === mode.id 
                      ? "bg-royal text-white dark:bg-white dark:text-royal" 
                      : "text-muted-text hover:bg-muted-bg"
                  }`}
                >
                  {mode.icon}
                  <span>{mode.name}</span>
                </button>
              ))}
            </div>

            {/* Satellite/Roadmap Switcher & Clear */}
            <div className="flex items-center space-x-2">
              {/* Clear button */}
              {(radiusCenter || drawPolygon.length > 0) && (
                <button
                  onClick={handleClearFilters}
                  className="flex items-center space-x-1 px-3 py-2 border border-dashed border-red-500/30 text-red-500 hover:bg-red-500/5 font-bold rounded-xl transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear Map Filter</span>
                </button>
              )}

              {/* View Switcher */}
              <div className="flex items-center space-x-1 bg-background dark:bg-slate-900 border border-border-base p-1 rounded-xl">
                <button
                  onClick={() => setMapMode("roadmap")}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    mapMode === "roadmap" 
                      ? "bg-royal text-white dark:bg-white dark:text-royal" 
                      : "text-muted-text hover:bg-muted-bg"
                  }`}
                >
                  Roadmap
                </button>
                <button
                  onClick={() => setMapMode("satellite")}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    mapMode === "satellite" 
                      ? "bg-royal text-white dark:bg-white dark:text-royal" 
                      : "text-muted-text hover:bg-muted-bg"
                  }`}
                >
                  Satellite
                </button>
              </div>
            </div>

          </div>

          {/* MAP CANVAS PANEL */}
          <div 
            ref={mapContainerRef}
            className="w-full h-[500px] border border-border-base rounded-3xl bg-slate-100 dark:bg-slate-950 overflow-hidden relative shadow-inner select-none"
            style={{ cursor: toolMode === "select" ? (isPanning ? "grabbing" : "grab") : "crosshair" }}
          >
            {/* SVG Canvas Map */}
            <svg 
              width="100%" 
              height="100%" 
              viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
              onMouseDown={handleMapMouseDown}
              onMouseMove={handleMapMouseMove}
              onMouseUp={handleMapMouseUp}
              onMouseLeave={handleMapMouseUp}
              onClick={handleMapClick}
              className="w-full h-full"
            >
              
              {/* GROUP MAP LAYER WITH PAN AND ZOOM */}
              <g transform={`translate(${panX}, ${panY}) scale(${zoom})`}>
                
                {/* 1. MAP BACKGROUND SURFACE */}
                <rect 
                  width={MAP_WIDTH} 
                  height={MAP_HEIGHT} 
                  className={mapMode === "roadmap" ? "fill-slate-100 dark:fill-slate-900" : "fill-emerald-950/20 dark:fill-emerald-950/5"} 
                />

                {/* SATELLITE PLOT GRID BACKGROUND */}
                {mapMode === "satellite" && (
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <rect width="40" height="40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                      <circle cx="20" cy="20" r="1.5" fill="rgba(255,255,255,0.06)" />
                    </pattern>
                  </defs>
                )}
                {mapMode === "satellite" && (
                  <rect width={MAP_WIDTH} height={MAP_HEIGHT} fill="url(#grid)" />
                )}

                {/* 2. SECTOR SECTIONS (Blocks A, B, C, D, E) */}
                {/* Sector A */}
                <path 
                  d="M 50 50 L 350 50 L 300 250 L 50 250 Z" 
                  className={mapMode === "roadmap" ? "fill-blue-500/5 stroke-blue-500/10" : "fill-blue-500/1 stroke-blue-500/5"}
                  strokeWidth="1"
                />
                <text x="180" y="150" className="fill-slate-400/80 text-[11px] font-black pointer-events-none select-none tracking-widest">SECTOR A</text>

                {/* Sector B */}
                <path 
                  d="M 350 50 L 750 50 L 750 250 L 300 250 Z" 
                  className={mapMode === "roadmap" ? "fill-purple-500/5 stroke-purple-500/10" : "fill-purple-500/1 stroke-purple-500/5"}
                  strokeWidth="1"
                />
                <text x="500" y="150" className="fill-slate-400/80 text-[11px] font-black pointer-events-none select-none tracking-widest">SECTOR B</text>

                {/* Sector C (Commercial Broadway Central) */}
                <circle 
                  cx="400" 
                  cy="300" 
                  r="95" 
                  className={mapMode === "roadmap" ? "fill-gold/5 stroke-gold/15" : "fill-gold/1 stroke-gold/5"}
                  strokeDasharray="4 4"
                />
                <text x="355" y="305" className="fill-gold/80 text-[9px] font-black pointer-events-none select-none tracking-widest">COMMERCIAL</text>

                {/* Sector D */}
                <path 
                  d="M 50 250 L 300 250 L 250 550 L 50 550 Z" 
                  className={mapMode === "roadmap" ? "fill-amber-500/5 stroke-amber-500/10" : "fill-amber-500/1 stroke-amber-500/5"}
                  strokeWidth="1"
                />
                <text x="150" y="420" className="fill-slate-400/80 text-[11px] font-black pointer-events-none select-none tracking-widest">SECTOR D</text>

                {/* Sector E */}
                <path 
                  d="M 300 250 L 750 250 L 750 550 L 250 550 Z" 
                  className={mapMode === "roadmap" ? "fill-emerald-500/5 stroke-emerald-500/10" : "fill-emerald-500/1 stroke-emerald-500/5"}
                  strokeWidth="1"
                />
                <text x="480" y="420" className="fill-slate-400/80 text-[11px] font-black pointer-events-none select-none tracking-widest">SECTOR E</text>

                {/* 3. ROAD NETWORKS */}
                {/* Main Boulevard */}
                <path 
                  d="M 50 250 L 750 250" 
                  className={mapMode === "roadmap" ? "stroke-white dark:stroke-slate-800" : "stroke-slate-800/80"} 
                  strokeWidth="14" 
                  fill="none" 
                />
                <path 
                  d="M 50 250 L 750 250" 
                  className="stroke-amber-400/50" 
                  strokeWidth="1" 
                  strokeDasharray="5 5" 
                  fill="none" 
                />
                <text x="80" y="244" className="fill-slate-400 text-[8px] font-bold pointer-events-none select-none tracking-widest uppercase">Main Boulevard (150 ft)</text>

                {/* Jinnah Avenue */}
                <path 
                  d="M 300 50 L 300 550" 
                  className={mapMode === "roadmap" ? "stroke-white dark:stroke-slate-800" : "stroke-slate-800/80"} 
                  strokeWidth="14" 
                  fill="none" 
                />
                <path 
                  d="M 300 50 L 300 550" 
                  className="stroke-amber-400/50" 
                  strokeWidth="1" 
                  strokeDasharray="5 5" 
                  fill="none" 
                />
                <text x="310" y="90" className="fill-slate-400 text-[8px] font-bold pointer-events-none select-none tracking-widest uppercase [writing-mode:vertical-lr]">Jinnah Avenue</text>

                {/* Ring Road Bypass */}
                <path 
                  d="M 50 50 L 750 50 L 750 550 L 50 550 Z" 
                  className={mapMode === "roadmap" ? "stroke-slate-200 dark:stroke-slate-800" : "stroke-slate-800/50"} 
                  strokeWidth="10" 
                  fill="none" 
                />

                {/* 4. DRAGGABLE/DRABBING RADIUS SEARCH COVER */}
                {radiusCenter && (
                  <g>
                    {/* Radius Circle Outer boundary */}
                    <circle
                      cx={radiusCenter.x}
                      cy={radiusCenter.y}
                      r={radiusSize / zoom}
                      className="fill-royal/10 stroke-royal/40"
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                    />
                    {/* Radius Center Point */}
                    <circle
                      cx={radiusCenter.x}
                      cy={radiusCenter.y}
                      r="4"
                      className="fill-royal animate-ping"
                    />
                    <circle
                      cx={radiusCenter.x}
                      cy={radiusCenter.y}
                      r="2.5"
                      className="fill-royal"
                    />
                  </g>
                )}

                {/* 5. DRAW SEARCH AREA POLYGON */}
                {drawPolygon.length > 0 && (
                  <g>
                    {/* Lines between points */}
                    {drawPolygon.map((pt, idx) => {
                      if (idx === 0) return null;
                      const prevPt = drawPolygon[idx - 1];
                      return (
                        <line
                          key={idx}
                          x1={prevPt[0]}
                          y1={prevPt[1]}
                          x2={pt[0]}
                          y2={pt[1]}
                          className="stroke-gold"
                          strokeWidth="2"
                        />
                      );
                    })}

                    {/* Closing line if more than 2 points */}
                    {drawPolygon.length >= 3 && (
                      <line
                        x1={drawPolygon[drawPolygon.length - 1][0]}
                        y1={drawPolygon[drawPolygon.length - 1][1]}
                        x2={drawPolygon[0][0]}
                        y2={drawPolygon[0][1]}
                        className="stroke-gold"
                        strokeWidth="2"
                        strokeDasharray="4 4"
                      />
                    )}

                    {/* Polygon shaded fill */}
                    {drawPolygon.length >= 3 && (
                      <polygon
                        points={drawPolygon.map(pt => pt.join(",")).join(" ")}
                        className="fill-gold/10"
                      />
                    )}

                    {/* Vertices handles */}
                    {drawPolygon.map((pt, idx) => (
                      <circle
                        key={idx}
                        cx={pt[0]}
                        cy={pt[1]}
                        r="3.5"
                        className="fill-gold stroke-white"
                        strokeWidth="1"
                      />
                    ))}
                  </g>
                )}

                {/* 6. STATIC POINTS OF INTEREST (POIs) */}
                {POINTS_OF_INTEREST.map(poi => {
                  if (!visiblePoiTypes.includes(poi.type)) return null;

                  const x = lngToX(poi.lng);
                  const y = latToY(poi.lat);

                  const getPoiColor = (type: string) => {
                    if (type === "School") return "fill-orange-500";
                    if (type === "Hospital") return "fill-red-500";
                    if (type === "Mosque") return "fill-cyan-500";
                    if (type === "Park") return "fill-emerald-500";
                    return "fill-amber-500"; // Commercial
                  };

                  return (
                    <g key={poi.id} className="cursor-help">
                      <circle
                        cx={x}
                        cy={y}
                        r="5"
                        className={`${getPoiColor(poi.type)} stroke-white`}
                        strokeWidth="1"
                      />
                      <title>{poi.name} ({poi.type})</title>
                    </g>
                  );
                })}

                {/* Dotted lines to closest POIs when a listing is clicked */}
                {selectedCoords && nearbyPois.length > 0 && (
                  <g>
                    {nearbyPois.map(poi => {
                      if (!visiblePoiTypes.includes(poi.type)) return null;
                      const x1 = lngToX(selectedCoords.lng);
                      const y1 = latToY(selectedCoords.lat);
                      const x2 = lngToX(poi.lng);
                      const y2 = latToY(poi.lat);
                      
                      return (
                        <line
                          key={poi.id}
                          x1={x1}
                          y1={y1}
                          x2={x2}
                          y2={y2}
                          className="stroke-royal/40 dark:stroke-white/30"
                          strokeWidth="1.2"
                          strokeDasharray="4 4"
                        />
                      );
                    })}
                  </g>
                )}

                {/* 7. PROPERTY PINS */}
                {filteredProperties.map(prop => {
                  const coords = getPropertyCoordinates(prop.id);
                  const x = lngToX(coords.lng);
                  const y = latToY(coords.lat);
                  const isSelected = selectedPropertyId === prop.id;

                  return (
                    <g 
                      key={prop.id} 
                      className="cursor-pointer group"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPropertyId(prop.id);
                      }}
                    >
                      {/* Outer pulse circle if selected */}
                      {isSelected && (
                        <circle
                          cx={x}
                          cy={y}
                          r="15"
                          className="fill-gold/20 stroke-gold/40 animate-pulse"
                          strokeWidth="1"
                        />
                      )}

                      {/* Map Pin outline */}
                      <circle
                        cx={x}
                        cy={y}
                        r={isSelected ? "7" : "5.5"}
                        className={`transition-all duration-300 stroke-white ${
                          isSelected ? "fill-gold" : "fill-royal dark:fill-white dark:stroke-slate-900"
                        }`}
                        strokeWidth="1.5"
                      />

                      {/* Floating Price label tag (only at moderate zoom) */}
                      {zoom >= 1.25 && (
                        <g transform={`translate(${x}, ${y - 12})`}>
                          <rect
                            x="-16"
                            y="-9"
                            width="32"
                            height="12"
                            rx="3"
                            className={`stroke-border-base fill-background shadow ${
                              isSelected ? "stroke-gold/80 fill-gold/10" : ""
                            }`}
                            strokeWidth="1"
                          />
                          <text
                            x="0"
                            y="0"
                            className="fill-foreground text-[7px] font-black text-center"
                            textAnchor="middle"
                          >
                            {(prop.price / 100000).toFixed(0)}L
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}

              </g>
            </svg>

            {/* FLOATING MAP NAVIGATION CONTROLS */}
            <div className="absolute bottom-5 right-5 z-20 flex flex-col space-y-2">
              <button 
                onClick={handleZoomIn}
                className="w-9 h-9 bg-background/90 hover:bg-background border border-border-base rounded-xl flex items-center justify-center font-bold text-foreground hover:scale-105 active:scale-95 transition-all shadow-md"
                title="Zoom In"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button 
                onClick={handleZoomOut}
                className="w-9 h-9 bg-background/90 hover:bg-background border border-border-base rounded-xl flex items-center justify-center font-bold text-foreground hover:scale-105 active:scale-95 transition-all shadow-md"
                title="Zoom Out"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>

            {/* FLOATING DRAW INSTRUCTION PANEL */}
            {toolMode !== "select" && (
              <div className="absolute top-5 left-5 z-20 bg-background/95 border border-border-base rounded-2xl p-3.5 shadow-xl text-[10px] max-w-[240px] leading-relaxed glass">
                {toolMode === "radius" ? (
                  <div className="space-y-2">
                    <span className="font-black text-foreground block">Radius Search Mode</span>
                    <p className="text-muted-text">Click anywhere on the map to define the query center. Set the search filter range below:</p>
                    <div className="space-y-1 pt-1.5 border-t border-border-base/50">
                      <div className="flex justify-between text-muted-text font-bold">
                        <span>Search radius:</span>
                        <span className="text-gold">~{Math.round(radiusSize * 2.5)} meters</span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="350"
                        value={radiusSize}
                        onChange={e => setRadiusSize(parseInt(e.target.value))}
                        className="w-full h-1 bg-muted-bg rounded appearance-none accent-gold cursor-pointer"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <span className="font-black text-foreground block">Polygon Draw Search</span>
                    <p className="text-muted-text">Click multiple coordinates on the map to draw boundaries. Join 3 or more points to automatically filter listings inside the highlighted polygon.</p>
                  </div>
                )}
              </div>
            )}

            {/* MAP VIEW SCALE INDICATOR */}
            <div className="absolute bottom-5 left-5 z-20 bg-background/70 backdrop-blur px-2.5 py-1 border border-border-base rounded text-[8px] font-bold text-muted-text flex items-center space-x-1.5 shadow-sm">
              <span className="w-8 h-1 border-x border-b border-muted-text inline-block" />
              <span>500 meters</span>
            </div>

          </div>

          {/* POINTS OF INTEREST CONTROL PANEL */}
          <div className="bg-background border border-border-base rounded-2xl p-4 shadow-sm space-y-3">
            <h4 className="text-[10px] font-black uppercase tracking-wider text-muted-text">Toggle Map Points of Interest (POIs)</h4>
            <div className="flex flex-wrap gap-2.5">
              {[
                { id: "School", color: "bg-orange-500", name: "Schools" },
                { id: "Hospital", color: "bg-red-500", name: "Hospitals" },
                { id: "Mosque", color: "bg-cyan-500", name: "Mosques" },
                { id: "Park", color: "bg-emerald-500", name: "Parks" },
                { id: "Commercial", color: "bg-amber-500", name: "Commercial Zones" }
              ].map(poi => {
                const isActive = visiblePoiTypes.includes(poi.id);
                return (
                  <button
                    key={poi.id}
                    onClick={() => togglePoiFilter(poi.id)}
                    className={`flex items-center space-x-2 px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                      isActive 
                        ? "bg-muted-bg border-gold/45 text-foreground" 
                        : "border-border-base text-muted-text hover:bg-muted-bg/50"
                    }`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${poi.color} ${isActive ? "" : "opacity-40"}`} />
                    <span>{poi.name}</span>
                    {isActive && <Check className="w-3 h-3 text-gold ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: PROPERTY DETAIL OVERVIEW & SIDEBAR */}
        <div className="lg:col-span-4 flex flex-col space-y-6">
          
          {/* 1. SECTOR MAP SEARCH INDEX */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Properties in Current Query ({filteredProperties.length})</h3>
            
            {/* List scrollbox */}
            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1.5 scrollbar-thin">
              {filteredProperties.length === 0 ? (
                <p className="text-xs text-muted-text italic border border-dashed border-border-base rounded-2xl p-8 text-center bg-background/50">
                  No properties match your map boundaries or drawing criteria.
                </p>
              ) : (
                filteredProperties.map(prop => {
                  const isSelected = selectedPropertyId === prop.id;
                  return (
                    <div
                      key={prop.id}
                      onClick={() => setSelectedPropertyId(prop.id)}
                      className={`p-3.5 border rounded-2xl cursor-pointer transition-all flex space-x-3 items-center ${
                        isSelected 
                          ? "bg-gold/5 border-gold shadow-sm" 
                          : "border-border-base bg-background hover:bg-muted-bg/35"
                      }`}
                    >
                      {/* Image Thumbnail */}
                      <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-border-base">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={prop.images[0]} 
                          alt={prop.title} 
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Info details */}
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <h4 className="font-bold text-xs text-foreground truncate group-hover:text-gold transition-colors">{prop.title}</h4>
                        <p className="text-[10px] text-muted-text truncate">{prop.location} | {prop.size}</p>
                        <p className="text-xs font-black text-gold mt-1">PKR {(prop.price / 100000).toFixed(0)} Lakh</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* 2. SELECTED PROPERTY & NEARBY POIs OVERVIEW */}
          {selectedProperty && (
            <div className="border border-border-base rounded-3xl p-5 bg-background/50 glass space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
              
              <div>
                <span className="text-[9px] font-black uppercase text-gold">Selected Listing</span>
                <h3 className="font-bold text-sm text-foreground mt-0.5">{selectedProperty.title}</h3>
                <p className="text-xs font-black text-gold mt-1">PKR {(selectedProperty.price / 100000).toFixed(0)} Lakh</p>
              </div>

              {/* Nearest Facilities Timeline */}
              <div className="space-y-3 pt-3.5 border-t border-border-base/50">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-muted-text flex items-center space-x-1">
                  <Navigation className="w-3.5 h-3.5 text-gold" />
                  <span>Nearby Infrastructure Points</span>
                </h4>

                <div className="space-y-3 pt-1">
                  {nearbyPois.map(poi => {
                    const getPoiIconColor = (type: string) => {
                      if (type === "School") return "text-orange-500 bg-orange-500/10";
                      if (type === "Hospital") return "text-red-500 bg-red-500/10";
                      if (type === "Mosque") return "text-cyan-500 bg-cyan-500/10";
                      if (type === "Park") return "text-emerald-500 bg-emerald-500/10";
                      return "text-amber-500 bg-amber-500/10"; // Commercial
                    };

                    return (
                      <div key={poi.id} className="flex justify-between items-center text-xs">
                        <div className="flex items-center space-x-2">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${getPoiIconColor(poi.type)}`}>
                            {poi.type[0]}
                          </span>
                          <div>
                            <span className="font-bold text-foreground block leading-tight">{poi.name}</span>
                            <span className="text-[9px] text-muted-text">{poi.type}</span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="font-bold text-foreground block">{poi.distance}m</span>
                          <span className="text-[9px] text-muted-text">~{poi.walkTime} min walk</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* View details CTA button */}
              <Link
                href={`/properties/${selectedProperty.id}`}
                className="w-full bg-royal hover:bg-royal-hover text-white dark:bg-white dark:text-royal dark:hover:bg-white/90 text-xs font-bold py-2.5 rounded-xl flex items-center justify-center space-x-1.5 transition-all shadow-sm"
              >
                <Eye className="w-4 h-4" />
                <span>View Full Listing Details</span>
              </Link>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
