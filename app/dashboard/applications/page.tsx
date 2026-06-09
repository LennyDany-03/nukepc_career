'use client';

import { Search, Download, Users, Calendar, TrendingUp, Clock, Eye, MessageSquare, CheckCircle2, XCircle } from 'lucide-react';
import { useState } from 'react';

export default function ApplicationManagement() {
  const [filterStage, setFilterStage] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const summaryCards = [
    { label: 'Active Candidates', value: '2,847', change: '+18%', icon: Users, color: 'from-[#FF5A1F] to-[#FF8A5B]' },
    { label: 'Interviewing', value: '124', change: '+12%', icon: Calendar, color: 'from-[#FF7A4A] to-[#FF9A6F]' },
    { label: 'ATS Efficiency', value: '87%', change: '+5%', icon: TrendingUp, color: 'from-[#FF9A6F] to-[#FFB399]' },
    { label: 'Avg Time To Hire', value: '23d', change: '-8%', icon: Clock, color: 'from-[#FFB399] to-[#FFC6B3]' },
  ];

  const applications = [
    {
      id: 1,
      candidate: { name: 'Sarah Johnson', avatar: 'SJ', email: 'sarah.j@email.com' },
      job: 'Senior React Developer',
      department: 'Engineering',
      appliedDate: '2024-06-08',
      atsScore: 94,
      stage: 'Interview Scheduled',
      status: 'In Progress',
    },
    {
      id: 2,
      candidate: { name: 'Michael Chen', avatar: 'MC', email: 'michael.c@email.com' },
      job: 'UX Designer',
      department: 'Design',
      appliedDate: '2024-06-08',
      atsScore: 87,
      stage: 'Screening',
      status: 'Pending Review',
    },
    {
      id: 3,
      candidate: { name: 'Emily Rodriguez', avatar: 'ER', email: 'emily.r@email.com' },
      job: 'Product Manager',
      department: 'Product',
      appliedDate: '2024-06-07',
      atsScore: 91,
      stage: 'Offer Sent',
      status: 'In Progress',
    },
    {
      id: 4,
      candidate: { name: 'James Wilson', avatar: 'JW', email: 'james.w@email.com' },
      job: 'DevOps Engineer',
      department: 'Engineering',
      appliedDate: '2024-06-07',
      atsScore: 89,
      stage: 'Interview Completed',
      status: 'In Progress',
    },
    {
      id: 5,
      candidate: { name: 'Aisha Patel', avatar: 'AP', email: 'aisha.p@email.com' },
      job: 'Data Scientist',
      department: 'Data',
      appliedDate: '2024-06-06',
      atsScore: 92,
      stage: 'Screening',
      status: 'In Progress',
    },
    {
      id: 6,
      candidate: { name: 'David Kim', avatar: 'DK', email: 'david.k@email.com' },
      job: 'Marketing Manager',
      department: 'Marketing',
      appliedDate: '2024-06-06',
      atsScore: 78,
      stage: 'Shortlisted',
      status: 'Pending Review',
    },
    {
      id: 7,
      candidate: { name: 'Lisa Anderson', avatar: 'LA', email: 'lisa.a@email.com' },
      job: 'Backend Engineer',
      department: 'Engineering',
      appliedDate: '2024-06-05',
      atsScore: 85,
      stage: 'Applied',
      status: 'In Progress',
    },
    {
      id: 8,
      candidate: { name: 'Robert Taylor', avatar: 'RT', email: 'robert.t@email.com' },
      job: 'Sales Executive',
      department: 'Sales',
      appliedDate: '2024-06-05',
      atsScore: 72,
      stage: 'Screening',
      status: 'In Progress',
    },
    {
      id: 9,
      candidate: { name: 'Maria Garcia', avatar: 'MG', email: 'maria.g@email.com' },
      job: 'Senior React Developer',
      department: 'Engineering',
      appliedDate: '2024-06-04',
      atsScore: 88,
      stage: 'Interview Scheduled',
      status: 'In Progress',
    },
    {
      id: 10,
      candidate: { name: 'John Smith', avatar: 'JS', email: 'john.s@email.com' },
      job: 'UX Designer',
      department: 'Design',
      appliedDate: '2024-06-04',
      atsScore: 55,
      stage: 'Rejected',
      status: 'Rejected',
    },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 90) return { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Excellent' };
    if (score >= 75) return { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Good' };
    if (score >= 60) return { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Average' };
    return { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Weak' };
  };

  const getStageColor = (stage: string) => {
    const stageColors: Record<string, string> = {
      'Applied': 'bg-blue-500/20 text-blue-400',
      'Screening': 'bg-purple-500/20 text-purple-400',
      'Shortlisted': 'bg-cyan-500/20 text-cyan-400',
      'Interview Scheduled': 'bg-[#FF5A1F]/20 text-[#FF5A1F]',
      'Interview Completed': 'bg-indigo-500/20 text-indigo-400',
      'Selected': 'bg-green-500/20 text-green-400',
      'Offer Sent': 'bg-emerald-500/20 text-emerald-400',
      'Hired': 'bg-green-600/20 text-green-500',
      'Rejected': 'bg-red-500/20 text-red-400',
    };
    return stageColors[stage] || 'bg-white/10 text-white/70';
  };

  const getStatusColor = (status: string) => {
    if (status === 'In Progress') return 'bg-blue-500/20 text-blue-400';
    if (status === 'Pending Review') return 'bg-yellow-500/20 text-yellow-400';
    if (status === 'Rejected') return 'bg-red-500/20 text-red-400';
    if (status === 'Hired') return 'bg-green-500/20 text-green-400';
    return 'bg-white/10 text-white/70';
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Applications</h1>
        <p className="text-white/50">Track and manage all candidate applications</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {summaryCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className="group bg-gradient-to-br from-[#141414] to-[#0F0F0F] border border-white/[0.08] rounded-xl p-6 hover:border-[#FF5A1F]/30 hover:shadow-[0_0_20px_rgba(255,90,31,0.15)] transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-14 h-14 bg-gradient-to-br ${card.color} opacity-20 rounded-lg flex items-center justify-center group-hover:opacity-30 transition-opacity`}>
                  <Icon className="w-7 h-7 text-[#FF5A1F]" />
                </div>
                <span className="text-sm font-semibold text-green-400 bg-green-500/20 px-2.5 py-1 rounded-lg">{card.change}</span>
              </div>
              <p className="text-3xl font-bold text-white mb-2">{card.value}</p>
              <p className="text-sm text-white/60">{card.label}</p>
            </div>
          );
        })}
      </div>

      {/* Filter Bar */}
      <div className="bg-[#141414] border border-white/[0.08] rounded-xl p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Search candidates..."
              className="w-full bg-white/[0.05] border border-white/[0.08] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#FF5A1F]/50 transition-all"
            />
          </div>

          {/* Stage Filter */}
          <select
            value={filterStage}
            onChange={(e) => setFilterStage(e.target.value)}
            className="bg-white/[0.05] border border-white/[0.08] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#FF5A1F]/50 transition-all"
          >
            <option value="all">All Stages</option>
            <option value="applied">Applied</option>
            <option value="screening">Screening</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="interview">Interview</option>
            <option value="offer">Offer</option>
            <option value="hired">Hired</option>
          </select>

          {/* Department Filter */}
          <select className="bg-white/[0.05] border border-white/[0.08] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#FF5A1F]/50 transition-all">
            <option value="all">All Departments</option>
            <option value="engineering">Engineering</option>
            <option value="design">Design</option>
            <option value="product">Product</option>
          </select>

          {/* Export */}
          <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#FF5A1F]/20 text-[#FF5A1F] border border-[#FF5A1F]/30 rounded-lg hover:bg-[#FF5A1F]/30 transition-all font-medium">
            <Download className="w-4 h-4" />
            <span className="text-sm">Export</span>
          </button>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-[#141414] border border-white/[0.08] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/[0.02] border-b border-white/[0.08]">
              <tr>
                <th className="text-left text-xs font-medium text-white/50 px-6 py-4">Candidate</th>
                <th className="text-left text-xs font-medium text-white/50 px-6 py-4">Applied Job</th>
                <th className="text-left text-xs font-medium text-white/50 px-6 py-4">Applied Date</th>
                <th className="text-left text-xs font-medium text-white/50 px-6 py-4">ATS Score</th>
                <th className="text-left text-xs font-medium text-white/50 px-6 py-4">Pipeline Stage</th>
                <th className="text-left text-xs font-medium text-white/50 px-6 py-4">Status</th>
                <th className="text-left text-xs font-medium text-white/50 px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => {
                const scoreColor = getScoreColor(app.atsScore);
                return (
                  <tr
                    key={app.id}
                    className="border-b border-white/[0.05] hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#FF5A1F] to-[#FF8A5B] rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-sm font-medium">{app.candidate.avatar}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{app.candidate.name}</p>
                          <p className="text-xs text-white/50">{app.candidate.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm text-white mb-0.5">{app.job}</p>
                        <p className="text-xs text-white/50">{app.department}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-white/70">
                        {new Date(app.appliedDate).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {/* Circular Progress */}
                        <div className="relative w-12 h-12">
                          <svg className="w-12 h-12 transform -rotate-90">
                            <circle
                              cx="24"
                              cy="24"
                              r="20"
                              stroke="rgba(255,255,255,0.05)"
                              strokeWidth="4"
                              fill="none"
                            />
                            <circle
                              cx="24"
                              cy="24"
                              r="20"
                              stroke="#FF5A1F"
                              strokeWidth="4"
                              fill="none"
                              strokeDasharray={`${(app.atsScore / 100) * 125.6} 125.6`}
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs font-semibold text-white">{app.atsScore}</span>
                          </div>
                        </div>
                        <div>
                          <p className={`text-xs font-medium px-2 py-0.5 rounded ${scoreColor.bg} ${scoreColor.text}`}>
                            {scoreColor.label}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs rounded-md font-medium ${getStageColor(app.stage)}`}>
                        {app.stage}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs rounded-md font-medium ${getStatusColor(app.status)}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 hover:bg-white/[0.05] rounded-lg transition-colors" title="View Profile">
                          <Eye className="w-4 h-4 text-white/70" />
                        </button>
                        <button className="p-1.5 hover:bg-white/[0.05] rounded-lg transition-colors" title="Message">
                          <MessageSquare className="w-4 h-4 text-white/70" />
                        </button>
                        <button className="p-1.5 hover:bg-green-500/20 rounded-lg transition-colors" title="Approve">
                          <CheckCircle2 className="w-4 h-4 text-green-400" />
                        </button>
                        <button className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors" title="Reject">
                          <XCircle className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
