import PageLayout from "../components/PageLayout";
import "./Contact.css";

interface LinkItem {
  title: string;
  url: string;
  icon?: string;
  color?: string;
}

const Contact = () => {
  // config links for contact page
  const links: LinkItem[] = [
    {
      title: "GitHub",
      url: "https://github.com/lhq5520",
      icon: "💻",
      color: "#24292e",
    },
    {
      title: "LinkedIn",
      url: "https://www.linkedin.com/in/weifanli/",
      icon: "💼",
      color: "#0077b5",
    },
    {
      title: "Email",
      url: "mailto:989994@gmail.com",
      icon: "📧",
      color: "#ea4335",
    },
    {
      title: "Twitter",
      url: "https://x.com/989994Li",
      icon: "🐦",
      color: "#1da1f2",
    },
    {
      title: "Portfolio",
      url: "https://weifanx.com",
      icon: "🌐",
      color: "#0085A1",
    },
    {
      title: "Blog",
      url: "/",
      icon: "📝",
      color: "#6c757d",
    },
  ];

  const profileInfo = {
    name: "Weifan Li",
    bio: "Full Stack Developer | Blogger | Tech Enthusiast",
    avatar: "https://res.cloudinary.com/dkrmixgjd/image/upload/v1769899278/E6573B98F86F1F28C8E3FCABE4778694_vnndhi.jpg", // 可以替换为你的头像URL
  };

  const handleLinkClick = (url: string) => {
    if (url.startsWith("mailto:")) {
      window.location.href = url;
    } else if (url.startsWith("/")) {
      window.location.href = url;
    } else {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <PageLayout
      title=""
      subtitle=""
      showFooter={true}
      compactHeader={true}
    >
      <div className="linktree-container">
        <div className="linktree-content">
          {/* Avatar */}
          <div className="linktree-avatar-container">
            <img
              src={profileInfo.avatar}
              alt={profileInfo.name}
              className="linktree-avatar"
            />
          </div>

          {/* Name */}
          <h1 className="linktree-name">{profileInfo.name}</h1>

          {/* Bio */}
          <p className="linktree-bio">{profileInfo.bio}</p>

          {/* Links */}
          <div className="linktree-links">
            {links.map((link, index) => (
              <button
                key={index}
                className="linktree-link-button"
                onClick={() => handleLinkClick(link.url)}
                style={{
                  backgroundColor: link.color || "#0085A1",
                  "--hover-color": link.color || "#0085A1",
                } as React.CSSProperties}
              >
                {link.icon && <span className="linktree-icon">{link.icon}</span>}
                <span className="linktree-link-text">{link.title}</span>
                <span className="linktree-arrow">→</span>
              </button>
            ))}
          </div>

          {/* Footer text */}
          <p className="linktree-footer">
            Thanks for visiting! 👋
          </p>
        </div>
      </div>
    </PageLayout>
  );
};

export default Contact;
