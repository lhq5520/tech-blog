import { useState } from "react";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";
import { createPost } from "../api/posts";
import RichTextEditor from "../components/RichTextEditor";
import { useRequireAuth } from "../hooks/useRequireAuth";
import { useLogout } from "../hooks/useLogout";

const WritePost = () => {
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    content: "",
  });
  const [error, setError] = useState("");
  const handleLogout = useLogout();
  const { authLoading } = useRequireAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.title.trim() ||
      !formData.subtitle.trim() ||
      !formData.content.trim()
    ) {
      setError("All fields (Title, Subtitle, and Content) are required.");
      return;
    }

    try {
      const newPost = await createPost(formData);
      console.log("Post created:", newPost);

      setFormData({ title: "", subtitle: "", content: "" });
      setError("");
      alert("Post created successfully!");
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Failed to create post.");
    }
  };

  if (authLoading) {
    return <div>Loading...</div>; // You can display a loading indicator while auth is being checked
  }

  return (
    <Layout>
      <PageHeader
        title="Creation Time"
        subtitle="Let the flow of the words sliding through your vein"
        backgroundImage="/static/img/write.jpeg"
      />

      <div className="container mt-5 mb-5" style={{ maxWidth: "900px" }}>
        <div className="d-flex justify-content-end mb-3">
          <button onClick={handleLogout} className="btn btn-outline-secondary">
            Log Out
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-light p-5 rounded shadow-lg"
          style={{
            width: "100%",
          }}
        >
          {error && <div className="alert alert-danger">{error}</div>}

          <div className="row mb-4">
            <div className="col-md-12 mb-3">
              <label htmlFor="title" className="form-label">
                Title:
              </label>
              <input
                className="form-control form-control-lg"
                type="text"
                name="title"
                id="title"
                placeholder="Enter the title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-12 mb-3">
              <label htmlFor="subtitle" className="form-label">
                Subtitle:
              </label>
              <input
                className="form-control form-control-lg"
                type="text"
                name="subtitle"
                id="subtitle"
                placeholder="Enter the subtitle"
                value={formData.subtitle}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="content" className="form-label">
              Content:
            </label>
            <RichTextEditor
              value={formData.content}
              onChange={(content) => setFormData({ ...formData, content })}
            />
          </div>

          <div className="text-end">
            <button className="btn btn-primary px-5 py-2" type="submit">
              Post
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};
export default WritePost;
