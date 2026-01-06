import { useState, useEffect } from "react";
import Layout from "./Layout";
import PageHeader from "./PageHeader";
import { fetchSinglePost, updatePost } from "../api/posts";
import { useParams } from "react-router-dom";
import RichTextEditor from "./RichTextEditor";
import { type Post } from "../types";
import { useAuth } from "../context/AuthContext";

type BlogFormData = {
  title: string;
  subtitle: string;
  content: string;
};

const BlogDetail = (): React.ReactElement => {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>(); // Get the blog ID from the URL
  if (!id) {
    return <div>Invalid post ID</div>;
  }
  const [blog, setBlog] = useState<Post | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [editMode, setEditMode] = useState<boolean>(false); // Toggle for edit mode
  const [formData, setFormData] = useState<BlogFormData>({
    title: "",
    subtitle: "",
    content: "",
  });
  const [errors, setErrors] = useState<Record<string, string | null>>({}); // Track validation errors

  // Load the blog when the component mounts
  useEffect(() => {
    const loadBlog = async () => {
      try {
        const data = await fetchSinglePost(id!);
        setBlog(data);
        setFormData({
          title: data.title,
          subtitle: data.subtitle,
          content: data.content,
        });
      } catch (error) {
        console.error("Error fetching blog:", error);
      } finally {
        setLoading(false);
      }
    };
    loadBlog();
  }, [id]);

  // Validate the form fields before saving
  const validateForm = (): Record<string, string> => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required.";
    }
    if (!formData.subtitle.trim()) {
      newErrors.subtitle = "Subtitle is required.";
    }
    if (!formData.content?.trim()) {
      newErrors.content = "Content is required.";
    }
    return newErrors;
  };

  // Handle form changes in edit mode
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: value.trim()
        ? ""
        : `${name.charAt(0).toUpperCase() + name.slice(1)} is required.`,
    }));
  };

  // Save the updated blog
  const handleSave = async (): Promise<void> => {
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const updatedBlog = await updatePost(id, formData);
      setBlog(updatedBlog); // Update the local state with the saved data
      setEditMode(false); // Exit edit mode
      alert("Blog updated successfully!");
    } catch (error) {
      console.error("Error updating blog:", error);
      alert("Failed to update blog.");
    }
  };

  // Cancel edit mode
  const handleCancel = (): void => {
    setFormData({
      title: blog!.title,
      subtitle: blog!.subtitle,
      content: blog!.content,
    }); // Reset to original data
    setEditMode(false);
  };

  return (
    <Layout>
      {loading ? (
        <p>Loading blog...</p>
      ) : blog ? (
        <>
          {/* Edit Mode */}
          {editMode ? (
            <>
              <PageHeader
                title="Edit Blog"
                subtitle="Modify your content"
                backgroundImage="/static/img/antique.jpeg"
              />
              <section className="container mt-4">
                <form>
                  <div className="mb-3">
                    <label htmlFor="title" className="form-label">
                      Title:
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="form-control"
                      required
                    />
                    {errors.title && (
                      <p className="text-danger">{errors.title}</p>
                    )}
                  </div>
                  <div className="mb-3">
                    <label htmlFor="subtitle" className="form-label">
                      Subtitle:
                    </label>
                    <input
                      type="text"
                      id="subtitle"
                      name="subtitle"
                      value={formData.subtitle}
                      onChange={handleChange}
                      className="form-control"
                      required
                    />
                    {errors.subtitle && (
                      <p className="text-danger">{errors.subtitle}</p>
                    )}
                  </div>
                  <div className="mb-3">
                    <label htmlFor="content" className="form-label">
                      Content:
                    </label>
                    <RichTextEditor
                      value={formData.content}
                      onChange={(content) =>
                        setFormData({ ...formData, content })
                      }
                    />
                    {errors.content && (
                      <p className="text-danger">{errors.content}</p>
                    )}
                  </div>
                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleSave}
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleCancel}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </section>
            </>
          ) : (
            // View Mode
            <>
              <PageHeader
                title={blog.title}
                subtitle={blog.subtitle}
                backgroundImage="/static/img/read.jpeg"
              />
              <section className="container mt-4">
                <p className="text-muted">
                  {new Date(blog.createdAt).toLocaleString()}
                </p>
                <div dangerouslySetInnerHTML={{ __html: blog.content }} />

                {user && (
                  <div className="text-end mt-4">
                    <button
                      className="btn btn-primary"
                      onClick={() => setEditMode(true)}
                    >
                      Edit Blog
                    </button>
                  </div>
                )}
              </section>
            </>
          )}
        </>
      ) : (
        <p>Blog not found</p>
      )}
    </Layout>
  );
};

export default BlogDetail;
