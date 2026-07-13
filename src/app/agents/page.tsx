"use client";

import React, { useState } from "react";
import { useAppState, Agent } from "@/context/AppStateContext";
import { 
  ChevronLeft, 
  User, 
  Award, 
  Mail, 
  Phone, 
  MessageSquare, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  X, 
  ExternalLink, 
  Eye, 
  TrendingUp, 
  Building, 
  LayoutDashboard
} from "lucide-react";

export default function AgentsPage() {
  const { 
    agents, 
    addAgent, 
    updateAgent, 
    deleteAgent, 
    properties, 
    leads, 
    userSession,
    users
  } = useAppState();

  const [searchQuery, setSearchQuery] = useState("");
  const [expFilter, setExpFilter] = useState("All");
  
  // Selected Agent for detail view
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  
  // Sub tab in Agent Dashboard
  const [dashboardTab, setDashboardTab] = useState<"overview" | "listings" | "leads">("overview");

  // Admin Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);

  // Form States
  const [formName, setFormName] = useState("");
  const [formPhoto, setFormPhoto] = useState("");
  const [formExperience, setFormExperience] = useState("");
  const [formSpecialization, setFormSpecialization] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formWhatsApp, setFormWhatsApp] = useState("");
  const [formBio, setFormBio] = useState("");

  const isAdmin = userSession.role === "Admin";
  const selectedAgent = agents.find(a => a.id === selectedAgentId);

  // Helper to fix legacy profiles that have Waqas or Unsplash image saved in data
  const getAgentPhoto = (agent: Agent) => {
    if (!agent) return "";
    if (agent.photo.startsWith("blob:")) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(agent.name)}&background=c5a85c&color=fff`;
    }
    const isWaqas = agent.name.toLowerCase().includes("waqas") || agent.name.toLowerCase().includes("ceo");
    const isFallbackPhoto = agent.photo === "/images/waqas_ceo.png" || 
                            agent.photo === "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80" ||
                            agent.photo === "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80";
    if (!isWaqas && isFallbackPhoto) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(agent.name)}&background=c5a85c&color=fff`;
    }
    return agent.photo;
  };

  // Helper to match agent names with potential variations (e.g. Chaudhary Waqas vs Waqas Ahmad Chaudhary)
  const isAgentMatch = (agentName: string, targetName: string) => {
    if (!agentName || !targetName) return false;
    const n1 = agentName.toLowerCase();
    const n2 = targetName.toLowerCase();
    if (n1 === n2) return true;
    
    // Check if both contain Waqas
    if (n1.includes("waqas") && n2.includes("waqas")) return true;
    
    // Check if both contain Ali
    if (n1.includes("ali") && n2.includes("ali") && !n1.includes("chaudhary") && !n2.includes("chaudhary")) return true;
    
    // Check if both contain Sajid
    if (n1.includes("sajid") && n2.includes("sajid")) return true;

    return false;
  };

  // Filtered Agents list
  const filteredAgents = agents.filter(agent => {
    // Exclude agents whose user account is pending or suspended
    const userRec = users.find(u => u.email.toLowerCase() === agent.email.toLowerCase());
    if (userRec && userRec.status !== "Active") return false;

    const matchesSearch = 
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.specialization.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesExp = true;
    if (expFilter === "Junior") {
      matchesExp = parseInt(agent.experience) <= 5;
    } else if (expFilter === "Senior") {
      const years = parseInt(agent.experience);
      matchesExp = years > 5 && years <= 10;
    } else if (expFilter === "Executive") {
      const years = parseInt(agent.experience);
      matchesExp = years > 10 || agent.experience.toLowerCase().includes("ceo");
    }

    return matchesSearch && matchesExp;
  });

  // Open Edit Modal
  const openEditModal = (agent: Agent, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingAgent(agent);
    setFormName(agent.name);
    setFormPhoto(agent.photo);
    setFormExperience(agent.experience);
    setFormSpecialization(agent.specialization);
    setFormEmail(agent.email);
    setFormPhone(agent.phone);
    setFormWhatsApp(agent.whatsApp);
    setFormBio(agent.bio);
    setShowEditModal(true);
  };

  // Handle Add Submit
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formSpecialization || !formEmail || !formPhone) {
      alert("Name, Specialization, Email and Phone details are required.");
      return;
    }

    addAgent({
      name: formName,
      photo: formPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(formName)}&background=c5a85c&color=fff`,
      experience: formExperience || "1 Year",
      specialization: formSpecialization,
      email: formEmail,
      phone: formPhone,
      whatsApp: formWhatsApp || formPhone,
      bio: formBio || `${formName} is a real estate consultant at Global Estate & Marketing.`
    });

    resetForm();
    setShowAddModal(false);
  };

  // Handle Edit Submit
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAgent || !formName || !formSpecialization || !formEmail || !formPhone) return;

    updateAgent({
      id: editingAgent.id,
      name: formName,
      photo: formPhoto,
      experience: formExperience,
      specialization: formSpecialization,
      email: formEmail,
      phone: formPhone,
      whatsApp: formWhatsApp,
      bio: formBio
    });

    resetForm();
    setShowEditModal(false);
    setEditingAgent(null);
  };

  // Handle Delete
  const handleDeleteAgent = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this agent profile? This will not delete their properties, but they will be unassigned in the system.")) {
      deleteAgent(id);
      if (selectedAgentId === id) setSelectedAgentId(null);
    }
  };

  const resetForm = () => {
    setFormName("");
    setFormPhoto("");
    setFormExperience("");
    setFormSpecialization("");
    setFormEmail("");
    setFormPhone("");
    setFormWhatsApp("");
    setFormBio("");
  };

  // Helper for generating WhatsApp link
  const getWhatsAppLink = (phone: string, name: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    let formattedPhone = cleanPhone;
    if (cleanPhone.startsWith("0")) {
      formattedPhone = "92" + cleanPhone.substring(1);
    } else if (!cleanPhone.startsWith("92") && cleanPhone.length > 0) {
      formattedPhone = "92" + cleanPhone;
    }
    const text = encodeURIComponent(`Hello ${name}, I saw your profile on Global Estate. I would like to consult on properties.`);
    return `https://wa.me/${formattedPhone}?text=${text}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* HEADER SECTION */}
      {!selectedAgentId ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-base pb-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-foreground">
              Meet Our Professional <span className="gold-gradient-text">Agents</span>
            </h1>
            <p className="text-sm text-muted-text mt-1.5">
              Consult with verified DHA Bahawalpur real estate specialists
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Admin Add Agent Button */}
            {isAdmin && (
              <button
                onClick={() => {
                  resetForm();
                  setShowAddModal(true);
                }}
                className="flex items-center space-x-2 bg-gold hover:bg-gold-hover text-slate-950 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add Agent</span>
              </button>
            )}

            {/* Role Helper text */}
            <span className="text-[10px] bg-muted-bg border border-border-base rounded-lg px-2.5 py-1.5 text-muted-text font-bold uppercase tracking-wider">
              Role: {userSession.role}
            </span>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setSelectedAgentId(null)}
          className="flex items-center space-x-2 text-xs font-bold text-muted-text hover:text-foreground transition-colors group mb-2"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Directory</span>
        </button>
      )}

      {/* VIEW 1: AGENTS GRID DIRECTORY */}
      {!selectedAgentId && (
        <div className="space-y-6">
          
          {/* SEARCH & FILTER BAR */}
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-muted-bg/10 p-4 rounded-2xl border border-border-base glass">
            
            {/* Search Input */}
            <div className="relative w-full sm:flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-muted-text" />
              <input
                type="text"
                placeholder="Search agent name or area of expertise..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2.5 text-xs rounded-xl border border-border-base bg-background/50 focus:bg-background outline-none w-full focus:ring-1 focus:ring-gold"
              />
            </div>

            {/* Experience Filter */}
            <div className="flex items-center space-x-2 w-full sm:w-auto shrink-0 bg-background/50 border border-border-base rounded-xl px-3 py-1.5 text-xs">
              <Award className="w-4 h-4 text-muted-text" />
              <span className="text-muted-text font-semibold">Experience:</span>
              <select
                value={expFilter}
                onChange={(e) => setExpFilter(e.target.value)}
                className="bg-transparent font-bold border-none outline-none pr-4 cursor-pointer bg-background dark:bg-slate-900"
              >
                <option value="All">All Tiers</option>
                <option value="Junior">Junior (1 - 5 Years)</option>
                <option value="Senior">Senior (6 - 10 Years)</option>
                <option value="Executive">Executive (10+ Years / CEO)</option>
              </select>
            </div>
          </div>

          {/* AGENTS LISTING GRID */}
          {filteredAgents.length === 0 ? (
            <div className="py-20 border border-dashed border-border-base rounded-3xl text-center space-y-3 glass">
              <User className="w-12 h-12 text-muted-text mx-auto opacity-50" />
              <h4 className="font-bold text-foreground">No agents match your criteria</h4>
              <p className="text-xs text-muted-text max-w-sm mx-auto">
                Try adjusting your search terms or filter constraints to see available advisors.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAgents.map(agent => {
                const agentListings = properties.filter(p => isAgentMatch(p.agent.name, agent.name));
                const agentLeads = leads.filter(l => isAgentMatch(l.agentId, agent.name));

                return (
                  <div
                    key={agent.id}
                    onClick={() => {
                      setSelectedAgentId(agent.id);
                      setDashboardTab("overview");
                    }}
                    className="group border border-border-base bg-background hover:bg-muted-bg/5 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col hover:-translate-y-1 relative"
                  >
                    
                    {/* Top Accent line */}
                    <div className="h-1 bg-gradient-to-r from-royal to-gold group-hover:scale-x-100 origin-left transition-transform" />

                    <div className="p-6 flex-1 flex flex-col space-y-4">
                      
                      {/* Avatar & Experience Badge */}
                      <div className="flex items-start justify-between">
                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gold/40 group-hover:border-gold transition-colors shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={getAgentPhoto(agent)}
                            alt={agent.name}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(agent.name)}&background=c5a85c&color=fff`;
                            }}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>

                        <span className="text-[9px] font-extrabold uppercase tracking-widest bg-gold/10 text-gold-accent px-2.5 py-1 rounded-full border border-gold/10">
                          {agent.experience} Exp
                        </span>
                      </div>

                      {/* Info Details */}
                      <div className="space-y-1.5">
                        <h3 className="font-black text-base text-foreground group-hover:text-gold transition-colors">
                          {agent.name}
                        </h3>
                        <p className="text-[10px] font-bold text-royal dark:text-royal-accent uppercase tracking-wider">
                          {agent.specialization.split("&")[0]}
                        </p>
                        <p className="text-xs text-muted-text line-clamp-2 leading-relaxed">
                          {agent.bio}
                        </p>
                      </div>

                      {/* Stat summary bar */}
                      <div className="grid grid-cols-3 gap-2 bg-muted-bg/25 border border-border-base/50 p-2.5 rounded-xl text-center text-xs font-semibold">
                        <div>
                          <span className="text-muted-text text-[9px] block uppercase">Listings</span>
                          <span className="font-black text-foreground mt-0.5 block">{agentListings.length}</span>
                        </div>
                        <div className="border-x border-border-base/50">
                          <span className="text-muted-text text-[9px] block uppercase">Active Leads</span>
                          <span className="font-black text-amber-600 mt-0.5 block">{agentLeads.filter(l => l.status !== "Closed").length}</span>
                        </div>
                        <div>
                          <span className="text-muted-text text-[9px] block uppercase">Closed Deals</span>
                          <span className="font-black text-emerald-600 mt-0.5 block">{agentLeads.filter(l => l.status === "Closed").length}</span>
                        </div>
                      </div>

                      {/* Contact Channels Panel */}
                      <div className="flex flex-col space-y-1.5 text-[10px] text-muted-text pt-2.5 border-t border-border-base/40">
                        <span className="flex items-center space-x-2">
                          <Phone className="w-3 h-3 text-gold" />
                          <span>{agent.phone}</span>
                        </span>
                        <span className="flex items-center space-x-2">
                          <Mail className="w-3 h-3 text-gold" />
                          <span className="truncate">{agent.email}</span>
                        </span>
                      </div>

                    </div>

                    {/* Footer Trigger panel */}
                    <div className="bg-muted-bg/40 border-t border-border-base px-6 py-3.5 flex justify-between items-center group-hover:bg-muted-bg/90 transition-colors">
                      <span className="text-[10px] font-black uppercase text-foreground/80 flex items-center space-x-1">
                        <span>Portal Dashboard</span>
                        <Eye className="w-3.5 h-3.5 ml-1 text-gold" />
                      </span>

                      {/* Admin Controls */}
                      {isAdmin && (
                        <div className="flex items-center space-x-1.5" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={(e) => openEditModal(agent, e)}
                            className="p-1.5 hover:bg-muted-bg text-royal dark:text-white rounded border border-border-base/60 transition-colors"
                            title="Edit Profile"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteAgent(agent.id, e)}
                            className="p-1.5 hover:bg-red-500/10 text-red-500 rounded border border-border-base/60 transition-colors"
                            title="Delete Profile"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* VIEW 2: SELECTED AGENT WORKSPACE */}
      {selectedAgentId && selectedAgent && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: DETAILED BIO CARD */}
          <div className="lg:col-span-4 space-y-6">
            <div className="border border-border-base rounded-3xl p-6 bg-background/50 glass space-y-6 relative overflow-hidden">
              
              {/* Gold glow decoration */}
              <div className="absolute top-0 left-0 w-24 h-24 bg-gold/5 rounded-full blur-2xl -translate-x-5 -translate-y-5" />

              <div className="text-center space-y-4 relative">
                
                {/* Large Photo */}
                <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-gold mx-auto shadow-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getAgentPhoto(selectedAgent)}
                    alt={selectedAgent.name}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedAgent.name)}&background=c5a85c&color=fff`;
                    }}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Name & Experience badge */}
                <div>
                  <h3 className="text-lg font-black text-foreground">{selectedAgent.name}</h3>
                  <span className="inline-block mt-1.5 text-[9px] font-bold tracking-wider uppercase px-2.5 py-0.5 bg-gold text-slate-950 rounded-full">
                    {selectedAgent.experience} Experience
                  </span>
                </div>

                <p className="text-xs font-bold text-royal dark:text-royal-accent uppercase tracking-wider border-y border-border-base/50 py-2">
                  Specialization: {selectedAgent.specialization}
                </p>
              </div>

              {/* Bio description */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-text">Professional Bio</h4>
                <p className="text-xs text-muted-text leading-relaxed text-justify">
                  {selectedAgent.bio}
                </p>
              </div>

              {/* Contact actions list */}
              <div className="space-y-3 pt-2">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-text">Contact Channels</h4>
                
                <div className="flex flex-col space-y-2 text-xs">
                  <a
                    href={`tel:${selectedAgent.phone}`}
                    className="flex items-center space-x-3 p-3 border border-border-base rounded-xl hover:bg-muted-bg/30 text-foreground transition-all"
                  >
                    <div className="p-1.5 bg-royal/10 text-royal dark:text-royal-accent rounded-lg">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-text block">Phone Number</span>
                      <span className="font-bold">{selectedAgent.phone}</span>
                    </div>
                  </a>

                  <a
                    href={`mailto:${selectedAgent.email}`}
                    className="flex items-center space-x-3 p-3 border border-border-base rounded-xl hover:bg-muted-bg/30 text-foreground transition-all"
                  >
                    <div className="p-1.5 bg-royal/10 text-royal dark:text-royal-accent rounded-lg">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-text block">Email Address</span>
                      <span className="font-bold truncate max-w-[170px] inline-block">{selectedAgent.email}</span>
                    </div>
                  </a>

                  <a
                    href={getWhatsAppLink(selectedAgent.phone, selectedAgent.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 p-3 border border-border-base rounded-xl hover:bg-muted-bg/30 text-foreground transition-all"
                  >
                    <div className="p-1.5 bg-emerald-500/10 text-emerald-500 rounded-lg">
                      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-text block">WhatsApp Consultation</span>
                      <span className="font-bold text-emerald-600 flex items-center">
                        <span>Chat Now</span>
                        <ExternalLink className="w-3 h-3 ml-1 opacity-60" />
                      </span>
                    </div>
                  </a>
                </div>
              </div>

            </div>
          </div>

          {/* RIGHT COLUMN: AGENT PORTAL WORKSPACE (DASHBOARD) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Tab Navbar Switcher */}
            <div className="flex items-center justify-between border-b border-border-base pb-3">
              <div className="flex space-x-1.5 bg-muted-bg/50 p-1.5 rounded-xl border border-border-base">
                {[
                  { id: "overview", name: "Analytics Dashboard", icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
                  { id: "listings", name: "Active Listings", icon: <Building className="w-3.5 h-3.5" /> },
                  { id: "leads", name: "Assigned Leads", icon: <MessageSquare className="w-3.5 h-3.5" /> }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setDashboardTab(tab.id as typeof dashboardTab)}
                    className={`flex items-center space-x-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                      dashboardTab === tab.id
                        ? "bg-royal text-white dark:bg-white dark:text-royal shadow-sm"
                        : "text-muted-text hover:bg-muted-bg"
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.name}</span>
                  </button>
                ))}
              </div>

              <span className="text-[10px] text-muted-text font-bold uppercase hidden sm:inline-block">
                Portal: {selectedAgent.name}
              </span>
            </div>

            {/* TAB 1: PERFORMANCE OVERVIEW (ANALYTICS) */}
            {dashboardTab === "overview" && (
              <div className="space-y-6">
                
                {/* Stat KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  
                  {/* Listings Count */}
                  {(() => {
                    const agentListings = properties.filter(p => isAgentMatch(p.agent.name, selectedAgent.name));
                    return (
                      <div className="p-5 border border-border-base rounded-2xl bg-muted-bg/30 dark:bg-slate-900/30 glass relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 rounded-full blur-xl translate-x-5 -translate-y-5" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-text block">Total Listings</span>
                        <h4 className="text-3xl font-black text-foreground mt-1.5">{agentListings.length}</h4>
                        <span className="text-[9px] text-muted-text font-semibold mt-2 block">Properties published</span>
                      </div>
                    );
                  })()}

                  {/* Leads Count */}
                  {(() => {
                    const agentLeads = leads.filter(l => isAgentMatch(l.agentId, selectedAgent.name));
                    return (
                      <div className="p-5 border border-border-base rounded-2xl bg-muted-bg/30 dark:bg-slate-900/30 glass relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/5 rounded-full blur-xl translate-x-5 -translate-y-5" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-text block">Total Leads</span>
                        <h4 className="text-3xl font-black text-amber-500 mt-1.5">{agentLeads.length}</h4>
                        <span className="text-[9px] text-amber-500/80 font-semibold mt-2 block">CRM client inquiries</span>
                      </div>
                    );
                  })()}

                  {/* Closed Deals Count */}
                  {(() => {
                    const closedDeads = leads.filter(l => isAgentMatch(l.agentId, selectedAgent.name) && l.status === "Closed");
                    return (
                      <div className="p-5 border border-border-base rounded-2xl bg-muted-bg/30 dark:bg-slate-900/30 glass relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-full blur-xl translate-x-5 -translate-y-5" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-text block">Closed Deals</span>
                        <h4 className="text-3xl font-black text-emerald-500 mt-1.5">{closedDeads.length}</h4>
                        <span className="text-[9px] text-emerald-500/80 font-semibold mt-2 block">Acquisitions completed</span>
                      </div>
                    );
                  })()}

                </div>

                {/* Leads Stage Ratio bar progress */}
                {(() => {
                  const agentLeads = leads.filter(l => isAgentMatch(l.agentId, selectedAgent.name));
                  const total = agentLeads.length;
                  const newLeads = agentLeads.filter(l => l.status === "New").length;
                  const contacted = agentLeads.filter(l => l.status === "Contacted").length;
                  const followUp = agentLeads.filter(l => l.status === "Follow Up").length;
                  const negotiation = agentLeads.filter(l => l.status === "Negotiation").length;
                  const closed = agentLeads.filter(l => l.status === "Closed").length;

                  const getPct = (count: number) => total > 0 ? Math.round((count / total) * 100) : 0;

                  return (
                    <div className="p-6 border border-border-base rounded-2xl bg-background/50 glass space-y-6">
                      <div>
                        <h4 className="font-bold text-sm text-foreground flex items-center space-x-2">
                          <TrendingUp className="w-4 h-4 text-gold" />
                          <span>Pipeline Deal Stages Ratio</span>
                        </h4>
                        <p className="text-[10px] text-muted-text mt-0.5">Summary of active CRM deals status assigned to agent</p>
                      </div>

                      {total === 0 ? (
                        <p className="text-xs text-muted-text italic text-center py-6">No leads assigned to calculate ratios.</p>
                      ) : (
                        <div className="space-y-4">
                          {[
                            { name: "New Leads", count: newLeads, pct: getPct(newLeads), color: "bg-blue-500" },
                            { name: "Contacted", count: contacted, pct: getPct(contacted), color: "bg-purple-500" },
                            { name: "Follow Up", count: followUp, pct: getPct(followUp), color: "bg-amber-500" },
                            { name: "Negotiation", count: negotiation, pct: getPct(negotiation), color: "bg-orange-500" },
                            { name: "Closed Deals", count: closed, pct: getPct(closed), color: "bg-emerald-500" }
                          ].map(stage => (
                            <div key={stage.name} className="space-y-1.5">
                              <div className="flex justify-between text-xs font-bold text-foreground">
                                <span>{stage.name}</span>
                                <span className="text-muted-text">{stage.count} ({stage.pct}%)</span>
                              </div>
                              <div className="h-2 rounded-full bg-muted-bg dark:bg-slate-800 overflow-hidden">
                                <div 
                                  className={`h-full rounded-full transition-all duration-1000 ${stage.color}`}
                                  style={{ width: `${stage.pct}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}

              </div>
            )}

            {/* TAB 2: ACTIVE LISTINGS */}
            {dashboardTab === "listings" && (
              <div className="space-y-4">
                {(() => {
                  const agentListings = properties.filter(p => isAgentMatch(p.agent.name, selectedAgent.name));

                  if (agentListings.length === 0) {
                    return (
                      <div className="py-12 border border-dashed border-border-base rounded-2xl text-center text-muted-text text-xs italic p-4">
                        No active properties listed under this agent.
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {agentListings.map(listing => (
                        <div key={listing.id} className="border border-border-base rounded-xl overflow-hidden bg-background/50 hover:bg-muted-bg/5 transition-all flex flex-col group">
                          {/* Image */}
                          <div className="h-36 relative overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={listing.images[0]}
                              alt={listing.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <span className="absolute top-2.5 left-2.5 text-[8px] font-bold uppercase tracking-wider bg-royal text-white px-2 py-0.5 rounded">
                              {listing.possessionStatus}
                            </span>
                            <span className="absolute top-2.5 right-2.5 text-[9px] font-black bg-gold text-slate-950 px-2 py-0.5 rounded shadow">
                              PKR {(listing.price / 100000).toFixed(1)} Lakh
                            </span>
                          </div>

                          {/* Info */}
                          <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                            <div>
                              <h4 className="font-bold text-xs text-foreground line-clamp-1 group-hover:text-gold transition-colors">{listing.title}</h4>
                              <p className="text-[9px] text-muted-text mt-0.5">{listing.location}</p>
                            </div>

                            <div className="flex items-center justify-between text-[9px] text-muted-text border-t border-border-base/40 pt-2.5">
                              <span>Size: {listing.size}</span>
                              {listing.bedrooms && (
                                <span>Beds: {listing.bedrooms} | Baths: {listing.bathrooms}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* TAB 3: ASSIGNED LEADS */}
            {dashboardTab === "leads" && (
              <div className="space-y-4">
                {(() => {
                  const agentLeads = leads.filter(l => isAgentMatch(l.agentId, selectedAgent.name));

                  if (agentLeads.length === 0) {
                    return (
                      <div className="py-12 border border-dashed border-border-base rounded-2xl text-center text-muted-text text-xs italic p-4">
                        No CRM leads assigned to this agent yet.
                      </div>
                    );
                  }

                  return (
                    <div className="border border-border-base rounded-2xl bg-background/50 overflow-hidden shadow-sm glass">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="border-b border-border-base text-[9px] font-bold uppercase tracking-wider text-muted-text bg-muted-bg/30">
                              <th className="p-3">Client Contact</th>
                              <th className="p-3">Interest Area</th>
                              <th className="p-3">Source Channel</th>
                              <th className="p-3">Deal Stage</th>
                              <th className="p-3 text-right">Notes</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border-base/50">
                            {agentLeads.map(lead => (
                              <tr key={lead.id} className="hover:bg-muted-bg/10">
                                <td className="p-3">
                                  <span className="font-bold text-foreground block">{lead.name}</span>
                                  <span className="text-[9px] text-muted-text block">{lead.phone}</span>
                                </td>
                                <td className="p-3 font-semibold text-foreground truncate max-w-[150px]">{lead.propertyInterested}</td>
                                <td className="p-3">
                                  <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-muted-bg text-muted-text">
                                    {lead.source}
                                  </span>
                                </td>
                                <td className="p-3">
                                  <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold ${
                                    lead.status === "New" ? "bg-blue-500/10 text-blue-500" :
                                    lead.status === "Contacted" ? "bg-purple-500/10 text-purple-500" :
                                    lead.status === "Follow Up" ? "bg-amber-500/10 text-amber-500" :
                                    lead.status === "Negotiation" ? "bg-orange-500/10 text-orange-500" :
                                    "bg-emerald-500/10 text-emerald-500"
                                  }`}>
                                    {lead.status}
                                  </span>
                                </td>
                                <td className="p-3 text-right font-semibold text-muted-text">
                                  {lead.notes?.length || 0} notes
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

          </div>

        </div>
      )}

      {/* --- ADMIN MODALS SECTION --- */}
      
      {/* 1. ADD AGENT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-background border border-border-base rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl overflow-hidden glass">
            
            <div className="p-5 border-b border-border-base flex justify-between items-center bg-muted-bg/10">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center">
                <Plus className="w-4 h-4 mr-1.5 text-gold animate-bounce" />
                <span>Add Professional Agent</span>
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-full hover:bg-muted-bg text-muted-text hover:text-foreground transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="space-y-1.5">
                  <label className="text-[10px] text-muted-text font-bold uppercase tracking-wide">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sajid Mahmood"
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    className="w-full text-xs border border-border-base rounded-xl p-2.5 bg-muted-bg/30 text-foreground focus:ring-1 focus:ring-gold outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-muted-text font-bold uppercase tracking-wide">Avatar/Photo URL</label>
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/..."
                    value={formPhoto}
                    onChange={e => setFormPhoto(e.target.value)}
                    className="w-full text-xs border border-border-base rounded-xl p-2.5 bg-muted-bg/30 text-foreground focus:ring-1 focus:ring-gold outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-muted-text font-bold uppercase tracking-wide">Experience Tier</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 5 Years or CEO - 15 Years"
                    value={formExperience}
                    onChange={e => setFormExperience(e.target.value)}
                    className="w-full text-xs border border-border-base rounded-xl p-2.5 bg-muted-bg/30 text-foreground focus:ring-1 focus:ring-gold outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-muted-text font-bold uppercase tracking-wide">Specialization Hub</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DHA Residential Villas"
                    value={formSpecialization}
                    onChange={e => setFormSpecialization(e.target.value)}
                    className="w-full text-xs border border-border-base rounded-xl p-2.5 bg-muted-bg/30 text-foreground focus:ring-1 focus:ring-gold outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-muted-text font-bold uppercase tracking-wide">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="sajid.mahmood@globalestate.com"
                    value={formEmail}
                    onChange={e => setFormEmail(e.target.value)}
                    className="w-full text-xs border border-border-base rounded-xl p-2.5 bg-muted-bg/30 text-foreground focus:ring-1 focus:ring-gold outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-muted-text font-bold uppercase tracking-wide">Phone Number</label>
                  <input
                    type="text"
                    required
                    placeholder="0321-5556677"
                    value={formPhone}
                    onChange={e => setFormPhone(e.target.value)}
                    className="w-full text-xs border border-border-base rounded-xl p-2.5 bg-muted-bg/30 text-foreground focus:ring-1 focus:ring-gold outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-muted-text font-bold uppercase tracking-wide">WhatsApp Contact</label>
                  <input
                    type="text"
                    placeholder="923215556677"
                    value={formWhatsApp}
                    onChange={e => setFormWhatsApp(e.target.value)}
                    className="w-full text-xs border border-border-base rounded-xl p-2.5 bg-muted-bg/30 text-foreground focus:ring-1 focus:ring-gold outline-none"
                  />
                </div>

              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-muted-text font-bold uppercase tracking-wide">Detailed Bio Remarks</label>
                <textarea
                  placeholder="Provide professional background, certifications, and target markets..."
                  rows={4}
                  value={formBio}
                  onChange={e => setFormBio(e.target.value)}
                  className="w-full text-xs border border-border-base rounded-xl p-2.5 bg-muted-bg/30 text-foreground focus:ring-1 focus:ring-gold outline-none resize-none"
                />
              </div>

              <div className="p-4 border-t border-border-base flex justify-end space-x-2 pt-4 bg-muted-bg/10">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="py-2 px-4 bg-muted-bg border border-border-base text-foreground text-xs font-bold rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-5 bg-gold hover:bg-gold-hover text-slate-950 text-xs font-bold rounded-lg transition-all shadow active:scale-95"
                >
                  Save Agent
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. EDIT AGENT MODAL */}
      {showEditModal && editingAgent && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-background border border-border-base rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl overflow-hidden glass">
            
            <div className="p-5 border-b border-border-base flex justify-between items-center bg-muted-bg/10">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center">
                <Edit3 className="w-4 h-4 mr-1.5 text-gold" />
                <span>Edit Profile: {editingAgent.name}</span>
              </h3>
              <button 
                onClick={() => {
                  setShowEditModal(false);
                  setEditingAgent(null);
                }}
                className="p-1 rounded-full hover:bg-muted-bg text-muted-text hover:text-foreground transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="space-y-1.5">
                  <label className="text-[10px] text-muted-text font-bold uppercase tracking-wide">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sajid Mahmood"
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    className="w-full text-xs border border-border-base rounded-xl p-2.5 bg-muted-bg/30 text-foreground focus:ring-1 focus:ring-gold outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-muted-text font-bold uppercase tracking-wide">Avatar/Photo URL</label>
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/..."
                    value={formPhoto}
                    onChange={e => setFormPhoto(e.target.value)}
                    className="w-full text-xs border border-border-base rounded-xl p-2.5 bg-muted-bg/30 text-foreground focus:ring-1 focus:ring-gold outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-muted-text font-bold uppercase tracking-wide">Experience Tier</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 5 Years or CEO - 15 Years"
                    value={formExperience}
                    onChange={e => setFormExperience(e.target.value)}
                    className="w-full text-xs border border-border-base rounded-xl p-2.5 bg-muted-bg/30 text-foreground focus:ring-1 focus:ring-gold outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-muted-text font-bold uppercase tracking-wide">Specialization Hub</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DHA Residential Villas"
                    value={formSpecialization}
                    onChange={e => setFormSpecialization(e.target.value)}
                    className="w-full text-xs border border-border-base rounded-xl p-2.5 bg-muted-bg/30 text-foreground focus:ring-1 focus:ring-gold outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-muted-text font-bold uppercase tracking-wide">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="sajid.mahmood@globalestate.com"
                    value={formEmail}
                    onChange={e => setFormEmail(e.target.value)}
                    className="w-full text-xs border border-border-base rounded-xl p-2.5 bg-muted-bg/30 text-foreground focus:ring-1 focus:ring-gold outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-muted-text font-bold uppercase tracking-wide">Phone Number</label>
                  <input
                    type="text"
                    required
                    placeholder="0321-5556677"
                    value={formPhone}
                    onChange={e => setFormPhone(e.target.value)}
                    className="w-full text-xs border border-border-base rounded-xl p-2.5 bg-muted-bg/30 text-foreground focus:ring-1 focus:ring-gold outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-muted-text font-bold uppercase tracking-wide">WhatsApp Contact</label>
                  <input
                    type="text"
                    placeholder="923215556677"
                    value={formWhatsApp}
                    onChange={e => setFormWhatsApp(e.target.value)}
                    className="w-full text-xs border border-border-base rounded-xl p-2.5 bg-muted-bg/30 text-foreground focus:ring-1 focus:ring-gold outline-none"
                  />
                </div>

              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-muted-text font-bold uppercase tracking-wide">Detailed Bio Remarks</label>
                <textarea
                  placeholder="Provide professional background, certifications, and target markets..."
                  rows={4}
                  value={formBio}
                  onChange={e => setFormBio(e.target.value)}
                  className="w-full text-xs border border-border-base rounded-xl p-2.5 bg-muted-bg/30 text-foreground focus:ring-1 focus:ring-gold outline-none resize-none"
                />
              </div>

              <div className="p-4 border-t border-border-base flex justify-end space-x-2 pt-4 bg-muted-bg/10">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingAgent(null);
                  }}
                  className="py-2 px-4 bg-muted-bg border border-border-base text-foreground text-xs font-bold rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-5 bg-gold hover:bg-gold-hover text-slate-950 text-xs font-bold rounded-lg transition-all shadow active:scale-95"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
