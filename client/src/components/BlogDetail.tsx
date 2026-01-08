import { useState, useEffect } from "react";
import PageLayout from "./PageLayout";
import { fetchSinglePost, updatePost } from "../api/posts";
import { useParams } from "react-router-dom";
import { type Post } from "../types";
import { useAuth } from "../context/AuthContext";
import BlogEditForm from "./BlogEditForm";
import { useBlogForm } from "../hooks/useBlogForm";

const BlogDetail = (): React.ReactElement => {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>(); // Get the blog ID from the URL

  const [blog, setBlog] = useState<Post | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [editMode, setEditMode] = useState<boolean>(false); // Toggle for edit mode

  const {
    formData,
    setFormData,
    errors,
    setErrors,
    handleChange,
    validateForm,
  } = useBlogForm();

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

  // Save the updated blog
  const handleSave = async (): Promise<void> => {
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const updatedBlog = await updatePost(id!, formData);
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

  // Early returns for loading/error states
  if (!id) return <p>Invalid post ID</p>;
  if (loading) return <p>Loading blog...</p>;
  if (!blog) return <p>Blog not found</p>;

  return (
    <PageLayout
      title={editMode ? "Edit Blog" : blog.title}
      subtitle={editMode ? "Modify your content" : blog.subtitle}
      backgroundImage={
        editMode ? "/static/img/antique.jpeg" : "/static/img/read.jpeg"
      }
      showFooter={false}
    >
      {/* Edit Mode */}
      {editMode ? (
        <section className="container mt-4">
          <BlogEditForm
            formData={formData}
            errors={errors}
            onChange={handleChange}
            onContentChange={(content) => setFormData({ ...formData, content })}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </section>
      ) : (
        // View Mode
        <section className="container mt-4">
          <p className="text-muted">
            {new Intl.DateTimeFormat("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
              timeZoneName: "short",
            }).format(new Date(blog.createdAt))}
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
      )}
    </PageLayout>
  );
};

export default BlogDetail;
