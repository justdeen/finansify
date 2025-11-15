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
import PasswordRst from "./pages/PasswordRst";
import { User } from "firebase/auth";
import "./App.css"

export default function App() {
  const [user, setUser] = useState<User | any>(() => {
    const currUser = localStorage.getItem('user')
    return currUser ? currUser : null;
  });
  // const [logOrReg, setLogOrReg] = useState<boolean>(true);

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
        <div className="xl:col-span-5 p-2 pb-1">
          <Routes>
            <Route path="/" element={user && <Dashboard user={user} />} />
            <Route path="/expenses" element={user && <ExpensesFilters user={user} />} />
            <Route path="/reports" element={user && <Reports user={user} />} />
            <Route path="/settings" element={user && <Settings user={user} />} />
          </Routes>
        </div>
      </div>
    </>
  );

  // Unauthenticated user UI
  const UnauthenticatedApp = () => (
    <>
      {/* <Login/> */}
      <Routes>
        <Route path="*" element={<Login/>} />
        <Route path="/login" element={<Login/>} />
        <Route path="/register" element={<Register/>} />
        <Route path="/passwordRst" element={<PasswordRst/>} />
      </Routes>
      {/* {logOrReg ? <Login setLogOrReg={setLogOrReg} /> : <Register setLogOrReg={setLogOrReg} />} */}
    </>
  );

  return (
    <Router>
      {user ? <AuthenticatedApp /> : <UnauthenticatedApp />}
    </Router>
  );
}