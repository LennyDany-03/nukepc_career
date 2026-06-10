# Generated manually for job template config feature

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('jobs', '0003_remove_job_application_template_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='JobTemplateConfig',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('department', models.CharField(max_length=255)),
                ('employment_type', models.CharField(max_length=50)),
                ('roles', models.JSONField(default=list)),
                ('required_skills', models.JSONField(default=list)),
                ('good_to_have_skills', models.JSONField(default=list, blank=True)),
                ('portfolio_label', models.CharField(blank=True, default='', max_length=255)),
                ('assignment_label', models.CharField(blank=True, default='', max_length=255)),
                ('screening_question_1', models.CharField(blank=True, default='', max_length=255)),
                ('screening_question_2', models.CharField(blank=True, default='', max_length=255)),
                ('screening_question_3', models.CharField(blank=True, default='', max_length=255)),
                ('extra_questions', models.JSONField(blank=True, default=list)),
                ('duration_options', models.JSONField(blank=True, default=list)),
                ('year_of_study_options', models.JSONField(blank=True, default=list)),
                ('probation_options', models.JSONField(blank=True, default=list)),
                ('notice_period_options', models.JSONField(blank=True, default=list)),
                ('shift_timing_options', models.JSONField(blank=True, default=list)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'db_table': 'job_template_config',
                'unique_together': {('department', 'employment_type')},
            },
        ),
    ]
