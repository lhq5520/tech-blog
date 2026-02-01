import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import PageLayout from "../components/PageLayout";
import BlogCard from "../components/BlogCard";
import {
  fetchPaginatedPosts,
  fetchAllTags,
  deletePost,
  type PostsResponse,
} from "../api/posts";
import { type Post } from "../types";
import { useAuth } from "../context/AuthContext";
import { showSuccess, showError } from "../utils/toast";
import { deleteImage } from "../api/upload";

/**
 * Home component - Main page displaying paginated blog posts
 *
 * Fetches and displays a list of blog posts with pagination controls.
 * Allows authenticated users to edit and delete their own posts.
 *
 * @component
 * @returns {JSX.Element} The rendered home page with blog posts and pagination
 *
 * @example
 * return <Home />
 *
 * @remarks
 * - Uses pagination with a configurable limit of 6 posts per page
 * - Automatically scrolls to top when changing pages for better UX
 * - Displays error messages and loading states to the user
 * - Requires useAuth hook to be available from context
 *
 * @state {Post[]} posts - Array of blog posts for current page
 * @state {number} page - Current page number (1-indexed)
 * @state {number} totalPages - Total number of pages available
 * @state {boolean} loading - Loading state while fetching posts
 * @state {string} error - Error message if post fetch fails
 *
 * @function loadPosts - Fetches posts for specified page number
 * @function handleEdit - Updates a post in the local state after edit
 * @function handleDelete - Deletes a post after user confirmation
 * @function handlePageClick - Navigates to specified page with validation
 */
const Home = () => {
  const { user } = useAuth();

  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchInput, setSearchInput] = useState(""); // User input for search text
  const [searchQuery, setSearchQuery] = useState(""); // Actual search query used for API (debounced)
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [allTags, setAllTags] = useState<string[]>([]);

  const LIMIT = 6;
  const debounceTimerRef = useRef<number | null>(null);

  const loadPosts = async (pageToFetch: number) => {
    setLoading(true);
    try {
      const data: PostsResponse = await fetchPaginatedPosts(
        pageToFetch, 
        LIMIT,
        searchQuery || undefined,
        sortBy,
        sortOrder,
        selectedTag || undefined
      );
      setPosts(data.posts || []);
      setTotalPages(data.totalPages);
      if (data.currentPage) setPage(data.currentPage);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch posts.");
    } finally {
      setLoading(false);
    }
  };

  // Load all tags on mount
  useEffect(() => {
    const loadTags = async () => {
      try {
        const response = await fetchAllTags();
        setAllTags(response.tags || []);
      } catch (err) {
        console.error("Failed to fetch tags:", err);
      }
    };
    loadTags();
  }, []);

  // Debounce: Update actual search query 500ms after user stops typing
  useEffect(() => {
    // Clear previous timer
    if (debounceTimerRef.current !== null) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer
    debounceTimerRef.current = window.setTimeout(() => {
      setSearchQuery(searchInput);
    }, 500); // 500ms delay

    // Cleanup function
    return () => {
      if (debounceTimerRef.current !== null) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchInput]);

  // Reset to page 1 when search or filters change
  useEffect(() => {
    setPage(1);
  }, [searchQuery, sortBy, sortOrder, selectedTag]);

  // Load posts when page, search, or filters change
  useEffect(() => {
    loadPosts(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, searchQuery, sortBy, sortOrder, selectedTag]);

  const handleEdit = (updatedBlog: Post) => {
    setPosts((prev) =>
      prev.map((b) => (b._id === updatedBlog._id ? updatedBlog : b))
    );
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this blog post?")) {
      try {
        // Find the post to get its cover image
        const postToDelete = posts.find((p) => p._id === id);
        
        // Delete cover image from Cloudinary if it exists
        if (postToDelete?.coverImage && postToDelete.coverImage.includes('cloudinary.com')) {
          try {
            await deleteImage(postToDelete.coverImage);
            console.log("Cover image deleted from Cloudinary");
          } catch (error: any) {
            console.error("Error deleting cover image from Cloudinary:", error);
            // Continue with post deletion even if image deletion fails
          }
        }

        // Delete the post
        await deletePost(id);
        setPosts((prev) => prev.filter((b) => b._id !== id));
        showSuccess("Blog post deleted successfully!");
      } catch (error: any) {
        console.error("Error deleting blog:", error);
        const errorMessage = error?.message || "Failed to delete blog post";
        const errorDetails = error?.details || "This might be a network issue or server error.";
        showError(errorMessage, errorDetails);
      }
    }
  };

  // Jump directly to a specific page
  const handlePageClick = (pageNum: number) => {
    if (pageNum >= 1 && pageNum <= totalPages) {
      setPage(pageNum);
      // Auto scroll to top after clicking page number for better UX
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Handle search input change (updates input display, debounce handles actual search)
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  // Handle filter changes
  const handleSortByChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
  };

  const handleSortOrderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOrder(e.target.value);
  };

  return (
    <PageLayout
      title="Bytes Odyssey"
      subtitle={
        user ? (
          <Link to="/profile">
            Click Here To View Profile
          </Link>
        ) : (
          "Welcome to Weifan's Blog"
        )
      }
    >
      <section className="container mt-4 mb-5">
        {/* Search and Filter Section */}
        <div className="row mb-4">
          <div className="col-12 col-md-6 mb-3 mb-md-0">
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Search posts by title, subtitle, or content..."
                value={searchInput}
                onChange={handleSearchChange}
              />
              {searchInput && (
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={() => {
                    setSearchInput("");
                    setSearchQuery("");
                  }}
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>
          </div>
          <div className="col-12 col-md-6">
            <div className="d-flex gap-2">
              <select
                className="form-select"
                value={sortBy}
                onChange={handleSortByChange}
                aria-label="Sort by"
              >
                <option value="date">Sort by Date</option>
                <option value="title">Sort by Title</option>
              </select>
              <select
                className="form-select"
                value={sortOrder}
                onChange={handleSortOrderChange}
                aria-label="Sort order"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tag Filter Section */}
        <div className="row mb-4">
          <div className="col-12">
            <label className="form-label fw-bold">Filter by Tag:</label>
            <div className="d-flex flex-wrap gap-2 align-items-center">
              <button
                className={`btn btn-sm ${selectedTag === "" ? "btn-primary" : "btn-outline-primary"}`}
                onClick={() => setSelectedTag("")}
              >
                All Posts
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  className={`btn btn-sm ${selectedTag === tag ? "btn-primary" : "btn-outline-primary"}`}
                  onClick={() => setSelectedTag(tag)}
                >
                  {tag}
                </button>
              ))}
              {allTags.length === 0 && (
                <span className="text-muted">No tags available</span>
              )}
            </div>
            {selectedTag && (
              <div className="mt-2">
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => setSelectedTag("")}
                >
                  Clear tag filter
                </button>
              </div>
            )}
          </div>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        {loading ? (
          <div className="text-center my-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : !posts || posts.length === 0 ? (
          <p className="text-center text-muted py-5">
            {searchQuery 
              ? `No posts found matching "${searchQuery}".` 
              : selectedTag
              ? `No posts found with tag "${selectedTag}".`
              : "No posts available."}
          </p>
        ) : (
          <>
            <div className="row g-4">
              {posts.map((blog) => (
                <div key={blog._id} className="col-12 col-md-6 col-lg-4">
                  <BlogCard
                    blog={blog}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                </div>
              ))}
            </div>

            {/* Brand new numeric pagination navigation bar */}
            <div className="mt-5 d-flex justify-content-center">
              <nav aria-label="Page navigation">
                <ul className="pagination">
                  {/* Previous Button (<) */}
                  <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                    <button
                      className="page-link"
                      onClick={() => handlePageClick(page - 1)}
                      aria-label="Previous"
                    >
                      <span aria-hidden="true">&laquo;</span>
                    </button>
                  </li>

                  {/* Generate page number buttons: [1] [2] [3] ... */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (pageNum) => (
                      <li
                        key={pageNum}
                        className={`page-item ${
                          page === pageNum ? "active" : ""
                        }`}
                      >
                        <button
                          className="page-link"
                          onClick={() => handlePageClick(pageNum)}
                        >
                          {pageNum}
                        </button>
                      </li>
                    )
                  )}

                  {/* Next Button (>) */}
                  <li
                    className={`page-item ${
                      page === totalPages ? "disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => handlePageClick(page + 1)}
                      aria-label="Next"
                    >
                      <span aria-hidden="true">&raquo;</span>
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </>
        )}
      </section>
    </PageLayout>
  );
};

export default Home;
