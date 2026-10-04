from typing import List

import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

from app.services.skill_extractor import (
    extract_skills,
    preprocess_text
)


# =========================================
# Load Semantic ML Model
# =========================================

# This is a pretrained Sentence Transformer model.
#
# It converts text into numerical embeddings that
# represent semantic meaning.
#
# Example:
#
# "Machine learning experience"
#
# and
#
# "Developed predictive models using Python"
#
# can have a high semantic similarity even when
# the exact words are different.

semantic_model = None


def get_semantic_model():
    global semantic_model

    if semantic_model is None:
        semantic_model = SentenceTransformer(
            "all-MiniLM-L6-v2"
        )

    return semantic_model


# =========================================
# Configuration
# =========================================

SKILL_WEIGHT = 0.70
SEMANTIC_WEIGHT = 0.30
CATEGORY_WEIGHT = 0.10


# =========================================
# Semantic Similarity
# =========================================

def calculate_semantic_similarity(
    resume_text: str,
    job_text: str
) -> float:
    """
    Calculate semantic similarity between a resume
    and a job description.

    Sentence Transformer converts both texts into
    embeddings and cosine similarity is used to
    measure their semantic closeness.

    Returns:
        Similarity score between 0 and 100.
    """

    resume_text = preprocess_text(resume_text)
    job_text = preprocess_text(job_text)

    if not resume_text or not job_text:
        return 0.0

    # Convert text into embeddings
    embeddings = get_semantic_model().encode(
        [
            resume_text,
            job_text
        ],
        convert_to_numpy=True,
        normalize_embeddings=True
    )

    resume_embedding = embeddings[0].reshape(1, -1)
    job_embedding = embeddings[1].reshape(1, -1)

    # Calculate cosine similarity
    similarity = cosine_similarity(
        resume_embedding,
        job_embedding
    )[0][0]

    # Convert -1 to 1 range into 0 to 100
    similarity_score = (
        max(0.0, min(1.0, float(similarity)))
        * 100
    )

    return round(similarity_score, 2)


# =========================================
# Skill Match Calculation
# =========================================

def calculate_skill_match(
    resume_skills: List[str],
    required_skills: List[str]
):
    """
    Calculate traditional skill-based matching.
    """

    resume_skill_set = {
        skill.strip().lower()
        for skill in resume_skills
        if skill and skill.strip()
    }

    required_skill_set = {
        skill.strip().lower()
        for skill in required_skills
        if skill and skill.strip()
    }

    matched_skills = (
        resume_skill_set.intersection(
            required_skill_set
        )
    )

    missing_skills = (
        required_skill_set - resume_skill_set
    )

    if not required_skill_set:
        skill_score = 0.0
    else:
        skill_score = (
            len(matched_skills)
            / len(required_skill_set)
        ) * 100

    return {
        "skill_score": round(skill_score, 2),
        "matched_skills": sorted(matched_skills),
        "missing_skills": sorted(missing_skills)
    }


def calculate_category_match(
    resume_category: str = "",
    job_category: str = ""
) -> float:
    """Return 100 when normalized categories match, otherwise 0."""

    if not resume_category or not job_category:
        return 0.0

    return 100.0 if (
        resume_category.strip().casefold()
        == job_category.strip().casefold()
    ) else 0.0


# =========================================
# Final AI Match Calculation
# =========================================

def calculate_match(
    resume_skills: List[str],
    required_skills: List[str],
    resume_text: str = "",
    job_text: str = "",
    resume_category: str = "",
    job_category: str = ""
):
    """
    Calculate the final candidate-job match.

    The final score combines:

    1. Skill matching
    2. Semantic similarity

    Formula:

        Final Score =
            Skill Score * 70%
            +
            Semantic Score * 30%

    This provides a better representation of the
    candidate-job relationship than exact keyword
    matching alone.
    """

    # -----------------------------------------
    # 1. Traditional skill matching
    # -----------------------------------------

    skill_result = calculate_skill_match(
        resume_skills,
        required_skills
    )

    skill_score = skill_result["skill_score"]


    # -----------------------------------------
    # 2. Semantic matching
    # -----------------------------------------

    semantic_score = calculate_semantic_similarity(
        resume_text,
        job_text
    )

    category_score = calculate_category_match(
        resume_category,
        job_category
    )


    # -----------------------------------------
    # 3. Combine scores
    # -----------------------------------------

    final_score = (
        skill_score * 0.60
        +
        semantic_score * 0.30
        +
        category_score * CATEGORY_WEIGHT
    )


    # -----------------------------------------
    # 4. Return complete result
    # -----------------------------------------

    return {
        "match_score": round(final_score, 2),

        "skill_match_score": skill_score,

        "semantic_similarity_score":
            semantic_score,

        "category_match_score": category_score,

        "matched_skills":
            skill_result["matched_skills"],

        "missing_skills":
            skill_result["missing_skills"]
    }


# =========================================
# Example / Testing
# =========================================

if __name__ == "__main__":

    resume_text = """
    I am a software developer with experience
    developing backend applications using Python
    and FastAPI. I have worked with SQL databases,
    Pandas and machine learning models.
    """

    required_skills = [
        "Python",
        "SQL",
        "Pandas",
        "Machine Learning",
        "Power BI"
    ]

    job_text = """
    We are looking for a Python backend developer
    with experience in API development, databases,
    data analysis and machine learning.
    """

    # Extract skills from resume
    resume_skills = extract_skills(
        resume_text
    )

    print("Extracted Resume Skills:")
    print(resume_skills)


    # Calculate AI match
    result = calculate_match(
        resume_skills=resume_skills,
        required_skills=required_skills,
        resume_text=resume_text,
        job_text=job_text
    )


    print("\nAI Match Result:")
    print(result)


    print("\nSkill Match Score:")
    print(
        result["skill_match_score"]
    )


    print("\nSemantic Similarity:")
    print(
        result["semantic_similarity_score"]
    )


    print("\nFinal Match Score:")
    print(
        result["match_score"]
    )