'use client';

import { useState } from 'react';
import {
  Code,
  Palette,
  Briefcase,
  Cpu,
  Megaphone,
  TrendingUp,
  Truck,
  Headphones,
  Wallet,
  Users,
  Settings,
  ArrowLeft,
  Clock,
  Sparkles,
  Award,
  Check,
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import InternshipForm from '@/components/forms/InternshipForm';
import FresherForm from '@/components/forms/FresherForm';
import ExperiencedForm from '@/components/forms/ExperiencedForm';

// Step Types
type Step = 1 | 2 | 3 | 4;

const DEPARTMENTS = [
  { name: 'Engineering & Development', icon: Code, desc: 'Software developers, QA engineers, system architects' },
  { name: 'Design', icon: Palette, desc: 'UI/UX designers, graphic designers, video editors' },
  { name: 'Product', icon: Briefcase, desc: 'Product managers, scrum masters, agile leads' },
  { name: 'Hardware & Tech', icon: Cpu, desc: 'PC build technicians, hardware consultants' },
  { name: 'Marketing & Content', icon: Megaphone, desc: 'Social media, content writers, SEO specialists' },
  { name: 'Sales & Business Development', icon: TrendingUp, desc: 'Sales executives, partnership managers' },
  { name: 'Operations & Logistics', icon: Truck, desc: 'Warehouse leads, inventory operations coordinators' },
  { name: 'Customer Support', icon: Headphones, desc: 'Support agents, customer success managers' },
  { name: 'Finance & Accounts', icon: Wallet, desc: 'Accountants, financial analysts, audit heads' },
  { name: 'HR', icon: Users, desc: 'Talent acquisition, HR business partners, recruiters' },
  { name: 'Custom', icon: Settings, desc: 'Define your own department parameters' },
];

export default function NewJobPage() {
  const [step, setStep] = useState<Step>(1);
  const [selectedDept, setSelectedDept] = useState<string>('');
  const [employmentType, setEmploymentType] = useState<'internship' | 'fulltime' | null>(null);
  const [candidateLevel, setCandidateLevel] = useState<'fresher' | 'experienced' | null>(null);

  // Wizard state machine navigation
  const handleSelectDept = (dept: string) => {
    setSelectedDept(dept);
    setStep(2);
  };

  const handleSelectEmpType = (type: 'internship' | 'fulltime') => {
    setEmploymentType(type);
    if (type === 'internship') {
      setCandidateLevel(null);
      setStep(4);
    } else {
      setStep(3);
    }
  };

  const handleSelectLevel = (level: 'fresher' | 'experienced') => {
    setCandidateLevel(level);
    setStep(4);
  };

  const handleBack = () => {
    if (step === 4) {
      if (employmentType === 'internship') {
        setStep(2);
      } else {
        setStep(3);
      }
    } else if (step === 3) {
      setStep(2);
    } else if (step === 2) {
      setStep(1);
    }
  };

  // Stepper Header helper
  const renderStepper = () => {
    const steps = [
      { id: 1, label: 'Department' },
      { id: 2, label: 'Employment' },
      { id: 3, label: 'Candidate Level' },
      { id: 4, label: 'Complete Details' },
    ];

    // Filter out step 3 (Candidate Level) if it is an Internship
    const activeSteps = employmentType === 'internship'
      ? steps.filter(s => s.id !== 3)
      : steps;

    return (
      <div className="flex items-center justify-center gap-4 max-w-xl mx-auto mb-10 px-4">
        {activeSteps.map((s, index) => {
          const isCompleted = step > s.id || (employmentType === 'internship' && s.id === 4 && step === 4);
          const isActive = step === s.id;
          
          return (
            <div key={s.id} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-2 relative">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border transition-all duration-300 ${
                    isActive
                      ? 'bg-[#FF5A2C] border-[#FF5A2C] text-white shadow-[0_0_15px_rgba(255,90,44,0.4)]'
                      : isCompleted
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                      : 'bg-[#141414] border-white/[0.08] text-white/40'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : s.id === 4 && employmentType === 'internship' ? 3 : s.id}
                </div>
                <span className={`text-xs font-semibold whitespace-nowrap hidden sm:block ${isActive ? 'text-white font-bold' : 'text-white/40'}`}>
                  {s.label}
                </span>
              </div>
              {index < activeSteps.length - 1 && (
                <div className="flex-1 h-0.5 mx-2 bg-white/[0.08] relative">
                  <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#FF5A2C] to-[#FF7A4A] transition-all duration-300"
                    style={{
                      width: step > s.id || (employmentType === 'internship' && s.id === 2 && step === 4) ? '100%' : '0%',
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pb-20">
      {/* Top Header */}
      <div className="sticky top-0 z-40 bg-[#0A0A0A]/85 backdrop-blur-xl border-b border-white/[0.08] px-8 py-5">
        <div className="flex items-center gap-4 max-w-7xl mx-auto">
          {step > 1 && (
            <button
              onClick={handleBack}
              className="p-2.5 hover:bg-white/[0.08] border border-white/10 rounded-xl transition-all text-white/80 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          {step === 1 && (
            <Link
              href="/dashboard/jobs"
              className="p-2.5 hover:bg-white/[0.08] border border-white/10 rounded-xl transition-all text-white/80 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
          )}
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Post a New Job</h1>
            <p className="text-sm text-white/50 mt-0.5">Define job specifications and launch position</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-10">
        {/* Stepper progress */}
        {renderStepper()}

        <AnimatePresence mode="wait">
          {/* STEP 1: Department Selection */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div className="text-center max-w-md mx-auto">
                <h2 className="text-xl font-bold text-white mb-2">Select a Department</h2>
                <p className="text-sm text-white/50">Choose a business division to preconfigure initial templates and skills</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {DEPARTMENTS.map((dept, index) => {
                  const IconComp = dept.icon;
                  return (
                    <motion.div
                      key={dept.name}
                      onClick={() => handleSelectDept(dept.name)}
                      whileHover={{ y: -4, scale: 1.01 }}
                      className="group bg-gradient-to-b from-[#141414] to-[#0F0F0F] border border-white/[0.08] hover:border-[#FF5A2C]/30 rounded-2xl p-6 cursor-pointer transition-all duration-300 flex flex-col justify-between hover:shadow-[0_10px_30px_rgba(255,90,44,0.1)] h-full min-h-[160px]"
                    >
                      <div className="space-y-4">
                        <div className="w-12 h-12 rounded-xl bg-white/[0.04] group-hover:bg-[#FF5A2C]/10 text-white/80 group-hover:text-[#FF5A2C] flex items-center justify-center transition-colors">
                          <IconComp className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-base group-hover:text-white transition-colors">{dept.name}</h3>
                          <p className="text-xs text-white/50 mt-1 line-clamp-2">{dept.desc}</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* STEP 2: Employment Type Selection */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-6 max-w-3xl mx-auto"
            >
              <div className="text-center">
                <h2 className="text-xl font-bold text-white mb-2">Employment Type</h2>
                <p className="text-sm text-white/50">Select structural alignment for the post</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                {/* Internship */}
                <motion.div
                  onClick={() => handleSelectEmpType('internship')}
                  whileHover={{ y: -4 }}
                  className="group bg-gradient-to-b from-[#141414] to-[#0F0F0F] border border-white/[0.08] hover:border-[#FF5A2C]/30 rounded-2xl p-8 cursor-pointer text-center flex flex-col items-center justify-center space-y-4 transition-all duration-300 hover:shadow-[0_10px_30px_rgba(255,90,44,0.1)]"
                >
                  <div className="w-16 h-16 rounded-2xl bg-white/[0.04] group-hover:bg-[#FF5A2C]/10 text-white/80 group-hover:text-[#FF5A2C] flex items-center justify-center transition-colors">
                    <Clock className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">Internship</h3>
                    <p className="text-sm text-white/50 mt-2">
                      Temporary position (typically 1-6 months). Prepares trainees with hands-on practice.
                    </p>
                  </div>
                </motion.div>

                {/* Full-time */}
                <motion.div
                  onClick={() => handleSelectEmpType('fulltime')}
                  whileHover={{ y: -4 }}
                  className="group bg-gradient-to-b from-[#141414] to-[#0F0F0F] border border-white/[0.08] hover:border-[#FF5A2C]/30 rounded-2xl p-8 cursor-pointer text-center flex flex-col items-center justify-center space-y-4 transition-all duration-300 hover:shadow-[0_10px_30px_rgba(255,90,44,0.1)]"
                >
                  <div className="w-16 h-16 rounded-2xl bg-white/[0.04] group-hover:bg-[#FF5A2C]/10 text-white/80 group-hover:text-[#FF5A2C] flex items-center justify-center transition-colors">
                    <Briefcase className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">Full-time</h3>
                    <p className="text-sm text-white/50 mt-2">
                      Permanent long-term position. Includes comprehensive compensation packages.
                    </p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Level Selection */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-6 max-w-3xl mx-auto"
            >
              <div className="text-center">
                <h2 className="text-xl font-bold text-white mb-2">Candidate Level</h2>
                <p className="text-sm text-white/50">Identify structural experience required for the full-time role</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                {/* Fresher */}
                <motion.div
                  onClick={() => handleSelectLevel('fresher')}
                  whileHover={{ y: -4 }}
                  className="group bg-gradient-to-b from-[#141414] to-[#0F0F0F] border border-white/[0.08] hover:border-[#FF5A2C]/30 rounded-2xl p-8 cursor-pointer text-center flex flex-col items-center justify-center space-y-4 transition-all duration-300 hover:shadow-[0_10px_30px_rgba(255,90,44,0.1)]"
                >
                  <div className="w-16 h-16 rounded-2xl bg-white/[0.04] group-hover:bg-[#FF5A2C]/10 text-white/80 group-hover:text-[#FF5A2C] flex items-center justify-center transition-colors">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">Fresher</h3>
                    <p className="text-sm text-white/50 mt-2">
                      New graduates or individuals starting career paths. Structured training/probation parameters.
                    </p>
                  </div>
                </motion.div>

                {/* Experienced */}
                <motion.div
                  onClick={() => handleSelectLevel('experienced')}
                  whileHover={{ y: -4 }}
                  className="group bg-gradient-to-b from-[#141414] to-[#0F0F0F] border border-white/[0.08] hover:border-[#FF5A2C]/30 rounded-2xl p-8 cursor-pointer text-center flex flex-col items-center justify-center space-y-4 transition-all duration-300 hover:shadow-[0_10px_30px_rgba(255,90,44,0.1)]"
                >
                  <div className="w-16 h-16 rounded-2xl bg-white/[0.04] group-hover:bg-[#FF5A2C]/10 text-white/80 group-hover:text-[#FF5A2C] flex items-center justify-center transition-colors">
                    <Award className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">Experienced Professional</h3>
                    <p className="text-sm text-white/50 mt-2">
                      Prior industry execution. Demands specific experience ranges, team leadership parameters.
                    </p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* STEP 4: Form Loading */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="max-w-4xl mx-auto"
            >
              <div className="mb-6 p-4 bg-white/[0.02] border border-white/[0.05] rounded-2xl flex items-center justify-between text-sm flex-wrap gap-4">
                <div className="flex gap-6 flex-wrap">
                  <div>
                    <span className="text-white/40 block text-xs">Department</span>
                    <span className="text-white font-semibold">{selectedDept}</span>
                  </div>
                  <div>
                    <span className="text-white/40 block text-xs">Employment Type</span>
                    <span className="text-white font-semibold">{employmentType === 'internship' ? 'Internship' : 'Full-time'}</span>
                  </div>
                  {candidateLevel && (
                    <div>
                      <span className="text-white/40 block text-xs">Candidate Level</span>
                      <span className="text-white font-semibold">{candidateLevel === 'fresher' ? 'Fresher' : 'Experienced'}</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-semibold transition-all border border-white/10"
                >
                  Change Selections
                </button>
              </div>

              {/* Render correct Form component */}
              {employmentType === 'internship' && (
                <InternshipForm
                  department={selectedDept}
                  employmentType="internship"
                  candidateLevel={null}
                  onBack={handleBack}
                />
              )}
              {employmentType === 'fulltime' && candidateLevel === 'fresher' && (
                <FresherForm
                  department={selectedDept}
                  employmentType="fulltime"
                  candidateLevel="fresher"
                  onBack={handleBack}
                />
              )}
              {employmentType === 'fulltime' && candidateLevel === 'experienced' && (
                <ExperiencedForm
                  department={selectedDept}
                  employmentType="fulltime"
                  candidateLevel="experienced"
                  onBack={handleBack}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
