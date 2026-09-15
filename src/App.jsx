import { BrowserRouter, Routes, Route } from "react-router-dom";

import StudentRegistration from "./pages/StudentRegistration";
import VolunteerLogin from "./pages/VolunteerLogin";
import VolunteerDashboard from "./pages/VolunteerDashboard";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Student Registration */}
        <Route path="/" element={<StudentRegistration />} />

        {/* Volunteer */}
        <Route
          path="/volunteer/login"
          element={<VolunteerLogin />}
        />

        <Route
          path="/volunteer"
          element={<VolunteerDashboard />}
        />

        {/* Admin */}
        <Route
          path="/admin/login"
          element={<AdminLogin />}
        />

        <Route
          path="/admin"
          element={<AdminDashboard />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;