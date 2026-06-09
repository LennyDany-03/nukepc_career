'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Users, Search, Filter, ExternalLink, X, FileText, 
  Mail, Phone, GraduationCap, Briefcase, Calendar, 
  ChevronDown, Download, Award, Clock, AlertCircle, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/services/auth';

interface Candidate {
  id: number;
  job: number;
  job_title: string;
  job_department: string;
  full_name: string;
  email: string;
  phone: string | null;
  portfolio: string | null;
  cover_letter: string | null;
  resume: string | null;
  
  // Internship
  college_name: string | null;
  degree_branch: string | null;
  year_of_study: number | null;
  cgpa: string | null;
  
  // Full-time
  current_company: string | null;
  total_experience: string | null;
  current_ctc: string | null;
  expected_ctc: string | null;
  notice_period: number | null;
  
  created_at: string;
}

const CustomFilterSelect = ({
  value,
  onChange,
  options,
  placeholder,
  icon: Icon
}: {
  value: string;
  onChange: (val: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder: string;
  icon: any;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);
  const displayLabel = selectedOption?.label || placeholder;

  return (
    <div ref={dropdownRef} className="relative w-full sm:w-64">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-[#141414] border border-white/[0.08] rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#FF5A1F]/50 transition-all flex items-center justify-between hover:bg-white/[0.08] text-sm"
      >
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-[#FF5A1F]" />
          <span className={value ? 'text-white font-medium' : 'text-white/60'}>{displayLabel}</span>
        </div>
        <ChevronDown 
          size={16} 
          className={`text-white/60 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-[#141414] border border-white/[0.08] rounded-xl overflow-hidden z-50 max-h-60 overflow-y-auto shadow-2xl"
          >
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                type="button"
                className={`w-full text-left px-4 py-3 transition-colors text-sm font-medium border-b border-white/[0.03] last:border-b-0 ${
                  value === option.value
                    ? 'bg-[#FF5A1F] text-white'
                    : 'text-white/80 hover:bg-white/[0.05] hover:text-white'
                }`}
              >
                {option.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJobFilter, setSelectedJobFilter] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('all');
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const response = await api.get('/applications/');
        setCandidates(response.data);
      } catch (err) {
        console.error('Failed to fetch candidates:', err);
        setError('Unable to load applications. Please check backend status.');
      } finally {
        setLoading(false);
      }
    };
    fetchCandidates();
  }, []);

  // Compute stats
  const totalCandidates = candidates.length;
  const totalInterns = candidates.filter(c => !!(c.college_name || c.degree_branch)).length;
  const totalFullTime = totalCandidates - totalInterns;

  // Compute unique job filters dynamically
  const uniqueJobs = Array.from(new Set(candidates.map(c => c.job_title)))
    .filter(Boolean)
    .map(title => ({ value: title, label: title }));

  // Filter candidates
  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = 
      candidate.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (candidate.college_name && candidate.college_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (candidate.current_company && candidate.current_company.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesJob = !selectedJobFilter || candidate.job_title === selectedJobFilter;
    
    const isIntern = !!(candidate.college_name || candidate.degree_branch);
    const matchesType = 
      selectedTypeFilter === 'all' ||
      (selectedTypeFilter === 'internship' && isIntern) ||
      (selectedTypeFilter === 'fulltime' && !isIntern);
      
    return matchesSearch && matchesJob && matchesType;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#FF5A1F] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] p-8 flex flex-col relative text-white">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-[#FF5A1F] to-[#FF8A5B] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(255,90,31,0.3)]">
            <Users className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white">Candidates</h1>
            <p className="text-white/50">Review and manage job applicants</p>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-8 flex items-center gap-3 text-red-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-[#141414] to-[#0F0F0F] border border-white/[0.08] rounded-xl p-6 flex items-center justify-between hover:border-[#FF5A1F]/20 transition-all">
          <div>
            <p className="text-white/50 text-sm font-medium mb-1">Total Applicants</p>
            <h3 className="text-3xl font-bold text-white">{totalCandidates}</h3>
          </div>
          <div className="w-12 h-12 bg-[#FF5A1F]/15 rounded-xl flex items-center justify-center border border-[#FF5A1F]/20">
            <Users className="w-6 h-6 text-[#FF5A1F]" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-[#141414] to-[#0F0F0F] border border-white/[0.08] rounded-xl p-6 flex items-center justify-between hover:border-purple-500/20 transition-all">
          <div>
            <p className="text-white/50 text-sm font-medium mb-1">Full-Time Applicants</p>
            <h3 className="text-3xl font-bold text-white">{totalFullTime}</h3>
          </div>
          <div className="w-12 h-12 bg-purple-500/15 rounded-xl flex items-center justify-center border border-purple-500/20">
            <Briefcase className="w-6 h-6 text-purple-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#141414] to-[#0F0F0F] border border-white/[0.08] rounded-xl p-6 flex items-center justify-between hover:border-blue-500/20 transition-all">
          <div>
            <p className="text-white/50 text-sm font-medium mb-1">Internship Applicants</p>
            <h3 className="text-3xl font-bold text-white">{totalInterns}</h3>
          </div>
          <div className="w-12 h-12 bg-blue-500/15 rounded-xl flex items-center justify-center border border-blue-500/20">
            <GraduationCap className="w-6 h-6 text-blue-400" />
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center justify-between mb-8">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            placeholder="Search by name, email, company, or university..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#141414] border border-white/[0.08] rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#FF5A1F]/50 focus:border-transparent transition-all"
          />
        </div>

        {/* Filters Panel */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <CustomFilterSelect
            value={selectedJobFilter}
            onChange={setSelectedJobFilter}
            placeholder="Filter by Job"
            icon={Briefcase}
            options={[{ value: '', label: 'All Jobs' }, ...uniqueJobs]}
          />
          <CustomFilterSelect
            value={selectedTypeFilter}
            onChange={setSelectedTypeFilter}
            placeholder="Filter by Type"
            icon={Filter}
            options={[
              { value: 'all', label: 'All Types' },
              { value: 'fulltime', label: 'Full-Time' },
              { value: 'internship', label: 'Internship' }
            ]}
          />
        </div>
      </div>

      {/* Candidates List/Table */}
      <div className="bg-gradient-to-br from-[#141414] to-[#0F0F0F] border border-white/[0.08] rounded-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          {filteredCandidates.length > 0 ? (
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-white/[0.08] text-white/50 text-xs font-semibold uppercase tracking-wider bg-white/[0.02]">
                  <th className="px-6 py-4">Candidate</th>
                  <th className="px-6 py-4">Position Applied</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Date Applied</th>
                  <th className="px-6 py-4">Resume</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {filteredCandidates.map((candidate) => {
                  const isIntern = !!(candidate.college_name || candidate.degree_branch);
                  return (
                    <motion.tr 
                      key={candidate.id} 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-white font-semibold group-hover:text-[#FF5A1F] transition-colors">
                            {candidate.full_name}
                          </span>
                          <span className="text-white/40 text-xs mt-0.5 flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-white/20" />
                            {candidate.email}
                          </span>
                          {candidate.phone && (
                            <span className="text-white/40 text-xs mt-0.5 flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 text-white/20" />
                              {candidate.phone}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-white font-medium">{candidate.job_title || 'Unknown Job'}</span>
                          <span className="text-white/40 text-xs mt-0.5">{candidate.job_department || 'General'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                          isIntern 
                            ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20' 
                            : 'bg-purple-500/15 text-purple-400 border border-purple-500/20'
                        }`}>
                          {isIntern ? 'Internship' : 'Full-Time'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-white/60 text-sm">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-white/30" />
                          {new Date(candidate.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {candidate.resume ? (
                          <a 
                            href={candidate.resume} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.05] hover:bg-[#FF5A1F]/20 text-white/80 hover:text-white border border-white/[0.08] hover:border-[#FF5A1F]/30 rounded-lg text-xs font-semibold transition-all"
                          >
                            <Download className="w-3.5 h-3.5 text-[#FF5A1F]" />
                            Resume
                          </a>
                        ) : (
                          <span className="text-white/30 text-xs">No Resume</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => setSelectedCandidate(candidate)}
                          className="px-4 py-2 bg-[#FF5A1F]/15 hover:bg-[#FF5A1F]/25 text-[#FF5A1F] border border-[#FF5A1F]/25 rounded-lg text-xs font-bold transition-colors"
                        >
                          View Profile
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <Users className="w-16 h-16 text-white/20 mb-4" />
              <h3 className="text-white/70 text-lg font-medium mb-2">No candidates found</h3>
              <p className="text-white/50 text-sm text-center">Try adjusting your filters or search query.</p>
            </div>
          )}
        </div>
      </div>

      {/* Candidate Profile Drawer */}
      <AnimatePresence>
        {selectedCandidate && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCandidate(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-2xl bg-[#0F0F0F] border-l border-white/[0.08] h-full flex flex-col shadow-2xl z-10"
            >
              {/* Header */}
              <div className="p-6 border-b border-white/[0.08] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#FF5A1F]/15 rounded-lg flex items-center justify-center border border-[#FF5A1F]/20">
                    <Users className="w-5 h-5 text-[#FF5A1F]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{selectedCandidate.full_name}</h2>
                    <p className="text-xs text-white/50">Applied for {selectedCandidate.job_title || 'General Position'}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCandidate(null)}
                  className="p-2 hover:bg-white/[0.08] text-white/60 hover:text-white rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Contact Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-4 flex items-center gap-3">
                    <Mail className="w-5 h-5 text-[#FF5A1F]" />
                    <div className="flex flex-col">
                      <span className="text-xs text-white/40">Email Address</span>
                      <a href={`mailto:${selectedCandidate.email}`} className="text-sm text-white hover:text-[#FF5A1F] transition-colors break-all">
                        {selectedCandidate.email}
                      </a>
                    </div>
                  </div>

                  {selectedCandidate.phone && (
                    <div className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-4 flex items-center gap-3">
                      <Phone className="w-5 h-5 text-[#FF5A1F]" />
                      <div className="flex flex-col">
                        <span className="text-xs text-white/40">Phone Number</span>
                        <a href={`tel:${selectedCandidate.phone}`} className="text-sm text-white hover:text-[#FF5A1F] transition-colors">
                          {selectedCandidate.phone}
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* Links */}
                {selectedCandidate.portfolio && (
                  <div className="bg-[#141414] border border-white/[0.08] rounded-xl p-5">
                    <h3 className="text-sm font-semibold text-white mb-3">Links & Portfolio</h3>
                    <a 
                      href={selectedCandidate.portfolio} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-[#FF5A1F] hover:text-[#FF7A4A] transition-colors text-sm font-semibold group"
                    >
                      <span className="break-all">{selectedCandidate.portfolio}</span>
                      <ExternalLink className="w-4 h-4 flex-shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </a>
                  </div>
                )}

                {/* Internship (Academic) Details */}
                {!!(selectedCandidate.college_name || selectedCandidate.degree_branch) && (
                  <div className="bg-[#141414] border border-[#FF5A1F]/10 rounded-xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                      <GraduationCap className="w-24 h-24 text-[#FF5A1F]" />
                    </div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                      <GraduationCap className="w-4 h-4 text-[#FF5A1F]" />
                      Academic Information
                    </h3>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <span className="block text-xs text-white/40 mb-1">College/University</span>
                        <span className="text-sm text-white font-semibold">{selectedCandidate.college_name || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="block text-xs text-white/40 mb-1">Degree & Branch</span>
                        <span className="text-sm text-white font-semibold">{selectedCandidate.degree_branch || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="block text-xs text-white/40 mb-1">Year of Study</span>
                        <span className="text-sm text-white font-semibold">
                          {selectedCandidate.year_of_study ? `${selectedCandidate.year_of_study} Year` : 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="block text-xs text-white/40 mb-1">CGPA / Percentage</span>
                        <span className="text-sm text-white font-semibold flex items-center gap-1">
                          <Award className="w-3.5 h-3.5 text-blue-400" />
                          {selectedCandidate.cgpa || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Full-time (Professional) Details */}
                {!!(selectedCandidate.current_company || selectedCandidate.total_experience) && (
                  <div className="bg-[#141414] border border-[#FF5A1F]/10 rounded-xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                      <Briefcase className="w-24 h-24 text-[#FF5A1F]" />
                    </div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                      <Briefcase className="w-4 h-4 text-[#FF5A1F]" />
                      Professional Information
                    </h3>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <span className="block text-xs text-white/40 mb-1">Current Company</span>
                        <span className="text-sm text-white font-semibold">{selectedCandidate.current_company || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="block text-xs text-white/40 mb-1">Total Experience</span>
                        <span className="text-sm text-white font-semibold">
                          {selectedCandidate.total_experience ? `${selectedCandidate.total_experience} Years` : 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="block text-xs text-white/40 mb-1">Current CTC</span>
                        <span className="text-sm text-white font-semibold">{selectedCandidate.current_ctc || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="block text-xs text-white/40 mb-1">Expected CTC</span>
                        <span className="text-sm text-white font-semibold">{selectedCandidate.expected_ctc || 'N/A'}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="block text-xs text-white/40 mb-1">Notice Period</span>
                        <span className="text-sm text-white font-semibold">
                          {selectedCandidate.notice_period !== null 
                            ? `${selectedCandidate.notice_period} Days` 
                            : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Cover Letter */}
                <div className="bg-[#141414] border border-white/[0.08] rounded-xl p-6">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                    <FileText className="w-4 h-4 text-[#FF5A1F]" />
                    Cover Letter
                  </h3>
                  {selectedCandidate.cover_letter ? (
                    <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap bg-white/[0.02] border border-white/[0.05] rounded-lg p-4 font-sans max-h-80 overflow-y-auto">
                      {selectedCandidate.cover_letter}
                    </p>
                  ) : (
                    <p className="text-white/30 text-sm italic">No cover letter provided.</p>
                  )}
                </div>
              </div>

              {/* Footer */}
              {selectedCandidate.resume && (
                <div className="p-6 border-t border-white/[0.08] bg-[#0A0A0A]/50 backdrop-blur-xl flex gap-3">
                  <a
                    href={selectedCandidate.resume}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#FF5A1F] hover:bg-[#FF7A4A] text-white rounded-xl font-bold shadow-[0_0_20px_rgba(255,90,31,0.3)] hover:shadow-[0_0_30px_rgba(255,90,31,0.5)] transition-all text-center text-sm"
                  >
                    <Download className="w-4 h-4" />
                    Open & Download Resume
                  </a>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
