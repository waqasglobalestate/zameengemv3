"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Property, initialProperties } from "@/data/initialProperties";
import { BlogPost, initialBlogs } from "@/data/initialBlogs";
import { getProperties, insertSupabaseProperty } from "@/utils/supabaseService";
import { supabase } from "@/utils/supabaseClient";

export type UserRole = "Buyer" | "Seller" | "Agent" | "Agency" | "Admin";

export interface Inquiry {
  id: string;
  propertyId?: string;
  propertyName?: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientMessage: string;
  agentName: string;
  status: "Pending" | "In Progress" | "Completed";
  createdAt: string;
}

export interface SavedSearch {
  id: string;
  purpose: string;
  location: string;
  type: string;
  minPrice?: number;
  maxPrice?: number;
  createdAt: string;
}

export type AccountPlan = "Free" | "Pro";

export interface UserSession {
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  companyName?: string;
  image: string;
  plan: AccountPlan;
  status?: "Active" | "Pending" | "Suspended";
}

export const PLAN_LIMITS: Record<AccountPlan, number> = {
  Free: 10,
  Pro: 100
};

// CRM Lead structures
export interface LeadNote {
  id: string;
  note: string;
  createdAt: string;
}

export type LeadStatus = "New" | "Contacted" | "Follow Up" | "Negotiation" | "Closed";
export type LeadSource = "Property Inquiry" | "Calculator Forms" | "Contact Forms" | "WhatsApp Clicks";

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  whatsApp: string; // WhatsApp number or "Yes"/"No"
  propertyInterested: string;
  source: LeadSource;
  status: LeadStatus;
  agentId: string; // Assigned agent name
  notes: LeadNote[];
  createdAt: string;
}

export interface Agent {
  id: string;
  name: string;
  photo: string;
  experience: string;
  specialization: string;
  email: string;
  phone: string;
  whatsApp: string;
  bio: string;
}

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: "Active" | "Suspended" | "Pending";
  dateJoined: string;
  phone?: string;
  cnic?: string;
  ntn?: string;
  companyName?: string;
  password?: string;
  image?: string;
  idCardFront?: string;
  idCardBack?: string;
}

export interface AgencyRecord {
  id: string;
  name: string;
  logo: string;
  agentsCount: number;
  listingsCount: number;
  phone: string;
  email: string;
  status: "Active" | "Pending" | "Suspended";
}

export interface AdCampaign {
  id: string;
  title: string;
  image: string;
  link: string;
  placement: "Sidebar" | "Banner" | "Popup";
  views: number;
  clicks: number;
  status: "Active" | "Paused" | "Expired";
}

interface AppStateContextProps {
  properties: Property[];
  blogs: BlogPost[];
  inquiries: Inquiry[];
  savedProperties: string[];
  savedSearches: SavedSearch[];
  recentlyViewed: string[];
  userSession: UserSession;
  theme: "light" | "dark";
  isLoaded: boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalDefaultTab: "login" | "signup";
  setAuthModalDefaultTab: (tab: "login" | "signup") => void;
  // Plan / subscription
  upgradeToPro: () => void;
  canAddProperty: () => { allowed: boolean; reason?: string; currentCount: number; limit: number };
  
  // CRM Lead state
  leads: Lead[];
  addLead: (lead: Omit<Lead, "id" | "status" | "notes" | "createdAt">) => void;
  updateLeadStatus: (id: string, status: LeadStatus) => void;
  addLeadNote: (id: string, noteText: string) => void;
  assignLeadAgent: (id: string, agentId: string) => void;
  deleteLead: (id: string) => void;

  // Agent management state
  agents: Agent[];
  addAgent: (agent: Omit<Agent, "id">) => void;
  updateAgent: (agent: Agent) => void;
  deleteAgent: (id: string) => void;

  addProperty: (property: Omit<Property, "id" | "viewsCount">) => void;
  approveProperty: (id: string) => void;
  rejectProperty: (id: string) => void;
  updateProperty: (property: Property) => void;
  deleteProperty: (id: string) => void;
  addInquiry: (inquiry: Omit<Inquiry, "id" | "status" | "createdAt">) => void;
  updateInquiryStatus: (id: string, status: Inquiry["status"]) => void;
  toggleSavedProperty: (id: string) => void;
  addSavedSearch: (search: Omit<SavedSearch, "id" | "createdAt">) => void;
  removeSavedSearch: (id: string) => void;
  addRecentlyViewed: (id: string) => void;
  setUserRole: (role: UserRole) => void;
  loginUser: (session: UserSession) => void;
  logoutUser: () => Promise<void> | void;
  adminPassword: string;
  changeAdminPassword: (newPass: string) => void;
  setTheme: (theme: "light" | "dark") => void;
  addBlog: (blog: BlogPost) => void;
  deleteBlog: (slug: string) => void;
  incrementViews: (id: string) => void;

  // Enterprise Admin state
  users: UserRecord[];
  agencies: AgencyRecord[];
  ads: AdCampaign[];
  addUser: (user: Omit<UserRecord, "id" | "dateJoined" | "status">) => void;
  updateUserRole: (id: string, role: UserRole) => void;
  updateUserStatus: (id: string, status: "Active" | "Suspended" | "Pending") => void;
  deleteUser: (id: string) => void;
  addAgency: (agency: Omit<AgencyRecord, "id" | "agentsCount" | "listingsCount">) => void;
  updateAgencyStatus: (id: string, status: "Active" | "Pending" | "Suspended") => void;
  deleteAgency: (id: string) => void;
  addAd: (ad: Omit<AdCampaign, "id" | "views" | "clicks">) => void;
  updateAdStatus: (id: string, status: "Active" | "Paused" | "Expired") => void;
  deleteAd: (id: string) => void;
  recordAdClick: (id: string) => void;
}

const defaultSession: UserSession = {
  name: "Chaudhary Waqas",
  email: "Globalrealestates786@gmail.com",
  phone: "+92300-0066255",
  role: "Buyer", // Default role
  companyName: "Zameen Gem",
  image: "/images/waqas_ceo.png",
  plan: "Free",
  status: "Active"
};

const AppStateContext = createContext<AppStateContextProps | undefined>(undefined);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [properties, setProperties] = useState<Property[]>(initialProperties);
  const [blogs, setBlogs] = useState<BlogPost[]>(initialBlogs);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [savedProperties, setSavedProperties] = useState<string[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);
  const [userSession, setUserSession] = useState<UserSession>(defaultSession);
  const [theme, setThemeState] = useState<"light" | "dark">("light");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [agencies, setAgencies] = useState<AgencyRecord[]>([]);
  const [ads, setAds] = useState<AdCampaign[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalDefaultTab, setAuthModalDefaultTab] = useState<"login" | "signup">("signup");
  const [adminPassword, setAdminPassword] = useState("Pass@ZGem2026/-WebSite");

  // Load from localStorage on client-side mount
  useEffect(() => {
    const init = async () => {
      try {
        const storedTheme = localStorage.getItem("gem-theme") as "light" | "dark";
        if (storedTheme) {
          setThemeState(storedTheme);
          document.documentElement.classList.toggle("dark", storedTheme === "dark");
        } else {
          // Default: Premium Light Theme
          setThemeState("light");
          document.documentElement.classList.toggle("dark", false);
        }

        const ensureMinViews = (list: Property[]) =>
          list.map((p) => ({
            ...p,
            viewsCount: (p.viewsCount && p.viewsCount > 0) ? p.viewsCount : Math.floor(Math.random() * 45) + 25
          }));

        getProperties()
          .then((dbProps) => {
            if (dbProps && dbProps.length > 0) {
              const clean = ensureMinViews(dbProps.filter((p: Property) => !p.id.startsWith("prop-")));
              setProperties(clean);
              localStorage.setItem("gem-properties", JSON.stringify(clean));
            } else {
              const storedProperties = localStorage.getItem("gem-properties");
              if (storedProperties) {
                const clean = ensureMinViews(JSON.parse(storedProperties).filter((p: Property) => !p.id.startsWith("prop-")));
                setProperties(clean);
                localStorage.setItem("gem-properties", JSON.stringify(clean));
              } else {
                setProperties([]);
                localStorage.setItem("gem-properties", JSON.stringify([]));
              }
            }
          })
          .catch((err) => {
            console.warn("Supabase fetch properties failed, using localStorage:", err);
            const storedProperties = localStorage.getItem("gem-properties");
            if (storedProperties) {
              const clean = ensureMinViews(JSON.parse(storedProperties).filter((p: Property) => !p.id.startsWith("prop-")));
              setProperties(clean);
              localStorage.setItem("gem-properties", JSON.stringify(clean));
            } else {
              setProperties([]);
              localStorage.setItem("gem-properties", JSON.stringify([]));
            }
          });

        const storedBlogs = localStorage.getItem("gem-blogs");
        if (storedBlogs) setBlogs(JSON.parse(storedBlogs));

        const storedInquiries = localStorage.getItem("gem-inquiries");
        if (storedInquiries) {
          const clean = JSON.parse(storedInquiries).filter((i: Inquiry) => i.id !== "inq-1" && i.id !== "inq-2");
          setInquiries(clean);
          localStorage.setItem("gem-inquiries", JSON.stringify(clean));
        } else {
          setInquiries([]);
          localStorage.setItem("gem-inquiries", JSON.stringify([]));
        }

        const storedSavedProps = localStorage.getItem("gem-saved-properties");
        if (storedSavedProps) setSavedProperties(JSON.parse(storedSavedProps));

        const storedSavedSearches = localStorage.getItem("gem-saved-searches");
        if (storedSavedSearches) setSavedSearches(JSON.parse(storedSavedSearches));

        const storedRecently = localStorage.getItem("gem-recently-viewed");
        if (storedRecently) setRecentlyViewed(JSON.parse(storedRecently));

        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const meta = session.user.user_metadata;
          if (typeof window !== "undefined" && window.location.hash) {
            window.history.replaceState(null, "", window.location.pathname + window.location.search);
          }
          let userRole: UserRole = (meta.role as UserRole) || "Buyer";
          
          const intendedRole = localStorage.getItem("gem-intended-role");
          if (intendedRole && !meta.role) {
            userRole = intendedRole as UserRole;
            localStorage.removeItem("gem-intended-role");
            localStorage.setItem("gem-needs-password", "true");
            supabase.auth.updateUser({
              data: { role: intendedRole, plan: "Free" }
            }).catch((err) => console.error("Failed to update role in Supabase:", err));
          }

          // Sync with local database lists
          let activeStatus: "Active" | "Pending" | "Suspended" = (userRole === "Agent" || userRole === "Agency") ? "Pending" : "Active";
          if (typeof window !== "undefined") {
            const storedUsersRaw = localStorage.getItem("gem-users");
            const currentUsers: UserRecord[] = storedUsersRaw ? JSON.parse(storedUsersRaw) : [];
            const userExists = currentUsers.some(u => u.email.toLowerCase() === session.user.email?.toLowerCase());
            if (!userExists && session.user.email) {
              const newName = meta.full_name || session.user.email.split("@")[0] || "User";
              const newUser: UserRecord = {
                id: `usr-${Date.now()}`,
                name: newName,
                email: session.user.email,
                role: userRole,
                status: activeStatus,
                dateJoined: new Date().toISOString().split("T")[0]
              };
              const updatedUsers = [...currentUsers, newUser];
              localStorage.setItem("gem-users", JSON.stringify(updatedUsers));
              setUsers(updatedUsers);

              if (userRole === "Agent") {
                const storedAgentsRaw = localStorage.getItem("gem-agents");
                const currentAgents: Agent[] = storedAgentsRaw ? JSON.parse(storedAgentsRaw) : [];
                const newAgent: Agent = {
                  id: `agent-${Date.now()}`,
                  name: newName,
                  photo: meta.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(newName)}&background=c5a85c&color=fff`,
                  experience: "1 Year",
                  specialization: "DHA Properties",
                  email: session.user.email,
                  phone: session.user.phone || meta.phone || "",
                  whatsApp: session.user.phone || meta.phone || "",
                  bio: "Verified Agent"
                };
                const updatedAgents = [...currentAgents, newAgent];
                localStorage.setItem("gem-agents", JSON.stringify(updatedAgents));
                setAgents(updatedAgents);
              } else if (userRole === "Agency") {
                const storedAgenciesRaw = localStorage.getItem("gem-agencies");
                const currentAgencies: AgencyRecord[] = storedAgenciesRaw ? JSON.parse(storedAgenciesRaw) : [];
                const newAgency: AgencyRecord = {
                  id: `agency-${Date.now()}`,
                  name: meta.companyName || "Apex Properties",
                  logo: meta.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(meta.companyName || "Agency")}&background=c5a85c&color=fff`,
                  agentsCount: 0,
                  listingsCount: 0,
                  phone: session.user.phone || meta.phone || "",
                  email: session.user.email,
                  status: "Pending"
                };
                const updatedAgencies = [...currentAgencies, newAgency];
                localStorage.setItem("gem-agencies", JSON.stringify(updatedAgencies));
                setAgencies(updatedAgencies);
              }
            } else if (userExists && session.user.email) {
              const matched = currentUsers.find(u => u.email.toLowerCase() === session.user.email?.toLowerCase());
              if (matched) activeStatus = matched.status;
            }
          }

          const mappedSession: UserSession = {
            name: meta.full_name || session.user.email?.split("@")[0] || "User",
            email: session.user.email || "",
            phone: session.user.phone || meta.phone || "",
            role: userRole,
            companyName: meta.companyName || (userRole === "Agency" ? "Apex Properties" : userRole === "Agent" ? "Independent Agent" : "Individual Seller"),
            image: meta.avatar_url || (userRole === "Admin" ? "/images/waqas_ceo.png" : `https://ui-avatars.com/api/?name=${encodeURIComponent(meta.full_name || session.user.email?.split("@")[0] || "User")}&background=c5a85c&color=fff`),
            plan: (meta.plan as AccountPlan) || "Free",
            status: activeStatus
          };
          setUserSession(mappedSession);
          localStorage.setItem("gem-user-session", JSON.stringify(mappedSession));
        } else {
          const storedSession = localStorage.getItem("gem-user-session");
          if (storedSession) {
            const parsed = JSON.parse(storedSession);
            if (parsed.image && (parsed.image.includes("photo-1519085360753-af0119f7cbe7") || parsed.image === "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80" || (parsed.image === "/images/waqas_ceo.png" && parsed.role !== "Admin"))) {
              parsed.image = parsed.role === "Admin" ? "/images/waqas_ceo.png" : `https://ui-avatars.com/api/?name=${encodeURIComponent(parsed.name || "User")}&background=c5a85c&color=fff`;
              localStorage.setItem("gem-user-session", JSON.stringify(parsed));
            }
            if (!parsed.plan) parsed.plan = "Free";
            setUserSession(parsed);
          }
        }

        const storedPass = localStorage.getItem("gem-admin-password");
        if (storedPass) {
          setAdminPassword(storedPass);
        }

        // Load or clear Leads
        const storedLeads = localStorage.getItem("gem-leads");
        if (storedLeads) {
          const clean = JSON.parse(storedLeads).filter((l: Lead) => !l.id.startsWith("lead-"));
          setLeads(clean);
          localStorage.setItem("gem-leads", JSON.stringify(clean));
        } else {
          setLeads([]);
          localStorage.setItem("gem-leads", JSON.stringify([]));
        }
        
        // Load or seed Agents (keeping real CEO Waqas Ahmad)
        const seedAgents: Agent[] = [
          {
            id: "agent-1",
            name: "Waqas Ahmad Chaudhary",
            photo: "/images/waqas_ceo.png",
            experience: "15 Years",
            specialization: "DHA Bahawalpur Plots & Commercial Projects",
            email: "Globalrealestates786@gmail.com",
            phone: "+92300-0066255",
            whatsApp: "923000066255",
            bio: "Chaudhary Waqas Ahmad is the CEO and founder of Zameen Gem. With over 15 years of seasoned expertise in the Pakistani real estate sector, he specializes in high-value investments in DHA Bahawalpur and strategic commercial zoning."
          }
        ];
        const storedAgents = localStorage.getItem("gem-agents");
        if (storedAgents) {
          const parsed: Agent[] = JSON.parse(storedAgents);
          const filtered = parsed.filter(a => a.id === "agent-1" || (!["agent-2", "agent-3"].includes(a.id) && a.email !== "muhammad.ali@globalestate.com" && a.email !== "sajid.mahmood@globalestate.com"));
          const updated = filtered.map(a => a.id === "agent-1" ? { ...a, bio: a.bio.replace(/Global Estate & Marketing/g, "Zameen Gem") } : a);
          const finalAgents = updated.length > 0 ? updated : seedAgents;
          setAgents(finalAgents);
          localStorage.setItem("gem-agents", JSON.stringify(finalAgents));
        } else {
          setAgents(seedAgents);
          localStorage.setItem("gem-agents", JSON.stringify(seedAgents));
        }

        // Load or seed Users (keeping Admin Chaudhary Waqas)
        const seedUsers: UserRecord[] = [
          {
            id: "usr-1",
            name: "Chaudhary Waqas",
            email: "Globalrealestates786@gmail.com",
            role: "Admin",
            status: "Active",
            dateJoined: "2024-01-15"
          }
        ];
        const storedUsers = localStorage.getItem("gem-users");
        if (storedUsers) {
          const parsed: UserRecord[] = JSON.parse(storedUsers).filter((u: UserRecord) => u.id === "usr-1" || (!["usr-2", "usr-3", "usr-4", "usr-5"].includes(u.id) && u.email !== "muhammad.ali@globalestate.com" && u.email !== "sajid.mahmood@globalestate.com" && u.email !== "info@apexdev.com"));
          const finalUsers = parsed.length > 0 ? parsed : seedUsers;
          setUsers(finalUsers);
          localStorage.setItem("gem-users", JSON.stringify(finalUsers));
        } else {
          setUsers(seedUsers);
          localStorage.setItem("gem-users", JSON.stringify(seedUsers));
        }

        // Load or clear Agencies
        const storedAgencies = localStorage.getItem("gem-agencies");
        if (storedAgencies) {
          const clean = JSON.parse(storedAgencies).filter((ag: AgencyRecord) => !["agency-1", "agency-2", "agency-3"].includes(ag.id));
          setAgencies(clean);
          localStorage.setItem("gem-agencies", JSON.stringify(clean));
        } else {
          setAgencies([]);
          localStorage.setItem("gem-agencies", JSON.stringify([]));
        }

        // Load or clear Advertisements
        const storedAds = localStorage.getItem("gem-ads");
        if (storedAds) {
          const clean = JSON.parse(storedAds).filter((ad: AdCampaign) => !["ad-1", "ad-2", "ad-3"].includes(ad.id));
          setAds(clean);
          localStorage.setItem("gem-ads", JSON.stringify(clean));
        } else {
          setAds([]);
          localStorage.setItem("gem-ads", JSON.stringify([]));
        }

      } catch (e) {
        console.error("Failed to load local storage state", e);
      }
      setIsLoaded(true);
    };

    const timer = setTimeout(init, 0);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        const meta = session.user.user_metadata;
        if (typeof window !== "undefined" && window.location.hash) {
          window.history.replaceState(null, "", window.location.pathname + window.location.search);
        }
        let userRole: UserRole = (meta.role as UserRole) || "Buyer";
        
        const intendedRole = localStorage.getItem("gem-intended-role");
        if (intendedRole && !meta.role) {
          userRole = intendedRole as UserRole;
          localStorage.removeItem("gem-intended-role");
          localStorage.setItem("gem-needs-password", "true");
          supabase.auth.updateUser({
            data: { role: intendedRole, plan: "Free" }
          }).catch((err) => console.error("Failed to update role in Supabase:", err));
        }

        // Sync with local database lists
        let activeStatus: "Active" | "Pending" | "Suspended" = (userRole === "Agent" || userRole === "Agency") ? "Pending" : "Active";
        let activeImage: string = meta.avatar_url || (userRole === "Admin" ? "/images/waqas_ceo.png" : `https://ui-avatars.com/api/?name=${encodeURIComponent(meta.full_name || session.user.email?.split("@")[0] || "User")}&background=c5a85c&color=fff`);
        if (typeof window !== "undefined") {
          const storedUsersRaw = localStorage.getItem("gem-users");
          const currentUsers: UserRecord[] = storedUsersRaw ? JSON.parse(storedUsersRaw) : [];
          const userExists = currentUsers.some(u => u.email.toLowerCase() === session.user.email?.toLowerCase());
          if (!userExists && session.user.email) {
            const newName = meta.full_name || session.user.email.split("@")[0] || "User";
            const newUser: UserRecord = {
              id: `usr-${Date.now()}`,
              name: newName,
              email: session.user.email,
              role: userRole,
              status: activeStatus,
              dateJoined: new Date().toISOString().split("T")[0]
            };
            const updatedUsers = [...currentUsers, newUser];
            localStorage.setItem("gem-users", JSON.stringify(updatedUsers));
            setUsers(updatedUsers);

            if (userRole === "Agent") {
              const storedAgentsRaw = localStorage.getItem("gem-agents");
              const currentAgents: Agent[] = storedAgentsRaw ? JSON.parse(storedAgentsRaw) : [];
              const newAgent: Agent = {
                id: `agent-${Date.now()}`,
                name: newName,
                photo: meta.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(newName)}&background=c5a85c&color=fff`,
                experience: "1 Year",
                specialization: "DHA Properties",
                email: session.user.email,
                phone: session.user.phone || meta.phone || "",
                whatsApp: session.user.phone || meta.phone || "",
                bio: "Verified Agent"
              };
              const updatedAgents = [...currentAgents, newAgent];
              localStorage.setItem("gem-agents", JSON.stringify(updatedAgents));
              setAgents(updatedAgents);
            } else if (userRole === "Agency") {
              const storedAgenciesRaw = localStorage.getItem("gem-agencies");
              const currentAgencies: AgencyRecord[] = storedAgenciesRaw ? JSON.parse(storedAgenciesRaw) : [];
              const newAgency: AgencyRecord = {
                id: `agency-${Date.now()}`,
                name: meta.companyName || "Apex Properties",
                logo: meta.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(meta.companyName || "Agency")}&background=c5a85c&color=fff`,
                agentsCount: 0,
                listingsCount: 0,
                phone: session.user.phone || meta.phone || "",
                email: session.user.email,
                status: "Pending"
              };
              const updatedAgencies = [...currentAgencies, newAgency];
              localStorage.setItem("gem-agencies", JSON.stringify(updatedAgencies));
              setAgencies(updatedAgencies);
            }
          } else if (userExists && session.user.email) {
            const matched = currentUsers.find(u => u.email.toLowerCase() === session.user.email?.toLowerCase());
            if (matched) {
              activeStatus = matched.status;
              if (matched.image) activeImage = matched.image;
            }
          }
        }

        const mappedSession: UserSession = {
          name: meta.full_name || session.user.email?.split("@")[0] || "User",
          email: session.user.email || "",
          phone: session.user.phone || meta.phone || "",
          role: userRole,
          companyName: meta.companyName || (userRole === "Agency" ? "Apex Properties" : userRole === "Agent" ? "Independent Agent" : "Individual Seller"),
          image: activeImage,
          plan: (meta.plan as AccountPlan) || "Free",
          status: activeStatus
        };
        setUserSession(mappedSession);
        localStorage.setItem("gem-user-session", JSON.stringify(mappedSession));
      } else if (event === "SIGNED_OUT") {
        setUserSession(defaultSession);
        localStorage.setItem("gem-user-session", JSON.stringify(defaultSession));
      }
    });

    return () => {
      clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, []);

  // Sync state modifications to LocalStorage
  const saveState = (key: string, data: unknown) => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(key, JSON.stringify(data));
      } catch (e) {
        console.error("Local storage save error", e);
      }
    }
  };

  const setTheme = (newTheme: "light" | "dark") => {
    setThemeState(newTheme);
    if (typeof window !== "undefined") {
      localStorage.setItem("gem-theme", newTheme);
      document.documentElement.classList.toggle("dark", newTheme === "dark");
    }
  };

  const setUserRole = (role: UserRole) => {
    const updatedSession = { ...userSession, role };
    setUserSession(updatedSession);
    saveState("gem-user-session", updatedSession);
  };

  const loginUser = (session: UserSession) => {
    // Ensure plan field exists
    const sessionWithPlan = { ...session, plan: session.plan || "Free" };
    setUserSession(sessionWithPlan);
    saveState("gem-user-session", sessionWithPlan);
  };

  const logoutUser = async () => {
    if (typeof window !== "undefined" && window.location.hash) {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
    try {
      await supabase.auth.signOut();
      console.log("Logged out from Supabase Auth");
    } catch (err) {
      console.error("Error signing out from Supabase Auth:", err);
    }

    setUserSession(defaultSession);
    saveState("gem-user-session", defaultSession);
  };

  // Upgrade current user to Pro plan
  const upgradeToPro = () => {
    const updatedSession = { ...userSession, plan: "Pro" as AccountPlan };
    setUserSession(updatedSession);
    saveState("gem-user-session", updatedSession);
  };

  // Check if the current user can add another property
  const canAddProperty = () => {
    const role = userSession.role;
    const limit = PLAN_LIMITS[userSession.plan || "Free"] || 10;
    const userListings = properties.filter(
      (p) => p.agent.name === userSession.name || p.contactDetails?.name === userSession.name
    );
    const currentCount = userListings.length;

    if (userSession.status === "Pending") {
      return { allowed: false, reason: "Your account is currently pending administrative approval.", currentCount, limit };
    }
    if (userSession.status === "Suspended") {
      return { allowed: false, reason: "Your account has been suspended. Please contact admin support.", currentCount, limit };
    }
    // Admin and Buyer/Seller have no upload limit via this system
    if (role === "Admin" || role === "Buyer" || role === "Seller") {
      return { allowed: true, currentCount, limit: Infinity };
    }
    if (currentCount >= limit) {
      return {
        allowed: false,
        reason: `You have reached your ${userSession.plan} plan limit of ${limit} listings.`,
        currentCount,
        limit
      };
    }
    return { allowed: true, currentCount, limit };
  };

  const changeAdminPassword = (newPass: string) => {
    setAdminPassword(newPass);
    if (typeof window !== "undefined") {
      localStorage.setItem("gem-admin-password", newPass);
    }
  };

  // Lead CRUD & operations
  const addLead = (l: Omit<Lead, "id" | "status" | "notes" | "createdAt">) => {
    const newLead: Lead = {
      ...l,
      id: `lead-${Date.now()}`,
      status: "New",
      notes: [{ id: `note-${Date.now()}`, note: `Lead created via ${l.source}.`, createdAt: new Date().toISOString() }],
      createdAt: new Date().toISOString()
    };
    setLeads((prev) => {
      const updated = [newLead, ...prev];
      saveState("gem-leads", updated);
      return updated;
    });
  };

  const updateLeadStatus = (id: string, status: LeadStatus) => {
    setLeads((prev) => {
      const updated = prev.map((l) =>
        l.id === id
          ? {
              ...l,
              status,
              notes: [
                ...l.notes,
                { id: `note-${Date.now()}`, note: `Status updated to: ${status}`, createdAt: new Date().toISOString() }
              ]
            }
          : l
      );
      saveState("gem-leads", updated);
      return updated;
    });
  };

  const addLeadNote = (id: string, noteText: string) => {
    setLeads((prev) => {
      const updated = prev.map((l) =>
        l.id === id
          ? {
              ...l,
              notes: [
                ...l.notes,
                { id: `note-${Date.now()}`, note: noteText, createdAt: new Date().toISOString() }
              ]
            }
          : l
      );
      saveState("gem-leads", updated);
      return updated;
    });
  };

  const assignLeadAgent = (id: string, agentId: string) => {
    setLeads((prev) => {
      const updated = prev.map((l) =>
        l.id === id
          ? {
              ...l,
              agentId,
              notes: [
                ...l.notes,
                { id: `note-${Date.now()}`, note: `Assigned lead to agent: ${agentId}`, createdAt: new Date().toISOString() }
              ]
            }
          : l
      );
      saveState("gem-leads", updated);
      return updated;
    });
  };

  const deleteLead = (id: string) => {
    setLeads((prev) => {
      const updated = prev.filter((l) => l.id !== id);
      saveState("gem-leads", updated);
      return updated;
    });
  };

  const addProperty = (newProp: Omit<Property, "id" | "viewsCount">) => {
    // Enforce plan limits for Agent/Agency roles
    const role = userSession.role;
    if (role === "Agent" || role === "Agency") {
      const check = canAddProperty();
      if (!check.allowed) {
        console.warn("Property upload blocked — plan limit reached.", check.reason);
        return; // Caller should use canAddProperty() to show the modal instead
      }
    }

    // Insert to Supabase asynchronously
    insertSupabaseProperty(newProp)
      .then(() => console.log("Property successfully uploaded to Supabase!"))
      .catch((err) => console.error("Failed to upload to Supabase:", err));

    const propertyWithId: Property = {
      ...newProp,
      id: `prop-${Date.now()}`,
      viewsCount: Math.floor(Math.random() * 30) + 18,
      createdAt: new Date().toISOString().split("T")[0]
    };
    const updatedListings = [propertyWithId, ...properties];
    setProperties(updatedListings);
    saveState("gem-properties", updatedListings);
  };

  const approveProperty = (id: string) => {
    const updatedListings = properties.map((p) => p.id === id ? { ...p, isApproved: true } : p);
    setProperties(updatedListings);
    saveState("gem-properties", updatedListings);
  };

  const rejectProperty = (id: string) => {
    const updatedListings = properties.filter((p) => p.id !== id);
    setProperties(updatedListings);
    saveState("gem-properties", updatedListings);
  };

  const updateProperty = (updatedProp: Property) => {
    const updatedListings = properties.map((p) => (p.id === updatedProp.id ? updatedProp : p));
    setProperties(updatedListings);
    saveState("gem-properties", updatedListings);
  };

  const deleteProperty = (id: string) => {
    const updatedListings = properties.filter((p) => p.id !== id);
    setProperties(updatedListings);
    saveState("gem-properties", updatedListings);
  };

  const addInquiry = (inq: Omit<Inquiry, "id" | "status" | "createdAt">) => {
    const newInq: Inquiry = {
      ...inq,
      id: `inq-${Date.now()}`,
      status: "Pending",
      createdAt: new Date().toISOString()
    };
    const updatedInquiries = [newInq, ...inquiries];
    setInquiries(updatedInquiries);
    saveState("gem-inquiries", updatedInquiries);

    // Also auto-capture as a Lead in CRM!
    const isContactForm = inq.clientMessage.includes("[Contact Form Subject:");
    addLead({
      name: inq.clientName,
      phone: inq.clientPhone,
      email: inq.clientEmail,
      whatsApp: inq.clientPhone,
      propertyInterested: inq.propertyName || (isContactForm ? "General Contact Inquiry" : "Direct Site Inquiry"),
      source: isContactForm ? "Contact Forms" : "Property Inquiry",
      agentId: inq.agentName || "Chaudhary Waqas"
    });
  };

  const updateInquiryStatus = (id: string, status: Inquiry["status"]) => {
    const updatedInquiries = inquiries.map((inq) => (inq.id === id ? { ...inq, status } : inq));
    setInquiries(updatedInquiries);
    saveState("gem-inquiries", updatedInquiries);
  };

  const toggleSavedProperty = (id: string) => {
    const isSaved = savedProperties.includes(id);
    const updatedSaved = isSaved
      ? savedProperties.filter((item) => item !== id)
      : [...savedProperties, id];
    setSavedProperties(updatedSaved);
    saveState("gem-saved-properties", updatedSaved);
  };

  const addSavedSearch = (search: Omit<SavedSearch, "id" | "createdAt">) => {
    const newSearch: SavedSearch = {
      ...search,
      id: `search-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    const updatedSearches = [newSearch, ...savedSearches];
    setSavedSearches(updatedSearches);
    saveState("gem-saved-searches", updatedSearches);
  };

  const removeSavedSearch = (id: string) => {
    const updatedSearches = savedSearches.filter((s) => s.id !== id);
    setSavedSearches(updatedSearches);
    saveState("gem-saved-searches", updatedSearches);
  };

  const addRecentlyViewed = (id: string) => {
    const filteredRecently = recentlyViewed.filter((item) => item !== id);
    const updatedRecently = [id, ...filteredRecently].slice(0, 8); // Store last 8 items
    setRecentlyViewed(updatedRecently);
    saveState("gem-recently-viewed", updatedRecently);
  };

  const addBlog = (blog: BlogPost) => {
    const updatedBlogs = [blog, ...blogs];
    setBlogs(updatedBlogs);
    saveState("gem-blogs", updatedBlogs);
  };

  const deleteBlog = (slug: string) => {
    const updatedBlogs = blogs.filter((b) => b.slug !== slug);
    setBlogs(updatedBlogs);
    saveState("gem-blogs", updatedBlogs);
  };

  const incrementViews = (id: string) => {
    setProperties((prev) => {
      const updatedListings = prev.map((p) =>
        p.id === id ? { ...p, viewsCount: (p.viewsCount || 0) + 1 } : p
      );
      saveState("gem-properties", updatedListings);
      return updatedListings;
    });
  };

  const addAgent = (newAgent: Omit<Agent, "id">) => {
    const agent: Agent = {
      ...newAgent,
      id: `agent-${Date.now()}`
    };
    const updated = [...agents, agent];
    setAgents(updated);
    saveState("gem-agents", updated);
  };

  const updateAgent = (updatedAgent: Agent) => {
    const updated = agents.map(a => a.id === updatedAgent.id ? updatedAgent : a);
    setAgents(updated);
    saveState("gem-agents", updated);
  };

  const deleteAgent = (id: string) => {
    setAgents((prev) => {
      const target = prev.find(a => a.id === id);
      const updated = prev.filter(a => a.id !== id);
      saveState("gem-agents", updated);
      if (target) {
        setUsers((prevUsers) => {
          const updatedUsers = prevUsers.filter(u => u.email.toLowerCase() !== target.email.toLowerCase() && u.id !== id);
          saveState("gem-users", updatedUsers);
          return updatedUsers;
        });
      }
      return updated;
    });
  };

  // User CRUD
  const addUser = (newUser: Omit<UserRecord, "id" | "dateJoined" | "status">) => {
    const isAgentOrAgency = newUser.role === "Agent" || newUser.role === "Agency";
    const isAdmin = userSession?.role === "Admin";
    const status: "Active" | "Pending" | "Suspended" = (isAgentOrAgency && !isAdmin) ? "Pending" : "Active";
    const user: UserRecord = {
      ...newUser,
      id: `usr-${Date.now()}`,
      status,
      dateJoined: new Date().toISOString().split("T")[0]
    };
    setUsers((prev) => {
      const updated = [...prev, user];
      saveState("gem-users", updated);
      return updated;
    });

    // Automatically send Approval Request Message & CRM Lead to Admin when an Agent/Agency signs up
    if (status === "Pending") {
      const isAgency = newUser.role === "Agency";
      const entityName = isAgency ? (newUser.companyName || newUser.name) : newUser.name;
      const inquiryMsg: Inquiry = {
        id: `inq-${Date.now()}`,
        propertyName: `[APPROVAL REQUEST] ${newUser.role} Account Registration - ${entityName}`,
        clientName: newUser.name,
        clientEmail: newUser.email,
        clientPhone: newUser.phone || "N/A",
        clientMessage: `ACCOUNT APPROVAL REQUEST: A new ${newUser.role} registration request has been submitted by ${newUser.name} (Company/Firm: ${entityName}, Email: ${newUser.email}, Phone: ${newUser.phone || "N/A"}${newUser.cnic ? `, CNIC: ${newUser.cnic}` : ""}${newUser.ntn ? `, NTN: ${newUser.ntn}` : ""}). Account status is PENDING. Please review and approve or reject this request in the Admin Dashboard.`,
        agentName: "Chaudhary Waqas",
        createdAt: new Date().toISOString().split("T")[0],
        status: "Pending"
      };
      setInquiries((prev) => {
        const updated = [inquiryMsg, ...prev];
        saveState("gem-inquiries", updated);
        return updated;
      });

      const newLead: Lead = {
        id: `lead-${Date.now()}`,
        name: newUser.name,
        phone: newUser.phone || "N/A",
        email: newUser.email,
        whatsApp: "Yes",
        propertyInterested: `Approval Request: ${newUser.role} Registration (${entityName})`,
        status: "New",
        agentId: "Chaudhary Waqas",
        notes: [],
        source: "Contact Forms",
        createdAt: new Date().toISOString().split("T")[0]
      };
      setLeads((prev) => {
        const updated = [newLead, ...prev];
        saveState("gem-leads", updated);
        return updated;
      });
    }
  };

  const updateUserRole = (id: string, role: UserRole) => {
    setUsers((prev) => {
      const updated = prev.map((u) => (u.id === id ? { ...u, role } : u));
      saveState("gem-users", updated);
      return updated;
    });
  };

  const updateUserStatus = (id: string, status: "Active" | "Suspended" | "Pending") => {
    setUsers((prev) => {
      const updated = prev.map((u) => {
        if (u.id === id) {
          // If the updated user is the current logged-in user, update userSession too!
          if (userSession && u.email.toLowerCase() === userSession.email.toLowerCase()) {
            const updatedSession = { ...userSession, status };
            setUserSession(updatedSession);
            saveState("gem-user-session", updatedSession);
          }
          
          // Automatically sync status to the corresponding Agency if the user has role 'Agency'
          if (u.role === "Agency") {
            setAgencies((prevAgencies) => {
              const updatedAgencies = prevAgencies.map((a) => 
                a.email.toLowerCase() === u.email.toLowerCase() ? { ...a, status } : a
              );
              saveState("gem-agencies", updatedAgencies);
              return updatedAgencies;
            });
          }
          
          return { ...u, status };
        }
        return u;
      });
      saveState("gem-users", updated);
      return updated;
    });
  };

  const deleteUser = (id: string) => {
    setUsers((prev) => {
      const targetUser = prev.find((u) => u.id === id);
      const updated = prev.filter((u) => u.id !== id);
      saveState("gem-users", updated);

      if (targetUser) {
        setAgents((prevAgents) => {
          const updatedAgents = prevAgents.filter((a) => a.email.toLowerCase() !== targetUser.email.toLowerCase() && a.id !== id);
          saveState("gem-agents", updatedAgents);
          return updatedAgents;
        });
        setAgencies((prevAgencies) => {
          const updatedAgencies = prevAgencies.filter((ag) => ag.email.toLowerCase() !== targetUser.email.toLowerCase() && ag.id !== id);
          saveState("gem-agencies", updatedAgencies);
          return updatedAgencies;
        });
        if (userSession && userSession.email.toLowerCase() === targetUser.email.toLowerCase()) {
          setUserSession(defaultSession);
          saveState("gem-user-session", defaultSession);
        }
      }
      return updated;
    });
  };

  // Agency CRUD
  const addAgency = (newAgency: Omit<AgencyRecord, "id" | "agentsCount" | "listingsCount">) => {
    const agency: AgencyRecord = {
      ...newAgency,
      id: `agency-${Date.now()}`,
      agentsCount: 0,
      listingsCount: 0
    };
    setAgencies((prev) => {
      const updated = [...prev, agency];
      saveState("gem-agencies", updated);
      return updated;
    });
  };

  const updateAgencyStatus = (id: string, status: "Active" | "Pending" | "Suspended") => {
    setAgencies((prev) => {
      const updated = prev.map((a) => {
        if (a.id === id) {
          // If the updated agency corresponds to the current logged-in agency, update userSession!
          if (userSession && a.email.toLowerCase() === userSession.email.toLowerCase()) {
            const updatedSession = { ...userSession, status };
            setUserSession(updatedSession);
            saveState("gem-user-session", updatedSession);
          }
          
          // Automatically sync status to the corresponding UserRecord in users list
          setUsers((prevUsers) => {
            const updatedUsers = prevUsers.map((u) => 
              u.email.toLowerCase() === a.email.toLowerCase() ? { ...u, status } : u
            );
            saveState("gem-users", updatedUsers);
            return updatedUsers;
          });
          
          return { ...a, status };
        }
        return a;
      });
      saveState("gem-agencies", updated);
      return updated;
    });
  };

  const deleteAgency = (id: string) => {
    setAgencies((prev) => {
      const target = prev.find(a => a.id === id);
      const updated = prev.filter((a) => a.id !== id);
      saveState("gem-agencies", updated);
      if (target) {
        setUsers((prevUsers) => {
          const updatedUsers = prevUsers.filter(u => u.email.toLowerCase() !== target.email.toLowerCase() && u.id !== id);
          saveState("gem-users", updatedUsers);
          return updatedUsers;
        });
      }
      return updated;
    });
  };

  // Ad CRUD
  const addAd = (newAd: Omit<AdCampaign, "id" | "views" | "clicks">) => {
    const ad: AdCampaign = {
      ...newAd,
      id: `ad-${Date.now()}`,
      views: 0,
      clicks: 0
    };
    setAds((prev) => {
      const updated = [ad, ...prev];
      saveState("gem-ads", updated);
      return updated;
    });
  };

  const updateAdStatus = (id: string, status: "Active" | "Paused" | "Expired") => {
    setAds((prev) => {
      const updated = prev.map((a) => (a.id === id ? { ...a, status } : a));
      saveState("gem-ads", updated);
      return updated;
    });
  };

  const deleteAd = (id: string) => {
    setAds((prev) => {
      const updated = prev.filter((a) => a.id !== id);
      saveState("gem-ads", updated);
      return updated;
    });
  };

  const recordAdClick = (id: string) => {
    setAds((prev) => {
      const updated = prev.map((a) => (a.id === id ? { ...a, clicks: a.clicks + 1 } : a));
      saveState("gem-ads", updated);
      return updated;
    });
  };

  return (
    <AppStateContext.Provider
      value={{
        properties,
        blogs,
        upgradeToPro,
        canAddProperty,
        inquiries,
        savedProperties,
        savedSearches,
        recentlyViewed,
        userSession,
        theme,
        leads,
        isLoaded,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalDefaultTab,
        setAuthModalDefaultTab,
        addLead,
        updateLeadStatus,
        addLeadNote,
        assignLeadAgent,
        deleteLead,
        addProperty,
        approveProperty,
        rejectProperty,
        updateProperty,
        deleteProperty,
        addInquiry,
        updateInquiryStatus,
        toggleSavedProperty,
        addSavedSearch,
        removeSavedSearch,
        addRecentlyViewed,
        setUserRole,
        loginUser,
        logoutUser,
        adminPassword,
        changeAdminPassword,
        setTheme,
        addBlog,
        deleteBlog,
        incrementViews,
        agents,
        addAgent,
        updateAgent,
        deleteAgent,
        users,
        agencies,
        ads,
        addUser,
        updateUserRole,
        updateUserStatus,
        deleteUser,
        addAgency,
        updateAgencyStatus,
        deleteAgency,
        addAd,
        updateAdStatus,
        deleteAd,
        recordAdClick
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error("useAppState must be used within an AppStateProvider");
  }
  return context;
}
