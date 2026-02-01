import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import PageLayout from "../components/PageLayout";
import { fetchStats, type Stats } from "../api/stats";
import "../styles/statsPage.css";

const StatsPage = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchStats();
        setStats(data);
      } catch (err: any) {
        console.error("Error fetching stats:", err);
        setError(err?.message || "Failed to load statistics");
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  return (
    <PageLayout
      title="Statistics Dashboard"
      subtitle="View your blog statistics and analytics"
      backgroundImage="/static/img/antique.jpeg"
    >
      <section className="container mt-5">
        {loading ? (
          <div className="stats-loading-container">
            <div className="spinner-border text-primary" role="status" style={{ width: "3rem", height: "3rem" }}>
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading statistics...</p>
          </div>
        ) : error ? (
          <div className="alert alert-danger" role="alert">
            <h4 className="alert-heading">Error</h4>
            <p>{error}</p>
          </div>
        ) : stats ? (
          <div className="stats-page-content">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon posts-icon">
                  <svg width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M14 1a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H4.414A2 2 0 0 0 3 11.586l-2 2V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12.793a.5.5 0 0 0 .854.353l2.853-2.853A1 1 0 0 1 4.414 12H14a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
                  </svg>
                </div>
                <div className="stat-info">
                  <div className="stat-value">{formatNumber(stats.totalPosts)}</div>
                  <div className="stat-label">Total Posts</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon views-icon">
                  <svg width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
                    <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
                  </svg>
                </div>
                <div className="stat-info">
                  <div className="stat-value">{formatNumber(stats.totalViews)}</div>
                  <div className="stat-label">Total Views</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon users-icon">
                  <svg width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H7Zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-5.784 6A2.238 2.238 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.325 6.325 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1h4.216Z"/>
                    <path d="M4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"/>
                  </svg>
                </div>
                <div className="stat-info">
                  <div className="stat-value">{formatNumber(stats.totalUsers)}</div>
                  <div className="stat-label">Total Users</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon comments-icon">
                  <svg width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M2.678 11.894a1 1 0 0 1 .287.801 10.97 10.97 0 0 1-.398 2c1.395-.323 2.247-.697 2.634-.893a1 1 0 0 1 .71-.074A8.06 8.06 0 0 0 8 14c3.996 0 7-2.807 7-6 0-3.192-3.004-6-7-6S1 4.808 1 8c0 1.468.617 2.83 1.678 3.894zm-.493 3.905a21.682 21.682 0 0 1-.713.129c-.2.032-.352-.176-.273-.362a9.68 9.68 0 0 0 .244-.637l.003-.01c.248-.72.45-1.548.524-2.319C.743 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7-3.582 7-8 7a9.06 9.06 0 0 1-2.347-.306c-.52.263-1.639.742-3.468 1.105z"/>
                  </svg>
                </div>
                <div className="stat-info">
                  <div className="stat-value">{formatNumber(stats.totalComments)}</div>
                  <div className="stat-label">Total Comments</div>
                </div>
              </div>
            </div>

            {stats.topPosts && stats.topPosts.length > 0 && (
              <div className="top-posts-section">
                <h2 className="section-title">Top 5 Posts by Views</h2>
                <div className="top-posts-list">
                  {stats.topPosts.map((post, index) => (
                    <div key={post._id} className="top-post-item">
                      <div className="post-rank">#{index + 1}</div>
                      <div className="post-content">
                        <h4 className="post-title">{post.title || "Untitled Post"}</h4>
                        <div className="post-views">
                          <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: "0.5rem" }}>
                            <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
                            <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
                          </svg>
                          {formatNumber(post.views)} views
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {stats.allPosts && stats.allPosts.length > 0 && (
              <div className="all-posts-section">
                <h2 className="section-title">All Posts Statistics</h2>
                <div className="posts-table-container">
                  <table className="posts-table">
                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>Title</th>
                        <th>Views</th>
                        <th>Comments</th>
                        <th>Created Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.allPosts.map((post, index) => (
                        <tr key={post._id}>
                          <td>
                            <div className="post-rank-small">#{index + 1}</div>
                          </td>
                          <td>
                            <div className="post-title-cell">
                              <strong>{post.title}</strong>
                              {post.subtitle && (
                                <div className="post-subtitle">{post.subtitle}</div>
                              )}
                            </div>
                          </td>
                          <td>
                            <div className="stat-badge views-badge">
                              <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: "0.25rem" }}>
                                <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
                                <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
                              </svg>
                              {formatNumber(post.views)}
                            </div>
                          </td>
                          <td>
                            <div className="stat-badge comments-badge">
                              <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: "0.25rem" }}>
                                <path d="M2.678 11.894a1 1 0 0 1 .287.801 10.97 10.97 0 0 1-.398 2c1.395-.323 2.247-.697 2.634-.893a1 1 0 0 1 .71-.074A8.06 8.06 0 0 0 8 14c3.996 0 7-2.807 7-6 0-3.192-3.004-6-7-6S1 4.808 1 8c0 1.468.617 2.83 1.678 3.894zm-.493 3.905a21.682 21.682 0 0 1-.713.129c-.2.032-.352-.176-.273-.362a9.68 9.68 0 0 0 .244-.637l.003-.01c.248-.72.45-1.548.524-2.319C.743 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7-3.582 7-8 7a9.06 9.06 0 0 1-2.347-.306c-.52.263-1.639.742-3.468 1.105z"/>
                              </svg>
                              {formatNumber(post.commentCount)}
                            </div>
                          </td>
                          <td>
                            <div className="date-cell">
                              {new Date(post.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </div>
                          </td>
                          <td>
                            <Link 
                              to={`/blogDetail/${post._id}`}
                              className="view-link"
                            >
                              View
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </section>
    </PageLayout>
  );
};

export default StatsPage;
