import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import BlogDetail from "./components/BlogDetail";
import Contact from "./pages/Contact";
import WritePost from "./pages/WritePost";
import Login from "./pages/Login";
// import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import ProfilePage from "./pages/ProfilePage";
import StatsPage from "./pages/StatsPage";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/blogDetail/:id" element={<BlogDetail />} />
          {/* <Route path="/register" element={<Register />} /> */}
          <Route path="/profile" element={<ProfilePage />} />

          {/* Private Route - Requires Authentication */}
          <Route
            path="/write"
            element={
              <ProtectedRoute>
                <WritePost />
              </ProtectedRoute>
            }
          />
          <Route
            path="/stats"
            element={
              <ProtectedRoute>
                <StatsPage />
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
