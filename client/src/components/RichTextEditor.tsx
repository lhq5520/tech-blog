// components/RichTextEditor.tsx
import { CKEditor } from "@ckeditor/ckeditor5-react";
import { ClassicEditor, editorConfig } from "../../config/ckeditor";
import "ckeditor5/ckeditor5.css";
import { uploadImage } from "../api/upload";

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
}

// Custom upload adapter for CKEditor
interface FileLoader {
  file: Promise<File | null>;
}

interface UploadAdapter {
  upload(): Promise<{ default: string }>;
  abort(): void;
}

class CustomUploadAdapter implements UploadAdapter {
  private loader: FileLoader;

  constructor(loader: FileLoader) {
    this.loader = loader;
  }

  upload(): Promise<{ default: string }> {
    return this.loader.file.then(
      (file: File | null) => {
        if (!file) {
          return Promise.reject(new Error('No file provided'));
        }
        
        return new Promise<{ default: string }>((resolve, reject) => {
          uploadImage(file)
            .then((response) => {
              // Cloudinary returns the full HTTPS URL directly
              resolve({
                default: response.url,
              });
            })
            .catch((error) => {
              console.error("Image upload failed:", error);
              reject(error);
            });
        });
      }
    );
  }

  abort(): void {
    // Handle abort if needed
  }
}

const RichTextEditor = ({ value, onChange }: RichTextEditorProps) => {
  return (
    <CKEditor
      editor={ClassicEditor}
      data={value}
      onChange={(_event, editor) => {
        onChange(editor.getData());
      }}
      onReady={(editor) => {
        // Configure custom upload adapter
        const fileRepository = editor.plugins.get("FileRepository");
        fileRepository.createUploadAdapter = (loader: FileLoader) => {
          return new CustomUploadAdapter(loader);
        };
      }}
      config={editorConfig as any}
    />
  );
};

export default RichTextEditor;
