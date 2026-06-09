import { LayoutDashboard, Briefcase, Users, FileText, ClipboardCheck, Calendar, Gift, UserCircle, BarChart3, Settings, Plus } from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'jobs', label: 'Jobs', icon: Briefcase },
    { id: 'candidates', label: 'Candidates', icon: Users },
    { id: 'applications', label: 'Applications', icon: FileText },
    { id: 'screening', label: 'ATS Screening', icon: ClipboardCheck },
    { id: 'interviews', label: 'Interviews', icon: Calendar },
    { id: 'offers', label: 'Offers', icon: Gift },
    { id: 'employees', label: 'Employees', icon: UserCircle },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="w-64 h-screen bg-[#0F0F0F] border-r border-white/[0.08] flex flex-col sticky top-0">
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
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
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
            </button>
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
