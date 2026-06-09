'use client';

import { useState, useEffect } from 'react';
import { 
  Search, Download, Users, Calendar, TrendingUp, Clock, Eye, 
  MessageSquare, CheckCircle2, XCircle, X, ExternalLink, Award, 
  GraduationCap, Briefcase, Mail, Phone, Sparkles, RefreshCw,
  Video, FileText, ChevronDown, Check
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
  
  // Workflow
  stage: string;
  status: string;
  recruiter_notes: string | null;
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

interface CombinedApp extends Application {
  screening: ScreeningResult | null;
  screeningLoading?: boolean;
}

export default function ApplicationManagement() {
  const [apps, setApps] = useState<CombinedApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStage, setFilterStage] = useState('all');
  const [filterDept, setFilterDept] = useState('all');

  // Modal / Drawer state
  const [selectedCandidate, setSelectedCandidate] = useState<CombinedApp | null>(null);
  const [activeCommentApp, setActiveCommentApp] = useState<CombinedApp | null>(null);
  const [commentText, setCommentText] = useState('');
  const [savingComment, setSavingComment] = useState(false);

  // Approval / Schedule Interview state
  const [activeApproveApp, setActiveApproveApp] = useState<CombinedApp | null>(null);
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewTime, setInterviewTime] = useState('');
  const [meetingLink, setMeetingLink] = useState('https://meet.google.com/abc-defg-hij');
  const [interviewerNotes, setInterviewerNotes] = useState('');
  const [scheduling, setScheduling] = useState(false);

  // Rejection confirm state
  const [rejectConfirmationAppId, setRejectConfirmationAppId] = useState<number | null>(null);

  // Fetch applications & screening scores
  const fetchApplications = async () => {
    try {
      const [appsRes, atsRes] = await Promise.all([
        api.get('/applications/'),
        api.get('/ats/')
      ]);

      const applicationsList: Application[] = appsRes.data;
      const atsList: ScreeningResult[] = atsRes.data;

      const combined: CombinedApp[] = applicationsList.map(app => {
        const match = atsList.find(s => s.application === app.id);
        return {
          ...app,
          screening: match || null,
          screeningLoading: false
        };
      });

      setApps(combined);

      // Auto-trigger ATS checks for any candidate that does not have a screening score yet
      combined.forEach(app => {
        if (!app.screening) {
          triggerAutoATS(app.id);
        }
      });

    } catch (err) {
      console.error('Failed to load applications:', err);
      setError('Unable to load candidate records. Check backend status.');
    } finally {
      setLoading(false);
    }
  };

  const triggerAutoATS = async (appId: number) => {
    try {
      // Run screening on backend (if not run yet, this endpoint runs and saves it)
      const res = await api.get(`/ats/results/${appId}/`);
      const screening: ScreeningResult = res.data;
      
      setApps(prev => 
        prev.map(item => 
          item.id === appId 
            ? { ...item, screening }
            : item
        )
      );
    } catch (err) {
      console.error(`Auto-ATS failed for app ${appId}:`, err);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  // Recruiter actions
  const handleRejectCandidate = async (appId: number) => {
    try {
      const payload = {
        stage: 'Rejected',
        status: 'Rejected'
      };
      await api.patch(`/applications/${appId}/`, payload);
      
      setApps(prev => 
        prev.map(item => 
          item.id === appId 
            ? { ...item, stage: 'Rejected', status: 'Rejected' }
            : item
        )
      );
      setRejectConfirmationAppId(null);
    } catch (err) {
      console.error('Failed to reject candidate:', err);
      alert('Failed to update candidate status.');
    }
  };

  const handleOpenComment = (app: CombinedApp) => {
    setActiveCommentApp(app);
    setCommentText(app.recruiter_notes || '');
  };

  const handleSaveComment = async () => {
    if (!activeCommentApp) return;
    setSavingComment(true);
    try {
      await api.patch(`/applications/${activeCommentApp.id}/`, {
        recruiter_notes: commentText
      });

      setApps(prev => 
        prev.map(item => 
          item.id === activeCommentApp.id 
            ? { ...item, recruiter_notes: commentText }
            : item
        )
      );
      
      // Update selected drawer view if open
      if (selectedCandidate && selectedCandidate.id === activeCommentApp.id) {
        setSelectedCandidate(prev => prev ? { ...prev, recruiter_notes: commentText } : null);
      }

      setActiveCommentApp(null);
    } catch (err) {
      console.error('Failed to save comment:', err);
      alert('Failed to save recruiter notes.');
    } finally {
      setSavingComment(false);
    }
  };

  const handleOpenApprove = (app: CombinedApp) => {
    setActiveApproveApp(app);
    setInterviewDate('');
    setInterviewTime('');
    setMeetingLink(`https://meet.google.com/nuke-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 5)}`);
    setInterviewerNotes('');
  };

  const handleScheduleInterview = async () => {
    if (!activeApproveApp || !interviewDate || !interviewTime) {
      alert('Please select both a date and time for the interview.');
      return;
    }
    setScheduling(true);
    try {
      // 1. Create Interview Schedule
      const scheduledAt = new Date(`${interviewDate}T${interviewTime}:00`).toISOString();
      const interviewPayload = {
        application: activeApproveApp.id,
        scheduled_at: scheduledAt,
        meeting_link: meetingLink,
        notes: interviewerNotes
      };
      await api.post('/applications/interviews/', interviewPayload);

      // 2. Update Application Status to Interview Scheduled
      const appPayload = {
        stage: 'Interview Scheduled',
        status: 'In Progress'
      };
      await api.patch(`/applications/${activeApproveApp.id}/`, appPayload);

      // 3. Update locally
      setApps(prev => 
        prev.map(item => 
          item.id === activeApproveApp.id 
            ? { ...item, stage: 'Interview Scheduled', status: 'In Progress' }
            : item
        )
      );

      setActiveApproveApp(null);
      alert('Interview scheduled successfully! Real date is stored in backend.');
    } catch (err) {
      console.error('Failed to schedule interview:', err);
      alert('Failed to schedule interview. Confirm backend database connection.');
    } finally {
      setScheduling(false);
    }
  };

  // Stats counters
  const totalActive = apps.filter(a => a.status !== 'Rejected' && a.status !== 'Hired').length;
  const interviewingCount = apps.filter(a => a.stage === 'Interview Scheduled' || a.stage === 'Interview Completed').length;
  const evaluatedCount = apps.filter(a => a.screening !== null).length;
  const avgATS = evaluatedCount > 0
    ? Math.round(apps.filter(a => a.screening).reduce((acc, curr) => acc + (curr.screening?.score || 0), 0) / evaluatedCount)
    : 0;

  const summaryCards = [
    { label: 'Active Candidates', value: totalActive.toString(), icon: Users, color: 'from-[#FF5A1F] to-[#FF8A5B]' },
    { label: 'Interviewing', value: interviewingCount.toString(), icon: Calendar, color: 'from-[#FF7A4A] to-[#FF9A6F]' },
    { label: 'ATS Average Score', value: `${avgATS}%`, icon: TrendingUp, color: 'from-[#FF9A6F] to-[#FFB399]' },
    { label: 'Evaluated Candidates', value: `${evaluatedCount} / ${apps.length}`, icon: Clock, color: 'from-[#FFB399] to-[#FFC6B3]' },
  ];

  // Unique departments for filter
  const departments = Array.from(new Set(apps.map(a => a.job_department))).filter(Boolean);

  // Filters
  const filteredApps = apps.filter(app => {
    const matchesSearch = 
      app.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.job_title.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStage = filterStage === 'all' || app.stage.toLowerCase().replace(' ', '') === filterStage.toLowerCase().replace(' ', '');
    const matchesDept = filterDept === 'all' || app.job_department.toLowerCase() === filterDept.toLowerCase();

    return matchesSearch && matchesStage && matchesDept;
  });

  const getScoreStyle = (score: number) => {
    if (score >= 80) return { text: 'text-green-400', bg: 'bg-green-500/15', border: 'stroke-green-500', label: 'Excellent' };
    if (score >= 60) return { text: 'text-yellow-400', bg: 'bg-yellow-500/15', border: 'stroke-yellow-500', label: 'Good' };
    return { text: 'text-red-400', bg: 'bg-red-500/15', border: 'stroke-red-500', label: 'Weak' };
  };

  const getStageColorStyle = (stage: string) => {
    switch (stage) {
      case 'Applied': return 'bg-blue-500/15 text-blue-400 border border-blue-500/20';
      case 'Screening': return 'bg-purple-500/15 text-purple-400 border border-purple-500/20';
      case 'Shortlisted': return 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/20';
      case 'Interview Scheduled': return 'bg-[#FF5A1F]/15 text-[#FF5A1F] border border-[#FF5A1F]/20';
      case 'Interview Completed': return 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20';
      case 'Selected': return 'bg-green-500/15 text-green-400 border border-green-500/20';
      case 'Offer Sent': return 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20';
      case 'Hired': return 'bg-green-600/15 text-green-500 border border-green-500/30';
      case 'Rejected': return 'bg-red-500/15 text-red-400 border border-red-500/20';
      default: return 'bg-white/5 text-white/50 border border-white/10';
    }
  };

  const getStatusColorStyle = (status: string) => {
    if (status === 'In Progress') return 'bg-blue-500/15 text-blue-400 border border-blue-500/20';
    if (status === 'Pending Review') return 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/20';
    if (status === 'Rejected') return 'bg-red-500/15 text-red-400 border border-red-500/20';
    if (status === 'Hired') return 'bg-green-500/15 text-green-400 border border-green-500/20';
    return 'bg-white/5 text-white/50';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#FF5A1F] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] p-8 text-white relative">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Applications</h1>
        <p className="text-white/50 text-sm">Track and manage all candidate applications</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {summaryCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className="group bg-gradient-to-br from-[#141414] to-[#0F0F0F] border border-white/[0.08] rounded-xl p-6 hover:border-[#FF5A1F]/30 hover:shadow-[0_0_20px_rgba(255,90,31,0.15)] transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 bg-[#FF5A1F]/15 rounded-xl flex items-center justify-center border border-[#FF5A1F]/20`}>
                  <Icon className="w-6 h-6 text-[#FF5A1F]" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-white mb-1">{card.value}</p>
              <p className="text-xs text-white/50 font-medium">{card.label}</p>
            </div>
          );
        })}
      </div>

      {/* Filters Bar */}
      <div className="bg-[#141414] border border-white/[0.08] rounded-xl p-6 mb-8">
        <div className="flex flex-col md:flex-row items-center gap-4">
          {/* Search */}
          <div className="flex-1 relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Search by name, position or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/[0.05] border border-white/[0.08] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#FF5A1F]/50 transition-all"
            />
          </div>

          {/* Stage Filter */}
          <div className="w-full md:w-48">
            <select
              value={filterStage}
              onChange={(e) => setFilterStage(e.target.value)}
              className="w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#FF5A1F]/50 transition-all"
            >
              <option value="all">All Stages</option>
              <option value="Applied">Applied</option>
              <option value="Screening">Screening</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Interview Scheduled">Interview Scheduled</option>
              <option value="Interview Completed">Interview Completed</option>
              <option value="Selected">Selected</option>
              <option value="Offer Sent">Offer Sent</option>
              <option value="Hired">Hired</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {/* Department Filter */}
          <div className="w-full md:w-48">
            <select 
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#FF5A1F]/50 transition-all"
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-[#141414] border border-white/[0.08] rounded-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          {filteredApps.length > 0 ? (
            <table className="w-full text-left">
              <thead className="bg-white/[0.02] border-b border-white/[0.08]">
                <tr className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                  <th className="px-6 py-4">Candidate</th>
                  <th className="px-6 py-4">Applied Job</th>
                  <th className="px-6 py-4">Applied Date</th>
                  <th className="px-6 py-4">ATS Score</th>
                  <th className="px-6 py-4">Pipeline Stage</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {filteredApps.map((app) => {
                  const hasATS = app.screening !== null;
                  const scoreVal = app.screening?.score || 0;
                  const style = getScoreStyle(scoreVal);
                  
                  return (
                    <motion.tr
                      key={app.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b border-white/[0.05] hover:bg-white/[0.02] transition-colors group"
                    >
                      {/* Avatar & Contact */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-[#FF5A1F] to-[#FF8A5B] rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm shadow-[0_0_15px_rgba(255,90,31,0.2)]">
                            {app.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white">{app.full_name}</p>
                            <p className="text-xs text-white/40 mt-0.5">{app.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Position Applied */}
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-semibold text-white">{app.job_title}</p>
                          <p className="text-xs text-white/40 mt-0.5">{app.job_department}</p>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 text-sm text-white/70">
                        {new Date(app.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>

                      {/* ATS Match Gauge */}
                      <td className="px-6 py-4">
                        {hasATS ? (
                          <div className="flex items-center gap-3">
                            <div className="relative w-11 h-11 flex-shrink-0">
                              <svg className="w-11 h-11 transform -rotate-90">
                                <circle
                                  cx="22"
                                  cy="22"
                                  r="18"
                                  stroke="rgba(255,255,255,0.05)"
                                  strokeWidth="3.5"
                                  fill="none"
                                />
                                <circle
                                  cx="22"
                                  cy="22"
                                  r="18"
                                  className={`${style.border}`}
                                  strokeWidth="3.5"
                                  fill="none"
                                  strokeDasharray={`${(scoreVal / 100) * 113} 113`}
                                  strokeLinecap="round"
                                  style={{ transition: 'stroke-dasharray 0.5s ease' }}
                                />
                              </svg>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-xs font-bold text-white">{scoreVal}</span>
                              </div>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${style.bg} ${style.text}`}>
                              {style.label}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-white/30 text-xs italic">
                            <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#FF5A1F]" />
                            Evaluating...
                          </div>
                        )}
                      </td>

                      {/* Stage Badge */}
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-xs rounded-md font-semibold whitespace-nowrap ${getStageColorStyle(app.stage)}`}>
                          {app.stage}
                        </span>
                      </td>

                      {/* Status Badge */}
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-xs rounded-md font-semibold whitespace-nowrap ${getStatusColorStyle(app.status)}`}>
                          {app.status}
                        </span>
                      </td>

                      {/* Hover Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 px-2 py-1 bg-[#1A1A1A]/40 border border-white/[0.04] rounded-lg w-max ml-auto opacity-0 group-hover:opacity-100 transition-all shadow-lg">
                          {/* View Drawer Details */}
                          <button 
                            onClick={() => setSelectedCandidate(app)}
                            className="p-1.5 hover:bg-white/[0.06] hover:text-[#FF5A1F] rounded-md transition-colors text-white/60" 
                            title="View Profile Drawer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          {/* Recruiter Notes Dialog */}
                          <button 
                            onClick={() => handleOpenComment(app)}
                            className="p-1.5 hover:bg-white/[0.06] hover:text-[#FF5A1F] rounded-md transition-colors text-white/60" 
                            title="Add Recruiter Notes"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                          
                          {/* Approve/Schedule Interview Calendar */}
                          {app.status !== 'Rejected' && app.status !== 'Hired' && (
                            <button 
                              onClick={() => handleOpenApprove(app)}
                              className="p-1.5 hover:bg-green-500/15 hover:text-green-400 rounded-md transition-colors text-white/60" 
                              title="Approve & Schedule Interview"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}
                          
                          {/* Reject Candidate */}
                          {app.status !== 'Rejected' && app.status !== 'Hired' && (
                            <button 
                              onClick={() => setRejectConfirmationAppId(app.id)}
                              className="p-1.5 hover:bg-red-500/15 hover:text-red-400 rounded-md transition-colors text-white/60" 
                              title="Reject Candidate"
                            >
                              <XCircle className="w-4 h-4" />
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
            <div className="flex flex-col items-center justify-center py-20 px-4">
              <Users className="w-16 h-16 text-white/20 mb-4" />
              <h3 className="text-white/70 text-lg font-medium mb-1">No candidate applications found</h3>
              <p className="text-white/40 text-sm text-center">There are no records matching your current filter choices.</p>
            </div>
          )}
        </div>
      </div>

      {/* Recruiter Notes / Comment Dialog */}
      <AnimatePresence>
        {activeCommentApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveCommentApp(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />
            {/* Box */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0F0F0F] border border-white/[0.08] p-6 rounded-2xl w-full max-w-lg shadow-2xl z-10"
            >
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/[0.06]">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-[#FF5A1F]" />
                  Recruiter Notes
                </h3>
                <button onClick={() => setActiveCommentApp(null)} className="text-white/40 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-white/50 mb-4">
                Enter private recruiter reviews and remarks for <strong>{activeCommentApp.full_name}</strong>.
              </p>
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Candidate demonstrated deep knowledge in JS modules during application intake. Highly structured code..."
                rows={6}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl p-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#FF5A1F]/50 resize-none mb-6 placeholder:text-white/20 transition-all font-sans leading-relaxed"
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setActiveCommentApp(null)}
                  className="px-4 py-2 bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] rounded-lg text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveComment}
                  disabled={savingComment}
                  className="px-5 py-2 bg-[#FF5A1F] hover:bg-[#FF7A4A] text-white rounded-lg text-sm font-bold shadow-[0_0_15px_rgba(255,90,31,0.3)] transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  {savingComment ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                  Save Note
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Date-Time Scheduler Modal */}
      <AnimatePresence>
        {activeApproveApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveApproveApp(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />
            {/* Box */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0F0F0F] border border-white/[0.08] p-6 rounded-2xl w-full max-w-md shadow-2xl z-10 space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-green-400" />
                  Schedule Interview
                </h3>
                <button onClick={() => setActiveApproveApp(null)} className="text-white/40 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-white/50">
                Confirming schedules a tech/HR meeting with <strong>{activeApproveApp.full_name}</strong> and saves the calendar event.
              </p>
              
              {/* Fields */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-white/60 mb-1.5 uppercase tracking-wider">Date *</label>
                    <input
                      type="date"
                      value={interviewDate}
                      onChange={(e) => setInterviewDate(e.target.value)}
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#FF5A1F]/50 transition-all cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-white/60 mb-1.5 uppercase tracking-wider">Time *</label>
                    <input
                      type="time"
                      value={interviewTime}
                      onChange={(e) => setInterviewTime(e.target.value)}
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#FF5A1F]/50 transition-all cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/60 mb-1.5 uppercase tracking-wider">Meeting Room / Link</label>
                  <div className="relative">
                    <Video className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                      type="url"
                      value={meetingLink}
                      onChange={(e) => setMeetingLink(e.target.value)}
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#FF5A1F]/50 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/60 mb-1.5 uppercase tracking-wider">Internal Interviewer Notes</label>
                  <textarea
                    value={interviewerNotes}
                    onChange={(e) => setInterviewerNotes(e.target.value)}
                    placeholder="Focus areas: System architecture patterns, React server components, CORS setup..."
                    rows={3}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#FF5A1F]/50 resize-none transition-all placeholder:text-white/20"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/[0.06]">
                <button
                  onClick={() => setActiveApproveApp(null)}
                  className="px-4 py-2 bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] rounded-lg text-sm transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleScheduleInterview}
                  disabled={scheduling || !interviewDate || !interviewTime}
                  className="px-5 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-bold shadow-[0_0_15px_rgba(34,197,94,0.3)] transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  {scheduling ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Schedule Interview
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Candidate Profile Drawer (Matches Candidates drawer exactly) */}
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
                    <p className="text-xs text-white/50">Applied for {selectedCandidate.job_title}</p>
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

                {/* AI ATS Suitability Analysis */}
                <div className="bg-[#141414] border border-white/[0.08] rounded-xl p-6 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#FF5A1F]" />
                      AI ATS Suitability Analysis
                    </h3>
                    {selectedCandidate.screening && (
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                        selectedCandidate.screening.fit_level === 'Strong Fit'
                          ? 'bg-green-500/15 text-green-400 border border-green-500/20'
                          : selectedCandidate.screening.fit_level === 'Moderate Fit'
                          ? 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/20'
                          : 'bg-red-500/15 text-red-400 border border-red-500/20'
                      }`}>
                        {selectedCandidate.screening.fit_level}
                      </span>
                    )}
                  </div>

                  {selectedCandidate.screening ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl font-extrabold text-white">{selectedCandidate.screening.score}%</span>
                        <span className="text-sm text-white/50">ATS Suitability Score</span>
                      </div>
                      <p className="text-sm text-white/70 leading-relaxed font-sans">
                        {selectedCandidate.screening.summary}
                      </p>
                      <div className="bg-white/[0.02] border-l-2 border-[#FF5A1F] p-3 rounded-r-lg italic text-sm text-white/80">
                        &ldquo;{selectedCandidate.screening.recommendation}&rdquo;
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-white/40 italic">Evaluating suitability score...</p>
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
                          {selectedCandidate.notice_period !== null ? `${selectedCandidate.notice_period} Days` : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Recruiter Notes inside Drawer */}
                <div className="bg-[#141414] border border-white/[0.08] rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-[#FF5A1F]" />
                      Recruiter Private Notes
                    </h3>
                    <button
                      onClick={() => handleOpenComment(selectedCandidate)}
                      className="text-xs text-[#FF5A1F] hover:text-[#FF7A4A] font-bold"
                    >
                      Edit Note
                    </button>
                  </div>
                  {selectedCandidate.recruiter_notes ? (
                    <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap bg-white/[0.02] border border-white/[0.05] rounded-lg p-4 font-sans max-h-60 overflow-y-auto">
                      {selectedCandidate.recruiter_notes}
                    </p>
                  ) : (
                    <p className="text-white/30 text-sm italic">No private recruiter comments saved.</p>
                  )}
                </div>

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

      {/* Rejection Confirmation Modal */}
      <AnimatePresence>
        {rejectConfirmationAppId !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setRejectConfirmationAppId(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />
            {/* Box */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0F0F0F] border border-white/[0.08] p-6 rounded-2xl w-full max-w-md shadow-2xl z-10 space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-500" />
                  Confirm Rejection
                </h3>
                <button onClick={() => setRejectConfirmationAppId(null)} className="text-white/40 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-white/70 leading-relaxed font-sans">
                Are you sure you want to reject <strong>{apps.find(a => a.id === rejectConfirmationAppId)?.full_name}</strong>? 
                This will update their application pipeline stage and status to <strong className="text-red-400">Rejected</strong>.
              </p>
              
              <div className="flex justify-end gap-3 pt-3 border-t border-white/[0.06]">
                <button
                  onClick={() => setRejectConfirmationAppId(null)}
                  className="px-4 py-2 bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] rounded-lg text-sm transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRejectCandidate(rejectConfirmationAppId)}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold shadow-[0_0_15px_rgba(220,38,38,0.3)] transition-all"
                >
                  Confirm Rejection
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
