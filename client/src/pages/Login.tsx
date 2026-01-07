import PageLayout from "../components/PageLayout";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Call the context login function with user data
      await login(email, password);
      // Clear any previous errors
      setError("");
      navigate("/");
    } catch (error) {
      console.error("Login error:", error); // Log for debugging
      setError("Invalid credentials."); // Show error message to the user
    }
  };

  const googleLogoSvg = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 48 48"
    >
      <path
        fill="#FFC107"
        d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
      />
      <path
        fill="#FF3D00"
        d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.223,0-9.654-3.343-11.303-8l-6.571,4.819C9.656,39.663,16.318,44,24,44z"
      />
      <path
        fill="#1976D2"
        d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.002,0.003-0.003l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
      />
    </svg>
  );

  return (
    <PageLayout
      title="Log In"
      subtitle={
        <label className="text-warning">
          Sorry, At this time, Login only reserve for Weifan
        </label>
      }
      backgroundImage="/static/img/bently.jpeg"
    >
      <section className="container mt-5 mb-5">
        <div className="row justify-content-center">
          <div className="col-12 col-md-10 col-lg-6">
            <div className="card shadow-lg border-0">
              <div className="card-body p-5">
                <h3 className="text-center mb-4 fw-bold">Login</h3>
                <form onSubmit={handleLogin}>
                  {/* Email Field */}
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label fw-bold">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="form-control form-control-lg"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  {/* Password Field */}
                  <div className="mb-3">
                    <label htmlFor="password" className="form-label fw-bold">
                      Password
                    </label>
                    <input
                      type="password"
                      id="password"
                      className="form-control form-control-lg"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div
                      className="alert alert-danger text-center"
                      role="alert"
                    >
                      {error}
                    </div>
                  )}

                  {/* Login Button */}
                  <div className="d-grid">
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg text-uppercase fw-bold"
                    >
                      Login
                    </button>
                  </div>

                  {/* dotted line to seperate */}
                  <div className="d-flex align-items-center my-3">
                    <hr className="flex-grow-1" />
                    <span className="mx-2 text-muted fw-bold">OR</span>
                    <hr className="flex-grow-1" />
                  </div>

                  {/* Google button */}
                  <div className="d-grid">
                    <a
                      href="http://localhost:5001/api/auth/google"
                      className="btn btn-lg btn-light bg-white border shadow-sm d-flex align-items-center justify-content-center gap-2 text-uppercase fw-bold text-dark position-relative overflow-hidden"
                    >
                      {googleLogoSvg}
                      <span>Google Signin</span>
                    </a>
                  </div>
                </form>

                {/* Register Link */}
                <p className="mt-3 text-center">
                  Don't have an account?{" "}
                  <a href="" className="text-decoration-none fw-bold">
                    <del>Register here</del>
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default Login;
