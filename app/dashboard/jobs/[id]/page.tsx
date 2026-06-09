'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Plus, X, Calendar, Check, AlertCircle, ChevronDown, Edit, Trash2, Eye, EyeOff, Globe } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
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
  status: 'draft' | 'published';
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

export default function JobDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
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
    status: 'draft',
  });

  const [skillInput, setSkillInput] = useState('');
  const [showSkillSuggestions, setShowSkillSuggestions] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [customizeCheckboxes, setCustomizeCheckboxes] = useState({
    resume: true,
    coverLetter: true,
    portfolio: false,
    phone: false,
  });

  const skillInputRef = useRef<HTMLInputElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Fetch job details
  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await api.get(`/jobs/${id}/`);
        const job = response.data;
        setFormData({
          jobTitle: job.title,
          department: job.department,
          location: job.location,
          employmentType: job.employment_type,
          jobDescription: job.description,
          skills: job.skills || [],
          minSalary: job.min_salary ? Math.round(parseFloat(job.min_salary)).toString() : '',
          maxSalary: job.max_salary ? Math.round(parseFloat(job.max_salary)).toString() : '',
          salaryFrequency: job.salary_frequency || 'annual',
          applicationDeadline: job.application_deadline || '',
          applicationTemplate: job.application_template || 'fulltime',
          status: job.status || 'published',
        });
        setCustomizeCheckboxes({
          resume: job.customize_resume,
          coverLetter: job.customize_cover_letter,
          portfolio: job.customize_portfolio,
          phone: job.customize_phone,
        });
      } catch (error) {
        console.error('Failed to fetch job details:', error);
        alert('Job not found or access denied.');
        router.push('/dashboard/jobs');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchJob();
    }
  }, [id, router]);

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

  const handleEmploymentTypeChange = (type: EmploymentType) => {
    setFormData((prev) => ({
      ...prev,
      employmentType: type,
      applicationTemplate: type ? (type as unknown as ApplicationTemplate) : prev.applicationTemplate,
    }));
  };

  const handleSkillInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSkillInput(e.target.value);
    setShowSkillSuggestions(e.target.value.length > 0);
  };

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

  const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill(skillInput);
    }
  };

  const handleRemoveSkill = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
  };

  const filteredSuggestions = SKILL_SUGGESTIONS.filter(
    (skill) =>
      skill.toLowerCase().includes(skillInput.toLowerCase()) &&
      !formData.skills.includes(skill)
  );

  const handleDateSelect = (dateStr: string) => {
    setFormData((prev) => ({
      ...prev,
      applicationDeadline: dateStr,
    }));
    setShowCalendar(false);
  };

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

  // Stacking completion check
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

  // Toggle Publish Status
  const handleTogglePublish = async () => {
    const nextStatus = formData.status === 'published' ? 'draft' : 'published';
    setSubmitting(true);
    try {
      await api.patch(`/jobs/${id}/`, { status: nextStatus });
      setFormData((prev) => ({ ...prev, status: nextStatus }));
    } catch (error) {
      console.error('Failed to change status:', error);
      alert('Failed to update status.');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Job
  const handleDeleteJob = async () => {
    if (!confirm('Are you sure you want to delete this job posting? This action cannot be undone.')) {
      return;
    }
    setSubmitting(true);
    try {
      await api.delete(`/jobs/${id}/`);
      router.push('/dashboard/jobs');
    } catch (error) {
      console.error('Failed to delete job:', error);
      alert('Failed to delete job.');
      setSubmitting(false);
    }
  };

  // Save changes (PUT)
  const handleSaveChanges = async () => {
    setSubmitting(true);
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
        status: formData.status,
        customize_resume: customizeCheckboxes.resume,
        customize_cover_letter: customizeCheckboxes.coverLetter,
        customize_portfolio: customizeCheckboxes.portfolio,
        customize_phone: customizeCheckboxes.phone,
      };

      await api.put(`/jobs/${id}/`, payload);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save changes:', error);
      alert('Failed to save changes. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getCustomFields = () => {
    const fields = ['Personal Information'];
    if (customizeCheckboxes.phone) fields.push('Phone Number');
    if (customizeCheckboxes.resume) fields.push('Resume Upload');
    if (customizeCheckboxes.coverLetter) fields.push('Cover Letter');
    if (customizeCheckboxes.portfolio) fields.push('Portfolio Link');
    return fields;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#FF5A1F] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white overflow-x-hidden">
      {/* Top Bar Navigation */}
      <div className="sticky top-0 z-40 bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-white/[0.08] px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/jobs"
            className="p-2 hover:bg-white/[0.08] rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold">{isEditing ? 'Edit Job Posting' : formData.jobTitle}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                formData.status === 'published'
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
              }`}>
                {formData.status}
              </span>
            </div>
            <p className="text-xs text-white/60 mt-0.5">
              {formData.department} • {formData.location}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-5 py-2 bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] text-white font-medium rounded-lg transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveChanges}
                disabled={completionPercentage < 100 || submitting}
                className="px-5 py-2 bg-[#FF5A2C] hover:bg-[#FF7A4A] text-white font-medium rounded-lg transition-colors text-sm flex items-center gap-1.5 disabled:opacity-50"
              >
                <Check size={16} />
                Save Changes
              </button>
            </>
          ) : (
            <>
              {/* Publish Toggle Button */}
              <button
                type="button"
                onClick={handleTogglePublish}
                disabled={submitting}
                className={`px-4 py-2 border rounded-lg font-medium transition-colors text-sm flex items-center gap-1.5 ${
                  formData.status === 'published'
                    ? 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20'
                    : 'border-green-500/30 bg-green-500/10 text-green-400 hover:bg-green-500/20'
                }`}
              >
                {formData.status === 'published' ? (
                  <>
                    <EyeOff size={16} />
                    Unpublish (Draft)
                  </>
                ) : (
                  <>
                    <Eye size={16} />
                    Publish Live
                  </>
                )}
              </button>
              
              {/* Edit Trigger */}
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] text-white font-medium rounded-lg transition-colors text-sm flex items-center gap-1.5"
              >
                <Edit size={16} />
                Edit
              </button>
              
              {/* Delete Trigger */}
              <button
                type="button"
                onClick={handleDeleteJob}
                disabled={submitting}
                className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-medium rounded-lg transition-colors text-sm flex items-center gap-1.5"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isEditing ? (
          /* ========================================================================= */
          /* EDITING MODE                                                              */
          /* ========================================================================= */
          <motion.div
            key="editing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-0"
          >
            {/* Main Form Fields */}
            <div className="px-8 py-8 space-y-6 max-w-4xl">
              {/* Card 1: Job Information */}
              <div className="bg-[#141414] border border-white/[0.08] rounded-2xl p-8 relative z-50">
                <h2 className="text-lg font-semibold text-white mb-6">Job Information</h2>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-white mb-2">Job Title *</label>
                  <input
                    type="text"
                    name="jobTitle"
                    value={formData.jobTitle}
                    onChange={handleInputChange}
                    placeholder="e.g., Senior React Developer"
                    className="w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#FF5A2C]/50 transition-all"
                  />
                </div>
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
                    <label className="block text-sm font-medium text-white mb-2">Location *</label>
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
                <div className="mt-4">
                  <label className="block text-sm font-medium text-white mb-3">Employment Type *</label>
                  <div className="flex gap-2 flex-wrap">
                    {EMPLOYMENT_TYPES.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => handleEmploymentTypeChange(type.value as EmploymentType)}
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
              </div>

              {/* Card 2: Job Description */}
              <div className="bg-[#141414] border border-white/[0.08] rounded-2xl p-8 relative z-40">
                <h2 className="text-lg font-semibold text-white mb-6">Job Description</h2>
                <textarea
                  name="jobDescription"
                  value={formData.jobDescription}
                  onChange={handleInputChange}
                  placeholder="Write responsibilities, requirements, benefits..."
                  rows={8}
                  className="w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#FF5A2C]/50 resize-none transition-all"
                />
              </div>

              {/* Card 3: Required Skills */}
              <div className="bg-[#141414] border border-white/[0.08] rounded-2xl p-8 relative z-30">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-white">Required Skills</h2>
                  <span className="text-sm text-white/60 bg-white/[0.05] px-3 py-1 rounded-full">
                    {formData.skills.length} skills
                  </span>
                </div>
                {formData.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {formData.skills.map((skill, index) => (
                      <div
                        key={skill}
                        className="bg-[#FF5A2C] text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2"
                      >
                        {skill}
                        <button type="button" onClick={() => handleRemoveSkill(index)}>
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="relative">
                  <input
                    ref={skillInputRef}
                    type="text"
                    value={skillInput}
                    onChange={handleSkillInputChange}
                    onKeyDown={handleSkillKeyDown}
                    placeholder="Type and press Enter to add skill"
                    className="w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#FF5A2C]/50 transition-all"
                  />
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
                            type="button"
                            onClick={() => handleAddSkill(skill)}
                            className="w-full text-left px-4 py-3 hover:bg-[#FF5A2C]/20 text-white/80 hover:text-white transition-colors text-sm font-medium hover:bg-white/[0.08]"
                          >
                            {skill}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Card 4: Compensation */}
              <div className="bg-[#141414] border border-white/[0.08] rounded-2xl p-8 relative z-20">
                <h2 className="text-lg font-semibold text-white mb-6">Compensation</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Minimum Salary (₹ INR) *</label>
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
                    <label className="block text-sm font-medium text-white mb-2">Maximum Salary (₹ INR) *</label>
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
              </div>

              {/* Card 5: Application Settings */}
              <div className="bg-[#141414] border border-white/[0.08] rounded-2xl p-8 relative z-10">
                <h2 className="text-lg font-semibold text-white mb-6">Application Settings</h2>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Application Deadline *</label>
                  <div className="relative z-10 flex items-center gap-2">
                    <input
                      type="text"
                      value={formData.applicationDeadline ? new Date(formData.applicationDeadline).toLocaleDateString('en-GB') : ''}
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
                  <AnimatePresence>
                    {showCalendar && (
                      <motion.div
                        ref={calendarRef}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute mt-2 bg-[#1a1a1a] border border-[#FF5A2C]/30 rounded-lg p-4 z-50 w-80 shadow-lg"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-white font-semibold">{monthName}</h3>
                          <button type="button" onClick={() => setShowCalendar(false)} className="text-white/60">
                            <X size={18} />
                          </button>
                        </div>
                        <div className="grid grid-cols-7 gap-2">
                          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                            <div key={d} className="text-center text-xs font-semibold text-white/50 py-2">{d}</div>
                          ))}
                          {calendarDays.map((day, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => day && handleDateSelect(day.toISOString().split('T')[0])}
                              disabled={!day}
                              className={`py-2 rounded text-sm font-medium transition-colors ${
                                !day
                                  ? 'text-white/10'
                                  : day.toDateString() === today.toDateString()
                                  ? 'bg-[#FF5A2C] text-white'
                                  : 'text-white/80 hover:bg-white/[0.08]'
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

              {/* Card 6: Candidate Requirements */}
              <div className="bg-[#141414] border border-white/[0.08] rounded-2xl p-8 relative z-[5]">
                <h2 className="text-lg font-semibold text-white mb-6">Candidate Requirements</h2>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-white mb-3">Application Template *</label>
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
                <div className="p-4 bg-white/[0.03] border border-white/[0.08] rounded-lg">
                  <p className="text-xs text-white/60 mb-3 font-semibold">Fields to be collected:</p>
                  <div className="space-y-2">
                    {(formData.applicationTemplate === 'custom'
                      ? getCustomFields()
                      : TEMPLATES[formData.applicationTemplate]
                    ).map((field) => (
                      <div key={field} className="flex items-center gap-2">
                        <Check size={16} className="text-[#FF5A2C]" />
                        <span className="text-sm text-white/80">{field}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowCustomizeModal(true)}
                  className="mt-6 w-full bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] py-3 rounded-lg text-sm font-medium transition-colors"
                >
                  Customize Application Form
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          /* ========================================================================= */
          /* VIEW DETAILS MODE                                                         */
          /* ========================================================================= */
          <motion.div
            key="viewing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-8 max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8"
          >
            {/* Left Column - Details */}
            <div className="space-y-6">
              {/* Job Basics */}
              <div className="bg-[#141414] border border-white/[0.08] rounded-2xl p-8">
                <span className="text-[#FF5A2C] font-semibold text-sm uppercase tracking-wider block mb-2">{formData.department}</span>
                <h2 className="text-3xl font-bold text-white mb-4">{formData.jobTitle}</h2>
                <div className="flex gap-4 flex-wrap text-sm text-white/60">
                  <div className="flex items-center gap-1.5">
                    <Globe size={16} className="text-[#FF5A2C]" />
                    {formData.location}
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1.5 uppercase font-medium">
                    {formData.employmentType || 'Not specified'}
                  </div>
                  <span>•</span>
                  <div>
                    Compensation: ₹{formData.minSalary ? parseInt(formData.minSalary).toLocaleString('en-IN') : '0'} - ₹{formData.maxSalary ? parseInt(formData.maxSalary).toLocaleString('en-IN') : '0'} ({formData.salaryFrequency})
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="bg-[#141414] border border-white/[0.08] rounded-2xl p-8">
                <h3 className="text-lg font-semibold text-white mb-4 border-b border-white/[0.08] pb-3">Job Description</h3>
                <div className="text-white/80 leading-relaxed whitespace-pre-wrap text-sm">
                  {formData.jobDescription || 'No description provided.'}
                </div>
              </div>

              {/* Skills */}
              <div className="bg-[#141414] border border-white/[0.08] rounded-2xl p-8">
                <h3 className="text-lg font-semibold text-white mb-4 border-b border-white/[0.08] pb-3">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {formData.skills && formData.skills.length > 0 ? (
                    formData.skills.map((skill) => (
                      <span key={skill} className="bg-white/[0.05] border border-white/[0.08] text-white px-4 py-2 rounded-full text-xs font-semibold">
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-white/40 text-sm">No skills specified.</span>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Status/Settings */}
            <div className="space-y-6">
              {/* Job settings / status */}
              <div className="bg-[#141414] border border-white/[0.08] rounded-2xl p-6 space-y-4">
                <h3 className="text-sm font-semibold text-white">Posting Status</h3>
                <div className="p-4 bg-white/[0.02] border border-white/[0.08] rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${formData.status === 'published' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]'}`} />
                    <span className="text-sm font-medium capitalize text-white/90">{formData.status}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleTogglePublish}
                    disabled={submitting}
                    className="text-xs text-[#FF5A2C] hover:underline"
                  >
                    Change to {formData.status === 'published' ? 'Draft' : 'Live'}
                  </button>
                </div>

                <div className="text-xs text-white/50 space-y-2 pt-2">
                  <div className="flex justify-between">
                    <span>Deadline:</span>
                    <span className="text-white font-medium">
                      {formData.applicationDeadline ? new Date(formData.applicationDeadline).toLocaleDateString() : 'No deadline'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Template:</span>
                    <span className="text-white font-medium capitalize">{formData.applicationTemplate}</span>
                  </div>
                </div>
              </div>

              {/* Candidates parameters preview */}
              <div className="bg-[#141414] border border-white/[0.08] rounded-2xl p-6">
                <h3 className="text-sm font-semibold text-white mb-4">Collected Candidate Fields</h3>
                <div className="space-y-2">
                  {(formData.applicationTemplate === 'custom'
                    ? getCustomFields()
                    : TEMPLATES[formData.applicationTemplate]
                  ).map((field) => (
                    <div key={field} className="flex items-center gap-2 text-sm text-white/70">
                      <Check size={14} className="text-[#FF5A2C]" />
                      <span>{field}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
                <h2 className="text-xl font-bold text-white">Customize Application Form</h2>
                <button
                  type="button"
                  onClick={() => setShowCustomizeModal(false)}
                  className="p-2 hover:bg-white/[0.08] rounded-lg transition-colors text-white/60 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <CustomCheckbox
                  checked={customizeCheckboxes.resume}
                  onChange={(checked) => setCustomizeCheckboxes((prev) => ({ ...prev, resume: checked }))}
                  label="Resume Upload"
                />
                <CustomCheckbox
                  checked={customizeCheckboxes.coverLetter}
                  onChange={(checked) => setCustomizeCheckboxes((prev) => ({ ...prev, coverLetter: checked }))}
                  label="Cover Letter"
                />
                <CustomCheckbox
                  checked={customizeCheckboxes.portfolio}
                  onChange={(checked) => setCustomizeCheckboxes((prev) => ({ ...prev, portfolio: checked }))}
                  label="Portfolio Link"
                />
                <CustomCheckbox
                  checked={customizeCheckboxes.phone}
                  onChange={(checked) => setCustomizeCheckboxes((prev) => ({ ...prev, phone: checked }))}
                  label="Phone Number"
                />
              </div>

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
