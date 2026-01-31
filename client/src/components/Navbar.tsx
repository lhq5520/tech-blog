import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLogout } from "../hooks/useLogout";

// Cloudinary logo URL - can be changed to other logo URL
// or read from environment variable: import.meta.env.VITE_NAVBAR_LOGO_URL
const NAVBAR_LOGO_URL = import.meta.env.VITE_NAVBAR_LOGO_URL || 
  "https://res.cloudinary.com/dkrmixgjd/image/upload/v1769899278/E6573B98F86F1F28C8E3FCABE4778694_vnndhi.jpg";

const Navbar = () => {
  const { user } = useAuth();
  const handleLogout = useLogout();

  return (
    <nav className="navbar navbar-expand-lg navbar-light" id="mainNav">
      <div className="container px-4 px-lg-5">
        <Link className="navbar-brand" to="/" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <img 
            src={NAVBAR_LOGO_URL} 
            alt="Logo" 
            style={{ 
              height: "40px", 
              width: "40px", 
              objectFit: "cover",
              borderRadius: "50%",
              border: "2px solid rgba(255, 255, 255, 0.3)"
            }}
            loading="eager"
          />
          <span>BO</span>
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarResponsive"
          aria-controls="navbarResponsive"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          Menu
          <i className="fas fa-bars"></i>
        </button>
        <div className="collapse navbar-collapse" id="navbarResponsive">
          <ul className="navbar-nav ms-auto py-4 py-lg-0">
            <li className="nav-item">
              <Link className="nav-link px-lg-3 py-3 py-lg-4" to="/">
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link px-lg-3 py-3 py-lg-4" to="/about">
                About
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link px-lg-3 py-3 py-lg-4" to="/contact">
                Contact
              </Link>
            </li>

            {user ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link px-lg-3 py-3 py-lg-4" to="/write">
                    Create Post
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    to="#"
                    className="nav-link px-lg-3 py-3 py-lg-4 btn btn-link"
                    onClick={(e) => {
                      e.preventDefault();
                      handleLogout();
                    }}
                  >
                    Logout
                  </Link>
                </li>
              </>
            ) : (
              <li className="nav-item">
                <Link className="nav-link px-lg-3 py-3 py-lg-4" to="/login">
                  Login
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
