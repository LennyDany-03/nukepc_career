'use client';

import { Search, Plus, MapPin, Users, Clock, Briefcase } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/services/auth';

interface Job {
  id: number;
  title: string;
  department: string;
  location: string;
  employment_type: 'internship' | 'fulltime' | null;
  created_at: string;
}

export default function JobManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await api.get('/jobs/');
        setJobs(response.data);
      } catch (error) {
        console.error('Failed to fetch jobs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#FF5A1F] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#FF5A1F] to-[#FF8A5B] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(255,90,31,0.3)]">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">Job Management</h1>
                <p className="text-white/50">Manage and track open positions</p>
              </div>
            </div>
          </div>
          <Link href="/dashboard/jobs/new" className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FF5A1F] to-[#FF7A4A] text-white rounded-xl font-semibold shadow-[0_0_20px_rgba(255,90,31,0.4)] hover:shadow-[0_0_30px_rgba(255,90,31,0.6)] transition-all duration-300">
            <Plus className="w-5 h-5" />
            Create New Job
          </Link>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            placeholder="Search by job title or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#141414] border border-white/[0.08] rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#FF5A1F]/50 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredJobs.map((job) => (
          <div
            key={job.id}
            className="group bg-gradient-to-br from-[#141414] to-[#0F0F0F] border border-white/[0.08] rounded-xl p-6 hover:border-[#FF5A1F]/30 hover:shadow-[0_0_20px_rgba(255,90,31,0.15)] transition-all duration-300"
          >
            {/* Header */}
            <div className="mb-5">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 bg-white/[0.05] rounded-lg flex items-center justify-center group-hover:bg-[#FF5A1F]/20 transition-colors">
                  <Briefcase className="w-6 h-6 text-[#FF5A1F]" />
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400">
                  Published
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mb-1">{job.title}</h3>
              <p className="text-sm text-white/50">{job.department}</p>
            </div>

            {/* Location */}
            <div className="flex items-center gap-2 text-white/60 text-sm mb-5 pb-5 border-b border-white/[0.08]">
              <MapPin className="w-4 h-4 text-[#FF5A1F]" />
              {job.location}
            </div>

            {/* Stats */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-white/60 text-sm">Applications</span>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#FF5A1F]" />
                  <span className="text-white font-semibold">0</span>
                </div>
              </div>
              <div className="w-full h-2 bg-white/[0.05] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#FF5A1F] to-[#FF8A5B]"
                  style={{ width: '0%' }}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-5 border-t border-white/[0.08]">
              <div className="flex items-center gap-2 text-white/50 text-xs">
                <Clock className="w-3.5 h-3.5" />
                {new Date(job.created_at).toLocaleDateString()}
              </div>
              <Link href={`/dashboard/jobs/${job.id}`} className="px-4 py-2 bg-[#FF5A1F]/20 text-[#FF5A1F] rounded-lg text-sm font-medium hover:bg-[#FF5A1F]/30 transition-colors">
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredJobs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16">
          <Briefcase className="w-16 h-16 text-white/20 mb-4" />
          <h3 className="text-white/70 text-lg font-medium mb-2">No jobs found</h3>
          <p className="text-white/50 text-sm">Try adjusting your search criteria or create a new job</p>
        </div>
      )}
    </div>
  );
}

