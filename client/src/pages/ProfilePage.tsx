import { useState, useEffect } from "react";
import { fetchUserProfile } from "../api/user";
import { type User } from "../types";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";

const ProfilePage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const data = await fetchUserProfile(); // Fetch current user
        setUser(data); // Set user data
      } catch (error) {
        console.error("Error fetching current user:", error);
        setError("Failed to load user profile. Please log in again.");
      } finally {
        setLoading(false);
      }
    };

    loadCurrentUser();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-danger">{error}</p>;

  return (
    <Layout>
      <PageHeader
        title="Your Profile"
        subtitle="View your account details below."
        backgroundImage="/static/img/home-bg.jpg"
      />
      <div className="container mt-4 mb-5 text-center">
        {user && (
          <div className="profile">
            <h2>{user.email || "No Name"}</h2>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <p>
              <strong>Joined On:</strong>{" "}
              {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ProfilePage;
