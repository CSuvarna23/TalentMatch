import {
  Link,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";


function Navbar() {

  const {
    user,
    logout,
  } = useAuth();

  const navigate =
    useNavigate();


  function handleLogout() {

    logout();

    navigate("/login");

  }


  if (!user) {

    return (
      <nav className="navbar">

        <div className="navbar-brand">

          <Link to="/login">
             Recruitment Portal
          </Link>

        </div>


        <div className="navbar-links">

          <Link to="/login">
            Login
          </Link>

          <Link to="/register">
            Register
          </Link>

        </div>

      </nav>
    );
  }


  if (user.role === "candidate") {

    return (
      <nav className="navbar">

        <div className="navbar-brand">

          <Link to="/candidate/dashboard">
             Recruitment Portal
          </Link>

        </div>


        <div className="navbar-links">

          <Link to="/candidate/dashboard">
            Dashboard
          </Link>

          <Link to="/jobs">
            Jobs
          </Link>

          <Link to="/candidate/applications">
            My Applications
          </Link>

          <Link to="/candidate/profile">
            Profile
          </Link>

          <button
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </nav>
    );
  }


  // HR Navbar

  return (
    <nav className="navbar">

      <div className="navbar-brand">

        <Link to="/hr/dashboard">
           Recruitment Portal
        </Link>

      </div>


      <div className="navbar-links">

        <Link to="/hr/dashboard">
          Dashboard
        </Link>

        <Link to="/hr/manage-jobs">
          Jobs
        </Link>

        <Link to="/hr/profile">
          Profile
        </Link>

        <button
          onClick={handleLogout}
        >
          Logout
        </button>

      </div>

    </nav>
  );
}


export default Navbar;