import { departmentConfig } from '@/config/departmentConfig';
import { api } from '@/services/auth';

export type EmploymentTypeKey = 'internship' | 'fresher' | 'experienced';

export interface TemplateConfig {
  id?: number;
  department: string;
  employment_type: EmploymentTypeKey;
  roles: string[];
  required_skills: string[];
  good_to_have_skills: string[];
  portfolio_label: string;
  assignment_label: string;
  screening_question_1: string;
  screening_question_2: string;
  screening_question_3: string;
  extra_questions: string[];
  duration_options: string[];
  year_of_study_options: string[];
  probation_options: string[];
  notice_period_options: string[];
  shift_timing_options: string[];
  is_custom?: boolean;
  updated_at?: string;
}

const TYPE_DEFAULTS: Record<EmploymentTypeKey, Partial<TemplateConfig>> = {
  internship: {
    duration_options: ['1 month', '2 months', '3 months', '6 months', 'Custom'],
    year_of_study_options: ['1st', '2nd', '3rd', 'Final year', 'Any'],
  },
  fresher: {
    probation_options: ['3 months', '6 months', 'None'],
    shift_timing_options: ['Day', 'Flexible', 'Night', 'Rotational'],
  },
  experienced: {
    notice_period_options: ['Immediate', '15 days', '1 month', '2 months', '3 months'],
    shift_timing_options: ['Day', 'Flexible', 'Night', 'Rotational'],
  },
};

export function getLocalDefaultConfig(
  department: string,
  employmentType: EmploymentTypeKey
): TemplateConfig {
  const dept =
    departmentConfig[department as keyof typeof departmentConfig] ||
    departmentConfig['Custom'];

  return {
    department,
    employment_type: employmentType,
    roles: [...(dept.roles || [])],
    required_skills: [...(dept.requiredSkills || [])],
    good_to_have_skills: [...(dept.goodToHaveSkills || [])],
    portfolio_label: dept.portfolioLabel || '',
    assignment_label: dept.assignmentLabel || '',
    screening_question_1: '',
    screening_question_2: '',
    screening_question_3: '',
    extra_questions: [],
    duration_options: [...(TYPE_DEFAULTS[employmentType].duration_options || [])],
    year_of_study_options: [...(TYPE_DEFAULTS[employmentType].year_of_study_options || [])],
    probation_options: [...(TYPE_DEFAULTS[employmentType].probation_options || [])],
    notice_period_options: [...(TYPE_DEFAULTS[employmentType].notice_period_options || [])],
    shift_timing_options: [...(TYPE_DEFAULTS[employmentType].shift_timing_options || [])],
    is_custom: false,
  };
}

export async function fetchTemplateConfig(
  department: string,
  employmentType: EmploymentTypeKey
): Promise<TemplateConfig> {
  try {
    const response = await api.get('/template-config/', {
      params: { department, type: employmentType },
    });
    return response.data as TemplateConfig;
  } catch {
    return getLocalDefaultConfig(department, employmentType);
  }
}

export async function saveTemplateConfig(config: TemplateConfig): Promise<TemplateConfig> {
  const response = await api.put('/template-config/update/', config);
  return response.data as TemplateConfig;
}
