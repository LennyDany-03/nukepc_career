'use client';

import { useState } from 'react';

export default function ApplicationManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStage, setFilterStage] = useState('');

  const applications = [
    { id: 1, candidate: 'Sarah Johnson', position: 'Senior Developer', appliedDate: '2024-01-15', matchScore: 92, stage: 'Interview', status: 'Interview Scheduled' },
    { id: 2, candidate: 'Mike Chen', position: 'Product Manager', appliedDate: '2024-01-14', matchScore: 87, stage: 'Shortlisted', status: 'In Progress' },
    { id: 3, candidate: 'Emma Davis', position: 'UX Designer', appliedDate: '2024-01-13', matchScore: 85, stage: 'Interview', status: 'Offer Sent' },
    { id: 4, candidate: 'John Smith', position: 'Senior Developer', appliedDate: '2024-01-12', matchScore: 95, stage: 'Selected', status: 'Hired' },
    { id: 5, candidate: 'Lisa Wong', position: 'Data Scientist', appliedDate: '2024-01-11', matchScore: 78, stage: 'Screening', status: 'Pending Review' },
  ];

  const filteredApplications = applications.filter((app) => {
    const matchesSearch = app.candidate.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStage = !filterStage || app.stage === filterStage;
    return matchesSearch && matchesStage;
  });

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'In Progress': 'bg-blue-500 bg-opacity-20 text-blue-500',
      'Pending Review': 'bg-yellow-500 bg-opacity-20 text-yellow-500',
      'Interview Scheduled': 'bg-purple-500 bg-opacity-20 text-purple-500',
      'Offer Sent': 'bg-amber-500 bg-opacity-20 text-amber-500',
      'Rejected': 'bg-red-500 bg-opacity-20 text-red-500',
      'Hired': 'bg-green-500 bg-opacity-20 text-green-500',
    };
    return colors[status] || 'bg-accent bg-opacity-20 text-accent';
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2">Applications</h1>
        <p className="text-secondary-text">Review and manage candidate applications.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-card-bg border border-accent border-opacity-10 rounded-lg p-6">
          <p className="text-secondary-text text-sm mb-2">Active Candidates</p>
          <p className="text-3xl font-bold">156</p>
        </div>
        <div className="bg-card-bg border border-accent border-opacity-10 rounded-lg p-6">
          <p className="text-secondary-text text-sm mb-2">Interviewing</p>
          <p className="text-3xl font-bold">24</p>
        </div>
        <div className="bg-card-bg border border-accent border-opacity-10 rounded-lg p-6">
          <p className="text-secondary-text text-sm mb-2">Time To Hire</p>
          <p className="text-3xl font-bold">18 days</p>
        </div>
        <div className="bg-card-bg border border-accent border-opacity-10 rounded-lg p-6">
          <p className="text-secondary-text text-sm mb-2">Offer Conversion</p>
          <p className="text-3xl font-bold">75%</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Search candidates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-3 bg-card-bg border border-accent border-opacity-10 rounded-lg text-foreground placeholder-secondary-text focus:outline-none focus:border-accent focus:border-opacity-30"
        />
        <select
          value={filterStage}
          onChange={(e) => setFilterStage(e.target.value)}
          className="px-4 py-3 bg-card-bg border border-accent border-opacity-10 rounded-lg text-foreground focus:outline-none focus:border-accent focus:border-opacity-30"
        >
          <option value="">All Stages</option>
          <option value="Applied">Applied</option>
          <option value="Screening">Screening</option>
          <option value="Shortlisted">Shortlisted</option>
          <option value="Interview">Interview</option>
          <option value="Selected">Selected</option>
        </select>
        <button className="px-6 py-3 bg-accent text-background font-semibold rounded-lg hover:bg-accent-hover transition-colors">
          Export
        </button>
      </div>

      {/* Table */}
      <div className="bg-card-bg border border-accent border-opacity-10 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="border-b border-accent border-opacity-10">
            <tr>
              <th className="px-6 py-4 text-left text-secondary-text text-sm font-semibold">Candidate</th>
              <th className="px-6 py-4 text-left text-secondary-text text-sm font-semibold">Position</th>
              <th className="px-6 py-4 text-left text-secondary-text text-sm font-semibold">Applied Date</th>
              <th className="px-6 py-4 text-left text-secondary-text text-sm font-semibold">Match Score</th>
              <th className="px-6 py-4 text-left text-secondary-text text-sm font-semibold">Stage</th>
              <th className="px-6 py-4 text-left text-secondary-text text-sm font-semibold">Status</th>
              <th className="px-6 py-4 text-left text-secondary-text text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredApplications.map((app) => (
              <tr key={app.id} className="border-b border-accent border-opacity-10 hover:bg-accent hover:bg-opacity-5 transition-colors">
                <td className="px-6 py-4 font-semibold">{app.candidate}</td>
                <td className="px-6 py-4 text-secondary-text">{app.position}</td>
                <td className="px-6 py-4 text-secondary-text text-sm">{app.appliedDate}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-12 rounded-full border-4 border-accent border-opacity-30 flex items-center justify-center">
                      <span className="text-sm font-bold text-accent">{app.matchScore}%</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-secondary-text">{app.stage}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(app.status)}`}>
                    {app.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button className="text-accent hover:text-accent-hover transition-colors">⋮</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
