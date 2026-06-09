'use client';

import { useState, useRef } from 'react';
import { ArrowLeft, Plus, X, Calendar, Check, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

type EmploymentType = 'internship' | 'fulltime' | 'contract' | 'parttime' | null;
type ApplicationVisibility = 'public' | 'internal' | 'referral';
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
  currency: 'USD' | 'INR' | 'EUR';
  applicationDeadline: string;
  applicationVisibility: ApplicationVisibility;
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
    currency: 'USD',
    applicationDeadline: '',
    applicationVisibility: 'public',
    applicationTemplate: 'fulltime',
  });

  const [skillInput, setSkillInput] = useState('');
  const [showSkillSuggestions, setShowSkillSuggestions] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const skillInputRef = useRef<HTMLInputElement>(null);

  // Calculate completion percentage
  const completionSteps = [
    !!formData.jobTitle,
    !!formData.jobDescription,
    formData.skills.length > 0,
    !!formData.applicationDeadline,
    formData.applicationTemplate !== '',
  ];
  const completionPercentage = Math.round(
    (completionSteps.filter(Boolean).length / completionSteps.length) * 100
  );

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddSkill = (skill: string) => {
    const trimmedSkill = skill.trim();
    if (
      trimmedSkill &&
      !formData.skills.includes(trimmedSkill) &&
      formData.skills.length < 20
    ) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, trimmedSkill],
      }));
      setSkillInput('');
      setShowSkillSuggestions(false);
    }
  };

  const handleRemoveSkill = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
  };

  const handleEmploymentTypeChange = (type: EmploymentType) => {
    setFormData((prev) => ({
      ...prev,
      employmentType: type,
    }));
  };

  const handleSaveDraft = () => {
    // Simulate save
    setLastSaved(new Date());
    setTimeout(() => setLastSaved(null), 3000);
  };

  const filteredSuggestions = SKILL_SUGGESTIONS.filter(
    (skill) =>
      skill.toLowerCase().includes(skillInput.toLowerCase()) &&
      !formData.skills.includes(skill)
  );

  return (
    <div className="min-h-screen bg-[#0A0A0A] p-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard/jobs"
          className="flex items-center gap-2 text-[#FF5A2C] hover:text-[#FF8A5B] transition-colors mb-4 font-medium text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Jobs
        </Link>
        <h1 className="text-4xl font-bold text-white mb-2">Create New Job</h1>
        <p className="text-white/60 text-sm">
          Create and publish a new job opening for candidates.
        </p>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
        {/* Main Editor */}
        <div className="space-y-6">
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
            <div className="space-y-6">
              {/* Job Title */}
              <div>
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
                    className="w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#FF5A2C]/50 transition-all"
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
              <div>
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
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Skill Input with Suggestions */}
            <div className="relative">
              <input
                ref={skillInputRef}
                type="text"
                value={skillInput}
                onChange={(e) => {
                  setSkillInput(e.target.value);
                  setShowSkillSuggestions(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill(skillInput);
                  }
                }}
                onFocus={() => setShowSkillSuggestions(true)}
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
                    className="absolute top-full left-0 right-0 mt-2 bg-[#1A1A1A] border border-white/[0.08] rounded-lg z-10 overflow-hidden"
                  >
                    {filteredSuggestions.map((skill) => (
                      <button
                        key={skill}
                        onClick={() => handleAddSkill(skill)}
                        className="w-full text-left px-4 py-2.5 hover:bg-white/[0.08] text-white text-sm transition-colors"
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
            <div className="space-y-4">
              {/* Salary Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Minimum Salary
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
                    Maximum Salary
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

              {/* Frequency & Currency */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Frequency
                  </label>
                  <select
                    name="salaryFrequency"
                    value={formData.salaryFrequency}
                    onChange={handleInputChange}
                    className="w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#FF5A2C]/50 transition-all"
                  >
                    <option value="annual">Annual</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Currency
                  </label>
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleInputChange}
                    className="w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#FF5A2C]/50 transition-all"
                  >
                    <option value="USD">$ USD</option>
                    <option value="INR">₹ INR</option>
                    <option value="EUR">€ EUR</option>
                  </select>
                </div>
              </div>
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
            <div className="space-y-6">
              {/* Application Deadline */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Application Deadline *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
                  <input
                    type="date"
                    name="applicationDeadline"
                    value={formData.applicationDeadline}
                    onChange={handleInputChange}
                    className="w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-4 py-3 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-[#FF5A2C]/50 transition-all"
                  />
                </div>
              </div>

              {/* Application Visibility */}
              <div>
                <label className="block text-sm font-medium text-white mb-3">
                  Application Visibility
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'public', label: 'Public', desc: 'Anyone can apply' },
                    { value: 'internal', label: 'Internal Only', desc: 'Company members only' },
                    {
                      value: 'referral',
                      label: 'Referral Only',
                      desc: 'Through referrals',
                    },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/[0.05] cursor-pointer transition-colors"
                    >
                      <input
                        type="radio"
                        name="applicationVisibility"
                        value={option.value}
                        checked={
                          formData.applicationVisibility ===
                          (option.value as ApplicationVisibility)
                        }
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            applicationVisibility: e.target
                              .value as ApplicationVisibility,
                          }))
                        }
                        className="w-4 h-4"
                      />
                      <div>
                        <div className="text-sm font-medium text-white">
                          {option.label}
                        </div>
                        <div className="text-xs text-white/50">
                          {option.desc}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
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

            {/* Application Template Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-white mb-3">
                Application Template *
              </label>
              <select
                value={formData.applicationTemplate}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    applicationTemplate: e.target
                      .value as ApplicationTemplate,
                  }))
                }
                className="w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#FF5A2C]/50 transition-all"
              >
                <option value="internship">Internship Template</option>
                <option value="fulltime">Full-Time Template</option>
                <option value="custom">Custom Template</option>
              </select>
            </div>

            {/* Template Summary */}
            <div className="bg-white/[0.02] border border-white/[0.08] rounded-lg p-4 mb-4">
              <div className="space-y-2">
                {TEMPLATES[formData.applicationTemplate].map((item, idx) => (
                  <div key={idx} className="text-sm text-white/70">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Customize Button */}
            <button
              onClick={() => setShowCustomizeModal(true)}
              className="w-full px-4 py-2 bg-white/[0.08] text-white rounded-lg hover:bg-white/[0.12] transition-colors text-sm font-medium"
            >
              Customize Application Form
            </button>
          </motion.div>

          {/* Section 7: Hiring Workflow */}
          <motion.div
            className="bg-[#141414] border border-white/[0.08] rounded-2xl p-8 backdrop-blur-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-lg font-semibold text-white mb-6">
              Hiring Workflow
            </h2>
            <div>
              <label className="block text-sm font-medium text-white mb-3">
                Select Workflow
              </label>
              <select
                className="w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#FF5A2C]/50 transition-all"
              >
                <option>Default Workflow</option>
              </select>
              <div className="mt-4 flex gap-2 flex-wrap">
                {['Applied', 'Screening', 'Interview', 'Assessment', 'Offer', 'Hired'].map(
                  (stage) => (
                    <div
                      key={stage}
                      className="px-3 py-2 bg-white/[0.05] border border-white/[0.08] rounded-lg text-sm text-white flex items-center gap-2 cursor-move hover:bg-white/[0.08] transition-colors"
                    >
                      <span>≡</span>
                      {stage}
                    </div>
                  )
                )}
              </div>
              <p className="text-xs text-white/50 mt-3">
                Drag and drop to reorder stages
              </p>
            </div>
          </motion.div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Job Summary Card */}
          <motion.div
            className="sticky top-8 bg-[#141414] border border-white/[0.08] rounded-2xl p-6 backdrop-blur-xl"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.45 }}
          >
            <h3 className="text-sm font-semibold text-white mb-4">
              Job Summary
            </h3>
            <div className="space-y-3">
              <div>
                <div className="text-xs text-white/50 mb-1">Title</div>
                <div className="text-sm font-medium text-white">
                  {formData.jobTitle || 'Not set'}
                </div>
              </div>
              <div>
                <div className="text-xs text-white/50 mb-1">Department</div>
                <div className="text-sm font-medium text-white">
                  {formData.department || 'Not set'}
                </div>
              </div>
              <div>
                <div className="text-xs text-white/50 mb-1">Location</div>
                <div className="text-sm font-medium text-white">
                  {formData.location || 'Not set'}
                </div>
              </div>
              <div>
                <div className="text-xs text-white/50 mb-1">Employment Type</div>
                <div className="text-sm font-medium text-white">
                  {formData.employmentType
                    ? formData.employmentType.charAt(0).toUpperCase() +
                      formData.employmentType.slice(1)
                    : 'Not set'}
                </div>
              </div>
              <div>
                <div className="text-xs text-white/50 mb-1">Required Skills</div>
                <div className="text-sm font-medium text-white">
                  {formData.skills.length} skill
                  {formData.skills.length !== 1 ? 's' : ''}
                </div>
              </div>
              {formData.minSalary && formData.maxSalary && (
                <div>
                  <div className="text-xs text-white/50 mb-1">Salary Range</div>
                  <div className="text-sm font-medium text-white">
                    {formData.currency} {formData.minSalary} - {formData.maxSalary}
                  </div>
                </div>
              )}
              {formData.applicationDeadline && (
                <div>
                  <div className="text-xs text-white/50 mb-1">Deadline</div>
                  <div className="text-sm font-medium text-white">
                    {new Date(
                      formData.applicationDeadline
                    ).toLocaleDateString()}
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Publishing Checklist */}
          <motion.div
            className="sticky top-64 bg-[#141414] border border-white/[0.08] rounded-2xl p-6 backdrop-blur-xl"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h3 className="text-sm font-semibold text-white mb-4">
              Publishing Checklist
            </h3>

            {/* Completion Ring */}
            <div className="flex items-center justify-center mb-6">
              <div className="relative w-24 h-24">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="text-white/[0.08]"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeDasharray={`${2 * Math.PI * 45}`}
                    strokeDashoffset={`${2 * Math.PI * 45 * (1 - completionPercentage / 100)}`}
                    className="text-[#FF5A2C] transition-all duration-500"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {completionPercentage}%
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Checklist Items */}
            <div className="space-y-2">
              {[
                { done: !!formData.jobTitle, label: 'Title Added' },
                { done: !!formData.jobDescription, label: 'Description Added' },
                { done: formData.skills.length > 0, label: 'Skills Added' },
                { done: !!formData.applicationDeadline, label: 'Deadline Selected' },
                {
                  done: formData.applicationTemplate !== '',
                  label: 'Template Selected',
                },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                      item.done
                        ? 'bg-[#FF5A2C] border-[#FF5A2C]'
                        : 'border-white/[0.2]'
                    }`}
                  >
                    {item.done && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <span
                    className={`text-sm ${
                      item.done ? 'text-white' : 'text-white/60'
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 bg-[#0A0A0A]/95 border-t border-white/[0.08] backdrop-blur-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
      >
        <div className="flex items-center justify-between px-8 py-4 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-2">
            {lastSaved ? (
              <div className="text-sm text-[#FF5A2C] flex items-center gap-1">
                <Check className="w-4 h-4" />
                Saved
              </div>
            ) : (
              <div className="text-sm text-white/50">Auto-save enabled</div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSaveDraft}
              className="px-6 py-2 bg-white/[0.05] text-white rounded-lg hover:bg-white/[0.08] transition-colors text-sm font-medium"
            >
              Save Draft
            </button>
            <button className="px-6 py-2 bg-white/[0.05] text-white rounded-lg hover:bg-white/[0.08] transition-colors text-sm font-medium">
              Preview Job
            </button>
            <button
              disabled={completionPercentage < 100}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                completionPercentage < 100
                  ? 'bg-[#FF5A2C]/50 text-white/50 cursor-not-allowed'
                  : 'bg-[#FF5A2C] text-white hover:bg-[#FF7A4A]'
              }`}
            >
              Publish Job
            </button>
          </div>
        </div>
      </motion.div>

      {/* Customize Modal */}
      <AnimatePresence>
        {showCustomizeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowCustomizeModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#141414] border border-white/[0.08] rounded-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">
                  Customize Application Form
                </h2>
                <button
                  onClick={() => setShowCustomizeModal(false)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Sections */}
              <div className="space-y-4">
                {[
                  'Personal Information',
                  'Education',
                  'Experience',
                  'Documents',
                  'Links',
                ].map((section) => (
                  <div
                    key={section}
                    className="flex items-center justify-between p-4 bg-white/[0.05] border border-white/[0.08] rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-4 h-4"
                      />
                      <div>
                        <div className="text-sm font-medium text-white">
                          {section}
                        </div>
                        <div className="text-xs text-white/50">
                          Required field
                        </div>
                      </div>
                    </div>
                    <button className="text-white/60 hover:text-white transition-colors">
                      ⋮
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex gap-3">
                <button
                  onClick={() => setShowCustomizeModal(false)}
                  className="flex-1 px-4 py-2 bg-white/[0.05] text-white rounded-lg hover:bg-white/[0.08] transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowCustomizeModal(false)}
                  className="flex-1 px-4 py-2 bg-[#FF5A2C] text-white rounded-lg hover:bg-[#FF7A4A] transition-colors font-medium"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
