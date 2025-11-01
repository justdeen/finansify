import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Expenses from "./pages/Expenses";
import Income from "./pages/Income";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Login from "./pages/Login.jsx";

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  if (!user) return <Login />;

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard user={user} />} />
        <Route path="/income" element={<Income user={user} />} />
        <Route path="/expenses" element={<Expenses user={user} />} />
        <Route path="/reports" element={<Reports user={user} />} />
        <Route path="/settings" element={<Settings user={user} />} />
      </Routes>
    </Router>
  );
}
