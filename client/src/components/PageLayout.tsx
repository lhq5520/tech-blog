import { type ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import "../index.css";

interface PageLayoutProps {
  title: string;
  subtitle: ReactNode;
  backgroundImage: string;
  children: ReactNode;
  showFooter?: boolean;
}

const PageLayout = ({
  title,
  subtitle,
  backgroundImage,
  children,
  showFooter = true,
}: PageLayoutProps) => {
  return (
    <div>
      <Navbar />
      <header
        className="masthead"
        style={{
          backgroundImage: `url('${backgroundImage}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="container position-relative px-4 px-lg-5">
          <div className="row gx-4 gx-lg-5 justify-content-center">
            <div className="col-md-10 col-lg-8 col-xl-7">
              <div className="page-heading">
                <h1>{title}</h1>
                {subtitle && <span className="subheading">{subtitle}</span>}
              </div>
            </div>
          </div>
        </div>
      </header>
      <main>{children}</main>
      {showFooter && <Footer />}
    </div>
  );
};

export default PageLayout;
