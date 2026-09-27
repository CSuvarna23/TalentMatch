import spacy
from spacy.matcher import PhraseMatcher


# Load NLP model
nlp = spacy.load("en_core_web_sm")


# Skills that our system can recognize
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


# Create phrase matcher
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


def extract_skills(text: str) -> list[str]:

    doc = nlp(text)

    matches = matcher(doc)

    found_skills = []

    for match_id, start, end in matches:

        skill = doc[start:end].text

        if skill not in found_skills:
            found_skills.append(skill)

    return found_skills


if __name__ == "__main__":

    text = """
    I am a software developer with experience in Python,
    SQL, Pandas, Machine Learning and React.
    """

    skills = extract_skills(text)

    print(skills)