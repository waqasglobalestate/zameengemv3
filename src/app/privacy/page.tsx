import React from 'react';
import { ShieldCheck, Lock, Eye, Server, RefreshCcw } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy | Zameen Gem',
  description: 'Learn how Zameen Gem protects and manages your personal data and privacy.',
};

export default function PrivacyPolicyPage() {
  const lastUpdated = "July 12, 2026";

  return (
    <div className="min-h-screen bg-background pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Header Section */}
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-royal/10 dark:bg-royal/20 rounded-2xl ring-1 ring-gold/30">
              <ShieldCheck className="w-8 h-8 text-gold" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight mb-4">
            Privacy <span className="text-gold">Policy</span>
          </h1>
          <p className="text-lg text-muted-text max-w-2xl mx-auto mb-4">
            We are committed to safeguarding your personal information and ensuring transparency in how we handle your data.
          </p>
          <p className="text-xs text-muted-text font-bold uppercase tracking-widest">
            Last Updated: {lastUpdated}
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-12">
          
          <section className="bg-card/50 backdrop-blur-md rounded-2xl p-6 md:p-10 border border-border-base shadow-sm">
            <div className="flex items-center space-x-3 mb-6">
              <Eye className="w-6 h-6 text-gold" />
              <h2 className="text-2xl font-bold text-foreground">1. Information We Collect</h2>
            </div>
            <div className="space-y-4 text-muted-text leading-relaxed">
              <p>
                When you use the Zameen Gem platform, we may collect various types of information to provide and improve our services to you:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Personal Data:</strong> Name, email address, phone number, and profile image when you register an account.</li>
                <li><strong>Property Data:</strong> Details of properties you list, save, or inquire about on our platform.</li>
                <li><strong>Usage Data:</strong> Information on how you interact with our website, search queries, and AI Assistant logs to improve user experience.</li>
              </ul>
            </div>
          </section>

          <section className="bg-card/50 backdrop-blur-md rounded-2xl p-6 md:p-10 border border-border-base shadow-sm">
            <div className="flex items-center space-x-3 mb-6">
              <Server className="w-6 h-6 text-gold" />
              <h2 className="text-2xl font-bold text-foreground">2. How We Use Your Information</h2>
            </div>
            <div className="space-y-4 text-muted-text leading-relaxed">
              <p>Your information is primarily used to facilitate real estate transactions and enhance our platform:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>To create and manage your user, agent, or agency account.</li>
                <li>To display property listings and connect buyers with sellers.</li>
                <li>To personalize your experience and provide tailored property recommendations via our AI Assistant.</li>
                <li>To send administrative emails, security alerts, and customer support communications.</li>
              </ul>
            </div>
          </section>

          <section className="bg-card/50 backdrop-blur-md rounded-2xl p-6 md:p-10 border border-border-base shadow-sm">
            <div className="flex items-center space-x-3 mb-6">
              <Lock className="w-6 h-6 text-gold" />
              <h2 className="text-2xl font-bold text-foreground">3. Data Security & Storage</h2>
            </div>
            <div className="space-y-4 text-muted-text leading-relaxed">
              <p>
                The security of your data is paramount. Zameen Gem employs industry-standard security measures, including encryption and secure Supabase database architecture, to protect against unauthorized access, alteration, disclosure, or destruction of your personal information and stored properties.
              </p>
              <p>
                While we strive to use commercially acceptable means to protect your data, no method of transmission over the Internet is 100% secure.
              </p>
            </div>
          </section>

          <section className="bg-card/50 backdrop-blur-md rounded-2xl p-6 md:p-10 border border-border-base shadow-sm">
            <div className="flex items-center space-x-3 mb-6">
              <RefreshCcw className="w-6 h-6 text-gold" />
              <h2 className="text-2xl font-bold text-foreground">4. Sharing of Information</h2>
            </div>
            <div className="space-y-4 text-muted-text leading-relaxed">
              <p>
                We do not sell, trade, or rent your personal identification information to others. We may share generic aggregated demographic information not linked to any personal identification information regarding visitors and users with our business partners and trusted affiliates.
              </p>
              <p>
                If you are a Seller or Agent, your provided contact information will be displayed publicly on your property listings to allow potential buyers to reach out to you.
              </p>
            </div>
          </section>

        </div>

        {/* Footer Actions */}
        <div className="mt-16 text-center border-t border-border-base pt-10">
          <p className="text-muted-text mb-6">Have questions regarding our privacy practices?</p>
          <Link href="/contact" className="inline-flex items-center justify-center px-8 py-3.5 bg-royal dark:bg-white text-white dark:text-royal font-bold rounded-xl hover:bg-gold dark:hover:bg-gold hover:text-white transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
            Contact Support
          </Link>
        </div>

      </div>
    </div>
  );
}
