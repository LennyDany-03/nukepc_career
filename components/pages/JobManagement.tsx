'use client';

import { useState } from 'react';

export default function JobManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const jobs = [
    { id: 1, title: 'Senior Developer', dept: 'Engineering', location: 'Remote', type: 'Full-time', applications: 24, status: 'Published', created: '2024-01-15' },
    { id: 2, title: 'Product Manager', dept: 'Product', location: 'San Francisco', type: 'Full-time', applications: 18, status: 'Published', created: '2024-01-14' },
    { id: 3, title: 'UX Designer', dept: 'Design', location: 'New York', type: 'Full-time', applications: 12, status: 'Published', created: '2024-01-13' },
    { id: 4, title: 'Data Scientist', dept: 'Engineering', location: 'Remote', type: 'Full-time', applications: 8, status: 'Draft', created: '2024-01-12' },
    { id: 5, title: 'Marketing Manager', dept: 'Marketing', location: 'Boston', type: 'Full-time', applications: 15, status: 'Published', created: '2024-01-11' },
  ];

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = !filterDept || job.dept === filterDept;
    const matchesStatus = !filterStatus || job.status === filterStatus;
    return matchesSearch && matchesDept && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    return status === 'Published' ? 'bg-green-500 bg-opacity-20 text-green-500' : 'bg-yellow-500 bg-opacity-20 text-yellow-500';
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2">Job Management</h1>
        <p className="text-secondary-text">Create and manage hiring opportunities.</p>
      </div>

      {/* Controls */}
      <div className="flex gap-4 items-center">
        <input
          type="text"
          placeholder="Search jobs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-3 bg-card-bg border border-accent border-opacity-10 rounded-lg text-foreground placeholder-secondary-text focus:outline-none focus:border-accent focus:border-opacity-30"
        />
        <select
          value={filterDept}
          onChange={(e) => setFilterDept(e.target.value)}
          className="px-4 py-3 bg-card-bg border border-accent border-opacity-10 rounded-lg text-foreground focus:outline-none focus:border-accent focus:border-opacity-30"
        >
          <option value="">All Departments</option>
          <option value="Engineering">Engineering</option>
          <option value="Product">Product</option>
          <option value="Design">Design</option>
          <option value="Marketing">Marketing</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-3 bg-card-bg border border-accent border-opacity-10 rounded-lg text-foreground focus:outline-none focus:border-accent focus:border-opacity-30"
        >
          <option value="">All Status</option>
          <option value="Published">Published</option>
          <option value="Draft">Draft</option>
          <option value="Closed">Closed</option>
        </select>
        <button className="px-6 py-3 bg-accent text-background font-semibold rounded-lg hover:bg-accent-hover transition-colors">
          Create New
        </button>
      </div>

      {/* Table */}
      <div className="bg-card-bg border border-accent border-opacity-10 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="border-b border-accent border-opacity-10">
            <tr>
              <th className="px-6 py-4 text-left text-secondary-text text-sm font-semibold">Job Title</th>
              <th className="px-6 py-4 text-left text-secondary-text text-sm font-semibold">Department</th>
              <th className="px-6 py-4 text-left text-secondary-text text-sm font-semibold">Location</th>
              <th className="px-6 py-4 text-left text-secondary-text text-sm font-semibold">Type</th>
              <th className="px-6 py-4 text-left text-secondary-text text-sm font-semibold">Applications</th>
              <th className="px-6 py-4 text-left text-secondary-text text-sm font-semibold">Status</th>
              <th className="px-6 py-4 text-left text-secondary-text text-sm font-semibold">Created</th>
              <th className="px-6 py-4 text-left text-secondary-text text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredJobs.map((job) => (
              <tr key={job.id} className="border-b border-accent border-opacity-10 hover:bg-accent hover:bg-opacity-5 transition-colors">
                <td className="px-6 py-4 font-semibold">{job.title}</td>
                <td className="px-6 py-4 text-secondary-text">{job.dept}</td>
                <td className="px-6 py-4 text-secondary-text">{job.location}</td>
                <td className="px-6 py-4 text-secondary-text">{job.type}</td>
                <td className="px-6 py-4 text-accent font-semibold">{job.applications}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(job.status)}`}>
                    {job.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-secondary-text text-sm">{job.created}</td>
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
