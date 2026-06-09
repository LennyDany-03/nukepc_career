from django.db import models
from applications.models import Application

class ScreeningResult(models.Model):
    application = models.OneToOneField(Application, on_delete=models.CASCADE, related_name='screening')
    score = models.IntegerField(default=0)
    fit_level = models.CharField(max_length=50, default='Low Fit') # 'Strong Fit', 'Moderate Fit', 'Low Fit'
    matching_skills = models.JSONField(default=list)
    missing_skills = models.JSONField(default=list)
    experience_analysis = models.TextField(null=True, blank=True)
    summary = models.TextField(null=True, blank=True)
    recommendation = models.TextField(null=True, blank=True)
    engine = models.CharField(max_length=50, default='fallback') # 'gemini' or 'fallback'
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Screening: {self.application.full_name} ({self.score}%)"
