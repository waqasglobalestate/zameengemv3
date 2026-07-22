"use client";

import React, { useState, useEffect } from "react";
import { useAppState } from "@/context/AppStateContext";
import { supabase } from "@/utils/supabaseClient";
import PropertyCard from "@/components/Property/PropertyCard";
import { BlogPost } from "@/data/initialBlogs";
import AddPropertyWizard from "@/components/Property/AddPropertyWizard";
import PropertyListingGenerator from "@/components/AI/PropertyListingGenerator";
import CrmPortal from "@/components/Dashboard/CrmPortal";
import AiRecommendations from "@/components/Dashboard/AiRecommendations";
import { calculateListingQuality } from "@/utils/qualityScorer";
import AdminAnalytics from "@/components/Dashboard/AdminAnalytics";
import AdminUsers from "@/components/Dashboard/AdminUsers";
import AdminAgencies from "@/components/Dashboard/AdminAgencies";
import AdminAds from "@/components/Dashboard/AdminAds";
import PlanUpgradeModal from "@/components/Dashboard/PlanUpgradeModal";
import { 
  Heart, 
  Search, 
  Eye, 
  Plus, 
  Trash2, 
  Mail, 
  BarChart3, 
  FileText, 
  Building,
  CheckCircle2, 
  Check,
  Sparkles,
  Users,
  Megaphone,
  LogOut,
  Lock,
  Crown,
  Zap,
  AlertTriangle,
  UserCheck,
  UserX,
  Building2
} from "lucide-react";

export default function DashboardPortal() {
  const { 
    properties, 
    blogs, 
    leads, 
    savedProperties, 
    savedSearches, 
    recentlyViewed, 
    userSession,
    approveProperty,
    rejectProperty,
    deleteProperty,
    removeSavedSearch,
    addBlog,
    deleteBlog,
    isLoaded,
    users,
    agencies,
    ads,
    logoutUser,
    adminPassword,
    changeAdminPassword,
    canAddProperty,
    updateUserStatus,
    updateAgencyStatus,
    deleteUser,
    deleteAgency
  } = useAppState();

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showSetPasswordOnboarding, setShowSetPasswordOnboarding] = useState(false);
  const [onboardingPassword, setOnboardingPassword] = useState("");
  const [onboardingLoading, setOnboardingLoading] = useState(false);
  const [onboardingError, setOnboardingError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (localStorage.getItem("gem-needs-password") === "true") {
        setShowSetPasswordOnboarding(true);
      }
    }
  }, []);

  const handleSetOnboardingPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (onboardingPassword.length < 6) {
      setOnboardingError("Password must be at least 6 characters.");
      return;
    }
    setOnboardingLoading(true);
    setOnboardingError(null);
    try {
      const { error } = await supabase.auth.updateUser({
        password: onboardingPassword
      });
      if (error) throw error;
      localStorage.removeItem("gem-needs-password");
      setShowSetPasswordOnboarding(false);
      alert("Password set successfully! You can now log in using your Email and Password.");
    } catch (err: any) {
      setOnboardingError(err.message || "Failed to set password.");
    } finally {
      setOnboardingLoading(false);
    }
  };

  const handleDashboardLogout = async () => {
    await logoutUser();
    window.location.href = "/";
  };

  const handlePasswordChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityError(null);
    setSecuritySuccess(false);

    if (currentPasswordInput !== adminPassword) {
      setSecurityError("Incorrect current password.");
      return;
    }

    if (newPasswordInput.length < 6) {
      setSecurityError("New password must be at least 6 characters long.");
      return;
    }

    if (newPasswordInput !== confirmPasswordInput) {
      setSecurityError("New password and confirmation do not match.");
      return;
    }

    changeAdminPassword(newPasswordInput);
    setSecuritySuccess(true);
    setCurrentPasswordInput("");
    setNewPasswordInput("");
    setConfirmPasswordInput("");
  };

  const [activeSubTab, setActiveSubTab] = useState("overview");

  // Security settings
  const [currentPasswordInput, setCurrentPasswordInput] = useState("");
  const [newPasswordInput, setNewPasswordInput] = useState("");
  const [confirmPasswordInput, setConfirmPasswordInput] = useState("");
  const [securityError, setSecurityError] = useState<string | null>(null);
  const [securitySuccess, setSecuritySuccess] = useState(false);

  // Old form states cleaned up

  // 2. Admin: Add Blog Form State
  const [blogTitle, setBlogTitle] = useState("");
  const [blogExcerpt, setBlogExcerpt] = useState("");
  const [blogContent, setBlogContent] = useState("");
  const [blogCategory, setBlogCategory] = useState<BlogPost["category"]>("DHA Bahawalpur Updates");
  const [blogTags, setBlogTags] = useState("");
  const [blogSuccess, setBlogSuccess] = useState(false);

  // Reset Sub-tab when role changes, preserving target tabs if specified in query params
  useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const tab = params.get("tab");
        if (tab === "add") {
          setActiveSubTab("add");
          return;
        }
      }
      setActiveSubTab("overview");
    }, 0);
    return () => clearTimeout(timer);
  }, [userSession.role]);

  // Parse query tab parameters on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab === "add") {
        const timer = setTimeout(() => {
          setActiveSubTab("add");
        }, 0);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  if (!isLoaded) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center font-bold text-muted-text">
        Initializing workspace portals...
      </div>
    );
  }

  // Filter listings added by current user context (Simulated)
  const myListings = properties.filter(p => p.agent.name === userSession.name || p.id.startsWith("prop-17")); // Include newly added props

  // Filter CRM leads assigned to or related to current agent
  const myCrmLeads = leads.filter(l => l.agentId === userSession.name || userSession.role === "Admin" || userSession.role === "Agency");

  // Filter saved property objects
  const favoritedListings = properties.filter((p) => savedProperties.includes(p.id));

  // Old form handlers cleaned up

  // Handler: Add Blog
  const handleAddBlogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!blogTitle || !blogContent) return;

    const slug = blogTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    
    addBlog({
      slug,
      title: blogTitle,
      excerpt: blogExcerpt || blogContent.substring(0, 120) + "...",
      content: `<p>${blogContent}</p>`,
      category: blogCategory,
      publishedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      author: userSession.name,
      image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80",
      readTime: "4 min read",
      tags: blogTags ? blogTags.split(",").map(t => t.trim()) : ["DHA", "Investment"]
    });

    setBlogSuccess(true);
    setBlogTitle("");
    setBlogExcerpt("");
    setBlogContent("");
    setBlogTags("");

    setTimeout(() => {
      setBlogSuccess(false);
      setActiveSubTab("blogs");
    }, 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

      {/* Set Password Onboarding Modal */}
      {showSetPasswordOnboarding && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md bg-slate-900 border border-border-base/50 p-6 rounded-3xl shadow-2xl text-center space-y-6">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-gold uppercase tracking-[0.2em]">Secure Your Account</span>
              <h3 className="text-xl font-extrabold text-white">Set Account Password</h3>
              <p className="text-xs text-muted-text max-w-xs mx-auto">
                You signed up using Google. Please set a password so you can also log in by typing your Email and Password later.
              </p>
            </div>

            <form onSubmit={handleSetOnboardingPassword} className="space-y-4">
              <div className="space-y-1 text-left">
                <label className="block text-[10px] font-bold text-muted-text uppercase tracking-wider">New Password (Min 6 Characters)</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="Enter password"
                  value={onboardingPassword}
                  onChange={(e) => setOnboardingPassword(e.target.value)}
                  className="w-full text-xs rounded-xl border border-border-base px-3.5 py-3 bg-slate-950 outline-none text-white focus:ring-1 focus:ring-gold font-bold"
                />
              </div>

              {onboardingError && (
                <p className="text-[10px] text-red-500 font-bold">⚠️ {onboardingError}</p>
              )}

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem("gem-needs-password");
                    setShowSetPasswordOnboarding(false);
                  }}
                  className="flex-1 py-3 border border-border-base hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Skip
                </button>
                <button
                  type="submit"
                  disabled={onboardingLoading}
                  className="flex-1 py-3 bg-gold text-slate-950 text-xs font-bold rounded-xl hover:bg-gold-hover disabled:bg-slate-700 disabled:text-slate-400 transition-all cursor-pointer flex items-center justify-center space-x-2"
                >
                  {onboardingLoading ? "Saving..." : "Set Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upgrade Modal */}
      {showUpgradeModal && (() => {
        const check = canAddProperty();
        return (
          <PlanUpgradeModal
            onClose={() => setShowUpgradeModal(false)}
            currentCount={check.currentCount}
            limit={check.limit === Infinity ? 100 : check.limit}
          />
        );
      })()}
      
      {userSession.status === "Pending" && (
        <div className="mb-6 p-4 border border-amber-500/20 bg-amber-500/10 rounded-2xl flex items-start space-x-3 text-amber-500 animate-in fade-in duration-200">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-extrabold text-sm">Account Approval Pending</h4>
            <p className="text-xs text-muted-text max-w-3xl leading-relaxed">
              Your profile is currently under review by our administration. You can browse the dashboard, configure settings, and prepare listing drafts, but your profile and properties will not be visible publicly until approved by an administrator.
            </p>
          </div>
        </div>
      )}
      
      {/* 1. Header user banner */}
      <div className="rounded-2xl border border-border-base p-6 bg-gradient-to-r from-royal to-royal-hover dark:from-slate-950 dark:to-slate-900 text-white flex flex-col md:flex-row justify-between items-center gap-6 shadow-xl transition-all">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gold shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={userSession.image && !userSession.image.startsWith("blob:") ? userSession.image : `https://ui-avatars.com/api/?name=${encodeURIComponent(userSession.name)}&background=c5a85c&color=fff`} 
              alt={userSession.name} 
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userSession.name)}&background=c5a85c&color=fff`;
              }}
              className="w-full h-full object-cover" 
            />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold">{userSession.name}</h2>
              {userSession.role !== "Buyer" && (
                <span className="text-[10px] font-bold tracking-widest bg-gold text-slate-950 px-2 py-0.5 rounded uppercase">
                  {userSession.role}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 mt-1">{userSession.email} | {userSession.phone}</p>
          </div>
        </div>

        <div className="text-center md:text-right flex flex-col items-center md:items-end gap-2">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Simulation Status</p>
            <p className="text-xs font-semibold text-emerald-400 mt-1">✓ Live Local DB Synchronization</p>
            <p className="text-[9px] text-slate-500 mt-0.5">Use top navbar to shift dashboard testing roles.</p>
          </div>
          {(userSession.role === "Seller" || userSession.role === "Agent" || userSession.role === "Agency" || userSession.role === "Admin") && (
            <button
              onClick={handleDashboardLogout}
              className="inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 border border-white/20 hover:bg-white/10 hover:border-white/30 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm"
            >
              <LogOut className="w-3.5 h-3.5 text-red-300" />
              <span>Log Out</span>
            </button>
          )}
        </div>
      </div>

      {/* Plan Status Banner — only for Agent / Agency */}
      {(userSession.role === "Agent" || userSession.role === "Agency") && (() => {
        const check = canAddProperty();
        const isPro = userSession.plan === "Pro";
        const usedPct = check.limit === Infinity ? 0 : Math.min(100, (check.currentCount / check.limit) * 100);
        return (
          <div className={`rounded-xl border p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
            isPro
              ? "border-gold/30 bg-gradient-to-r from-gold/5 to-yellow-400/5"
              : check.allowed
              ? "border-border-base bg-muted-bg"
              : "border-red-500/30 bg-red-500/5"
          }`}>
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className={`p-2 rounded-lg ${ isPro ? "bg-gold/15" : "bg-muted-bg border border-border-base" }`}>
                {isPro ? <Crown className="w-5 h-5 text-gold" /> : <Zap className="w-5 h-5 text-muted-text" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-foreground">
                    {isPro ? "Pro Account" : "Free Account"}
                  </span>
                  <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    isPro ? "bg-gold text-slate-900" : "bg-muted-bg border border-border-base text-muted-text"
                  }`}>
                    {isPro ? "PRO" : "FREE"}
                  </span>
                  {check.code === "limit_reached" && (
                    <span className="text-[10px] font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full">Limit Reached</span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="flex-1 h-1.5 bg-border-base rounded-full overflow-hidden max-w-[160px]">
                    <div
                      className={`h-full rounded-full transition-all ${ usedPct >= 100 ? "bg-red-500" : isPro ? "bg-gold" : "bg-royal" }`}
                      style={{ width: `${usedPct}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-text font-medium">
                    {check.currentCount} / {check.limit === Infinity ? "∞" : check.limit} listings used
                  </span>
                </div>
              </div>
            </div>
            {!isPro && (
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-gold to-yellow-400 text-slate-900 text-xs font-extrabold shadow hover:shadow-gold/40 hover:scale-105 transition-all"
              >
                <Crown className="w-4 h-4" />
                Upgrade to Pro — Rs. 5,000/mo
              </button>
            )}
            {isPro && (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-gold">
                <CheckCircle2 className="w-4 h-4" />
                Pro Active
              </div>
            )}
          </div>
        );
      })()}

      {/* 2. Main Portal Panels */}
      
      {/* --- BUYER DASHBOARD --- */}
      {userSession.role === "Buyer" && (
        <div className="space-y-6">
          {/* Sub Navigation */}
          <div className="flex space-x-2 border-b border-border-base pb-3">
            {[
              { id: "overview", name: "Saved Properties", icon: <Heart className="w-4 h-4" /> },
              { id: "searches", name: "Saved Searches", icon: <Search className="w-4 h-4" /> },
              { id: "recent", name: "Recently Viewed", icon: <Eye className="w-4 h-4" /> },
              { id: "recommendations", name: "AI Recommendations", icon: <Sparkles className="w-4 h-4 text-gold" /> }
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setActiveSubTab(t.id)}
                className={`flex items-center space-x-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-colors ${
                  activeSubTab === t.id ? "bg-royal text-white dark:bg-white dark:text-royal" : "text-muted-text hover:bg-muted-bg"
                }`}
              >
                {t.icon}
                <span>{t.name}</span>
              </button>
            ))}
          </div>

          {/* Sub content */}
          {activeSubTab === "overview" && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-foreground">My Saved Properties ({savedProperties.length})</h3>
              {favoritedListings.length === 0 ? (
                <div className="p-10 border border-border-base rounded-2xl text-center text-muted-text">
                  <Heart className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs">You haven&apos;t saved any listings yet. Browse our properties directory to favorite items.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {favoritedListings.map(p => (
                    <PropertyCard key={p.id} property={p} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeSubTab === "searches" && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-foreground">Saved Search Alerts ({savedSearches.length})</h3>
              {savedSearches.length === 0 ? (
                <div className="p-10 border border-border-base rounded-2xl text-center text-muted-text">
                  <Search className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs">No active search notifications saved. Filter listings on property page and save.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedSearches.map(s => (
                    <div key={s.id} className="p-4 border border-border-base bg-muted-bg/50 rounded-xl flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-foreground">
                          {s.purpose} in {s.location || "All Locations"} ({s.type || "Any Type"})
                        </p>
                        <p className="text-[10px] text-muted-text mt-1">Saved on: {new Date(s.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => removeSavedSearch(s.id)}
                          className="p-2 border border-border-base rounded-lg text-muted-text hover:text-red-600 transition-colors"
                          title="Delete alert"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeSubTab === "recent" && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-foreground">Recently Visited Listings</h3>
              {recentlyViewed.length === 0 ? (
                <p className="text-xs text-muted-text p-10 border border-border-base rounded-2xl text-center">No viewed items in this session.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {properties.filter(p => recentlyViewed.includes(p.id)).map(p => (
                    <PropertyCard key={p.id} property={p} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeSubTab === "recommendations" && (
            <AiRecommendations />
          )}
        </div>
      )}

      {/* --- SELLER / AGENT / AGENCY DASHBOARD --- */}
      {(userSession.role === "Seller" || userSession.role === "Agent" || userSession.role === "Agency") && (
        <div className="space-y-6">
          {/* Sub Navigation */}
          <div className="flex space-x-2 border-b border-border-base pb-3 overflow-x-auto">
            {[
              { id: "overview", name: "Listing Panel", icon: <Building className="w-4 h-4" /> },
              { id: "add", name: "Add Listing Form", icon: <Plus className="w-4 h-4" /> },
              { id: "ai-generator", name: "AI Listing Writer", icon: <Sparkles className="w-4 h-4" /> },
              { id: "leads", name: "Leads / Messages", icon: <Mail className="w-4 h-4" /> },
              { id: "stats", name: "Sales Analytics", icon: <BarChart3 className="w-4 h-4" /> }
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setActiveSubTab(t.id)}
                className={`flex items-center space-x-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-colors whitespace-nowrap ${
                  activeSubTab === t.id ? "bg-royal text-white dark:bg-white dark:text-royal" : "text-muted-text hover:bg-muted-bg"
                }`}
              >
                {t.icon}
                <span>{t.name}</span>
              </button>
            ))}
          </div>

          {/* Sub content: listing panel */}
          {activeSubTab === "overview" && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-foreground">Manage My Listings ({myListings.length})</h3>
              {myListings.length === 0 ? (
                <div className="p-10 border border-border-base rounded-2xl text-center text-muted-text">
                  <Building className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs mb-4">You do not have any active properties listed on the market.</p>
                  <button
                    onClick={() => setActiveSubTab("add")}
                    className="px-4 py-2 bg-royal text-white text-xs font-bold rounded-lg"
                  >
                    Create a Listing
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto border border-border-base rounded-xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-muted-bg border-b border-border-base font-bold text-muted-text uppercase">
                        <th className="p-3">Property Name</th>
                        <th className="p-3">Location</th>
                        <th className="p-3">Type</th>
                        <th className="p-3">Demand Price</th>
                        <th className="p-3">Score</th>
                        <th className="p-3">Views</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myListings.map(p => (
                        <tr key={p.id} className="border-b border-border-base hover:bg-muted-bg/30">
                          <td className="p-3 font-bold text-foreground">{p.title}</td>
                          <td className="p-3">{p.sector ? `${p.sector}, ` : ""}{p.location}</td>
                          <td className="p-3">{p.type}</td>
                          <td className="p-3 font-semibold text-royal dark:text-white">
                            PKR {p.price >= 10000000 ? `${(p.price / 10000000).toFixed(2)} Crore` : `${(p.price / 100000).toFixed(0)} Lakh`}
                          </td>
                          <td className="p-3">
                            {(() => {
                              const quality = calculateListingQuality(p);
                              let badgeColor = "bg-red-500/10 text-red-500 border-red-500/20";
                              if (quality.score >= 80) badgeColor = "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
                              else if (quality.score >= 50) badgeColor = "bg-amber-500/10 text-amber-500 border-amber-500/20";
                              return (
                                <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${badgeColor}`}>
                                  {quality.score}%
                                </span>
                              );
                            })()}
                          </td>
                          <td className="p-3">{p.viewsCount}</td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => deleteProperty(p.id)}
                              className="text-red-500 hover:text-red-700 font-bold"
                              title="Delete listing"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeSubTab === "add" && (() => {
            const check = canAddProperty();
            if (!check.allowed) {
              if (check.code === "suspended") {
                return (
                  <div className="rounded-2xl border-2 border-dashed border-red-400/40 bg-red-500/5 p-12 text-center space-y-5">
                    <div className="flex justify-center">
                      <div className="p-4 rounded-full bg-red-500/10 border border-red-500/20">
                        <Lock className="w-10 h-10 text-red-400" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-extrabold text-foreground mb-2">Account Suspended</h3>
                      <p className="text-sm text-muted-text max-w-sm mx-auto">
                        Your account has been suspended by administration. Please contact support for assistance.
                      </p>
                    </div>
                  </div>
                );
              }
              return (
                <div className="rounded-2xl border-2 border-dashed border-red-400/40 bg-red-500/5 p-12 text-center space-y-5">
                  <div className="flex justify-center">
                    <div className="p-4 rounded-full bg-red-500/10 border border-red-500/20">
                      <Lock className="w-10 h-10 text-red-400" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-foreground mb-2">Listing Limit Reached</h3>
                    <p className="text-sm text-muted-text max-w-sm mx-auto">
                      You&apos;ve used <span className="font-bold text-foreground">{check.currentCount} / {check.limit}</span> listings on your{" "}
                      <span className="font-bold text-foreground">{userSession.plan || "Free"} plan</span>. Delete an existing listing or upgrade to Pro to add more.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={() => setShowUpgradeModal(true)}
                      className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-gold to-yellow-400 text-slate-900 font-extrabold text-sm shadow-lg hover:shadow-gold/40 hover:scale-105 transition-all"
                    >
                      <Crown className="w-5 h-5" />
                      Upgrade to Pro — Rs. 5,000/mo
                    </button>
                    <button
                      onClick={() => setActiveSubTab("overview")}
                      className="px-6 py-3 rounded-xl border border-border-base text-sm font-bold text-foreground hover:bg-muted-bg transition-all"
                    >
                      Manage Listings
                    </button>
                  </div>
                </div>
              );
            }
            return <AddPropertyWizard onSuccess={() => setActiveSubTab("overview")} />;
          })()}

          {/* Sub content: AI Listing Writer */}
          {activeSubTab === "ai-generator" && (
            <PropertyListingGenerator onApply={() => setActiveSubTab("add")} />
          )}

          {/* Sub content: Leads received */}
          {activeSubTab === "leads" && (
            <CrmPortal />
          )}

          {/* Sub content: stats */}
          {activeSubTab === "stats" && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-foreground">Sales Performance Dashboard</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="p-5 border border-border-base rounded-2xl bg-muted-bg/50">
                  <span className="text-[10px] font-bold uppercase text-muted-text">Total Listing Views</span>
                  <h4 className="text-3xl font-black text-royal dark:text-white mt-1">
                    {myListings.reduce((sum, item) => sum + item.viewsCount, 0)}
                  </h4>
                </div>
                <div className="p-5 border border-border-base rounded-2xl bg-muted-bg/50">
                  <span className="text-[10px] font-bold uppercase text-muted-text">Pending Leads</span>
                  <h4 className="text-3xl font-black text-amber-600 mt-1">
                    {myCrmLeads.filter(l => l.status === "New").length}
                  </h4>
                </div>
                <div className="p-5 border border-border-base rounded-2xl bg-muted-bg/50">
                  <span className="text-[10px] font-bold uppercase text-muted-text">Assigned Agents</span>
                  <h4 className="text-3xl font-black text-emerald-600 mt-1">1</h4>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- SUPER ADMIN PANEL --- */}
      {userSession.role === "Admin" && (
        <div className="space-y-6">
          {/* Admin Pending Notifications Alert Banner */}
          {(users.some(u => u.status === "Pending") || agencies.some(a => a.status === "Pending") || properties.some(p => !p.isApproved)) && (
            <div className="mb-6 p-4 border border-gold/30 bg-gold/10 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center text-gold animate-in fade-in duration-200 glass gap-4 shadow-lg">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 animate-pulse text-gold" />
                <div>
                  <h4 className="font-extrabold text-sm text-foreground">Pending Action Required</h4>
                  <p className="text-xs text-muted-text mt-0.5 leading-relaxed">
                    You have pending requests: {users.filter(u => u.status === "Pending" && u.role === "Agent").length} Agents, {agencies.filter(a => a.status === "Pending").length} Agencies, and {properties.filter(p => !p.isApproved).length} Property Listings.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveSubTab("approvals")}
                className="px-4 py-2 bg-gold hover:bg-gold-hover text-slate-950 text-xs font-black rounded-xl transition-all cursor-pointer shadow-md transform hover:scale-105 shrink-0"
              >
                Review Approvals
              </button>
            </div>
          )}

          {/* Sub Navigation */}
          <div className="flex space-x-2 border-b border-border-base pb-3 overflow-x-auto">
            {[
              { id: "overview", name: "System Stats", icon: <Building className="w-4 h-4" /> },
              { id: "analytics", name: "System Analytics", icon: <BarChart3 className="w-4 h-4" /> },
              { id: "users", name: "Manage Users", icon: <Users className="w-4 h-4" />, badge: users.filter(u => u.status === "Pending").length },
              { id: "agencies", name: "Manage Agencies", icon: <Building className="w-4 h-4" />, badge: agencies.filter(a => a.status === "Pending").length },
              { id: "ads", name: "Ads Manager", icon: <Megaphone className="w-4 h-4" /> },
              { 
                id: "approvals", 
                name: "Review Approvals", 
                icon: <CheckCircle2 className="w-4 h-4" />,
                badge: users.filter(u => u.status === "Pending" && (u.role === "Agent" || u.role === "Agency")).length + 
                       properties.filter(p => p.isApproved === false).length
              },
              { id: "blogs", name: "Manage Blogs", icon: <FileText className="w-4 h-4" /> },
              { id: "writeblog", name: "Publish Blog", icon: <Plus className="w-4 h-4" /> },
              { id: "leads", name: "CRM Leads", icon: <Mail className="w-4 h-4" /> },
              { id: "ai-generator", name: "AI Listing Writer", icon: <Sparkles className="w-4 h-4" /> },
              { id: "security", name: "Security Settings", icon: <Lock className="w-4 h-4 text-red-500 animate-pulse" /> }
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setActiveSubTab(t.id)}
                className={`flex items-center space-x-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-colors whitespace-nowrap relative ${
                  activeSubTab === t.id ? "bg-royal text-white dark:bg-white dark:text-royal" : "text-muted-text hover:bg-muted-bg"
                }`}
              >
                {t.icon}
                <span>{t.name}</span>
                {t.badge && t.badge > 0 ? (
                  <span className="ml-1.5 px-1.5 py-0.5 text-[9px] font-extrabold bg-red-600 text-white rounded-full leading-none flex items-center justify-center shrink-0">
                    {t.badge}
                  </span>
                ) : null}
              </button>
            ))}
          </div>

          {/* Admin Sub content */}
          {activeSubTab === "overview" && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-foreground">Global System Audit Logs</h3>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <div className="p-4 border border-border-base bg-muted-bg/50 rounded-xl">
                  <p className="text-[10px] font-bold uppercase text-muted-text">Properties</p>
                  <p className="text-2xl font-black text-foreground mt-0.5">{properties.length}</p>
                </div>
                <div className="p-4 border border-border-base bg-muted-bg/50 rounded-xl">
                  <p className="text-[10px] font-bold uppercase text-muted-text">Published Blogs</p>
                  <p className="text-2xl font-black text-foreground mt-0.5">{blogs.length}</p>
                </div>
                <div className="p-4 border border-border-base bg-muted-bg/50 rounded-xl">
                  <p className="text-[10px] font-bold uppercase text-muted-text">Total Leads</p>
                  <p className="text-2xl font-black text-foreground mt-0.5">{leads.length}</p>
                </div>
                <div className="p-4 border border-border-base bg-muted-bg/50 rounded-xl">
                  <p className="text-[10px] font-bold uppercase text-muted-text">System Users</p>
                  <p className="text-2xl font-black text-foreground mt-0.5">{users.length}</p>
                </div>
                <div className="p-4 border border-border-base bg-muted-bg/50 rounded-xl">
                  <p className="text-[10px] font-bold uppercase text-muted-text">Agencies</p>
                  <p className="text-2xl font-black text-foreground mt-0.5">{agencies.length}</p>
                </div>
                <div className="p-4 border border-border-base bg-muted-bg/50 rounded-xl">
                  <p className="text-[10px] font-bold uppercase text-muted-text">Ad Campaigns</p>
                  <p className="text-2xl font-black text-foreground mt-0.5">{ads.length}</p>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === "analytics" && (
            <AdminAnalytics />
          )}

          {activeSubTab === "users" && (
            <AdminUsers />
          )}

          {activeSubTab === "agencies" && (
            <AdminAgencies />
          )}

          {activeSubTab === "ads" && (
            <AdminAds />
          )}

          {/* Admin Sub content: approvals */}
          {activeSubTab === "approvals" && (
            <div className="space-y-8 animate-in fade-in duration-200">
              
              {/* Section 1: Pending Agent Accounts */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-foreground">Pending Agent Account Approvals</h3>
                {users.filter(u => u.status === "Pending" && u.role === "Agent").length === 0 ? (
                  <div className="p-6 border border-border-base rounded-2xl text-center text-muted-text bg-background/30">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1.5" />
                    <p className="text-xs">No pending agent registration requests.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {users.filter(u => u.status === "Pending" && u.role === "Agent").map(u => (
                      <div key={u.id} className="p-5 border border-border-base bg-muted-bg/30 rounded-2xl flex justify-between items-start gap-4 hover:border-gold/50 transition-all glass">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-amber-500/10 text-amber-500 border border-amber-500/20">
                              Agent Signup
                            </span>
                            <span className="text-[10px] text-muted-text font-bold">Joined {u.dateJoined}</span>
                          </div>
                          <h4 className="font-extrabold text-sm text-foreground">{u.name}</h4>
                          <p className="text-xs text-muted-text">Email: {u.email}</p>
                          {u.phone && <p className="text-xs text-muted-text">Phone: {u.phone}</p>}
                          {u.cnic && (
                            <p className="text-xs text-foreground font-semibold">
                              CNIC: <span className="text-gold font-bold">{u.cnic}</span>
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col gap-2 shrink-0">
                          <button
                            onClick={() => {
                              updateUserStatus(u.id, "Active");
                              alert(`Agent account "${u.name}" approved successfully.`);
                            }}
                            className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Approve Agent</span>
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to reject and delete agent "${u.name}"?`)) {
                                deleteUser(u.id);
                              }
                            }}
                            className="py-1.5 px-3 border border-border-base hover:bg-red-600/10 text-muted-text hover:text-red-500 font-bold text-[10px] rounded-lg transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Section 2: Pending Agency Approvals */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-foreground">Pending Agency Firm Approvals</h3>
                {agencies.filter(a => a.status === "Pending").length === 0 ? (
                  <div className="p-6 border border-border-base rounded-2xl text-center text-muted-text bg-background/30">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1.5" />
                    <p className="text-xs">No pending agency registration requests.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {agencies.filter(a => a.status === "Pending").map(a => {
                      // Find corresponding user to check NTN
                      const userRec = users.find(u => u.email.toLowerCase() === a.email.toLowerCase());
                      return (
                        <div key={a.id} className="p-5 border border-border-base bg-muted-bg/30 rounded-2xl flex justify-between items-start gap-4 hover:border-gold/50 transition-all glass">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                Agency Signup
                              </span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded overflow-hidden bg-muted-bg border border-border-base shrink-0">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img 
                                  src={a.logo && !a.logo.startsWith("blob:") ? a.logo : `https://ui-avatars.com/api/?name=${encodeURIComponent(a.name)}&background=c5a85c&color=fff`} 
                                  alt={a.name} 
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(a.name)}&background=c5a85c&color=fff`;
                                  }}
                                  className="w-full h-full object-cover" 
                                />
                              </div>
                              <h4 className="font-extrabold text-sm text-foreground">{a.name}</h4>
                            </div>
                            <p className="text-xs text-muted-text">Email: {a.email}</p>
                            <p className="text-xs text-muted-text">Phone: {a.phone}</p>
                            {userRec?.ntn && (
                              <p className="text-xs text-foreground font-semibold">
                                NTN: <span className="text-gold font-bold">{userRec.ntn}</span>
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col gap-2 shrink-0">
                            <button
                              onClick={() => {
                                updateAgencyStatus(a.id, "Active");
                                alert(`Agency "${a.name}" approved successfully.`);
                              }}
                              className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>Approve Firm</span>
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to reject and delete agency "${a.name}"?`)) {
                                  deleteAgency(a.id);
                                  // Also delete corresponding user if exists
                                  if (userRec) deleteUser(userRec.id);
                                }
                              }}
                              className="py-1.5 px-3 border border-border-base hover:bg-red-600/10 text-muted-text hover:text-red-500 font-bold text-[10px] rounded-lg transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Section 3: Pending Property Allotment Reviews */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-foreground">Pending Property Allotment Reviews</h3>
                {properties.filter(p => p.isApproved === false).length === 0 ? (
                  <div className="p-10 border border-border-base rounded-2xl text-center text-muted-text bg-background/30">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    <p className="text-xs">No pending properties requiring administrative approvals.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {properties.filter(p => p.isApproved === false).map(p => (
                      <div key={p.id} className="p-5 border border-border-base bg-muted-bg/30 rounded-2xl space-y-4 flex flex-col md:flex-row justify-between gap-6 hover:border-gold/50 transition-all glass">
                        <div className="space-y-3 flex-grow">
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-amber-500/10 text-amber-500 border border-amber-500/20">
                              Pending Approval
                            </span>
                            {(() => {
                              const qual = calculateListingQuality(p);
                              let qColor = "text-red-500 bg-red-500/10 border-red-500/20";
                              if (qual.score >= 80) qColor = "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
                              else if (qual.score >= 50) qColor = "text-amber-500 bg-amber-500/10 border-amber-500/20";
                              return (
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${qColor}`}>
                                  Quality: {qual.score}%
                                </span>
                              );
                            })()}
                            <span className="text-[10px] text-muted-text font-bold uppercase tracking-wider">{p.type} • {p.size}</span>
                          </div>
                          <h4 className="font-extrabold text-base text-foreground">{p.title}</h4>
                          <p className="text-xs text-muted-text leading-relaxed">{p.description}</p>
                          
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-[10px] font-bold text-muted-text border-t border-border-base/50 pt-3">
                            <div>
                              <span className="block uppercase text-[8px] text-muted-text/75">Location</span>
                              <span className="text-foreground">{p.sector ? `${p.sector}, ` : ""}{p.location}</span>
                            </div>
                            <div>
                              <span className="block uppercase text-[8px] text-muted-text/75">Price Demand</span>
                              <span className="text-gold">
                                PKR {p.price >= 10000000 ? `${(p.price / 10000000).toFixed(2)} Crore` : `${(p.price / 100000).toFixed(0)} Lakh`}
                              </span>
                            </div>
                            <div>
                              <span className="block uppercase text-[8px] text-muted-text/75">Submitter Name</span>
                              <span className="text-foreground">{p.agent.name}</span>
                            </div>
                            <div>
                              <span className="block uppercase text-[8px] text-muted-text/75">Contact Phone</span>
                              <span className="text-foreground">{p.agent.phone}</span>
                            </div>
                          </div>

                          {/* Image Previews */}
                          {p.images && p.images.length > 0 && (
                            <div className="flex flex-wrap gap-2.5 pt-2">
                              {p.images.slice(0, 4).map((img, idx) => (
                                <div key={idx} className="relative w-16 h-12 rounded-lg overflow-hidden border border-border-base shrink-0 group">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={img} alt="Preview" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Approval Actions */}
                        <div className="flex flex-col justify-center gap-2 shrink-0 md:w-44 border-t md:border-t-0 md:border-l border-border-base/50 pt-4 md:pt-0 md:pl-6">
                          <button
                            onClick={() => {
                              approveProperty(p.id);
                              alert("Listing approved successfully and is now active on public directories.");
                            }}
                            className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center space-x-1.5 cursor-pointer shadow-md"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve & Publish</span>
                          </button>
                          <button
                            onClick={() => {
                              if (confirm("Are you sure you want to reject and delete this listing request?")) {
                                rejectProperty(p.id);
                              }
                            }}
                            className="w-full py-2 border border-border-base hover:bg-red-600/10 text-muted-text hover:text-red-500 font-bold text-xs rounded-lg transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Reject Request</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {activeSubTab === "blogs" && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-foreground">System Articles ({blogs.length})</h3>
              <div className="overflow-x-auto border border-border-base rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-muted-bg border-b border-border-base font-bold text-muted-text uppercase">
                      <th className="p-3">Title</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Published At</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {blogs.map(b => (
                      <tr key={b.slug} className="border-b border-border-base hover:bg-muted-bg/30">
                        <td className="p-3 font-bold text-foreground">{b.title}</td>
                        <td className="p-3">{b.category}</td>
                        <td className="p-3">{b.publishedAt}</td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => deleteBlog(b.slug)}
                            className="text-red-500 hover:text-red-700 font-bold"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSubTab === "leads" && (
            <CrmPortal />
          )}

          {activeSubTab === "ai-generator" && (
            <PropertyListingGenerator />
          )}

          {activeSubTab === "writeblog" && (
            <div className="rounded-xl border border-border-base p-6 bg-background/50 glass">
              <h3 className="text-lg font-bold text-foreground mb-4">Write & Publish an Article</h3>
              
              {blogSuccess ? (
                <div className="py-8 text-center space-y-3">
                  <div className="mx-auto w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center font-bold">✓</div>
                  <h4 className="font-bold text-foreground">Blog Published Successfully!</h4>
                  <p className="text-xs text-muted-text">The blog is synced and visible on the article hub.</p>
                </div>
              ) : (
                <form onSubmit={handleAddBlogSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-muted-text mb-1">Article Title</label>
                      <input 
                        type="text" required placeholder="e.g. DHA Bahawalpur Sector B Block Maps" 
                        value={blogTitle} onChange={e => setBlogTitle(e.target.value)}
                        className="w-full text-xs rounded-lg border border-border-base px-3 py-2 bg-muted-bg outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-muted-text mb-1">Category</label>
                      <select 
                        value={blogCategory} onChange={e => setBlogCategory(e.target.value as BlogPost["category"])}
                        className="w-full text-xs rounded-lg border border-border-base px-2 py-2.5 bg-muted-bg outline-none font-bold"
                      >
                        <option value="DHA Bahawalpur Updates">DHA Bahawalpur Updates</option>
                        <option value="Investment Guides">Investment Guides</option>
                        <option value="Property News">Property News</option>
                        <option value="Real Estate Tips">Real Estate Tips</option>
                        <option value="Market Analysis">Market Analysis</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-muted-text mb-1">Excerpt Summary</label>
                    <input 
                      type="text" placeholder="Short description summarizing this article..." 
                      value={blogExcerpt} onChange={e => setBlogExcerpt(e.target.value)}
                      className="w-full text-xs rounded-lg border border-border-base px-3 py-2 bg-muted-bg outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-muted-text mb-1">Article Content</label>
                    <textarea 
                      required placeholder="Write article content details here..." 
                      rows={5}
                      value={blogContent} onChange={e => setBlogContent(e.target.value)}
                      className="w-full text-xs rounded-lg border border-border-base px-3 py-2 bg-muted-bg outline-none resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-muted-text mb-1">Tags (comma separated)</label>
                    <input 
                      type="text" placeholder="DHA, Plots, Bahawalpur, Investments" 
                      value={blogTags} onChange={e => setBlogTags(e.target.value)}
                      className="w-full text-xs rounded-lg border border-border-base px-3 py-2 bg-muted-bg outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-2 bg-royal dark:bg-white text-white dark:text-royal font-bold text-xs rounded-lg"
                  >
                    Publish Blog Article
                  </button>
                </form>
              )}
            </div>
          )}

          {activeSubTab === "security" && (
            <div className="max-w-md mx-auto space-y-6 animate-in fade-in duration-200">
              <div className="p-6 border border-border-base bg-muted-bg/30 rounded-2xl space-y-5 glass text-left">
                <div className="text-center py-2 space-y-2">
                  <div className="mx-auto w-12 h-12 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center font-bold border border-red-500/20">
                    <Lock className="w-5 h-5 text-red-500" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">Super Admin Security Settings</h3>
                  <p className="text-xs text-muted-text">Change your password and manage administrative credentials.</p>
                </div>

                <form onSubmit={handlePasswordChangeSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-muted-text mb-1 text-left font-bold">Current Password</label>
                    <input 
                      type="password" 
                      required 
                      placeholder="Enter current password" 
                      value={currentPasswordInput} 
                      onChange={e => setCurrentPasswordInput(e.target.value)}
                      className="w-full text-xs rounded-lg border border-border-base px-3 py-2.5 bg-muted-bg outline-none focus:ring-1 focus:ring-gold font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-muted-text mb-1 text-left font-bold">New Password</label>
                    <input 
                      type="password" 
                      required 
                      placeholder="Enter new password" 
                      value={newPasswordInput} 
                      onChange={e => setNewPasswordInput(e.target.value)}
                      className="w-full text-xs rounded-lg border border-border-base px-3 py-2.5 bg-muted-bg outline-none focus:ring-1 focus:ring-gold font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-muted-text mb-1 text-left font-bold">Confirm New Password</label>
                    <input 
                      type="password" 
                      required 
                      placeholder="Confirm new password" 
                      value={confirmPasswordInput} 
                      onChange={e => setConfirmPasswordInput(e.target.value)}
                      className="w-full text-xs rounded-lg border border-border-base px-3 py-2.5 bg-muted-bg outline-none focus:ring-1 focus:ring-gold font-bold"
                    />
                  </div>

                  {securityError && (
                    <p className="text-xs text-red-500 font-bold text-center">{securityError}</p>
                  )}

                  {securitySuccess && (
                    <p className="text-xs text-emerald-500 font-bold text-center">✓ Password changed successfully!</p>
                  )}

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-gold hover:bg-gold-hover text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center justify-center space-x-1.5 cursor-pointer shadow-md font-bold"
                  >
                    <span>Update Credentials</span>
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
