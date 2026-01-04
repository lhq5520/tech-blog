import { type ReactNode } from "react";
import Navbar from "./Navbar"; // Import the Navbar component
import "../index.css"; // Global CSS file

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div>
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
};

export default Layout;
