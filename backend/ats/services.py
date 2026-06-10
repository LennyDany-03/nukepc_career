import os
import json
import pypdf
from django.conf import settings
from .models import ScreeningResult

# Conditionally import google-generativeai to handle potential install discrepancies safely
try:
    import google.generativeai as genai
    HAS_GENAI = True
except ImportError:
    HAS_GENAI = False

def extract_text_from_pdf(pdf_path):
    if not pdf_path or not os.path.exists(pdf_path):
        return ""
    try:
        reader = pypdf.PdfReader(pdf_path)
        text = ""
        for page in reader.pages:
            t = page.extract_text()
            if t:
                text += t + "\n"
        return text
    except Exception as e:
        print("Error reading PDF:", e)
        return ""

def run_fallback_screening(job, app, resume_text):
    # Match skills
    job_skills = [s.lower().strip() for s in job.required_skills] if job.required_skills else []
    resume_lower = resume_text.lower() if resume_text else ""
    cover_lower = app.cover_letter.lower() if app.cover_letter else ""
    
    matching_skills = []
    missing_skills = []
    
    # Keyword scanning
    for skill in job_skills:
        # Check in resume text or cover letter
        if skill in resume_lower or skill in cover_lower:
            matching_skills.append(skill.title())
        else:
            missing_skills.append(skill.title())
            
    # Calculate score
    skill_score = 0
    if job_skills:
        skill_score = (len(matching_skills) / len(job_skills)) * 50 # Max 50 pts
    else:
        skill_score = 50 # If no skills specified, give full credit
        
    # Experience or CGPA score (Max 30 pts)
    exp_score = 15 
    exp_analysis = "Information was insufficient to analyze experience details."
    
    if app.total_experience:
        try:
            exp_yrs = float(app.total_experience)
            if exp_yrs >= 5:
                exp_score = 30
                exp_analysis = f"Candidate has extensive professional experience ({exp_yrs} years) showing deep seniority."
            elif exp_yrs >= 2:
                exp_score = 25
                exp_analysis = f"Candidate has a solid professional experience track record ({exp_yrs} years)."
            else:
                exp_score = 15
                exp_analysis = f"Candidate has limited professional experience ({exp_yrs} years), suitable for junior/mid roles."
        except:
            pass
    elif app.cgpa:
        try:
            cgpa_val = float(app.cgpa)
            if cgpa_val >= 8.5:
                exp_score = 30
                exp_analysis = f"Candidate has excellent academic performance with a high CGPA of {cgpa_val}."
            elif cgpa_val >= 7.0:
                exp_score = 25
                exp_analysis = f"Candidate has good academic standing with a CGPA of {cgpa_val}."
            else:
                exp_score = 15
                exp_analysis = f"Candidate has satisfactory academic standing with a CGPA of {cgpa_val}."
        except:
            pass
            
    # Profile completeness score (Max 20 pts)
    completeness = 0
    if app.cover_letter and len(app.cover_letter) > 20:
        completeness += 10
    if app.portfolio:
        completeness += 5
    if app.phone:
        completeness += 5
        
    total_score = int(skill_score + exp_score + completeness)
    total_score = min(max(total_score, 0), 100)
    
    # Fit level
    if total_score >= 80:
        fit_level = 'Strong Fit'
    elif total_score >= 55:
        fit_level = 'Moderate Fit'
    else:
        fit_level = 'Low Fit'
        
    # Summary & Recommendation
    skills_summary = f"Matches required skills: {', '.join(matching_skills) if matching_skills else 'none'}."
    if missing_skills:
        skills_summary += f" Missing key skills: {', '.join(missing_skills[:3])}."
        
    summary = f"Screened candidate {app.full_name} using fallback keyword engine. {skills_summary} {exp_analysis}"
    
    if fit_level == 'Strong Fit':
        recommendation = "Strong candidate matching key qualifications. Proceed directly to technical interview."
    elif fit_level == 'Moderate Fit':
        recommendation = "Good overall profile, though missing some preferred skills. Recommend scheduling a brief screening call."
    else:
        recommendation = "Match metrics are below the required qualifications threshold. Review for alternative roles or reject."
        
    return {
        "score": total_score,
        "fit_level": fit_level,
        "matching_skills": matching_skills,
        "missing_skills": missing_skills,
        "experience_analysis": exp_analysis,
        "summary": summary,
        "recommendation": recommendation
    }

def screen_application(application):
    job = application.job
    app = application
    
    # Extract text from resume PDF
    pdf_path = app.resume.path if app.resume else None
    resume_text = extract_text_from_pdf(pdf_path) if pdf_path else ""
    
    api_key = os.environ.get('GEMINI_API_KEY')
    result_data = None
    engine = 'fallback'
    
    if api_key and HAS_GENAI:
        try:
            skills_str = ', '.join(job.required_skills) if job.required_skills else 'None specified'
            desc_str = job.roles_responsibilities or 'Not provided'
            prompt = f"""
        You are an expert ATS (Applicant Tracking System) AI evaluator.
        Evaluate the candidate's application and resume against the job description and required skills.

        JOB PROFILE:
        Title: {job.job_title}
        Department: {job.department}
        Required Skills: {skills_str}
        Description: {desc_str}

        CANDIDATE DETAILS:
        Name: {app.full_name}
        Email: {app.email}
        Phone: {app.phone or 'N/A'}
        Academic (Internship): College: {app.college_name or 'N/A'}, Degree/Branch: {app.degree_branch or 'N/A'}, Year of Study: {app.year_of_study or 'N/A'}, CGPA: {app.cgpa or 'N/A'}
        Professional (Full-time): Company: {app.current_company or 'N/A'}, Experience: {app.total_experience or 'N/A'} years, Current CTC: {app.current_ctc or 'N/A'}, Expected CTC: {app.expected_ctc or 'N/A'}, Notice Period: {app.notice_period or 'N/A'} days
        Cover Letter: {app.cover_letter or 'N/A'}

        RESUME TEXT EXTRACT:
        {resume_text}

        Provide your evaluation in strict JSON format. DO NOT return any markdown wrapping, code blocks, or explanations outside the JSON object.
        Return exactly this JSON schema:
        {{"score": <integer from 0 to 100 representing match percentage>,"fit_level": "<'Strong Fit' | 'Moderate Fit' | 'Low Fit'>","matching_skills": [<list of candidate skills that match job required skills>],"missing_skills": [<list of job required skills that candidate is missing>],"experience_analysis": "<1-2 sentence analysis of how candidate's experience or academic background matches the job level>","summary": "<2-3 sentence summary evaluating candidate's overall fit and strengths/weaknesses>","recommendation": "<1 sentence recommendation on next steps (e.g. schedule coding round, schedule HR screen, reject)>"}}
        """
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-1.5-flash')
            response = model.generate_content(prompt)
            text = response.text.strip()
            
            # Clean up potential markdown formatting
            if text.startswith("```json"):
                text = text.split("```json")[1].split("```")[0].strip()
            elif text.startswith("```"):
                text = text.split("```")[1].split("```")[0].strip()
                
            result_data = json.loads(text)
            engine = 'gemini'
        except Exception as e:
            print("Gemini API screening failed, falling back to keyword engine. Error:", e)
            result_data = None
            
    if not result_data:
        result_data = run_fallback_screening(job, app, resume_text)
        engine = 'fallback'
        
    # Save or update screening results in DB
    screening, created = ScreeningResult.objects.update_or_create(
        application=application,
        defaults={
            'score': result_data.get('score', 0),
            'fit_level': result_data.get('fit_level', 'Low Fit'),
            'matching_skills': result_data.get('matching_skills', []),
            'missing_skills': result_data.get('missing_skills', []),
            'experience_analysis': result_data.get('experience_analysis', ''),
            'summary': result_data.get('summary', ''),
            'recommendation': result_data.get('recommendation', ''),
            'engine': engine
        }
    )
    return screening
