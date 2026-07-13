"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAppState } from "@/context/AppStateContext";
import { generateAIResponse, ChatMessage } from "@/utils/aiEngine";
import { MessageSquareCode, Send, Mic, MicOff, X, Bot, User, Trash2 } from "lucide-react";
import Link from "next/link";

export default function AIAssistant() {
  const { properties } = useAppState();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<{ start: () => void; stop: () => void } | null>(null);
 
  // Initialize with a welcome message on mount
  useEffect(() => {
    const welcomeMsg: ChatMessage = {
      id: "welcome",
      sender: "ai",
      text: "Assalam-o-Alaikum! I am your <strong><span style='color: #009966;'>Zameen</span><span style='color: #d4af37;'>Gem</span> AI</strong>. Ask me anything about property prices, sector availability, or investment opportunities in <strong>DHA Bahawalpur</strong>.",
      timestamp: new Date(),
      suggestions: [
        "Plots in DHA Bahawalpur under 90 Lakhs",
        "Show luxury villas for sale",
        "Who is CEO Waqas Ahmad?",
        "Rental yield of commercial plots"
      ]
    };
    const timer = setTimeout(() => {
      setMessages([welcomeMsg]);
    }, 0);
    return () => clearTimeout(timer);
  }, []);
 
  // Auto scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);
 
  // Setup Web Speech API for voice search
  useEffect(() => {
    if (typeof window === "undefined") return;
    const SpeechRecognition = (window as Window & { SpeechRecognition?: new() => any; webkitSpeechRecognition?: new() => any }).SpeechRecognition || 
                            (window as Window & { SpeechRecognition?: new() => any; webkitSpeechRecognition?: new() => any }).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "en-PK"; // Pakistan english
 
      rec.onstart = () => {
        setIsListening(true);
      };
 
      rec.onend = () => {
        setIsListening(false);
      };
 
      rec.onresult = (event: unknown) => {
        const speechEvent = event as { results: Array<Array<{ transcript: string }>> };
        const transcript = speechEvent.results[0][0].transcript;
        setInputText(transcript);
        handleSendMessage(transcript);
      };
 
      recognitionRef.current = rec;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [properties]);
 
  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Voice speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.");
      return;
    }
 
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  function handleSendMessage(textToSend?: string) {
    const query = (textToSend || inputText).trim();
    if (!query) return;
 
    // Add user message
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date()
    };
 
    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);
 
    // Simulate AI thinking delay
    setTimeout(() => {
      const response = generateAIResponse(query, properties);
      
      const aiMsg: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        sender: "ai",
        text: response.text,
        timestamp: new Date(),
        suggestions: response.suggestions,
        matchedProperties: response.matchedProperties
      };
 
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 800);
  }

  const clearChat = () => {
    const welcomeMsg: ChatMessage = {
      id: "welcome",
      sender: "ai",
      text: "Assalam-o-Alaikum! I am your <strong><span style='color: #009966;'>Zameen</span><span style='color: #d4af37;'>Gem</span> AI</strong>. Ask me anything about property prices, sector availability, or investment opportunities in <strong>DHA Bahawalpur</strong>.",
      timestamp: new Date(),
      suggestions: [
        "10 Marla plot in Sector A",
        "Villa under 4 Crore",
        "Show featured commercial properties"
      ]
    };
    setMessages([welcomeMsg]);
  };

  return (
    <div className="fixed bottom-6 left-6 z-40 flex flex-col items-start">
      
      {/* AI Chat Window Panel */}
      {isOpen && (
        <div className="w-80 sm:w-96 h-[500px] rounded-2xl bg-background border border-border-base shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300 glass mb-3">
          
          {/* Header */}
          <div className="bg-royal dark:bg-slate-900 border-b border-border-base p-4 flex justify-between items-center text-white">
            <div className="flex items-center space-x-2.5">
              <div className="p-1.5 bg-gold rounded-lg">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm tracking-wide"><span style={{ color: '#009966' }}>Zameen</span><span className="text-gold">Gem</span> AI</h4>
                <p className="text-[10px] text-slate-300">Property Search & Recommendations</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-1.5">
              <button 
                onClick={clearChat}
                className="p-1 rounded-lg hover:bg-slate-800 transition-colors text-slate-300 hover:text-white"
                title="Clear Chat History"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setIsOpen(false)} 
                className="p-1 rounded-lg hover:bg-slate-800 transition-colors text-slate-300 hover:text-white"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                
                {/* Bubble Wrapper */}
                <div className={`flex items-start space-x-2 max-w-[85%] ${msg.sender === "user" ? "flex-row-reverse space-x-reverse" : ""}`}>
                  {/* Sender Avatar */}
                  <div className={`p-1.5 rounded-lg shrink-0 mt-1 ${msg.sender === "user" ? "bg-muted-bg text-royal dark:text-white" : "bg-gold/15 text-gold"}`}>
                    {msg.sender === "user" ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                  </div>

                  {/* Speech bubble */}
                  <div className={`rounded-2xl px-4 py-2.5 text-xs shadow-sm leading-relaxed border ${
                    msg.sender === "user"
                      ? "bg-royal text-white border-royal dark:bg-slate-800 dark:border-slate-700"
                      : "bg-muted-bg text-foreground border-border-base"
                  }`}>
                    <div dangerouslySetInnerHTML={{ __html: msg.text }} />
                  </div>
                </div>

                {/* Sub-cards: Matched Properties inside bubble */}
                {msg.matchedProperties && msg.matchedProperties.length > 0 && (
                  <div className="w-full pl-9 mt-2 grid grid-cols-1 gap-2">
                    {msg.matchedProperties.slice(0, 2).map((prop) => (
                      <div key={prop.id} className="p-2 border border-border-base rounded-xl bg-background/50 hover:bg-background transition-colors flex items-center space-x-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={prop.images[0]} 
                          alt={prop.title}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-bold text-foreground truncate">{prop.title}</p>
                          <p className="text-[9px] text-gold font-bold">
                            PKR {prop.price >= 10000000 
                              ? `${(prop.price / 10000000).toFixed(2)} Crore` 
                              : `${(prop.price / 100000).toFixed(0)} Lakhs`}
                          </p>
                        </div>
                        <Link 
                          href={`/properties/${prop.id}`}
                          className="text-[9px] font-bold px-2 py-1 bg-royal dark:bg-white text-white dark:text-royal hover:bg-gold rounded"
                        >
                          View
                        </Link>
                      </div>
                    ))}
                  </div>
                )}

                {/* Suggestions chips */}
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5 pl-9">
                    {msg.suggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => handleSendMessage(suggestion)}
                        className="text-[10px] font-semibold px-2.5 py-1 bg-background hover:bg-muted-bg text-muted-text hover:text-gold border border-border-base rounded-full shadow-sm transition-all"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}

              </div>
            ))}

            {isTyping && (
              <div className="flex items-center space-x-2 text-muted-text pl-9">
                <Bot className="w-3.5 h-3.5 text-gold animate-bounce" />
                <span className="text-[10px] font-semibold italic">Assistant is searching...</span>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Form Input Bar */}
          <div className="p-3 border-t border-border-base bg-muted-bg flex items-center space-x-2">
            <button
              onClick={toggleListening}
              className={`p-2 rounded-lg border transition-all ${
                isListening 
                  ? "bg-red-500 text-white border-red-500 animate-pulse" 
                  : "bg-background border-border-base text-muted-text hover:text-royal hover:border-royal dark:hover:text-white"
              }`}
              title={isListening ? "Listening... Click to stop" : "Voice Search (Speak)"}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <input
              type="text"
              placeholder={isListening ? "Listening... Speak now" : "Ask AI: e.g. 10 Marla plot under 80L..."}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSendMessage();
              }}
              className="flex-grow text-xs rounded-lg border border-border-base px-3 py-2 bg-background focus:ring-1 focus:ring-royal dark:focus:ring-white outline-none"
              disabled={isListening}
            />

            <button
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim()}
              className="p-2 rounded-lg bg-royal dark:bg-white dark:text-royal text-white hover:bg-royal-hover disabled:opacity-50 disabled:hover:bg-royal transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-gold hover:bg-gold-hover text-white shadow-xl hover:scale-110 transition-all active:scale-95 duration-200 border-2 border-white dark:border-slate-800"
          title="Open AI Property Assistant"
        >
          <MessageSquareCode className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      )}

    </div>
  );
}
