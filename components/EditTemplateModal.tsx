'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  X,
  ArrowLeft,
  Clock,
  Sparkles,
  Award,
  Plus,
  GripVertical,
  Loader2,
  Check,
  Pencil,
} from 'lucide-react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  EmploymentTypeKey,
  TemplateConfig,
  fetchTemplateConfig,
  saveTemplateConfig,
  getLocalDefaultConfig,
} from '@/services/templateConfig';

interface EditTemplateModalProps {
  department: string;
  isOpen: boolean;
  onClose: () => void;
}

type ModalStep = 'type-select' | 'edit-form';

const EMPLOYMENT_OPTIONS = [
  {
    type: 'internship' as EmploymentTypeKey,
    title: 'Internship',
    displayTitle: 'Internship',
    description: 'Edit default fields, skills and questions for internship posts',
    icon: Clock,
    isNested: false,
  },
  {
    type: 'fresher' as EmploymentTypeKey,
    title: 'Full-time → Fresher',
    displayTitle: 'Full-time → Fresher',
    description: 'Edit default fields, skills and questions for fresher posts',
    icon: Sparkles,
    isNested: true,
  },
  {
    type: 'experienced' as EmploymentTypeKey,
    title: 'Full-time → Experienced',
    displayTitle: 'Full-time → Experienced',
    description: 'Edit default fields, skills and questions for experienced posts',
    icon: Award,
    isNested: true,
  },
];

const INTERNSHIP_DURATION_OPTS = ['1 month', '2 months', '3 months', '6 months', 'Custom'];
const YEAR_OF_STUDY_OPTS = ['1st', '2nd', '3rd', 'Final year', 'Any'];
const PROBATION_OPTS = ['3 months', '6 months', 'None'];
const NOTICE_PERIOD_OPTS = ['Immediate', '15 days', '1 month', '2 months', '3 months'];
const SHIFT_TIMING_OPTS = ['Day', 'Flexible', 'Night', 'Rotational'];

export default function EditTemplateModal({ department, isOpen, onClose }: EditTemplateModalProps) {
  const [step, setStep] = useState<ModalStep>('type-select');
  const [selectedType, setSelectedType] = useState<EmploymentTypeKey | null>(null);
  const [config, setConfig] = useState<TemplateConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const [roleInput, setRoleInput] = useState('');
  const [reqSkillInput, setReqSkillInput] = useState('');
  const [goodSkillInput, setGoodSkillInput] = useState('');

  const resetModal = useCallback(() => {
    setStep('type-select');
    setSelectedType(null);
    setConfig(null);
    setRoleInput('');
    setReqSkillInput('');
    setGoodSkillInput('');
  }, []);

  const handleClose = () => {
    resetModal();
    onClose();
  };

  useEffect(() => {
    if (!isOpen) resetModal();
  }, [isOpen, resetModal]);

  const handleSelectType = async (type: EmploymentTypeKey) => {
    setSelectedType(type);
    setLoading(true);
    setStep('edit-form');
    try {
      const data = await fetchTemplateConfig(department, type);
      setConfig(data);
    } catch {
      setConfig(getLocalDefaultConfig(department, type));
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep('type-select');
    setSelectedType(null);
    setConfig(null);
  };

  const handleSave = async () => {
    if (!config || !selectedType) return;
    setSaving(true);
    try {
      await saveTemplateConfig({
        ...config,
        department,
        employment_type: selectedType,
      });
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        handleClose();
      }, 2000);
    } catch {
      alert('Failed to save template. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const updateConfig = (updates: Partial<TemplateConfig>) => {
    setConfig((prev) => (prev ? { ...prev, ...updates } : prev));
  };

  const toggleOption = (
    field: keyof TemplateConfig,
    option: string,
    allOptions: string[]
  ) => {
    if (!config) return;
    const current = (config[field] as string[]) || [];
    const next = current.includes(option)
      ? current.filter((o) => o !== option)
      : [...current, option];
    // Keep order consistent with allOptions
    const ordered = allOptions.filter((o) => next.includes(o));
    updateConfig({ [field]: ordered });
  };

  const addRole = () => {
    const role = roleInput.trim();
    if (!role || !config || config.roles.includes(role)) return;
    updateConfig({ roles: [...config.roles, role] });
    setRoleInput('');
  };

  const removeRole = (role: string) => {
    if (!config) return;
    updateConfig({ roles: config.roles.filter((r) => r !== role) });
  };

  const addSkill = (field: 'required_skills' | 'good_to_have_skills', input: string, clear: () => void) => {
    const skill = input.trim();
    if (!skill || !config || config[field].includes(skill)) return;
    updateConfig({ [field]: [...config[field], skill] });
    clear();
  };

  const removeSkill = (field: 'required_skills' | 'good_to_have_skills', skill: string) => {
    if (!config) return;
    updateConfig({ [field]: config[field].filter((s) => s !== skill) });
  };

  const addExtraQuestion = () => {
    if (!config || config.extra_questions.length >= 5) return;
    updateConfig({ extra_questions: [...config.extra_questions, ''] });
  };

  const updateExtraQuestion = (index: number, value: string) => {
    if (!config) return;
    const updated = [...config.extra_questions];
    updated[index] = value;
    updateConfig({ extra_questions: updated });
  };

  const removeExtraQuestion = (index: number) => {
    if (!config) return;
    updateConfig({ extra_questions: config.extra_questions.filter((_, i) => i !== index) });
  };

  if (!isOpen) return null;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={handleClose}
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-[640px] max-h-[90vh] bg-[#141414] border border-white/[0.08] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center gap-3 px-6 py-4 border-b border-white/[0.08] shrink-0">
                {step === 'edit-form' && (
                  <button
                    onClick={handleBack}
                    className="p-2 hover:bg-white/[0.08] rounded-xl transition-all text-white/70 hover:text-white"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                )}
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold text-white truncate">
                    Edit Template — {department}
                  </h2>
                  <p className="text-xs text-white/50 mt-0.5">
                    {step === 'type-select'
                      ? 'Which employment type template do you want to edit?'
                      : `Editing ${EMPLOYMENT_OPTIONS.find((o) => o.type === selectedType)?.displayTitle} template`}
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-white/[0.08] rounded-xl transition-all text-white/70 hover:text-white shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto px-6 py-5">
                <AnimatePresence mode="wait">
                  {step === 'type-select' && (
                    <motion.div
                      key="type-select"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="space-y-3"
                    >
                      {EMPLOYMENT_OPTIONS.map((opt) => {
                        const Icon = opt.icon;
                        return (
                          <button
                            key={opt.type}
                            onClick={() => handleSelectType(opt.type)}
                            className="w-full group bg-gradient-to-b from-[#1A1A1A] to-[#141414] border border-white/[0.08] hover:border-[#FF5A2C]/30 rounded-xl p-4 text-left transition-all duration-300 hover:shadow-[0_4px_20px_rgba(255,90,44,0.08)] flex items-start gap-4"
                          >
                            <div className="w-10 h-10 rounded-xl bg-white/[0.04] group-hover:bg-[#FF5A2C]/10 text-white/70 group-hover:text-[#FF5A2C] flex items-center justify-center transition-colors shrink-0">
                              <Icon className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-semibold text-white text-sm">{opt.displayTitle}</h3>
                              <p className="text-xs text-white/50 mt-1">{opt.description}</p>
                            </div>
                          </button>
                        );
                      })}
                    </motion.div>
                  )}

                  {step === 'edit-form' && (
                    <motion.div
                      key="edit-form"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="space-y-6"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center py-16">
                          <Loader2 className="w-6 h-6 text-[#FF5A2C] animate-spin" />
                        </div>
                      ) : config ? (
                        <>
                          {/* Default Roles */}
                          <section>
                            <label className="block text-sm font-semibold text-white/80 mb-2">
                              Default Roles
                            </label>
                            <p className="text-xs text-white/40 mb-3">Drag to reorder, click X to remove</p>
                            <Reorder.Group
                              axis="y"
                              values={config.roles}
                              onReorder={(roles) => updateConfig({ roles })}
                              className="space-y-2 mb-3"
                            >
                              {config.roles.map((role) => (
                                <Reorder.Item
                                  key={role}
                                  value={role}
                                  className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2 cursor-grab active:cursor-grabbing"
                                >
                                  <GripVertical className="w-4 h-4 text-white/30 shrink-0" />
                                  <span className="flex-1 text-sm text-white truncate">{role}</span>
                                  <button
                                    type="button"
                                    onClick={() => removeRole(role)}
                                    className="p-1 hover:bg-white/10 rounded-lg text-white/50 hover:text-red-400 transition-colors"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </Reorder.Item>
                              ))}
                            </Reorder.Group>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={roleInput}
                                onChange={(e) => setRoleInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addRole())}
                                placeholder="Type a role and press Enter"
                                className="flex-1 bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#FF5A2C]/30"
                              />
                              <button
                                type="button"
                                onClick={addRole}
                                className="px-3 py-2.5 bg-white/[0.05] border border-white/[0.08] rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          </section>

                          {/* Required Skills */}
                          <TagInputSection
                            label="Required Skills"
                            tags={config.required_skills}
                            input={reqSkillInput}
                            onInputChange={setReqSkillInput}
                            onAdd={() => addSkill('required_skills', reqSkillInput, () => setReqSkillInput(''))}
                            onRemove={(s) => removeSkill('required_skills', s)}
                          />

                          {/* Good to Have Skills */}
                          <TagInputSection
                            label="Good to Have Skills"
                            tags={config.good_to_have_skills}
                            input={goodSkillInput}
                            onInputChange={setGoodSkillInput}
                            onAdd={() => addSkill('good_to_have_skills', goodSkillInput, () => setGoodSkillInput(''))}
                            onRemove={(s) => removeSkill('good_to_have_skills', s)}
                          />

                          {/* Labels */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-semibold text-white/80 mb-2">
                                Portfolio Label
                              </label>
                              <input
                                type="text"
                                value={config.portfolio_label}
                                onChange={(e) => updateConfig({ portfolio_label: e.target.value })}
                                placeholder='e.g. "GitHub profile required?"'
                                className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#FF5A2C]/30"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-white/80 mb-2">
                                Assignment Label
                              </label>
                              <input
                                type="text"
                                value={config.assignment_label}
                                onChange={(e) => updateConfig({ assignment_label: e.target.value })}
                                placeholder='e.g. "Coding test round?"'
                                className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#FF5A2C]/30"
                              />
                            </div>
                          </div>

                          {/* Screening Questions */}
                          <section>
                            <label className="block text-sm font-semibold text-white/80 mb-3">
                              Default Screening Questions
                            </label>
                            <div className="space-y-3">
                              {([
                                ['screening_question_1', config.screening_question_1, 1],
                                ['screening_question_2', config.screening_question_2, 2],
                                ['screening_question_3', config.screening_question_3, 3],
                              ] as const).map(([field, value, n]) => (
                                <div key={field}>
                                  <label className="block text-xs text-white/50 mb-1.5">
                                    Question {n}
                                  </label>
                                  <input
                                    type="text"
                                    value={value}
                                    onChange={(e) => updateConfig({ [field]: e.target.value })}
                                    placeholder={`Screening question ${n}`}
                                    className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#FF5A2C]/30"
                                  />
                                </div>
                              ))}
                            </div>
                          </section>

                          {/* Extra Yes/No Questions */}
                          <section>
                            <div className="flex items-center justify-between mb-3">
                              <label className="text-sm font-semibold text-white/80">
                                Extra Yes/No Questions
                              </label>
                              {config.extra_questions.length < 5 && (
                                <button
                                  type="button"
                                  onClick={addExtraQuestion}
                                  className="text-xs text-[#FF5A2C] hover:text-[#FF7A4A] font-semibold flex items-center gap-1"
                                >
                                  <Plus className="w-3.5 h-3.5" /> Add question
                                </button>
                              )}
                            </div>
                            <div className="space-y-2">
                              {config.extra_questions.map((q, i) => (
                                <div key={i} className="flex gap-2">
                                  <input
                                    type="text"
                                    value={q}
                                    onChange={(e) => updateExtraQuestion(i, e.target.value)}
                                    placeholder="Yes/No question label"
                                    className="flex-1 bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#FF5A2C]/30"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeExtraQuestion(i)}
                                    className="p-2.5 hover:bg-white/10 rounded-xl text-white/50 hover:text-red-400 transition-colors"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                              {config.extra_questions.length === 0 && (
                                <p className="text-xs text-white/40">No extra questions added yet.</p>
                              )}
                            </div>
                          </section>

                          {/* Type-specific options */}
                          {selectedType === 'internship' && (
                            <>
                              <CheckboxGroup
                                label="Default Internship Duration Options"
                                options={INTERNSHIP_DURATION_OPTS}
                                selected={config.duration_options}
                                onToggle={(opt) => toggleOption('duration_options', opt, INTERNSHIP_DURATION_OPTS)}
                              />
                              <CheckboxGroup
                                label="Default Year of Study Options"
                                options={YEAR_OF_STUDY_OPTS}
                                selected={config.year_of_study_options}
                                onToggle={(opt) => toggleOption('year_of_study_options', opt, YEAR_OF_STUDY_OPTS)}
                              />
                            </>
                          )}

                          {selectedType === 'fresher' && (
                            <>
                              <CheckboxGroup
                                label="Default Probation Period Options"
                                options={PROBATION_OPTS}
                                selected={config.probation_options}
                                onToggle={(opt) => toggleOption('probation_options', opt, PROBATION_OPTS)}
                              />
                              <CheckboxGroup
                                label="Default Shift Timing Options"
                                options={SHIFT_TIMING_OPTS}
                                selected={config.shift_timing_options}
                                onToggle={(opt) => toggleOption('shift_timing_options', opt, SHIFT_TIMING_OPTS)}
                              />
                            </>
                          )}

                          {selectedType === 'experienced' && (
                            <>
                              <CheckboxGroup
                                label="Default Notice Period Options"
                                options={NOTICE_PERIOD_OPTS}
                                selected={config.notice_period_options}
                                onToggle={(opt) => toggleOption('notice_period_options', opt, NOTICE_PERIOD_OPTS)}
                              />
                              <CheckboxGroup
                                label="Default Shift Timing Options"
                                options={SHIFT_TIMING_OPTS}
                                selected={config.shift_timing_options}
                                onToggle={(opt) => toggleOption('shift_timing_options', opt, SHIFT_TIMING_OPTS)}
                              />
                            </>
                          )}
                        </>
                      ) : null}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer */}
              {step === 'edit-form' && !loading && config && (
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/[0.08] shrink-0">
                  <button
                    onClick={handleClose}
                    className="px-5 py-2.5 text-sm font-semibold text-white/70 hover:text-white hover:bg-white/[0.05] rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-5 py-2.5 text-sm font-semibold bg-gradient-to-r from-[#FF5A2C] to-[#FF7A4A] text-white rounded-xl hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Pencil className="w-4 h-4" />}
                    Save Template
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-[#FF5A2C] to-[#FF7A4A] rounded-xl shadow-lg text-white text-sm font-semibold"
          >
            <Check className="w-4 h-4" />
            Template updated successfully
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function TagInputSection({
  label,
  tags,
  input,
  onInputChange,
  onAdd,
  onRemove,
}: {
  label: string;
  tags: string[];
  input: string;
  onInputChange: (v: string) => void;
  onAdd: () => void;
  onRemove: (tag: string) => void;
}) {
  return (
    <section>
      <label className="block text-sm font-semibold text-white/80 mb-2">{label}</label>
      <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-3 space-y-2">
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FF5A2C]/10 border border-[#FF5A2C]/20 text-[#FF5A2C] rounded-lg text-xs font-medium"
            >
              {tag}
              <button type="button" onClick={() => onRemove(tag)} className="hover:text-white transition-colors">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), onAdd())}
            placeholder="Type and press Enter"
            className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none"
          />
          <button
            type="button"
            onClick={onAdd}
            className="text-white/50 hover:text-[#FF5A2C] transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}

function CheckboxGroup({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: string[];
  selected: string[];
  onToggle: (option: string) => void;
}) {
  return (
    <section>
      <label className="block text-sm font-semibold text-white/80 mb-3">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const isChecked = selected.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onToggle(opt)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                isChecked
                  ? 'bg-[#FF5A2C]/15 border-[#FF5A2C]/40 text-[#FF5A2C]'
                  : 'bg-white/[0.03] border-white/[0.08] text-white/50 hover:text-white/70'
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </section>
  );
}
