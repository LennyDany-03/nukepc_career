'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Briefcase, Users, FileText, ClipboardCheck, Calendar, Gift, UserCircle, BarChart3, Settings, Plus } from 'lucide-react';

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

      {/* Post Job Button */}
      <div className="p-4 border-t border-white/[0.08]">
        <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#FF5A1F] to-[#FF7A4A] text-white rounded-lg font-medium shadow-[0_0_20px_rgba(255,90,31,0.4)] hover:shadow-[0_0_30px_rgba(255,90,31,0.6)] transition-all">
          <Plus className="w-5 h-5" />
          Post New Job
        </button>
      </div>
    </div>
  );
}
