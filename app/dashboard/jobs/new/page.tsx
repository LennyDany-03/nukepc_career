'use client';

import { useState, useRef } from 'react';
import { ArrowLeft, Plus, X, Calendar, Check, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

type EmploymentType = 'internship' | 'fulltime' | 'contract' | 'parttime' | null;
type ApplicationTemplate = 'internship' | 'fulltime' | 'custom';

interface JobFormData {
  jobTitle: string;
  department: string;
  location: string;
  employmentType: EmploymentType;
  jobDescription: string;
  skills: string[];
  minSalary: string;
  maxSalary: string;
  salaryFrequency: 'annual' | 'monthly';
  applicationDeadline: string;
  applicationTemplate: ApplicationTemplate;
}

const SKILL_SUGGESTIONS = [
  'React',
  'TypeScript',
  'Node.js',
  'Python',
  'JavaScript',
  'Next.js',
  'Vue.js',
  'Angular',
  'AWS',
  'Docker',
  'Kubernetes',
  'PostgreSQL',
  'MongoDB',
  'GraphQL',
  'REST API',
];

const EMPLOYMENT_TYPES = [
  { value: 'internship', label: 'Internship' },
  { value: 'fulltime', label: 'Full-Time' },
  { value: 'contract', label: 'Contract' },
  { value: 'parttime', label: 'Part-Time' },
];

const TEMPLATES = {
  internship: [
    '✓ Personal Information',
    '✓ Education Details',
    '✓ Resume Upload',
    '✓ Skills',
    '✓ Portfolio Links',
  ],
  fulltime: [
    '✓ Personal Information',
    '✓ Professional Experience',
    '✓ Current CTC',
    '✓ Expected CTC',
    '✓ Resume Upload',
    '✓ Notice Period',
  ],
  custom: ['Custom Application Form'],
};

export default function NewJobPage() {
  const [formData, setFormData] = useState<JobFormData>({
    jobTitle: '',
    department: '',
    location: '',
    employmentType: null,
    jobDescription: '',
    skills: [],
    minSalary: '',
    maxSalary: '',
    salaryFrequency: 'annual',
    applicationDeadline: '',
    applicationTemplate: 'fulltime',
  });

  const [skillInput, setSkillInput] = useState('');
  const [showSkillSuggestions, setShowSkillSuggestions] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const skillInputRef = useRef<HTMLInputElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Calculate completion percentage
  const completionSteps = [
    !!formData.jobTitle,
    !!formData.jobDescription,
    formData.skills.length > 0,
    !!formData.applicationDeadline,
    !!formData.minSalary && !!formData.maxSalary,
  ];
  const completionPercentage = Math.round(
    (completionSteps.filter(Boolean).length / completionSteps.length) * 100
  );

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle employment type
  const handleEmploymentTypeChange = (type: EmploymentType) => {
    setFormData((prev) => ({
      ...prev,
      employmentType: type,
    }));
  };

  // Handle skill input
  const handleSkillInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSkillInput(e.target.value);
    setShowSkillSuggestions(e.target.value.length > 0);
  };

  // Add skill
  const handleAddSkill = (skill: string) => {
    if (!skill.trim()) return;
    if (!formData.skills.includes(skill)) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, skill],
      }));
    }
    setSkillInput('');
    setShowSkillSuggestions(false);
    skillInputRef.current?.focus();
  };

  // Handle skill input key press
  const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill(skillInput);
    }
  };

  // Remove skill
  const handleRemoveSkill = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
  };

  // Get filtered suggestions
  const filteredSuggestions = SKILL_SUGGESTIONS.filter(
    (skill) =>
      skill.toLowerCase().includes(skillInput.toLowerCase()) &&
      !formData.skills.includes(skill)
  );

  // Format date for input
  const formatDateForInput = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toISOString().split('T')[0];
  };

  // Handle calendar date selection
  const handleDateSelect = (dateStr: string) => {
    setFormData((prev) => ({
      ...prev,
      applicationDeadline: dateStr,
    }));
    setShowCalendar(false);
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const calendarDays = generateCalendarDays();
  const today = new Date();
  const monthName = today.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Auto-save functionality
  const handleAutoSave = () => {
    setLastSaved(new Date());
    setTimeout(() => setLastSaved(null), 3000);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white overflow-x-hidden">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-white/[0.08] px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/jobs"
              className="p-2 hover:bg-white/[0.08] rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Post a New Job</h1>
              <p className="text-sm text-white/60 mt-1">
                Create and manage your job posting
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-0">
        {/* Main Content Area */}
        <div className="px-8 py-8 space-y-6 max-w-4xl">
          {/* Section 1: Job Information */}
          <motion.div
            className="bg-[#141414] border border-white/[0.08] rounded-2xl p-8 backdrop-blur-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-lg font-semibold text-white mb-6">
              Job Information
            </h2>

            {/* Job Title */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-white mb-2">
                Job Title *
              </label>
              <input
                type="text"
                name="jobTitle"
                value={formData.jobTitle}
                onChange={handleInputChange}
                placeholder="e.g., Senior React Developer"
                className="w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#FF5A2C]/50 transition-all"
              />
            </div>

            {/* Department & Location */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Department *
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className="w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#FF5A2C]/50 transition-all appearance-none"
                >
                  <option value="">Select Department</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Design">Design</option>
                  <option value="Product">Product</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                  <option value="Data">Data</option>
                  <option value="HR">HR</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g., Remote, San Francisco"
                  className="w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#FF5A2C]/50 transition-all"
                />
              </div>
            </div>

            {/* Employment Type - Segmented Controls */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-white mb-3">
                Employment Type *
              </label>
              <div className="flex gap-2 flex-wrap">
                {EMPLOYMENT_TYPES.map((type) => (
                  <button
                    key={type.value}
                    onClick={() =>
                      handleEmploymentTypeChange(
                        type.value as EmploymentType
                      )
                    }
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all border ${
                      formData.employmentType === type.value
                        ? 'bg-[#FF5A2C] text-white border-[#FF5A2C]'
                        : 'bg-white/[0.05] text-white/70 border-white/[0.08] hover:bg-white/[0.08]'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Section 2: Job Description */}
          <motion.div
            className="bg-[#141414] border border-white/[0.08] rounded-2xl p-8 backdrop-blur-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <h2 className="text-lg font-semibold text-white mb-6">
              Job Description
            </h2>

            {/* Rich Text Toolbar */}
            <div className="flex gap-2 mb-4 pb-4 border-b border-white/[0.08] flex-wrap">
              <button className="p-2 rounded hover:bg-white/[0.08] text-white/70 hover:text-white transition-colors"
                title="Bold">
                <span className="text-sm font-bold">B</span>
              </button>
              <button className="p-2 rounded hover:bg-white/[0.08] text-white/70 hover:text-white transition-colors"
                title="Italic">
                <span className="text-sm italic">I</span>
              </button>
              <div className="w-px bg-white/[0.08]" />
              <button className="p-2 rounded hover:bg-white/[0.08] text-white/70 hover:text-white transition-colors"
                title="Bullet List">
                <span className="text-sm">•</span>
              </button>
              <button className="p-2 rounded hover:bg-white/[0.08] text-white/70 hover:text-white transition-colors"
                title="Number List">
                <span className="text-sm">1.</span>
              </button>
              <button className="p-2 rounded hover:bg-white/[0.08] text-white/70 hover:text-white transition-colors"
                title="Heading">
                <span className="text-sm font-bold">H</span>
              </button>
            </div>

            <textarea
              name="jobDescription"
              value={formData.jobDescription}
              onChange={handleInputChange}
              placeholder="Write responsibilities, requirements, benefits, and about your company..."
              rows={8}
              className="w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#FF5A2C]/50 resize-none transition-all"
            />
          </motion.div>

          {/* Section 3: Required Skills */}
          <motion.div
            className="bg-[#141414] border border-white/[0.08] rounded-2xl p-8 backdrop-blur-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">
                Required Skills
              </h2>
              <span className="text-sm text-white/60 bg-white/[0.05] px-3 py-1 rounded-full">
                {formData.skills.length} skill{formData.skills.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Skills Display */}
            {formData.skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                <AnimatePresence>
                  {formData.skills.map((skill, index) => (
                    <motion.div
                      key={skill}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className="bg-[#FF5A2C] text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 hover:bg-[#FF7A4A] transition-colors"
                    >
                      {skill}
                      <button
                        onClick={() => handleRemoveSkill(index)}
                        className="hover:opacity-80 transition-opacity"
                        type="button"
                      >
                        <X size={14} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Skill Input - FIXED: Dropdown now only shows on focus with typing */}
            <div className="relative">
              <input
                ref={skillInputRef}
                type="text"
                value={skillInput}
                onChange={handleSkillInputChange}
                onKeyDown={handleSkillKeyDown}
                onFocus={() => skillInput.length > 0 && setShowSkillSuggestions(true)}
                placeholder="Type and press Enter to add skill"
                className="w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#FF5A2C]/50 transition-all"
              />

              {/* Suggestions Dropdown - Only shows when user is typing */}
              <AnimatePresence>
                {showSkillSuggestions && filteredSuggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a1a] border border-white/[0.08] rounded-lg overflow-hidden z-10 max-h-48 overflow-y-auto"
                  >
                    {filteredSuggestions.map((skill) => (
                      <button
                        key={skill}
                        onClick={() => handleAddSkill(skill)}
                        className="w-full text-left px-4 py-2 hover:bg-white/[0.08] text-white/80 hover:text-white transition-colors text-sm"
                        type="button"
                      >
                        {skill}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Section 4: Compensation */}
          <motion.div
            className="bg-[#141414] border border-white/[0.08] rounded-2xl p-8 backdrop-blur-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <h2 className="text-lg font-semibold text-white mb-6">
              Compensation
            </h2>

            {/* Salary Fields */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Minimum Salary (INR) *
                </label>
                <input
                  type="number"
                  name="minSalary"
                  value={formData.minSalary}
                  onChange={handleInputChange}
                  placeholder="0"
                  className="w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#FF5A2C]/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Maximum Salary (INR) *
                </label>
                <input
                  type="number"
                  name="maxSalary"
                  value={formData.maxSalary}
                  onChange={handleInputChange}
                  placeholder="0"
                  className="w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#FF5A2C]/50 transition-all"
                />
              </div>
            </div>

            {/* Frequency */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Frequency
              </label>
              <select
                name="salaryFrequency"
                value={formData.salaryFrequency}
                onChange={handleInputChange}
                className="w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#FF5A2C]/50 transition-all appearance-none"
              >
                <option value="annual">Annual</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </motion.div>

          {/* Section 5: Application Settings */}
          <motion.div
            className="bg-[#141414] border border-white/[0.08] rounded-2xl p-8 backdrop-blur-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-lg font-semibold text-white mb-6">
              Application Settings
            </h2>

            {/* Application Deadline - FIXED: Now has proper calendar picker */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Application Deadline *
              </label>
              <div className="relative">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={
                      formData.applicationDeadline
                        ? new Date(formData.applicationDeadline).toLocaleDateString(
                            'en-IN',
                            {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                            }
                          )
                        : ''
                    }
                    onChange={(e) => {
                      const dateStr = e.target.value;
                      if (dateStr) {
                        const parts = dateStr.split('-');
                        if (parts.length === 3) {
                          const date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
                          setFormData((prev) => ({
                            ...prev,
                            applicationDeadline: date.toISOString(),
                          }));
                        }
                      }
                    }}
                    placeholder="DD/MM/YYYY"
                    className="flex-1 bg-white/[0.05] border border-white/[0.08] rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#FF5A2C]/50 transition-all"
                  />
                  <button
                    onClick={() => setShowCalendar(!showCalendar)}
                    className="p-3 bg-white/[0.05] border border-white/[0.08] rounded-lg hover:bg-white/[0.08] transition-colors"
                    type="button"
                  >
                    <Calendar size={20} className="text-white/70" />
                  </button>
                </div>

                {/* Calendar Popup - FIXED: Now properly displays calendar */}
                <AnimatePresence>
                  {showCalendar && (
                    <motion.div
                      ref={calendarRef}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full right-0 mt-2 bg-[#1a1a1a] border border-white/[0.08] rounded-lg p-4 z-20 w-72"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-white font-medium text-sm">
                          {monthName}
                        </h3>
                        <button
                          onClick={() => setShowCalendar(false)}
                          className="text-white/50 hover:text-white transition-colors"
                          type="button"
                        >
                          <X size={18} />
                        </button>
                      </div>

                      {/* Calendar Grid */}
                      <div className="grid grid-cols-7 gap-1">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(
                          (day) => (
                            <div
                              key={day}
                              className="text-center text-white/50 text-xs font-medium py-2"
                            >
                              {day}
                            </div>
                          )
                        )}
                        {calendarDays.map((date, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              if (date) {
                                handleDateSelect(date.toISOString());
                              }
                            }}
                            disabled={!date}
                            className={`p-2 text-sm rounded transition-colors ${
                              !date
                                ? 'text-white/20'
                                : date.toDateString() ===
                                  new Date(
                                    formData.applicationDeadline || ''
                                  ).toDateString()
                                ? 'bg-[#FF5A2C] text-white font-medium'
                                : date < today
                                ? 'text-white/30 cursor-not-allowed'
                                : 'text-white hover:bg-white/[0.08]'
                            }`}
                            type="button"
                          >
                            {date?.getDate()}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* Section 6: Candidate Requirements */}
          <motion.div
            className="bg-[#141414] border border-white/[0.08] rounded-2xl p-8 backdrop-blur-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <h2 className="text-lg font-semibold text-white mb-6">
              Candidate Requirements
            </h2>

            {/* Application Template */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Application Template *
              </label>
              <select
                name="applicationTemplate"
                value={formData.applicationTemplate}
                onChange={handleInputChange}
                className="w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#FF5A2C]/50 transition-all appearance-none mb-4"
              >
                <option value="internship">Internship Template</option>
                <option value="fulltime">Full-Time Template</option>
                <option value="custom">Custom Form</option>
              </select>

              {/* Template Preview */}
              <div className="bg-white/[0.03] border border-white/[0.08] rounded-lg p-4 mb-4">
                <p className="text-sm text-white/60 mb-3">
                  Fields that will be collected:
                </p>
                <div className="space-y-2">
                  {TEMPLATES[formData.applicationTemplate].map((field, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 text-sm text-white/80"
                    >
                      <Check size={16} className="text-[#FF5A2C]" />
                      {field}
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setShowCustomizeModal(true)}
                className="w-full px-4 py-2 bg-white/[0.08] border border-white/[0.08] rounded-lg text-white/80 hover:bg-white/[0.12] transition-all text-sm font-medium"
                type="button"
              >
                Customize Application Form
              </button>
            </div>
          </motion.div>
        </div>

        {/* Right Sidebar */}
        <div className="hidden lg:flex lg:flex-col px-8 py-8 border-l border-white/[0.08] sticky top-24 h-fit gap-6">
          {/* Job Summary Card */}
          <motion.div
            className="bg-[#141414] border border-white/[0.08] rounded-2xl p-6 backdrop-blur-xl"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="text-sm font-semibold text-white mb-4">
              Job Summary
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-white/60">Position</p>
                <p className="text-white font-medium">
                  {formData.jobTitle || 'Not specified'}
                </p>
              </div>
              <div>
                <p className="text-white/60">Employment Type</p>
                <p className="text-white font-medium">
                  {EMPLOYMENT_TYPES.find((t) => t.value === formData.employmentType)
                    ?.label || 'Not selected'}
                </p>
              </div>
              <div>
                <p className="text-white/60">Salary Range</p>
                <p className="text-white font-medium">
                  {formData.minSalary && formData.maxSalary
                    ? `₹${parseInt(formData.minSalary).toLocaleString('en-IN')} - ₹${parseInt(formData.maxSalary).toLocaleString('en-IN')}`
                    : 'Not specified'}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Publishing Checklist */}
          <motion.div
            className="bg-[#141414] border border-white/[0.08] rounded-2xl p-6 backdrop-blur-xl"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.45 }}
          >
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-white">
                  Publishing Checklist
                </h3>
                <span className="text-xs font-medium text-[#FF5A2C]">
                  {completionPercentage}%
                </span>
              </div>
              <div className="w-full h-2 bg-white/[0.08] rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-[#FF5A2C]"
                  initial={{ width: 0 }}
                  animate={{ width: `${completionPercentage}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            <div className="space-y-2 text-sm">
              {[
                { label: 'Job Title', done: !!formData.jobTitle },
                {
                  label: 'Job Description',
                  done: !!formData.jobDescription,
                },
                { label: 'Required Skills', done: formData.skills.length > 0 },
                {
                  label: 'Application Deadline',
                  done: !!formData.applicationDeadline,
                },
                {
                  label: 'Compensation',
                  done: !!formData.minSalary && !!formData.maxSalary,
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 text-white/70"
                >
                  <div
                    className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                      item.done
                        ? 'bg-[#FF5A2C] border-[#FF5A2C]'
                        : 'border-white/[0.2]'
                    }`}
                  >
                    {item.done && <Check size={14} className="text-white" />}
                  </div>
                  <span className={item.done ? 'text-white' : ''}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="sticky bottom-0 z-50 bg-[#0A0A0A]/80 backdrop-blur-xl border-t border-white/[0.08] px-8 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            {lastSaved && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-2 text-xs text-white/60"
              >
                <Check size={14} className="text-[#FF5A2C]" />
                Auto-saved
              </motion.div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleAutoSave}
              className="px-6 py-2 bg-white/[0.08] border border-white/[0.08] rounded-lg text-white hover:bg-white/[0.12] transition-all font-medium text-sm"
            >
              Save Draft
            </button>
            <button
              className="px-6 py-2 bg-white/[0.08] border border-white/[0.08] rounded-lg text-white hover:bg-white/[0.12] transition-all font-medium text-sm"
            >
              Preview
            </button>
            <button
              disabled={completionPercentage < 100}
              className={`px-6 py-2 rounded-lg font-medium text-sm transition-all ${
                completionPercentage === 100
                  ? 'bg-[#FF5A2C] text-white hover:bg-[#FF7A4A]'
                  : 'bg-[#FF5A2C]/30 text-white/50 cursor-not-allowed'
              }`}
            >
              Publish
            </button>
          </div>
        </div>
      </div>

      {/* Customize Modal */}
      <AnimatePresence>
        {showCustomizeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowCustomizeModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#141414] border border-white/[0.08] rounded-2xl p-8 max-w-md w-full mx-4"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white">
                  Customize Application Form
                </h2>
                <button
                  onClick={() => setShowCustomizeModal(false)}
                  className="text-white/50 hover:text-white transition-colors"
                  type="button"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-3 mb-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                  <span className="text-white text-sm">Resume Upload</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                  <span className="text-white text-sm">Cover Letter</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4" />
                  <span className="text-white text-sm">Portfolio Link</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4" />
                  <span className="text-white text-sm">Phone Number</span>
                </label>
              </div>

              <button
                onClick={() => setShowCustomizeModal(false)}
                className="w-full px-4 py-2 bg-[#FF5A2C] text-white rounded-lg hover:bg-[#FF7A4A] transition-all font-medium"
              >
                Save Changes
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
