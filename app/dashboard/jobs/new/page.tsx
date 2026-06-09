'use client';

import { useState, useRef } from 'react';
import { ArrowLeft, Plus, X, Calendar, Check, AlertCircle, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { api } from '@/services/auth';

type EmploymentType = 'internship' | 'fulltime' | null;
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
];

const TEMPLATES = {
  internship: [
    'Personal Information',
    'Education Details',
    'Resume Upload',
    'Skills',
    'Portfolio Links',
  ],
  fulltime: [
    'Personal Information',
    'Professional Experience',
    'Current CTC',
    'Expected CTC',
    'Resume Upload',
    'Notice Period',
  ],
  custom: ['Custom Application Form'],
};

// Custom Dropdown Component
const CustomSelect = ({ 
  name, 
  value, 
  onChange, 
  options, 
  placeholder = 'Select an option',
  label 
}: {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  label?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);
  const displayLabel = selectedOption?.label || placeholder;

  const handleSelect = (optValue: string) => {
    const event = {
      target: { name, value: optValue },
    } as React.ChangeEvent<HTMLSelectElement>;
    onChange(event);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative">
      {label && (
        <label className="block text-sm font-medium text-white mb-2">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#FF5A2C]/50 transition-all flex items-center justify-between hover:bg-white/[0.08]"
      >
        <span className={value ? 'text-white' : 'text-white/40'}>{displayLabel}</span>
        <ChevronDown 
          size={18} 
          className={`text-white/60 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a1a] border border-[#FF5A2C]/30 rounded-lg overflow-hidden z-50 max-h-48 overflow-y-auto shadow-lg"
          >
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                type="button"
                className={`w-full text-left px-4 py-3 transition-colors text-sm font-medium ${
                  value === option.value
                    ? 'bg-[#FF5A2C] text-white'
                    : 'text-white/80 hover:bg-white/[0.08] hover:text-white'
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

// Custom Checkbox Component
const CustomCheckbox = ({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) => {
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <div
        className={`w-5 h-5 rounded border-2 transition-all flex items-center justify-center ${
          checked
            ? 'bg-[#FF5A2C] border-[#FF5A2C]'
            : 'border-white/[0.3] group-hover:border-[#FF5A2C]/60'
        }`}
      >
        {checked && <Check size={16} className="text-white" />}
      </div>
      <span className="text-white/90 font-medium">{label}</span>
    </label>
  );
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
  const [customizeCheckboxes, setCustomizeCheckboxes] = useState({
    resume: true,
    coverLetter: true,
    portfolio: false,
    phone: false,
  });

  const skillInputRef = useRef<HTMLInputElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

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
      applicationTemplate: type ? (type as unknown as ApplicationTemplate) : prev.applicationTemplate,
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

  const handlePublish = async () => {
    setLoading(true);
    try {
      const payload = {
        title: formData.jobTitle,
        department: formData.department,
        location: formData.location,
        employment_type: formData.employmentType,
        description: formData.jobDescription,
        skills: formData.skills,
        min_salary: formData.minSalary ? parseFloat(formData.minSalary) : null,
        max_salary: formData.maxSalary ? parseFloat(formData.maxSalary) : null,
        salary_frequency: formData.salaryFrequency,
        application_deadline: formData.applicationDeadline || null,
        application_template: formData.applicationTemplate,
        customize_resume: customizeCheckboxes.resume,
        customize_cover_letter: customizeCheckboxes.coverLetter,
        customize_portfolio: customizeCheckboxes.portfolio,
        customize_phone: customizeCheckboxes.phone,
      };

      await api.post('/jobs/', payload);
      router.push('/dashboard/jobs');
    } catch (error) {
      console.error('Failed to publish job:', error);
      alert('Failed to publish job. Please try again.');
    } finally {
      setLoading(false);
    }
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
            className="bg-[#141414] border border-white/[0.08] rounded-2xl p-8 backdrop-blur-xl relative z-50"
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
                <CustomSelect
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  label="Department *"
                  placeholder="Select Department"
                  options={[
                    { value: '', label: 'Select Department' },
                    { value: 'Engineering', label: 'Engineering' },
                    { value: 'Design', label: 'Design' },
                    { value: 'Product', label: 'Product' },
                    { value: 'Marketing', label: 'Marketing' },
                    { value: 'Sales', label: 'Sales' },
                    { value: 'Data', label: 'Data' },
                    { value: 'HR', label: 'HR' },
                  ]}
                />
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
            className="bg-[#141414] border border-white/[0.08] rounded-2xl p-8 backdrop-blur-xl relative z-40"
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
            className="bg-[#141414] border border-white/[0.08] rounded-2xl p-8 backdrop-blur-xl relative z-30"
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

            {/* Skill Input with Dropdown */}
            <div className="relative z-20">
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

              {/* Suggestions Dropdown */}
              <AnimatePresence>
                {showSkillSuggestions && filteredSuggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a1a] border border-[#FF5A2C]/30 rounded-lg overflow-hidden z-50 max-h-48 overflow-y-auto shadow-lg"
                  >
                    {filteredSuggestions.map((skill) => (
                      <button
                        key={skill}
                        onClick={() => handleAddSkill(skill)}
                        className="w-full text-left px-4 py-3 hover:bg-[#FF5A2C]/20 text-white/80 hover:text-white transition-colors text-sm font-medium hover:bg-white/[0.08]"
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
            className="bg-[#141414] border border-white/[0.08] rounded-2xl p-8 backdrop-blur-xl relative z-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <h2 className="text-lg font-semibold text-white mb-6">
              Compensation
            </h2>

            {/* Salary Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Minimum Salary (₹ INR) *
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
                  Maximum Salary (₹ INR) *
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
          </motion.div>

          {/* Section 5: Application Settings */}
          <motion.div
            className="bg-[#141414] border border-white/[0.08] rounded-2xl p-8 backdrop-blur-xl relative z-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-lg font-semibold text-white mb-6">
              Application Settings
            </h2>

            {/* Application Deadline */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Application Deadline *
              </label>
              <div className="relative z-10">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={
                      formData.applicationDeadline
                        ? new Date(formData.applicationDeadline).toLocaleDateString('en-GB')
                        : ''
                    }
                    placeholder="DD/MM/YYYY"
                    readOnly
                    className="flex-1 bg-white/[0.05] border border-white/[0.08] rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#FF5A2C]/50 transition-all cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCalendar(!showCalendar)}
                    className="p-3 hover:bg-white/[0.08] rounded-lg transition-colors text-white/60 hover:text-white"
                  >
                    <Calendar size={20} />
                  </button>
                </div>

                {/* Calendar Dropdown */}
                <AnimatePresence>
                  {showCalendar && (
                    <motion.div
                      ref={calendarRef}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 mt-2 bg-[#1a1a1a] border border-[#FF5A2C]/30 rounded-lg p-4 z-50 w-80 shadow-lg"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-white font-semibold">{monthName}</h3>
                        <button
                          type="button"
                          onClick={() => setShowCalendar(false)}
                          className="text-white/60 hover:text-white transition-colors"
                        >
                          <X size={18} />
                        </button>
                      </div>

                      {/* Calendar Grid */}
                      <div className="grid grid-cols-7 gap-2">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                          <div key={day} className="text-center text-xs font-semibold text-white/50 py-2">
                            {day}
                          </div>
                        ))}
                        {calendarDays.map((day, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() =>
                              day && handleDateSelect(day.toISOString().split('T')[0])
                            }
                            disabled={!day}
                            className={`py-2 rounded text-sm font-medium transition-colors ${
                              !day
                                ? 'text-white/10'
                                : day.toDateString() === today.toDateString()
                                ? 'bg-[#FF5A2C] text-white'
                                : 'text-white/80 hover:bg-white/[0.08] hover:text-white'
                            }`}
                          >
                            {day?.getDate()}
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
            className="bg-[#141414] border border-white/[0.08] rounded-2xl p-8 backdrop-blur-xl relative z-[5]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <h2 className="text-lg font-semibold text-white mb-6">
              Candidate Requirements
            </h2>

            {/* Application Template */}
            <div>
              <label className="block text-sm font-medium text-white mb-3">
                Application Template *
              </label>
              <CustomSelect
                name="applicationTemplate"
                value={formData.applicationTemplate}
                onChange={handleInputChange}
                options={[
                  { value: 'internship', label: 'Internship Template' },
                  { value: 'fulltime', label: 'Full-Time Template' },
                  { value: 'custom', label: 'Custom Template' },
                ]}
              />
            </div>

            {/* Template Preview */}
            <div className="mt-6 p-4 bg-white/[0.03] border border-white/[0.08] rounded-lg">
              <p className="text-xs text-white/60 mb-3 font-semibold">
                Fields to be collected:
              </p>
              <div className="space-y-2">
                {(formData.applicationTemplate === 'custom'
                  ? [
                      'Personal Information',
                      ...(customizeCheckboxes.resume ? ['Resume Upload'] : []),
                      ...(customizeCheckboxes.coverLetter ? ['Cover Letter'] : []),
                      ...(customizeCheckboxes.portfolio ? ['Portfolio Link'] : []),
                      ...(customizeCheckboxes.phone ? ['Phone Number'] : []),
                    ]
                  : TEMPLATES[formData.applicationTemplate]
                ).map((field) => (
                  <div key={field} className="flex items-center gap-2">
                    <Check size={16} className="text-[#FF5A2C]" />
                    <span className="text-sm text-white/80">{field}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Customize Button */}
            <button
              type="button"
              onClick={() => setShowCustomizeModal(true)}
              className="mt-6 w-full bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] text-white font-medium py-3 rounded-lg transition-colors"
            >
              Customize Application Form
            </button>
          </motion.div>
        </div>

        {/* Right Sidebar */}
        <div className="lg:sticky lg:top-20 lg:h-fit px-8 py-8 space-y-6 max-h-fit">
          {/* Job Summary Card */}
          <motion.div
            className="bg-[#141414] border border-white/[0.08] rounded-2xl p-6 backdrop-blur-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="text-sm font-semibold text-white mb-4">Job Summary</h3>

            <div className="space-y-4 text-sm">
              <div>
                <p className="text-white/60 text-xs">Title</p>
                <p className="text-white font-medium truncate">
                  {formData.jobTitle || 'Not set'}
                </p>
              </div>
              <div>
                <p className="text-white/60 text-xs">Department</p>
                <p className="text-white font-medium">
                  {formData.department || 'Not set'}
                </p>
              </div>
              <div>
                <p className="text-white/60 text-xs">Salary Range</p>
                <p className="text-white font-medium">
                  {formData.minSalary && formData.maxSalary
                    ? `₹${parseInt(formData.minSalary).toLocaleString('en-IN')} - ₹${parseInt(formData.maxSalary).toLocaleString('en-IN')}`
                    : 'Not set'}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Publishing Checklist */}
          <motion.div
            className="bg-[#141414] border border-white/[0.08] rounded-2xl p-6 backdrop-blur-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
          >
            <h3 className="text-sm font-semibold text-white mb-4">
              Publishing Checklist
            </h3>

            {/* Progress Ring */}
            <div className="flex items-center justify-center mb-6">
              <svg width="120" height="120" className="">
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  stroke="rgba(255, 255, 255, 0.1)"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  stroke="#FF5A2C"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${(2 * Math.PI * 54 * completionPercentage) / 100} ${2 * Math.PI * 54}`}
                  strokeLinecap="round"
                  transform="rotate(-90 60 60)"
                  style={{ transition: 'stroke-dasharray 0.3s ease' }}
                />
                <text
                  x="60"
                  y="60"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-2xl font-bold fill-white"
                >
                  {completionPercentage}%
                </text>
              </svg>
            </div>

            {/* Checklist Items */}
            <div className="space-y-3">
              <div className={`flex items-center gap-2 ${formData.jobTitle ? 'text-white' : 'text-white/50'}`}>
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                  formData.jobTitle ? 'bg-[#FF5A2C] border-[#FF5A2C]' : 'border-white/[0.3]'
                }`}>
                  {formData.jobTitle && <Check size={12} className="text-white" />}
                </div>
                <span className="text-sm">Job title added</span>
              </div>

              <div className={`flex items-center gap-2 ${formData.jobDescription ? 'text-white' : 'text-white/50'}`}>
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                  formData.jobDescription ? 'bg-[#FF5A2C] border-[#FF5A2C]' : 'border-white/[0.3]'
                }`}>
                  {formData.jobDescription && <Check size={12} className="text-white" />}
                </div>
                <span className="text-sm">Description written</span>
              </div>

              <div className={`flex items-center gap-2 ${formData.skills.length > 0 ? 'text-white' : 'text-white/50'}`}>
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                  formData.skills.length > 0 ? 'bg-[#FF5A2C] border-[#FF5A2C]' : 'border-white/[0.3]'
                }`}>
                  {formData.skills.length > 0 && <Check size={12} className="text-white" />}
                </div>
                <span className="text-sm">Skills added</span>
              </div>

              <div className={`flex items-center gap-2 ${formData.applicationDeadline ? 'text-white' : 'text-white/50'}`}>
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                  formData.applicationDeadline ? 'bg-[#FF5A2C] border-[#FF5A2C]' : 'border-white/[0.3]'
                }`}>
                  {formData.applicationDeadline && <Check size={12} className="text-white" />}
                </div>
                <span className="text-sm">Deadline set</span>
              </div>

              <div className={`flex items-center gap-2 ${formData.minSalary && formData.maxSalary ? 'text-white' : 'text-white/50'}`}>
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                  formData.minSalary && formData.maxSalary ? 'bg-[#FF5A2C] border-[#FF5A2C]' : 'border-white/[0.3]'
                }`}>
                  {formData.minSalary && formData.maxSalary && <Check size={12} className="text-white" />}
                </div>
                <span className="text-sm">Salary set</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="sticky bottom-0 z-30 bg-[#0A0A0A]/90 backdrop-blur-xl border-t border-white/[0.08] px-8 py-4">
        <div className="flex items-center justify-between max-w-7xl">
          <div className="flex items-center gap-2">
            {lastSaved && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 text-xs text-[#FF5A2C]"
              >
                <Check size={14} />
                Saved
              </motion.div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleAutoSave}
              className="px-6 py-2 bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] text-white font-medium rounded-lg transition-colors"
            >
              Save Draft
            </button>
            <button
              type="button"
              className="px-6 py-2 bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] text-white font-medium rounded-lg transition-colors"
            >
              Preview
            </button>
            <button
              type="button"
              onClick={handlePublish}
              disabled={completionPercentage < 100 || loading}
              className={`px-6 py-2 font-medium rounded-lg transition-all ${
                completionPercentage === 100 && !loading
                  ? 'bg-[#FF5A2C] text-white hover:bg-[#FF7A4A]'
                  : 'bg-white/[0.05] text-white/50 cursor-not-allowed'
              }`}
            >
              {loading ? 'Publishing...' : 'Publish Job'}
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={() => setShowCustomizeModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#141414] border border-white/[0.08] rounded-2xl p-8 max-w-md w-full mx-4"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">
                  Customize Application Form
                </h2>
                <button
                  type="button"
                  onClick={() => setShowCustomizeModal(false)}
                  className="p-2 hover:bg-white/[0.08] rounded-lg transition-colors text-white/60 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Custom Checkboxes */}
              <div className="space-y-4 mb-6">
                <CustomCheckbox
                  checked={customizeCheckboxes.resume}
                  onChange={(checked) =>
                    setCustomizeCheckboxes((prev) => ({
                      ...prev,
                      resume: checked,
                    }))
                  }
                  label="Resume Upload"
                />
                <CustomCheckbox
                  checked={customizeCheckboxes.coverLetter}
                  onChange={(checked) =>
                    setCustomizeCheckboxes((prev) => ({
                      ...prev,
                      coverLetter: checked,
                    }))
                  }
                  label="Cover Letter"
                />
                <CustomCheckbox
                  checked={customizeCheckboxes.portfolio}
                  onChange={(checked) =>
                    setCustomizeCheckboxes((prev) => ({
                      ...prev,
                      portfolio: checked,
                    }))
                  }
                  label="Portfolio Link"
                />
                <CustomCheckbox
                  checked={customizeCheckboxes.phone}
                  onChange={(checked) =>
                    setCustomizeCheckboxes((prev) => ({
                      ...prev,
                      phone: checked,
                    }))
                  }
                  label="Phone Number"
                />
              </div>

              {/* Save Changes Button */}
              <button
                type="button"
                onClick={() => setShowCustomizeModal(false)}
                className="w-full bg-[#FF5A2C] hover:bg-[#FF7A4A] text-white font-bold py-3 rounded-lg transition-colors"
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
