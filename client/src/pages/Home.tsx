// Home.js
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";
import Footer from "../components/Footer";
import Blog from "../components/Blog";
import { fetchPosts, deletePost } from "../api/posts";
import { useAuth } from "../context/AuthContext"; // Import the useAuth hook
import { type Post } from "../types";

const Home = () => {
  const [blogs, setBlogs] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Step 1: Get the user data from context
  const { user, authLoading, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadBlogs = async () => {
      if (user) {
        try {
          const data = await fetchPosts(); // Fetch posts based on user.id
          setBlogs(data);
        } catch (error) {
          console.error("Error fetching user blogs:", error);
        }
      } else {
        navigate("/login"); // Redirect to visitor page if not logged in
      }
      setLoading(false);
    };

    if (!authLoading) {
      loadBlogs();
    }
  }, [user, authLoading, navigate]);

  const handleEdit = (updatedBlog: Post) => {
    try {
      setBlogs((prev) =>
        prev.map((b) => (b._id === updatedBlog._id ? updatedBlog : b))
      );
    } catch (error) {
      console.error("Error updating blog:", error);
      alert("Failed to update blog.");
    }
  };

  // Handle delete logic in the parent component
  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this blog?")) {
      try {
        await deletePost(id); // Perform the API call to delete
        setBlogs((prev) => prev.filter((b) => b._id !== id)); // Remove blog from the state
        alert("Blog deleted successfully!");
      } catch (error) {
        console.error("Error deleting blog:", error);
        alert("Failed to delete blog.");
      }
    }
  };

  const handleLogout = async (): Promise<void> => {
    await logout();
    navigate("/login");
  };

  return (
    <Layout>
      <PageHeader
        title="Bytes Odyssey"
        subtitle={
          <Link to="/profile" className="text-white">
            {" "}
            Click Here To View Profile
          </Link>
        }
        backgroundImage="/static/img/vechicle.jpg"
      />
      <div className="d-flex justify-content-end mb-3">
        <button onClick={handleLogout} className="btn btn-outline-secondary">
          Log Out
        </button>
      </div>

      <section className="container mt-4 mb-5">
        {authLoading ? (
          <p>Loading authentication...</p>
        ) : loading ? (
          <p>Loading blogs...</p>
        ) : blogs.length === 0 ? (
          <p>No posts available. Create your first blog!</p>
        ) : (
          blogs.map((blog) => (
            <Blog
              key={blog._id}
              blog={blog}
              onEdit={handleEdit}
              onDelete={handleDelete} // Pass down the delete function as prop
            />
          ))
        )}
      </section>

      <Footer />
    </Layout>
  );
};

export default Home;
