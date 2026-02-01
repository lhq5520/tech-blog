import { useState, useEffect, useRef } from "react";
import PageLayout from "./PageLayout";
import { fetchSinglePost, updatePost } from "../api/posts";
import { useParams } from "react-router-dom";
import { type Post, type BlogFormData } from "../types";
import { useAuth } from "../context/AuthContext";
import BlogEditForm from "./BlogEditForm";
import { useBlogForm } from "../hooks/useBlogForm";
import { showSuccess, showError } from "../utils/toast";
import CommentSection from "./CommentSection";
import { useAutoSave } from "../hooks/useAutoSave";
import DraftRestoreBanner from "./DraftRestoreBanner";
import { uploadImage, deleteImage } from "../api/upload";
import "../styles/blogContent.css";

const BlogDetail = (): React.ReactElement => {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>(); // Get the blog ID from the URL

  const [blog, setBlog] = useState<Post | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [editMode, setEditMode] = useState<boolean>(false); // Toggle for edit mode
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | null>(null);
  const [showDraftBanner, setShowDraftBanner] = useState(false);
  const [draftData, setDraftData] = useState<BlogFormData | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const draftRestoredRef = useRef<string | null>(null); // Track which draft has been restored

  const {
    formData,
    setFormData,
    errors,
    setErrors,
    handleChange,
    validateForm,
  } = useBlogForm();

  // Auto-save hook for edit mode
  const draftStorageKey = id ? `blog_draft_edit_${id}` : "";
  const { loadDraft, clearDraft, getLastSavedTime } = useAutoSave({
    formData,
    storageKey: draftStorageKey,
    debounceMs: 2000,
    enabled: editMode && !!id,
    onSaving: () => {
      setSaveStatus("saving");
    },
    onSave: () => {
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus(null), 2000);
    },
  });

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
          coverImage: data.coverImage || "",
        });
      } catch (error) {
        console.error("Error fetching blog:", error);
      } finally {
        setLoading(false);
      }
    };
    loadBlog();
  }, [id]);

  // Load draft when entering edit mode (only once per edit session)
  useEffect(() => {
    if (editMode && id && blog) {
      // Check if we've already processed the draft for this edit session
      if (draftRestoredRef.current === id) return;
      
      const draft = loadDraft();
      if (draft && (draft.title !== blog.title || draft.subtitle !== blog.subtitle || draft.content !== blog.content)) {
        draftRestoredRef.current = id; // Mark as processed for this edit session
        setDraftData(draft);
        setShowDraftBanner(true);
      }
    } else {
      // Reset when exiting edit mode
      draftRestoredRef.current = null;
      setShowDraftBanner(false);
      setDraftData(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editMode, id, blog]);

  const handleRestoreDraft = () => {
    if (draftData) {
      setFormData(draftData);
      setShowDraftBanner(false);
    }
  };

  const handleDiscardDraft = () => {
    clearDraft();
    setDraftData(null);
    setShowDraftBanner(false);
  };

  // Save the updated blog
  const handleSave = async (): Promise<void> => {
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      // If cover image was changed and old image exists, delete old image from Cloudinary
      const oldImageUrl = blog?.coverImage;
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

      const updatedBlog = await updatePost(id!, formData);
      setBlog(updatedBlog); // Update the local state with the saved data
      clearDraft(); // Clear draft after successful save
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
      coverImage: blog!.coverImage || "",
    }); // Reset to original data
    clearDraft(); // Clear draft when canceling
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
        <section 
          className="container mt-4"
          style={{
            marginBottom: showDraftBanner ? "80px" : "0",
          }}
        >
          {/* Auto-save status indicator */}
          {saveStatus && (
            <div className="alert alert-info d-flex align-items-center gap-2 mb-3">
              <div className="spinner-border spinner-border-sm" role="status" style={{ display: saveStatus === "saving" ? "block" : "none" }}>
                <span className="visually-hidden">Saving...</span>
              </div>
              <span>
                {saveStatus === "saved" ? "✓ 草稿已自动保存 / Draft auto-saved" : "正在保存... / Saving..."}
              </span>
            </div>
          )}
          <BlogEditForm
            formData={formData}
            errors={errors}
            onChange={handleChange}
            onContentChange={(content) => setFormData({ ...formData, content })}
            onSave={handleSave}
            onCancel={handleCancel}
            onImageUpload={handleImageUpload}
            onRemoveImage={handleRemoveImage}
            uploadingImage={uploadingImage}
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

      {/* Draft restore banner */}
      {showDraftBanner && draftData && editMode && (
        <DraftRestoreBanner
          draft={draftData}
          lastSavedTime={getLastSavedTime()}
          onRestore={handleRestoreDraft}
          onDiscard={handleDiscardDraft}
        />
      )}
    </PageLayout>
  );
};

export default BlogDetail;
