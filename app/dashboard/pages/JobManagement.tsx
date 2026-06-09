import { Search, Filter, Plus, MoreVertical, MapPin, Users, Clock, Edit, Copy, Eye, Trash2 } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

export default function JobManagement() {
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const jobs = [
    {
      id: 1,
      title: 'Senior React Developer',
      department: 'Engineering',
      location: 'Remote',
      type: 'Full-time',
      applications: 147,
      status: 'Published',
      created: '2024-06-01',
    },
    {
      id: 2,
      title: 'UX Designer',
      department: 'Design',
      location: 'New York, NY',
      type: 'Full-time',
      applications: 89,
      status: 'Published',
      created: '2024-06-03',
    },
    {
      id: 3,
      title: 'Product Manager',
      department: 'Product',
      location: 'San Francisco, CA',
      type: 'Full-time',
      applications: 203,
      status: 'Published',
      created: '2024-05-28',
    },
    {
      id: 4,
      title: 'DevOps Engineer',
      department: 'Engineering',
      location: 'Remote',
      type: 'Full-time',
      applications: 124,
      status: 'Published',
      created: '2024-06-05',
    },
    {
      id: 5,
      title: 'Data Scientist',
      department: 'Data',
      location: 'Austin, TX',
      type: 'Full-time',
      applications: 95,
      status: 'Draft',
      created: '2024-06-07',
    },
    {
      id: 6,
      title: 'Marketing Manager',
      department: 'Marketing',
      location: 'Boston, MA',
      type: 'Full-time',
      applications: 67,
      status: 'Published',
      created: '2024-06-02',
    },
    {
      id: 7,
      title: 'Backend Engineer',
      department: 'Engineering',
      location: 'Remote',
      type: 'Contract',
      applications: 178,
      status: 'Closed',
      created: '2024-05-15',
    },
    {
      id: 8,
      title: 'Sales Executive',
      department: 'Sales',
      location: 'Chicago, IL',
      type: 'Full-time',
      applications: 54,
      status: 'Published',
      created: '2024-06-06',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Published':
        return 'bg-green-500/20 text-green-400';
      case 'Draft':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'Closed':
        return 'bg-red-500/20 text-red-400';
      case 'Archived':
        return 'bg-gray-500/20 text-gray-400';
      default:
        return 'bg-white/10 text-white/70';
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-white mb-2">Job Management</h1>
          <p className="text-white/50">Manage Open Positions</p>
        </div>
        <Link href="/dashboard/jobs/new" className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FF5A1F] to-[#FF7A4A] text-white rounded-lg font-medium shadow-[0_0_20px_rgba(255,90,31,0.4)] hover:shadow-[0_0_30px_rgba(255,90,31,0.6)] transition-all">
          <Plus className="w-5 h-5" />
          Create New Job
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="bg-[#141414] border border-white/[0.08] rounded-xl p-6 mb-6">
        <div className="grid grid-cols-5 gap-4">
          {/* Search */}
          <div className="col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Search jobs..."
              className="w-full bg-white/[0.05] border border-white/[0.08] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#FF5A1F]/50"
            />
          </div>

          {/* Department Filter */}
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="bg-white/[0.05] border border-white/[0.08] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#FF5A1F]/50"
          >
            <option value="all">All Departments</option>
            <option value="engineering">Engineering</option>
            <option value="design">Design</option>
            <option value="product">Product</option>
            <option value="marketing">Marketing</option>
            <option value="sales">Sales</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white/[0.05] border border-white/[0.08] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#FF5A1F]/50"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="closed">Closed</option>
            <option value="archived">Archived</option>
          </select>

          {/* Export */}
          <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white/[0.05] border border-white/[0.08] text-white rounded-lg hover:bg-white/[0.08] transition-colors">
            <Filter className="w-4 h-4" />
            <span className="text-sm">Export</span>
          </button>
        </div>
      </div>

      {/* Jobs Table */}
      <div className="bg-[#141414] border border-white/[0.08] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/[0.02] border-b border-white/[0.08]">
              <tr>
                <th className="text-left text-xs font-medium text-white/50 px-6 py-4">Job Title</th>
                <th className="text-left text-xs font-medium text-white/50 px-6 py-4">Department</th>
                <th className="text-left text-xs font-medium text-white/50 px-6 py-4">Location</th>
                <th className="text-left text-xs font-medium text-white/50 px-6 py-4">Type</th>
                <th className="text-left text-xs font-medium text-white/50 px-6 py-4">Applications</th>
                <th className="text-left text-xs font-medium text-white/50 px-6 py-4">Status</th>
                <th className="text-left text-xs font-medium text-white/50 px-6 py-4">Created</th>
                <th className="text-left text-xs font-medium text-white/50 px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr
                  key={job.id}
                  className="border-b border-white/[0.05] hover:bg-white/[0.02] transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-white mb-1">{job.title}</p>
                      <div className="flex items-center gap-2 text-xs text-white/50">
                        <Users className="w-3 h-3" />
                        <span>{job.applications} applicants</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-white/70">{job.department}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-white/70">
                      <MapPin className="w-3.5 h-3.5 text-white/40" />
                      {job.location}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-white/[0.05] text-white/70 text-xs rounded-md">
                      {job.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#FF5A1F] to-[#FF8A5B]"
                          style={{ width: `${Math.min((job.applications / 200) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm text-white font-medium">{job.applications}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-md ${getStatusColor(job.status)}`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-white/50">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(job.created).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 hover:bg-white/[0.05] rounded-lg transition-colors" title="View">
                        <Eye className="w-4 h-4 text-white/70" />
                      </button>
                      <button className="p-1.5 hover:bg-white/[0.05] rounded-lg transition-colors" title="Edit">
                        <Edit className="w-4 h-4 text-white/70" />
                      </button>
                      <button className="p-1.5 hover:bg-white/[0.05] rounded-lg transition-colors" title="Duplicate">
                        <Copy className="w-4 h-4 text-white/70" />
                      </button>
                      <button className="p-1.5 hover:bg-white/[0.05] rounded-lg transition-colors" title="More">
                        <MoreVertical className="w-4 h-4 text-white/70" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
