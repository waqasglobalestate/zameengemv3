"use client";

import React, { useState } from "react";
import { useAppState } from "@/context/AppStateContext";
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle,
  Building,
  UserCheck
} from "lucide-react";

export default function ContactPage() {
  const { addInquiry } = useAppState();

  // Contact Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [msg, setMsg] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !msg) {
      alert("Please fill out your Name, Phone number, and Message.");
      return;
    }

    addInquiry({
      clientName: name,
      clientEmail: email,
      clientPhone: phone,
      clientMessage: `[Contact Form Subject: ${subject}] Message: ${msg}`,
      agentName: "Waqas Ahmad Chaudhary" // Default CEO routing
    });

    setSubmitted(true);
    setName("");
    setEmail("");
    setPhone("");
    setSubject("");
    setMsg("");

    setTimeout(() => {
      setSubmitted(false);
    }, 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* 1. Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-gold bg-gold/10 px-3 py-1 rounded-full">
          Get In Touch
        </span>
        <h1 className="text-4xl font-extrabold text-foreground tracking-tight">
          Contact Global Estate & Marketing
        </h1>
        <p className="text-xs sm:text-sm text-muted-text">
          Reach out to CEO Waqas Ahmad Chaudhary or our property investment division. We are here to guide your transactions.
        </p>
      </div>

      {/* 2. Grid content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Info cards */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="rounded-2xl border border-border-base bg-background/50 p-6 glass space-y-6">
            <h3 className="text-lg font-bold text-foreground flex items-center space-x-2">
              <Building className="w-5 h-5 text-gold" />
              <span>Office Headquarters</span>
            </h3>

            <div className="space-y-4">
              {/* Address */}
              <div className="flex items-start space-x-3.5 text-xs text-muted-text">
                <MapPin className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-foreground">Location Address</p>
                  <p className="mt-0.5 leading-relaxed">Global Estate & Marketing, DHA Bahawalpur, Punjab, Pakistan</p>
                </div>
              </div>

              {/* CEO Info */}
              <div className="flex items-start space-x-3.5 text-xs text-muted-text">
                <UserCheck className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-foreground">Chief Consultant</p>
                  <p className="mt-0.5 leading-normal">Waqas Ahmad Chaudhary (CEO)</p>
                  <p className="text-[10px] text-gold font-bold">Mobile: +92300-0066255</p>
                </div>
              </div>

              {/* Landline */}
              <div className="flex items-start space-x-3.5 text-xs text-muted-text">
                <Phone className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-foreground">Phone Contacts</p>
                  <p className="mt-0.5 leading-normal">Landline: 062-2280406</p>
                  <p className="mt-0.5 leading-normal">WhatsApp Support: +92 300 0066255</p>
                </div>
              </div>

              {/* Office hours */}
              <div className="flex items-start space-x-3.5 text-xs text-muted-text">
                <Clock className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-foreground">Business Hours</p>
                  <p className="mt-0.5">Monday - Saturday: 9:00 AM to 6:00 PM</p>
                  <p className="text-[10px] text-slate-400">Closed on Sundays & Gazetted Holidays</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start space-x-3.5 text-xs text-muted-text">
                <Mail className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-foreground">Electronic Mail</p>
                  <p className="mt-0.5">Globalrealestates786@gmail.com</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Contact form */}
        <div className="lg:col-span-7 rounded-2xl border border-border-base bg-background/50 p-6 sm:p-8 glass">
          <h3 className="text-xl font-bold text-foreground mb-4">Send Us a Message</h3>
          <p className="text-xs text-muted-text mb-6">
            Fill in the information form below. Our consultants will review your property search parameters and follow up within 24 hours.
          </p>

          {submitted ? (
            <div className="py-12 text-center space-y-4 animate-in fade-in duration-300">
              <div className="mx-auto w-14 h-14 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-lg text-foreground">Thank You! Message Received</h4>
              <p className="text-xs text-muted-text max-w-sm mx-auto">
                Your message has been saved to our database and assigned to Waqas Ahmad Chaudhary. We will contact you shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label className="block text-[10px] font-bold uppercase text-muted-text mb-1.5">Your Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ali Khan"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs rounded-lg border border-border-base px-3.5 py-2.5 bg-muted-bg text-foreground outline-none focus:ring-1 focus:ring-royal font-semibold"
                  />
                </div>
                {/* Phone */}
                <div>
                  <label className="block text-[10px] font-bold uppercase text-muted-text mb-1.5">Phone Number</label>
                  <input 
                    type="tel" 
                    required
                    placeholder="0300-1234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-xs rounded-lg border border-border-base px-3.5 py-2.5 bg-muted-bg text-foreground outline-none focus:ring-1 focus:ring-royal font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Email */}
                <div>
                  <label className="block text-[10px] font-bold uppercase text-muted-text mb-1.5">Email Address</label>
                  <input 
                    type="email" 
                    placeholder="ali@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs rounded-lg border border-border-base px-3.5 py-2.5 bg-muted-bg text-foreground outline-none focus:ring-1 focus:ring-royal font-semibold"
                  />
                </div>
                {/* Subject */}
                <div>
                  <label className="block text-[10px] font-bold uppercase text-muted-text mb-1.5">Subject</label>
                  <input 
                    type="text" 
                    placeholder="Investment Inquiry"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full text-xs rounded-lg border border-border-base px-3.5 py-2.5 bg-muted-bg text-foreground outline-none focus:ring-1 focus:ring-royal font-semibold"
                  />
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-muted-text mb-1.5">Your Message</label>
                <textarea 
                  required
                  placeholder="Tell us about the property types, budgets, or sectors you are looking for..."
                  rows={4}
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  className="w-full text-xs rounded-lg border border-border-base px-3.5 py-2.5 bg-muted-bg text-foreground outline-none focus:ring-1 focus:ring-royal resize-none font-semibold"
                />
              </div>

              {/* Submit button */}
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 bg-royal dark:bg-white text-white dark:text-royal font-bold text-xs sm:text-sm rounded-xl hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors shadow-lg flex items-center justify-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>Submit Lead Form</span>
              </button>
            </form>
          )}

        </div>

      </div>

    </div>
  );
}
