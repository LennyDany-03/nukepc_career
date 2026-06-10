'use client';

import { useState, useEffect } from 'react';
import {
  EmploymentTypeKey,
  TemplateConfig,
  fetchTemplateConfig,
  getLocalDefaultConfig,
} from '@/services/templateConfig';

export function useTemplateConfig(department: string, employmentType: EmploymentTypeKey) {
  const [config, setConfig] = useState<TemplateConfig>(
    () => getLocalDefaultConfig(department, employmentType)
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchTemplateConfig(department, employmentType)
      .then((data) => {
        if (!cancelled) setConfig(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [department, employmentType]);

  return { config, loading };
}
