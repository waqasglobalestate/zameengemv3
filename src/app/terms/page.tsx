import React from 'react';
import { Scale, FileSignature, AlertTriangle, HelpCircle } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service | Zameen Gem',
  description: 'Read the terms and conditions governing the use of Zameen Gem platform.',
};

export default function TermsOfServicePage() {
  const lastUpdated = "July 12, 2026";

  return (
    <div className="min-h-screen bg-background pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Header Section */}
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-royal/10 dark:bg-royal/20 rounded-2xl ring-1 ring-gold/30">
              <Scale className="w-8 h-8 text-gold" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight mb-4">
            Terms of <span className="text-gold">Service</span>
          </h1>
          <p className="text-lg text-muted-text max-w-2xl mx-auto mb-4">
            By accessing or using Zameen Gem, you agree to be bound by these terms. Please read them carefully.
          </p>
          <p className="text-xs text-muted-text font-bold uppercase tracking-widest">
            Last Updated: {lastUpdated}
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-12">
          
          <section className="bg-card/50 backdrop-blur-md rounded-2xl p-6 md:p-10 border border-border-base shadow-sm">
            <div className="flex items-center space-x-3 mb-6">
              <FileSignature className="w-6 h-6 text-gold" />
              <h2 className="text-2xl font-bold text-foreground">1. Acceptance of Terms</h2>
            </div>
            <div className="space-y-4 text-muted-text leading-relaxed">
              <p>
                By creating an account, browsing property listings, or otherwise using the Zameen Gem platform, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree to these terms, you must not access or use our services.
              </p>
            </div>
          </section>

          <section className="bg-card/50 backdrop-blur-md rounded-2xl p-6 md:p-10 border border-border-base shadow-sm">
            <div className="flex items-center space-x-3 mb-6">
              <AlertTriangle className="w-6 h-6 text-gold" />
              <h2 className="text-2xl font-bold text-foreground">2. User Conduct & Listings</h2>
            </div>
            <div className="space-y-4 text-muted-text leading-relaxed">
              <p>As a user of Zameen Gem, particularly as a Seller, Agent, or Agency, you agree to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide accurate, current, and complete information regarding any properties you list.</li>
                <li>Ensure you have the legal right or authorization to list, sell, or rent the property.</li>
                <li>Not post fraudulent, misleading, or inappropriate content.</li>
                <li>Respect the intellectual property rights of others when uploading images or descriptions.</li>
              </ul>
              <p>Zameen Gem reserves the right to remove any listing or suspend any account that violates these guidelines without prior notice.</p>
            </div>
          </section>

          <section className="bg-card/50 backdrop-blur-md rounded-2xl p-6 md:p-10 border border-border-base shadow-sm">
            <div className="flex items-center space-x-3 mb-6">
              <Scale className="w-6 h-6 text-gold" />
              <h2 className="text-2xl font-bold text-foreground">3. Liability Disclaimer</h2>
            </div>
            <div className="space-y-4 text-muted-text leading-relaxed">
              <p>
                Zameen Gem acts as a digital intermediary platform connecting buyers, sellers, and agents. We do not own, manage, or actively inspect the properties listed on our site.
              </p>
              <p>
                Therefore, Zameen Gem shall not be held liable for any inaccuracies in property details, financial losses, or disputes arising between users. Users are strongly advised to conduct their own due diligence, verify documents, and consult legal counsel before finalizing any real estate transactions.
              </p>
            </div>
          </section>

          <section className="bg-card/50 backdrop-blur-md rounded-2xl p-6 md:p-10 border border-border-base shadow-sm">
            <div className="flex items-center space-x-3 mb-6">
              <HelpCircle className="w-6 h-6 text-gold" />
              <h2 className="text-2xl font-bold text-foreground">4. Modifications to Service</h2>
            </div>
            <div className="space-y-4 text-muted-text leading-relaxed">
              <p>
                We reserve the right to modify or discontinue, temporarily or permanently, the Zameen Gem platform (or any part thereof) with or without notice. We shall not be liable to you or to any third party for any modification, suspension, or discontinuance of the service.
              </p>
            </div>
          </section>

        </div>

        {/* Footer Actions */}
        <div className="mt-16 text-center border-t border-border-base pt-10">
          <p className="text-muted-text mb-6">Need clarification on our terms?</p>
          <Link href="/contact" className="inline-flex items-center justify-center px-8 py-3.5 bg-royal dark:bg-white text-white dark:text-royal font-bold rounded-xl hover:bg-gold dark:hover:bg-gold hover:text-white transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
            Contact Support
          </Link>
        </div>

      </div>
    </div>
  );
}
