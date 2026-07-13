"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAppState } from "@/context/AppStateContext";
import { Search, Calendar, User, Clock, ChevronRight } from "lucide-react";

export default function BlogLandingPage() {
  const { blogs } = useAppState();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = [
    "All",
    "DHA Bahawalpur Updates",
    "Investment Guides",
    "Property News",
    "Real Estate Tips",
    "Market Analysis"
  ];

  // Filter blogs based on search query and category selection
  const filteredBlogs = blogs.filter((post) => {
    const matchesSearch = 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      
      {/* 1. Page Title */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-gold bg-gold/10 px-3 py-1 rounded-full">
          Knowledge Base
        </span>
        <h1 className="text-4xl font-extrabold text-foreground tracking-tight">
          Global Estate & Marketing Blogs
        </h1>
        <p className="text-xs sm:text-sm text-muted-text">
          Stay informed with the latest updates on DHA Bahawalpur construction progress, property investment guides, and real estate market trends in Pakistan.
        </p>
      </div>

      {/* 2. Search & Category Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl border border-border-base bg-background/50 glass">
        
        {/* Search */}
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-text" />
          <input
            type="text"
            placeholder="Search articles, keywords, tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs rounded-lg border border-border-base pl-9 pr-3 py-2 bg-muted-bg text-foreground outline-none focus:ring-1 focus:ring-royal"
          />
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedCategory === cat
                  ? "bg-royal text-white dark:bg-white dark:text-royal"
                  : "bg-muted-bg text-muted-text hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

      </div>

      {/* 3. Blog Grid display */}
      {filteredBlogs.length === 0 ? (
        <div className="text-center py-20 border border-border-base rounded-2xl bg-muted-bg/50">
          <Search className="w-10 h-10 text-muted-text mx-auto mb-4" />
          <h3 className="text-lg font-bold text-foreground">No Articles Found</h3>
          <p className="text-xs text-muted-text mt-1">Try searching for other keywords or select another category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredBlogs.map((post) => (
            <article 
              key={post.slug}
              className="flex flex-col border border-border-base bg-background/50 hover:bg-background rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 glass"
            >
              {/* Image banner */}
              <div className="relative aspect-video w-full overflow-hidden bg-muted-bg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={post.image} 
                  alt={post.title} 
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-103"
                />
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider rounded bg-royal text-white">
                    {post.category}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="flex-grow p-5 flex flex-col justify-between space-y-4">
                <div className="space-y-2.5">
                  {/* Meta */}
                  <div className="flex items-center space-x-3 text-[10px] font-bold text-muted-text uppercase tracking-wider">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3 text-gold" />
                      <span>{post.publishedAt}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-gold" />
                      <span>{post.readTime}</span>
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-foreground leading-snug line-clamp-2 hover:text-gold transition-colors">
                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                  </h3>
                  
                  <p className="text-xs text-muted-text leading-relaxed line-clamp-3">
                    {post.excerpt}
                  </p>
                </div>

                <div className="pt-4 border-t border-border-base flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-gold/10 text-gold flex items-center justify-center text-[10px] font-bold">
                      {post.author.charAt(0)}
                    </div>
                    <span className="text-[10px] font-bold text-foreground">{post.author}</span>
                  </div>

                  <Link 
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center space-x-0.5 text-xs font-bold text-gold hover:translate-x-0.5 transition-transform"
                  >
                    <span>Read More</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

    </div>
  );
}
