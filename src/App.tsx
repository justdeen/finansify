import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import ExpensesFilters from "./pages/ExpensesFilters";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { User } from "firebase/auth";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [logOrReg, setLogOrReg] = useState<boolean>(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  // Authenticated user UI
  const AuthenticatedApp = () => (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={user && <Dashboard user={user} />} />
        <Route path="/expenses" element={user && <ExpensesFilters user={user} />} />
        <Route path="/reports" element={user && <Reports user={user} />} />
        <Route path="/settings" element={<Settings user={user} />} />
      </Routes>
    </>
  );

  // Unauthenticated user UI
  const UnauthenticatedApp = () => (
    <>
      {logOrReg ? <Login setLogOrReg={setLogOrReg} /> : <Register setLogOrReg={setLogOrReg} />}
    </>
  );

  return (
    <Router>
      {user ? <AuthenticatedApp /> : <UnauthenticatedApp />}
    </Router>
  );
}