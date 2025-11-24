import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
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
import PasswordRst from "./pages/PasswordRst";
import Home from "./pages/Home";
import { User } from "firebase/auth";
import "./App.css"
import "./chart-setup";


export default function App() {
  const [user, setUser] = useState<User | any>(() => {
    const currUser = localStorage.getItem('user')
    return currUser ? currUser : null;
  });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if(u) setUser(u)
      else setUser(null)
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify({ uid: user.uid }));
    } else {
      localStorage.removeItem("user");
    }
  }, [user])

  // Authenticated user UI
  const AuthenticatedApp = () => (
    <>
      <div className="xl:grid xl:grid-cols-6 xl:gap-2">
        <div className="sticky top-0 xl:col-span-1 navbar">
          <Navbar />
        </div>
        <div className="xl:col-span-5 xl:pr-4 p-2 pb-1">
          <Routes>
            <Route path="/finansify/dashboard" element={user && <Dashboard user={user} />} />
            <Route path="/finansify/expenses" element={user && <ExpensesFilters user={user} />} />
            <Route path="/finansify/reports" element={user && <Reports user={user} />} />
            <Route path="/finansify/settings" element={user && <Settings user={user} />} />

            <Route path="/finansify/login" element={<Navigate to="/finansify/dashboard" replace />} />
            <Route path="/finansify/register" element={<Navigate to="/finansify/dashboard" replace />} />
            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/finansify/dashboard" replace />} />
          </Routes>
        </div>
      </div>
    </>
  );

  // Unauthenticated user UI
  const UnauthenticatedApp = () => (
    <>
      <Routes>
        <Route path="/finansify/home" element={<Home/>}></Route>
        <Route path="/finansify/login" element={<Login/>} />
        <Route path="/finansify/register" element={<Register/>} />
        <Route path="/finansify/passwordRst" element={<PasswordRst/>} />
        <Route path="*" element={<Navigate to="/finansify/home" replace />} />
      </Routes>
    </>
  );

  return (
    <Router>
      {user ? <AuthenticatedApp /> : <UnauthenticatedApp />}
    </Router>
  );
}