import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";
import Footer from "../components/Footer";
import BlogCard from "../components/BlogCard";
import { fetchPosts, deletePost } from "../api/posts";
import { useAuth } from "../context/AuthContext";
import { useLogout } from "../hooks/useLogout";
import { useFetch } from "../hooks/useFetch";
import { type Post } from "../types";
import { Link } from "react-router-dom";

const Home = () => {
  const {
    data: blogs,
    setData: setBlogs,
    loading,
  } = useFetch<Post[]>(fetchPosts);
  const { user } = useAuth();
  const handleLogout = useLogout();

  const handleEdit = (updatedBlog: Post) => {
    setBlogs((prev) =>
      prev ? prev.map((b) => (b._id === updatedBlog._id ? updatedBlog : b)) : []
    );
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this blog?")) {
      try {
        await deletePost(id);
        setBlogs((prev) => (prev ? prev.filter((b) => b._id !== id) : []));
        alert("Blog deleted successfully!");
      } catch (error) {
        console.error("Error deleting blog:", error);
        alert("Failed to delete blog.");
      }
    }
  };

  return (
    <Layout>
      <PageHeader
        title="Bytes Odyssey"
        subtitle={
          user ? (
            <Link to="/profile" className="text-white">
              Click Here To View Profile
            </Link>
          ) : (
            "Welcome to my blog"
          )
        }
        backgroundImage="/static/img/vechicle.jpg"
      />
      <div className="d-flex justify-content-end mb-3">
        {user && (
          <button onClick={handleLogout} className="btn btn-outline-secondary">
            Log Out
          </button>
        )}
      </div>

      <section className="container mt-4 mb-5">
        {loading ? (
          <p>Loading blogs...</p>
        ) : !blogs || blogs.length === 0 ? (
          <p>No posts available.</p>
        ) : (
          blogs.map((blog) => (
            <BlogCard
              key={blog._id}
              blog={blog}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        )}
      </section>

      <Footer />
    </Layout>
  );
};

export default Home;
