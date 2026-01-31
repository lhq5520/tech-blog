import { useState, useEffect } from "react";
import PageLayout from "./PageLayout";
import { fetchSinglePost, updatePost } from "../api/posts";
import { useParams } from "react-router-dom";
import { type Post } from "../types";
import { useAuth } from "../context/AuthContext";
import BlogEditForm from "./BlogEditForm";
import { useBlogForm } from "../hooks/useBlogForm";
import { showSuccess, showError } from "../utils/toast";
import CommentSection from "./CommentSection";
import "../styles/blogContent.css";

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
      showSuccess("Blog updated successfully!");
    } catch (error: any) {
      console.error("Error updating blog:", error);
      const errorMessage = error?.message || "Failed to update blog. Please check your connection and try again.";
      const errorDetails = error?.details || "This might be a network issue or server error.";
      showError(errorMessage, errorDetails);
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
      backgroundImage={editMode ? "/static/img/antique.jpeg" : "/static/img/read.jpeg"}
      showFooter={false}
      compactHeader={true}
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
          <div className="article-meta">
            <div className="date">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
                <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
              </svg>
              <span>
                {new Intl.DateTimeFormat("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                  timeZoneName: "short",
                }).format(new Date(blog.createdAt))}
              </span>
            </div>
          </div>
          <div 
            className="blog-content" 
            dangerouslySetInnerHTML={{ __html: blog.content }} 
          />

          {user && (
            <div className="text-end mt-4 mb-5">
              <button
                className="btn btn-primary"
                onClick={() => setEditMode(true)}
              >
                Edit Blog
              </button>
            </div>
          )}

          {/* Comment Section */}
          <CommentSection postId={id} />
        </section>
      )}
    </PageLayout>
  );
};

export default BlogDetail;
