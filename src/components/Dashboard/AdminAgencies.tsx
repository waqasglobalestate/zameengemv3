"use client";

import React, { useState } from "react";
import { useAppState, AgencyRecord } from "@/context/AppStateContext";
import { Search, Plus, Trash2, CheckCircle2, UserX, UserCheck, X, Phone, Mail, ShieldAlert, Eye, Calendar, Building2, ExternalLink, FileText, Flame } from "lucide-react";

export default function AdminAgencies() {
  const { 
    agencies, 
    addAgency, 
    updateAgencyStatus, 
    deleteAgency,
    users,
    properties
  } = useAppState();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedAgency, setSelectedAgency] = useState<AgencyRecord | null>(null);

  // Add Agency Form States
  const [showAddModal, setShowAddModal] = useState(false);
  const [agencyName, setAgencyName] = useState("");
  const [agencyEmail, setAgencyEmail] = useState("");
  const [agencyPhone, setAgencyPhone] = useState("");
  const [agencyLogo, setAgencyLogo] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Filter agencies list
  const filteredAgencies = agencies.filter((a) => {
    const matchesSearch = 
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleRegisterAgency = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!agencyName.trim() || !agencyEmail.trim() || !agencyPhone.trim()) {
      setErrorMessage("Company Name, Email, and Phone are required.");
      return;
    }

    addAgency({
      name: agencyName.trim(),
      email: agencyEmail.trim(),
      phone: agencyPhone.trim(),
      logo: agencyLogo.trim() || "https://images.unsplash.com/photo-1554469384-e58fac16e23a?auto=format&fit=crop&w=150&q=80",
      status: "Active"
    });

    // Reset Form
    setAgencyName("");
    setAgencyEmail("");
    setAgencyPhone("");
    setAgencyLogo("");
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header and Add button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-sm font-black text-foreground">Agency Partners</h3>
          <p className="text-[10px] text-muted-text mt-0.5">Approve, audit, and onboarding commercial real estate networks</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-royal hover:bg-royal-hover dark:bg-white dark:text-royal text-white text-xs font-bold rounded-lg flex items-center space-x-1.5 shadow-md cursor-pointer transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Register New Firm</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-border-base p-4 rounded-xl bg-background/30 glass">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-text pointer-events-none" />
          <input
            type="text"
            placeholder="Search by company name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs bg-muted-bg border border-border-base rounded-lg pl-9 pr-3 py-2.5 outline-none text-foreground placeholder:text-muted-text/70"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full text-xs bg-muted-bg border border-border-base rounded-lg px-3 py-2.5 outline-none font-bold text-foreground"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Pending">Pending Approval</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Agencies Directory Table */}
      <div className="overflow-x-auto border border-border-base rounded-xl bg-background/50 glass">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-muted-bg border-b border-border-base font-bold text-muted-text uppercase">
              <th className="p-3.5">Agency</th>
              <th className="p-3.5">Contact Detail</th>
              <th className="p-3.5">Agents</th>
              <th className="p-3.5">Listings</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAgencies.map((a) => (
              <tr key={a.id} className="border-b border-border-base hover:bg-muted-bg/30 transition-all">
                
                {/* Agency Info */}
                <td className="p-3.5">
                  <div className="flex items-center space-x-3.5">
                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-border-base bg-muted-bg shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={a.logo} alt={a.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-foreground text-sm">{a.name}</h4>
                      <p className="text-[10px] text-muted-text flex items-center space-x-1 mt-0.5">
                        <Mail className="w-3 h-3 text-muted-text/75" />
                        <span>{a.email}</span>
                      </p>
                    </div>
                  </div>
                </td>

                {/* Contact phone */}
                <td className="p-3.5">
                  <p className="text-muted-text font-bold flex items-center space-x-1">
                    <Phone className="w-3.5 h-3.5 mr-1 text-muted-text/80" />
                    <span>{a.phone}</span>
                  </p>
                </td>

                {/* Agents Count */}
                <td className="p-3.5 font-bold text-foreground">
                  {a.agentsCount} agents
                </td>

                {/* Listings Count */}
                <td className="p-3.5 font-bold text-foreground">
                  {a.listingsCount} properties
                </td>

                {/* Status Badging */}
                <td className="p-3.5">
                  {(() => {
                    let style = "bg-emerald-500/10 text-emerald-500 border-emerald-500/25";
                    if (a.status === "Suspended") style = "bg-red-500/10 text-red-500 border-red-500/25";
                    if (a.status === "Pending") style = "bg-amber-500/10 text-amber-500 border-amber-500/25";
                    
                    return (
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-black tracking-wide border uppercase ${style}`}>
                        {a.status}
                      </span>
                    );
                  })()}
                </td>

                {/* Actions */}
                <td className="p-3.5 text-right whitespace-nowrap">
                  <div className="flex justify-end items-center space-x-2">
                    
                    {/* View Details button */}
                    <button
                      onClick={() => setSelectedAgency(a)}
                      className="py-1 px-2.5 bg-royal/10 text-royal hover:bg-royal hover:text-white font-bold text-[10px] rounded flex items-center space-x-1 cursor-pointer transition-all border border-royal/20"
                      title="View Details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Details</span>
                    </button>

                    {/* Approve button for Pending */}
                    {a.status === "Pending" && (
                      <button
                        onClick={() => {
                          updateAgencyStatus(a.id, "Active");
                          alert(`Agency "${a.name}" has been approved successfully.`);
                        }}
                        className="py-1 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded flex items-center space-x-1 cursor-pointer transition-colors shadow"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Approve Firm</span>
                      </button>
                    )}

                    {/* Suspend/Activate toggle */}
                    {a.status !== "Pending" && (
                      <button
                        onClick={() => {
                          const nextStatus = a.status === "Active" ? "Suspended" : "Active";
                          updateAgencyStatus(a.id, nextStatus);
                        }}
                        className={`p-1.5 border border-border-base rounded hover:scale-105 transition-transform ${
                          a.status === "Active" 
                            ? "text-red-500 hover:bg-red-500/10" 
                            : "text-emerald-500 hover:bg-emerald-500/10"
                        }`}
                        title={a.status === "Active" ? "Suspend Agency" : "Activate Agency"}
                      >
                        {a.status === "Active" ? (
                          <UserX className="w-3.5 h-3.5" />
                        ) : (
                          <UserCheck className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}

                    {/* Delete agency */}
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete agency "${a.name}"? This removes the brokerage from directory.`)) {
                          deleteAgency(a.id);
                        }
                      }}
                      className="p-1.5 border border-border-base text-muted-text hover:text-red-600 hover:bg-red-600/10 rounded hover:scale-105 transition-transform"
                      title="Delete Agency"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                  </div>
                </td>

              </tr>
            ))}

            {filteredAgencies.length === 0 && (
              <tr>
                <td colSpan={6} className="p-10 text-center text-muted-text">
                  <ShieldAlert className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                  <p className="text-xs">No registered agencies matching filters were found.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Agency Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-border-base bg-white dark:bg-slate-950 p-6 shadow-2xl glass animate-in zoom-in-95 duration-200">
            
            <div className="flex justify-between items-start mb-6">
              <div>
                <h4 className="font-black text-foreground">Onboard Agency Partner</h4>
                <p className="text-[10px] text-muted-text mt-0.5">Register a commercial brokerage firm and build listings channel</p>
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

            <form onSubmit={handleRegisterAgency} className="space-y-4">
              
              <div>
                <label className="block text-[10px] font-bold uppercase text-muted-text mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Landmark Properties"
                  value={agencyName}
                  onChange={(e) => setAgencyName(e.target.value)}
                  className="w-full text-xs rounded-lg border border-border-base px-3 py-2.5 bg-muted-bg outline-none text-foreground focus:border-royal"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-muted-text mb-1">Corporate Email</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. info@landmark.com"
                  value={agencyEmail}
                  onChange={(e) => setAgencyEmail(e.target.value)}
                  className="w-full text-xs rounded-lg border border-border-base px-3 py-2.5 bg-muted-bg outline-none text-foreground focus:border-royal"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-muted-text mb-1">Contact Phone</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 0300-1234567"
                  value={agencyPhone}
                  onChange={(e) => setAgencyPhone(e.target.value)}
                  className="w-full text-xs rounded-lg border border-border-base px-3 py-2.5 bg-muted-bg outline-none text-foreground focus:border-royal"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-muted-text mb-1">Logo Image Link (Optional)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={agencyLogo}
                  onChange={(e) => setAgencyLogo(e.target.value)}
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
                  Onboard Agency
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* View Agency Details Modal */}
      {selectedAgency && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border-base bg-white dark:bg-slate-950 p-6 shadow-2xl glass animate-in zoom-in-95 duration-200 text-foreground font-sans">
            
            {/* Header */}
            <div className="flex justify-between items-start border-b border-border-base/50 pb-4 mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-lg overflow-hidden border border-border-base bg-muted-bg shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={selectedAgency.logo} alt={selectedAgency.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="text-base font-black text-foreground flex items-center gap-2">
                    <span>{selectedAgency.name}</span>
                    <span className="px-2 py-0.5 text-[9px] bg-gold/20 text-gold border border-gold/30 rounded font-black uppercase tracking-wider">
                      Agency Partner
                    </span>
                    {(() => {
                      let style = "bg-emerald-500/10 text-emerald-500 border-emerald-500/25";
                      if (selectedAgency.status === "Suspended") style = "bg-red-500/10 text-red-500 border-red-500/25";
                      if (selectedAgency.status === "Pending") style = "bg-amber-500/10 text-amber-500 border-amber-500/25";
                      return (
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black tracking-wider border uppercase ${style}`}>
                          {selectedAgency.status}
                        </span>
                      );
                    })()}
                  </h3>
                  <p className="text-[10px] text-muted-text flex items-center space-x-1.5 mt-0.5">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Brokerage Firm ID: {selectedAgency.id}</span>
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedAgency(null)}
                className="p-1 border border-border-base rounded hover:bg-muted-bg text-muted-text transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Left Column: Owner & Document credentials */}
              <div className="space-y-5">
                <div className="p-4 rounded-xl border border-border-base/60 bg-muted-bg/10 space-y-3.5">
                  <h4 className="text-[11px] font-black uppercase text-gold tracking-widest border-b border-border-base/30 pb-1.5">
                    Agency & Owner Details
                  </h4>
                  {(() => {
                    const matchedUser = users.find(u => u.email.toLowerCase() === selectedAgency.email.toLowerCase());
                    return (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="block text-[9px] font-bold text-muted-text uppercase">Agency / Firm Name</span>
                          <span className="font-bold text-foreground">{selectedAgency.name}</span>
                        </div>
                        <div>
                          <span className="block text-[9px] font-bold text-muted-text uppercase">Agency Owner / Contact</span>
                          <span className="font-bold text-foreground">{matchedUser ? matchedUser.name : "N/A"}</span>
                        </div>
                        <div>
                          <span className="block text-[9px] font-bold text-muted-text uppercase">Email Address</span>
                          <span className="font-medium text-foreground flex items-center gap-1 truncate">
                            <Mail className="w-3 h-3 text-muted-text shrink-0" />
                            <span className="truncate">{selectedAgency.email}</span>
                          </span>
                        </div>
                        <div>
                          <span className="block text-[9px] font-bold text-muted-text uppercase">Phone Number</span>
                          <span className="font-bold text-foreground flex items-center gap-1">
                            <Phone className="w-3 h-3 text-muted-text" />
                            {selectedAgency.phone || (matchedUser?.phone) || "N/A"}
                          </span>
                        </div>
                        {matchedUser?.cnic && (
                          <div className="col-span-2">
                            <span className="block text-[9px] font-bold text-muted-text uppercase">Owner CNIC Number</span>
                            <span className="font-mono font-bold text-foreground flex items-center gap-1.5 bg-muted-bg px-2.5 py-1 rounded w-fit mt-1 border border-border-base/55">
                              <FileText className="w-3.5 h-3.5 text-gold" />
                              {matchedUser.cnic}
                            </span>
                          </div>
                        )}
                        {(matchedUser?.ntn || selectedAgency.id.startsWith("agency-")) && (
                          <div className="col-span-2">
                            <span className="block text-[9px] font-bold text-muted-text uppercase">NTN Tax Number</span>
                            <span className="font-mono font-bold text-foreground flex items-center gap-1.5 bg-muted-bg px-2.5 py-1 rounded w-fit mt-1 border border-border-base/55">
                              <FileText className="w-3.5 h-3.5 text-gold" />
                              {matchedUser?.ntn || "1234567-8"}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* ID Card Images Section */}
                <div className="p-4 rounded-xl border border-border-base/60 bg-muted-bg/10 space-y-3.5">
                  <h4 className="text-[11px] font-black uppercase text-gold tracking-widest border-b border-border-base/30 pb-1.5">
                    Owner Identity Verification Documents
                  </h4>
                  {(() => {
                    const matchedUser = users.find(u => u.email.toLowerCase() === selectedAgency.email.toLowerCase());
                    if (matchedUser && (matchedUser.idCardFront || matchedUser.idCardBack)) {
                      return (
                        <div className="grid grid-cols-2 gap-4">
                          {matchedUser.idCardFront && (
                            <div className="space-y-1">
                              <span className="text-[9px] font-black text-muted-text uppercase tracking-wider block text-center">Front View</span>
                              <div className="border border-border-base rounded-xl overflow-hidden bg-black/25 aspect-[1.58/1] relative group cursor-pointer hover:border-gold/50 transition-colors">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img 
                                  src={matchedUser.idCardFront} 
                                  alt="Front ID Card" 
                                  className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                                  onClick={() => {
                                    const w = window.open();
                                    w?.document.write(`<img src="${matchedUser.idCardFront}" style="max-width:100%; max-height:100vh; display:block; margin:auto;" />`);
                                  }}
                                />
                              </div>
                            </div>
                          )}
                          {matchedUser.idCardBack && (
                            <div className="space-y-1">
                              <span className="text-[9px] font-black text-muted-text uppercase tracking-wider block text-center">Back View</span>
                              <div className="border border-border-base rounded-xl overflow-hidden bg-black/25 aspect-[1.58/1] relative group cursor-pointer hover:border-gold/50 transition-colors">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img 
                                  src={matchedUser.idCardBack} 
                                  alt="Back ID Card" 
                                  className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                                  onClick={() => {
                                    const w = window.open();
                                    w?.document.write(`<img src="${matchedUser.idCardBack}" style="max-width:100%; max-height:100vh; display:block; margin:auto;" />`);
                                  }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    }
                    return (
                      <div className="py-6 text-center text-xs text-muted-text bg-muted-bg/30 border border-dashed border-border-base/50 rounded-xl">
                        No verification documents uploaded.
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Right Column: Uploaded Listings list */}
              <div className="flex flex-col h-[400px] border border-border-base/60 bg-muted-bg/5 rounded-xl p-4 overflow-hidden">
                <h4 className="text-[11px] font-black uppercase text-gold tracking-widest border-b border-border-base/30 pb-1.5 mb-3 shrink-0">
                  Affiliated Properties Listings
                </h4>
                
                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                  {(() => {
                    const matchedUser = users.find(u => u.email.toLowerCase() === selectedAgency.email.toLowerCase());
                    const agencyListings = properties.filter((p) => {
                      return (
                        p.contactDetails?.agencyName?.toLowerCase() === selectedAgency.name.toLowerCase() ||
                        (matchedUser && p.agent.name.toLowerCase() === matchedUser.name.toLowerCase()) ||
                        (matchedUser && p.contactDetails?.name?.toLowerCase() === matchedUser.name.toLowerCase())
                      );
                    });

                    if (agencyListings.length === 0) {
                      return (
                        <div className="h-full flex flex-col items-center justify-center text-center text-muted-text space-y-2 py-10">
                          <Building2 className="w-8 h-8 text-muted-text/50" />
                          <p className="text-xs">No property listings uploaded by this agency firm.</p>
                        </div>
                      );
                    }

                    return agencyListings.map((prop) => (
                      <div key={prop.id} className="flex items-center justify-between p-2 rounded-lg bg-muted-bg/40 border border-border-base/35 hover:bg-muted-bg/70 transition-colors gap-3">
                        <div className="flex items-center space-x-3 min-w-0">
                          <div className="w-12 h-10 rounded overflow-hidden border border-border-base shrink-0 bg-black/10">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={prop.images?.[0] || "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80"} alt={prop.title} className="w-full h-full object-cover" />
                          </div>
                          <div className="min-w-0">
                            <h5 className="text-[11px] font-black truncate text-foreground leading-tight" title={prop.title}>{prop.title}</h5>
                            <p className="text-[10px] text-muted-text truncate mt-0.5">{prop.location}</p>
                            <p className="text-[9px] text-gold font-bold mt-0.5">
                              PKR {prop.price >= 10000000 ? `${(prop.price / 10000000).toFixed(2)} Crore` : `${(prop.price / 100000).toFixed(1)} Lakh`}
                            </p>
                          </div>
                        </div>
                        <div className="text-right shrink-0 flex flex-col items-end gap-1">
                          <div className="flex gap-1 items-center">
                            <span className={`px-1.5 py-0.5 text-[8px] font-bold uppercase rounded text-white ${
                              prop.purpose === "Buy" ? "bg-royal" : prop.purpose === "Rent" ? "bg-amber-600" : "bg-emerald-600"
                            }`}>
                              {prop.purpose}
                            </span>
                            {prop.isHot && (
                              <span className="px-1 py-0.5 text-[8px] font-bold uppercase rounded bg-rose-600 text-white flex items-center gap-0.5">
                                <Flame className="w-2.5 h-2.5 fill-white text-white" />
                                <span>HOT</span>
                              </span>
                            )}
                          </div>
                          
                          <div className="text-[9px] text-muted-text font-medium flex items-center gap-1">
                            <Calendar className="w-2.5 h-2.5" />
                            <span>{prop.createdAt || "2026-07-20"}</span>
                          </div>
                          
                          <a 
                            href={`/properties/${prop.id}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[9px] font-black text-royal dark:text-white flex items-center space-x-0.5 hover:underline cursor-pointer"
                          >
                            <span>Inspect</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>

            </div>

            {/* Footer buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-border-base/50 mt-6">
              
              {/* Approve button inside modal if pending */}
              {selectedAgency.status === "Pending" && (
                <button
                  type="button"
                  onClick={() => {
                    updateAgencyStatus(selectedAgency.id, "Active");
                    setSelectedAgency({ ...selectedAgency, status: "Active" });
                    alert(`Agency "${selectedAgency.name}" has been approved successfully.`);
                  }}
                  className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg flex items-center space-x-1 cursor-pointer transition-colors shadow-md"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve Firm</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setSelectedAgency(null)}
                className="px-5 py-2 bg-muted-bg border border-border-base rounded-lg text-xs font-bold text-foreground hover:bg-border-base transition-colors"
              >
                Close Details
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
