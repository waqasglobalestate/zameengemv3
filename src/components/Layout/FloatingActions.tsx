"use client";

import React, { useState } from "react";
import { MessageSquare, Phone, Send, X } from "lucide-react";
import { useAppState } from "@/context/AppStateContext";

export default function FloatingActions() {
  const { addLead } = useAppState();
  const [showQuickChat, setShowQuickChat] = useState(false);
  const [chatName, setChatName] = useState("");
  const [chatMsg, setChatMsg] = useState("");

  const ceoPhone = "+92300-0066255";
  const whatsAppApiUrl = "https://wa.me/923000066255";

  const handleSendWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMsg) return;
    
    const introText = chatName ? `Hello Waqas Ahmad (CEO), I am ${chatName}. ` : "Hello Zameen Gem. ";
    const fullText = encodeURIComponent(introText + chatMsg);
    
    // Capture Lead in CRM
    addLead({
      name: chatName || "Anonymous Visitor",
      phone: "N/A",
      email: "N/A",
      whatsApp: "Yes",
      propertyInterested: `WhatsApp Floating Chat: "${chatMsg.substring(0, 40)}${chatMsg.length > 40 ? "..." : ""}"`,
      source: "WhatsApp Clicks",
      agentId: "Chaudhary Waqas"
    });

    window.open(`${whatsAppApiUrl}?text=${fullText}`, "_blank");
    setChatMsg("");
    setChatName("");
    setShowQuickChat(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col space-y-3 items-end">
      
      {/* WhatsApp Quick Chat Window */}
      {showQuickChat && (
        <div className="w-80 rounded-2xl bg-background border border-border-base shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="bg-emerald-600 text-white p-4 flex justify-between items-center">
            <div>
              <h4 className="font-bold text-sm">Chat with Waqas Ahmad</h4>
              <p className="text-[10px] text-emerald-100">CEO - Zameen Gem</p>
            </div>
            <button 
              onClick={() => setShowQuickChat(false)} 
              className="p-1 rounded-full hover:bg-emerald-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <form onSubmit={handleSendWhatsApp} className="p-4 space-y-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-text mb-1">Your Name</label>
              <input 
                type="text" 
                placeholder="e.g. Ali Khan" 
                value={chatName}
                onChange={(e) => setChatName(e.target.value)}
                className="w-full text-sm rounded-lg border border-border-base px-3 py-2 bg-muted-bg focus:ring-1 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-text mb-1">Message</label>
              <textarea 
                required
                placeholder="I am interested in DHA Bahawalpur..." 
                rows={3}
                value={chatMsg}
                onChange={(e) => setChatMsg(e.target.value)}
                className="w-full text-sm rounded-lg border border-border-base px-3 py-2 bg-muted-bg focus:ring-1 focus:ring-emerald-500 outline-none resize-none"
              />
            </div>
            <button 
              type="submit"
              className="w-full bg-emerald-600 text-white py-2 rounded-lg font-semibold hover:bg-emerald-700 transition-all flex items-center justify-center space-x-2 text-sm"
            >
              <Send className="w-4 h-4" />
              <span>Start WhatsApp Chat</span>
            </button>
          </form>
        </div>
      )}

      {/* Floating Buttons */}
      <div className="flex space-x-2.5 sm:space-x-3 items-center">
        {/* Call Button */}
        <a
          href={`tel:${ceoPhone}`}
          className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-royal hover:bg-royal-hover text-white shadow-xl hover:scale-110 transition-all active:scale-95 duration-200"
          title="Call CEO Waqas Ahmad"
        >
          <Phone className="w-5 h-5 sm:w-6 sm:h-6" />
        </a>

        {/* WhatsApp Button */}
        <button
          onClick={() => setShowQuickChat(!showQuickChat)}
          className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full text-white shadow-xl hover:scale-110 transition-all active:scale-95 duration-200 animate-bounce cursor-pointer"
          style={{ animationDuration: "3s", backgroundColor: "#25D366" }}
          title="WhatsApp CEO"
        >
          <svg viewBox="0 0 24 24" className="w-6 h-6 sm:w-7 sm:h-7 fill-current">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
        </button>
      </div>
      
    </div>
  );
}
