import { useState } from "react";
import { Link } from "react-router-dom";
import { fetchSinglePost, updatePost } from "../api/posts";
import { type Post } from "../types";
import { useAuth } from "../context/AuthContext";
import BlogEditForm from "./BlogEditForm";
import { useBlogForm } from "../hooks/useBlogForm";

interface BlogProps {
  blog: Post;
  onDelete: (id: string) => void;
  onEdit: (updatedblog: Post) => void;
}

const BlogCard = ({
  blog,
  onDelete,
  onEdit,
}: BlogProps): React.ReactElement => {
  const { user } = useAuth();

  const {
    formData,
    setFormData,
    errors,
    setErrors,
    handleChange,
    validateForm,
  } = useBlogForm({
    title: blog.title,
    subtitle: blog.subtitle,
    content: "",
  });

  const [editMode, setEditMode] = useState<boolean>(false);

  const [loadingContent, setLoadingContent] = useState<boolean>(false);

  // Fetch the full blog content when entering edit mode
  const fetchContentForEdit = async () => {
    setLoadingContent(true);
    try {
      const fullBlog = await fetchSinglePost(blog._id); // Fetch full blog details
      setFormData({
        title: fullBlog.title,
        subtitle: fullBlog.subtitle,
        content: fullBlog.content,
      });
    } catch (error) {
      console.error("Error fetching full blog content:", error);
      alert("Failed to load blog content for editing.");
    } finally {
      setLoadingContent(false);
    }
  };

  const handleSave = async () => {
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const updatedBlog = await updatePost(blog._id, formData);
      if (onEdit) {
        onEdit(updatedBlog); // Use onEdit instead of onEditComplete
      }
      setEditMode(false); // Exit edit mode
    } catch (error) {
      console.error("Error updating blog:", error);
      alert("Failed to update blog.");
    }
  };

  const handleCancel = () => {
    setFormData({
      title: blog.title,
      subtitle: blog.subtitle,
      content: "", // Reset to empty; will be fetched again if re-entering edit mode
    });
    setEditMode(false);
  };

  const enterEditMode = () => {
    if (!formData.content) {
      // Fetch content if not already available
      fetchContentForEdit();
    }
    setEditMode(true);
  };

  const handleDelete = () => {
    onDelete(blog._id); // Call the parent component's delete handler
  };

  return (
    <div className="blog-item border-bottom py-3">
      {editMode ? (
        loadingContent ? (
          <p>Loading content...</p>
        ) : (
          <BlogEditForm
            formData={formData}
            errors={errors}
            onChange={handleChange}
            onContentChange={(content) => setFormData({ ...formData, content })}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        )
      ) : (
        <>
          {/* Blog Display */}
          <h3>
            <Link to={`/blogDetail/${blog._id}`}>{blog.title}</Link>
          </h3>
          <p className="text-muted">{blog.subtitle}</p>
          <p className="small text-muted">
            Created on: {new Date(blog.createdAt).toLocaleString()}
          </p>
          <div dangerouslySetInnerHTML={{ __html: blog.content }} />

          {/* Edit and Delete Buttons */}
          {user && (
            <div className="d-flex gap-2 mt-3">
              <button
                className="btn btn-primary btn-sm"
                onClick={enterEditMode}
              >
                Edit
              </button>
              <button className="btn btn-danger btn-sm" onClick={handleDelete}>
                Delete
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BlogCard;
