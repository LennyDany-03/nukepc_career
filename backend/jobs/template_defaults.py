"""Default job template config per department and employment type."""

DEPARTMENT_DEFAULTS = {
    "Engineering & Development": {
        "roles": ["Frontend Developer", "Backend Developer", "Fullstack Developer"],
        "required_skills": ["React", "Next.js", "Node.js", "MongoDB", "PostgreSQL"],
        "good_to_have_skills": ["Docker", "AWS", "TypeScript", "Redis"],
        "portfolio_label": "GitHub profile required?",
        "assignment_label": "Coding test round?",
    },
    "Design": {
        "roles": ["UI/UX Designer", "Graphic Designer", "Motion Designer", "Video Editor"],
        "required_skills": ["Figma", "Photoshop", "Illustrator"],
        "good_to_have_skills": ["After Effects", "Premiere Pro", "Canva"],
        "portfolio_label": "Behance / Dribbble required?",
        "assignment_label": "Design assignment round?",
    },
    "Product": {
        "roles": ["Product Manager", "QA Engineer", "Testing Engineer"],
        "required_skills": ["Jira", "Notion", "Figma basics", "Excel"],
        "good_to_have_skills": ["Agile", "Scrum", "Postman", "Selenium"],
        "portfolio_label": "Portfolio required?",
        "assignment_label": "Case study round?",
    },
    "Hardware & Tech": {
        "roles": ["PC Build Technician", "Hardware Consultant", "Component Sourcing Specialist"],
        "required_skills": ["PC Assembly", "Component Knowledge", "Troubleshooting"],
        "good_to_have_skills": ["Overclocking", "Watercooling", "Inventory Management"],
        "portfolio_label": "Work sample required?",
        "assignment_label": "Practical test round?",
    },
    "Marketing & Content": {
        "roles": ["Social Media Manager", "Content Creator", "SEO Specialist", "Video Editor"],
        "required_skills": ["Instagram", "YouTube", "Canva", "Copywriting"],
        "good_to_have_skills": ["SEO", "Google Analytics", "Premiere Pro", "Meta Ads"],
        "portfolio_label": "Portfolio / social page required?",
        "assignment_label": "Content assignment round?",
    },
    "Sales & Business Development": {
        "roles": ["Sales Executive", "B2B Partnership Manager", "Business Development Executive"],
        "required_skills": ["Lead Generation", "Cold Calling", "CRM basics", "Email Outreach"],
        "good_to_have_skills": ["HubSpot", "Zoho CRM", "Negotiation", "Market Research"],
        "portfolio_label": "Work sample required?",
        "assignment_label": "Assignment round?",
    },
    "Operations & Logistics": {
        "roles": ["Logistics Coordinator", "Inventory Manager", "Warehouse Executive", "Operations Executive"],
        "required_skills": ["Excel", "Inventory Management", "Dispatch Coordination"],
        "good_to_have_skills": ["Tally", "ERP systems", "Supply Chain basics"],
        "portfolio_label": "Work sample required?",
        "assignment_label": "Assignment round?",
    },
    "Customer Support": {
        "roles": ["Customer Support Executive", "Technical Support Executive", "Customer Success Executive"],
        "required_skills": ["Email Support", "Chat Support", "Ticket Handling", "CRM basics"],
        "good_to_have_skills": ["Freshdesk", "Zendesk", "PC Knowledge", "Regional Language"],
        "portfolio_label": "Work sample required?",
        "assignment_label": "Assignment round?",
    },
    "Finance & Accounts": {
        "roles": ["Accountant", "Finance Executive", "Finance Analyst", "Accounts Executive"],
        "required_skills": ["Tally ERP", "Excel", "GST", "TDS"],
        "good_to_have_skills": ["SAP", "Zoho Books", "MIS Reporting", "Audit"],
        "portfolio_label": "Work sample required?",
        "assignment_label": "Assignment round?",
    },
    "HR": {
        "roles": ["HR Executive", "Talent Acquisition Executive", "HR Operations Executive"],
        "required_skills": ["Resume Screening", "Job Posting", "Interview Scheduling", "Excel"],
        "good_to_have_skills": ["LinkedIn Recruiter", "ATS tools", "Onboarding", "Labor Law basics"],
        "portfolio_label": "Work sample required?",
        "assignment_label": "Assignment round?",
    },
    "Custom": {
        "roles": [],
        "required_skills": [],
        "good_to_have_skills": [],
        "portfolio_label": "Portfolio / Work sample required?",
        "assignment_label": "Assignment round?",
    },
}

TYPE_DEFAULTS = {
    "internship": {
        "duration_options": ["1 month", "2 months", "3 months", "6 months", "Custom"],
        "year_of_study_options": ["1st", "2nd", "3rd", "Final year", "Any"],
    },
    "fresher": {
        "probation_options": ["3 months", "6 months", "None"],
        "shift_timing_options": ["Day", "Flexible", "Night", "Rotational"],
    },
    "experienced": {
        "notice_period_options": ["Immediate", "15 days", "1 month", "2 months", "3 months"],
        "shift_timing_options": ["Day", "Flexible", "Night", "Rotational"],
    },
}

VALID_EMPLOYMENT_TYPES = {"internship", "fresher", "experienced"}


def get_default_config(department: str, employment_type: str) -> dict:
    dept_config = DEPARTMENT_DEFAULTS.get(department, DEPARTMENT_DEFAULTS["Custom"])
    type_config = TYPE_DEFAULTS.get(employment_type, {})

    return {
        "department": department,
        "employment_type": employment_type,
        "roles": dept_config["roles"],
        "required_skills": dept_config["required_skills"],
        "good_to_have_skills": dept_config["good_to_have_skills"],
        "portfolio_label": dept_config["portfolio_label"],
        "assignment_label": dept_config["assignment_label"],
        "screening_question_1": "",
        "screening_question_2": "",
        "screening_question_3": "",
        "extra_questions": [],
        "duration_options": type_config.get("duration_options", []),
        "year_of_study_options": type_config.get("year_of_study_options", []),
        "probation_options": type_config.get("probation_options", []),
        "notice_period_options": type_config.get("notice_period_options", []),
        "shift_timing_options": type_config.get("shift_timing_options", []),
        "is_custom": False,
    }
