from django.db import models
from jobs.models import Job

class Application(models.Model):
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='applications')
    full_name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=50, null=True, blank=True)
    portfolio = models.URLField(max_length=500, null=True, blank=True)
    cover_letter = models.TextField(null=True, blank=True)
    resume = models.FileField(upload_to='resumes/', null=True, blank=True)
    
    # Internship template fields
    college_name = models.CharField(max_length=255, null=True, blank=True)
    degree_branch = models.CharField(max_length=255, null=True, blank=True)
    year_of_study = models.IntegerField(null=True, blank=True)
    cgpa = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    
    # Full-time template fields
    current_company = models.CharField(max_length=255, null=True, blank=True)
    total_experience = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    current_ctc = models.CharField(max_length=100, null=True, blank=True)
    expected_ctc = models.CharField(max_length=100, null=True, blank=True)
    notice_period = models.IntegerField(null=True, blank=True)
    
    # Pipeline stage & status fields
    stage = models.CharField(max_length=100, default='Applied')
    status = models.CharField(max_length=100, default='Pending Review')
    recruiter_notes = models.TextField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.full_name} - {self.job.title}"

class Interview(models.Model):
    application = models.ForeignKey(Application, on_delete=models.CASCADE, related_name='interviews')
    scheduled_at = models.DateTimeField()
    meeting_link = models.URLField(max_length=500, null=True, blank=True)
    notes = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Interview: {self.application.full_name} at {self.scheduled_at}"
