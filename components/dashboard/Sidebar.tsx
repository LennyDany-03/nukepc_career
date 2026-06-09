'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { 
  LayoutDashboard, Briefcase, Users, FileText, ClipboardCheck, 
  Calendar, Gift, UserCircle, BarChart3, Settings, ChevronDown, LogOut 
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { id: 'jobs', label: 'Jobs', icon: Briefcase, href: '/dashboard/jobs' },
  { id: 'candidates', label: 'Candidates', icon: Users, href: '/dashboard/candidates' },
  { id: 'applications', label: 'Applications', icon: FileText, href: '/dashboard/applications' },
  { id: 'screening', label: 'ATS Screening', icon: ClipboardCheck, href: '/dashboard/screening' },
  { id: 'interviews', label: 'Interviews', icon: Calendar, href: '/dashboard/interviews' },
  { id: 'offers', label: 'Offers', icon: Gift, href: '/dashboard/offers' },
  { id: 'employees', label: 'Employees', icon: UserCircle, href: '/dashboard/employees' },
  { id: 'reports', label: 'Reports', icon: BarChart3, href: '/dashboard/reports' },
  { id: 'settings', label: 'Settings', icon: Settings, href: '/dashboard/settings' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [showLogoutMenu, setShowLogoutMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  const initials = user
    ? user.first_name
      ? `${user.first_name[0]}${user.last_name?.[0] || ''}`.toUpperCase()
      : user.email[0].toUpperCase()
    : 'U';

  const displayName = user
    ? user.first_name
      ? `${user.first_name} ${user.last_name}`
      : user.email
    : 'User';

  return (
    <div className="w-64 bg-[#0F0F0F] border-r border-white/[0.08] flex flex-col fixed left-0 top-0 h-screen z-20">
      {/* Logo */}
      <div className="p-6 border-b border-white/[0.08]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-[#FF5A1F] to-[#FF8A5B] rounded-lg" />
          <span className="text-xl font-semibold text-white">NUKEPC</span>
        </div>
        <p className="text-xs text-white/50 mt-1">ATS Portal</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (pathname === '/dashboard' && item.id === 'dashboard');
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-all
                ${isActive
                  ? 'bg-[#FF5A1F] text-white shadow-[0_0_20px_rgba(255,90,31,0.3)]'
                  : 'text-white/70 hover:bg-white/[0.05] hover:text-white'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Profile / Logout Menu Dropup */}
      <div className="p-4 border-t border-white/[0.08] relative">
        <button
          onClick={() => setShowLogoutMenu(!showLogoutMenu)}
          className="w-full flex items-center justify-between hover:bg-white/[0.05] rounded-xl p-2.5 transition-all group text-left border border-transparent hover:border-white/[0.05]"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 bg-gradient-to-br from-[#FF5A1F] to-[#FF8A5B] rounded-full flex items-center justify-center flex-shrink-0 shadow-[0_0_12px_rgba(255,90,31,0.3)] group-hover:shadow-[0_0_16px_rgba(255,90,31,0.4)] transition-shadow">
              <span className="text-white text-sm font-semibold">{initials}</span>
            </div>
            <div className="truncate text-left">
              <p className="text-sm font-semibold text-white leading-tight truncate max-w-[120px]">{displayName}</p>
              <p className="text-[10px] text-white/50 mt-0.5">{user?.email === 'admin@nukepc.com' ? 'Super Admin' : 'Admin'}</p>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-white/40 group-hover:text-white/60 transition-colors flex-shrink-0" />
        </button>

        {/* Dropup Menu */}
        {showLogoutMenu && (
          <div className="absolute bottom-full left-4 right-4 mb-2 bg-[#1a1a1a] border border-white/[0.08] rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-white/70 hover:text-[#FF5A1F] hover:bg-[#FF5A1F]/10 transition-all text-left"
            >
              <LogOut className="w-4 h-4 text-white/40" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
