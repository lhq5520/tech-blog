import { fetchUserProfile } from "../api/user";
import { type User } from "../types";
import PageLayout from "../components/PageLayout";
import { useRequireAuth } from "../hooks/useRequireAuth";
import { useFetch } from "../hooks/useFetch";

const ProfilePage = () => {
  const { authLoading } = useRequireAuth();
  const { data: user, loading, error } = useFetch<User>(fetchUserProfile);

  if (authLoading || loading) return <p>Loading...</p>;
  if (error) return <p className="text-danger">{error}</p>;

  return (
    <PageLayout
      title="Your Profile"
      subtitle="View your account details below."
      backgroundImage="/static/img/home-bg.jpg"
    >
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
    </PageLayout>
  );
};

export default ProfilePage;
