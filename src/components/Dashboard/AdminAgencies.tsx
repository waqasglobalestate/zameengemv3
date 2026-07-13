"use client";

import React, { useState } from "react";
import { useAppState } from "@/context/AppStateContext";
import { Search, Plus, Trash2, CheckCircle2, UserX, UserCheck, X, Phone, Mail, ShieldAlert } from "lucide-react";

export default function AdminAgencies() {
  const { 
    agencies, 
    addAgency, 
    updateAgencyStatus, 
    deleteAgency 
  } = useAppState();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

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

    </div>
  );
}
