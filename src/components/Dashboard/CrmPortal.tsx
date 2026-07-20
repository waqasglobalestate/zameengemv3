"use client";

import React, { useState } from "react";
import { useAppState, LeadStatus, LeadSource } from "@/context/AppStateContext";
import { 
  ChevronLeft, 
  ChevronRight, 
  User, 
  Phone, 
  Mail, 
  Plus, 
  Trash2, 
  Briefcase, 
  TrendingUp, 
  PieChart, 
  ListFilter, 
  Search, 
  X, 
  MessageSquare, 
  Clock, 
  UserCheck, 
  ExternalLink,
  BarChart3,
  KanbanSquare
} from "lucide-react";

export default function CrmPortal() {
  const { 
    leads, 
    updateLeadStatus, 
    addLeadNote, 
    assignLeadAgent, 
    deleteLead 
  } = useAppState();

  const [activeTab, setActiveTab] = useState<"kanban" | "analytics">("kanban");
  const [searchQuery, setSearchQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState<string>("All");
  const [agentFilter, setAgentFilter] = useState<string>("All");
  
  // Modal State
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [newNoteText, setNewNoteText] = useState("");

  const activeLead = leads.find(l => l.id === selectedLeadId);

  // Available Agents list
  const AGENTS = ["Chaudhary Waqas", "Muhammad Ali", "Unassigned"];

  // CRM Status Columns
  const STATUS_COLUMNS: { id: LeadStatus; title: string; colorClass: string; bgClass: string; borderClass: string }[] = [
    { id: "New", title: "New Lead", colorClass: "text-blue-500", bgClass: "bg-blue-500/10", borderClass: "border-blue-500/20" },
    { id: "Contacted", title: "Contacted", colorClass: "text-purple-500", bgClass: "bg-purple-500/10", borderClass: "border-purple-500/20" },
    { id: "Follow Up", title: "Follow Up", colorClass: "text-amber-500", bgClass: "bg-amber-500/10", borderClass: "border-amber-500/20" },
    { id: "Negotiation", title: "Negotiation", colorClass: "text-orange-500", bgClass: "bg-orange-500/10", borderClass: "border-orange-500/20" },
    { id: "Closed", title: "Deal Closed", colorClass: "text-emerald-500", bgClass: "bg-emerald-500/10", borderClass: "border-emerald-500/20" }
  ];

  // Helper to transition leads
  const moveLead = (leadId: string, direction: "left" | "right") => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;
    
    const currentIndex = STATUS_COLUMNS.findIndex(c => c.id === lead.status);
    if (direction === "left" && currentIndex > 0) {
      updateLeadStatus(leadId, STATUS_COLUMNS[currentIndex - 1].id);
    } else if (direction === "right" && currentIndex < STATUS_COLUMNS.length - 1) {
      updateLeadStatus(leadId, STATUS_COLUMNS[currentIndex + 1].id);
    }
  };

  // Drag and Drop implementation
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStatus: LeadStatus) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData("text/plain");
    if (leadId) {
      updateLeadStatus(leadId, targetStatus);
    }
  };

  // Add a new note to lead
  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim() || !selectedLeadId) return;
    addLeadNote(selectedLeadId, newNoteText.trim());
    setNewNoteText("");
  };

  // Delete lead handler
  const handleDeleteLeadConfirm = (leadId: string) => {
    if (window.confirm("Are you sure you want to permanently delete this lead?")) {
      deleteLead(leadId);
      setSelectedLeadId(null);
    }
  };

  // Filtered leads for Kanban board view
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.propertyInterested.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSource = sourceFilter === "All" || lead.source === sourceFilter;
    const matchesAgent = agentFilter === "All" || 
      (agentFilter === "Unassigned" ? (lead.agentId === "Unassigned" || !lead.agentId) : lead.agentId === agentFilter);

    return matchesSearch && matchesSource && matchesAgent;
  });

  // Calculate analytics metrics
  const totalLeadsCount = leads.length;
  const closedLeadsCount = leads.filter(l => l.status === "Closed").length;
  const activePipelineCount = leads.filter(l => l.status !== "Closed").length;
  const conversionRate = totalLeadsCount > 0 ? ((closedLeadsCount / totalLeadsCount) * 100).toFixed(1) : "0.0";
  
  // Sources counts
  const sourceMetrics: { source: LeadSource; count: number; percentage: number }[] = (
    [
      { source: "Property Inquiry" as LeadSource, count: 0, percentage: 0 },
      { source: "Calculator Forms" as LeadSource, count: 0, percentage: 0 },
      { source: "Contact Forms" as LeadSource, count: 0, percentage: 0 },
      { source: "WhatsApp Clicks" as LeadSource, count: 0, percentage: 0 }
    ]
  ).map(m => {
    const count = leads.filter(l => l.source === m.source).length;
    const percentage = totalLeadsCount > 0 ? Math.round((count / totalLeadsCount) * 100) : 0;
    return { source: m.source, count, percentage };
  });

  // Status counts
  const statusMetrics = STATUS_COLUMNS.map(col => {
    const count = leads.filter(l => l.status === col.id).length;
    const percentage = totalLeadsCount > 0 ? Math.round((count / totalLeadsCount) * 100) : 0;
    return { ...col, count, percentage };
  });

  // Agent performance
  const agentMetrics = AGENTS.map(agent => {
    const assignedLeads = leads.filter(l => l.agentId === agent);
    const count = assignedLeads.length;
    const closed = assignedLeads.filter(l => l.status === "Closed").length;
    const rate = count > 0 ? ((closed / count) * 100).toFixed(0) : "0";
    return { name: agent, count, closed, conversionRate: rate };
  });

  // Helper for generating WhatsApp link
  const getWhatsAppLink = (phone: string, name: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    // Default country code 92 if it starts with 0 and has 10 digits
    let formattedPhone = cleanPhone;
    if (cleanPhone.startsWith("0")) {
      formattedPhone = "92" + cleanPhone.substring(1);
    } else if (!cleanPhone.startsWith("92") && cleanPhone.length > 0) {
      formattedPhone = "92" + cleanPhone;
    }
    const text = encodeURIComponent(`Hello ${name}, thank you for contacting Zameen Gem. How can we assist you today?`);
    return `https://wa.me/${formattedPhone}?text=${text}`;
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-base pb-5">
        <div className="flex items-center space-x-1 bg-muted-bg/50 p-1.5 rounded-xl border border-border-base w-fit">
          <button
            onClick={() => setActiveTab("kanban")}
            className={`flex items-center space-x-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === "kanban" 
                ? "bg-royal text-white dark:bg-white dark:text-royal shadow-sm" 
                : "text-muted-text hover:bg-muted-bg/85"
            }`}
          >
            <KanbanSquare className="w-4 h-4" />
            <span>Kanban Board</span>
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`flex items-center space-x-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === "analytics" 
                ? "bg-royal text-white dark:bg-white dark:text-royal shadow-sm" 
                : "text-muted-text hover:bg-muted-bg/85"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>CRM Analytics</span>
          </button>
        </div>

        {/* Filters Panel (Only shown in Kanban Tab) */}
        {activeTab === "kanban" && (
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-text/75" />
              <input
                type="text"
                placeholder="Search leads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 text-xs rounded-xl border border-border-base bg-muted-bg/20 focus:bg-background outline-none w-48 sm:w-56 focus:ring-1 focus:ring-gold"
              />
            </div>

            {/* Source Filter */}
            <div className="flex items-center space-x-1 bg-muted-bg/30 px-2 py-1 rounded-xl border border-border-base text-xs text-foreground">
              <ListFilter className="w-3.5 h-3.5 text-muted-text" />
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="bg-transparent font-bold border-none outline-none pr-2 cursor-pointer bg-background dark:bg-slate-900"
              >
                <option value="All">All Sources</option>
                <option value="Property Inquiry">Property Inquiry</option>
                <option value="Calculator Forms">Calculator Forms</option>
                <option value="Contact Forms">Contact Forms</option>
                <option value="WhatsApp Clicks">WhatsApp Clicks</option>
              </select>
            </div>

            {/* Agent Filter */}
            <div className="flex items-center space-x-1 bg-muted-bg/30 px-2 py-1 rounded-xl border border-border-base text-xs text-foreground">
              <User className="w-3.5 h-3.5 text-muted-text" />
              <select
                value={agentFilter}
                onChange={(e) => setAgentFilter(e.target.value)}
                className="bg-transparent font-bold border-none outline-none pr-2 cursor-pointer bg-background dark:bg-slate-900"
              >
                <option value="All">All Agents</option>
                {AGENTS.map(agent => (
                  <option key={agent} value={agent}>{agent}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* 2. TAB 1: KANBAN BOARD */}
      {activeTab === "kanban" && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
          {STATUS_COLUMNS.map(col => {
            const colLeads = filteredLeads.filter(l => l.status === col.id);
            
            return (
              <div 
                key={col.id} 
                className="flex flex-col min-w-[240px] max-h-[700px] border border-border-base rounded-2xl bg-muted-bg/15 dark:bg-slate-950/20 glass p-3 space-y-3"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.id)}
              >
                {/* Column Title Header */}
                <div className="flex items-center justify-between pb-2 border-b border-border-base/50">
                  <div className="flex items-center space-x-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${col.colorClass.split(" ")[0]} bg-current`} />
                    <span className="font-bold text-xs text-foreground">{col.title}</span>
                  </div>
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${col.bgClass} ${col.colorClass}`}>
                    {colLeads.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
                  {colLeads.length === 0 ? (
                    <div className="h-28 border border-dashed border-border-base rounded-xl flex items-center justify-center text-muted-text text-[10px] text-center p-4">
                      Drag leads here
                    </div>
                  ) : (
                    colLeads.map(lead => (
                      <div
                        key={lead.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, lead.id)}
                        onClick={() => setSelectedLeadId(lead.id)}
                        className="p-4 border border-border-base hover:border-gold/50 bg-background hover:bg-muted-bg/10 rounded-xl shadow-sm hover:shadow-md cursor-pointer transition-all hover:-translate-y-0.5 group relative"
                      >
                        {/* Lead Tag / Source */}
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-[8px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-md ${
                            lead.source === "Property Inquiry" ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400" :
                            lead.source === "Calculator Forms" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" :
                            lead.source === "WhatsApp Clicks" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
                            "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                          }`}>
                            {lead.source}
                          </span>
                          
                          <span className="text-[9px] text-muted-text/80">
                            {new Date(lead.createdAt).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                          </span>
                        </div>

                        {/* Name & Title */}
                        <h4 className="font-bold text-xs text-foreground group-hover:text-gold transition-colors">{lead.name}</h4>
                        <p className="text-[10px] text-muted-text mt-1 truncate" title={lead.propertyInterested}>
                          {lead.propertyInterested}
                        </p>

                        {/* Contact details */}
                        <div className="flex flex-col space-y-0.5 mt-2.5 border-t border-border-base/40 pt-2.5 text-[9px] text-muted-text">
                          <span className="flex items-center space-x-1">
                            <Phone className="w-2.5 h-2.5" />
                            <span>{lead.phone}</span>
                          </span>
                          {lead.email && lead.email !== "N/A" && (
                            <span className="flex items-center space-x-1">
                              <Mail className="w-2.5 h-2.5" />
                              <span className="truncate">{lead.email}</span>
                            </span>
                          )}
                        </div>

                        {/* Footer details: Agent & Notes Count */}
                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-border-base/30">
                          <div className="flex items-center space-x-1 text-[9px] font-semibold text-foreground/80">
                            <Briefcase className="w-2.5 h-2.5 text-muted-text" />
                            <span className="truncate max-w-[90px]">{lead.agentId || "Unassigned"}</span>
                          </div>

                          {lead.notes && lead.notes.length > 0 && (
                            <div className="flex items-center space-x-1 text-[9px] text-muted-text bg-muted-bg px-1.5 py-0.5 rounded text-foreground dark:text-foreground">
                              <MessageSquare className="w-2.5 h-2.5" />
                              <span>{lead.notes.length}</span>
                            </div>
                          )}
                        </div>

                        {/* Quick Action Chevrons (Mobile-friendly Click-to-Move) */}
                        <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 flex items-center bg-background border border-border-base rounded-md shadow-md p-0.5 transition-opacity z-10" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => moveLead(lead.id, "left")}
                            className="p-1 hover:bg-muted-bg text-muted-text hover:text-foreground rounded transition-colors disabled:opacity-30"
                            disabled={col.id === "New"}
                            title="Move Left"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>
                          <span className="h-3 w-px bg-border-base" />
                          <button
                            onClick={() => moveLead(lead.id, "right")}
                            className="p-1 hover:bg-muted-bg text-muted-text hover:text-foreground rounded transition-colors disabled:opacity-30"
                            disabled={col.id === "Closed"}
                            title="Move Right"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. TAB 2: CRM ANALYTICS */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          
          {/* Top 4 KPI Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-5 border border-border-base rounded-2xl bg-muted-bg/30 dark:bg-slate-900/30 glass relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl translate-x-5 -translate-y-5 group-hover:scale-125 transition-transform" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-text block">Total Leads Captured</span>
              <h4 className="text-3xl font-black text-foreground mt-1.5">{totalLeadsCount}</h4>
              <span className="text-[9px] text-blue-500 font-semibold mt-2 block">All active & closed channels</span>
            </div>

            <div className="p-5 border border-border-base rounded-2xl bg-muted-bg/30 dark:bg-slate-900/30 glass relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl translate-x-5 -translate-y-5 group-hover:scale-125 transition-transform" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-text block">Conversion Rate</span>
              <h4 className="text-3xl font-black text-emerald-500 mt-1.5">{conversionRate}%</h4>
              <span className="text-[9px] text-muted-text font-semibold mt-2 block">
                {closedLeadsCount} deals closed successfully
              </span>
            </div>

            <div className="p-5 border border-border-base rounded-2xl bg-muted-bg/30 dark:bg-slate-900/30 glass relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl translate-x-5 -translate-y-5 group-hover:scale-125 transition-transform" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-text block">Active Pipelines</span>
              <h4 className="text-3xl font-black text-purple-500 mt-1.5">{activePipelineCount}</h4>
              <span className="text-[9px] text-purple-400 font-semibold mt-2 block">Leads in negotiations/actions</span>
            </div>

            <div className="p-5 border border-border-base rounded-2xl bg-muted-bg/30 dark:bg-slate-900/30 glass relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gold/5 rounded-full blur-xl translate-x-5 -translate-y-5 group-hover:scale-125 transition-transform" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-text block">Avg Lead Interactions</span>
              <h4 className="text-3xl font-black text-gold mt-1.5">
                {(leads.reduce((acc, l) => acc + (l.notes?.length || 0), 0) / (totalLeadsCount || 1)).toFixed(1)}
              </h4>
              <span className="text-[9px] text-gold-accent font-semibold mt-2 block">Follow-up comments per lead</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Leads by Source & Lead Pipeline Status Distribution */}
            <div className="p-6 border border-border-base rounded-2xl bg-background/50 glass space-y-6">
              <div>
                <h4 className="font-bold text-sm text-foreground flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-gold" />
                  <span>Acquisition Channel Splits</span>
                </h4>
                <p className="text-[10px] text-muted-text mt-0.5">Distribution of lead records by source trigger</p>
              </div>

              <div className="space-y-4 pt-2">
                {sourceMetrics.map(item => (
                  <div key={item.source} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-foreground">
                      <span>{item.source}</span>
                      <span className="text-muted-text">{item.count} leads ({item.percentage}%)</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted-bg dark:bg-slate-800 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${
                          item.source === "Property Inquiry" ? "bg-cyan-500" :
                          item.source === "Calculator Forms" ? "bg-amber-500" :
                          item.source === "WhatsApp Clicks" ? "bg-emerald-500" :
                          "bg-purple-500"
                        }`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Leads Status Funnel Distribution */}
            <div className="p-6 border border-border-base rounded-2xl bg-background/50 glass space-y-6">
              <div>
                <h4 className="font-bold text-sm text-foreground flex items-center space-x-2">
                  <PieChart className="w-4 h-4 text-gold" />
                  <span>Pipeline Stage Densities</span>
                </h4>
                <p className="text-[10px] text-muted-text mt-0.5">Leads status spread throughout the sales pipeline</p>
              </div>

              <div className="space-y-4 pt-2">
                {statusMetrics.map(item => (
                  <div key={item.id} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-foreground">
                      <span className="flex items-center space-x-1.5">
                        <span className={`w-2 h-2 rounded-full ${item.colorClass.split(" ")[0]} bg-current`} />
                        <span>{item.title}</span>
                      </span>
                      <span className="text-muted-text">{item.count} ({item.percentage}%)</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted-bg dark:bg-slate-800 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${
                          item.id === "New" ? "bg-blue-500" :
                          item.id === "Contacted" ? "bg-purple-500" :
                          item.id === "Follow Up" ? "bg-amber-500" :
                          item.id === "Negotiation" ? "bg-orange-500" :
                          "bg-emerald-500"
                        }`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Agent Operations Overview */}
          <div className="p-6 border border-border-base rounded-2xl bg-background/50 glass space-y-4">
            <div>
              <h4 className="font-bold text-sm text-foreground flex items-center space-x-2">
                <UserCheck className="w-4 h-4 text-gold" />
                <span>Agent Performance Board</span>
              </h4>
              <p className="text-[10px] text-muted-text mt-0.5">Metrics monitoring of assigned real estate experts</p>
            </div>

            <div className="overflow-x-auto pt-2">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border-base text-[10px] font-bold uppercase tracking-wider text-muted-text">
                    <th className="pb-3">Representative Agent</th>
                    <th className="pb-3">Leads Handled</th>
                    <th className="pb-3">Deals Closed</th>
                    <th className="pb-3">Individual Conversion</th>
                    <th className="pb-3 text-right">Workload Spread</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-base/50 text-xs">
                  {agentMetrics.map(item => (
                    <tr key={item.name} className="hover:bg-muted-bg/10">
                      <td className="py-4 font-bold text-foreground">{item.name}</td>
                      <td className="py-4 font-semibold">{item.count} leads</td>
                      <td className="py-4 text-emerald-500 font-semibold">{item.closed} deals</td>
                      <td className="py-4 font-black">
                        <span className={`px-2 py-0.5 rounded ${
                          parseInt(item.conversionRate) >= 40 ? "bg-emerald-500/10 text-emerald-500" :
                          parseInt(item.conversionRate) > 0 ? "bg-amber-500/10 text-amber-500" :
                          "bg-muted-bg text-muted-text"
                        }`}>
                          {item.conversionRate}%
                        </span>
                      </td>
                      <td className="py-4 text-right font-semibold">
                        <div className="flex items-center justify-end space-x-2">
                          <span className="text-[10px] text-muted-text">
                            {totalLeadsCount > 0 ? Math.round((item.count / totalLeadsCount) * 100) : 0}%
                          </span>
                          <div className="w-16 h-1.5 bg-muted-bg dark:bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gold rounded-full" 
                              style={{ width: `${totalLeadsCount > 0 ? (item.count / totalLeadsCount) * 100 : 0}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* 4. LEAD DETAILS DIALOG / MODAL DRAWER */}
      {selectedLeadId && activeLead && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-background border border-border-base rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden glass">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-border-base flex justify-between items-center bg-muted-bg/10">
              <div>
                <span className={`text-[9px] font-bold tracking-wide uppercase px-2.5 py-0.5 rounded-md ${
                  activeLead.status === "New" ? "bg-blue-500/10 text-blue-500" :
                  activeLead.status === "Contacted" ? "bg-purple-500/10 text-purple-500" :
                  activeLead.status === "Follow Up" ? "bg-amber-500/10 text-amber-500" :
                  activeLead.status === "Negotiation" ? "bg-orange-500/10 text-orange-500" :
                  "bg-emerald-500/10 text-emerald-500"
                }`}>
                  {activeLead.status} Lead
                </span>
                <h3 className="text-base font-bold text-foreground mt-1.5">{activeLead.name}</h3>
              </div>
              
              <button 
                onClick={() => setSelectedLeadId(null)}
                className="p-1.5 rounded-full hover:bg-muted-bg text-muted-text hover:text-foreground transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Grid: Details & Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Details Section */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-muted-text uppercase tracking-wider">Lead Information</h4>
                  
                  <div className="space-y-3">
                    <div>
                      <span className="text-[10px] text-muted-text block">Interested In</span>
                      <span className="text-xs font-bold text-foreground">{activeLead.propertyInterested}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-muted-text block">Lead Source channel</span>
                      <span className="text-xs font-bold text-royal dark:text-royal-accent">{activeLead.source}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-muted-text block">Captured On</span>
                      <span className="text-xs font-bold text-foreground">
                        {new Date(activeLead.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Assignment & Contact Section */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-muted-text uppercase tracking-wider">Lead Management</h4>
                  
                  {/* Agent Selector */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-muted-text block">Assigned Representative</label>
                    <select
                      value={activeLead.agentId || "Unassigned"}
                      onChange={(e) => assignLeadAgent(activeLead.id, e.target.value)}
                      className="w-full text-xs font-bold border border-border-base rounded-xl p-2.5 bg-muted-bg/30 text-foreground focus:ring-1 focus:ring-gold outline-none bg-background dark:bg-slate-900"
                    >
                      {AGENTS.map(agent => (
                        <option key={agent} value={agent}>{agent}</option>
                      ))}
                    </select>
                  </div>

                  {/* Status Selector */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-muted-text block">Change Deal Stage</label>
                    <select
                      value={activeLead.status}
                      onChange={(e) => updateLeadStatus(activeLead.id, e.target.value as LeadStatus)}
                      className="w-full text-xs font-bold border border-border-base rounded-xl p-2.5 bg-muted-bg/30 text-foreground focus:ring-1 focus:ring-gold outline-none bg-background dark:bg-slate-900"
                    >
                      {STATUS_COLUMNS.map(col => (
                        <option key={col.id} value={col.id}>{col.title}</option>
                      ))}
                    </select>
                  </div>
                </div>

              </div>

              {/* Contact Methods Panel */}
              <div className="p-4 border border-border-base rounded-xl bg-muted-bg/20 space-y-3">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-text">Direct Client Communications</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <a
                    href={`tel:${activeLead.phone}`}
                    className="flex items-center justify-center space-x-2 py-2 px-3 bg-royal hover:bg-royal-hover text-white text-xs font-semibold rounded-lg transition-all"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call: {activeLead.phone}</span>
                  </a>
                  
                  {activeLead.phone && activeLead.phone !== "N/A" && (
                    <a
                      href={getWhatsAppLink(activeLead.phone, activeLead.name)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center space-x-2 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-all"
                    >
                      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                      <span>WhatsApp Chat</span>
                      <ExternalLink className="w-3 h-3 opacity-60" />
                    </a>
                  )}

                  {activeLead.email && activeLead.email !== "N/A" ? (
                    <a
                      href={`mailto:${activeLead.email}`}
                      className="flex items-center justify-center space-x-2 py-2 px-3 border border-border-base bg-background hover:bg-muted-bg/80 text-foreground text-xs font-semibold rounded-lg transition-all"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span className="truncate">Email Client</span>
                    </a>
                  ) : (
                    <div className="flex items-center justify-center space-x-2 py-2 px-3 border border-border-base bg-muted-bg/10 text-muted-text text-xs rounded-lg cursor-not-allowed">
                      <Mail className="w-3.5 h-3.5" />
                      <span>No Email Provided</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes Timeline Section */}
              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-bold text-muted-text uppercase tracking-wider flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Interaction History Timeline</span>
                </h4>

                {/* Timeline display */}
                <div className="relative pl-6 space-y-4 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-border-base">
                  {activeLead.notes && activeLead.notes.length > 0 ? (
                    activeLead.notes.map((note) => (
                      <div key={note.id} className="relative space-y-1">
                        {/* Bullet point */}
                        <div className="absolute -left-[20px] top-1 w-3 h-3 rounded-full bg-gold border-2 border-background shadow-sm" />
                        <p className="text-xs text-foreground bg-muted-bg/30 border border-border-base/50 p-3 rounded-xl leading-relaxed">
                          {note.note}
                        </p>
                        <span className="text-[9px] text-muted-text block pl-1">
                          {new Date(note.createdAt).toLocaleString()}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-text italic pl-2">No timeline notes added yet.</p>
                  )}
                </div>

                {/* Add Note Form */}
                <form onSubmit={handleAddNote} className="flex space-x-2 pt-2">
                  <input
                    type="text"
                    placeholder="Add follow-up notes/remarks..."
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    required
                    className="flex-1 text-xs border border-border-base rounded-xl px-4 py-2.5 bg-muted-bg/30 text-foreground outline-none focus:ring-1 focus:ring-gold"
                  />
                  <button
                    type="submit"
                    className="bg-gold hover:bg-gold-hover text-slate-950 font-bold px-4 rounded-xl text-xs flex items-center space-x-1.5 transition-all shadow-sm active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </form>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-border-base bg-muted-bg/10 flex justify-between items-center">
              <button
                onClick={() => handleDeleteLeadConfirm(activeLead.id)}
                className="flex items-center space-x-1.5 py-2 px-3 text-red-500 hover:text-red-700 hover:bg-red-500/5 text-xs font-bold rounded-lg transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Lead Record</span>
              </button>

              <button
                onClick={() => setSelectedLeadId(null)}
                className="py-2 px-5 bg-muted-bg hover:bg-muted-bg/80 border border-border-base text-foreground text-xs font-bold rounded-lg transition-all"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
