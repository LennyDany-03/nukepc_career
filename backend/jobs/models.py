from django.db import models
from django.conf import settings

class Job(models.Model):
    title = models.CharField(max_length=255)
    department = models.CharField(max_length=100)
    location = models.CharField(max_length=255)
    employment_type = models.CharField(max_length=50, choices=[('internship', 'Internship'), ('fulltime', 'Full-time')], null=True, blank=True)
    description = models.TextField()
    skills = models.JSONField(default=list, blank=True)
    min_salary = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    max_salary = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    salary_frequency = models.CharField(max_length=20, default='annual')
    application_deadline = models.DateField(null=True, blank=True)
    application_template = models.CharField(max_length=50, default='fulltime')
    status = models.CharField(max_length=50, default='published', choices=[('draft', 'Draft'), ('published', 'Published')])
    
    # Custom Application Form Settings
    customize_resume = models.BooleanField(default=True)
    customize_cover_letter = models.BooleanField(default=True)
    customize_portfolio = models.BooleanField(default=False)
    customize_phone = models.BooleanField(default=False)
    
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='jobs')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title
