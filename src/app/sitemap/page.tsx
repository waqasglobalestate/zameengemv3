import React from 'react';
import Link from 'next/link';
import { Map, Home, Building, Calculator, FileText, Phone, UserCircle, Users, ShieldCheck } from 'lucide-react';

export default function SitemapPage() {
  const sitemapSections = [
    {
      title: 'Main Navigation',
      icon: <Home className="w-5 h-5 text-gold" />,
      links: [
        { name: 'Home Page', path: '/' },
        { name: 'Property Directory', path: '/properties' },
        { name: 'Property Map View', path: '/properties/map' },
      ],
    },
    {
      title: 'Investment Tools',
      icon: <Calculator className="w-5 h-5 text-gold" />,
      links: [
        { name: 'Investment Calculators', path: '/calculators' },
        { name: 'Property Comparison Matrix', path: '/compare' },
      ],
    },
    {
      title: 'Information & Updates',
      icon: <FileText className="w-5 h-5 text-gold" />,
      links: [
        { name: 'Knowledge Center & Blog', path: '/blog' },
      ],
    },
    {
      title: 'Professionals',
      icon: <Users className="w-5 h-5 text-gold" />,
      links: [
        { name: 'Agent & Agency Directory', path: '/agents' },
      ],
    },
    {
      title: 'Account & Support',
      icon: <UserCircle className="w-5 h-5 text-gold" />,
      links: [
        { name: 'User Dashboard', path: '/dashboard' },
        { name: 'Contact Information', path: '/contact' },
      ],
    },
    {
      title: 'Company & Legal',
      icon: <ShieldCheck className="w-5 h-5 text-gold" />,
      links: [
        { name: 'Privacy Policy', path: '/privacy' },
        { name: 'Terms of Service', path: '/terms' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-royal/10 dark:bg-royal/20 rounded-2xl ring-1 ring-gold/30">
              <Map className="w-8 h-8 text-gold" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight mb-4">
            Site<span className="text-gold">map</span>
          </h1>
          <p className="text-lg text-muted-text max-w-2xl mx-auto">
            Navigate through Zameen Gem's comprehensive real estate platform with ease.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {sitemapSections.map((section, idx) => (
            <div 
              key={section.title} 
              className="bg-card/50 backdrop-blur-md rounded-2xl p-6 border border-border-base shadow-sm hover:shadow-md transition-shadow animate-in fade-in duration-700"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="flex items-center space-x-3 mb-6 border-b border-border-base pb-4">
                <div className="p-2 bg-muted-bg rounded-lg">
                  {section.icon}
                </div>
                <h2 className="text-xl font-bold text-foreground">{section.title}</h2>
              </div>
              <ul className="space-y-4">
                {section.links.map((link) => (
                  <li key={link.path}>
                    <Link 
                      href={link.path}
                      className="group flex items-center text-muted-text hover:text-gold transition-colors font-medium"
                    >
                      <span className="w-2 h-2 rounded-full bg-gold/50 group-hover:bg-gold mr-3 transition-colors" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
