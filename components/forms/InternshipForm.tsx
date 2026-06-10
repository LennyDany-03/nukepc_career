'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, Calendar, Plus, X, ArrowLeft, Loader2, Sparkles, Check, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { departmentConfig } from '@/config/departmentConfig';
import { api } from '@/services/auth';
import { useRouter } from 'next/navigation';

interface FormProps {
  department: string;
  employmentType: 'internship' | 'fulltime';
  candidateLevel: 'fresher' | 'experienced' | null;
  onBack: () => void;
}

export default function InternshipForm({ department, employmentType, candidateLevel, onBack }: FormProps) {
  const router = useRouter();
  const config = departmentConfig[department as keyof typeof departmentConfig] || departmentConfig['Custom'];

  // Form State
  const [jobTitle, setJobTitle] = useState('');
  const [role, setRole] = useState(config.roles[0] || '');
  const [customRole, setCustomRole] = useState('');
  const [customDept, setCustomDept] = useState(department === 'Custom' ? '' : department);
  const [openings, setOpenings] = useState<number | ''>('');
  const [duration, setDuration] = useState('3 months');
  const [customDuration, setCustomDuration] = useState('');
  const [workMode, setWorkMode] = useState('Remote');
  const [officeLocation, setOfficeLocation] = useState('');
  const [deadline, setDeadline] = useState('');
  const [joiningDate, setJoiningDate] = useState('');

  // Section 2: Stipend
  const [stipendAmount, setStipendAmount] = useState<number | ''>('');
  const [stipendVisible, setStipendVisible] = useState(true);
  const [performanceBonus, setPerformanceBonus] = useState(false);
  const [bonusDescription, setBonusDescription] = useState('');
  const [otherCompensation, setOtherCompensation] = useState('');

  // Section 3: Requirements
  const [minEducation, setMinEducation] = useState('');
  const [preferredBranch, setPreferredBranch] = useState('');
  const [minCgpa, setMinCgpa] = useState<number | ''>('');
  const [yearOfStudy, setYearOfStudy] = useState('Any');
  const [requiredSkills, setRequiredSkills] = useState<string[]>(config.requiredSkills || []);
  const [goodSkills, setGoodSkills] = useState<string[]>(config.goodToHaveSkills || []);
  const [portfolioRequired, setPortfolioRequired] = useState(false);
  const [assignmentRound, setAssignmentRound] = useState(false);
  const [assignmentDescription, setAssignmentDescription] = useState('');
  const [certifications, setCertifications] = useState('');

  // Section 4: Job Description
  const [rolesResponsibilities, setRolesResponsibilities] = useState('');
  const [whatWillLearn, setWhatWillLearn] = useState('');
  const [perksBenefits, setPerksBenefits] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');

  // Section 5: Custom Screening Questions
  const [screening1, setScreening1] = useState('');
  const [screening2, setScreening2] = useState('');
  const [screening3, setScreening3] = useState('');

  // Section 6: Post Settings
  const [status, setStatus] = useState('Draft');
  const [scheduleDate, setScheduleDate] = useState('');
  const [notifyTeam, setNotifyTeam] = useState(false);

  // Tag inputs state
  const [reqSkillInput, setReqSkillInput] = useState('');
  const [goodSkillInput, setGoodSkillInput] = useState('');

  // Submission/Error/Accordion States
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    overview: true,
    stipend: true,
    requirements: true,
    description: true,
    screening: true,
    settings: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Skill Handlers
  const handleAddReqSkill = () => {
    const skill = reqSkillInput.trim();
    if (skill && !requiredSkills.includes(skill)) {
      setRequiredSkills([...requiredSkills, skill]);
    }
    setReqSkillInput('');
  };

  const handleRemoveReqSkill = (skill: string) => {
    setRequiredSkills(requiredSkills.filter((s) => s !== skill));
  };

  const handleAddGoodSkill = () => {
    const skill = goodSkillInput.trim();
    if (skill && !goodSkills.includes(skill)) {
      setGoodSkills([...goodSkills, skill]);
    }
    setGoodSkillInput('');
  };

  const handleRemoveGoodSkill = (skill: string) => {
    setGoodSkills(goodSkills.filter((s) => s !== skill));
  };

  // Form Validation
  const validateForm = () => {
    const tempErrors: Record<string, string> = {};

    if (!jobTitle.trim()) tempErrors.jobTitle = 'Job title is required';
    if (department === 'Custom' && !customDept.trim()) tempErrors.customDept = 'Department name is required';
    if (department === 'Custom' && !customRole.trim()) tempErrors.role = 'Role / Position name is required';
    if (!openings || Number(openings) <= 0) tempErrors.openings = 'Number of openings must be greater than 0';
    if (duration === 'Custom' && !customDuration.trim()) tempErrors.customDuration = 'Please specify custom duration';
    if ((workMode === 'In-office' || workMode === 'Hybrid') && !officeLocation.trim()) {
      tempErrors.officeLocation = 'Office location is required for In-office or Hybrid mode';
    }
    if (!deadline) tempErrors.deadline = 'Application deadline is required';
    if (!joiningDate) tempErrors.joiningDate = 'Expected joining date is required';
    if (!stipendAmount || Number(stipendAmount) < 0) tempErrors.stipendAmount = 'Stipend amount is required';
    if (performanceBonus && !bonusDescription.trim()) tempErrors.bonusDescription = 'Please describe the performance bonus';
    if (!minEducation.trim()) tempErrors.minEducation = 'Minimum education is required';
    if (!preferredBranch.trim()) tempErrors.preferredBranch = 'Preferred branch/stream is required';
    if (requiredSkills.length === 0) tempErrors.requiredSkills = 'At least one required skill is needed';
    if (assignmentRound && !assignmentDescription.trim()) tempErrors.assignmentDescription = 'Please describe the assignment round';
    if (!rolesResponsibilities.trim()) tempErrors.rolesResponsibilities = 'Roles & responsibilities are required';
    if (!whatWillLearn.trim()) tempErrors.whatWillLearn = 'Please describe what the intern will learn';
    if (!perksBenefits.trim()) tempErrors.perksBenefits = 'Perks & benefits are required';
    if (status === 'Schedule' && !scheduleDate) tempErrors.scheduleDate = 'Schedule date is required';

    setErrors(tempErrors);

    // Expand sections with errors
    if (Object.keys(tempErrors).length > 0) {
      const newExpanded = { ...expandedSections };
      if (tempErrors.jobTitle || tempErrors.customDept || tempErrors.role || tempErrors.openings || tempErrors.customDuration || tempErrors.officeLocation || tempErrors.deadline || tempErrors.joiningDate) {
        newExpanded.overview = true;
      }
      if (tempErrors.stipendAmount || tempErrors.bonusDescription) {
        newExpanded.stipend = true;
      }
      if (tempErrors.minEducation || tempErrors.preferredBranch || tempErrors.requiredSkills || tempErrors.assignmentDescription) {
        newExpanded.requirements = true;
      }
      if (tempErrors.rolesResponsibilities || tempErrors.whatWillLearn || tempErrors.perksBenefits) {
        newExpanded.description = true;
      }
      if (tempErrors.scheduleDate) {
        newExpanded.settings = true;
      }
      setExpandedSections(newExpanded);

      // Scroll to the first error element
      const firstErrorKey = Object.keys(tempErrors)[0];
      const errorEl = document.getElementById(firstErrorKey);
      if (errorEl) {
        errorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    return Object.keys(tempErrors).length === 0;
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const payload = {
        job_title: jobTitle,
        role: department === 'Custom' ? customRole : role,
        department: department === 'Custom' ? customDept : department,
        employment_type: 'Internship',
        candidate_level: null,
        number_of_openings: Number(openings),
        internship_duration: duration === 'Custom' ? customDuration : duration,
        work_mode: workMode,
        office_location: officeLocation || null,
        shift_timing: null,
        application_deadline: deadline,
        expected_joining_date: joiningDate,
        stipend_amount: Number(stipendAmount),
        stipend_visible: stipendVisible,
        ctc_min: null,
        ctc_max: null,
        salary_visible: true,
        probation_period: null,
        probation_stipend: null,
        notice_period: null,
        performance_bonus: performanceBonus,
        performance_bonus_description: performanceBonus ? bonusDescription : null,
        other_compensation: otherCompensation || null,
        min_education: minEducation,
        preferred_branch: preferredBranch,
        min_cgpa: minCgpa ? parseFloat(minCgpa.toString()) : null,
        year_of_study: yearOfStudy,
        graduation_year: null,
        min_experience: null,
        max_experience: null,
        required_skills: requiredSkills,
        good_to_have_skills: goodSkills,
        portfolio_required: portfolioRequired,
        assignment_round: assignmentRound,
        assignment_description: assignmentRound ? assignmentDescription : null,
        certifications: certifications || null,
        previous_industry_experience: null,
        led_team: null,
        roles_responsibilities: rolesResponsibilities,
        what_intern_learns: whatWillLearn,
        what_we_offer: null,
        growth_path: null,
        team_structure: null,
        perks_benefits: perksBenefits,
        additional_info: additionalInfo || null,
        screening_question_1: screening1 || null,
        screening_question_2: screening2 || null,
        screening_question_3: screening3 || null,
        status: status,
        scheduled_date: status === 'Schedule' ? scheduleDate : null,
        notify_team: notifyTeam,
      };

      await api.post('/jobs/create/', payload);
      setSubmitSuccess(true);
      setTimeout(() => {
        router.push('/dashboard/jobs');
      }, 2000);
    } catch (err: any) {
      console.error('Failed to create job:', err);
      alert(err.response?.data ? JSON.stringify(err.response.data) : 'Failed to save job. Check inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      {/* Toast Success Popup */}
      <AnimatePresence>
        {submitSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 24 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-0 left-1/2 -translate-x-1/2 z-[100] bg-gradient-to-r from-[#FF5A2C] to-[#FF7A4A] text-white px-6 py-4 rounded-xl shadow-[0_0_30px_rgba(255,90,31,0.5)] flex items-center gap-3 font-semibold border border-white/20"
          >
            <Check className="w-5 h-5 bg-white text-[#FF5A2C] rounded-full p-0.5" />
            Job posted successfully! Redirecting...
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SECTION 1: Job Overview */}
        <div className="bg-[#141414] border border-white/[0.08] rounded-2xl overflow-hidden shadow-lg transition-all duration-300">
          <div
            onClick={() => toggleSection('overview')}
            className="px-6 py-4 flex items-center justify-between border-b border-white/[0.05] cursor-pointer hover:bg-white/[0.02]"
          >
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-lg bg-[#FF5A2C]/10 text-[#FF5A2C] flex items-center justify-center text-sm font-bold">1</span>
              <h3 className="font-bold text-white text-lg">Section 1 — Job Overview</h3>
            </div>
            <ChevronDown className={`w-5 h-5 text-white/50 transition-transform duration-300 ${expandedSections.overview ? 'rotate-180' : ''}`} />
          </div>

          <AnimatePresence initial={false}>
            {expandedSections.overview && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-6 space-y-4">
                  {/* Job Title */}
                  <div id="jobTitle">
                    <label className="block text-sm font-semibold text-white/80 mb-2">Job Title *</label>
                    <input
                      type="text"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="e.g. Node.js Developer Intern"
                      className={`w-full bg-white/[0.05] border rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 transition-all ${
                        errors.jobTitle ? 'border-red-500 focus:ring-red-500/30' : 'border-white/[0.08] focus:ring-[#FF5A2C]/30 focus:border-[#FF5A2C]'
                      }`}
                    />
                    {errors.jobTitle && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.jobTitle}</p>}
                  </div>

                  {/* Role and Department */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div id="role">
                      <label className="block text-sm font-semibold text-white/80 mb-2">Role / Position Name *</label>
                      {department === 'Custom' ? (
                        <input
                          type="text"
                          value={customRole}
                          onChange={(e) => setCustomRole(e.target.value)}
                          placeholder="e.g. Software Engineer"
                          className={`w-full bg-white/[0.05] border rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 transition-all ${
                            errors.role ? 'border-red-500 focus:ring-red-500/30' : 'border-white/[0.08] focus:ring-[#FF5A2C]/30 focus:border-[#FF5A2C]'
                          }`}
                        />
                      ) : (
                        <select
                          value={role}
                          onChange={(e) => setRole(e.target.value)}
                          className="w-full bg-[#1A1A1A] border border-white/[0.08] rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#FF5A2C]/30 focus:border-[#FF5A2C] transition-all"
                        >
                          {config.roles.map((r) => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                      )}
                      {errors.role && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.role}</p>}
                    </div>

                    <div id="customDept">
                      <label className="block text-sm font-semibold text-white/80 mb-2">Department Name</label>
                      <input
                        type="text"
                        value={customDept}
                        onChange={(e) => setCustomDept(e.target.value)}
                        readOnly={department !== 'Custom'}
                        placeholder="Department"
                        className={`w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-3 text-white focus:outline-none transition-all ${
                          department === 'Custom'
                            ? errors.customDept
                              ? 'border-red-500 focus:ring-2 focus:ring-red-500/30'
                              : 'focus:ring-2 focus:ring-[#FF5A2C]/30 focus:border-[#FF5A2C]'
                            : 'opacity-60 cursor-not-allowed'
                        }`}
                      />
                      {errors.customDept && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.customDept}</p>}
                    </div>
                  </div>

                  {/* Employment Type and Openings */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-white/80 mb-2">Employment Type</label>
                      <input
                        type="text"
                        value="Internship"
                        readOnly
                        className="w-full bg-white/[0.03] border border-white/[0.05] rounded-xl px-4 py-3 text-white/60 cursor-not-allowed focus:outline-none"
                      />
                    </div>

                    <div id="openings">
                      <label className="block text-sm font-semibold text-white/80 mb-2">Number of Openings *</label>
                      <input
                        type="number"
                        min="1"
                        value={openings}
                        onChange={(e) => setOpenings(e.target.value ? Number(e.target.value) : '')}
                        placeholder="e.g. 5"
                        className={`w-full bg-white/[0.05] border rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 transition-all ${
                          errors.openings ? 'border-red-500 focus:ring-red-500/30' : 'border-white/[0.08] focus:ring-[#FF5A2C]/30 focus:border-[#FF5A2C]'
                        }`}
                      />
                      {errors.openings && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.openings}</p>}
                    </div>
                  </div>

                  {/* Duration and Work Mode */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-white/80 mb-2">Internship Duration *</label>
                      <div className="flex gap-2">
                        <select
                          value={duration}
                          onChange={(e) => setDuration(e.target.value)}
                          className="flex-1 bg-[#1A1A1A] border border-white/[0.08] rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#FF5A2C]/30 focus:border-[#FF5A2C] transition-all"
                        >
                          <option value="1 month">1 month</option>
                          <option value="2 months">2 months</option>
                          <option value="3 months">3 months</option>
                          <option value="6 months">6 months</option>
                          <option value="Custom">Custom</option>
                        </select>
                        {duration === 'Custom' && (
                          <div id="customDuration" className="flex-1">
                            <input
                              type="text"
                              value={customDuration}
                              onChange={(e) => setCustomDuration(e.target.value)}
                              placeholder="e.g. 4 months"
                              className={`w-full bg-white/[0.05] border rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 transition-all ${
                                errors.customDuration ? 'border-red-500 focus:ring-red-500/30' : 'border-white/[0.08] focus:ring-[#FF5A2C]/30 focus:border-[#FF5A2C]'
                              }`}
                            />
                          </div>
                        )}
                      </div>
                      {duration === 'Custom' && errors.customDuration && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.customDuration}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-white/80 mb-2">Work Mode *</label>
                      <select
                        value={workMode}
                        onChange={(e) => setWorkMode(e.target.value)}
                        className="w-full bg-[#1A1A1A] border border-white/[0.08] rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#FF5A2C]/30 focus:border-[#FF5A2C] transition-all"
                      >
                        <option value="Remote">Remote</option>
                        <option value="In-office">In-office</option>
                        <option value="Hybrid">Hybrid</option>
                      </select>
                    </div>
                  </div>

                  {/* Office Location (Conditional) */}
                  {(workMode === 'In-office' || workMode === 'Hybrid') && (
                    <div id="officeLocation">
                      <label className="block text-sm font-semibold text-white/80 mb-2">Office Location *</label>
                      <input
                        type="text"
                        value={officeLocation}
                        onChange={(e) => setOfficeLocation(e.target.value)}
                        placeholder="e.g. Bangalore, India (HQ)"
                        className={`w-full bg-white/[0.05] border rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 transition-all ${
                          errors.officeLocation ? 'border-red-500 focus:ring-red-500/30' : 'border-white/[0.08] focus:ring-[#FF5A2C]/30 focus:border-[#FF5A2C]'
                        }`}
                      />
                      {errors.officeLocation && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.officeLocation}</p>}
                    </div>
                  )}

                  {/* Application Deadline and Expected Joining Date */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div id="deadline">
                      <label className="block text-sm font-semibold text-white/80 mb-2">Application Deadline *</label>
                      <div className="relative">
                        <input
                          type="date"
                          value={deadline}
                          onChange={(e) => setDeadline(e.target.value)}
                          className={`w-full bg-[#1A1A1A] border rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 transition-all [color-scheme:dark] ${
                            errors.deadline ? 'border-red-500 focus:ring-red-500/30' : 'border-white/[0.08] focus:ring-[#FF5A2C]/30 focus:border-[#FF5A2C]'
                          }`}
                        />
                      </div>
                      {errors.deadline && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.deadline}</p>}
                    </div>

                    <div id="joiningDate">
                      <label className="block text-sm font-semibold text-white/80 mb-2">Expected Joining Date *</label>
                      <div className="relative">
                        <input
                          type="date"
                          value={joiningDate}
                          onChange={(e) => setJoiningDate(e.target.value)}
                          className={`w-full bg-[#1A1A1A] border rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 transition-all [color-scheme:dark] ${
                            errors.joiningDate ? 'border-red-500 focus:ring-red-500/30' : 'border-white/[0.08] focus:ring-[#FF5A2C]/30 focus:border-[#FF5A2C]'
                          }`}
                        />
                      </div>
                      {errors.joiningDate && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.joiningDate}</p>}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* SECTION 2: Stipend */}
        <div className="bg-[#141414] border border-white/[0.08] rounded-2xl overflow-hidden shadow-lg transition-all duration-300">
          <div
            onClick={() => toggleSection('stipend')}
            className="px-6 py-4 flex items-center justify-between border-b border-white/[0.05] cursor-pointer hover:bg-white/[0.02]"
          >
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-lg bg-[#FF5A2C]/10 text-[#FF5A2C] flex items-center justify-center text-sm font-bold">2</span>
              <h3 className="font-bold text-white text-lg">Section 2 — Stipend</h3>
            </div>
            <ChevronDown className={`w-5 h-5 text-white/50 transition-transform duration-300 ${expandedSections.stipend ? 'rotate-180' : ''}`} />
          </div>

          <AnimatePresence initial={false}>
            {expandedSections.stipend && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-6 space-y-4">
                  {/* Stipend Amount & Visibility */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                    <div id="stipendAmount">
                      <label className="block text-sm font-semibold text-white/80 mb-2">Stipend Amount (₹/month) *</label>
                      <input
                        type="number"
                        min="0"
                        value={stipendAmount}
                        onChange={(e) => setStipendAmount(e.target.value ? Number(e.target.value) : '')}
                        placeholder="e.g. 15000"
                        className={`w-full bg-white/[0.05] border rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 transition-all ${
                          errors.stipendAmount ? 'border-red-500 focus:ring-red-500/30' : 'border-white/[0.08] focus:ring-[#FF5A2C]/30 focus:border-[#FF5A2C]'
                        }`}
                      />
                      {errors.stipendAmount && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.stipendAmount}</p>}
                    </div>

                    <div className="flex items-center justify-between bg-white/[0.02] border border-white/[0.05] rounded-xl px-4 py-3">
                      <span className="text-sm font-medium text-white/80">Stipend visible to applicant?</span>
                      <button
                        type="button"
                        onClick={() => setStipendVisible(!stipendVisible)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
                          stipendVisible ? 'bg-[#FF5A2C]' : 'bg-white/10'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${stipendVisible ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>
                  </div>

                  {/* Performance Bonus Toggle */}
                  <div className="flex items-center justify-between bg-white/[0.02] border border-white/[0.05] rounded-xl px-4 py-3">
                    <span className="text-sm font-medium text-white/80">Performance bonus?</span>
                    <button
                      type="button"
                      onClick={() => setPerformanceBonus(!performanceBonus)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
                        performanceBonus ? 'bg-[#FF5A2C]' : 'bg-white/10'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${performanceBonus ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>

                  {/* Performance Bonus Description (Conditional) */}
                  {performanceBonus && (
                    <div id="bonusDescription">
                      <label className="block text-sm font-semibold text-white/80 mb-2">Describe Bonus Structure *</label>
                      <textarea
                        value={bonusDescription}
                        onChange={(e) => setBonusDescription(e.target.value)}
                        placeholder="Describe expectations and metrics for the performance bonus..."
                        rows={3}
                        className={`w-full bg-white/[0.05] border rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 transition-all ${
                          errors.bonusDescription ? 'border-red-500 focus:ring-red-500/30' : 'border-white/[0.08] focus:ring-[#FF5A2C]/30 focus:border-[#FF5A2C]'
                        }`}
                      />
                      {errors.bonusDescription && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.bonusDescription}</p>}
                    </div>
                  )}

                  {/* Other Compensation */}
                  <div>
                    <label className="block text-sm font-semibold text-white/80 mb-2">Other Compensation (Optional)</label>
                    <input
                      type="text"
                      value={otherCompensation}
                      onChange={(e) => setOtherCompensation(e.target.value)}
                      placeholder="e.g. Free meals, health benefits, travel allowance"
                      className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#FF5A2C]/30 focus:border-[#FF5A2C] transition-all"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* SECTION 3: Requirements */}
        <div className="bg-[#141414] border border-white/[0.08] rounded-2xl overflow-hidden shadow-lg transition-all duration-300">
          <div
            onClick={() => toggleSection('requirements')}
            className="px-6 py-4 flex items-center justify-between border-b border-white/[0.05] cursor-pointer hover:bg-white/[0.02]"
          >
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-lg bg-[#FF5A2C]/10 text-[#FF5A2C] flex items-center justify-center text-sm font-bold">3</span>
              <h3 className="font-bold text-white text-lg">Section 3 — Requirements</h3>
            </div>
            <ChevronDown className={`w-5 h-5 text-white/50 transition-transform duration-300 ${expandedSections.requirements ? 'rotate-180' : ''}`} />
          </div>

          <AnimatePresence initial={false}>
            {expandedSections.requirements && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-6 space-y-4">
                  {/* Min Education & Preferred Branch */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div id="minEducation">
                      <label className="block text-sm font-semibold text-white/80 mb-2">Minimum Education *</label>
                      <input
                        type="text"
                        value={minEducation}
                        onChange={(e) => setMinEducation(e.target.value)}
                        placeholder="e.g. B.Tech in CSE, BCA or related fields"
                        className={`w-full bg-white/[0.05] border rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 transition-all ${
                          errors.minEducation ? 'border-red-500 focus:ring-red-500/30' : 'border-white/[0.08] focus:ring-[#FF5A2C]/30 focus:border-[#FF5A2C]'
                        }`}
                      />
                      {errors.minEducation && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.minEducation}</p>}
                    </div>

                    <div id="preferredBranch">
                      <label className="block text-sm font-semibold text-white/80 mb-2">Preferred Branch / Stream *</label>
                      <input
                        type="text"
                        value={preferredBranch}
                        onChange={(e) => setPreferredBranch(e.target.value)}
                        placeholder="e.g. Computer Science, IT, Electronics"
                        className={`w-full bg-white/[0.05] border rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 transition-all ${
                          errors.preferredBranch ? 'border-red-500 focus:ring-red-500/30' : 'border-white/[0.08] focus:ring-[#FF5A2C]/30 focus:border-[#FF5A2C]'
                        }`}
                      />
                      {errors.preferredBranch && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.preferredBranch}</p>}
                    </div>
                  </div>

                  {/* Min CGPA and Year of Study */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-white/80 mb-2">Minimum CGPA (Optional)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="10"
                        value={minCgpa}
                        onChange={(e) => setMinCgpa(e.target.value ? Number(e.target.value) : '')}
                        placeholder="e.g. 7.5"
                        className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#FF5A2C]/30 focus:border-[#FF5A2C] transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-white/80 mb-2">Year of study *</label>
                      <select
                        value={yearOfStudy}
                        onChange={(e) => setYearOfStudy(e.target.value)}
                        className="w-full bg-[#1A1A1A] border border-white/[0.08] rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#FF5A2C]/30 focus:border-[#FF5A2C] transition-all"
                      >
                        <option value="1st">1st year</option>
                        <option value="2nd">2nd year</option>
                        <option value="3rd">3rd year</option>
                        <option value="Final year">Final year</option>
                        <option value="Any">Any</option>
                      </select>
                    </div>
                  </div>

                  {/* Required Skills Tag Input */}
                  <div id="requiredSkills">
                    <label className="block text-sm font-semibold text-white/80 mb-2">Required Skills *</label>
                    <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-3 space-y-2">
                      <div className="flex flex-wrap gap-2">
                        {requiredSkills.map((skill) => (
                          <span key={skill} className="inline-flex items-center gap-1 bg-[#FF5A2C] text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                            {skill}
                            <button type="button" onClick={() => handleRemoveReqSkill(skill)} className="hover:text-black transition-colors">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={reqSkillInput}
                          onChange={(e) => setReqSkillInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddReqSkill();
                            }
                          }}
                          placeholder="Type a skill and press Enter"
                          className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder:text-white/30 text-sm focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleAddReqSkill}
                          className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                    {errors.requiredSkills && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.requiredSkills}</p>}
                  </div>

                  {/* Good to have Skills Tag Input */}
                  <div>
                    <label className="block text-sm font-semibold text-white/80 mb-2">Good to have Skills (Optional)</label>
                    <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-3 space-y-2">
                      <div className="flex flex-wrap gap-2">
                        {goodSkills.map((skill) => (
                          <span key={skill} className="inline-flex items-center gap-1 bg-white/10 text-white/80 text-xs font-semibold px-2.5 py-1 rounded-full">
                            {skill}
                            <button type="button" onClick={() => handleRemoveGoodSkill(skill)} className="hover:text-[#FF5A2C] transition-colors">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={goodSkillInput}
                          onChange={(e) => setGoodSkillInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddGoodSkill();
                            }
                          }}
                          placeholder="Type a skill and press Enter"
                          className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder:text-white/30 text-sm focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleAddGoodSkill}
                          className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Portfolio required Toggle */}
                  <div className="flex items-center justify-between bg-white/[0.02] border border-white/[0.05] rounded-xl px-4 py-3">
                    <span className="text-sm font-medium text-white/80">{config.portfolioLabel || 'Portfolio / Work sample required?'}</span>
                    <button
                      type="button"
                      onClick={() => setPortfolioRequired(!portfolioRequired)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
                        portfolioRequired ? 'bg-[#FF5A2C]' : 'bg-white/10'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${portfolioRequired ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>

                  {/* Assignment Round Toggle */}
                  <div className="flex items-center justify-between bg-white/[0.02] border border-white/[0.05] rounded-xl px-4 py-3">
                    <span className="text-sm font-medium text-white/80">{config.assignmentLabel || 'Assignment round?'}</span>
                    <button
                      type="button"
                      onClick={() => setAssignmentRound(!assignmentRound)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
                        assignmentRound ? 'bg-[#FF5A2C]' : 'bg-white/10'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${assignmentRound ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>

                  {/* Assignment Round Description (Conditional) */}
                  {assignmentRound && (
                    <div id="assignmentDescription">
                      <label className="block text-sm font-semibold text-white/80 mb-2">Describe Assignment / Coding Round *</label>
                      <textarea
                        value={assignmentDescription}
                        onChange={(e) => setAssignmentDescription(e.target.value)}
                        placeholder="Provide description of the assignment or practical evaluation..."
                        rows={3}
                        className={`w-full bg-white/[0.05] border rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 transition-all ${
                          errors.assignmentDescription ? 'border-red-500 focus:ring-red-500/30' : 'border-white/[0.08] focus:ring-[#FF5A2C]/30 focus:border-[#FF5A2C]'
                        }`}
                      />
                      {errors.assignmentDescription && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.assignmentDescription}</p>}
                    </div>
                  )}

                  {/* Certifications */}
                  <div>
                    <label className="block text-sm font-semibold text-white/80 mb-2">Specific Certifications (Optional)</label>
                    <input
                      type="text"
                      value={certifications}
                      onChange={(e) => setCertifications(e.target.value)}
                      placeholder="e.g. AWS Certified Developer, Scrum Alliance, etc."
                      className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#FF5A2C]/30 focus:border-[#FF5A2C] transition-all"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* SECTION 4: Job Description */}
        <div className="bg-[#141414] border border-white/[0.08] rounded-2xl overflow-hidden shadow-lg transition-all duration-300">
          <div
            onClick={() => toggleSection('description')}
            className="px-6 py-4 flex items-center justify-between border-b border-white/[0.05] cursor-pointer hover:bg-white/[0.02]"
          >
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-lg bg-[#FF5A2C]/10 text-[#FF5A2C] flex items-center justify-center text-sm font-bold">4</span>
              <h3 className="font-bold text-white text-lg">Section 4 — Job Description</h3>
            </div>
            <ChevronDown className={`w-5 h-5 text-white/50 transition-transform duration-300 ${expandedSections.description ? 'rotate-180' : ''}`} />
          </div>

          <AnimatePresence initial={false}>
            {expandedSections.description && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-6 space-y-4">
                  {/* Roles and Responsibilities */}
                  <div id="rolesResponsibilities">
                    <label className="block text-sm font-semibold text-white/80 mb-2">Roles & Responsibilities *</label>
                    <textarea
                      value={rolesResponsibilities}
                      onChange={(e) => setRolesResponsibilities(e.target.value)}
                      placeholder="Detail the tasks, projects, and duties the intern will perform..."
                      rows={5}
                      className={`w-full bg-white/[0.05] border rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 transition-all ${
                        errors.rolesResponsibilities ? 'border-red-500 focus:ring-red-500/30' : 'border-white/[0.08] focus:ring-[#FF5A2C]/30 focus:border-[#FF5A2C]'
                      }`}
                    />
                    {errors.rolesResponsibilities && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.rolesResponsibilities}</p>}
                  </div>

                  {/* What Intern Will Learn */}
                  <div id="whatWillLearn">
                    <label className="block text-sm font-semibold text-white/80 mb-2">What the Intern will Learn *</label>
                    <textarea
                      value={whatWillLearn}
                      onChange={(e) => setWhatWillLearn(e.target.value)}
                      placeholder="Outline training, mentorship, skill acquisitions, and educational goals..."
                      rows={4}
                      className={`w-full bg-white/[0.05] border rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 transition-all ${
                        errors.whatWillLearn ? 'border-red-500 focus:ring-red-500/30' : 'border-white/[0.08] focus:ring-[#FF5A2C]/30 focus:border-[#FF5A2C]'
                      }`}
                    />
                    {errors.whatWillLearn && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.whatWillLearn}</p>}
                  </div>

                  {/* Perks and Benefits */}
                  <div id="perksBenefits">
                    <label className="block text-sm font-semibold text-white/80 mb-2">Perks & Benefits *</label>
                    <textarea
                      value={perksBenefits}
                      onChange={(e) => setPerksBenefits(e.target.value)}
                      placeholder="Detail working schedule flexibility, PPO options, certificates, merchandise, etc..."
                      rows={3}
                      className={`w-full bg-white/[0.05] border rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 transition-all ${
                        errors.perksBenefits ? 'border-red-500 focus:ring-red-500/30' : 'border-white/[0.08] focus:ring-[#FF5A2C]/30 focus:border-[#FF5A2C]'
                      }`}
                    />
                    {errors.perksBenefits && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.perksBenefits}</p>}
                  </div>

                  {/* Additional Info */}
                  <div>
                    <label className="block text-sm font-semibold text-white/80 mb-2">Additional Information (Optional)</label>
                    <textarea
                      value={additionalInfo}
                      onChange={(e) => setAdditionalInfo(e.target.value)}
                      placeholder="Any extra details, interview rounds, hiring notes..."
                      rows={3}
                      className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#FF5A2C]/30 focus:border-[#FF5A2C] transition-all"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* SECTION 5: Custom Screening Questions */}
        <div className="bg-[#141414] border border-white/[0.08] rounded-2xl overflow-hidden shadow-lg transition-all duration-300">
          <div
            onClick={() => toggleSection('screening')}
            className="px-6 py-4 flex items-center justify-between border-b border-white/[0.05] cursor-pointer hover:bg-white/[0.02]"
          >
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-lg bg-[#FF5A2C]/10 text-[#FF5A2C] flex items-center justify-center text-sm font-bold">5</span>
              <h3 className="font-bold text-white text-lg">Section 5 — Custom Screening Questions (Optional)</h3>
            </div>
            <ChevronDown className={`w-5 h-5 text-white/50 transition-transform duration-300 ${expandedSections.screening ? 'rotate-180' : ''}`} />
          </div>

          <AnimatePresence initial={false}>
            {expandedSections.screening && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-white/80 mb-2">Question 1</label>
                    <input
                      type="text"
                      value={screening1}
                      onChange={(e) => setScreening1(e.target.value)}
                      placeholder="e.g. Why do you want to join NukePC?"
                      className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#FF5A2C]/30 focus:border-[#FF5A2C] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-white/80 mb-2">Question 2</label>
                    <input
                      type="text"
                      value={screening2}
                      onChange={(e) => setScreening2(e.target.value)}
                      placeholder="e.g. Describe a challenging engineering project you built."
                      className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#FF5A2C]/30 focus:border-[#FF5A2C] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-white/80 mb-2">Question 3</label>
                    <input
                      type="text"
                      value={screening3}
                      onChange={(e) => setScreening3(e.target.value)}
                      placeholder="e.g. What is your preferred hardware layout or programming stack?"
                      className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#FF5A2C]/30 focus:border-[#FF5A2C] transition-all"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* SECTION 6: Post Settings */}
        <div className="bg-[#141414] border border-white/[0.08] rounded-2xl overflow-hidden shadow-lg transition-all duration-300">
          <div
            onClick={() => toggleSection('settings')}
            className="px-6 py-4 flex items-center justify-between border-b border-white/[0.05] cursor-pointer hover:bg-white/[0.02]"
          >
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-lg bg-[#FF5A2C]/10 text-[#FF5A2C] flex items-center justify-center text-sm font-bold">6</span>
              <h3 className="font-bold text-white text-lg">Section 6 — Post Settings</h3>
            </div>
            <ChevronDown className={`w-5 h-5 text-white/50 transition-transform duration-300 ${expandedSections.settings ? 'rotate-180' : ''}`} />
          </div>

          <AnimatePresence initial={false}>
            {expandedSections.settings && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-6 space-y-4">
                  {/* Status Selection and Schedule Date */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-white/80 mb-2">Post Status *</label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full bg-[#1A1A1A] border border-white/[0.08] rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#FF5A2C]/30 focus:border-[#FF5A2C] transition-all"
                      >
                        <option value="Draft">Draft</option>
                        <option value="Publish">Publish</option>
                        <option value="Schedule">Schedule</option>
                      </select>
                    </div>

                    {status === 'Schedule' && (
                      <div id="scheduleDate">
                        <label className="block text-sm font-semibold text-white/80 mb-2">Schedule Date & Time *</label>
                        <input
                          type="datetime-local"
                          value={scheduleDate}
                          onChange={(e) => setScheduleDate(e.target.value)}
                          className={`w-full bg-[#1A1A1A] border rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 transition-all [color-scheme:dark] ${
                            errors.scheduleDate ? 'border-red-500 focus:ring-red-500/30' : 'border-white/[0.08] focus:ring-[#FF5A2C]/30 focus:border-[#FF5A2C]'
                          }`}
                        />
                        {errors.scheduleDate && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.scheduleDate}</p>}
                      </div>
                    )}
                  </div>

                  {/* Notify team Toggle */}
                  <div className="flex items-center justify-between bg-white/[0.02] border border-white/[0.05] rounded-xl px-4 py-3">
                    <span className="text-sm font-medium text-white/80">Notify hiring team on new application?</span>
                    <button
                      type="button"
                      onClick={() => setNotifyTeam(!notifyTeam)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
                        notifyTeam ? 'bg-[#FF5A2C]' : 'bg-white/10'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${notifyTeam ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* BOTTOM ACTION BAR */}
        <div className="flex items-center justify-between pt-4 border-t border-white/[0.08]">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 px-5 py-3 rounded-xl border border-white/10 hover:bg-white/5 text-white/80 hover:text-white transition-all font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#FF5A2C] to-[#FF7A4A] text-white font-semibold hover:shadow-[0_0_20px_rgba(255,90,31,0.4)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving Job...
              </>
            ) : status === 'Draft' ? (
              'Save Draft'
            ) : status === 'Schedule' ? (
              'Schedule Post'
            ) : (
              'Publish Job'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
