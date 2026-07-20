"use client";

import React, { useState, useEffect } from "react";
import { useAppState, UserSession, UserRole, UserRecord } from "@/context/AppStateContext";
import { 
  X, 
  User, 
  Briefcase, 
  Award, 
  Layers, 
  Mail, 
  Phone, 
  FileText, 
  Upload, 
  ShieldCheck, 
  ChevronRight, 
  Loader2, 
  CheckCircle,
  Building2,
  LogIn,
  UserPlus,
  ArrowRight,
  Eye,
  EyeOff
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/utils/supabaseClient";

interface AddPropertyAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AccountType = "seller" | "agent" | "agency" | null;
type TabType = "signup" | "login";

export default function AddPropertyAuthModal({ isOpen, onClose }: AddPropertyAuthModalProps) {
  const { userSession, loginUser, addUser, addAgent, addAgency, adminPassword, authModalDefaultTab, users } = useAppState();
  
  // Tabs and Steps
  const [activeTab, setActiveTab] = useState<TabType>("signup");
  const [step, setStep] = useState<"loggedInAlert" | "select" | "form" | "success">("select");
  const [selectedType, setSelectedType] = useState<AccountType>(null);
  
  // Login Form States
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  // Common Form States
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  
  // Role Specific States
  const [idCardNumber, setIdCardNumber] = useState(""); // Agent ID card (CNIC)
  const [agencyNameInput, setAgencyNameInput] = useState(""); // Agency company name
  const [ntnNumber, setNtnNumber] = useState(""); // Agency NTN
  
  // File Upload State (for Agency and Agent avatar/logo)
  const [idFrontFile, setIdFrontFile] = useState<File | null>(null);
  const [idBackFile, setIdBackFile] = useState<File | null>(null);
  const [idFrontPreview, setIdFrontPreview] = useState<string | null>(null);
  const [idBackPreview, setIdBackPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{ front: number; back: number; avatar: number }>({ front: 0, back: 0, avatar: 0 });
  const [uploadingState, setUploadingState] = useState<{ front: boolean; back: boolean; avatar: boolean }>({ front: false, back: false, avatar: false });
  
  // Validation / Loading States
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  // Admin password login state
  const [adminLoginPassword, setAdminLoginPassword] = useState("");
  const [showAdminPasswordVerify, setShowAdminPasswordVerify] = useState(false);
  const [selectedAdminAcc, setSelectedAdminAcc] = useState<any>(null);

  // Pre-seeded Simulator Accounts
  const seededAccounts = [
    {
      name: "Muhammad Ali",
      email: "muhammad.ali@globalestate.com",
      phone: "0301-7654321",
      role: "Agent" as UserRole,
      companyName: "Zameen Gem",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80",
      description: "Senior Real Estate Advisor"
    },
    {
      name: "Sajid Mahmood",
      email: "sajid.mahmood@globalestate.com",
      phone: "0321-5556677",
      role: "Agent" as UserRole,
      companyName: "Zameen Gem",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80",
      description: "Commercial Portfolio Specialist"
    },
    {
      name: "Guest Buyer Persona",
      email: "buyer.default@gmail.com",
      phone: "0300-1112233",
      role: "Buyer" as UserRole,
      companyName: "Individual Client",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
      description: "Default Client / Simulated Visitor"
    }
  ];

  // Initialize view depending on role and default tab
  useEffect(() => {
    if (isOpen) {
      // If the user has a professional role (Seller, Agent, Agency, Admin), show bypass screen
      if (userSession && userSession.role !== "Buyer") {
        setStep("loggedInAlert");
      } else {
        setStep("select");
        setActiveTab(authModalDefaultTab);
      }
    }
  }, [isOpen, userSession, authModalDefaultTab]);

  // Clean previews on unmount
  useEffect(() => {
    return () => {
      if (idFrontPreview) URL.revokeObjectURL(idFrontPreview);
      if (idBackPreview) URL.revokeObjectURL(idBackPreview);
    };
  }, [idFrontPreview, idBackPreview]);

  if (!isOpen) return null;

  const handleTypeSelect = (type: AccountType) => {
    setSelectedType(type);
    setStep("form");
    setError(null);
  };

  const handleBack = () => {
    setStep("select");
    setSelectedType(null);
    setError(null);
  };

  // CNIC formatting: 31202-XXXXXXX-X
  const formatCNIC = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 5) return numbers;
    if (numbers.length <= 12) return `${numbers.slice(0, 5)}-${numbers.slice(5)}`;
    return `${numbers.slice(0, 5)}-${numbers.slice(5, 12)}-${numbers.slice(12, 13)}`;
  };

  const handleCNICChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIdCardNumber(formatCNIC(e.target.value));
  };

  // NTN formatting: XXXXXXX-X
  const formatNTN = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 7) return numbers;
    return `${numbers.slice(0, 7)}-${numbers.slice(7, 8)}`;
  };

  const handleNTNChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNtnNumber(formatNTN(e.target.value));
  };

  // Handle files
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, side: "front" | "back" | "avatar") => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (PNG, JPG, JPEG)");
      return;
    }

    if (side === "front") {
      setIdFrontFile(file);
      setIdFrontPreview(URL.createObjectURL(file));
      simulateUpload("front");
    } else if (side === "back") {
      setIdBackFile(file);
      setIdBackPreview(URL.createObjectURL(file));
      simulateUpload("back");
    } else {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      simulateUpload("avatar");
    }
  };

  const simulateUpload = (side: "front" | "back" | "avatar") => {
    setUploadingState(prev => ({ ...prev, [side]: true }));
    setUploadProgress(prev => ({ ...prev, [side]: 0 }));
    
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(prev => ({ ...prev, [side]: progress }));
      if (progress >= 100) {
        clearInterval(interval);
        setUploadingState(prev => ({ ...prev, [side]: false }));
      }
    }, 150);
  };

  // Simulating Persona Login
  const handleSeededLogin = (acc: typeof seededAccounts[0]) => {
    if (acc.role === "Admin") {
      setSelectedAdminAcc(acc);
      setShowAdminPasswordVerify(true);
      setAdminLoginPassword("");
      setError(null);
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      loginUser({
        name: acc.name,
        email: acc.email,
        phone: acc.phone,
        role: acc.role,
        companyName: acc.companyName,
        image: acc.image,
        plan: "Free"
      });
      setIsSubmitting(false);
      setStep("success");
      setTimeout(() => {
        onClose();
        window.location.href = "/dashboard?tab=add";
      }, 1500);
    }, 800);
  };

  const handleAdminPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminLoginPassword === adminPassword) {
      setError(null);
      setIsSubmitting(true);
      setTimeout(() => {
        if (selectedAdminAcc) {
          loginUser({
            name: selectedAdminAcc.name,
            email: selectedAdminAcc.email,
            phone: selectedAdminAcc.phone,
            role: selectedAdminAcc.role,
            companyName: selectedAdminAcc.companyName,
            image: selectedAdminAcc.image,
            plan: "Free"
          });
        }
        setIsSubmitting(false);
        setStep("success");
        setShowAdminPasswordVerify(false);
        setTimeout(() => {
          onClose();
          window.location.href = "/dashboard?tab=add";
        }, 1500);
      }, 800);
    } else {
      setError("Incorrect password. Please try again.");
    }
  };

  // Google Sign Up Live Auth
  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    setError(null);
    try {
      const intendedRole = selectedType === "seller" ? "Seller" : selectedType === "agent" ? "Agent" : "Agency";
      localStorage.setItem("gem-intended-role", intendedRole);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dashboard?tab=add`
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || "Failed to initialize Google Sign-in.");
      setGoogleLoading(false);
    }
  };

  // Form Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Common Val
    if (!name.trim()) return setError("Name is required");
    if (!email.trim() || !email.includes("@")) return setError("A valid email is required");
    if (!phone.trim() || phone.length < 10) return setError("A valid contact number is required");

    // Specific Val
    if (selectedType === "agent") {
      if (!idCardNumber.trim() || idCardNumber.length < 15) {
        return setError("Please provide a valid 13-digit ID card (CNIC) number: 31202-XXXXXXX-X");
      }
      if (!avatarFile) {
        return setError("Please upload your professional profile picture");
      }
      if (uploadingState.avatar) {
        return setError("Please wait for your profile picture to finish uploading");
      }
    } else if (selectedType === "agency") {
      if (!agencyNameInput.trim()) return setError("Agency/Company name is required");
      if (!ntnNumber.trim() || ntnNumber.length < 9) {
        return setError("Please provide a valid 8-digit NTN number: XXXXXXX-X");
      }
      if (!avatarFile) {
        return setError("Please upload your Agency logo");
      }
      if (!idFrontFile || !idBackFile) {
        return setError("Both Front and Back photos of the ID card are required");
      }
      if (uploadingState.front || uploadingState.back || uploadingState.avatar) {
        return setError("Please wait for all uploads to finish");
      }
    }

    setIsSubmitting(true);

    // Call Supabase Auth to register user
    try {
      try {
        const { data, error: signUpErr } = await supabase.auth.signUp({
          email: email,
          password: password,
          options: {
            data: {
              full_name: name,
              phone: phone,
              role: selectedType === "seller" ? "Seller" : selectedType === "agent" ? "Agent" : "Agency",
              companyName: selectedType === "agency" ? agencyNameInput : selectedType === "agent" ? "Independent Agent" : "Individual Seller",
              plan: "Free"
            },
            emailRedirectTo: `${window.location.origin}/dashboard`
          }
        });
        if (signUpErr) {
          console.warn("Supabase signup error (falling back to local simulation):", signUpErr);
        }
      } catch (authErr) {
        console.warn("Supabase signup exception (falling back to local simulation):", authErr);
      }

      // Sync manual registration to local DB lists so they display in the admin panel!
      const userRole = selectedType === "seller" ? "Seller" : selectedType === "agent" ? "Agent" : "Agency";
      addUser({
        name: name,
        email: email,
        role: userRole,
        phone: phone,
        password: password,
        cnic: selectedType === "agent" ? idCardNumber : undefined,
        ntn: selectedType === "agency" ? ntnNumber : undefined,
        companyName: selectedType === "agency" ? agencyNameInput : undefined,
        image: avatarPreview || undefined
      });

      if (userRole === "Agent") {
        addAgent({
          name: name,
          photo: avatarPreview || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=c5a85c&color=fff`,
          experience: "1 Year",
          specialization: "DHA Properties",
          email: email,
          phone: phone,
          whatsApp: phone,
          bio: "Verified Agent"
        });
      } else if (userRole === "Agency") {
        addAgency({
          name: agencyNameInput,
          logo: avatarPreview || `https://ui-avatars.com/api/?name=${encodeURIComponent(agencyNameInput)}&background=c5a85c&color=fff`,
          phone: phone,
          email: email,
          status: "Pending"
        });
      }

      // Auto login locally for simulated seamless testing ONLY IF NOT PENDING
      const isPending = userRole === "Agent" || userRole === "Agency";
      if (!isPending) {
        loginUser({
          name: name,
          email: email,
          phone: phone,
          role: userRole,
          companyName: "Individual Seller",
          image: avatarPreview || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=c5a85c&color=fff`,
          plan: "Free",
          status: "Active"
        });
      }

      setIsSubmitting(false);
      setStep("success");
      
      // Clear forms
      setName("");
      setEmail("");
      setPhone("");
      setPassword("");
      setIdCardNumber("");
      setAgencyNameInput("");
      setNtnNumber("");
      setIdFrontFile(null);
      setIdBackFile(null);
      setIdFrontPreview(null);
      setIdBackPreview(null);
      setAvatarFile(null);
      setAvatarPreview(null);

      setTimeout(() => {
        onClose();
        if (!isPending) {
          window.location.href = "/dashboard?tab=add";
        } else {
          window.location.href = "/";
        }
      }, 3000);

    } catch (err: any) {
      setError(err.message || "Sign up failed. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handleLoginFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setError("Please enter your login ID and password.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    // 1. Super Admin checking (master admin bypass)
    if (loginEmail.toLowerCase() === "globalrealestates786@gmail.com" || loginEmail.toLowerCase() === "admin@globalestate.com") {
      if (loginPassword === adminPassword || loginPassword === "admin123") {
        loginUser({
          name: "Waqas Ahmad Chaudhary",
          email: "Globalrealestates786@gmail.com",
          phone: "+92300-0066255",
          role: "Admin",
          companyName: "Zameen Gem",
          image: "/images/waqas_ceo.png",
          plan: "Pro",
          status: "Active"
        });
        setIsSubmitting(false);
        setStep("success");
        setTimeout(() => {
          onClose();
          window.location.href = "/dashboard";
        }, 1500);
        return;
      }
    }

    // 2. Local simulation login bypass
    try {
      const storedUsersRaw = localStorage.getItem("gem-users");
      const currentUsers: UserRecord[] = storedUsersRaw ? JSON.parse(storedUsersRaw) : [];
      const matchedUser = currentUsers.find(u => u.email.toLowerCase() === loginEmail.toLowerCase());

      if (matchedUser) {
        const passwordMatches = matchedUser.password === loginPassword || 
                                (!matchedUser.password && (loginPassword === "agent123" || loginPassword === "pass123"));
        
        if (passwordMatches) {
          if (matchedUser.status === "Pending") {
            setError("Your account is pending administrative approval. Please wait for activation.");
            setIsSubmitting(false);
            return;
          }
          if (matchedUser.status === "Suspended") {
            setError("Your account has been suspended by administration. Please contact support.");
            setIsSubmitting(false);
            return;
          }

          loginUser({
            name: matchedUser.name,
            email: matchedUser.email,
            phone: matchedUser.phone || "",
            role: matchedUser.role,
            companyName: matchedUser.companyName || (matchedUser.role === "Agency" ? "Apex Properties" : matchedUser.role === "Agent" ? "Independent Agent" : "Individual Seller"),
            image: matchedUser.image || (matchedUser.role === "Admin" ? "/images/waqas_ceo.png" : `https://ui-avatars.com/api/?name=${encodeURIComponent(matchedUser.name)}&background=c5a85c&color=fff`),
            plan: "Free",
            status: matchedUser.status
          });
          
          setIsSubmitting(false);
          setStep("success");
          setTimeout(() => {
            onClose();
            window.location.href = "/dashboard";
          }, 1500);
          return;
        }
      }
    } catch (localErr) {
      console.warn("Local login bypass error:", localErr);
    }

    // 3. Live Supabase login
    try {
      const { data, error: signInErr } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword
      });

      if (signInErr) throw signInErr;

      // Check status from local users list after Supabase validates credentials
      const storedUsersRaw = localStorage.getItem("gem-users");
      const currentUsers: UserRecord[] = storedUsersRaw ? JSON.parse(storedUsersRaw) : [];
      const matched = currentUsers.find(u => u.email.toLowerCase() === loginEmail.toLowerCase());
      
      if (matched) {
        if (matched.status === "Pending") {
          await supabase.auth.signOut();
          setError("Your account is pending administrative approval. Please wait for activation.");
          setIsSubmitting(false);
          return;
        }
        if (matched.status === "Suspended") {
          await supabase.auth.signOut();
          setError("Your account has been suspended by administration. Please contact support.");
          setIsSubmitting(false);
          return;
        }
      }

      setIsSubmitting(false);
      setStep("success");
      setTimeout(() => {
        onClose();
        window.location.href = "/dashboard";
      }, 1500);

    } catch (err: any) {
      if (err.message === "Invalid login credentials") {
        setError("Invalid credentials or your email might not be confirmed yet. Please check your inbox.");
      } else {
        setError(err.message || "Invalid email or password.");
      }
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
      />

      {/* Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-border-base bg-background shadow-2xl z-10 glass max-h-[90vh] flex flex-col"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full border border-border-base hover:bg-muted-bg text-muted-text hover:text-foreground transition-colors cursor-pointer z-20"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Scrollable Container */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-grow">
          <AnimatePresence mode="wait">

            {/* STATUS: LOGGED IN BYPASS SCREEN */}
            {step === "loggedInAlert" && (
              <motion.div
                key="loggedInAlert"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center py-6 space-y-6 flex flex-col items-center justify-center"
              >
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gold shrink-0 shadow-lg">
                  <img 
                    src={userSession.image && !userSession.image.startsWith("blob:") ? userSession.image : `https://ui-avatars.com/api/?name=${encodeURIComponent(userSession.name)}&background=c5a85c&color=fff`} 
                    alt={userSession.name} 
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userSession.name)}&background=c5a85c&color=fff`;
                    }}
                    className="w-full h-full object-cover" 
                  />
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-gold uppercase tracking-[0.2em]">Active Session Detected</span>
                  <h3 className="text-xl font-extrabold text-foreground">
                    You are logged in as {userSession.name}
                  </h3>
                  <p className="text-xs text-muted-text max-w-sm mx-auto">
                    You currently have an active listing role of <span className="text-gold font-bold">{userSession.role}</span>. You can bypass directly to the listing form or switch accounts.
                  </p>
                </div>

                <div className="w-full max-w-md space-y-3 pt-2">
                  <button
                    onClick={() => {
                      onClose();
                      window.location.href = "/dashboard?tab=add";
                    }}
                    className="w-full py-3.5 bg-gold hover:bg-gold-hover text-slate-950 font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <span>Proceed to Property Wizard</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      // Reset to select screen so they can login/signup differently
                      setStep("select");
                      setActiveTab("signup");
                    }}
                    className="w-full py-3 border border-border-base hover:bg-muted-bg text-foreground font-bold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    Switch Account / Sign Up as Other
                  </button>
                </div>
              </motion.div>
            )}
            
            {/* STEP 1: LOGIN OR SIGN UP TABS */}
            {step === "select" && (
              <motion.div
                key="select"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2">
                  <span className="text-[10px] font-bold text-gold uppercase tracking-[0.2em]">Add Property Portal</span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                    Add Property to Zameen Gem
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-text max-w-md mx-auto">
                    Choose whether you want to log in using an existing simulation profile or register a new one.
                  </p>
                </div>

                {/* Tab Switcher */}
                <div className="flex border border-border-base p-1.5 rounded-2xl bg-muted-bg/50 max-w-sm mx-auto">
                  <button
                    onClick={() => setActiveTab("signup")}
                    className={`flex-1 py-2.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-2 ${
                      activeTab === "signup" 
                        ? "bg-background text-foreground shadow-sm font-black border border-border-base/10" 
                        : "text-muted-text hover:text-foreground"
                    }`}
                  >
                    <UserPlus className="w-4 h-4 text-gold" />
                    <span>Create Account (Sign Up)</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("login")}
                    className={`flex-1 py-2.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-2 ${
                      activeTab === "login" 
                        ? "bg-background text-foreground shadow-sm font-black border border-border-base/10" 
                        : "text-muted-text hover:text-foreground"
                    }`}
                  >
                    <LogIn className="w-4 h-4 text-gold" />
                    <span>Existing User (Log In)</span>
                  </button>
                </div>

                {/* Tab Content: Sign Up */}
                {activeTab === "signup" && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    {/* Common Seller Card */}
                    <button
                      onClick={() => handleTypeSelect("seller")}
                      className="flex flex-col text-left p-5 rounded-2xl border border-border-base hover:border-gold bg-muted-bg/30 hover:bg-gold/5 transition-all duration-300 group relative overflow-hidden cursor-pointer"
                    >
                      <div className="p-3 bg-green-500/10 text-green-500 rounded-xl w-fit group-hover:scale-110 transition-transform">
                        <User className="w-6 h-6" />
                      </div>
                      <h4 className="text-base font-extrabold text-foreground mt-4">Common Seller</h4>
                      <p className="text-[11px] text-muted-text mt-1.5 leading-relaxed">
                        For individual owners looking to sell or rent out their personal properties directly.
                      </p>
                      <div className="mt-auto pt-4 flex items-center text-xs font-bold text-gold opacity-0 group-hover:opacity-100 transition-opacity">
                        <span>Select</span>
                        <ChevronRight className="w-3.5 h-3.5 ml-1" />
                      </div>
                    </button>

                    {/* Agent Card */}
                    <button
                      onClick={() => handleTypeSelect("agent")}
                      className="flex flex-col text-left p-5 rounded-2xl border border-border-base hover:border-gold bg-muted-bg/30 hover:bg-gold/5 transition-all duration-300 group relative overflow-hidden cursor-pointer"
                    >
                      <div className="p-3 bg-orange-500/10 text-orange-500 rounded-xl w-fit group-hover:scale-110 transition-transform">
                        <Award className="w-6 h-6" />
                      </div>
                      <h4 className="text-base font-extrabold text-foreground mt-4">Professional Agent</h4>
                      <p className="text-[11px] text-muted-text mt-1.5 leading-relaxed">
                        For independent real estate consultants who list multiple plots and handle client leads.
                      </p>
                      <div className="mt-auto pt-4 flex items-center text-xs font-bold text-gold opacity-0 group-hover:opacity-100 transition-opacity">
                        <span>Select</span>
                        <ChevronRight className="w-3.5 h-3.5 ml-1" />
                      </div>
                    </button>

                    {/* Agency Card */}
                    <button
                      onClick={() => handleTypeSelect("agency")}
                      className="flex flex-col text-left p-5 rounded-2xl border border-border-base hover:border-gold bg-muted-bg/30 hover:bg-gold/5 transition-all duration-300 group relative overflow-hidden cursor-pointer"
                    >
                      <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl w-fit group-hover:scale-110 transition-transform">
                        <Layers className="w-6 h-6" />
                      </div>
                      <h4 className="text-base font-extrabold text-foreground mt-4">Corporate Agency</h4>
                      <p className="text-[11px] text-muted-text mt-1.5 leading-relaxed">
                        For marketing agencies, builders, and developers with large property inventories.
                      </p>
                      <div className="mt-auto pt-4 flex items-center text-xs font-bold text-gold opacity-0 group-hover:opacity-100 transition-opacity">
                        <span>Select</span>
                        <ChevronRight className="w-3.5 h-3.5 ml-1" />
                      </div>
                    </button>
                  </div>
                )}

                {/* Tab Content: Log In */}
                {activeTab === "login" && (
                  <div className="space-y-6 pt-2">
                    <form onSubmit={handleLoginFormSubmit} className="space-y-4 max-w-sm mx-auto p-5 border border-border-base bg-muted-bg/10 rounded-2xl shadow-sm">
                      <div className="text-center space-y-1">
                        <h4 className="font-extrabold text-sm text-foreground">Sign In to Zameen Gem</h4>
                        <p className="text-[9px] text-muted-text uppercase tracking-wider">Enter your credentials below</p>
                      </div>
                      
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-muted-text mb-1 text-left">Login ID (Email)</label>
                        <input 
                          type="email" 
                          required 
                          placeholder="e.g. muhammad.ali@globalestate.com" 
                          value={loginEmail} 
                          onChange={e => setLoginEmail(e.target.value)}
                          className="w-full text-xs rounded-xl border border-border-base px-3.5 py-3 bg-background outline-none focus:ring-1 focus:ring-gold text-foreground font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-muted-text mb-1 text-left">Password</label>
                        <div className="relative">
                          <input 
                            type={showLoginPassword ? "text" : "password"} 
                            required 
                            placeholder="Enter your password" 
                            value={loginPassword} 
                            onChange={e => setLoginPassword(e.target.value)}
                            className="w-full text-xs rounded-xl border border-border-base pl-3.5 pr-10 py-3 bg-background outline-none focus:ring-1 focus:ring-gold text-foreground font-semibold"
                          />
                          <button
                            type="button"
                            onClick={() => setShowLoginPassword(!showLoginPassword)}
                            className="absolute right-3.5 top-3 w-4 h-4 text-muted-text hover:text-foreground cursor-pointer flex items-center justify-center"
                          >
                            {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {error && (
                        <p className="text-[10px] text-red-500 font-bold text-center">⚠️ {error}</p>
                      )}

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3.5 bg-gold text-slate-950 text-xs font-bold rounded-xl hover:bg-gold-hover disabled:bg-slate-700 disabled:text-slate-400 cursor-pointer transition-all flex items-center justify-center space-x-2"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-950" />
                            <span>Logging In...</span>
                          </>
                        ) : (
                          <span>Sign In</span>
                        )}
                      </button>

                      <div className="text-center pt-2">
                        <p className="text-xs text-muted-text">
                          Don't have an account?{" "}
                          <button
                            type="button"
                            onClick={() => {
                              setActiveTab("signup");
                              setStep("select");
                            }}
                            className="text-gold font-bold hover:underline cursor-pointer"
                          >
                            Sign Up
                          </button>
                        </p>
                      </div>
                    </form>

                    {/* Google Login Button */}
                    <div className="max-w-sm mx-auto pt-1">
                      <button
                        type="button"
                        onClick={handleGoogleSignUp}
                        disabled={googleLoading}
                        className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white border border-slate-800 text-xs font-bold rounded-xl flex items-center justify-center space-x-2 transition-all cursor-pointer shadow"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-4 h-4" alt="Google Logo" />
                        <span>{googleLoading ? "Connecting..." : "Continue with Google"}</span>
                      </button>
                    </div>

                    <div className="relative flex items-center justify-center py-2 max-w-sm mx-auto">
                      <div className="absolute w-full border-t border-border-base" />
                      <span className="relative bg-background px-3 text-[9px] font-bold text-muted-text uppercase tracking-wider">
                        Or Quick Simulated Login
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 max-w-xl mx-auto">
                      {seededAccounts.map((acc, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSeededLogin(acc)}
                          className="flex items-center space-x-2.5 p-2.5 rounded-xl border border-border-base hover:border-gold bg-muted-bg/30 hover:bg-gold/5 transition-all text-left group cursor-pointer animate-in fade-in duration-200"
                        >
                          <div className="w-7 h-7 rounded-full overflow-hidden border border-border-base shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={acc.image} alt={acc.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="min-w-0 flex-grow">
                            <p className="text-[10px] font-extrabold text-foreground truncate">{acc.name.split(" ")[0]}</p>
                            <span className="text-[8px] font-bold uppercase text-gold">
                              {acc.role}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-center items-center space-x-2 pt-4 text-xs text-muted-text border-t border-border-base/50">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Secure listing process. Approved properties are automatically indexed.</span>
                </div>
              </motion.div>
            )}

            {/* STEP 2: SIGNUP FORM */}
            {step === "form" && (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                {/* Header with back navigation */}
                <div className="flex items-center space-x-3 pb-2 border-b border-border-base/50">
                  <button
                    onClick={handleBack}
                    className="text-xs font-bold text-gold hover:text-gold-hover cursor-pointer"
                  >
                    ← Back
                  </button>
                  <span className="text-xs text-muted-text">/</span>
                  <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                    {selectedType === "seller" ? "Seller" : selectedType === "agent" ? "Agent" : "Agency"} Registration
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl font-black text-foreground">
                    {selectedType === "seller" && "Individual Seller Signup"}
                    {selectedType === "agent" && "Professional Agent Registration"}
                    {selectedType === "agency" && "Real Estate Agency Account Setup"}
                  </h3>
                  <p className="text-xs text-muted-text">
                    Fill out the credentials below to authenticate and configure your listing portal.
                  </p>
                </div>

                {/* Error Banner */}
                {error && (
                  <div className="p-3 border border-red-500/20 bg-red-500/10 text-red-500 text-xs rounded-xl font-bold">
                    ⚠️ {error}
                  </div>
                )}

                {/* Seller Quick Login Google */}
                {selectedType === "seller" && (
                  <div className="space-y-4">
                    <button
                      type="button"
                      onClick={handleGoogleSignUp}
                      disabled={googleLoading}
                      className="w-full flex items-center justify-center space-x-3 p-3.5 border border-border-base rounded-2xl hover:bg-muted-bg text-sm font-bold text-foreground transition-all cursor-pointer shadow-sm"
                    >
                      {googleLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-muted-text" />
                      ) : (
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                      )}
                      <span>{googleLoading ? "Connecting..." : "Continue with Google (Fastest)"}</span>
                    </button>
                    <div className="relative flex items-center justify-center py-2">
                      <div className="absolute w-full border-t border-border-base" />
                      <span className="relative bg-background px-3 text-[10px] font-bold text-muted-text uppercase tracking-wider">
                        Or Register Manually
                      </span>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* General Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Field: Agency Name for Agencies */}
                    {selectedType === "agency" && (
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold text-muted-text uppercase tracking-wider mb-1">
                          Agency / Company Name
                        </label>
                        <div className="relative">
                          <Building2 className="absolute left-3.5 top-3 w-4 h-4 text-muted-text" />
                          <input
                            type="text"
                            required
                            placeholder="e.g. Apex Builders & Marketing"
                            value={agencyNameInput}
                            onChange={(e) => setAgencyNameInput(e.target.value)}
                            className="w-full text-xs rounded-xl border border-border-base pl-10 pr-3.5 py-3.5 bg-muted-bg outline-none"
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-[10px] font-bold text-muted-text uppercase tracking-wider mb-1">
                        {selectedType === "agency" ? "Contact Person Name" : "Full Name"}
                      </label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-text" />
                        <input
                          type="text"
                          required
                          placeholder={selectedType === "agent" ? "e.g. Sajid Mahmood" : "e.g. Waqas Gondal"}
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full text-xs rounded-xl border border-border-base pl-10 pr-3.5 py-3 bg-muted-bg outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-muted-text uppercase tracking-wider mb-1">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-text" />
                        <input
                          type="email"
                          required
                          placeholder="e.g. contact@domain.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full text-xs rounded-xl border border-border-base pl-10 pr-3.5 py-3 bg-muted-bg outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-muted-text uppercase tracking-wider mb-1">
                        Mobile Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-text" />
                        <input
                          type="tel"
                          required
                          placeholder="e.g. 0300-1234567"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full text-xs rounded-xl border border-border-base pl-10 pr-3.5 py-3 bg-muted-bg outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-muted-text uppercase tracking-wider mb-1">
                        Password (Min 6 Characters)
                      </label>
                      <div className="relative">
                        <LogIn className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-text" />
                        <input
                          type={showSignupPassword ? "text" : "password"}
                          required
                          minLength={6}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full text-xs rounded-xl border border-border-base pl-10 pr-10 py-3 bg-muted-bg outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSignupPassword(!showSignupPassword)}
                          className="absolute right-3.5 top-3.5 w-4 h-4 text-muted-text hover:text-foreground cursor-pointer flex items-center justify-center"
                        >
                          {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Agent ID Card (CNIC) */}
                    {selectedType === "agent" && (
                      <div>
                        <label className="block text-[10px] font-bold text-muted-text uppercase tracking-wider mb-1">
                          ID Card (CNIC) Number
                        </label>
                        <div className="relative">
                          <FileText className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-text" />
                          <input
                            type="text"
                            required
                            maxLength={15}
                            placeholder="31202-XXXXXXX-X"
                            value={idCardNumber}
                            onChange={handleCNICChange}
                            className="w-full text-xs rounded-xl border border-border-base pl-10 pr-3.5 py-3 bg-muted-bg outline-none font-bold"
                          />
                        </div>
                      </div>
                    )}

                    {/* Agency NTN */}
                    {selectedType === "agency" && (
                      <div>
                        <label className="block text-[10px] font-bold text-muted-text uppercase tracking-wider mb-1">
                          NTN (National Tax Number)
                        </label>
                        <div className="relative">
                          <FileText className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-text" />
                          <input
                            type="text"
                            required
                            maxLength={9}
                            placeholder="XXXXXXX-X"
                            value={ntnNumber}
                            onChange={handleNTNChange}
                            className="w-full text-xs rounded-xl border border-border-base pl-10 pr-3.5 py-3 bg-muted-bg outline-none font-bold"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Upload Agent Photo / Agency Logo */}
                  {(selectedType === "agent" || selectedType === "agency") && (
                    <div className="space-y-3 pt-2">
                      <span className="block text-[10px] font-bold text-muted-text uppercase tracking-wider">
                        {selectedType === "agent" ? "Agent Profile Picture" : "Agency Company Logo"}
                      </span>
                      
                      <div className="flex flex-col items-center justify-center border-2 border-dashed border-border-base rounded-2xl p-6 bg-muted-bg/20 text-center relative overflow-hidden group">
                        {avatarPreview ? (
                          <div className="relative w-28 h-28 rounded-full overflow-hidden border border-border-base shadow-inner">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover" />
                            <button 
                              type="button" 
                              onClick={() => { setAvatarFile(null); setAvatarPreview(null); }}
                              className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-bold cursor-pointer"
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <label className="cursor-pointer flex flex-col items-center w-full h-full justify-center py-4">
                            <Upload className="w-6 h-6 text-muted-text group-hover:text-gold transition-colors mb-2" />
                            <span className="text-[10px] font-bold text-foreground">
                              {selectedType === "agent" ? "Upload Profile Photo" : "Upload Agency Logo"}
                            </span>
                            <span className="text-[9px] text-muted-text mt-0.5">PNG, JPG or JPEG. Required.</span>
                            <input 
                              type="file" 
                              className="hidden" 
                              accept="image/*" 
                              onChange={(e) => handleFileChange(e, "avatar")} 
                            />
                          </label>
                        )}
                        
                        {uploadingState.avatar && (
                          <div className="absolute inset-0 bg-background/90 flex flex-col items-center justify-center p-3">
                            <Loader2 className="w-5 h-5 text-gold animate-spin mb-1" />
                            <div className="w-24 bg-border-base h-1.5 rounded-full overflow-hidden">
                              <div className="bg-gold h-full transition-all duration-150" style={{ width: `${uploadProgress.avatar}%` }} />
                            </div>
                            <span className="text-[8px] font-bold text-muted-text mt-1">Uploading {uploadProgress.avatar}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Agency ID Card Front/Back Drag-and-Drop */}
                  {selectedType === "agency" && (
                    <div className="space-y-3 pt-2">
                      <span className="block text-[10px] font-bold text-muted-text uppercase tracking-wider">
                        Agency Owner ID Card Images (Front & Back)
                      </span>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* ID Card Front Drop Zone */}
                        <div className="flex flex-col items-center justify-center border-2 border-dashed border-border-base rounded-2xl p-4 bg-muted-bg/20 text-center relative overflow-hidden group">
                          {idFrontPreview ? (
                            <div className="w-full h-24 relative rounded-lg overflow-hidden border border-border-base">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={idFrontPreview} alt="Front CNIC" className="w-full h-full object-cover" />
                              <button 
                                type="button" 
                                onClick={() => { setIdFrontFile(null); setIdFrontPreview(null); }}
                                className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 shadow hover:bg-red-700 cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <label className="cursor-pointer flex flex-col items-center w-full h-full justify-center py-4">
                              <Upload className="w-6 h-6 text-muted-text group-hover:text-gold transition-colors mb-2" />
                              <span className="text-[10px] font-bold text-foreground">Upload ID Card Front</span>
                              <span className="text-[9px] text-muted-text mt-0.5">Click to choose image</span>
                              <input 
                                type="file" 
                                className="hidden" 
                                accept="image/*" 
                                onChange={(e) => handleFileChange(e, "front")} 
                              />
                            </label>
                          )}
                          
                          {uploadingState.front && (
                            <div className="absolute inset-0 bg-background/90 flex flex-col items-center justify-center p-3">
                              <Loader2 className="w-5 h-5 text-gold animate-spin mb-1" />
                              <div className="w-24 bg-border-base h-1.5 rounded-full overflow-hidden">
                                <div className="bg-gold h-full transition-all duration-150" style={{ width: `${uploadProgress.front}%` }} />
                              </div>
                              <span className="text-[8px] font-bold text-muted-text mt-1">Uploading {uploadProgress.front}%</span>
                            </div>
                          )}
                        </div>

                        {/* ID Card Back Drop Zone */}
                        <div className="flex flex-col items-center justify-center border-2 border-dashed border-border-base rounded-2xl p-4 bg-muted-bg/20 text-center relative overflow-hidden group">
                          {idBackPreview ? (
                            <div className="w-full h-24 relative rounded-lg overflow-hidden border border-border-base">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={idBackPreview} alt="Back CNIC" className="w-full h-full object-cover" />
                              <button 
                                type="button" 
                                onClick={() => { setIdBackFile(null); setIdBackPreview(null); }}
                                className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 shadow hover:bg-red-700 cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <label className="cursor-pointer flex flex-col items-center w-full h-full justify-center py-4">
                              <Upload className="w-6 h-6 text-muted-text group-hover:text-gold transition-colors mb-2" />
                              <span className="text-[10px] font-bold text-foreground">Upload ID Card Back</span>
                              <span className="text-[9px] text-muted-text mt-0.5">Click to choose image</span>
                              <input 
                                type="file" 
                                className="hidden" 
                                accept="image/*" 
                                onChange={(e) => handleFileChange(e, "back")} 
                              />
                            </label>
                          )}

                          {uploadingState.back && (
                            <div className="absolute inset-0 bg-background/90 flex flex-col items-center justify-center p-3">
                              <Loader2 className="w-5 h-5 text-gold animate-spin mb-1" />
                              <div className="w-24 bg-border-base h-1.5 rounded-full overflow-hidden">
                                <div className="bg-gold h-full transition-all duration-150" style={{ width: `${uploadProgress.back}%` }} />
                              </div>
                              <span className="text-[8px] font-bold text-muted-text mt-1">Uploading {uploadProgress.back}%</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Submission Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-gold hover:bg-gold-hover text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center space-x-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                        <span>Creating Listing Account...</span>
                      </>
                    ) : (
                      <span>Complete Setup & Start Listing</span>
                    )}
                  </button>
                </form>
              </motion.div>
            )}

            {/* STEP 3: SUCCESS ANIMATION */}
            {step === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center py-10 space-y-6 flex flex-col items-center justify-center"
              >
                <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center border border-emerald-500/20 shadow-inner">
                  <CheckCircle className="w-12 h-12" />
                </div>
                
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                    {selectedType === "agent" || selectedType === "agency" ? "Approval Required" : "Simulation Connected"}
                  </span>
                  <h3 className="text-2xl font-extrabold text-foreground">
                    {selectedType === "agent" || selectedType === "agency" ? "Registration Submitted!" : "Profile Linked Successfully!"}
                  </h3>
                  <p className="text-xs text-muted-text max-w-sm mx-auto">
                    {selectedType === "agent" || selectedType === "agency"
                      ? "Thank you for registering. Your profile is pending administrative review. Redirecting to your dashboard..."
                      : "Welcome to Zameen Gem. Redirecting you to the listing creation portal..."}
                  </p>
                </div>

                <div className="flex items-center space-x-2 text-[10px] font-bold text-muted-text">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-gold" />
                  <span>
                    {selectedType === "agent" || selectedType === "agency"
                      ? "Loading dashboard, please wait..."
                      : "Launching wizard, please wait..."}
                  </span>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
