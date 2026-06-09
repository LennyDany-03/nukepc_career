'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  ClipboardCheck, Search, Filter, Sparkles, CheckCircle2, 
  AlertTriangle, RefreshCw, Eye, X, BookOpen, User, 
  Award, Briefcase, Calendar, ChevronDown, Percent, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/services/auth';

interface Application {
  id: number;
  job: number;
  job_title: string;
  job_department: string;
  full_name: string;
  email: string;
  phone: string | null;
  created_at: string;
}

interface ScreeningResult {
  id: number;
  application: number;
  score: number;
  fit_level: string;
  matching_skills: string[];
  missing_skills: string[];
  experience_analysis: string;
  summary: string;
  recommendation: string;
  engine: string;
  created_at: string;
}

interface CombinedRow extends Application {
  screening: ScreeningResult | null;
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
    <div ref={dropdownRef} className="relative w-full sm:w-60">
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

export default function ScreeningPage() {
  const [rows, setRows] = useState<CombinedRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [jobFilter, setJobFilter] = useState('');
  const [fitFilter, setFitFilter] = useState('all');
  
  const [selectedRow, setSelectedRow] = useState<CombinedRow | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      const [appsResponse, atsResponse] = await Promise.all([
        api.get('/applications/'),
        api.get('/ats/')
      ]);
      
      const apps: Application[] = appsResponse.data;
      const ats: ScreeningResult[] = atsResponse.data;
      
      const combined: CombinedRow[] = apps.map(app => {
        const match = ats.find(item => item.application === app.id);
        return {
          ...app,
          screening: match || null
        };
      });
      
      // Sort: evaluated first (highest score descending), then unevaluated
      combined.sort((a, b) => {
        if (a.screening && b.screening) {
          return b.screening.score - a.screening.score;
        }
        return a.screening ? -1 : 1;
      });
      
      setRows(combined);
    } catch (err) {
      console.error('Failed to fetch ATS records:', err);
      setError('Unable to load candidate metrics. Check backend database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRunScreening = async (appId: number) => {
    setActionLoadingId(appId);
    try {
      const response = await api.post(`/ats/screen/${appId}/`);
      const updatedScreening: ScreeningResult = response.data;
      
      // Update rows state
      setRows(prevRows => 
        prevRows.map(row => 
          row.id === appId 
            ? { ...row, screening: updatedScreening }
            : row
        )
      );
      
      // If modal is open for this candidate, update its context
      if (selectedRow && selectedRow.id === appId) {
        setSelectedRow(prev => prev ? { ...prev, screening: updatedScreening } : null);
      }
    } catch (err) {
      console.error('Failed to run AI Screening:', err);
      alert('AI evaluation failed. Please check backend server log.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Compute metrics
  const totalApps = rows.length;
  const screenedApps = rows.filter(r => r.screening !== null);
  const totalScreened = screenedApps.length;
  const avgScore = totalScreened > 0 
    ? Math.round(screenedApps.reduce((acc, curr) => acc + (curr.screening?.score || 0), 0) / totalScreened)
    : 0;

  // Filter lists
  const uniqueJobs = Array.from(new Set(rows.map(r => r.job_title)))
    .filter(Boolean)
    .map(title => ({ value: title, label: title }));

  const filteredRows = rows.filter(row => {
    const matchesSearch = 
      row.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.job_title.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesJob = !jobFilter || row.job_title === jobFilter;
    
    let matchesFit = true;
    if (fitFilter !== 'all') {
      if (fitFilter === 'unscreened') {
        matchesFit = row.screening === null;
      } else {
        matchesFit = row.screening?.fit_level.toLowerCase().replace(' ', '') === fitFilter;
      }
    }
    
    return matchesSearch && matchesJob && matchesFit;
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
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-14 h-14 bg-gradient-to-br from-[#FF5A1F] to-[#FF8A5B] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(255,90,31,0.3)]">
            <ClipboardCheck className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white font-sans">ATS Screening</h1>
            <p className="text-white/50 text-sm">Automated resume match scoring and AI suitability review</p>
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
            <p className="text-white/50 text-sm font-medium mb-1">Total Applications</p>
            <h3 className="text-3xl font-bold text-white">{totalApps}</h3>
          </div>
          <div className="w-12 h-12 bg-white/[0.03] rounded-xl flex items-center justify-center border border-white/[0.08]">
            <User className="w-6 h-6 text-white/60" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-[#141414] to-[#0F0F0F] border border-white/[0.08] rounded-xl p-6 flex items-center justify-between hover:border-[#FF5A1F]/20 transition-all">
          <div>
            <p className="text-white/50 text-sm font-medium mb-1">AI Evaluated</p>
            <h3 className="text-3xl font-bold text-white">{totalScreened} <span className="text-sm text-white/40">/ {totalApps}</span></h3>
          </div>
          <div className="w-12 h-12 bg-[#FF5A1F]/15 rounded-xl flex items-center justify-center border border-[#FF5A1F]/20">
            <ClipboardCheck className="w-6 h-6 text-[#FF5A1F]" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#141414] to-[#0F0F0F] border border-white/[0.08] rounded-xl p-6 flex items-center justify-between hover:border-[#FF5A1F]/20 transition-all">
          <div>
            <p className="text-white/50 text-sm font-medium mb-1">Average ATS Score</p>
            <h3 className="text-3xl font-bold text-white">{avgScore}%</h3>
          </div>
          <div className="w-12 h-12 bg-green-500/15 rounded-xl flex items-center justify-center border border-green-500/20">
            <Percent className="w-5 h-5 text-green-400" />
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center justify-between mb-8">
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            placeholder="Search by candidate name or position..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#141414] border border-white/[0.08] rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#FF5A1F]/50 transition-all"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <CustomFilterSelect
            value={jobFilter}
            onChange={setJobFilter}
            placeholder="Filter by Job"
            icon={Briefcase}
            options={[{ value: '', label: 'All Jobs' }, ...uniqueJobs]}
          />
          <CustomFilterSelect
            value={fitFilter}
            onChange={setFitFilter}
            placeholder="Filter by Fit Level"
            icon={Filter}
            options={[
              { value: 'all', label: 'All Suitability' },
              { value: 'strongfit', label: 'Strong Fit' },
              { value: 'moderatefit', label: 'Moderate Fit' },
              { value: 'lowfit', label: 'Low Fit' },
              { value: 'unscreened', label: 'Not Screened' }
            ]}
          />
        </div>
      </div>

      {/* Ranking List Table */}
      <div className="bg-gradient-to-br from-[#141414] to-[#0F0F0F] border border-white/[0.08] rounded-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          {filteredRows.length > 0 ? (
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-white/[0.08] text-white/50 text-xs font-semibold uppercase tracking-wider bg-white/[0.02]">
                  <th className="px-6 py-4">Rank / Candidate</th>
                  <th className="px-6 py-4">Applied Position</th>
                  <th className="px-6 py-4">ATS Match Score</th>
                  <th className="px-6 py-4">Fit Status</th>
                  <th className="px-6 py-4">Evaluation Engine</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {filteredRows.map((row, index) => {
                  const hasScreening = row.screening !== null;
                  const isActionLoading = actionLoadingId === row.id;
                  
                  // Score color class
                  const scoreVal = row.screening?.score || 0;
                  let scoreColor = 'text-red-400';
                  let scoreBg = 'bg-red-500/10';
                  let scoreBorder = 'border-red-500/20';
                  
                  if (scoreVal >= 80) {
                    scoreColor = 'text-green-400';
                    scoreBg = 'bg-green-500/10';
                    scoreBorder = 'border-green-500/20';
                  } else if (scoreVal >= 55) {
                    scoreColor = 'text-yellow-400';
                    scoreBg = 'bg-yellow-500/10';
                    scoreBorder = 'border-yellow-500/20';
                  }

                  return (
                    <motion.tr 
                      key={row.id} 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                      {/* Name & Contact */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <span className="text-white/30 font-bold text-sm min-w-[20px]">
                            #{index + 1}
                          </span>
                          <div className="flex flex-col">
                            <span className="text-white font-semibold group-hover:text-[#FF5A1F] transition-colors">
                              {row.full_name}
                            </span>
                            <span className="text-white/40 text-xs mt-0.5">{row.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Job Title */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-white font-medium">{row.job_title}</span>
                          <span className="text-white/40 text-xs mt-0.5">{row.job_department}</span>
                        </div>
                      </td>

                      {/* Score Meter */}
                      <td className="px-6 py-4">
                        {hasScreening ? (
                          <div className="flex items-center gap-3">
                            <div className="w-16 bg-white/[0.05] h-2 rounded-full overflow-hidden hidden sm:block">
                              <div 
                                className={`h-full ${
                                  scoreVal >= 80 ? 'bg-green-500' : scoreVal >= 55 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${scoreVal}%` }}
                              />
                            </div>
                            <span className={`font-bold text-sm ${scoreColor}`}>
                              {scoreVal}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-white/30 text-xs italic">Not Evaluated</span>
                        )}
                      </td>

                      {/* Fit Level Status */}
                      <td className="px-6 py-4">
                        {hasScreening ? (
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                            row.screening?.fit_level === 'Strong Fit'
                              ? 'bg-green-500/15 text-green-400 border border-green-500/20'
                              : row.screening?.fit_level === 'Moderate Fit'
                              ? 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/20'
                              : 'bg-red-500/15 text-red-400 border border-red-500/20'
                          }`}>
                            {row.screening?.fit_level === 'Strong Fit' && <CheckCircle2 className="w-3.5 h-3.5" />}
                            {row.screening?.fit_level === 'Moderate Fit' && <Info className="w-3.5 h-3.5" />}
                            {row.screening?.fit_level === 'Low Fit' && <AlertTriangle className="w-3.5 h-3.5" />}
                            {row.screening?.fit_level}
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-white/[0.03] text-white/40 border border-white/[0.08] rounded-full text-xs">
                            Pending
                          </span>
                        )}
                      </td>

                      {/* Engine Tag */}
                      <td className="px-6 py-4">
                        {hasScreening ? (
                          <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded border ${
                            row.screening?.engine === 'gemini'
                              ? 'bg-[#FF5A1F]/10 text-[#FF5A1F] border-[#FF5A1F]/20'
                              : 'bg-white/[0.03] text-white/50 border-white/[0.08]'
                          }`}>
                            {row.screening?.engine === 'gemini' && <Sparkles className="w-3 h-3 text-[#FF5A1F]" />}
                            {row.screening?.engine === 'gemini' ? 'Gemini AI' : 'Keyword Engine'}
                          </span>
                        ) : (
                          <span className="text-white/20 text-xs">-</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {hasScreening ? (
                            <>
                              <button
                                onClick={() => setSelectedRow(row)}
                                className="p-2 bg-white/[0.05] hover:bg-white/[0.1] text-white rounded-lg border border-white/[0.08] transition-colors"
                                title="View AI Suitability Report"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleRunScreening(row.id)}
                                disabled={isActionLoading}
                                className="p-2 bg-white/[0.05] hover:bg-[#FF5A1F]/20 text-white hover:text-white rounded-lg border border-white/[0.08] hover:border-[#FF5A1F]/30 transition-all disabled:opacity-50"
                                title="Re-evaluate Candidate"
                              >
                                <RefreshCw className={`w-4 h-4 ${isActionLoading ? 'animate-spin' : ''}`} />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleRunScreening(row.id)}
                              disabled={isActionLoading}
                              className="px-4 py-2 bg-[#FF5A1F]/10 hover:bg-[#FF5A1F] text-[#FF5A1F] hover:text-white border border-[#FF5A1F]/20 hover:border-transparent rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50"
                            >
                              {isActionLoading ? (
                                <>
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                  Evaluating...
                                </>
                              ) : (
                                <>
                                  <Sparkles className="w-3.5 h-3.5" />
                                  Run AI Matching
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <ClipboardCheck className="w-16 h-16 text-white/20 mb-4" />
              <h3 className="text-white/70 text-lg font-medium mb-2">No screening records match</h3>
              <p className="text-white/50 text-sm text-center">Try adjusting your filters or search query.</p>
            </div>
          )}
        </div>
      </div>

      {/* Match Report Detail Modal Overlay */}
      <AnimatePresence>
        {selectedRow && selectedRow.screening && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedRow(null)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0F0F0F] border border-white/[0.08] rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl z-10 flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="p-6 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.01]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#FF5A1F]/15 rounded-lg flex items-center justify-center border border-[#FF5A1F]/20">
                    <ClipboardCheck className="w-5 h-5 text-[#FF5A1F]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">AI Suitability Report</h2>
                    <p className="text-xs text-white/40">Candidate: {selectedRow.full_name} • {selectedRow.job_title}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedRow(null)}
                  className="p-2 hover:bg-white/[0.08] text-white/60 hover:text-white rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto space-y-6">
                {/* Score Summary Banner */}
                <div className="bg-gradient-to-r from-[#141414] to-[#1F1F1F] border border-white/[0.05] rounded-xl p-6 flex flex-col sm:flex-row items-center gap-6 relative overflow-hidden">
                  {/* Gauge */}
                  <div className="relative flex items-center justify-center w-24 h-24 flex-shrink-0">
                    <div className="absolute inset-0 rounded-full border-4 border-white/5" />
                    <div 
                      className={`absolute inset-0 rounded-full border-4 border-t-transparent border-l-transparent transition-all ${
                        selectedRow.screening.score >= 80 
                          ? 'border-r-green-500 border-b-green-500' 
                          : selectedRow.screening.score >= 55
                          ? 'border-r-yellow-500 border-b-yellow-500'
                          : 'border-r-red-500 border-b-red-500'
                      }`}
                      style={{ transform: `rotate(${(selectedRow.screening.score / 100) * 360 - 90}deg)` }}
                    />
                    <span className="text-2xl font-black text-white">{selectedRow.screening.score}%</span>
                  </div>

                  {/* Details summary */}
                  <div className="flex-1 text-center sm:text-left space-y-1">
                    <div className="flex flex-col sm:flex-row items-center gap-2">
                      <span className={`text-base font-bold uppercase tracking-wider ${
                        selectedRow.screening.score >= 80 
                          ? 'text-green-400' 
                          : selectedRow.screening.score >= 55
                          ? 'text-yellow-400'
                          : 'text-red-400'
                      }`}>
                        {selectedRow.screening.fit_level}
                      </span>
                      <span className="text-white/25 hidden sm:inline">•</span>
                      <span className="text-xs text-white/50 bg-white/[0.05] px-2 py-0.5 rounded flex items-center gap-1 border border-white/[0.08]">
                        {selectedRow.screening.engine === 'gemini' ? <Sparkles className="w-3 h-3 text-[#FF5A1F]" /> : null}
                        Engine: {selectedRow.screening.engine === 'gemini' ? 'Gemini Generative AI' : 'Rule-Based Parsing'}
                      </span>
                    </div>
                    <p className="text-sm text-white/70 leading-relaxed font-sans mt-2">
                      {selectedRow.screening.summary}
                    </p>
                  </div>
                </div>

                {/* Skills Analysis */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[#141414] border border-white/[0.05] rounded-xl p-5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-green-400 mb-3 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      Matching Required Skills
                    </h4>
                    {selectedRow.screening.matching_skills.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {selectedRow.screening.matching_skills.map(skill => (
                          <span key={skill} className="px-2.5 py-1 bg-green-500/10 text-green-400 border border-green-500/20 text-xs font-semibold rounded-md">
                            {skill}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-white/30 text-xs italic">No matching skills detected.</span>
                    )}
                  </div>

                  <div className="bg-[#141414] border border-white/[0.05] rounded-xl p-5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-red-400 mb-3 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      Missing Required Skills
                    </h4>
                    {selectedRow.screening.missing_skills.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {selectedRow.screening.missing_skills.map(skill => (
                          <span key={skill} className="px-2.5 py-1 bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-semibold rounded-md">
                            {skill}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-white/30 text-xs italic">All required skills matched!</span>
                    )}
                  </div>
                </div>

                {/* Experience Fit */}
                <div className="bg-[#141414] border border-white/[0.05] rounded-xl p-5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white/50 mb-3 flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-[#FF5A1F]" />
                    Experience Fit Analysis
                  </h4>
                  <p className="text-sm text-white/80 leading-relaxed">
                    {selectedRow.screening.experience_analysis}
                  </p>
                </div>

                {/* AI Recommendation */}
                <div className="bg-white/[0.02] border-l-2 border-[#FF5A1F] rounded-r-xl p-5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#FF5A1F] mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    AI Recommendation
                  </h4>
                  <p className="text-sm text-white/90 font-medium leading-relaxed italic font-serif">
                    &ldquo;{selectedRow.screening.recommendation}&rdquo;
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-white/[0.08] bg-[#0A0A0A]/50 flex justify-between items-center">
                <span className="text-xs text-white/30 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Evaluated on {new Date(selectedRow.screening.created_at).toLocaleDateString()}
                </span>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedRow(null)}
                    className="px-4 py-2 bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] text-white rounded-lg text-sm font-semibold transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      if (selectedRow) handleRunScreening(selectedRow.id);
                    }}
                    disabled={actionLoadingId === selectedRow.id}
                    className="px-4 py-2 bg-[#FF5A1F] hover:bg-[#FF7A4A] text-white rounded-lg text-sm font-bold shadow-[0_0_15px_rgba(255,90,31,0.3)] transition-all flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${actionLoadingId === selectedRow.id ? 'animate-spin' : ''}`} />
                    Re-evaluate Candidate
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
