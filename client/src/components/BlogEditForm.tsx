import { type BlogFormData } from "../types"
import RichTextEditor from "./RichTextEditor"

interface BlogEditFormProps {
  formData: BlogFormData
  errors: Record<string, string>
  onChange: (e:React.ChangeEvent<HTMLInputElement>) => void
  onContentChange: (content: string) => void
  onSave: () => void
  onCancel: () => void
}

const BlogEditForm = ({ formData, errors, onChange, onContentChange, onSave, onCancel }: BlogEditFormProps) => {
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