import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  getJob,
  updateJob,
} from "../services/jobService";


function EditJob() {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    job_title: "",
    description: "",
    required_skills: "",
    experience: "",
    location: "",
  });

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);


  useEffect(() => {
    async function loadJob() {
      try {
        const job =
          await getJob(jobId);

        setFormData({
          job_title:
            job.job_title || "",

          description:
            job.description || "",

          required_skills:
            job.required_skills || "",

          experience:
            job.experience || "",

          location:
            job.location || "",
        });

      } catch (error) {
        alert(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadJob();
  }, [jobId]);


  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]:
        e.target.value,
    });
  }


  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setSaving(true);

      await updateJob(
        jobId,
        formData
      );

      alert(
        "Job updated successfully!"
      );

      navigate("/hr/manage-jobs");

    } catch (error) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  }


  if (loading) {
    return (
      <div className="container">
        <h2>
          Loading job...
        </h2>
      </div>
    );
  }


  return (
    <div className="container">

      <div className="form-card">

        <h1>
          Edit Job
        </h1>

        <form
          onSubmit={handleSubmit}
        >

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
            Job Description
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
            value={
              formData.required_skills
            }
            onChange={handleChange}
            placeholder="Python, SQL, React"
            required
          />


          <label>
            Experience
          </label>

          <input
            name="experience"
            value={
              formData.experience
            }
            onChange={handleChange}
            placeholder="1+ years"
            required
          />


          <label>
            Location
          </label>

          <input
            name="location"
            value={
              formData.location
            }
            onChange={handleChange}
            required
          />


          <div
            className="button-row"
          >

            <button
              className="button"
              type="submit"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>


            <button
              type="button"
              className="button secondary"
              onClick={() =>
                navigate(
                  "/hr/manage-jobs"
                )
              }
            >
              Cancel
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default EditJob;