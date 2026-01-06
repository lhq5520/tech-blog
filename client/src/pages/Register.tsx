import PageLayout from "../components/PageLayout";

const Register = () => {
  return (
    <PageLayout
      title="Registration Closed"
      subtitle="Oops!"
      backgroundImage="/static/img/home-bg.jpg"
    >
      <div className="container mt-5 mb-5 text-center">
        <h2>Sorry!</h2>
        <p className="lead">
          This page doesn't seem to be open to the public at this time.
        </p>
        <a href="/" className="btn btn-primary mt-3">
          Back to Home
        </a>
      </div>
    </PageLayout>
  );
};

export default Register;

/*
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../api/auth";
import PageHeader from "../components/PageHeader";
import Layout from "../components/Layout";
import Footer from "../components/Footer";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(email, password);
      navigate("/login");
    } catch (err) {
      setError("Error registering user.");
    }
  };

  return (
    <Layout>
      <PageHeader
        title="Register"
        subtitle=""
        backgroundImage="/static/img/bently.jpeg"
      />
      <div className="container my-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card shadow-sm">
              <div className="card-body">
                <h3 className="text-center mb-4">Register</h3>
                <form onSubmit={handleRegister}>
                  <div className="form-group mb-3">
                    <label htmlFor="email" className="form-label">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="form-control"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="form-group mb-3">
                    <label htmlFor="password" className="form-label">
                      Password
                    </label>
                    <input
                      type="password"
                      id="password"
                      className="form-control"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  {error && <div className="alert alert-danger">{error}</div>}
                  <div className="d-grid">
                    <button type="submit" className="btn btn-primary btn-block">
                      Register
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </Layout>
  );
};

export default Register;
*/
