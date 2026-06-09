'use client';

import { useState, useEffect } from 'react';
import { 
  Calendar, Search, Video, Clock, User, Briefcase, Mail, 
  ExternalLink, Sparkles, MessageSquare, AlertCircle, ArrowLeft, ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { api } from '@/services/auth';

interface Interview {
  id: number;
  application: number;
  scheduled_at: string;
  meeting_link: string | null;
  notes: string | null;
  candidate_name: string;
  candidate_email: string;
  job_title: string;
  job_department: string;
  application_stage: string;
  application_status: string;
}

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');

  const handleHire = async (interview: Interview) => {
    try {
      await api.patch(`/applications/${interview.application}/`, {
        stage: 'Hired',
        status: 'Hired'
      });
      // Update local state
      setInterviews(prev =>
        prev.map(item =>
          item.id === interview.id
            ? { ...item, application_status: 'Hired', application_stage: 'Hired' }
            : item
        )
      );
    } catch (err) {
      console.error('Failed to hire candidate:', err);
      alert('Failed to update candidate status to Hired.');
    }
  };

  const handleReject = async (interview: Interview) => {
    try {
      await api.patch(`/applications/${interview.application}/`, {
        stage: 'Rejected',
        status: 'Rejected'
      });
      // Update local state
      setInterviews(prev =>
        prev.map(item =>
          item.id === interview.id
            ? { ...item, application_status: 'Rejected', application_stage: 'Rejected' }
            : item
        )
      );
    } catch (err) {
      console.error('Failed to reject candidate:', err);
      alert('Failed to update candidate status to Rejected.');
    }
  };

  const fetchInterviews = async () => {
    try {
      const response = await api.get('/applications/interviews/');
      setInterviews(response.data);
    } catch (err) {
      console.error('Failed to fetch scheduled interviews:', err);
      setError('Unable to load interviews calendar. Please check backend service.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  const now = new Date();
  
  // Filter
  const filteredInterviews = interviews.filter(item => 
    item.candidate_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.notes && item.notes.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Group into upcoming vs past
  const upcomingInterviews = filteredInterviews.filter(item => new Date(item.scheduled_at) >= now);
  const pastInterviews = filteredInterviews.filter(item => new Date(item.scheduled_at) < now);

  const formatDateTime = (isoStr: string) => {
    const d = new Date(isoStr);
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
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
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-[#FF5A1F] to-[#FF8A5B] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(255,90,31,0.3)]">
            <Calendar className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white font-sans">Interviews</h1>
            <p className="text-white/50 text-sm">Smart interview scheduling and candidate coordination</p>
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

      {/* Search Bar */}
      <div className="mb-8 max-w-xl">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            placeholder="Search by candidate name or position title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#141414] border border-white/[0.08] rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#FF5A1F]/50 transition-all text-sm"
          />
        </div>
      </div>

      {/* List Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Column 1: Upcoming Interviews */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/[0.08] pb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
            Upcoming Interviews ({upcomingInterviews.length})
          </h2>
          
          {upcomingInterviews.length > 0 ? (
            <div className="space-y-4">
              {upcomingInterviews.map((interview) => (
                <motion.div
                  key={interview.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-br from-[#141414] to-[#0F0F0F] border border-[#FF5A1F]/20 rounded-xl p-5 hover:border-[#FF5A1F]/40 shadow-lg relative overflow-hidden transition-all duration-300"
                >
                  {/* Decorative blur */}
                  <div className="absolute -top-12 -right-12 w-24 h-24 bg-[#FF5A1F]/5 rounded-full blur-2xl" />
                  
                  {/* Candidate and Date */}
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white mb-0.5">{interview.candidate_name}</h3>
                      <span className="text-xs text-white/40 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-white/20" />
                        {interview.candidate_email}
                      </span>
                    </div>
                    
                    <span className="text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-2.5 py-1 rounded-md font-bold flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-green-400" />
                      Upcoming
                    </span>
                  </div>

                  {/* Position Details */}
                  <div className="mb-4 grid grid-cols-2 gap-4 border-t border-b border-white/[0.06] py-3.5">
                    <div>
                      <span className="block text-[10px] text-white/40 uppercase font-semibold mb-1">Target Position</span>
                      <span className="text-sm text-white/90 font-medium flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-[#FF5A1F]" />
                        {interview.job_title}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-white/40 uppercase font-semibold mb-1">Scheduled Date & Time</span>
                      <span className="text-sm text-white/90 font-medium flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#FF5A1F]" />
                        {formatDateTime(interview.scheduled_at)}
                      </span>
                    </div>
                  </div>

                  {/* Meeting notes */}
                  {interview.notes && (
                    <div className="mb-4 bg-white/[0.02] border border-white/[0.04] p-3 rounded-lg flex gap-2">
                      <MessageSquare className="w-4 h-4 text-white/30 flex-shrink-0 mt-0.5" />
                      <div className="flex flex-col">
                        <span className="text-[10px] text-white/40 uppercase font-semibold mb-0.5">Internal Preparation Notes</span>
                        <p className="text-xs text-white/70 leading-relaxed font-sans">{interview.notes}</p>
                      </div>
                    </div>
                  )}

                  {/* Meeting link CTA */}
                  {interview.meeting_link && (
                    <a
                      href={interview.meeting_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#FF5A1F] hover:bg-[#FF7A4A] text-white rounded-lg text-sm font-bold shadow-[0_0_15px_rgba(255,90,31,0.25)] transition-all"
                    >
                      <Video className="w-4 h-4" />
                      Join Google Meet / Meeting Room
                    </a>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-[#141414] border border-white/[0.08] rounded-xl p-8 text-center">
              <Clock className="w-10 h-10 text-white/20 mx-auto mb-3" />
              <p className="text-sm text-white/50">No upcoming interviews scheduled matching search.</p>
              <p className="text-xs text-white/30 mt-1">To schedule an interview, approve a candidate on the Applications tab.</p>
            </div>
          )}
        </div>

        {/* Column 2: Past Interviews */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/[0.08] pb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-white/30" />
            Completed / Past Interviews ({pastInterviews.length})
          </h2>
          
          {pastInterviews.length > 0 ? (
            <div className="space-y-4">
              {pastInterviews.map((interview) => (
                <motion.div
                  key={interview.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-br from-[#141414] to-[#0F0F0F] border border-white/[0.08] rounded-xl p-5 hover:border-white/20 transition-all shadow-md"
                >
                  {/* Candidate and Date */}
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white/80 mb-0.5">{interview.candidate_name}</h3>
                      <span className="text-xs text-white/40 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-white/20" />
                        {interview.candidate_email}
                      </span>
                    </div>
                    
                    <span className="text-xs bg-white/5 text-white/40 border border-white/10 px-2.5 py-1 rounded-md font-semibold">
                      Completed
                    </span>
                  </div>

                  {/* Position Details */}
                  <div className="grid grid-cols-2 gap-4 border-t border-white/[0.06] pt-3.5 mb-4">
                    <div>
                      <span className="block text-[10px] text-white/40 uppercase font-semibold mb-1">Target Position</span>
                      <span className="text-sm text-white/70 font-medium flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-white/30" />
                        {interview.job_title}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-white/40 uppercase font-semibold mb-1">Interview Date & Time</span>
                      <span className="text-sm text-white/70 font-medium flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-white/30" />
                        {formatDateTime(interview.scheduled_at)}
                      </span>
                    </div>
                  </div>

                  {/* Decision Buttons / Status Badge */}
                  <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
                    <span className="text-[10px] text-white/40 uppercase font-semibold">Candidate Status</span>
                    
                    {interview.application_status === 'Hired' ? (
                      <span className="text-xs bg-green-500/15 text-green-400 border border-green-500/20 px-2.5 py-1 rounded-md font-bold">
                        Hired
                      </span>
                    ) : interview.application_status === 'Rejected' ? (
                      <span className="text-xs bg-red-500/15 text-red-400 border border-red-500/20 px-2.5 py-1 rounded-md font-bold">
                        Rejected
                      </span>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleReject(interview)}
                          className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg text-xs font-bold transition-all"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleHire(interview)}
                          className="px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-400 rounded-lg text-xs font-bold transition-all shadow-[0_0_10px_rgba(34,197,94,0.1)]"
                        >
                          Hire
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-[#141414] border border-white/[0.08] rounded-xl p-8 text-center">
              <Calendar className="w-10 h-10 text-white/20 mx-auto mb-3" />
              <p className="text-sm text-white/50">No completed interviews found.</p>
            </div>
          )}
        </div>

      </div>

      {/* Global CTA to schedule */}
      {interviews.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 max-w-xl mx-auto text-center mt-12 bg-gradient-to-br from-[#141414] to-[#0F0F0F] border border-white/[0.08] rounded-2xl p-12">
          <Calendar className="w-16 h-16 text-[#FF5A1F]/30 mb-4 animate-bounce" />
          <h3 className="text-lg font-bold text-white mb-2">No interviews scheduled yet</h3>
          <p className="text-white/50 text-sm mb-6 max-w-sm">
            Approve candidates in your job applications pipeline to generate schedule details.
          </p>
          <Link
            href="/dashboard/applications"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF5A1F] hover:bg-[#FF7A4A] text-white rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(255,90,31,0.3)]"
          >
            <span>Review Applications</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
