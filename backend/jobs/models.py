from django.db import models
from django.conf import settings

class Job(models.Model):
    # Job Overview
    job_title = models.CharField(max_length=255, null=True, blank=True)
    role = models.CharField(max_length=255, null=True, blank=True)
    department = models.CharField(max_length=255, null=True, blank=True)
    employment_type = models.CharField(max_length=50, null=True, blank=True)  # Internship / Full-time
    candidate_level = models.CharField(max_length=50, null=True, blank=True)  # Fresher / Experienced / null for internship
    number_of_openings = models.IntegerField(null=True, blank=True)
    internship_duration = models.CharField(max_length=100, null=True, blank=True)  # null if full-time
    work_mode = models.CharField(max_length=50, null=True, blank=True)  # Remote / In-office / Hybrid
    office_location = models.CharField(max_length=255, null=True, blank=True)
    shift_timing = models.CharField(max_length=100, null=True, blank=True)  # null if internship

    application_deadline = models.DateField(null=True, blank=True)
    expected_joining_date = models.DateField(null=True, blank=True)

    # Compensation / Stipend
    stipend_amount = models.IntegerField(null=True, blank=True)  # null if full-time
    stipend_visible = models.BooleanField(default=True)
    ctc_min = models.FloatField(null=True, blank=True)  # null if internship
    ctc_max = models.FloatField(null=True, blank=True)  # null if internship
    salary_visible = models.BooleanField(default=True)
    probation_period = models.CharField(max_length=100, null=True, blank=True)  # null if experienced or internship
    probation_stipend = models.IntegerField(null=True, blank=True)  # optional
    notice_period = models.CharField(max_length=100, null=True, blank=True)  # null if fresher or internship
    performance_bonus = models.BooleanField(default=False)
    performance_bonus_description = models.TextField(null=True, blank=True)  # optional
    other_compensation = models.TextField(null=True, blank=True)  # optional

    # Requirements
    min_education = models.CharField(max_length=255, null=True, blank=True)
    preferred_branch = models.CharField(max_length=255, null=True, blank=True)
    min_cgpa = models.FloatField(null=True, blank=True)  # optional
    year_of_study = models.CharField(max_length=100, null=True, blank=True)  # null if full-time
    graduation_year = models.IntegerField(null=True, blank=True)  # null if internship
    min_experience = models.IntegerField(null=True, blank=True)  # null if fresher or internship
    max_experience = models.IntegerField(null=True, blank=True)  # optional
    required_skills = models.JSONField(default=list)
    good_to_have_skills = models.JSONField(default=list, blank=True)
    portfolio_required = models.BooleanField(default=False)
    assignment_round = models.BooleanField(default=False)
    assignment_description = models.TextField(null=True, blank=True)  # optional
    certifications = models.TextField(null=True, blank=True)  # optional
    previous_industry_experience = models.TextField(null=True, blank=True)  # optional
    led_team = models.BooleanField(null=True, blank=True)  # null if not experienced

    # Job Description
    roles_responsibilities = models.TextField(null=True, blank=True)
    what_intern_learns = models.TextField(null=True, blank=True)  # null if full-time
    what_we_offer = models.TextField(null=True, blank=True)  # null if internship
    growth_path = models.TextField(null=True, blank=True)  # null if internship or experienced
    team_structure = models.TextField(null=True, blank=True)  # null if internship or fresher
    perks_benefits = models.TextField(null=True, blank=True)
    additional_info = models.TextField(null=True, blank=True)  # optional

    # Screening Questions
    screening_question_1 = models.CharField(max_length=255, null=True, blank=True)
    screening_question_2 = models.CharField(max_length=255, null=True, blank=True)
    screening_question_3 = models.CharField(max_length=255, null=True, blank=True)

    # Post Settings
    status = models.CharField(max_length=50, default='Draft')  # Draft / Published / Scheduled
    scheduled_date = models.DateTimeField(null=True, blank=True)
    notify_team = models.BooleanField(default=False)

    # Metadata
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='jobs')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'job_jobs'

    def __str__(self):
        return self.job_title if self.job_title else "Untitled Job"


class JobTemplateConfig(models.Model):
    department = models.CharField(max_length=255)
    employment_type = models.CharField(max_length=50)  # internship / fresher / experienced
    roles = models.JSONField(default=list)
    required_skills = models.JSONField(default=list)
    good_to_have_skills = models.JSONField(default=list, blank=True)
    portfolio_label = models.CharField(max_length=255, blank=True, default="")
    assignment_label = models.CharField(max_length=255, blank=True, default="")
    screening_question_1 = models.CharField(max_length=255, blank=True, default="")
    screening_question_2 = models.CharField(max_length=255, blank=True, default="")
    screening_question_3 = models.CharField(max_length=255, blank=True, default="")
    extra_questions = models.JSONField(default=list, blank=True)
    duration_options = models.JSONField(default=list, blank=True)
    year_of_study_options = models.JSONField(default=list, blank=True)
    probation_options = models.JSONField(default=list, blank=True)
    notice_period_options = models.JSONField(default=list, blank=True)
    shift_timing_options = models.JSONField(default=list, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "job_template_config"
        unique_together = ("department", "employment_type")

    def __str__(self):
        return f"{self.department} — {self.employment_type}"
