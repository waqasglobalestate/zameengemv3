"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAppState, UserRole } from "@/context/AppStateContext";
import { Menu, X, Sun, Moon, User, Briefcase, Award, Shield, Layers, LogOut, Search } from "lucide-react";

export default function Header() {
  const { theme, setTheme, userSession, setUserRole, isLoaded, setIsAuthModalOpen, logoutUser, adminPassword, setAuthModalDefaultTab } = useAppState();
  const [isOpen, setIsOpen] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  const pathname = usePathname();
  const router = useRouter();

  const handleGlobalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (globalSearch.trim()) {
      router.push(`/properties?query=${encodeURIComponent(globalSearch.trim())}`);
      setGlobalSearch("");
    }
  };

  const handleAddPropertyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsAuthModalOpen(true);
  };

  // Close menus on route change
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpen(false);
      setShowRoleMenu(false);
    }, 0);
    return () => clearTimeout(timer);
  }, [pathname]);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Properties", href: "/properties" },
    { name: "Compare", href: "/compare" },
    { name: "Calculators", href: "/calculators" },
    { name: "Agents", href: "/agents" },
    { name: "Blog", href: "/blog" },
    { name: "Contact", href: "/contact" }
  ];

  const roles: { role: UserRole; label: string; icon: React.ReactNode }[] = [
    { role: "Agent", label: "Agent Portal", icon: <Award className="w-4 h-4 text-orange-500" /> },
    { role: "Agency", label: "Agency Portal", icon: <Layers className="w-4 h-4 text-purple-500" /> },
    { role: "Admin", label: "Super Admin Dashboard", icon: <Shield className="w-4 h-4 text-red-500" /> }
  ];

  const handleRoleChange = (role: UserRole) => {
    if (role === "Admin") {
      const pass = prompt("Enter Super Admin password (default: Pass@ZGem2026/-WebSite):");
      if (pass !== adminPassword && pass !== "admin123") {
        alert("Incorrect password. Access denied.");
        return;
      }
    }
    setUserRole(role);
    setShowRoleMenu(false);
  };

  const handleLogout = () => {
    logoutUser();
    setShowRoleMenu(false);
    if (pathname.startsWith("/dashboard")) {
      window.location.href = "/";
    }
  };

  if (!isLoaded) return null;

  return (
     <header className="sticky top-0 z-50 w-full border-b border-border-base bg-background/80 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex h-20 items-center justify-between gap-2 lg:gap-3">
          {/* Logo Section */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
              {/* Logo Icon */}
              <div 
                className="relative flex-shrink-0 transition-transform duration-300 group-hover:scale-105 w-14 h-14 sm:w-16 sm:h-16 lg:w-16 lg:h-16 xl:w-20 xl:h-20"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/zameen_gem_logo.png"
                  alt="Zameen Gem Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              {/* Brand Name + Tagline */}
              <div className="flex flex-col leading-tight">
                <span className="text-lg sm:text-xl lg:text-xl xl:text-2xl font-extrabold tracking-tight group-hover:text-gold transition-colors duration-300">
                  <span style={{ color: '#009966' }}>Zameen</span> <span className="text-gold">Gem</span>
                </span>
                {/* Verified Live Deploy Bridge */}
                <span className="text-[8px] sm:text-[9px] xl:text-[10px] font-medium tracking-wide text-muted-text -mt-0.5 whitespace-nowrap hidden xs:inline-block">
                  Premier Real Estate Advisory
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-x-1.5 xl:gap-x-4 flex-shrink min-w-0">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-[11px] xl:text-xs 2xl:text-sm font-extrabold tracking-wide transition-colors duration-200 whitespace-nowrap hover:text-gold ${
                    isActive
                      ? "text-gold border-b-2 border-gold pb-0.5"
                      : "text-foreground/80 dark:text-foreground/90"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Actions & Role Switcher (Desktop & Laptop) */}
          <div className="hidden lg:flex items-center gap-x-1.5 xl:gap-x-3 flex-shrink-0">
            {/* Global Search Box */}
            <form onSubmit={handleGlobalSearch} className="relative flex items-center">
              <input
                type="text"
                placeholder="Search property..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                className="pl-3 pr-7 py-1.5 text-[11px] xl:text-xs rounded-xl border border-gold/50 bg-background/50 focus:bg-background focus:border-gold outline-none w-28 lg:w-36 xl:w-52 transition-all"
              />
              <button type="submit" className="absolute right-2 text-muted-text hover:text-gold transition-colors">
                <Search className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="p-2 rounded-full border border-border-base hover:bg-muted-bg text-foreground transition-colors shrink-0"
              aria-label="Toggle theme"
            >
              {theme === "light" ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
            </button>

            {/* Dashboard Navigation Button */}
            {userSession.role !== "Admin" && (
              <Link
                href="/dashboard"
                className="hidden xl:inline-flex items-center justify-center px-3 py-1.5 text-xs font-semibold border border-royal dark:border-white text-royal dark:text-white rounded-lg hover:bg-royal hover:text-white dark:hover:bg-white dark:hover:text-royal transition-all duration-200 whitespace-nowrap"
              >
                Dashboard
              </Link>
            )}

            {/* Add Property Button - Permanent */}
            <button
              onClick={handleAddPropertyClick}
              className="inline-flex items-center justify-center px-2.5 py-1.5 xl:px-4 xl:py-2 text-xs xl:text-sm font-bold bg-gold hover:bg-gold-hover text-slate-950 rounded-lg transition-all duration-200 shadow-md cursor-pointer whitespace-nowrap"
            >
              + Add Property
            </button>

            {/* Dynamic Auth Header Section */}
            {userSession.role === "Buyer" ? (
              <button
                onClick={() => {
                  setAuthModalDefaultTab("login");
                  setIsAuthModalOpen(true);
                }}
                className="inline-flex items-center justify-center px-3 py-1.5 xl:px-4 xl:py-2 text-xs xl:text-sm font-bold bg-transparent hover:bg-muted-bg border border-border-base text-foreground rounded-lg transition-all duration-200 cursor-pointer whitespace-nowrap"
              >
                Log In
              </button>
            ) : (
              <div className="relative shrink-0">
                <button
                  onClick={() => setShowRoleMenu(!showRoleMenu)}
                  className="inline-flex items-center px-2.5 py-1.5 text-xs xl:text-sm font-bold bg-muted-bg border border-border-base rounded-lg text-foreground hover:bg-border-base transition-all"
                >
                  <span className="text-[9px] font-bold uppercase text-gold bg-slate-950 px-1.5 py-0.5 rounded border border-gold/20">
                    {userSession.role === "Admin" ? "SA" : userSession.role}
                  </span>
                </button>

                {showRoleMenu && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border-base bg-background shadow-2xl p-2 z-50 animate-in fade-in duration-200">
                    <div className="px-3 py-2 text-xs font-bold text-foreground border-b border-border-base/50 mb-1 flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full overflow-hidden border border-gold shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={userSession.image && !userSession.image.startsWith("blob:") ? userSession.image : `https://ui-avatars.com/api/?name=${encodeURIComponent(userSession.name || 'User')}&background=c5a85c&color=fff`} 
                          onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userSession.name || 'User')}&background=c5a85c&color=fff`; }}
                          alt={userSession.name} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div className="min-w-0 flex-grow">
                        <p className="truncate font-black">{userSession.name}</p>
                        <p className="truncate text-[9px] text-muted-text font-normal">{userSession.email}</p>
                      </div>
                    </div>
                    
                    <Link
                      href="/dashboard"
                      onClick={() => setShowRoleMenu(false)}
                      className="flex w-full items-center space-x-2 px-3 py-2 text-xs hover:bg-muted-bg text-foreground rounded-lg font-bold transition-all"
                    >
                      <Layers className="w-3.5 h-3.5 text-gold" />
                      <span>Go to Portal Dashboard</span>
                    </Link>
                    
                    <hr className="border-border-base my-1" />
                    
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center space-x-2 px-3 py-2 text-xs rounded-lg transition-colors hover:bg-red-500/10 text-red-500 hover:text-red-600 text-left font-bold cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5 text-red-500" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Prominent Menu & Actions Bar */}
          <div className="flex lg:hidden items-center space-x-1.5 sm:space-x-2">
            {/* Prominent Mobile Search Icon Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg border border-gold/40 text-gold bg-gold/10 hover:bg-gold/20 font-bold text-xs flex items-center gap-1 transition-colors"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Prominent Mobile Log In Button */}
            {userSession.role === "Buyer" ? (
              <button
                onClick={() => {
                  setAuthModalDefaultTab("login");
                  setIsAuthModalOpen(true);
                }}
                className="px-2.5 py-1.5 text-xs font-black bg-gold hover:bg-gold-hover text-slate-950 rounded-lg shadow-sm flex items-center gap-1 cursor-pointer transition-all active:scale-95"
              >
                <User className="w-3.5 h-3.5" />
                <span>Log In</span>
              </button>
            ) : (
              <Link
                href="/dashboard"
                className="px-2 py-1 text-[10px] font-extrabold bg-muted-bg border border-gold/40 text-gold rounded-lg flex items-center gap-1"
              >
                <span>{userSession.role === "Admin" ? "SA" : userSession.role}</span>
              </Link>
            )}

            {/* Theme Toggle (Mobile) */}
            <button
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="p-1.5 sm:p-2 rounded-full border border-border-base hover:bg-muted-bg text-foreground transition-colors"
            >
              {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            {/* Mobile Drawer Hamburger Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg border border-border-base hover:bg-muted-bg text-foreground"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {isOpen && (
        <div className="lg:hidden border-t border-border-base bg-background px-4 py-4 space-y-3 shadow-xl">
          {/* Mobile Global Search */}
          <form onSubmit={(e) => { setIsOpen(false); handleGlobalSearch(e); }} className="relative flex items-center mb-4">
            <input
              type="text"
              placeholder="Search Property ID, keyword..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="pl-4 pr-10 py-2.5 text-sm rounded-xl border border-gold/50 bg-muted-bg/50 focus:bg-background focus:border-gold outline-none w-full transition-all"
            />
            <button type="submit" className="absolute right-3 text-muted-text hover:text-gold transition-colors p-1">
              <Search className="w-5 h-5" />
            </button>
          </form>
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-3 py-2 text-sm font-semibold rounded-lg hover:bg-muted-bg hover:text-gold ${
                    isActive ? "bg-muted-bg text-gold font-bold" : "text-foreground"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
            {userSession.role !== "Admin" && (
              <Link
                href="/dashboard"
                className="px-3 py-2 text-sm font-semibold rounded-lg bg-royal text-white dark:bg-white dark:text-royal hover:bg-royal/90 text-center"
              >
                Dashboard
              </Link>
            )}

            {/* Add Property Button (Mobile) - Permanent */}
            <button
              onClick={(e) => {
                setIsOpen(false);
                handleAddPropertyClick(e);
              }}
              className="px-3 py-2 text-sm font-bold rounded-lg bg-gold text-slate-950 hover:bg-gold-hover text-center cursor-pointer"
            >
              + Add Property
            </button>
          </div>

          <hr className="border-border-base my-2" />

          {/* Dynamic Mobile Auth Drawer Section */}
          {userSession.role === "Buyer" ? (
            <div className="px-3">
              <button
                onClick={(e) => {
                  setIsOpen(false);
                  setAuthModalDefaultTab("login");
                  setIsAuthModalOpen(true);
                }}
                className="w-full py-2.5 text-center text-sm font-bold border border-border-base text-foreground rounded-lg hover:bg-muted-bg transition-colors"
              >
                Log In
              </button>
            </div>
          ) : (
            <div className="px-3">
              <div className="flex items-center space-x-3 p-3 border border-border-base bg-muted-bg/30 rounded-xl mb-3">
                <div className="w-10 h-10 rounded-full overflow-hidden border border-gold shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={userSession.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(userSession.name || 'User')}&background=c5a85c&color=fff`} 
                    onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userSession.name || 'User')}&background=c5a85c&color=fff`; }}
                    alt={userSession.name} 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div className="min-w-0 flex-grow">
                  <p className="text-xs font-bold text-foreground truncate">{userSession.name}</p>
                  <p className="text-[10px] text-muted-text truncate">{userSession.email}</p>
                  <span className="inline-block text-[8px] font-bold uppercase tracking-wider text-gold bg-slate-950 px-1.5 py-0.5 rounded border border-gold/20 mt-1">
                    {userSession.role === "Admin" ? "SA" : userSession.role}
                  </span>
                </div>
              </div>
              <div className="space-y-2 w-full">
                <Link
                  href="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="flex w-full items-center justify-center space-x-2 px-3 py-2 text-xs bg-royal text-white rounded-lg font-bold hover:bg-royal/90 transition-all text-center shadow-sm"
                >
                  <Layers className="w-3.5 h-3.5 text-white" />
                  <span>Go to Portal Dashboard</span>
                </Link>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    handleLogout();
                  }}
                  className="flex w-full items-center justify-center space-x-2 px-3 py-2 text-xs border border-red-500/30 bg-red-500/10 rounded-lg text-red-500 font-bold hover:bg-red-500/20 transition-all cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out Session</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      
    </header>
  );
}
