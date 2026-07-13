"use client";

import React, { useState } from "react";
import { X, CheckCircle2, Zap, Shield, Star, Crown, Building2, TrendingUp, Phone, Copy, Check } from "lucide-react";
import { useAppState } from "@/context/AppStateContext";

interface PlanUpgradeModalProps {
  onClose: () => void;
  currentCount: number;
  limit: number;
}

export default function PlanUpgradeModal({ onClose, currentCount, limit }: PlanUpgradeModalProps) {
  const { userSession, upgradeToPro } = useAppState();
  const [requested, setRequested] = useState(false);
  const [copied, setCopied] = useState(false);

  const accountNumber = "0300-0066255";

  const handleCopy = () => {
    navigator.clipboard.writeText(accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRequestActivation = () => {
    upgradeToPro();
    setRequested(true);
  };

  const freeFeatures = [
    "Up to 10 property listings",
    "Basic property analytics",
    "Inquiry management",
    "Standard listing visibility",
  ];

  const proFeatures = [
    "Up to 100 property listings",
    "Advanced analytics & insights",
    "Priority listing placement",
    "Featured property badge",
    "CRM & lead management",
    "AI listing generator",
    "Dedicated support",
    "Verified agent/agency badge",
  ];

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-background border border-border-base shadow-2xl">

        {/* Header gradient */}
        <div className="relative overflow-hidden rounded-t-2xl bg-gradient-to-br from-royal via-royal/90 to-slate-900 p-8 text-white">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 right-4 w-32 h-32 rounded-full bg-gold blur-3xl" />
            <div className="absolute bottom-0 left-8 w-24 h-24 rounded-full bg-white blur-3xl" />
          </div>
          <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
            <X className="w-5 h-5 text-white" />
          </button>
          <div className="relative">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-gold/20 rounded-xl border border-gold/30">
                <Crown className="w-6 h-6 text-gold" />
              </div>
              <span className="text-sm font-semibold text-gold uppercase tracking-widest">Upgrade Required</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-2">Unlock More Listings</h2>
            <p className="text-white/70 text-sm">
              You&apos;ve used <span className="text-gold font-bold">{currentCount} / {limit}</span> listings on your Free plan.
              Upgrade to Pro to list up to <span className="text-gold font-bold">100 properties</span>.
            </p>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">

          {/* Plan Comparison Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Free */}
            <div className="rounded-xl border-2 border-border-base bg-muted-bg p-5 opacity-80">
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-5 h-5 text-muted-text" />
                <span className="text-xs font-bold text-muted-text uppercase tracking-wider">Current Plan</span>
              </div>
              <p className="text-2xl font-extrabold text-foreground mb-0.5">Free</p>
              <p className="text-xs text-muted-text mb-4">Rs. 0 / month</p>
              <ul className="space-y-2">
                {freeFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-muted-text">
                    <CheckCircle2 className="w-4 h-4 text-muted-text mt-0.5 shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <div className="mt-4 px-3 py-1.5 rounded-lg bg-border-base text-xs font-semibold text-center text-muted-text">
                {userSession.plan === "Free" ? "Your Current Plan" : "Previous Plan"}
              </div>
            </div>

            {/* Pro */}
            <div className="relative rounded-xl border-2 border-gold bg-gradient-to-br from-gold/5 to-royal/5 p-5 shadow-lg shadow-gold/10">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-gold text-slate-900 text-[10px] font-extrabold uppercase tracking-widest px-4 py-1 rounded-full shadow">
                  Recommended
                </span>
              </div>
              <div className="flex items-center gap-2 mb-1 mt-3">
                <Crown className="w-5 h-5 text-gold" />
                <span className="text-xs font-bold text-gold uppercase tracking-wider">Pro Plan</span>
              </div>
              <p className="text-2xl font-extrabold text-foreground mb-0.5">Rs. 5,000</p>
              <p className="text-xs text-muted-text mb-4">per month · Unlimited Growth</p>
              <ul className="space-y-2">
                {proFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                    <CheckCircle2 className="w-4 h-4 text-gold mt-0.5 shrink-0" />{f}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: <Building2 className="w-5 h-5 text-gold" />, label: "Max Listings", value: "100" },
              { icon: <TrendingUp className="w-5 h-5 text-gold" />, label: "Priority Visibility", value: "3× More" },
              { icon: <Star className="w-5 h-5 text-gold" />, label: "Featured Badge", value: "Included" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl bg-muted-bg border border-border-base p-3 text-center">
                <div className="flex justify-center mb-1">{s.icon}</div>
                <p className="text-lg font-extrabold text-foreground">{s.value}</p>
                <p className="text-[10px] text-muted-text">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Payment / Success */}
          {!requested ? (
            <div className="rounded-xl border border-gold/30 bg-gold/5 p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-gold" />
                <h3 className="font-bold text-foreground">How to Activate Pro</h3>
              </div>

              <div className="space-y-3 text-sm text-muted-text">
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gold/20 text-gold font-bold text-xs flex items-center justify-center">1</span>
                  <span>Send <strong className="text-foreground">Rs. 5,000</strong> via <strong className="text-foreground">JazzCash / EasyPaisa / Bank Transfer</strong> to:</span>
                </div>

                {/* Account box */}
                <div className="flex items-center justify-between gap-3 rounded-lg bg-background border border-border-base px-4 py-3 mx-0">
                  <div>
                    <p className="text-[10px] text-muted-text uppercase tracking-wide flex items-center gap-1 mb-0.5">
                      <Phone className="w-3 h-3" /> JazzCash / EasyPaisa / WhatsApp
                    </p>
                    <p className="text-xl font-extrabold text-foreground tracking-wider">{accountNumber}</p>
                    <p className="text-xs text-muted-text">Account: <span className="font-semibold text-foreground">Chaudhary Waqas Ahmad</span></p>
                  </div>
                  <button onClick={handleCopy} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-muted-bg border border-border-base hover:border-gold/40 text-sm font-semibold text-foreground transition-all">
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>

                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gold/20 text-gold font-bold text-xs flex items-center justify-center">2</span>
                  <span>Screenshot your payment confirmation and send it on WhatsApp to <strong className="text-foreground">0300-0066255</strong> with your registered email.</span>
                </div>
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gold/20 text-gold font-bold text-xs flex items-center justify-center">3</span>
                  <span>Click <strong className="text-foreground">&quot;Request Pro Activation&quot;</strong> below — our team will activate your account within 1–2 hours.</span>
                </div>
              </div>

              <button
                onClick={handleRequestActivation}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-gold to-yellow-400 text-slate-900 font-extrabold text-sm tracking-wide shadow-lg shadow-gold/30 hover:shadow-gold/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Crown className="w-5 h-5" />
                Request Pro Activation
              </button>
              <p className="text-center text-xs text-muted-text">Pro is activated manually after payment verification.</p>
            </div>
          ) : (
            <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-8 text-center space-y-4">
              <div className="flex justify-center">
                <div className="p-4 rounded-full bg-green-500/10 border border-green-500/30">
                  <CheckCircle2 className="w-10 h-10 text-green-500" />
                </div>
              </div>
              <h3 className="text-xl font-extrabold text-foreground">Pro Activated! 🎉</h3>
              <p className="text-sm text-muted-text max-w-xs mx-auto">
                Your account has been upgraded to <span className="font-bold text-gold">Pro Plan</span>.
                You can now list up to <span className="font-bold text-foreground">100 properties</span>.
              </p>
              <button
                onClick={onClose}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-gold to-yellow-400 text-slate-900 font-extrabold text-sm shadow-lg hover:shadow-gold/50 hover:scale-105 transition-all"
              >
                Start Adding Properties →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
