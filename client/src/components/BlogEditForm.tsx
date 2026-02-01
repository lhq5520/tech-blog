import { useState, useEffect, useRef } from "react"
import { type BlogFormData } from "../types"
import RichTextEditor from "./RichTextEditor"
import { fetchAllTags } from "../api/posts"

interface BlogEditFormProps {
  formData: BlogFormData
  errors: Record<string, string>
  onChange: (e:React.ChangeEvent<HTMLInputElement>) => void
  onContentChange: (content: string) => void
  onTagsChange?: (tags: string[]) => void
  onSave: () => void
  onCancel: () => void
  onImageUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRemoveImage?: () => void
  uploadingImage?: boolean
}

const BlogEditForm = ({ 
  formData, 
  errors, 
  onChange, 
  onContentChange,
  onTagsChange,
  onSave, 
  onCancel,
  onImageUpload,
  onRemoveImage,
  uploadingImage = false
}: BlogEditFormProps) => {
  const [tagInput, setTagInput] = useState("");
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const tagInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

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
    if (trimmedTag && onTagsChange) {
      const currentTags = formData.tags || [];
      if (!currentTags.includes(trimmedTag)) {
        onTagsChange([...currentTags, trimmedTag]);
      }
      setTagInput("");
      setShowSuggestions(false);
    }
  };

  const selectTag = (tag: string) => {
    if (onTagsChange) {
      const currentTags = formData.tags || [];
      if (!currentTags.includes(tag)) {
        onTagsChange([...currentTags, tag]);
      }
      setTagInput("");
      setShowSuggestions(false);
      tagInputRef.current?.focus();
    }
  };

  const removeTag = (tagToRemove: string) => {
    if (onTagsChange) {
      const currentTags = formData.tags || [];
      onTagsChange(currentTags.filter(tag => tag !== tagToRemove));
    }
  };
  return (
    <form>
      {/* Title Field */}
      <div className="mb-3">
        <label htmlFor="title" className="form-label">
          Title:
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={onChange}
          className="form-control"
        />
        {errors.title && <p className="text-danger">{errors.title}</p>}
      </div>

      {/* Subtitle Field */}
      <div className="mb-3">
        <label htmlFor="subtitle" className="form-label">
          Subtitle:
        </label>
        <input
          type="text"
          id="subtitle"
          name="subtitle"
          value={formData.subtitle}
          onChange={onChange}
          className="form-control"
        />
        {errors.subtitle && <p className="text-danger">{errors.subtitle}</p>}
      </div>

      {/* Cover Image Field */}
      <div className="mb-3">
        <label htmlFor="coverImage" className="form-label">
          Cover Image (Optional):
        </label>
        {formData.coverImage ? (
          <div className="mb-2">
            <img
              src={formData.coverImage}
              alt="Cover preview"
              style={{
                maxWidth: "100%",
                maxHeight: "300px",
                objectFit: "cover",
                borderRadius: "8px",
                marginBottom: "10px",
              }}
            />
            {onRemoveImage && (
              <button
                type="button"
                className="btn btn-sm btn-danger"
                onClick={onRemoveImage}
              >
                Remove Image
              </button>
            )}
          </div>
        ) : (
          onImageUpload && (
            <input
              className="form-control"
              type="file"
              id="coverImage"
              accept="image/*"
              onChange={onImageUpload}
              disabled={uploadingImage}
            />
          )
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

      {/* Tags Field */}
      <div className="mb-3">
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

      {/* Content Field */}
      <div className="mb-3">
        <label htmlFor="content" className="form-label">
          Content:
        </label>
        <RichTextEditor
          value={formData.content}
          onChange={onContentChange}
        />
        {errors.content && <p className="text-danger">{errors.content}</p>}
      </div>

      {/* Save and Cancel Buttons */}
      <div className="d-flex gap-2">
        <button type="button" className="btn btn-primary" onClick={onSave}>
          Save
        </button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
};

export default BlogEditForm;