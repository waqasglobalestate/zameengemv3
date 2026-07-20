"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppState } from "@/context/AppStateContext";
import Link from "next/link";
import { ArrowLeft, Calendar, User, Clock, ShieldAlert, Tag, Share2 } from "lucide-react";

export default function BlogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { blogs, isLoaded } = useAppState();

  const slug = params.slug as string;
  const post = blogs.find((b) => b.slug === slug);

  if (!isLoaded) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center font-bold text-muted-text">
        Loading article details...
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-red-500 mx-auto" />
        <h3 className="text-xl font-bold text-foreground">Article Not Found</h3>
        <p className="text-xs text-muted-text">The blog article with slug &ldquo;{slug}&rdquo; does not exist or has been archived.</p>
        <button
          onClick={() => router.push("/blog")}
          className="px-4 py-2 bg-royal text-white font-bold text-xs rounded-lg hover:bg-slate-800 transition-colors"
        >
          Return to Blog Directory
        </button>
      </div>
    );
  }

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      
      {/* 1. Header Back link */}
      <div>
        <Link 
          href="/blog" 
          className="inline-flex items-center space-x-1 text-xs font-bold text-muted-text hover:text-foreground mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Blog Hub</span>
        </Link>

        {/* Category tag */}
        <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-gold bg-gold/10 px-2.5 py-1 rounded-full mb-3">
          {post.category}
        </span>

        {/* Title */}
        <h1 className="text-2xl sm:text-4xl font-black text-foreground tracking-tight leading-tight">
          {post.title}
        </h1>

        {/* Meta Row */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-muted-text uppercase tracking-wider mt-4 pb-6 border-b border-border-base">
          <span className="flex items-center space-x-1.5">
            <Calendar className="w-4 h-4 text-gold" />
            <span>{post.publishedAt}</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <Clock className="w-4 h-4 text-gold" />
            <span>{post.readTime}</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <User className="w-4 h-4 text-gold" />
            <span>By {post.author}</span>
          </span>
        </div>
      </div>

      {/* 2. Featured Image */}
      <div className="relative aspect-video w-full rounded-2xl overflow-hidden shadow-lg border border-border-base bg-muted-bg">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={post.image} 
          alt={post.title} 
          className="w-full h-full object-cover"
        />
      </div>

      {/* 3. Main Body Content */}
      <div className="prose prose-slate dark:prose-invert max-w-none text-xs sm:text-sm text-foreground/90 leading-relaxed space-y-6">
        <div 
          className="space-y-4"
          dangerouslySetInnerHTML={{ __html: post.content }} 
        />
      </div>

      {/* 4. Footer Tags & Share */}
      <div className="pt-6 border-t border-border-base flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-wrap gap-1.5 items-center">
          <Tag className="w-4 h-4 text-gold shrink-0" />
          {post.tags.map((tag) => (
            <span 
              key={tag} 
              className="text-[10px] font-semibold bg-muted-bg border border-border-base rounded-lg px-2.5 py-1 text-muted-text"
            >
              #{tag}
            </span>
          ))}
        </div>

        <button
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            alert("Share link copied to clipboard!");
          }}
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-muted-text hover:text-gold transition-colors"
        >
          <Share2 className="w-4 h-4" />
          <span>Copy Share Link</span>
        </button>
      </div>

      {/* 5. Author Bio Widget */}
      <div className="p-6 bg-muted-bg border border-border-base rounded-2xl flex items-start space-x-4">
        <div className="w-12 h-12 rounded-full bg-gold/10 text-gold flex items-center justify-center font-bold text-lg shrink-0">
          {post.author.charAt(0)}
        </div>
        <div>
          <h4 className="font-extrabold text-sm text-foreground">{post.author}</h4>
          <p className="text-[10px] text-muted-text uppercase tracking-wider mt-0.5">Author & Market Analyst</p>
          <p className="text-xs text-muted-text mt-2 leading-relaxed">
            Waqas Ahmad and the Zameen Gem research division contribute comprehensive property analytics, layout status audits, and investment growth briefings.
          </p>
        </div>
      </div>

    </article>
  );
}
