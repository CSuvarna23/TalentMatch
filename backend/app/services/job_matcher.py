def calculate_match(resume_skills, required_skills):
    resume_skills = {
        skill.strip().lower()
        for skill in resume_skills
    }

    required_skills = {
        skill.strip().lower()
        for skill in required_skills
    }

    matched_skills = resume_skills.intersection(required_skills)

    missing_skills = required_skills - resume_skills

    if not required_skills:
        match_score = 0
    else:
        match_score = (
            len(matched_skills) / len(required_skills)
        ) * 100

    return {
        "match_score": round(match_score, 2),
        "matched_skills": sorted(matched_skills),
        "missing_skills": sorted(missing_skills)
    }


from app.services.skill_extractor import extract_skills


if __name__ == "__main__":

    resume_text = """
    I am a software developer with experience in Python,
    SQL, Pandas, Machine Learning and React.
    """

    required_skills = [
        "Python",
        "SQL",
        "Pandas",
        "Machine Learning",
        "Power BI"
    ]

    # Extract skills from resume
    resume_skills = extract_skills(resume_text)

    print("Extracted Resume Skills:")
    print(resume_skills)

    # Compare resume skills with job requirements
    result = calculate_match(
        resume_skills,
        required_skills
    )

    print("\nMatch Result:")
    print(result)