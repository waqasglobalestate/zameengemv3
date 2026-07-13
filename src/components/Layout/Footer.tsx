"use client";

import React from "react";
import Link from "next/link";
import { Phone, Mail, MapPin, Award } from "lucide-react";
import { useAppState } from "@/context/AppStateContext";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { setIsAuthModalOpen, setAuthModalDefaultTab } = useAppState();

  return (
    <footer className="bg-slate-950 text-slate-200 border-t border-slate-900 pt-16 pb-8 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Column 1: Brand & CEO Info */}
          <div className="space-y-4">
            <Link href="/" className="flex flex-col">
              <span className="text-2xl font-black tracking-tight text-white">
                ZAMEEN <span className="text-[#d4af37]">GEM</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Your premier, trusted partner for real estate investment consulting in Pakistan, specializing in high-yielding DHA and Bahria Town developments.
            </p>
            <div className="flex items-center space-x-2.5 pt-2">
              <Award className="w-5 h-5 text-[#d4af37]" />
              <div className="text-xs">
                <p className="font-bold text-white uppercase tracking-wider">Waqas Ahmad Chaudhary</p>
                <p className="text-slate-400 text-[10px]">Chief Executive Officer</p>
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4 border-l-2 border-[#d4af37] pl-3">
              Quick Navigation
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/" className="text-slate-400 hover:text-[#d4af37] transition-colors">
                  Home Page
                </Link>
              </li>
              <li>
                <Link href="/properties" className="text-slate-400 hover:text-[#d4af37] transition-colors">
                  Property Directory
                </Link>
              </li>
              <li>
                <Link href="/compare" className="text-slate-400 hover:text-[#d4af37] transition-colors">
                  Comparison Matrix
                </Link>
              </li>
              <li>
                <Link href="/calculators" className="text-slate-400 hover:text-[#d4af37] transition-colors">
                  Investment Calculators
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-slate-400 hover:text-[#d4af37] transition-colors">
                  Knowledge Center & Blogs
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Featured Projects */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4 border-l-2 border-[#d4af37] pl-3">
              Premium Projects
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/properties?location=DHA+Bahawalpur" className="text-slate-400 hover:text-[#d4af37] transition-colors font-semibold text-white">
                  DHA Bahawalpur (Featured)
                </Link>
              </li>
              <li>
                <Link href="/properties?location=DHA+Multan" className="text-slate-400 hover:text-[#d4af37] transition-colors">
                  DHA Multan
                </Link>
              </li>
              <li>
                <Link href="/properties?location=DHA+Lahore" className="text-slate-400 hover:text-[#d4af37] transition-colors">
                  DHA Lahore
                </Link>
              </li>
              <li>
                <Link href="/properties?location=DHA+Islamabad" className="text-slate-400 hover:text-[#d4af37] transition-colors">
                  DHA Islamabad
                </Link>
              </li>
              <li>
                <Link href="/properties?location=Bahria+Town+Projects" className="text-slate-400 hover:text-[#d4af37] transition-colors">
                  Bahria Town Projects
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact Details */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4 border-l-2 border-[#d4af37] pl-3">
              Contact Information
            </h3>
            <ul className="space-y-3.5 text-sm">
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-[#d4af37] shrink-0 mt-0.5" />
                <span className="text-slate-400 leading-normal">
                  Zameen Gem, DHA Bahawalpur, Punjab, Pakistan
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-[#d4af37] shrink-0" />
                <span className="text-slate-400">
                  Mobile: +92300-0066255
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-[#d4af37] shrink-0" />
                <span className="text-slate-400">
                  Landline: 062-2280406
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-[#d4af37] shrink-0" />
                <span className="text-slate-400 truncate">
                  Globalrealestates786@gmail.com
                </span>
              </li>
            </ul>
          </div>
        </div>

        <hr className="border-slate-800 my-10" />

        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {currentYear} Zameen Gem. All Rights Reserved.</p>
          <div className="flex space-x-4 items-center">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/sitemap" className="hover:text-white transition-colors">Sitemap</Link>
            <span className="text-slate-800">|</span>
            <button 
              onClick={() => {
                setAuthModalDefaultTab("login");
                setIsAuthModalOpen(true);
              }}
              className="hover:text-white transition-colors cursor-pointer font-bold uppercase"
            >
              Admin
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
