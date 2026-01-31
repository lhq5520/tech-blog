import { type ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import "../index.css";
import "../styles/navbar.css";

// Style to ensure proper z-index layering
const headerStyle: React.CSSProperties = {
  position: "relative",
};

const imageStyle: React.CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  objectFit: "cover",
  objectPosition: "center",
  zIndex: 0,
};

const overlayStyle: React.CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "#212529",
  opacity: 0.5,
  zIndex: 1,
  pointerEvents: "none",
};

const contentStyle: React.CSSProperties = {
  position: "relative",
  zIndex: 2,
};

interface PageLayoutProps {
  title: string;
  subtitle: ReactNode;
  backgroundImage?: string;
  children: ReactNode;
  showFooter?: boolean;
  compactHeader?: boolean;
}

const PageLayout = ({
  title,
  subtitle,
  backgroundImage,
  children,
  showFooter = true,
  compactHeader = false,
}: PageLayoutProps) => {
  // Compact header style with reduced height
  const compactHeaderStyle: React.CSSProperties = {
    ...headerStyle,
    minHeight: '200px',
    paddingBottom: '60px',
  };

  const headerStyleToUse = compactHeader ? compactHeaderStyle : headerStyle;

  return (
    <div className={backgroundImage ? (compactHeader ? 'page-compact-header' : '') : 'page-no-bg'}>
      <Navbar />
      {backgroundImage ? (
        <header 
          className={`masthead ${compactHeader ? 'masthead-compact' : ''}`} 
          style={headerStyleToUse}
        >
          {/* Background image with lazy loading */}
          <img
            src={backgroundImage}
            alt=""
            loading="lazy"
            decoding="async"
            style={imageStyle}
          />
          {/* Overlay to replace :before pseudo-element */}
          <div style={overlayStyle} />
          <div className="container px-4 px-lg-5" style={contentStyle}>
            <div className="row gx-4 gx-lg-5 justify-content-center">
              <div className="col-md-10 col-lg-8 col-xl-7">
                <div className="page-heading">
                  <h1 className={compactHeader ? 'compact-title' : ''}>{title}</h1>
                  {subtitle && <span className={`subheading ${compactHeader ? 'italic-subtitle' : ''}`}>{subtitle}</span>}
                </div>
              </div>
            </div>
          </div>
        </header>
      ) : null}
      <main>{children}</main>
      {showFooter && <Footer />}
    </div>
  );
};

export default PageLayout;
