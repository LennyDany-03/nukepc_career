'use client';

import { useRouter } from 'next/navigation';
import { Search, Bell, MessageSquare, HelpCircle, ChevronDown, LogOut } from 'lucide-react';
import { useState } from 'react';

export default function TopNav() {
  const router = useRouter();
  const [showLogoutMenu, setShowLogoutMenu] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_email');
    router.push('/login');
  };

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

        {/* Profile Menu */}
        <div className="relative ml-2">
          <button
            onClick={() => setShowLogoutMenu(!showLogoutMenu)}
            className="flex items-center gap-3 hover:bg-[#FF5A1F]/10 rounded-xl px-3 py-2 transition-all group"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-[#FF5A1F] to-[#FF8A5B] rounded-full flex items-center justify-center flex-shrink-0 shadow-[0_0_12px_rgba(255,90,31,0.3)] group-hover:shadow-[0_0_16px_rgba(255,90,31,0.4)] transition-shadow">
              <span className="text-white text-sm font-medium">HR</span>
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-white leading-tight">HR Manager</p>
              <p className="text-xs text-white/50">Admin</p>
            </div>
            <ChevronDown className="w-4 h-4 text-white/40 group-hover:text-white/60 transition-colors flex-shrink-0" />
          </button>

          {/* Logout Menu */}
          {showLogoutMenu && (
            <div className="absolute right-0 mt-3 w-48 bg-[#1a1a1a] border border-white/[0.08] rounded-lg shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-white/70 hover:text-[#FF5A1F] hover:bg-[#FF5A1F]/10 transition-all text-left"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
