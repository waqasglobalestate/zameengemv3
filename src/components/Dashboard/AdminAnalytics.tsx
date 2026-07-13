"use client";

import React, { useState } from "react";
import { useAppState } from "@/context/AppStateContext";
import { TrendingUp, Users, Mail, Percent, DollarSign, Activity } from "lucide-react";

interface DataPoint {
  label: string;
  value: number;
}

export default function AdminAnalytics() {
  const { leads, properties } = useAppState();
  
  // Interactive states for tooltips
  const [activeRevIndex, setActiveRevIndex] = useState<number | null>(null);
  const [activeTrafficIndex, setActiveTrafficIndex] = useState<number | null>(null);

  // Revenue mock data (PKR in Lakhs, e.g. 150 = 1.5 Crore)
  const revenueData: DataPoint[] = [
    { label: "Jan", value: 120 },
    { label: "Feb", value: 180 },
    { label: "Mar", value: 155 },
    { label: "Apr", value: 290 },
    { label: "May", value: 340 },
    { label: "Jun", value: 485 }
  ];

  // Web traffic mock data (Unique Visitors)
  const trafficData: DataPoint[] = [
    { label: "Mon", value: 12400 },
    { label: "Tue", value: 14200 },
    { label: "Wed", value: 13900 },
    { label: "Thu", value: 16800 },
    { label: "Fri", value: 15500 },
    { label: "Sat", value: 18900 },
    { label: "Sun", value: 20100 }
  ];

  // Lead Conversion channel calculations
  const totalLeadsCount = leads.length || 1;
  const propertyInquiryCount = leads.filter(l => l.source === "Property Inquiry").length;
  const calculatorCount = leads.filter(l => l.source === "Calculator Forms").length;
  const contactCount = leads.filter(l => l.source === "Contact Forms").length;
  const whatsappCount = leads.filter(l => l.source === "WhatsApp Clicks").length;
  const closedDealsCount = leads.filter(l => l.status === "Closed").length;

  const conversionRate = ((closedDealsCount / totalLeadsCount) * 100).toFixed(1);

  // SVG Dimension mappings
  const svgWidth = 500;
  const svgHeight = 220;
  const paddingX = 50;
  const paddingY = 30;

  // Helper to generate Area Chart path
  const getAreaPath = (data: DataPoint[]) => {
    if (data.length === 0) return { line: "", area: "", points: [] };
    const minVal = Math.min(...data.map(d => d.value)) * 0.9;
    const maxVal = Math.max(...data.map(d => d.value)) * 1.1;
    
    const points = data.map((d, i) => {
      const x = paddingX + (i / (data.length - 1)) * (svgWidth - paddingX * 2);
      const y = svgHeight - paddingY - ((d.value - minVal) / (maxVal - minVal)) * (svgHeight - paddingY * 2);
      return { x, y };
    });

    const pathLine = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
    const pathArea = `${pathLine} L ${points[points.length - 1].x} ${svgHeight - paddingY} L ${points[0].x} ${svgHeight - paddingY} Z`;
    
    return { line: pathLine, area: pathArea, points };
  };

  const revChart = getAreaPath(revenueData);
  const trafficChart = getAreaPath(trafficData);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Revenue */}
        <div className="rounded-2xl border border-border-base p-5 bg-background/50 glass relative overflow-hidden group hover:border-gold/50 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gold/5 rounded-full blur-2xl group-hover:bg-gold/10 transition-colors" />
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-text">Platform Revenue</span>
              <h4 className="text-2xl font-black text-foreground mt-1">PKR 4.85 Crore</h4>
              <p className="text-[10px] text-emerald-500 font-bold flex items-center mt-2">
                <TrendingUp className="w-3.5 h-3.5 mr-1" />
                <span>+12.4% MoM Growth</span>
              </p>
            </div>
            <div className="p-3 rounded-xl bg-gold/10 border border-gold/20 text-gold">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Card 2: Traffic */}
        <div className="rounded-2xl border border-border-base p-5 bg-background/50 glass relative overflow-hidden group hover:border-royal/50 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-royal/5 rounded-full blur-2xl group-hover:bg-royal/10 transition-colors" />
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-text">Total Visitors</span>
              <h4 className="text-2xl font-black text-foreground mt-1">85,420</h4>
              <p className="text-[10px] text-emerald-500 font-bold flex items-center mt-2">
                <TrendingUp className="w-3.5 h-3.5 mr-1" />
                <span>+8.2% Weekly Rise</span>
              </p>
            </div>
            <div className="p-3 rounded-xl bg-royal/10 border border-royal/20 text-royal dark:text-cyan-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Card 3: Leads */}
        <div className="rounded-2xl border border-border-base p-5 bg-background/50 glass relative overflow-hidden group hover:border-emerald-500/50 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors" />
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-text">Captured Leads</span>
              <h4 className="text-2xl font-black text-foreground mt-1">{leads.length}</h4>
              <p className="text-[10px] text-emerald-500 font-bold flex items-center mt-2">
                <TrendingUp className="w-3.5 h-3.5 mr-1" />
                <span>+18.5% Conversion Flow</span>
              </p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
              <Mail className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Card 4: Conversions */}
        <div className="rounded-2xl border border-border-base p-5 bg-background/50 glass relative overflow-hidden group hover:border-purple-500/50 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-colors" />
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-text">Lead-to-Deal Rate</span>
              <h4 className="text-2xl font-black text-foreground mt-1">{conversionRate}%</h4>
              <p className="text-[10px] text-emerald-500 font-bold flex items-center mt-2">
                <TrendingUp className="w-3.5 h-3.5 mr-1" />
                <span>+2.1% Deal Velocity</span>
              </p>
            </div>
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-500">
              <Percent className="w-5 h-5" />
            </div>
          </div>
        </div>

      </div>

      {/* Interactive Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Chart 1: Revenue growth Area Chart */}
        <div className="rounded-2xl border border-border-base p-6 bg-background/50 glass space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-black text-foreground flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-gold inline-block animate-ping" />
                <span>Revenue Performance (PKR Lakhs)</span>
              </h3>
              <p className="text-[10px] text-muted-text mt-0.5">Interactive Area coordinates representation</p>
            </div>
            <span className="px-2.5 py-1 rounded bg-gold/10 border border-gold/20 text-[10px] font-extrabold text-gold">
              Monthly Growth
            </span>
          </div>

          <div className="relative w-full overflow-hidden">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-64 overflow-visible">
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#eab308" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#eab308" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              
              {/* Grid Lines */}
              <line x1={paddingX} y1={paddingY} x2={svgWidth - paddingX} y2={paddingY} stroke="currentColor" className="text-border-base/30" strokeDasharray="4 4" />
              <line x1={paddingX} y1={svgHeight / 2} x2={svgWidth - paddingX} y2={svgHeight / 2} stroke="currentColor" className="text-border-base/30" strokeDasharray="4 4" />
              <line x1={paddingX} y1={svgHeight - paddingY} x2={svgWidth - paddingX} y2={svgHeight - paddingY} stroke="currentColor" className="text-border-base/60" />

              {/* Shaded Area */}
              <path d={revChart.area} fill="url(#revGrad)" />
              
              {/* Path Line */}
              <path d={revChart.line} fill="none" stroke="#eab308" strokeWidth="3" strokeLinecap="round" />

              {/* Interaction Data Nodes */}
              {revChart.points.map((p, i) => (
                <g key={i} className="cursor-pointer">
                  {/* Axis Label */}
                  <text
                    x={p.x}
                    y={svgHeight - 10}
                    textAnchor="middle"
                    className="text-[9px] font-extrabold fill-muted-text uppercase"
                  >
                    {revenueData[i].label}
                  </text>
                  
                  {/* Outer circle glow */}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={activeRevIndex === i ? 7 : 4}
                    fill="#eab308"
                    className="transition-all duration-200"
                    onMouseEnter={() => setActiveRevIndex(i)}
                    onMouseLeave={() => setActiveRevIndex(null)}
                  />
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={activeRevIndex === i ? 12 : 0}
                    fill="none"
                    stroke="#eab308"
                    strokeWidth="1.5"
                    strokeOpacity="0.5"
                    className="transition-all duration-200 pointer-events-none"
                  />
                </g>
              ))}
            </svg>

            {/* Floating Info Tooltip */}
            {activeRevIndex !== null && (
              <div
                className="absolute bg-slate-900 border border-gold/30 text-white rounded-xl px-3 py-2 text-[10px] font-black shadow-xl pointer-events-none transition-all duration-150 glass"
                style={{
                  left: `${(revChart.points[activeRevIndex].x / svgWidth) * 100}%`,
                  top: `${(revChart.points[activeRevIndex].y / svgHeight) * 100 - 18}%`,
                  transform: "translateX(-50%) translateY(-100%)"
                }}
              >
                <span className="block text-[8px] text-slate-400 font-bold uppercase tracking-wider">
                  {revenueData[activeRevIndex].label} Demand
                </span>
                <span className="text-gold text-xs">PKR {revenueData[activeRevIndex].value} Lakhs</span>
              </div>
            )}
          </div>
        </div>

        {/* Chart 2: Web Traffic Line Chart */}
        <div className="rounded-2xl border border-border-base p-6 bg-background/50 glass space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-black text-foreground flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-royal inline-block animate-pulse" />
                <span>Web Traffic (Unique Hits)</span>
              </h3>
              <p className="text-[10px] text-muted-text mt-0.5">Line vector mapping over last 7 days</p>
            </div>
            <span className="px-2.5 py-1 rounded bg-royal/10 border border-royal/20 text-[10px] font-extrabold text-royal dark:text-cyan-400">
              Live Audits
            </span>
          </div>

          <div className="relative w-full overflow-hidden">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-64 overflow-visible">
              <defs>
                <linearGradient id="trafficGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              
              {/* Grid Lines */}
              <line x1={paddingX} y1={paddingY} x2={svgWidth - paddingX} y2={paddingY} stroke="currentColor" className="text-border-base/30" strokeDasharray="4 4" />
              <line x1={paddingX} y1={svgHeight / 2} x2={svgWidth - paddingX} y2={svgHeight / 2} stroke="currentColor" className="text-border-base/30" strokeDasharray="4 4" />
              <line x1={paddingX} y1={svgHeight - paddingY} x2={svgWidth - paddingX} y2={svgHeight - paddingY} stroke="currentColor" className="text-border-base/60" />

              {/* Shaded Area under path */}
              <path d={trafficChart.area} fill="url(#trafficGrad)" />
              
              {/* Path Line */}
              <path d={trafficChart.line} fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" />

              {/* Interaction Data Nodes */}
              {trafficChart.points.map((p, i) => (
                <g key={i} className="cursor-pointer">
                  {/* Axis Label */}
                  <text
                    x={p.x}
                    y={svgHeight - 10}
                    textAnchor="middle"
                    className="text-[9px] font-extrabold fill-muted-text uppercase"
                  >
                    {trafficData[i].label}
                  </text>
                  
                  {/* Interactive circle */}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={activeTrafficIndex === i ? 7 : 4}
                    fill="#2563eb"
                    className="transition-all duration-200"
                    onMouseEnter={() => setActiveTrafficIndex(i)}
                    onMouseLeave={() => setActiveTrafficIndex(null)}
                  />
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={activeTrafficIndex === i ? 12 : 0}
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="1.5"
                    strokeOpacity="0.5"
                    className="transition-all duration-200 pointer-events-none"
                  />
                </g>
              ))}
            </svg>

            {/* Floating Info Tooltip */}
            {activeTrafficIndex !== null && (
              <div
                className="absolute bg-slate-900 border border-royal/30 text-white rounded-xl px-3 py-2 text-[10px] font-black shadow-xl pointer-events-none transition-all duration-150 glass"
                style={{
                  left: `${(trafficChart.points[activeTrafficIndex].x / svgWidth) * 100}%`,
                  top: `${(trafficChart.points[activeTrafficIndex].y / svgHeight) * 100 - 18}%`,
                  transform: "translateX(-50%) translateY(-100%)"
                }}
              >
                <span className="block text-[8px] text-slate-400 font-bold uppercase tracking-wider">
                  {trafficData[activeTrafficIndex].label} Visitors
                </span>
                <span className="text-royal dark:text-cyan-400 text-xs">
                  {trafficData[activeTrafficIndex].value.toLocaleString()} UVs
                </span>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* CRM Channel breakdown progress */}
      <div className="rounded-2xl border border-border-base p-6 bg-background/50 glass space-y-6">
        <div>
          <h3 className="text-sm font-black text-foreground">Lead Captures by Engagement Point</h3>
          <p className="text-[10px] text-muted-text mt-0.5">Breakdown of CRM entry flows and metrics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Progress list */}
          <div className="space-y-4">
            
            {/* Channel 1 */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-foreground">
                <span>Property Inquiries</span>
                <span>{propertyInquiryCount} leads ({((propertyInquiryCount / totalLeadsCount) * 100).toFixed(0)}%)</span>
              </div>
              <div className="h-2 rounded-full bg-border-base overflow-hidden">
                <div
                  className="h-full bg-royal rounded-full transition-all duration-500"
                  style={{ width: `${(propertyInquiryCount / totalLeadsCount) * 100}%` }}
                />
              </div>
            </div>

            {/* Channel 2 */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-foreground">
                <span>Calculator Forms</span>
                <span>{calculatorCount} leads ({((calculatorCount / totalLeadsCount) * 100).toFixed(0)}%)</span>
              </div>
              <div className="h-2 rounded-full bg-border-base overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${(calculatorCount / totalLeadsCount) * 100}%` }}
                />
              </div>
            </div>

            {/* Channel 3 */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-foreground">
                <span>Direct Contact Forms</span>
                <span>{contactCount} leads ({((contactCount / totalLeadsCount) * 100).toFixed(0)}%)</span>
              </div>
              <div className="h-2 rounded-full bg-border-base overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${(contactCount / totalLeadsCount) * 100}%` }}
                />
              </div>
            </div>

            {/* Channel 4 */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-foreground">
                <span>WhatsApp Clicks</span>
                <span>{whatsappCount} leads ({((whatsappCount / totalLeadsCount) * 100).toFixed(0)}%)</span>
              </div>
              <div className="h-2 rounded-full bg-border-base overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${(whatsappCount / totalLeadsCount) * 100}%` }}
                />
              </div>
            </div>

          </div>

          {/* Audit Metrics block */}
          <div className="p-5 rounded-2xl border border-border-base bg-muted-bg/30 flex flex-col justify-between">
            <div className="flex items-start space-x-3">
              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-foreground">Super Admin Audit Summary</h4>
                <p className="text-[10px] text-muted-text mt-1">
                  Active properties, listings, blogs, and CRM states are live. All database nodes sync instantly in the current local storage session.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-border-base/50 pt-4 mt-4 text-[10px] font-bold text-muted-text">
              <div>
                <span className="block uppercase text-[8px] text-muted-text/75">Active Listings</span>
                <span className="text-foreground text-sm font-black">{properties.filter(p => p.isApproved).length} Approved</span>
              </div>
              <div>
                <span className="block uppercase text-[8px] text-muted-text/75">Pending Reviews</span>
                <span className="text-amber-500 text-sm font-black">{properties.filter(p => !p.isApproved).length} Queued</span>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
