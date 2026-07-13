"use client";

import React, { useState } from "react";
import { useAppState, AdCampaign } from "@/context/AppStateContext";
import { Search, Plus, Trash2, X, Play, Pause, ExternalLink, ShieldAlert, Eye, MousePointerClick, Percent } from "lucide-react";

export default function AdminAds() {
  const { 
    ads, 
    addAd, 
    updateAdStatus, 
    deleteAd 
  } = useAppState();

  const [searchQuery, setSearchQuery] = useState("");
  const [placementFilter, setPlacementFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // Add Ad Form States
  const [showAddModal, setShowAddModal] = useState(false);
  const [adTitle, setAdTitle] = useState("");
  const [adLink, setAdLink] = useState("");
  const [adImage, setAdImage] = useState("");
  const [adPlacement, setAdPlacement] = useState<AdCampaign["placement"]>("Banner");
  const [errorMessage, setErrorMessage] = useState("");

  // Filter ads
  const filteredAds = ads.filter((ad) => {
    const matchesSearch = ad.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlacement = placementFilter === "All" || ad.placement === placementFilter;
    const matchesStatus = statusFilter === "All" || ad.status === statusFilter;
    return matchesSearch && matchesPlacement && matchesStatus;
  });

  const handleCreateAd = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!adTitle.trim() || !adLink.trim()) {
      setErrorMessage("Campaign Title and Redirect Link are required.");
      return;
    }

    addAd({
      title: adTitle.trim(),
      link: adLink.trim(),
      image: adImage.trim() || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80",
      placement: adPlacement,
      status: "Active"
    });

    // Reset Form
    setAdTitle("");
    setAdLink("");
    setAdImage("");
    setAdPlacement("Banner");
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-sm font-black text-foreground">Ads Manager</h3>
          <p className="text-[10px] text-muted-text mt-0.5">Manage banners, sidebar cards, and popups. Track clicks and click-through rates (CTR%).</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-royal hover:bg-royal-hover dark:bg-white dark:text-royal text-white text-xs font-bold rounded-lg flex items-center space-x-1.5 shadow-md cursor-pointer transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Launch Ad Campaign</span>
        </button>
      </div>

      {/* Filter panel */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border border-border-base p-4 rounded-xl bg-background/30 glass">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-text pointer-events-none" />
          <input
            type="text"
            placeholder="Search campaign title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs bg-muted-bg border border-border-base rounded-lg pl-9 pr-3 py-2.5 outline-none text-foreground placeholder:text-muted-text/70"
          />
        </div>

        <div>
          <select
            value={placementFilter}
            onChange={(e) => setPlacementFilter(e.target.value)}
            className="w-full text-xs bg-muted-bg border border-border-base rounded-lg px-3 py-2.5 outline-none font-bold text-foreground"
          >
            <option value="All">All Placements</option>
            <option value="Banner">Top Banner Placements</option>
            <option value="Sidebar">Sidebar Card Placements</option>
            <option value="Popup">Pre-launch Popups</option>
          </select>
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full text-xs bg-muted-bg border border-border-base rounded-lg px-3 py-2.5 outline-none font-bold text-foreground"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active Running</option>
            <option value="Paused">Paused Campaigns</option>
            <option value="Expired">Expired</option>
          </select>
        </div>
      </div>

      {/* Campaigns Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredAds.map((ad) => {
          const ctr = ad.views > 0 ? ((ad.clicks / ad.views) * 100).toFixed(2) : "0.00";
          return (
            <div 
              key={ad.id} 
              className="rounded-2xl border border-border-base bg-background/50 p-5 space-y-4 flex flex-col justify-between hover:border-gold/30 transition-colors glass"
            >
              
              {/* Top Row: Info and status */}
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-royal/10 text-royal border border-royal/20">
                      {ad.placement}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border ${
                      ad.status === "Active" 
                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                        : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                    }`}>
                      {ad.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-1.5">
                    
                    {/* Pause/Play toggle */}
                    <button
                      onClick={() => {
                        const nextStatus = ad.status === "Active" ? "Paused" : "Active";
                        updateAdStatus(ad.id, nextStatus);
                      }}
                      className="p-1 border border-border-base rounded text-muted-text hover:text-foreground transition-colors"
                      title={ad.status === "Active" ? "Pause Ad" : "Activate Ad"}
                    >
                      {ad.status === "Active" ? (
                        <Pause className="w-3.5 h-3.5" />
                      ) : (
                        <Play className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {/* Delete button */}
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete campaign "${ad.title}"?`)) {
                          deleteAd(ad.id);
                        }
                      }}
                      className="p-1 border border-border-base rounded text-muted-text hover:text-red-500 transition-colors"
                      title="Delete Campaign"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                  </div>
                </div>

                <h4 className="font-extrabold text-foreground leading-snug">{ad.title}</h4>

                {/* Banner Thumbnail */}
                <div className="relative h-28 rounded-lg overflow-hidden border border-border-base bg-muted-bg/50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={ad.image} alt={ad.title} className="w-full h-full object-cover" />
                  
                  <a 
                    href={ad.link} 
                    target="_blank" 
                    rel="noreferrer"
                    className="absolute bottom-2 right-2 p-1.5 bg-black/60 hover:bg-black/85 text-white rounded text-[10px] flex items-center space-x-1"
                  >
                    <span>Target URL</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-border-base/50">
                <div className="p-2 bg-muted-bg/30 rounded-lg">
                  <span className="text-[8px] font-bold text-muted-text uppercase flex items-center justify-center space-x-0.5">
                    <Eye className="w-2.5 h-2.5 text-muted-text" />
                    <span>Views</span>
                  </span>
                  <p className="text-sm font-black text-foreground mt-0.5">{ad.views.toLocaleString()}</p>
                </div>
                <div className="p-2 bg-muted-bg/30 rounded-lg">
                  <span className="text-[8px] font-bold text-muted-text uppercase flex items-center justify-center space-x-0.5">
                    <MousePointerClick className="w-2.5 h-2.5 text-muted-text" />
                    <span>Clicks</span>
                  </span>
                  <p className="text-sm font-black text-foreground mt-0.5">{ad.clicks.toLocaleString()}</p>
                </div>
                <div className="p-2 bg-muted-bg/30 rounded-lg">
                  <span className="text-[8px] font-bold text-muted-text uppercase flex items-center justify-center space-x-0.5">
                    <Percent className="w-2.5 h-2.5 text-gold" />
                    <span>CTR</span>
                  </span>
                  <p className="text-sm font-black text-gold mt-0.5">{ctr}%</p>
                </div>
              </div>

            </div>
          );
        })}

        {filteredAds.length === 0 && (
          <div className="col-span-2 p-10 border border-border-base rounded-2xl text-center text-muted-text bg-background/30">
            <ShieldAlert className="w-8 h-8 mx-auto mb-2 text-slate-400" />
            <p className="text-xs">No active or paused campaign filters matched.</p>
          </div>
        )}
      </div>

      {/* Add Ad Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-border-base bg-white dark:bg-slate-950 p-6 shadow-2xl glass animate-in zoom-in-95 duration-200">
            
            <div className="flex justify-between items-start mb-6">
              <div>
                <h4 className="font-black text-foreground">Launch Ad Placement</h4>
                <p className="text-[10px] text-muted-text mt-0.5">Deploy banner assets and direct traffic redirects</p>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1 border border-border-base rounded hover:bg-muted-bg text-muted-text transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 border border-red-500/20 bg-red-500/10 text-red-500 rounded-lg text-xs font-semibold">
                ⚠ {errorMessage}
              </div>
            )}

            <form onSubmit={handleCreateAd} className="space-y-4">
              
              <div>
                <label className="block text-[10px] font-bold uppercase text-muted-text mb-1">Campaign Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DHA Sector A Commercial Bookings Open"
                  value={adTitle}
                  onChange={(e) => setAdTitle(e.target.value)}
                  className="w-full text-xs rounded-lg border border-border-base px-3 py-2.5 bg-muted-bg outline-none text-foreground focus:border-royal"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-muted-text mb-1">Target Redirect URL</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. /properties?sector=Sector A"
                  value={adLink}
                  onChange={(e) => setAdLink(e.target.value)}
                  className="w-full text-xs rounded-lg border border-border-base px-3 py-2.5 bg-muted-bg outline-none text-foreground focus:border-royal"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-muted-text mb-1">Ad Placement Zone</label>
                <select
                  value={adPlacement}
                  onChange={(e) => setAdPlacement(e.target.value as AdCampaign["placement"])}
                  className="w-full text-xs rounded-lg border border-border-base px-2 py-2.5 bg-muted-bg outline-none font-bold text-foreground focus:border-royal"
                >
                  <option value="Banner">Top Banner Placements</option>
                  <option value="Sidebar">Sidebar Widget placements</option>
                  <option value="Popup">System Entrance Popups</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-muted-text mb-1">Ad Banner Image URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={adImage}
                  onChange={(e) => setAdImage(e.target.value)}
                  className="w-full text-xs rounded-lg border border-border-base px-3 py-2.5 bg-muted-bg outline-none text-foreground focus:border-royal"
                />
              </div>

              <div className="flex space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-1/2 py-2.5 border border-border-base rounded-lg text-xs font-bold text-muted-text hover:bg-muted-bg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-royal dark:bg-white text-white dark:text-royal font-bold text-xs rounded-lg hover:bg-royal-hover transition-colors shadow-md"
                >
                  Launch Ad
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
