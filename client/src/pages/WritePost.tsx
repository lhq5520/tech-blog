import { useState } from "react";
import PageLayout from "../components/PageLayout";
import { createPost } from "../api/posts";
import RichTextEditor from "../components/RichTextEditor";
import { useRequireAuth } from "../hooks/useRequireAuth";
import { showSuccess, showError } from "../utils/toast";

const WritePost = () => {
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    content: "",
  });
  const [error, setError] = useState("");
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
      showSuccess("Post created successfully!");
    } catch (error: any) {
      console.error("Error creating post:", error);
      const errorMessage = error?.message || "Failed to create post. Please check your connection and try again.";
      const errorDetails = error?.details || "This might be a network issue or server error.";
      setError(errorMessage);
      showError(errorMessage, errorDetails);
    }
  };

  if (authLoading) {
    return <div>Loading...</div>; // You can display a loading indicator while auth is being checked
  }

  return (
    <PageLayout
      title="Creation Time"
      subtitle="Let the flow of the words sliding through your vein"
    >
      <div className="container mt-5 mb-5" style={{ maxWidth: "900px" }}>
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
    </PageLayout>
  );
};
export default WritePost;
