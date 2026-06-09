'use client';

import { Search, Bell, MessageSquare, HelpCircle } from 'lucide-react';

export default function TopNav() {
  return (
    <div className="h-16 bg-[#0F0F0F] border-b border-white/[0.08] flex items-center justify-between px-6 sticky top-0 z-10">
      {/* Search */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search candidates, jobs, applications..."
            className="w-full bg-white/[0.05] border border-white/[0.08] rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#FF5A1F]/50 focus:border-[#FF5A1F]/50"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 ml-8">
        {/* Notifications */}
        <button className="relative p-2 hover:bg-white/[0.05] rounded-lg transition-colors group">
          <Bell className="w-5 h-5 text-white/60 group-hover:text-white/80 transition-colors" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-[#FF5A1F] rounded-full" />
        </button>

        {/* Messages */}
        <button className="relative p-2 hover:bg-white/[0.05] rounded-lg transition-colors group">
          <MessageSquare className="w-5 h-5 text-white/60 group-hover:text-white/80 transition-colors" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-[#FF5A1F] rounded-full" />
        </button>

        {/* Help */}
        <button className="p-2 hover:bg-white/[0.05] rounded-lg transition-colors group">
          <HelpCircle className="w-5 h-5 text-white/60 group-hover:text-white/80 transition-colors" />
        </button>
      </div>
    </div>
  );
}
