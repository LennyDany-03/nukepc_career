'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Plus, X, Calendar, Check, Edit, Trash2, Eye, EyeOff,
  Briefcase, MapPin, Clock, Users, GraduationCap, Star, BookOpen,
  FileText, DollarSign, Building, Award, Globe, Shield, ChevronDown,
  Loader2, AlertCircle, Bell,
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/services/auth';

interface JobData {
  id: number;
  job_title: string;
  role: string;
  department: string;
  employment_type: string;
  candidate_level: string | null;
  number_of_openings: number;
  internship_duration: string | null;
  work_mode: string;
  office_location: string;
  shift_timing: string | null;
  application_deadline: string;
  expected_joining_date: string;
  stipend_amount: number | null;
  stipend_visible: boolean;
  ctc_min: number | null;
  ctc_max: number | null;
  salary_visible: boolean;
  probation_period: string | null;
  probation_stipend: number | null;
  notice_period: string | null;
  performance_bonus: boolean;
  performance_bonus_description: string | null;
  other_compensation: string | null;
  min_education: string;
  preferred_branch: string;
  min_cgpa: number | null;
  year_of_study: string | null;
  graduation_year: number | null;
  min_experience: number | null;
  max_experience: number | null;
  required_skills: string[];
  good_to_have_skills: string[];
  portfolio_required: boolean;
  assignment_round: boolean;
  assignment_description: string | null;
  certifications: string | null;
  previous_industry_experience: string | null;
  led_team: boolean | null;
  roles_responsibilities: string;
  what_intern_learns: string | null;
  what_we_offer: string | null;
  growth_path: string | null;
  team_structure: string | null;
  perks_benefits: string;
  additional_info: string | null;
  screening_question_1: string | null;
  screening_question_2: string | null;
  screening_question_3: string | null;
  status: string;
  scheduled_date: string | null;
  notify_team: boolean;
  created_by: number;
  created_by_email: string;
  created_at: string;
  updated_at: string;
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function JobDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [job, setJob] = useState<JobData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // Edit state — all editable fields
  const [form, setForm] = useState({
    job_title: '', role: '', custom_dept: '',
    openings: '' as number | '', duration: '3 months', custom_duration: '',
    work_mode: 'Remote', office_location: '', deadline: '', joining: '',
    stipend_amount: '' as number | '', stipend_visible: true, performance_bonus: false,
    bonus_desc: '', other_comp: '',
    ctc_min: '' as number | '', ctc_max: '' as number | '', salary_visible: true,
    probation: '3 months', probation_stipend: '' as number | '',
    notice_period: '1 month', shift_timing: 'Flexible',
    min_education: '', preferred_branch: '', min_cgpa: '' as number | '',
    year_of_study: 'Any', graduation_year: '' as number | '',
    min_exp: '' as number | '', max_exp: '' as number | '',
    required_skills: [] as string[], good_skills: [] as string[],
    portfolio_required: false, assignment_round: false, assignment_desc: '',
    certifications: '', previous_industry: '', led_team: false,
    roles_resp: '', what_learns: '', what_offer: '', growth_path: '',
    team_structure: '', perks: '', additional_info: '',
    screening_1: '', screening_2: '', screening_3: '',
    status: 'Draft', schedule_date: '', notify_team: false,
  });
  const [skillInput, setSkillInput] = useState('');
  const [goodSkillInput, setGoodSkillInput] = useState('');
  const [reqSkillInput, setReqSkillInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calView, setCalView] = useState(new Date());
  const calendarRef = useRef<HTMLDivElement>(null);

  const isInternship = job?.employment_type === 'Internship';
  const isFresher = job?.employment_type === 'Full-time' && job?.candidate_level === 'Fresher';
  const isExperienced = job?.employment_type === 'Full-time' && job?.candidate_level === 'Experienced';

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await api.get(`/jobs/${id}/`);
        const d: JobData = response.data;
        setJob(d);
        setForm({
          job_title: d.job_title, role: d.role, custom_dept: '',
          openings: d.number_of_openings, duration: d.internship_duration || '3 months', custom_duration: '',
          work_mode: d.work_mode, office_location: d.office_location,
          deadline: d.application_deadline, joining: d.expected_joining_date,
          stipend_amount: d.stipend_amount ?? '', stipend_visible: d.stipend_visible,
          performance_bonus: d.performance_bonus, bonus_desc: d.performance_bonus_description || '',
          other_comp: d.other_compensation || '',
          ctc_min: d.ctc_min ?? '', ctc_max: d.ctc_max ?? '', salary_visible: d.salary_visible,
          probation: d.probation_period || '3 months', probation_stipend: d.probation_stipend ?? '',
          notice_period: d.notice_period || '1 month', shift_timing: d.shift_timing || 'Flexible',
          min_education: d.min_education, preferred_branch: d.preferred_branch,
          min_cgpa: d.min_cgpa ?? '', year_of_study: d.year_of_study || 'Any',
          graduation_year: d.graduation_year ?? '',
          min_exp: d.min_experience ?? '', max_exp: d.max_experience ?? '',
          required_skills: [...d.required_skills], good_skills: [...d.good_to_have_skills],
          portfolio_required: d.portfolio_required, assignment_round: d.assignment_round,
          assignment_desc: d.assignment_description || '',
          certifications: d.certifications || '', previous_industry: d.previous_industry_experience || '',
          led_team: d.led_team ?? false,
          roles_resp: d.roles_responsibilities || '', what_learns: d.what_intern_learns || '',
          what_offer: d.what_we_offer || '', growth_path: d.growth_path || '',
          team_structure: d.team_structure || '', perks: d.perks_benefits || '',
          additional_info: d.additional_info || '',
          screening_1: d.screening_question_1 || '', screening_2: d.screening_question_2 || '',
          screening_3: d.screening_question_3 || '',
          status: d.status, schedule_date: d.scheduled_date || '', notify_team: d.notify_team,
        });
        setExpanded({ overview: true, stipend: true, salary: true, requirements: true, description: true, screening: true, settings: true });
      } catch {
        alert('Job not found.');
        router.push('/dashboard/jobs');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchJob();
  }, [id, router]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target as Node)) setCalendarOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const toggle = (s: string) => setExpanded((p) => ({ ...p, [s]: !p[s] }));

  const handleTogglePublish = async () => {
    if (!job) return;
    const ns = job.status === 'Publish' ? 'Draft' : 'Publish';
    setSubmitting(true);
    try {
      await api.patch(`/jobs/${id}/`, { status: ns });
      setJob({ ...job, status: ns });
    } catch { alert('Failed to change status.'); }
    finally { setSubmitting(false); }
  };

  const handleDeleteJob = async () => {
    if (!confirm('Delete this job posting? This cannot be undone.')) return;
    setSubmitting(true);
    try {
      await api.delete(`/jobs/${id}/`);
      router.push('/dashboard/jobs');
    } catch { alert('Failed to delete.'); }
    finally { setSubmitting(false); }
  };

  const addTag = (field: 'required_skills' | 'good_skills') => {
    const input = field === 'required_skills' ? reqSkillInput : goodSkillInput;
    const v = input.trim();
    if (!v) return;
    if (field === 'required_skills') {
      if (!form.required_skills.includes(v)) setForm({ ...form, required_skills: [...form.required_skills, v] });
      setReqSkillInput('');
    } else {
      if (!form.good_skills.includes(v)) setForm({ ...form, good_skills: [...form.good_skills, v] });
      setGoodSkillInput('');
    }
  };

  const removeTag = (field: 'required_skills' | 'good_skills', s: string) => {
    setForm({ ...form, [field]: form[field].filter((x) => x !== s) });
  };

  const handleSave = async () => {
    if (!job) return;
    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        job_title: form.job_title, role: form.role,
        number_of_openings: form.openings || null,
        internship_duration: isInternship ? form.duration : null,
        work_mode: form.work_mode, office_location: form.office_location,
        shift_timing: isInternship ? null : form.shift_timing,
        application_deadline: form.deadline || null,
        expected_joining_date: form.joining || null,
        stipend_amount: isInternship ? (form.stipend_amount || null) : null,
        stipend_visible: isInternship ? form.stipend_visible : false,
        ctc_min: isInternship ? null : (form.ctc_min || null),
        ctc_max: isInternship ? null : (form.ctc_max || null),
        salary_visible: !isInternship ? form.salary_visible : true,
        probation_period: isFresher ? form.probation : null,
        probation_stipend: isFresher ? (form.probation_stipend || null) : null,
        notice_period: isExperienced ? form.notice_period : null,
        performance_bonus: form.performance_bonus,
        performance_bonus_description: form.performance_bonus ? form.bonus_desc : null,
        other_compensation: form.other_comp || null,
        min_education: form.min_education, preferred_branch: form.preferred_branch,
        min_cgpa: form.min_cgpa || null, year_of_study: isInternship ? form.year_of_study : null,
        graduation_year: isFresher ? (form.graduation_year || null) : null,
        min_experience: isExperienced ? (form.min_exp || null) : null,
        max_experience: isExperienced ? (form.max_exp || null) : null,
        required_skills: form.required_skills, good_to_have_skills: form.good_skills,
        portfolio_required: form.portfolio_required, assignment_round: form.assignment_round,
        assignment_description: form.assignment_round ? form.assignment_desc : null,
        certifications: form.certifications || null,
        previous_industry_experience: isExperienced ? (form.previous_industry || null) : null,
        led_team: isExperienced ? form.led_team : null,
        roles_responsibilities: form.roles_resp,
        what_intern_learns: isInternship ? form.what_learns : null,
        what_we_offer: !isInternship ? form.what_offer : null,
        growth_path: isFresher ? form.growth_path : null,
        team_structure: isExperienced ? form.team_structure : null,
        perks_benefits: form.perks, additional_info: form.additional_info || null,
        screening_question_1: form.screening_1 || null,
        screening_question_2: form.screening_2 || null,
        screening_question_3: form.screening_3 || null,
        status: form.status,
        scheduled_date: form.status === 'Schedule' ? form.schedule_date : null,
        notify_team: form.notify_team,
      };
      const res = await api.put(`/jobs/${id}/`, payload);
      setJob(res.data);
      setIsEditing(false);
    } catch { alert('Failed to save changes.'); }
    finally { setSubmitting(false); }
  };

  const renderInput = (field: string, label: string, opts?: { type?: string; placeholder?: string; cls?: string }) => (
    <div>
      <label className="block text-sm font-semibold text-white/80 mb-1.5">{label}</label>
      <input type={opts?.type || 'text'} value={String((form as any)[field] ?? '')}
        onChange={(e) => setForm({ ...form, [field]: e.target.value })}
        placeholder={opts?.placeholder}
        className={`w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#FF5A2C]/30 ${opts?.cls || ''}`} />
    </div>
  );

  const renderSelect = (field: string, label: string, options: string[]) => (
    <div>
      <label className="block text-sm font-semibold text-white/80 mb-1.5">{label}</label>
      <select value={String((form as any)[field])} onChange={(e) => setForm({ ...form, [field]: e.target.value })}
        className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#FF5A2C]/30">
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  const renderToggle = (field: string, label: string) => (
    <div className="flex items-center justify-between bg-white/[0.02] border border-white/[0.05] rounded-xl px-4 py-3">
      <span className="text-sm font-medium text-white/80">{label}</span>
      <button type="button" onClick={() => setForm({ ...form, [field]: !(form as any)[field] })}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${(form as any)[field] ? 'bg-[#FF5A2C]' : 'bg-white/10'}`}>
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${(form as any)[field] ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  );

  const section = (num: number, title: string, key: string, children: React.ReactNode) => (
    <div className="bg-[#141414] border border-white/[0.08] rounded-2xl overflow-hidden">
      <div onClick={() => toggle(key)} className="px-6 py-4 flex items-center justify-between border-b border-white/[0.05] cursor-pointer hover:bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-lg bg-[#FF5A2C]/10 text-[#FF5A2C] flex items-center justify-center text-sm font-bold">{num}</span>
          <h3 className="font-bold text-white text-lg">{title}</h3>
        </div>
        <ChevronDown className={`w-5 h-5 text-white/50 transition-transform ${expanded[key] ? 'rotate-180' : ''}`} />
      </div>
      <AnimatePresence initial={false}>
        {expanded[key] && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="p-6 space-y-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const skillTags = (field: 'required_skills' | 'good_skills', input: string, setInput: (v: string) => void) => (
    <div>
      <div className="flex flex-wrap gap-2 mb-3">
        {form[field].map((s) => (
          <span key={s} className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium ${field === 'required_skills' ? 'bg-[#FF5A2C]/10 border border-[#FF5A2C]/20 text-[#FF5A2C]' : 'bg-white/[0.03] border border-white/[0.08] text-white/70'}`}>
            {s}
            <button type="button" onClick={() => removeTag(field, s)} className="hover:text-white transition-colors"><X className="w-3 h-3" /></button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag(field))}
          placeholder="Type and press Enter" className="flex-1 bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#FF5A2C]/30" />
        <button type="button" onClick={() => addTag(field)} className="px-3 py-2.5 bg-white/[0.05] border border-white/[0.08] rounded-xl text-white/70 hover:text-white transition-all"><Plus className="w-4 h-4" /></button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#FF5A1F] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!job) return null;

  const year = calView.getFullYear();
  const month = calView.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay = new Date(year, month, 1).getDay();

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Top Bar */}
      <div className="sticky top-0 z-40 bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-white/[0.08] px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4 min-w-0">
          <Link href="/dashboard/jobs" className="p-2 hover:bg-white/[0.08] rounded-lg transition-colors shrink-0">
            <ArrowLeft size={20} />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold truncate">{isEditing ? 'Edit Job Posting' : job.job_title}</h1>
              <span className={`shrink-0 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${job.status === 'Publish' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'}`}>
                {job.status}
              </span>
            </div>
            <p className="text-xs text-white/60 mt-0.5 truncate">{job.department} {job.role ? `· ${job.role}` : ''}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {isEditing ? (
            <>
              <button type="button" onClick={() => { setIsEditing(false); setErrors({}); }}
                className="px-5 py-2 bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] text-white font-medium rounded-lg transition-colors text-sm">Cancel</button>
              <button type="button" onClick={handleSave} disabled={submitting}
                className="px-5 py-2 bg-[#FF5A2C] hover:bg-[#FF7A4A] text-white font-medium rounded-lg transition-colors text-sm flex items-center gap-1.5 disabled:opacity-50">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check size={16} />} Save Changes
              </button>
            </>
          ) : (
            <>
              <button type="button" onClick={handleTogglePublish} disabled={submitting}
                className={`px-4 py-2 border rounded-lg font-medium transition-colors text-sm flex items-center gap-1.5 ${job.status === 'Publish' ? 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20' : 'border-green-500/30 bg-green-500/10 text-green-400 hover:bg-green-500/20'}`}>
                {job.status === 'Publish' ? <><EyeOff size={16} /> Unpublish</> : <><Eye size={16} /> Publish Live</>}
              </button>
              <button type="button" onClick={() => { setIsEditing(true); setExpanded({ overview: true, stipend: true, salary: true, requirements: true, description: true, screening: true, settings: true }); }}
                className="px-4 py-2 bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] text-white font-medium rounded-lg transition-colors text-sm flex items-center gap-1.5">
                <Edit size={16} /> Edit
              </button>
              <button type="button" onClick={handleDeleteJob} disabled={submitting}
                className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-medium rounded-lg transition-colors text-sm flex items-center gap-1.5">
                <Trash2 size={16} /> Delete
              </button>
            </>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isEditing ? (
          /* ===================== EDIT MODE ===================== */
          <motion.div key="editing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="px-8 py-8 max-w-4xl mx-auto space-y-6">
            {/* SECTION 1: Job Overview */}
            {section(1, 'Job Overview', 'overview', <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderInput('job_title', 'Job Title', { placeholder: 'e.g. Full Stack Developer' })}
                {renderInput('role', 'Role', { placeholder: 'e.g. Frontend Developer' })}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {renderInput('openings', 'Openings', { type: 'number', placeholder: '5' })}
                {renderSelect('work_mode', 'Work Mode', ['Remote', 'In-office', 'Hybrid'])}
                {renderInput('office_location', 'Office Location', { placeholder: 'e.g. Chennai, India' })}
              </div>
              {isInternship && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderSelect('duration', 'Duration', ['1 month', '2 months', '3 months', '6 months', 'Custom'])}
                  {form.duration === 'Custom' && renderInput('custom_duration', 'Custom Duration', { placeholder: 'e.g. 45 days' })}
                </div>
              )}
              {!isInternship && renderSelect('shift_timing', 'Shift Timing', ['Day', 'Flexible', 'Night', 'Rotational'])}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderInput('deadline', 'Application Deadline', { type: 'date' })}
                {renderInput('joining', 'Expected Joining', { type: 'date' })}
              </div>
            </>)}

            {/* SECTION 2: Compensation */}
            {isInternship ? section(2, 'Stipend & Benefits', 'stipend', <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderInput('stipend_amount', 'Stipend (₹)', { type: 'number', placeholder: '12000' })}
                {renderToggle('stipend_visible', 'Show stipend to applicants')}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderToggle('performance_bonus', 'Performance Bonus')}
                {form.performance_bonus && renderInput('bonus_desc', 'Bonus Description', { placeholder: 'Describe the bonus structure' })}
              </div>
              {renderInput('other_comp', 'Other Compensation', { placeholder: 'e.g. Travel allowance, meals' })}
            </>) : section(2, 'Salary & Compensation', 'salary', <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderInput('ctc_min', 'Min CTC (₹)', { type: 'number', placeholder: '300000' })}
                {renderInput('ctc_max', 'Max CTC (₹)', { type: 'number', placeholder: '600000' })}
              </div>
              {renderToggle('salary_visible', 'Show salary to applicants')}
              {isFresher && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderSelect('probation', 'Probation Period', ['3 months', '6 months', 'None'])}
                  {form.probation !== 'None' && renderInput('probation_stipend', 'Probation Stipend (₹)', { type: 'number', placeholder: '15000' })}
                </div>
              )}
              {isExperienced && renderSelect('notice_period', 'Notice Period', ['Immediate', '15 days', '1 month', '2 months', '3 months'])}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderToggle('performance_bonus', 'Performance Bonus')}
                {form.performance_bonus && renderInput('bonus_desc', 'Bonus Description')}
              </div>
              {renderInput('other_comp', 'Other Compensation', { placeholder: 'e.g. Stock options, ESOPs' })}
            </>)}

            {/* SECTION 3: Requirements */}
            {section(3, 'Candidate Requirements', 'requirements', <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderInput('min_education', 'Minimum Education', { placeholder: 'e.g. B.Tech, B.Sc' })}
                {renderInput('preferred_branch', 'Preferred Branch', { placeholder: 'e.g. Computer Science' })}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {renderInput('min_cgpa', 'Min CGPA', { type: 'number', placeholder: '7.5' })}
                {isInternship && renderSelect('year_of_study', 'Year of Study', ['1st', '2nd', '3rd', 'Final year', 'Any'])}
                {isFresher && renderInput('graduation_year', 'Graduation Year', { type: 'number', placeholder: '2026' })}
              </div>
              {isExperienced && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderInput('min_exp', 'Min Experience (years)', { type: 'number', placeholder: '2' })}
                  {renderInput('max_exp', 'Max Experience (years)', { type: 'number', placeholder: '5' })}
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-white/80 mb-2">Required Skills</label>
                {skillTags('required_skills', reqSkillInput, setReqSkillInput)}
              </div>
              <div>
                <label className="block text-sm font-semibold text-white/80 mb-2">Good to Have Skills</label>
                {skillTags('good_skills', goodSkillInput, setGoodSkillInput)}
              </div>
              {renderToggle('portfolio_required', 'Portfolio required?')}
              {renderToggle('assignment_round', 'Assignment Round?')}
              {form.assignment_round && renderInput('assignment_desc', 'Assignment Description', { placeholder: 'Describe the assignment' })}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderInput('certifications', 'Preferred Certifications', { placeholder: 'e.g. AWS, Google Cloud' })}
                {isExperienced && renderInput('previous_industry', 'Previous Industry Experience')}
              </div>
              {isExperienced && renderToggle('led_team', 'Team Leadership Required?')}
            </>)}

            {/* SECTION 4: Description */}
            {section(4, 'Job Description', 'description', <>
              <div>
                <label className="block text-sm font-semibold text-white/80 mb-1.5">Roles & Responsibilities</label>
                <textarea value={form.roles_resp} onChange={(e) => setForm({ ...form, roles_resp: e.target.value })} rows={5}
                  className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#FF5A2C]/30 resize-none" />
              </div>
              {isInternship && (
                <div>
                  <label className="block text-sm font-semibold text-white/80 mb-1.5">What You'll Learn</label>
                  <textarea value={form.what_learns} onChange={(e) => setForm({ ...form, what_learns: e.target.value })} rows={4}
                    className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#FF5A2C]/30 resize-none" />
                </div>
              )}
              {!isInternship && (
                <div>
                  <label className="block text-sm font-semibold text-white/80 mb-1.5">What We Offer</label>
                  <textarea value={form.what_offer} onChange={(e) => setForm({ ...form, what_offer: e.target.value })} rows={4}
                    className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#FF5A2C]/30 resize-none" />
                </div>
              )}
              {isFresher && (
                <div>
                  <label className="block text-sm font-semibold text-white/80 mb-1.5">Growth Path</label>
                  <textarea value={form.growth_path} onChange={(e) => setForm({ ...form, growth_path: e.target.value })} rows={3}
                    className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#FF5A2C]/30 resize-none" />
                </div>
              )}
              {isExperienced && (
                <div>
                  <label className="block text-sm font-semibold text-white/80 mb-1.5">Team Structure</label>
                  <textarea value={form.team_structure} onChange={(e) => setForm({ ...form, team_structure: e.target.value })} rows={3}
                    className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#FF5A2C]/30 resize-none" />
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-white/80 mb-1.5">Perks & Benefits</label>
                <textarea value={form.perks} onChange={(e) => setForm({ ...form, perks: e.target.value })} rows={3}
                  className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#FF5A2C]/30 resize-none" />
              </div>
              {renderInput('additional_info', 'Additional Info', { placeholder: 'Any other relevant information' })}
            </>)}

            {/* SECTION 5: Screening Questions */}
            {section(5, 'Screening Questions', 'screening', <>
              {[['screening_1', 1], ['screening_2', 2], ['screening_3', 3]].map(([f, n]) => (
                <div key={f as string}>{renderInput(f as string, `Question ${n}`, { placeholder: `Enter screening question ${n}` })}</div>
              ))}
            </>)}

            {/* SECTION 6: Post Settings */}
            {section(6, 'Post Settings', 'settings', <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {['Draft', 'Publish', 'Schedule'].map((opt) => (
                  <button key={opt} type="button" onClick={() => setForm({ ...form, status: opt })}
                    className={`rounded-xl p-4 text-left border transition-all ${form.status === opt ? (opt === 'Publish' ? 'bg-green-500/10 border-green-500/30 ring-1 ring-green-500/20' : opt === 'Schedule' ? 'bg-blue-500/10 border-blue-500/30 ring-1 ring-blue-500/20' : 'bg-yellow-500/10 border-yellow-500/30 ring-1 ring-yellow-500/20') : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]'}`}>
                    <p className={`text-sm font-bold ${form.status === opt ? (opt === 'Publish' ? 'text-green-400' : opt === 'Schedule' ? 'text-blue-400' : 'text-yellow-400') : 'text-white/60'}`}>{opt}</p>
                    <p className="text-[10px] text-white/40 mt-0.5">{opt === 'Draft' ? 'Save without publishing' : opt === 'Publish' ? 'Post live immediately' : 'Set a future date'}</p>
                  </button>
                ))}
              </div>
              {form.status === 'Schedule' && (
                <div id="scheduleDate" className="relative" ref={calendarRef}>
                  <label className="block text-sm font-semibold text-white/80 mb-1.5">Schedule Date & Time</label>
                  <button type="button" onClick={() => setCalendarOpen(!calendarOpen)}
                    className={`w-full flex items-center gap-3 bg-white/[0.05] border rounded-xl px-4 py-2.5 text-left transition-all hover:bg-white/[0.08] ${errors.schedule_date ? 'border-red-500/50' : 'border-white/[0.08]'}`}>
                    <Calendar className="w-5 h-5 text-[#FF5A2C] shrink-0" />
                    <span className={`flex-1 text-sm ${form.schedule_date ? 'text-white' : 'text-white/30'}`}>
                      {form.schedule_date ? new Date(form.schedule_date).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Pick a date and time'}
                    </span>
                  </button>
                  <AnimatePresence>
                    {calendarOpen && (
                      <motion.div initial={{ opacity: 0, y: -8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.97 }}
                        className="absolute top-full left-0 right-0 mt-2 z-50 bg-[#1A1A1A] border border-white/[0.10] rounded-2xl p-4 shadow-2xl shadow-black/50">
                        <div className="flex items-center justify-between mb-4">
                          <button type="button" onClick={() => setCalView(new Date(year, month - 1, 1))} className="p-1.5 hover:bg-white/[0.08] rounded-lg text-white/60 hover:text-white"><ChevronDown className="w-4 h-4 rotate-90" /></button>
                          <span className="text-sm font-semibold text-white">{MONTHS[month]} {year}</span>
                          <button type="button" onClick={() => setCalView(new Date(year, month + 1, 1))} className="p-1.5 hover:bg-white/[0.08] rounded-lg text-white/60 hover:text-white"><ChevronDown className="w-4 h-4 -rotate-90" /></button>
                        </div>
                        <div className="grid grid-cols-7 gap-1 mb-2">{DAYS.map((d) => <div key={d} className="text-center text-[10px] font-semibold text-white/40 py-1">{d}</div>)}</div>
                        <div className="grid grid-cols-7 gap-1">
                          {Array.from({ length: startDay }).map((_, i) => <div key={`e-${i}`} />)}
                          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                            const sel = form.schedule_date ? new Date(form.schedule_date) : null;
                            const isSel = sel && sel.getDate() === day && sel.getMonth() === month && sel.getFullYear() === year;
                            const today = new Date();
                            const isT = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                            return (
                              <button key={day} type="button" onClick={() => {
                                const d = new Date(year, month, day);
                                setForm({ ...form, schedule_date: d.toISOString().slice(0, 16) });
                                setCalendarOpen(false);
                              }}
                                className={`w-full aspect-square rounded-xl text-xs font-medium transition-all ${isSel ? 'bg-gradient-to-br from-[#FF5A2C] to-[#FF7A4A] text-white shadow-[0_0_12px_rgba(255,90,44,0.3)]' : isT ? 'bg-white/[0.08] text-white border border-white/[0.15]' : 'text-white/70 hover:bg-white/[0.06] hover:text-white'}`}>
                                {day}
                              </button>
                            );
                          })}
                        </div>
                        <div className="mt-4 pt-4 border-t border-white/[0.08]">
                          <label className="block text-xs text-white/50 mb-2">Select time</label>
                          <input type="time" value={form.schedule_date ? form.schedule_date.slice(11, 16) : ''}
                            onChange={(e) => setForm({ ...form, schedule_date: (form.schedule_date || new Date().toISOString().slice(0, 10)) + 'T' + e.target.value })}
                            className="w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#FF5A2C]/30 [color-scheme:dark]" />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
              <div className="flex items-center justify-between bg-gradient-to-r from-white/[0.02] to-transparent border border-white/[0.06] rounded-xl px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${form.notify_team ? 'bg-[#FF5A2C]/15 text-[#FF5A2C]' : 'bg-white/[0.04] text-white/40'}`}>
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-white/90">Email Notifications</span>
                    <p className="text-xs text-white/40">Alert hiring team on new applications</p>
                  </div>
                </div>
                <button type="button" onClick={() => setForm({ ...form, notify_team: !form.notify_team })}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all shrink-0 ${form.notify_team ? 'bg-[#FF5A2C] shadow-[0_0_12px_rgba(255,90,44,0.3)]' : 'bg-white/10'}`}>
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${form.notify_team ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </>)}
          </motion.div>
        ) : (
          /* ===================== VIEW MODE ===================== */
          <motion.div key="viewing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="p-8 max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Job Header */}
              <div className="bg-[#141414] border border-white/[0.08] rounded-2xl p-8">
                <span className="text-[#FF5A2C] font-semibold text-sm uppercase tracking-wider block mb-2">{job.department}</span>
                <h2 className="text-3xl font-bold text-white mb-2">{job.job_title}</h2>
                {job.role && <p className="text-white/60 text-sm mb-4">{job.role}</p>}
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-white/60">
                  <div className="flex items-center gap-1.5"><Briefcase className="w-4 h-4 text-[#FF5A2C]" /> {job.employment_type}</div>
                  <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-[#FF5A2C]" /> {job.office_location || 'Not specified'}</div>
                  <div className="flex items-center gap-1.5"><Globe className="w-4 h-4 text-[#FF5A2C]" /> {job.work_mode}</div>
                  {job.shift_timing && <div className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-[#FF5A2C]" /> {job.shift_timing}</div>}
                </div>
              </div>

              {/* Compensation */}
              <div className="bg-[#141414] border border-white/[0.08] rounded-2xl p-8">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><DollarSign className="w-5 h-5 text-[#FF5A2C]" /> Compensation</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {isInternship ? (
                    <>
                      <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4">
                        <p className="text-xs text-white/50 mb-1">Stipend</p>
                        <p className="text-lg font-bold text-white">{job.stipend_amount ? `₹${job.stipend_amount.toLocaleString('en-IN')}` : 'Not specified'}</p>
                        {job.stipend_visible && <p className="text-xs text-white/40 mt-1">Visible to applicants</p>}
                      </div>
                      {job.internship_duration && <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4"><p className="text-xs text-white/50 mb-1">Duration</p><p className="text-lg font-bold text-white">{job.internship_duration}</p></div>}
                    </>
                  ) : (
                    <>
                      <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4">
                        <p className="text-xs text-white/50 mb-1">Salary Range</p>
                        <p className="text-lg font-bold text-white">{job.ctc_min ? `₹${job.ctc_min.toLocaleString('en-IN')}` : '—'} - {job.ctc_max ? `₹${job.ctc_max.toLocaleString('en-IN')}` : '—'}</p>
                        {job.salary_visible && <p className="text-xs text-white/40 mt-1">Visible to applicants</p>}
                      </div>
                      {job.notice_period && <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4"><p className="text-xs text-white/50 mb-1">Notice Period</p><p className="text-lg font-bold text-white">{job.notice_period}</p></div>}
                      {job.probation_period && <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4"><p className="text-xs text-white/50 mb-1">Probation</p><p className="text-lg font-bold text-white">{job.probation_period}</p></div>}
                    </>
                  )}
                </div>
                {job.performance_bonus && <div className="mt-3 text-sm text-white/70"><span className="font-semibold">Performance Bonus:</span> {job.performance_bonus_description || 'Yes'}</div>}
                {job.other_compensation && <div className="mt-2 text-sm text-white/70"><span className="font-semibold">Other:</span> {job.other_compensation}</div>}
              </div>

              {/* Description */}
              <div className="bg-[#141414] border border-white/[0.08] rounded-2xl p-8">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><FileText className="w-5 h-5 text-[#FF5A2C]" /> {isInternship ? 'Learning & Responsibilities' : 'Job Description'}</h3>
                {job.roles_responsibilities && <div className="mb-4"><h4 className="text-sm font-semibold text-white/70 mb-2">Roles & Responsibilities</h4><p className="text-white/80 leading-relaxed text-sm whitespace-pre-wrap">{job.roles_responsibilities}</p></div>}
                {isInternship && job.what_intern_learns && <div><h4 className="text-sm font-semibold text-white/70 mb-2">What You'll Learn</h4><p className="text-white/80 leading-relaxed text-sm whitespace-pre-wrap">{job.what_intern_learns}</p></div>}
                {!isInternship && job.what_we_offer && <div><h4 className="text-sm font-semibold text-white/70 mb-2">What We Offer</h4><p className="text-white/80 leading-relaxed text-sm whitespace-pre-wrap">{job.what_we_offer}</p></div>}
                {job.growth_path && <div className="mt-4"><h4 className="text-sm font-semibold text-white/70 mb-2">Growth Path</h4><p className="text-white/80 leading-relaxed text-sm whitespace-pre-wrap">{job.growth_path}</p></div>}
                {job.perks_benefits && <div className="mt-4"><h4 className="text-sm font-semibold text-white/70 mb-2">Perks & Benefits</h4><p className="text-white/80 leading-relaxed text-sm whitespace-pre-wrap">{job.perks_benefits}</p></div>}
                {job.additional_info && <div className="mt-4"><h4 className="text-sm font-semibold text-white/70 mb-2">Additional Info</h4><p className="text-white/80 leading-relaxed text-sm whitespace-pre-wrap">{job.additional_info}</p></div>}
              </div>

              {/* Skills */}
              <div className="bg-[#141414] border border-white/[0.08] rounded-2xl p-8">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><Award className="w-5 h-5 text-[#FF5A2C]" /> Skills</h3>
                {job.required_skills.length > 0 && <div className="mb-4"><h4 className="text-sm font-semibold text-white/70 mb-2">Required</h4><div className="flex flex-wrap gap-2">{job.required_skills.map((s) => <span key={s} className="bg-[#FF5A2C]/10 border border-[#FF5A2C]/20 text-[#FF5A2C] px-3 py-1.5 rounded-lg text-xs font-medium">{s}</span>)}</div></div>}
                {job.good_to_have_skills.length > 0 && <div><h4 className="text-sm font-semibold text-white/70 mb-2">Good to Have</h4><div className="flex flex-wrap gap-2">{job.good_to_have_skills.map((s) => <span key={s} className="bg-white/[0.05] border border-white/[0.08] text-white/70 px-3 py-1.5 rounded-lg text-xs font-medium">{s}</span>)}</div></div>}
              </div>

              {/* Requirements */}
              <div className="bg-[#141414] border border-white/[0.08] rounded-2xl p-8">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><GraduationCap className="w-5 h-5 text-[#FF5A2C]" /> Requirements</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {job.min_education && <InfoCard label="Education" value={job.min_education} />}
                  {job.preferred_branch && <InfoCard label="Branch" value={job.preferred_branch} />}
                  {job.min_cgpa != null && <InfoCard label="Min CGPA" value={String(job.min_cgpa)} />}
                  {job.year_of_study && <InfoCard label="Year of Study" value={job.year_of_study} />}
                  {job.graduation_year && <InfoCard label="Graduation Year" value={String(job.graduation_year)} />}
                  {job.min_experience != null && <InfoCard label="Experience" value={`${job.min_experience} - ${job.max_experience ?? '∞'} yrs`} />}
                  {job.probation_period && <InfoCard label="Probation" value={job.probation_period} />}
                  {job.certifications && <InfoCard label="Certifications" value={job.certifications} />}
                </div>
                {job.portfolio_required && <div className="mt-3 flex items-center gap-2 text-sm text-white/70"><Check className="w-4 h-4 text-[#FF5A2C]" /> Portfolio required</div>}
                {job.assignment_round && <div className="mt-2 text-sm text-white/70"><span className="font-semibold">Assignment:</span> {job.assignment_description || 'Yes'}</div>}
                {job.led_team != null && <div className="mt-2 text-sm text-white/70">{job.led_team ? 'Team leadership required' : 'No team leadership'}</div>}
              </div>

              {/* Screening Questions */}
              {(job.screening_question_1 || job.screening_question_2 || job.screening_question_3) && (
                <div className="bg-[#141414] border border-white/[0.08] rounded-2xl p-8">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><BookOpen className="w-5 h-5 text-[#FF5A2C]" /> Screening Questions</h3>
                  <ul className="space-y-3">{[job.screening_question_1, job.screening_question_2, job.screening_question_3].filter(Boolean).map((q, i) => <li key={i} className="flex items-start gap-2 text-sm text-white/80"><span className="text-[#FF5A2C] font-bold mt-0.5">{i + 1}.</span> {q}</li>)}</ul>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div className="bg-[#141414] border border-white/[0.08] rounded-2xl p-6 space-y-4">
                <h3 className="text-sm font-semibold text-white">Posting Status</h3>
                <div className="p-4 bg-white/[0.02] border border-white/[0.08] rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${job.status === 'Publish' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]'}`} />
                    <span className="text-sm font-medium capitalize text-white/90">{job.status === 'Publish' ? 'Published' : 'Draft'}</span>
                  </div>
                  <button type="button" onClick={handleTogglePublish} disabled={submitting} className="text-xs text-[#FF5A2C] hover:underline">{job.status === 'Publish' ? 'Set Draft' : 'Publish'}</button>
                </div>
              </div>
              <div className="bg-[#141414] border border-white/[0.08] rounded-2xl p-6 space-y-3">
                <h3 className="text-sm font-semibold text-white">Quick Info</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between"><span className="text-white/50">Openings</span><span className="text-white font-semibold flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-[#FF5A2C]" /> {job.number_of_openings}</span></div>
                  <div className="flex items-center justify-between"><span className="text-white/50">Deadline</span><span className="text-white font-semibold">{job.application_deadline ? new Date(job.application_deadline).toLocaleDateString() : 'None'}</span></div>
                  {job.expected_joining_date && <div className="flex items-center justify-between"><span className="text-white/50">Joining</span><span className="text-white font-semibold">{new Date(job.expected_joining_date).toLocaleDateString()}</span></div>}
                  <div className="flex items-center justify-between"><span className="text-white/50">Created</span><span className="text-white font-semibold">{new Date(job.created_at).toLocaleDateString()}</span></div>
                  <div className="flex items-center justify-between"><span className="text-white/50">Posted by</span><span className="text-white font-semibold text-xs truncate max-w-[160px]">{job.created_by_email}</span></div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4">
      <p className="text-xs text-white/50 mb-1">{label}</p>
      <p className="text-sm font-semibold text-white">{value}</p>
    </div>
  );
}
