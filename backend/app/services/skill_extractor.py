import re

import spacy
from spacy.matcher import PhraseMatcher


# =========================================
# Load spaCy NLP model
# =========================================

nlp = spacy.load("en_core_web_sm")


# =========================================
# Skills that our system can recognize
# =========================================

SKILL_LIST = [
    "Python",
    "Java",
    "JavaScript",
    "React",
    "Angular",
    "Vue",
    "HTML",
    "CSS",
    "Bootstrap",
    "Tailwind CSS",
    "Django",
    "Flask",
    "FastAPI",
    "Node.js",
    "SQL",
    "MySQL",
    "PostgreSQL",
    "MongoDB",
    "Git",
    "GitHub",
    "Docker",
    "AWS",
    "Azure",
    "Machine Learning",
    "Deep Learning",
    "Artificial Intelligence",
    "Pandas",
    "NumPy",
    "Power BI",
    "Tableau",
    "Excel",
    "C#",
    "ASP.NET"
]


# =========================================
# Create PhraseMatcher
# =========================================

matcher = PhraseMatcher(
    nlp.vocab,
    attr="LOWER"
)


# Convert skills into NLP patterns
patterns = [
    nlp.make_doc(skill)
    for skill in SKILL_LIST
]


matcher.add("SKILLS", patterns)


# =========================================
# Text preprocessing
# =========================================

def preprocess_text(text: str) -> str:
    """
    Basic NLP preprocessing before semantic matching.

    The original text is preserved as much as possible,
    while unnecessary whitespace is removed.
    """

    if not text:
        return ""

    # Replace multiple spaces/newlines with one space
    text = re.sub(r"\s+", " ", text)

    # Remove leading/trailing whitespace
    text = text.strip()

    return text


# =========================================
# Skill Extraction
# =========================================

def extract_skills(text: str) -> list[str]:
    """
    Extract skills from resume/job text using spaCy
    PhraseMatcher.

    Returns:
        List of detected skills.
    """

    if not text:
        return []

    text = preprocess_text(text)

    doc = nlp(text)

    matches = matcher(doc)

    found_skills = []

    for match_id, start, end in matches:

        skill = doc[start:end].text.strip()

        # Avoid duplicate skills
        if skill.lower() not in {
            existing.lower()
            for existing in found_skills
        }:
            found_skills.append(skill)

    return found_skills


# =========================================
# Example
# =========================================

if __name__ == "__main__":

    text = """
    I am a software developer with experience in Python,
    SQL, Pandas, Machine Learning and React.
    """

    skills = extract_skills(text)

    print("Extracted Skills:")
    print(skills)