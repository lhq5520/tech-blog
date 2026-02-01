import { useState, useEffect, useRef } from "react";
import PageLayout from "../components/PageLayout";
import { createPost, fetchAllTags } from "../api/posts";
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
    tags: [] as string[],
  });
  const [error, setError] = useState("");
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | null>(null);
  const [showDraftBanner, setShowDraftBanner] = useState(false);
  const [draftData, setDraftData] = useState<BlogFormData | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const tagInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const { authLoading } = useRequireAuth();
  const draftRestoredRef = useRef(false); // Track if draft has been restored

  // Load all available tags on mount
  useEffect(() => {
    const loadTags = async () => {
      try {
        const response = await fetchAllTags();
        setAvailableTags(response.tags || []);
      } catch (error) {
        console.error("Failed to fetch tags:", error);
      }
    };
    loadTags();
  }, []);

  // Filter suggestions based on input
  useEffect(() => {
    if (tagInput.trim()) {
      const input = tagInput.trim().toLowerCase();
      const currentTags = formData.tags || [];
      const filtered = availableTags
        .filter(tag => 
          tag.toLowerCase().includes(input) && 
          !currentTags.includes(tag)
        )
        .slice(0, 5); // Show max 5 suggestions
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [tagInput, availableTags, formData.tags]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tagInputRef.current && 
        suggestionsRef.current &&
        !tagInputRef.current.contains(event.target as Node) &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
        tags: draftData.tags || [],
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

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (suggestions.length > 0 && showSuggestions) {
        // If there are suggestions, select the first one
        selectTag(suggestions[0]);
      } else {
        // Otherwise, add the current input
        addTag();
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const addTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag) {
      const currentTags = formData.tags || [];
      if (!currentTags.includes(trimmedTag)) {
        setFormData({ ...formData, tags: [...currentTags, trimmedTag] });
      }
      setTagInput("");
      setShowSuggestions(false);
    }
  };

  const selectTag = (tag: string) => {
    const currentTags = formData.tags || [];
    if (!currentTags.includes(tag)) {
      setFormData({ ...formData, tags: [...currentTags, tag] });
    }
    setTagInput("");
    setShowSuggestions(false);
    tagInputRef.current?.focus();
  };

  const removeTag = (tagToRemove: string) => {
    const currentTags = formData.tags || [];
    setFormData({ ...formData, tags: currentTags.filter(tag => tag !== tagToRemove) });
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
      setFormData({ title: "", subtitle: "", content: "", coverImage: "", tags: [] });
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

          {/* Tags Field */}
          <div className="mb-4">
            <label htmlFor="tags" className="form-label">
              Tags (Optional):
            </label>
            <div className="d-flex flex-wrap gap-2 mb-2">
              {formData.tags && formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="badge bg-primary d-flex align-items-center gap-2"
                  style={{ fontSize: "0.875rem", padding: "0.5rem 0.75rem" }}
                >
                  {tag}
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    style={{ fontSize: "0.6rem" }}
                    onClick={() => removeTag(tag)}
                    aria-label="Remove tag"
                  />
                </span>
              ))}
            </div>
            <div className="position-relative">
              <div className="input-group">
                <input
                  ref={tagInputRef}
                  type="text"
                  id="tags"
                  className="form-control"
                  placeholder="Enter tags (press Enter or comma to add)"
                  value={tagInput}
                  onChange={(e) => {
                    setTagInput(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onKeyDown={handleTagInputKeyDown}
                  onFocus={() => {
                    if (suggestions.length > 0) {
                      setShowSuggestions(true);
                    }
                  }}
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={addTag}
                >
                  Add Tag
                </button>
              </div>
              {/* Tag Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div
                  ref={suggestionsRef}
                  className="position-absolute w-100 bg-white border rounded shadow-sm"
                  style={{
                    top: "100%",
                    zIndex: 1000,
                    maxHeight: "200px",
                    overflowY: "auto",
                    marginTop: "2px"
                  }}
                >
                  {suggestions.map((tag, index) => (
                    <div
                      key={index}
                      className="px-3 py-2 cursor-pointer"
                      style={{
                        cursor: "pointer",
                        borderBottom: index < suggestions.length - 1 ? "1px solid #e9ecef" : "none"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#f8f9fa";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "white";
                      }}
                      onClick={() => selectTag(tag)}
                    >
                      <span className="badge bg-secondary me-2">{tag}</span>
                      <small className="text-muted">Click to add</small>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <small className="text-muted">
              {availableTags.length > 0 
                ? `Type to see suggestions from ${availableTags.length} existing tags, or create a new one`
                : "Separate multiple tags with commas or press Enter"}
            </small>
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
