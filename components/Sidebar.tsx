interface SidebarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

export default function Sidebar({ currentPage, setCurrentPage }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'jobs', label: 'Jobs', icon: '💼' },
    { id: 'candidates', label: 'Candidates', icon: '👥' },
    { id: 'applications', label: 'Applications', icon: '📄' },
    { id: 'interviews', label: 'Interviews', icon: '🎯' },
    { id: 'offers', label: 'Offers', icon: '🎁' },
    { id: 'employees', label: 'Employees', icon: '👔' },
    { id: 'reports', label: 'Reports', icon: '📈' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div className="w-64 bg-card-bg border-r border-accent border-opacity-10 flex flex-col overflow-hidden">
      {/* Logo */}
      <div className="p-6 border-b border-accent border-opacity-10">
        <div className="text-2xl font-bold">
          <span className="text-accent">NK</span>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto py-6 px-3">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentPage(item.id)}
            className={`w-full px-4 py-3 rounded-lg text-left font-medium mb-2 transition-all ${
              currentPage === item.id
                ? 'bg-accent text-background'
                : 'text-secondary-text hover:text-foreground hover:bg-accent hover:bg-opacity-10'
            }`}
          >
            <span className="mr-3">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Bottom Action */}
      <div className="p-4 border-t border-accent border-opacity-10">
        <button className="w-full py-3 bg-accent text-background font-semibold rounded-lg hover:bg-accent-hover transition-colors">
          + New Job
        </button>
      </div>
    </div>
  );
}
