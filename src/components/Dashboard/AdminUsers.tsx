"use client";

import React, { useState } from "react";
import { useAppState, UserRole, UserRecord } from "@/context/AppStateContext";
import { Search, Plus, Trash2, UserX, UserCheck, X, Mail, ShieldAlert, Eye, Calendar, Phone, Building2, ExternalLink, FileText, Flame } from "lucide-react";

export default function AdminUsers() {
  const { 
    users, 
    addUser,
    updateUserRole, 
    updateUserStatus, 
    deleteUser,
    userSession,
    properties 
  } = useAppState();

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  
  // Add User Form States
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState<UserRole>("Buyer");
  const [errorMessage, setErrorMessage] = useState("");

  // Filtered Users list
  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "All" || u.role === roleFilter;
    const matchesStatus = statusFilter === "All" || u.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Handle Add User Form Submission
  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!newUserName.trim() || !newUserEmail.trim()) {
      setErrorMessage("All fields are required.");
      return;
    }

    // Check if email already exists
    if (users.some(u => u.email.toLowerCase() === newUserEmail.trim().toLowerCase())) {
      setErrorMessage("A user with this email address already exists.");
      return;
    }

    addUser({
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      role: newUserRole
    });

    // Reset Form
    setNewUserName("");
    setNewUserEmail("");
    setNewUserRole("Buyer");
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Upper header action block */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-sm font-black text-foreground">User Directory</h3>
          <p className="text-[10px] text-muted-text mt-0.5">Manage permissions, user roles, and account statuses</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-royal hover:bg-royal-hover dark:bg-white dark:text-royal text-white text-xs font-bold rounded-lg flex items-center space-x-1.5 shadow-md cursor-pointer transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add User Account</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border border-border-base p-4 rounded-xl bg-background/30 glass">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-text pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs bg-muted-bg border border-border-base rounded-lg pl-9 pr-3 py-2.5 outline-none text-foreground placeholder:text-muted-text/70"
          />
        </div>

        <div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full text-xs bg-muted-bg border border-border-base rounded-lg px-3 py-2.5 outline-none font-bold text-foreground"
          >
            <option value="All">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Agent">Agent</option>
            <option value="Agency">Agency</option>
            <option value="Seller">Seller</option>
            <option value="Buyer">Buyer</option>
          </select>
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full text-xs bg-muted-bg border border-border-base rounded-lg px-3 py-2.5 outline-none font-bold text-foreground"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Suspended">Suspended</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Directory Table */}
      <div className="overflow-x-auto border border-border-base rounded-xl bg-background/50 glass">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-muted-bg border-b border-border-base font-bold text-muted-text uppercase">
              <th className="p-3.5">User</th>
              <th className="p-3.5">Joined Date</th>
              <th className="p-3.5">Role</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => {
              const isSelf = u.email.toLowerCase() === userSession.email.toLowerCase();
              return (
                <tr key={u.id} className="border-b border-border-base hover:bg-muted-bg/30 transition-all">
                  
                  {/* User Profile */}
                  <td className="p-3.5">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-royal to-royal-hover text-white flex items-center justify-center font-bold text-xs shrink-0 select-none uppercase">
                        {u.name.substring(0, 2)}
                      </div>
                      <div>
                        <div className="font-bold text-foreground flex items-center space-x-1.5">
                          <span>{u.name}</span>
                          {isSelf && (
                            <span className="px-1.5 py-0.5 text-[8px] bg-gold/20 text-gold border border-gold/30 rounded font-black uppercase">
                              Self
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-muted-text flex items-center space-x-1 mt-0.5">
                          <Mail className="w-3 h-3 text-muted-text/75" />
                          <span>{u.email}</span>
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Joined Date */}
                  <td className="p-3.5 text-muted-text font-medium">
                    {u.dateJoined}
                  </td>

                  {/* Role Dropdown */}
                  <td className="p-3.5">
                    {isSelf ? (
                      <span className="px-2.5 py-1 text-[10px] font-black tracking-wider bg-gold text-slate-950 rounded uppercase border border-gold/50">
                        {u.role}
                      </span>
                    ) : (
                      <select
                        value={u.role}
                        onChange={(e) => updateUserRole(u.id, e.target.value as UserRole)}
                        className="text-[10px] font-extrabold uppercase bg-muted-bg border border-border-base px-2 py-1 rounded outline-none text-foreground cursor-pointer focus:border-royal"
                      >
                        <option value="Buyer">Buyer</option>
                        <option value="Seller">Seller</option>
                        <option value="Agent">Agent</option>
                        <option value="Agency">Agency</option>
                        <option value="Admin">Admin</option>
                      </select>
                    )}
                  </td>

                  {/* Status Badge */}
                  <td className="p-3.5">
                    {(() => {
                      let style = "bg-emerald-500/10 text-emerald-500 border-emerald-500/25";
                      if (u.status === "Suspended") style = "bg-red-500/10 text-red-500 border-red-500/25";
                      if (u.status === "Pending") style = "bg-amber-500/10 text-amber-500 border-amber-500/25";
                      
                      return (
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-black tracking-wide border uppercase ${style}`}>
                          {u.status}
                        </span>
                      );
                    })()}
                  </td>

                  {/* Action Buttons */}
                  <td className="p-3.5 text-right whitespace-nowrap">
                    <div className="flex justify-end items-center space-x-2">
                      
                      {/* View Details button */}
                      {(u.role === "Agent" || u.role === "Agency") && (
                        <button
                          onClick={() => setSelectedUser(u)}
                          className="py-1 px-2.5 bg-royal/10 text-royal hover:bg-royal hover:text-white font-bold text-[10px] rounded flex items-center space-x-1 cursor-pointer transition-all border border-royal/20"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Details</span>
                        </button>
                      )}

                      {/* Approve button for Pending */}
                      {u.status === "Pending" && (
                        <button
                          onClick={() => {
                            updateUserStatus(u.id, "Active");
                            alert(`User "${u.name}" has been approved successfully.`);
                          }}
                          className="py-1 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded flex items-center space-x-1 cursor-pointer transition-colors shadow"
                          title="Approve User"
                        >
                          <UserCheck className="w-3 h-3" />
                          <span>Approve User</span>
                        </button>
                      )}

                      {/* Suspend/Activate toggle */}
                      {!isSelf && u.status !== "Pending" && (
                        <button
                          onClick={() => {
                            const newStatus = u.status === "Active" ? "Suspended" : "Active";
                            updateUserStatus(u.id, newStatus);
                          }}
                          className={`p-1.5 border border-border-base rounded hover:scale-105 transition-transform ${
                            u.status === "Active" 
                              ? "text-red-500 hover:bg-red-500/10" 
                              : "text-emerald-500 hover:bg-emerald-500/10"
                          }`}
                          title={u.status === "Active" ? "Suspend user" : "Activate user"}
                        >
                          {u.status === "Active" ? (
                            <UserX className="w-3.5 h-3.5" />
                          ) : (
                            <UserCheck className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}

                      {/* Delete account */}
                      {!isSelf && (
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to permanently delete user "${u.name}"? This action cannot be undone.`)) {
                              deleteUser(u.id);
                            }
                          }}
                          className="p-1.5 border border-border-base text-muted-text hover:text-red-600 hover:bg-red-600/10 rounded hover:scale-105 transition-transform"
                          title="Delete Account"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {isSelf && (
                        <span className="text-[10px] text-muted-text font-extrabold italic mr-2">
                          Restricted
                        </span>
                      )}

                    </div>
                  </td>

                </tr>
              );
            })}

            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={5} className="p-10 text-center text-muted-text">
                  <ShieldAlert className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                  <p className="text-xs">No registered users matching filters were found.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-border-base bg-white dark:bg-slate-950 p-6 shadow-2xl glass animate-in zoom-in-95 duration-200">
            
            <div className="flex justify-between items-start mb-6">
              <div>
                <h4 className="font-black text-foreground">Register User Account</h4>
                <p className="text-[10px] text-muted-text mt-0.5">Create a login and assign a network permission role</p>
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

            <form onSubmit={handleAddUser} className="space-y-4">
              
              <div>
                <label className="block text-[10px] font-bold uppercase text-muted-text mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Muhammad Asif"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full text-xs rounded-lg border border-border-base px-3 py-2.5 bg-muted-bg outline-none text-foreground focus:border-royal"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-muted-text mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. asif@yahoo.com"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full text-xs rounded-lg border border-border-base px-3 py-2.5 bg-muted-bg outline-none text-foreground focus:border-royal"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-muted-text mb-1">Network Role</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                  className="w-full text-xs rounded-lg border border-border-base px-2 py-2.5 bg-muted-bg outline-none font-bold text-foreground focus:border-royal"
                >
                  <option value="Buyer">Buyer (Investor)</option>
                  <option value="Seller">Seller (Property Owner)</option>
                  <option value="Agent">Agent (Sales Representative)</option>
                  <option value="Agency">Agency (Brokerage Partner)</option>
                  <option value="Admin">Admin (Super Administrator)</option>
                </select>
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
                  Create Account
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* View User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border-base bg-white dark:bg-slate-950 p-6 shadow-2xl glass animate-in zoom-in-95 duration-200 text-foreground">
            
            {/* Header */}
            <div className="flex justify-between items-start border-b border-border-base/50 pb-4 mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-royal to-royal-hover text-white flex items-center justify-center font-black text-lg select-none uppercase">
                  {selectedUser.name.substring(0, 2)}
                </div>
                <div>
                  <h3 className="text-base font-black text-foreground flex items-center gap-2">
                    <span>{selectedUser.name}</span>
                    <span className="px-2 py-0.5 text-[9px] bg-gold/20 text-gold border border-gold/30 rounded font-black uppercase tracking-wider">
                      {selectedUser.role}
                    </span>
                    {(() => {
                      let style = "bg-emerald-500/10 text-emerald-500 border-emerald-500/25";
                      if (selectedUser.status === "Suspended") style = "bg-red-500/10 text-red-500 border-red-500/25";
                      if (selectedUser.status === "Pending") style = "bg-amber-500/10 text-amber-500 border-amber-500/25";
                      return (
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black tracking-wider border uppercase ${style}`}>
                          {selectedUser.status}
                        </span>
                      );
                    })()}
                  </h3>
                  <p className="text-[10px] text-muted-text flex items-center space-x-1.5 mt-0.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Registered on {selectedUser.dateJoined}</span>
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedUser(null)}
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
                    Profile Details
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="block text-[9px] font-bold text-muted-text uppercase">Full Name / Owner</span>
                      <span className="font-bold text-foreground">{selectedUser.name}</span>
                    </div>
                    {selectedUser.companyName && (
                      <div>
                        <span className="block text-[9px] font-bold text-muted-text uppercase">Company/Firm Name</span>
                        <span className="font-bold text-foreground">{selectedUser.companyName}</span>
                      </div>
                    )}
                    <div>
                      <span className="block text-[9px] font-bold text-muted-text uppercase">Email Address</span>
                      <span className="font-medium text-foreground flex items-center gap-1 truncate">
                        <Mail className="w-3 h-3 text-muted-text shrink-0" />
                        <span className="truncate">{selectedUser.email}</span>
                      </span>
                    </div>
                    <div>
                      <span className="block text-[9px] font-bold text-muted-text uppercase">Phone Number</span>
                      <span className="font-bold text-foreground flex items-center gap-1">
                        <Phone className="w-3 h-3 text-muted-text" />
                        {selectedUser.phone || "N/A"}
                      </span>
                    </div>
                    {selectedUser.cnic && (
                      <div className="col-span-2">
                        <span className="block text-[9px] font-bold text-muted-text uppercase">CNIC (ID Card) Number</span>
                        <span className="font-mono font-bold text-foreground flex items-center gap-1.5 bg-muted-bg px-2.5 py-1 rounded w-fit mt-1 border border-border-base/55">
                          <FileText className="w-3.5 h-3.5 text-gold" />
                          {selectedUser.cnic}
                        </span>
                      </div>
                    )}
                    {selectedUser.ntn && (
                      <div className="col-span-2">
                        <span className="block text-[9px] font-bold text-muted-text uppercase">NTN (National Tax Number)</span>
                        <span className="font-mono font-bold text-foreground flex items-center gap-1.5 bg-muted-bg px-2.5 py-1 rounded w-fit mt-1 border border-border-base/55">
                          <FileText className="w-3.5 h-3.5 text-gold" />
                          {selectedUser.ntn}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* ID Card Images Section */}
                <div className="p-4 rounded-xl border border-border-base/60 bg-muted-bg/10 space-y-3.5">
                  <h4 className="text-[11px] font-black uppercase text-gold tracking-widest border-b border-border-base/30 pb-1.5">
                    Uploaded Identity verification Documents
                  </h4>
                  
                  {(selectedUser.idCardFront || selectedUser.idCardBack) ? (
                    <div className="grid grid-cols-2 gap-4">
                      {selectedUser.idCardFront && (
                        <div className="space-y-1">
                          <span className="text-[9px] font-black text-muted-text uppercase tracking-wider block text-center">Front View</span>
                          <div className="border border-border-base rounded-xl overflow-hidden bg-black/25 aspect-[1.58/1] relative group cursor-pointer hover:border-gold/50 transition-colors">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                              src={selectedUser.idCardFront} 
                              alt="Front ID Card" 
                              className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                              onClick={() => {
                                const w = window.open();
                                w?.document.write(`<img src="${selectedUser.idCardFront}" style="max-width:100%; max-height:100vh; display:block; margin:auto;" />`);
                              }}
                            />
                          </div>
                        </div>
                      )}
                      {selectedUser.idCardBack && (
                        <div className="space-y-1">
                          <span className="text-[9px] font-black text-muted-text uppercase tracking-wider block text-center">Back View</span>
                          <div className="border border-border-base rounded-xl overflow-hidden bg-black/25 aspect-[1.58/1] relative group cursor-pointer hover:border-gold/50 transition-colors">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                              src={selectedUser.idCardBack} 
                              alt="Back ID Card" 
                              className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                              onClick={() => {
                                const w = window.open();
                                w?.document.write(`<img src="${selectedUser.idCardBack}" style="max-width:100%; max-height:100vh; display:block; margin:auto;" />`);
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="py-6 text-center text-xs text-muted-text bg-muted-bg/30 border border-dashed border-border-base/50 rounded-xl">
                      No verification documents uploaded.
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Uploaded Listings list */}
              <div className="flex flex-col h-[400px] border border-border-base/60 bg-muted-bg/5 rounded-xl p-4 overflow-hidden">
                <h4 className="text-[11px] font-black uppercase text-gold tracking-widest border-b border-border-base/30 pb-1.5 mb-3 shrink-0">
                  Property Listings Directory
                </h4>
                
                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                  {(() => {
                    const userListings = properties.filter((p) => {
                      if (selectedUser.role === "Agency") {
                        return (
                          (selectedUser.companyName && p.contactDetails?.agencyName?.toLowerCase() === selectedUser.companyName.toLowerCase()) ||
                          p.agent.name.toLowerCase() === selectedUser.name.toLowerCase() ||
                          p.contactDetails?.name?.toLowerCase() === selectedUser.name.toLowerCase()
                        );
                      }
                      return (
                        p.agent.name.toLowerCase() === selectedUser.name.toLowerCase() ||
                        p.contactDetails?.name?.toLowerCase() === selectedUser.name.toLowerCase()
                      );
                    });

                    if (userListings.length === 0) {
                      return (
                        <div className="h-full flex flex-col items-center justify-center text-center text-muted-text space-y-2 py-10">
                          <Building2 className="w-8 h-8 text-muted-text/50" />
                          <p className="text-xs">No property listings uploaded by this account.</p>
                        </div>
                      );
                    }

                    return userListings.map((prop) => (
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
              {selectedUser.status === "Pending" && (
                <button
                  type="button"
                  onClick={() => {
                    updateUserStatus(selectedUser.id, "Active");
                    setSelectedUser({ ...selectedUser, status: "Active" });
                    alert(`User "${selectedUser.name}" has been approved successfully.`);
                  }}
                  className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg flex items-center space-x-1 cursor-pointer transition-colors shadow-md"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Approve Account</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setSelectedUser(null)}
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
