import { useState } from "react";
import { Link } from "react-router-dom";
import { fetchSinglePost, updatePost } from "../api/posts";
import { type Post } from "../types";
import { useAuth } from "../context/AuthContext";
import BlogEditForm from "./BlogEditForm";
import { useBlogForm } from "../hooks/useBlogForm";
import { showError, showSuccess } from "../utils/toast";
import { uploadImage, deleteImage } from "../api/upload";

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
    coverImage: blog.coverImage || "",
    tags: blog.tags || [],
  });

  const [editMode, setEditMode] = useState<boolean>(false);

  const [loadingContent, setLoadingContent] = useState<boolean>(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Fetch the full blog content when entering edit mode
  const fetchContentForEdit = async () => {
    setLoadingContent(true);
    try {
      const fullBlog = await fetchSinglePost(blog._id); // Fetch full blog details
      setFormData({
        title: fullBlog.title,
        subtitle: fullBlog.subtitle,
        content: fullBlog.content,
        coverImage: fullBlog.coverImage || "",
        tags: fullBlog.tags || [],
      });
    } catch (error: any) {
      console.error("Error fetching full blog content:", error);
      const errorMessage = error?.message || "Failed to load blog content";
      showError(errorMessage, "Unable to fetch the complete blog content. Please refresh the page and try again.");
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
      // If cover image was changed and old image exists, delete old image from Cloudinary
      const oldImageUrl = blog.coverImage;
      const newImageUrl = formData.coverImage;
      
      if (oldImageUrl && 
          oldImageUrl !== newImageUrl && 
          oldImageUrl.includes('cloudinary.com') &&
          (!newImageUrl || newImageUrl !== oldImageUrl)) {
        // Old image exists and is different from new one, delete it
        try {
          await deleteImage(oldImageUrl);
          console.log("Old cover image deleted from Cloudinary");
        } catch (error: any) {
          console.error("Error deleting old image from Cloudinary:", error);
          // Continue with update even if old image deletion fails
        }
      }

      const updatedBlog = await updatePost(blog._id, formData);
      if (onEdit) {
        onEdit(updatedBlog); // Use onEdit instead of onEditComplete
      }
      setEditMode(false); // Exit edit mode
      showSuccess("Blog updated successfully!");
    } catch (error: any) {
      console.error("Error updating blog:", error);
      const errorMessage = error?.message || "Failed to update blog";
      const errorDetails = error?.details || "This might be a network issue or server error.";
      showError(errorMessage, errorDetails);
    }
  };

  const handleCancel = () => {
    setFormData({
      title: blog.title,
      subtitle: blog.subtitle,
      content: "", // Reset to empty; will be fetched again if re-entering edit mode
      coverImage: blog.coverImage || "",
      tags: blog.tags || [],
    });
    setEditMode(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showError("Invalid file type", "Please select an image file.");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showError("File too large", "Please select an image smaller than 5MB.");
      return;
    }

    setUploadingImage(true);
    try {
      const response = await uploadImage(file);
      console.log("Upload response:", response);
      if (response.url) {
        setFormData({ ...formData, coverImage: response.url });
        showSuccess("Cover image uploaded successfully!");
      } else {
        throw new Error("No URL returned from upload");
      }
    } catch (error: any) {
      console.error("Error uploading image:", error);
      const errorMessage = error?.message || "Failed to upload image. Please check your connection and try again.";
      showError("Failed to upload image", errorMessage);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = async () => {
    const imageUrl = formData.coverImage;
    if (!imageUrl) {
      return;
    }

    // If it's a Cloudinary URL, delete it from Cloudinary
    if (imageUrl.includes('cloudinary.com')) {
      try {
        await deleteImage(imageUrl);
        showSuccess("Cover image removed and deleted from Cloudinary!");
      } catch (error: any) {
        console.error("Error deleting image from Cloudinary:", error);
        // Still remove from form even if Cloudinary delete fails
        showError("Failed to delete image from Cloudinary", error?.message || "Image removed locally but may still exist in Cloudinary.");
      }
    }

    // Remove from form data
    setFormData({ ...formData, coverImage: "" });
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

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds} seconds ago`;
    } else if (diffInSeconds < 3600) {
      const mins = Math.floor(diffInSeconds / 60);
      return `${mins} min${mins > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else {
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(date);
    }
  };

  return (
    <div className="blog-card-wrapper">
      {editMode ? (
        loadingContent ? (
          <div className="card">
            <div className="card-body">
              <p>Loading content...</p>
            </div>
          </div>
        ) : (
          <div className="card">
            <div className="card-body">
              <BlogEditForm
                formData={formData}
                errors={errors}
                onChange={handleChange}
                onContentChange={(content) => setFormData({ ...formData, content })}
                onTagsChange={(tags) => setFormData({ ...formData, tags })}
                onSave={handleSave}
                onCancel={handleCancel}
                onImageUpload={handleImageUpload}
                onRemoveImage={handleRemoveImage}
                uploadingImage={uploadingImage}
              />
            </div>
          </div>
        )
      ) : (
        <div className="card h-100 shadow-sm" style={{ 
          transition: "transform 0.2s, box-shadow 0.2s",
          border: "none",
          borderRadius: "12px",
          overflow: "hidden"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-4px)";
          e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)";
        }}>
          {/* Cover Image */}
          {blog.coverImage ? (
            <div style={{ position: "relative", overflow: "hidden" }}>
              <Link to={`/blogDetail/${blog._id}`}>
                <img
                  src={blog.coverImage}
                  alt={blog.title}
                  style={{
                    width: "100%",
                    height: "250px",
                    objectFit: "cover",
                    display: "block",
                    cursor: "pointer",
                  }}
                />
              </Link>
              {/* Tag Badges */}
              <div
                style={{
                  position: "absolute",
                  top: "12px",
                  right: "12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                  alignItems: "flex-end",
                }}
              >
                {blog.tags && blog.tags.length > 0 ? (
                  <>
                    {blog.tags.slice(0, 2).map((tag, index) => (
                      <span
                        key={index}
                        style={{
                          backgroundColor: "#007bff",
                          color: "white",
                          padding: "4px 12px",
                          borderRadius: "4px",
                          fontSize: "0.75rem",
                          fontWeight: "600",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          whiteSpace: "nowrap",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                    {blog.tags.length > 2 && (
                      <span
                        style={{
                          backgroundColor: "rgba(0, 123, 255, 0.8)",
                          color: "white",
                          padding: "4px 12px",
                          borderRadius: "4px",
                          fontSize: "0.75rem",
                          fontWeight: "600",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                        }}
                      >
                        +{blog.tags.length - 2}
                      </span>
                    )}
                  </>
                ) : (
                  <span
                    style={{
                      backgroundColor: "#6c757d",
                      color: "white",
                      padding: "4px 12px",
                      borderRadius: "4px",
                      fontSize: "0.75rem",
                      fontWeight: "600",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                    }}
                  >
                    Uncategorized
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div style={{ 
              height: "250px", 
              backgroundColor: "#f8f9fa",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#6c757d"
            }}>
              <span>No Cover Image</span>
            </div>
          )}

          {/* Card Body */}
          <div className="card-body" style={{ padding: "1.5rem" }}>
            <h5 className="card-title" style={{ 
              marginBottom: "0.75rem",
              fontSize: "1.25rem",
              fontWeight: "600",
              lineHeight: "1.4"
            }}>
              <Link 
                to={`/blogDetail/${blog._id}`}
                style={{ 
                  color: "#212529",
                  textDecoration: "none"
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = "#007bff"}
                onMouseLeave={(e) => e.currentTarget.style.color = "#212529"}
              >
                {blog.title}
              </Link>
            </h5>
            
            <p className="card-text text-muted" style={{ 
              marginBottom: "1rem",
              fontSize: "0.95rem",
              lineHeight: "1.6",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden"
            }}>
              {blog.subtitle}
            </p>

            {/* Tags */}
            <div className="d-flex flex-wrap gap-1 mb-2">
              {blog.tags && blog.tags.length > 0 ? (
                blog.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="badge bg-secondary"
                    style={{ fontSize: "0.75rem" }}
                  >
                    {tag}
                  </span>
                ))
              ) : (
                <span
                  className="badge bg-secondary"
                  style={{ fontSize: "0.75rem" }}
                >
                  Uncategorized
                </span>
              )}
            </div>

            {/* Metadata */}
            <div className="d-flex align-items-center gap-4" style={{ 
              fontSize: "0.875rem",
              color: "#6c757d"
            }}>
              <span className="d-flex align-items-center gap-1">
                <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
                  <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
                </svg>
                {formatDate(blog.createdAt)}
              </span>
              <span className="d-flex align-items-center gap-1">
                <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M2.678 11.894a1 1 0 0 1 .287.801 10.97 10.97 0 0 1-.398 2c1.395-.323 2.247-.697 2.634-.893a1 1 0 0 1 .71-.069A8.06 8.06 0 0 0 8 14c3.996 0 7-2.807 7-6 0-3.192-3.004-6-7-6S1 4.808 1 8c0 1.468.617 2.83 1.678 3.894zm-.493 3.905a21.682 21.682 0 0 1-.713.129c-.2.032-.352-.176-.273-.362a9.68 9.68 0 0 0 .244-.637l.003-.01c.248-.72.45-1.548.524-2.319C.743 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7-3.582 7-8 7a9.06 9.06 0 0 1-2.347-.306c-.52.263-1.639.742-3.468 1.105z"/>
                </svg>
                0 Comments
              </span>
            </div>

            {/* Edit and Delete Buttons */}
            {user && (
              <div className="d-flex gap-2 mt-3 pt-3" style={{ borderTop: "1px solid #e9ecef" }}>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={enterEditMode}
                  style={{ fontSize: "0.875rem" }}
                >
                  Edit
                </button>
                <button 
                  className="btn btn-danger btn-sm" 
                  onClick={handleDelete}
                  style={{ fontSize: "0.875rem" }}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogCard;
