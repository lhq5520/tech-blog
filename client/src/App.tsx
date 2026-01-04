import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Blogs from "./components/Blogs";
import Contact from "./pages/Contact";
import WritePost from "./pages/WritePost";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import ProfilePage from "./pages/ProfilePage";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/blogs/:id" element={<Blogs />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<ProfilePage />} />

          {/* Private Route - Requires Authentication */}
          <Route
            path="/writepost"
            element={
              <ProtectedRoute>
                <WritePost />
              </ProtectedRoute>
            }
          />

          {/* Login Route */}
          <Route path="/login" element={<Login />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
