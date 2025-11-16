import {Link} from "react-router-dom";
import {signOut} from "firebase/auth";
import {auth} from "../firebase";
import { useState, useEffect } from "react";
import "./Navbar.css"


// console.log(isMenuOpen)

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false); 

  // useEffect(() => {
  //   setIsMenuOpen(false)
  // }, [])

  return (
    <div className="sticky top-0" style={{width: "100%"}}>
      <div className="hidden xl:block navcon">
        <p className="mb-20">Finansify</p>
        <nav className="flex flex-col nav1">
          <div className="nav1con">
            <Link to="/">Dashboard</Link>
            <Link to="/expenses">Expenses</Link>
            <Link to="/reports">Reports</Link>
            <Link to="/settings">Settings</Link>
          </div>
        </nav>
        <Link to="/login" className="logout">
          <button onClick={() => signOut(auth)}>Logout</button>
        </Link>
      </div>

      <div className="xl:hidden">
        <div className="navbar px-2">
          <span>Financify</span>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)}>menu</button>
        </div>
        <div className={`mobile-menu ${isMenuOpen ? "mobile-menu-open" : ""}`}>
          <nav className="flex flex-col  nav2">
            <Link to="/" onClick={() => setIsMenuOpen(false)}>
              Dashboard
            </Link>
            <Link to="/expenses" onClick={() => setIsMenuOpen(false)}>
              Expenses
            </Link>
            <Link to="/reports" onClick={() => setIsMenuOpen(false)}>
              Reports
            </Link>
            <Link
              to="/settings"
              onClick={() => {
                setIsMenuOpen(false);
              }}>
              Settings
            </Link>
            <Link to="/login">
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  signOut(auth);
                }}>
                Logout
              </button>
            </Link>
            {/* <button onClick={() => setIsMenuOpen(false)}>Close</button> */}
          </nav>
        </div>
      </div>
    </div>
  );
}
