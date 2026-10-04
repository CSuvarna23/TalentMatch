import { useState } from "react";
import {
  useNavigate,
} from "react-router-dom";

import {
  createJob,
} from "../services/jobService";

function CreateJob() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    job_title: "",
    category: "",
    description: "",
    required_skills: "",
    experience: "",
    location: "",
  });

  const [loading, setLoading] =
    useState(false);

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setLoading(true);

      await createJob(formData);

      alert("Job created successfully!");

      navigate("/hr/dashboard");
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <div className="form-card">
        <h1>Create Job</h1>

        <form onSubmit={handleSubmit}>
          <label>
            Job Title
          </label>

          <input
            name="job_title"
            value={formData.job_title}
            onChange={handleChange}
            required
          />

          <label>
            Job Category
          </label>

          <input
            name="category"
            placeholder="HR, Software Development, Finance"
            value={formData.category}
            onChange={handleChange}
            required
          />

          <label>
            Description
          </label>

          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />

          <label>
            Required Skills
          </label>

          <input
            name="required_skills"
            placeholder="Python, SQL, React"
            value={
              formData.required_skills
            }
            onChange={handleChange}
            required
          />

          <label>
            Experience
          </label>

          <input
            name="experience"
            placeholder="1+ years"
            value={formData.experience}
            onChange={handleChange}
            required
          />

          <label>
            Location
          </label>

          <input
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
          />

          <button
            className="button"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Creating..."
              : "Create Job"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateJob;