import { useState, useEffect, useRef } from "react";
import PageLayout from "../components/PageLayout";
import { createPost } from "../api/posts";
import RichTextEditor from "../components/RichTextEditor";
import { useRequireAuth } from "../hooks/useRequireAuth";
import { showSuccess, showError } from "../utils/toast";
import { useAutoSave } from "../hooks/useAutoSave";
import DraftRestoreBanner from "../components/DraftRestoreBanner";
import { type BlogFormData } from "../types";
import { uploadImage, deleteImage } from "../api/upload";

const DRAFT_STORAGE_KEY = "blog_draft_new_post";

const WritePost = () => {
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    content: "",
    coverImage: "",
  });
  const [error, setError] = useState("");
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | null>(null);
  const [showDraftBanner, setShowDraftBanner] = useState(false);
  const [draftData, setDraftData] = useState<BlogFormData | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const { authLoading } = useRequireAuth();
  const draftRestoredRef = useRef(false); // Track if draft has been restored

  // Auto-save hook
  const { loadDraft, clearDraft, getLastSavedTime } = useAutoSave({
    formData,
    storageKey: DRAFT_STORAGE_KEY,
    debounceMs: 2000,
    enabled: true,
    onSaving: () => {
      setSaveStatus("saving");
    },
    onSave: () => {
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus(null), 2000);
    },
  });

  // Load draft on mount (only once)
  useEffect(() => {
    if (draftRestoredRef.current) return; // Already processed
    
    const draft = loadDraft();
    if (draft && (draft.title || draft.subtitle || draft.content)) {
      draftRestoredRef.current = true; // Mark as processed
      setDraftData(draft);
      setShowDraftBanner(true);
    }
  }, [loadDraft]);

  const handleRestoreDraft = () => {
    if (draftData) {
      setFormData({
        title: draftData.title || "",
        subtitle: draftData.subtitle || "",
        content: draftData.content || "",
        coverImage: draftData.coverImage || "",
      });
      setShowDraftBanner(false);
    }
  };

  const handleDiscardDraft = () => {
    clearDraft();
    setDraftData(null);
    setShowDraftBanner(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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
      console.log("Starting image upload...");
      const response = await uploadImage(file);
      console.log("Upload response:", response);
      console.log("Response URL:", response.url);
      
      if (response.url) {
        const newFormData = { ...formData, coverImage: response.url };
        console.log("Updating formData with coverImage:", newFormData.coverImage);
        setFormData(newFormData);
        console.log("FormData updated, coverImage should now be:", newFormData.coverImage);
        showSuccess("Cover image uploaded successfully!");
      } else {
        console.error("No URL in response:", response);
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
    if (!formData.coverImage) {
      return;
    }

    // If it's a Cloudinary URL, delete it from Cloudinary
    if (formData.coverImage.includes('cloudinary.com')) {
      try {
        await deleteImage(formData.coverImage);
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
      console.log("Submitting formData:", formData);
      const newPost = await createPost(formData);
      console.log("Post created:", newPost);
      console.log("Post coverImage:", newPost.coverImage);

      // Clear draft after successful post
      clearDraft();
      setFormData({ title: "", subtitle: "", content: "", coverImage: "" });
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
            marginBottom: showDraftBanner ? "80px" : "0",
          }}
        >
          {error && <div className="alert alert-danger">{error}</div>}

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
            <div className="col-md-12 mb-3">
              <label htmlFor="coverImage" className="form-label">
                Cover Image (Optional):
              </label>
              {formData.coverImage ? (
                <div className="mb-2">
                  <img
                    src={formData.coverImage}
                    alt="Cover preview"
                    onError={(e) => {
                      console.error("Image load error:", formData.coverImage);
                      console.error("Error event:", e);
                    }}
                    onLoad={() => {
                      console.log("Image loaded successfully:", formData.coverImage);
                    }}
                    style={{
                      maxWidth: "100%",
                      maxHeight: "300px",
                      objectFit: "cover",
                      borderRadius: "8px",
                      marginBottom: "10px",
                    }}
                  />
                  <div className="mb-2">
                    <small className="text-muted d-block">Image URL: {formData.coverImage}</small>
                  </div>
                  <button
                    type="button"
                    className="btn btn-sm btn-danger"
                    onClick={handleRemoveImage}
                  >
                    Remove Image
                  </button>
                </div>
              ) : (
                <input
                  className="form-control"
                  type="file"
                  id="coverImage"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                />
              )}
              {uploadingImage && (
                <div className="mt-2">
                  <div className="spinner-border spinner-border-sm" role="status">
                    <span className="visually-hidden">Uploading...</span>
                  </div>
                  <span className="ms-2">Uploading image...</span>
                </div>
              )}
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

      {/* Draft restore banner */}
      {showDraftBanner && draftData && (
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
export default WritePost;
