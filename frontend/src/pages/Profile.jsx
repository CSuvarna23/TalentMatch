import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";


function Profile() {

  const {
    user,
    logout,
  } = useAuth();

  const navigate =
    useNavigate();


  const roleName =
    user?.role === "hr"
      ? "HR"
      : "Candidate";


  const [editing, setEditing] =
    useState(false);


  const [formData, setFormData] =
    useState({
      name:
        user?.name || "",

      email:
        user?.email || "",
    });


  function handleChange(e) {

    setFormData({
      ...formData,

      [e.target.name]:
        e.target.value,
    });

  }


  function handleEdit() {

    setFormData({
      name:
        user?.name || "",

      email:
        user?.email || "",
    });

    setEditing(true);

  }


  function handleCancel() {

    setFormData({
      name:
        user?.name || "",

      email:
        user?.email || "",
    });

    setEditing(false);

  }


  function handleSave(e) {

    e.preventDefault();

    /*
      This is currently frontend-only.
      A backend user update endpoint can
      be connected here later.
    */

    alert(
      "Profile changes saved."
    );

    setEditing(false);

  }


  function handleLogout() {

    logout();

    navigate("/login");

  }


  return (
    <div className="profile-page">

      <div className="profile-header">

        <div>

          <h1>
            My Profile
          </h1>

          <p>
            Manage your personal
            information and account.
          </p>

        </div>

      </div>


      <div className="profile-card">

        <div className="profile-top">

          <div className="profile-avatar">

            {(user?.name || roleName)
              .charAt(0)
              .toUpperCase()}

          </div>


          <div className="profile-heading">

            <h2>
              {user?.name ||
                roleName}
            </h2>

            <p>
              {user?.email}
            </p>

            <span className="profile-role">
              {roleName}
            </span>

          </div>

        </div>


        {!editing ? (

          <>

            <div className="profile-details">

              <div className="profile-field">

                <span className="profile-label">
                  Full Name
                </span>

                <span className="profile-value">
                  {user?.name ||
                    "Not provided"}
                </span>

              </div>


              <div className="profile-field">

                <span className="profile-label">
                  Email Address
                </span>

                <span className="profile-value">
                  {user?.email ||
                    "Not provided"}
                </span>

              </div>


              <div className="profile-field">

                <span className="profile-label">
                  Account Type
                </span>

                <span className="profile-value">
                  {roleName}
                </span>

              </div>

            </div>


            <div className="profile-actions">

              <button
                className="button"
                onClick={handleEdit}
              >
                Edit Profile
              </button>


              <button
                className="button danger"
                onClick={handleLogout}
              >
                Logout
              </button>

            </div>

          </>

        ) : (

          <form
            className="profile-edit-form"
            onSubmit={handleSave}
          >

            <div className="profile-form-group">

              <label>
                Full Name
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />

            </div>


            <div className="profile-form-group">

              <label>
                Email Address
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />

            </div>


            <div className="profile-edit-actions">

              <button
                type="submit"
                className="button"
              >
                Save Changes
              </button>


              <button
                type="button"
                className="button secondary"
                onClick={handleCancel}
              >
                Cancel
              </button>

            </div>

          </form>

        )}

      </div>

    </div>
  );
}


export default Profile;