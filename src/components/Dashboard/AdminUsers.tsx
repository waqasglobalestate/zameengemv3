"use client";

import React, { useState } from "react";
import { useAppState, UserRole } from "@/context/AppStateContext";
import { Search, Plus, Trash2, UserX, UserCheck, X, Mail, ShieldAlert } from "lucide-react";

export default function AdminUsers() {
  const { 
    users, 
    addUser,
    updateUserRole, 
    updateUserStatus, 
    deleteUser,
    userSession 
  } = useAppState();

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  
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

    </div>
  );
}
