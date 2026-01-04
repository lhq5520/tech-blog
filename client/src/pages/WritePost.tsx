import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";
import { createPost } from "../api/posts";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
  ClassicEditor,
  Bold,
  Italic,
  Essentials,
  Paragraph,
  Heading,
  Link,
  List,
  BlockQuote,
} from "ckeditor5";
import "ckeditor5/ckeditor5.css";
import { useAuth } from "../context/AuthContext";

const WritePost = () => {
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    content: "",
  });
  const [error, setError] = useState("");
  const { user, logout, authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("License Key:", import.meta.env.VITE_CKEDITOR_LICENSE_KEY);
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleEditorChange = (_event: any, editor: any) => {
    const data = editor.getData();
    setFormData({ ...formData, content: data });
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
      const newPost = await createPost(formData);
      console.log("Post created:", newPost);

      setFormData({ title: "", subtitle: "", content: "" });
      setError("");
      alert("Post created successfully!");
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Failed to create post.");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (authLoading) {
    return <div>Loading...</div>; // You can display a loading indicator while auth is being checked
  }

  return (
    <Layout>
      <PageHeader
        title="Creation Time"
        subtitle="Let the flow of the words sliding through your vein"
        backgroundImage="/static/img/write.jpeg"
      />

      <div className="container mt-5 mb-5" style={{ maxWidth: "900px" }}>
        <div className="d-flex justify-content-end mb-3">
          <button onClick={handleLogout} className="btn btn-outline-secondary">
            Log Out
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-light p-5 rounded shadow-lg"
          style={{
            width: "100%",
          }}
        >
          {error && <div className="alert alert-danger">{error}</div>}

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
          </div>

          <div className="mb-4">
            <label htmlFor="content" className="form-label">
              Content:
            </label>
            <CKEditor
              editor={ClassicEditor}
              data={formData.content}
              onChange={handleEditorChange}
              config={{
                licenseKey: "GPL",
                plugins: [
                  Essentials,
                  Bold,
                  Italic,
                  Paragraph,
                  Heading,
                  Link,
                  List,
                  BlockQuote,
                ],
                toolbar: [
                  "heading",
                  "|",
                  "bold",
                  "italic",
                  "link",
                  "|",
                  "bulletedList",
                  "numberedList",
                  "blockQuote",
                  "|",
                  "undo",
                  "redo",
                ],
              }}
            />
          </div>

          <div className="text-end">
            <button className="btn btn-primary px-5 py-2" type="submit">
              Post
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};
export default WritePost;
