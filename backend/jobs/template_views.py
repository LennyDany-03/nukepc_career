from rest_framework import permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from .models import JobTemplateConfig
from .template_defaults import VALID_EMPLOYMENT_TYPES, get_default_config
from .template_serializers import JobTemplateConfigSerializer


def _serialize_config(config: dict) -> dict:
    return {
        "id": config.get("id"),
        "department": config["department"],
        "employment_type": config["employment_type"],
        "roles": config.get("roles", []),
        "required_skills": config.get("required_skills", []),
        "good_to_have_skills": config.get("good_to_have_skills", []),
        "portfolio_label": config.get("portfolio_label", ""),
        "assignment_label": config.get("assignment_label", ""),
        "screening_question_1": config.get("screening_question_1", ""),
        "screening_question_2": config.get("screening_question_2", ""),
        "screening_question_3": config.get("screening_question_3", ""),
        "extra_questions": config.get("extra_questions", []),
        "duration_options": config.get("duration_options", []),
        "year_of_study_options": config.get("year_of_study_options", []),
        "probation_options": config.get("probation_options", []),
        "notice_period_options": config.get("notice_period_options", []),
        "shift_timing_options": config.get("shift_timing_options", []),
        "is_custom": config.get("is_custom", False),
        "updated_at": config.get("updated_at"),
    }


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def get_template_config(request):
    department = request.query_params.get("department", "").strip()
    employment_type = request.query_params.get("type", "").strip().lower()

    if not department:
        return Response({"detail": "department query parameter is required."}, status=status.HTTP_400_BAD_REQUEST)
    if employment_type not in VALID_EMPLOYMENT_TYPES:
        return Response(
            {"detail": "type must be one of: internship, fresher, experienced."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    saved = JobTemplateConfig.objects.filter(
        department=department,
        employment_type=employment_type,
    ).first()

    if saved:
        data = JobTemplateConfigSerializer(saved).data
        data["is_custom"] = True
        return Response(_serialize_config(data))

    return Response(_serialize_config(get_default_config(department, employment_type)))


@api_view(["PUT"])
@permission_classes([permissions.IsAuthenticated])
def update_template_config(request):
    department = request.data.get("department", "").strip()
    employment_type = request.data.get("employment_type", "").strip().lower()

    if not department:
        return Response({"detail": "department is required."}, status=status.HTTP_400_BAD_REQUEST)
    if employment_type not in VALID_EMPLOYMENT_TYPES:
        return Response(
            {"detail": "employment_type must be one of: internship, fresher, experienced."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    defaults = get_default_config(department, employment_type)
    payload = {
        "roles": request.data.get("roles", defaults["roles"]),
        "required_skills": request.data.get("required_skills", defaults["required_skills"]),
        "good_to_have_skills": request.data.get("good_to_have_skills", defaults["good_to_have_skills"]),
        "portfolio_label": request.data.get("portfolio_label", defaults["portfolio_label"]),
        "assignment_label": request.data.get("assignment_label", defaults["assignment_label"]),
        "screening_question_1": request.data.get("screening_question_1", ""),
        "screening_question_2": request.data.get("screening_question_2", ""),
        "screening_question_3": request.data.get("screening_question_3", ""),
        "extra_questions": request.data.get("extra_questions", []),
        "duration_options": request.data.get("duration_options", defaults["duration_options"]),
        "year_of_study_options": request.data.get("year_of_study_options", defaults["year_of_study_options"]),
        "probation_options": request.data.get("probation_options", defaults["probation_options"]),
        "notice_period_options": request.data.get("notice_period_options", defaults["notice_period_options"]),
        "shift_timing_options": request.data.get("shift_timing_options", defaults["shift_timing_options"]),
    }

    instance, _ = JobTemplateConfig.objects.update_or_create(
        department=department,
        employment_type=employment_type,
        defaults=payload,
    )

    data = JobTemplateConfigSerializer(instance).data
    data["is_custom"] = True
    return Response(_serialize_config(data))
