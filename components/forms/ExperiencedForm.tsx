'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, Plus, X, ArrowLeft, Loader2, Sparkles, Check, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/services/auth';
import { useTemplateConfig } from '@/hooks/useTemplateConfig';
import { useRouter } from 'next/navigation';
import PostSettings from '@/components/forms/PostSettings';

interface FormProps {
  department: string;
  employmentType: 'internship' | 'fulltime';
  candidateLevel: 'fresher' | 'experienced' | null;
  onBack: () => void;
}

export default function ExperiencedForm({ department, employmentType, candidateLevel, onBack }: FormProps) {
  const router = useRouter();
  const { config, loading: configLoading } = useTemplateConfig(department, 'experienced');

  // Form State
  const [jobTitle, setJobTitle] = useState('');
  const [role, setRole] = useState('');
  const [customRole, setCustomRole] = useState('');
  const [customDept, setCustomDept] = useState(department === 'Custom' ? '' : department);
  const [openings, setOpenings] = useState<number | ''>('');
  const [workMode, setWorkMode] = useState('Remote');
  const [officeLocation, setOfficeLocation] = useState('');
  const [shiftTiming, setShiftTiming] = useState('Flexible');
  const [deadline, setDeadline] = useState('');
  const [joiningDate, setJoiningDate] = useState('');

  // Section 2: Salary
  const [ctcMin, setCtcMin] = useState<number | ''>('');
  const [ctcMax, setCtcMax] = useState<number | ''>('');
  const [salaryVisible, setSalaryVisible] = useState(true);
  const [noticePeriod, setNoticePeriod] = useState('1 month');
  const [performanceBonus, setPerformanceBonus] = useState(false);
  const [bonusDescription, setBonusDescription] = useState('');
  const [otherCompensation, setOtherCompensation] = useState('');

  // Section 3: Requirements
  const [minExperience, setMinExperience] = useState<number | ''>('');
  const [maxExperience, setMaxExperience] = useState<number | ''>('');
  const [minEducation, setMinEducation] = useState('');
  const [preferredBranch, setPreferredBranch] = useState('');
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [goodSkills, setGoodSkills] = useState<string[]>([]);
  const [portfolioRequired, setPortfolioRequired] = useState(false);
  const [previousIndustry, setPreviousIndustry] = useState('');
  const [ledTeam, setLedTeam] = useState(false);
  const [assignmentRound, setAssignmentRound] = useState(false);
  const [assignmentDescription, setAssignmentDescription] = useState('');
  const [certifications, setCertifications] = useState('');

  // Section 4: Job Description
  const [rolesResponsibilities, setRolesResponsibilities] = useState('');
  const [teamStructure, setTeamStructure] = useState('');
  const [whatWeOffer, setWhatWeOffer] = useState('');
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
    salary: true,
    requirements: true,
    description: true,
    screening: true,
    settings: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  useEffect(() => {
    if (configLoading) return;
    setRole(config.roles[0] || '');
    setRequiredSkills([...config.required_skills]);
    setGoodSkills([...config.good_to_have_skills]);
    setScreening1(config.screening_question_1);
    setScreening2(config.screening_question_2);
    setScreening3(config.screening_question_3);
    if (config.shift_timing_options.length > 0) {
      setShiftTiming(
        config.shift_timing_options.includes('Flexible') ? 'Flexible' : config.shift_timing_options[0]
      );
    }
    if (config.notice_period_options.length > 0) {
      setNoticePeriod(
        config.notice_period_options.includes('1 month') ? '1 month' : config.notice_period_options[0]
      );
    }
  }, [config, configLoading]);

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
    if ((workMode === 'In-office' || workMode === 'Hybrid') && !officeLocation.trim()) {
      tempErrors.officeLocation = 'Office location is required for In-office or Hybrid mode';
    }
    if (!deadline) tempErrors.deadline = 'Application deadline is required';
    if (!joiningDate) tempErrors.joiningDate = 'Expected joining date is required';
    
    if (ctcMin === '' || Number(ctcMin) < 0) tempErrors.ctcMin = 'Minimum CTC is required';
    if (ctcMax === '' || Number(ctcMax) < 0) tempErrors.ctcMax = 'Maximum CTC is required';
    if (Number(ctcMin) > Number(ctcMax)) tempErrors.ctcMax = 'Maximum CTC must be greater than or equal to minimum CTC';
    if (performanceBonus && !bonusDescription.trim()) tempErrors.bonusDescription = 'Please describe the performance bonus';

    if (minExperience === '' || Number(minExperience) < 0) tempErrors.minExperience = 'Minimum experience is required';
    if (maxExperience !== '' && Number(maxExperience) < Number(minExperience)) {
      tempErrors.maxExperience = 'Maximum experience must be greater than or equal to minimum experience';
    }
    if (!minEducation.trim()) tempErrors.minEducation = 'Minimum education is required';
    if (requiredSkills.length === 0) tempErrors.requiredSkills = 'At least one required skill is needed';
    if (assignmentRound && !assignmentDescription.trim()) tempErrors.assignmentDescription = 'Please describe the assignment round';

    if (!rolesResponsibilities.trim()) tempErrors.rolesResponsibilities = 'Roles & responsibilities are required';
    if (!whatWeOffer.trim()) tempErrors.whatWeOffer = 'Please describe what NukePC offers';
    if (!perksBenefits.trim()) tempErrors.perksBenefits = 'Perks & benefits are required';
    
    if (status === 'Schedule' && !scheduleDate) tempErrors.scheduleDate = 'Schedule date is required';

    setErrors(tempErrors);

    // Expand sections with errors
    if (Object.keys(tempErrors).length > 0) {
      const newExpanded = { ...expandedSections };
      if (tempErrors.jobTitle || tempErrors.customDept || tempErrors.role || tempErrors.openings || tempErrors.officeLocation || tempErrors.deadline || tempErrors.joiningDate) {
        newExpanded.overview = true;
      }
      if (tempErrors.ctcMin || tempErrors.ctcMax || tempErrors.bonusDescription) {
        newExpanded.salary = true;
      }
      if (tempErrors.minExperience || tempErrors.maxExperience || tempErrors.minEducation || tempErrors.requiredSkills || tempErrors.assignmentDescription) {
        newExpanded.requirements = true;
      }
      if (tempErrors.rolesResponsibilities || tempErrors.whatWeOffer || tempErrors.perksBenefits) {
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
        employment_type: 'Full-time',
        candidate_level: 'Experienced',
        number_of_openings: Number(openings),
        internship_duration: null,
        work_mode: workMode,
        office_location: officeLocation || null,
        shift_timing: shiftTiming,
        application_deadline: deadline,
        expected_joining_date: joiningDate,
        stipend_amount: null,
        stipend_visible: false,
        ctc_min: Number(ctcMin),
        ctc_max: Number(ctcMax),
        salary_visible: salaryVisible,
        probation_period: null,
        probation_stipend: null,
        notice_period: noticePeriod,
        performance_bonus: performanceBonus,
        performance_bonus_description: performanceBonus ? bonusDescription : null,
        other_compensation: otherCompensation || null,
        min_education: minEducation,
        preferred_branch: preferredBranch || null,
        min_cgpa: null,
        year_of_study: null,
        graduation_year: null,
        min_experience: Number(minExperience),
        max_experience: maxExperience ? Number(maxExperience) : null,
        required_skills: requiredSkills,
        good_to_have_skills: goodSkills,
        portfolio_required: portfolioRequired,
        assignment_round: assignmentRound,
        assignment_description: assignmentRound ? assignmentDescription : null,
        certifications: certifications || null,
        previous_industry_experience: previousIndustry || null,
        led_team: ledTeam,
        roles_responsibilities: rolesResponsibilities,
        what_intern_learns: null,
        what_we_offer: whatWeOffer,
        growth_path: null,
        team_structure: teamStructure || null,
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
                      placeholder="e.g. Senior Backend Architect"
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
                          placeholder="e.g. Senior Component Specialist"
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

                  {/* Employment Type, Candidate Level and Openings */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-white/80 mb-2">Employment Type</label>
                      <input
                        type="text"
                        value="Full-time"
                        readOnly
                        className="w-full bg-white/[0.03] border border-white/[0.05] rounded-xl px-4 py-3 text-white/60 cursor-not-allowed focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-white/80 mb-2">Candidate Level</label>
                      <input
                        type="text"
                        value="Experienced"
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
                        placeholder="e.g. 2"
                        className={`w-full bg-white/[0.05] border rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 transition-all ${
                          errors.openings ? 'border-red-500 focus:ring-red-500/30' : 'border-white/[0.08] focus:ring-[#FF5A2C]/30 focus:border-[#FF5A2C]'
                        }`}
                      />
                      {errors.openings && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.openings}</p>}
                    </div>
                  </div>

                  {/* Work Mode, Shift Timing */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                    <div>
                      <label className="block text-sm font-semibold text-white/80 mb-2">Shift Timing *</label>
                      <select
                        value={shiftTiming}
                        onChange={(e) => setShiftTiming(e.target.value)}
                        className="w-full bg-[#1A1A1A] border border-white/[0.08] rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#FF5A2C]/30 focus:border-[#FF5A2C] transition-all"
                      >
                        {(config.shift_timing_options.length > 0
                          ? config.shift_timing_options
                          : ['Day', 'Flexible', 'Night', 'Rotational']
                        ).map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
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
                      <input
                        type="date"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                        className={`w-full bg-[#1A1A1A] border rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 transition-all [color-scheme:dark] ${
                          errors.deadline ? 'border-red-500 focus:ring-red-500/30' : 'border-white/[0.08] focus:ring-[#FF5A2C]/30 focus:border-[#FF5A2C]'
                        }`}
                      />
                      {errors.deadline && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.deadline}</p>}
                    </div>

                    <div id="joiningDate">
                      <label className="block text-sm font-semibold text-white/80 mb-2">Expected Joining Date *</label>
                      <input
                        type="date"
                        value={joiningDate}
                        onChange={(e) => setJoiningDate(e.target.value)}
                        className={`w-full bg-[#1A1A1A] border rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 transition-all [color-scheme:dark] ${
                          errors.joiningDate ? 'border-red-500 focus:ring-red-500/30' : 'border-white/[0.08] focus:ring-[#FF5A2C]/30 focus:border-[#FF5A2C]'
                        }`}
                      />
                      {errors.joiningDate && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.joiningDate}</p>}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* SECTION 2: Salary */}
        <div className="bg-[#141414] border border-white/[0.08] rounded-2xl overflow-hidden shadow-lg transition-all duration-300">
          <div
            onClick={() => toggleSection('salary')}
            className="px-6 py-4 flex items-center justify-between border-b border-white/[0.05] cursor-pointer hover:bg-white/[0.02]"
          >
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-lg bg-[#FF5A2C]/10 text-[#FF5A2C] flex items-center justify-center text-sm font-bold">2</span>
              <h3 className="font-bold text-white text-lg">Section 2 — Salary</h3>
            </div>
            <ChevronDown className={`w-5 h-5 text-white/50 transition-transform duration-300 ${expandedSections.salary ? 'rotate-180' : ''}`} />
          </div>

          <AnimatePresence initial={false}>
            {expandedSections.salary && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-6 space-y-4">
                  {/* CTC Range */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div id="ctcMin">
                      <label className="block text-sm font-semibold text-white/80 mb-2">CTC Min (LPA) *</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={ctcMin}
                        onChange={(e) => setCtcMin(e.target.value ? Number(e.target.value) : '')}
                        placeholder="e.g. 12.0"
                        className={`w-full bg-white/[0.05] border rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 transition-all ${
                          errors.ctcMin ? 'border-red-500 focus:ring-red-500/30' : 'border-white/[0.08] focus:ring-[#FF5A2C]/30 focus:border-[#FF5A2C]'
                        }`}
                      />
                      {errors.ctcMin && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.ctcMin}</p>}
                    </div>

                    <div id="ctcMax">
                      <label className="block text-sm font-semibold text-white/80 mb-2">CTC Max (LPA) *</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={ctcMax}
                        onChange={(e) => setCtcMax(e.target.value ? Number(e.target.value) : '')}
                        placeholder="e.g. 24.5"
                        className={`w-full bg-white/[0.05] border rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 transition-all ${
                          errors.ctcMax ? 'border-red-500 focus:ring-red-500/30' : 'border-white/[0.08] focus:ring-[#FF5A2C]/30 focus:border-[#FF5A2C]'
                        }`}
                      />
                      {errors.ctcMax && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.ctcMax}</p>}
                    </div>
                  </div>

                  {/* Salary Visibility & Notice Period */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between bg-white/[0.02] border border-white/[0.05] rounded-xl px-4 py-3 h-fit mt-7">
                      <span className="text-sm font-medium text-white/80">Salary visible to applicant?</span>
                      <button
                        type="button"
                        onClick={() => setSalaryVisible(!salaryVisible)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
                          salaryVisible ? 'bg-[#FF5A2C]' : 'bg-white/10'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${salaryVisible ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-white/80 mb-2">Notice Period Accepted *</label>
                      <select
                        value={noticePeriod}
                        onChange={(e) => setNoticePeriod(e.target.value)}
                        className="w-full bg-[#1A1A1A] border border-white/[0.08] rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#FF5A2C]/30 focus:border-[#FF5A2C] transition-all"
                      >
                        {(config.notice_period_options.length > 0
                          ? config.notice_period_options
                          : ['Immediate', '15 days', '1 month', '2 months', '3 months']
                        ).map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
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
                        placeholder="Provide details about performance metrics, quarterly goals, and annual scaling..."
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
                      placeholder="e.g. Stock options, components budget, health & gym membership benefits"
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
                  {/* Experience Range */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div id="minExperience">
                      <label className="block text-sm font-semibold text-white/80 mb-2">Minimum Experience (Years) *</label>
                      <input
                        type="number"
                        min="0"
                        value={minExperience}
                        onChange={(e) => setMinExperience(e.target.value ? Number(e.target.value) : '')}
                        placeholder="e.g. 3"
                        className={`w-full bg-white/[0.05] border rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 transition-all ${
                          errors.minExperience ? 'border-red-500 focus:ring-red-500/30' : 'border-white/[0.08] focus:ring-[#FF5A2C]/30 focus:border-[#FF5A2C]'
                        }`}
                      />
                      {errors.minExperience && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.minExperience}</p>}
                    </div>

                    <div id="maxExperience">
                      <label className="block text-sm font-semibold text-white/80 mb-2">Maximum Experience (Years) (Optional)</label>
                      <input
                        type="number"
                        min="0"
                        value={maxExperience}
                        onChange={(e) => setMaxExperience(e.target.value ? Number(e.target.value) : '')}
                        placeholder="e.g. 8"
                        className={`w-full bg-white/[0.05] border rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 transition-all ${
                          errors.maxExperience ? 'border-red-500 focus:ring-red-500/30' : 'border-white/[0.08] focus:ring-[#FF5A2C]/30 focus:border-[#FF5A2C]'
                        }`}
                      />
                      {errors.maxExperience && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.maxExperience}</p>}
                    </div>
                  </div>

                  {/* Min Education & Preferred Branch */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div id="minEducation">
                      <label className="block text-sm font-semibold text-white/80 mb-2">Minimum Education *</label>
                      <input
                        type="text"
                        value={minEducation}
                        onChange={(e) => setMinEducation(e.target.value)}
                        placeholder="e.g. Bachelor's in CS / IT or equivalent work experience"
                        className={`w-full bg-white/[0.05] border rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 transition-all ${
                          errors.minEducation ? 'border-red-500 focus:ring-red-500/30' : 'border-white/[0.08] focus:ring-[#FF5A2C]/30 focus:border-[#FF5A2C]'
                        }`}
                      />
                      {errors.minEducation && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.minEducation}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-white/80 mb-2">Preferred Branch / Stream (Optional)</label>
                      <input
                        type="text"
                        value={preferredBranch}
                        onChange={(e) => setPreferredBranch(e.target.value)}
                        placeholder="e.g. Computer Science, Computer Engineering"
                        className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#FF5A2C]/30 focus:border-[#FF5A2C] transition-all"
                      />
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
                    <span className="text-sm font-medium text-white/80">{config.portfolio_label || 'Portfolio / Work sample required?'}</span>
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

                  {/* Previous Industry Experience Preferred */}
                  <div>
                    <label className="block text-sm font-semibold text-white/80 mb-2">Previous Industry Experience Preferred (Optional)</label>
                    <input
                      type="text"
                      value={previousIndustry}
                      onChange={(e) => setPreviousIndustry(e.target.value)}
                      placeholder="e.g. E-commerce platforms, Gaming hardware industry, custom PC builds"
                      className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#FF5A2C]/30 focus:border-[#FF5A2C] transition-all"
                    />
                  </div>

                  {/* Led a Team Toggle */}
                  <div className="flex items-center justify-between bg-white/[0.02] border border-white/[0.05] rounded-xl px-4 py-3">
                    <span className="text-sm font-medium text-white/80">Led a team before?</span>
                    <button
                      type="button"
                      onClick={() => setLedTeam(!ledTeam)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
                        ledTeam ? 'bg-[#FF5A2C]' : 'bg-white/10'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${ledTeam ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>

                  {/* Assignment Round Toggle */}
                  <div className="flex items-center justify-between bg-white/[0.02] border border-white/[0.05] rounded-xl px-4 py-3">
                    <span className="text-sm font-medium text-white/80">{config.assignment_label || 'Assignment round?'}</span>
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
                      <label className="block text-sm font-semibold text-white/80 mb-2">Describe Assignment / Evaluation *</label>
                      <textarea
                        value={assignmentDescription}
                        onChange={(e) => setAssignmentDescription(e.target.value)}
                        placeholder="Provide details about the test structure, case study expectations, or repository review..."
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
                      placeholder="e.g. AWS Solutions Architect, PMP, Certified Scrum Master"
                      className="w-full bg-[#1A1A1A] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#FF5A2C]/30 focus:border-[#FF5A2C] transition-all"
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
                      placeholder="Explain the leadership metrics, design specifications, or deployment responsibilities..."
                      rows={5}
                      className={`w-full bg-white/[0.05] border rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 transition-all ${
                        errors.rolesResponsibilities ? 'border-red-500 focus:ring-red-500/30' : 'border-white/[0.08] focus:ring-[#FF5A2C]/30 focus:border-[#FF5A2C]'
                      }`}
                    />
                    {errors.rolesResponsibilities && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.rolesResponsibilities}</p>}
                  </div>

                  {/* Team Structure */}
                  <div>
                    <label className="block text-sm font-semibold text-white/80 mb-2">Team Structure (Optional)</label>
                    <textarea
                      value={teamStructure}
                      onChange={(e) => setTeamStructure(e.target.value)}
                      placeholder="Detail who they report to, peer distribution, number of direct reports, cross-team syncs..."
                      rows={3}
                      className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#FF5A2C]/30 focus:border-[#FF5A2C] transition-all"
                    />
                  </div>

                  {/* What We Offer */}
                  <div id="whatWeOffer">
                    <label className="block text-sm font-semibold text-white/80 mb-2">What We Offer *</label>
                    <textarea
                      value={whatWeOffer}
                      onChange={(e) => setWhatWeOffer(e.target.value)}
                      placeholder="High-performance workstation budget, research opportunities, competitive compensation, flexible policies..."
                      rows={4}
                      className={`w-full bg-white/[0.05] border rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 transition-all ${
                        errors.whatWeOffer ? 'border-red-500 focus:ring-red-500/30' : 'border-white/[0.08] focus:ring-[#FF5A2C]/30 focus:border-[#FF5A2C]'
                      }`}
                    />
                    {errors.whatWeOffer && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.whatWeOffer}</p>}
                  </div>

                  {/* Perks and Benefits */}
                  <div id="perksBenefits">
                    <label className="block text-sm font-semibold text-white/80 mb-2">Perks & Benefits *</label>
                    <textarea
                      value={perksBenefits}
                      onChange={(e) => setPerksBenefits(e.target.value)}
                      placeholder="Premium health covers, fitness programs, custom PC component access, annual global offsites..."
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
                      placeholder="Any secondary details, relocation packages, interview processes..."
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
                      placeholder="e.g. Describe your experience scaling an application architecture."
                      className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#FF5A2C]/30 focus:border-[#FF5A2C] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-white/80 mb-2">Question 2</label>
                    <input
                      type="text"
                      value={screening2}
                      onChange={(e) => setScreening2(e.target.value)}
                      placeholder="e.g. How do you lead engineering teams and navigate conflicting priorities?"
                      className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#FF5A2C]/30 focus:border-[#FF5A2C] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-white/80 mb-2">Question 3</label>
                    <input
                      type="text"
                      value={screening3}
                      onChange={(e) => setScreening3(e.target.value)}
                      placeholder="e.g. Provide a link to a medium post, project write-up, or case study you author."
                      className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#FF5A2C]/30 focus:border-[#FF5A2C] transition-all"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <PostSettings
          status={status}
          scheduleDate={scheduleDate}
          notifyTeam={notifyTeam}
          errors={errors}
          onStatusChange={setStatus}
          onScheduleDateChange={setScheduleDate}
          onNotifyTeamChange={setNotifyTeam}
        />

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
