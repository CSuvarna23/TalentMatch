import { useEffect, useState } from "react";

import ApplicationCard from "../components/ApplicationCard";
import {
  getMyApplications,
} from "../services/applicationService";

function MyApplications() {
  const [applications, setApplications] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadApplications() {
      try {
        const data =
          await getMyApplications();

        setApplications(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadApplications();
  }, []);

  if (loading) {
    return (
      <div className="container">
        <h2>Loading applications...</h2>
      </div>
    );
  }

  return (
    <div className="candidate-dashboard">

      <div className="candidate-welcome">
        <h1>My Applications</h1>
        <p>
          Track your job applications and
          application status.
        </p>
      </div>

      {error && (
        <div className="error">
          {error}
        </div>
      )}

      {applications.length === 0 ? (
        <p>
          You haven't applied for any jobs yet.
        </p>
      ) : (
        <div className="application-list">
          {applications.map(
            (application) => (
              <ApplicationCard
                key={
                  application.application_id
                }
                application={application}
              />
            )
          )}
        </div>
      )}

    </div>
  );
}

export default MyApplications;