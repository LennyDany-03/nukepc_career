'use client';

import { useState } from 'react';
import { ArrowLeft, Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

type EmploymentType = 'internship' | 'fulltime' | null;

interface JobFormData {
  jobTitle: string;
  jobDescription: string;
  department: string;
  location: string;
  jobType: EmploymentType;
  skills: string[];
  requiredExperience: string;
  salary: string;
  deadline: string;
}

export default function NewJobPage() {
  const [formData, setFormData] = useState<JobFormData>({
    jobTitle: '',
    jobDescription: '',
    department: '',
    location: '',
    jobType: null,
    skills: [''],
    requiredExperience: '',
    salary: '',
    deadline: '',
  });

  const [showPreview, setShowPreview] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSkillChange = (index: number, value: string) => {
    const newSkills = [...formData.skills];
    newSkills[index] = value;
    setFormData(prev => ({
      ...prev,
      skills: newSkills
    }));
  };

  const addSkill = () => {
    setFormData(prev => ({
      ...prev,
      skills: [...prev.skills, '']
    }));
  };

  const removeSkill = (index: number) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  const handleEmploymentTypeChange = (type: EmploymentType) => {
    setFormData(prev => ({
      ...prev,
      jobType: type
    }));
  };

  const isStep1Complete = formData.jobTitle && formData.jobDescription && formData.department && formData.location;
  const isStep2Complete = formData.jobType && formData.skills.some(s => s.trim());
  const isFormComplete = isStep1Complete && isStep2Complete;

  return (
    <div className="min-h-screen bg-[#0A0A0A] p-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/dashboard/jobs" className="flex items-center gap-2 text-[#FF5A1F] hover:text-[#FF8A5B] transition-colors mb-4 font-medium">
          <ArrowLeft className="w-4 h-4" />
          Back to Jobs
        </Link>
        <h1 className="text-4xl font-bold text-white">Create New Job</h1>
        <p className="text-white/50 mt-2">Set up job details and preview how candidates will see the application form</p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-2">
          <div className="bg-[#141414] border border-white/[0.08] rounded-2xl p-8">
            {/* Step Indicator */}
            <div className="flex gap-4 mb-8">
              <button
                onClick={() => setCurrentStep(1)}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                  currentStep === 1
                    ? 'bg-[#FF5A1F] text-white'
                    : 'bg-white/[0.05] text-white/70 hover:bg-white/[0.08]'
                }`}
              >
                Step 1: Basic Info
              </button>
              <button
                onClick={() => setCurrentStep(2)}
                disabled={!isStep1Complete}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                  currentStep === 2
                    ? 'bg-[#FF5A1F] text-white'
                    : isStep1Complete
                    ? 'bg-white/[0.05] text-white/70 hover:bg-white/[0.08]'
                    : 'bg-white/[0.02] text-white/40 cursor-not-allowed'
                }`}
              >
                Step 2: Details
              </button>
            </div>

            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Job Title *</label>
                  <input
                    type="text"
                    name="jobTitle"
                    value={formData.jobTitle}
                    onChange={handleInputChange}
                    placeholder="e.g., Senior React Developer"
                    className="w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#FF5A1F]/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Job Description *</label>
                  <textarea
                    name="jobDescription"
                    value={formData.jobDescription}
                    onChange={handleInputChange}
                    placeholder="Describe the role, responsibilities, and what you're looking for..."
                    rows={5}
                    className="w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#FF5A1F]/50 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Department *</label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      className="w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#FF5A1F]/50"
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
                    <label className="block text-sm font-medium text-white mb-2">Location *</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="e.g., Remote, San Francisco, CA"
                      className="w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#FF5A1F]/50"
                    />
                  </div>
                </div>

                <button
                  onClick={() => setCurrentStep(2)}
                  disabled={!isStep1Complete}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
                    isStep1Complete
                      ? 'bg-[#FF5A1F] text-white hover:bg-[#FF7A4A]'
                      : 'bg-white/[0.05] text-white/40 cursor-not-allowed'
                  }`}
                >
                  Continue to Step 2
                </button>
              </div>
            )}

            {/* Step 2: Employment Type & Skills */}
            {currentStep === 2 && (
              <div className="space-y-8">
                {/* Employment Type */}
                <div>
                  <label className="block text-sm font-medium text-white mb-4">Employment Type *</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => handleEmploymentTypeChange('internship')}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        formData.jobType === 'internship'
                          ? 'border-[#FF5A1F] bg-[#FF5A1F]/10'
                          : 'border-white/[0.08] bg-white/[0.02] hover:border-white/[0.15]'
                      }`}
                    >
                      <div className={`font-medium ${formData.jobType === 'internship' ? 'text-[#FF5A1F]' : 'text-white'}`}>
                        Internship
                      </div>
                      <div className={`text-sm mt-1 ${formData.jobType === 'internship' ? 'text-[#FF5A1F]/80' : 'text-white/50'}`}>
                        For students & recent graduates
                      </div>
                    </button>

                    <button
                      onClick={() => handleEmploymentTypeChange('fulltime')}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        formData.jobType === 'fulltime'
                          ? 'border-[#FF5A1F] bg-[#FF5A1F]/10'
                          : 'border-white/[0.08] bg-white/[0.02] hover:border-white/[0.15]'
                      }`}
                    >
                      <div className={`font-medium ${formData.jobType === 'fulltime' ? 'text-[#FF5A1F]' : 'text-white'}`}>
                        Full-Time
                      </div>
                      <div className={`text-sm mt-1 ${formData.jobType === 'fulltime' ? 'text-[#FF5A1F]/80' : 'text-white/50'}`}>
                        For experienced professionals
                      </div>
                    </button>
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <label className="block text-sm font-medium text-white mb-4">Required Skills *</label>
                  <div className="space-y-3">
                    {formData.skills.map((skill, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={skill}
                          onChange={(e) => handleSkillChange(index, e.target.value)}
                          placeholder={`Skill ${index + 1}`}
                          className="flex-1 bg-white/[0.05] border border-white/[0.08] rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#FF5A1F]/50"
                        />
                        {formData.skills.length > 1 && (
                          <button
                            onClick={() => removeSkill(index)}
                            className="p-3 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={addSkill}
                    className="mt-3 flex items-center gap-2 px-4 py-2 text-[#FF5A1F] hover:text-[#FF8A5B] font-medium transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Skill
                  </button>
                </div>

                {/* Optional Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Required Experience</label>
                    <input
                      type="text"
                      name="requiredExperience"
                      value={formData.requiredExperience}
                      onChange={handleInputChange}
                      placeholder="e.g., 3-5 years"
                      className="w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#FF5A1F]/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Salary Range</label>
                    <input
                      type="text"
                      name="salary"
                      value={formData.salary}
                      onChange={handleInputChange}
                      placeholder="e.g., $80K - $120K"
                      className="w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#FF5A1F]/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Application Deadline</label>
                  <input
                    type="date"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleInputChange}
                    className="w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#FF5A1F]/50"
                  />
                </div>

                {/* Submit Button */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="flex-1 py-3 px-4 rounded-lg font-medium bg-white/[0.05] text-white hover:bg-white/[0.08] transition-colors"
                  >
                    Back
                  </button>
                  <button
                    disabled={!isFormComplete}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                      isFormComplete
                        ? 'bg-[#FF5A1F] text-white hover:bg-[#FF7A4A]'
                        : 'bg-white/[0.05] text-white/40 cursor-not-allowed'
                    }`}
                  >
                    Publish Job
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Preview Section */}
        <div className="lg:col-span-1">
          <div className="sticky top-8">
            <div className="bg-[#141414] border border-white/[0.08] rounded-2xl p-6">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#FF5A1F]/20 text-[#FF5A1F] rounded-lg font-medium hover:bg-[#FF5A1F]/30 transition-colors mb-6"
              >
                {showPreview ? (
                  <>
                    <EyeOff className="w-4 h-4" />
                    Hide Preview
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4" />
                    Show Preview
                  </>
                )}
              </button>

              {showPreview && formData.jobType && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white">Candidate Form Preview</h3>
                  <p className="text-sm text-white/60 mb-4">
                    This is what candidates will see when applying for this {formData.jobType === 'internship' ? 'internship' : 'position'}
                  </p>

                  {/* Preview Content */}
                  <div className="space-y-4 max-h-[600px] overflow-y-auto">
                    {/* Common Fields */}
                    <div className="space-y-3 pb-4 border-b border-white/[0.08]">
                      <h4 className="text-sm font-semibold text-white">Personal Information</h4>
                      <div className="space-y-2 text-xs text-white/60">
                        <div className="flex items-center gap-2">
                          <input type="checkbox" checked readOnly className="w-4 h-4" />
                          Full Name
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" checked readOnly className="w-4 h-4" />
                          Email Address
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" checked readOnly className="w-4 h-4" />
                          Phone Number
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" readOnly className="w-4 h-4" />
                          Date of Birth
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" checked readOnly className="w-4 h-4" />
                          Current City
                        </div>
                      </div>
                    </div>

                    {/* Skills Section */}
                    <div className="space-y-3 pb-4 border-b border-white/[0.08]">
                      <h4 className="text-sm font-semibold text-white">Skills & Profile</h4>
                      <div className="space-y-2 text-xs text-white/60">
                        <div className="flex items-center gap-2">
                          <input type="checkbox" checked readOnly className="w-4 h-4" />
                          Skills (as per job posting)
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" readOnly className="w-4 h-4" />
                          LinkedIn URL
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" readOnly className="w-4 h-4" />
                          GitHub URL
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" readOnly className="w-4 h-4" />
                          Portfolio Website
                        </div>
                      </div>
                    </div>

                    {/* Type-Specific Fields */}
                    {formData.jobType === 'internship' && (
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-white">Education Information</h4>
                        <div className="space-y-2 text-xs text-white/60">
                          <div className="flex items-center gap-2">
                            <input type="checkbox" checked readOnly className="w-4 h-4" />
                            College Name
                          </div>
                          <div className="flex items-center gap-2">
                            <input type="checkbox" checked readOnly className="w-4 h-4" />
                            University
                          </div>
                          <div className="flex items-center gap-2">
                            <input type="checkbox" checked readOnly className="w-4 h-4" />
                            Degree
                          </div>
                          <div className="flex items-center gap-2">
                            <input type="checkbox" checked readOnly className="w-4 h-4" />
                            Branch / Specialization
                          </div>
                          <div className="flex items-center gap-2">
                            <input type="checkbox" checked readOnly className="w-4 h-4" />
                            Current Year
                          </div>
                          <div className="flex items-center gap-2">
                            <input type="checkbox" checked readOnly className="w-4 h-4" />
                            CGPA
                          </div>
                          <div className="flex items-center gap-2">
                            <input type="checkbox" checked readOnly className="w-4 h-4" />
                            Graduation Year
                          </div>
                        </div>
                      </div>
                    )}

                    {formData.jobType === 'fulltime' && (
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-white">Professional Information</h4>
                        <div className="space-y-2 text-xs text-white/60">
                          <div className="flex items-center gap-2">
                            <input type="checkbox" readOnly className="w-4 h-4" />
                            Current Company
                          </div>
                          <div className="flex items-center gap-2">
                            <input type="checkbox" readOnly className="w-4 h-4" />
                            Current Designation
                          </div>
                          <div className="flex items-center gap-2">
                            <input type="checkbox" checked readOnly className="w-4 h-4" />
                            Total Experience
                          </div>
                          <div className="flex items-center gap-2">
                            <input type="checkbox" checked readOnly className="w-4 h-4" />
                            Relevant Experience
                          </div>
                          <div className="flex items-center gap-2">
                            <input type="checkbox" readOnly className="w-4 h-4" />
                            Current CTC
                          </div>
                          <div className="flex items-center gap-2">
                            <input type="checkbox" checked readOnly className="w-4 h-4" />
                            Expected CTC
                          </div>
                          <div className="flex items-center gap-2">
                            <input type="checkbox" checked readOnly className="w-4 h-4" />
                            Notice Period
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Documents */}
                    <div className="space-y-3 pt-4 border-t border-white/[0.08]">
                      <h4 className="text-sm font-semibold text-white">Documents</h4>
                      <div className="space-y-2 text-xs text-white/60">
                        <div className="flex items-center gap-2">
                          <input type="checkbox" checked readOnly className="w-4 h-4" />
                          Resume Upload
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" readOnly className="w-4 h-4" />
                          Cover Letter
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {showPreview && !formData.jobType && (
                <div className="text-center py-8">
                  <p className="text-white/50 text-sm">Select an employment type to see the candidate form</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
