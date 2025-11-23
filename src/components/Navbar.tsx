import {Link, useLocation} from "react-router-dom";
import {signOut} from "firebase/auth";
import {auth} from "../firebase";
import { useState, useEffect } from "react";
import "./Navbar.css"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false); 

  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="sticky top-0" style={{width: "100%"}}>
      <div className="hidden xl:block navcon">
        <p
          className="mb-10 pl-2 pt-2"
          style={{fontSize: "20px", fontWeight: "500", color: "#1677FF"}}>
          <img
            src="/src/assets/blockchain.png"
            style={{
              width: "30px",
              marginRight: "8px",
              marginBottom: "2px",
              height: "30px",
              display: "inline",
            }}
            alt=""
          />
          Finansify
        </p>
        <nav className="flex flex-col nav1">
          <div className="nav1con">
            <Link to="/" className={`navLink ${isActive("/") ? "activeNavLink" : ""}`}>
              <img
                src="/src/assets/dashboard.png"
                style={{
                  width: "20px",
                  marginRight: "8px",
                  marginBottom: "2px",
                  height: "20px",
                  display: "inline",
                }}
                alt=""
              />
              Dashboard
            </Link>
            <Link
              to="/expenses"
              className={`navLink ${isActive("/expenses") ? "activeNavLink" : ""}`}>
              <img
                src="/src/assets/expenses.png"
                style={{
                  width: "20px",
                  marginRight: "8px",
                  marginBottom: "2px",
                  height: "20px",
                  display: "inline",
                }}
                alt=""
              />
              Expenses
            </Link>
            <Link
              to="/reports"
              className={`navLink ${isActive("/reports") ? "activeNavLink" : ""}`}>
              <img
                src="/src/assets/report.png"
                style={{
                  width: "20px",
                  marginRight: "8px",
                  marginBottom: "2px",
                  height: "20px",
                  display: "inline",
                }}
                alt=""
              />
              Reports
            </Link>
            <Link
              to="/settings"
              className={`navLink ${isActive("/settings") ? "activeNavLink" : ""}`}>
              <img
                src="/src/assets/setting.png"
                style={{
                  width: "20px",
                  marginRight: "8px",
                  marginBottom: "2px",
                  height: "20px",
                  display: "inline",
                }}
                alt=""
              />
              Settings
            </Link>
          </div>
        </nav>
        <Link to="/home" className="logout" onClick={() => signOut(auth)}>
          <img
            src="/src/assets/power-off.png"
            style={{width: "20px", marginRight: "8px", height: "20px", display: "inline"}}
            alt=""
          />
          Logout
        </Link>
      </div>

      <div className="xl:hidden">
        <div className="navbar px-4 py-2">
          <div style={{marginTop: '5px'}}>
            <img
              onContextMenu={(e) => e.preventDefault()}
              src="/src/assets/blockchain.png"
              style={{
                width: "26px",
                marginRight: "5px",
                marginTop: '-4px',
                // marginBottom: "3px",
                height: "26px",
                display: "inline",
              }}
              alt=""
            />
            <div
              style={{
                fontSize: "17px",
                fontWeight: "500",
                color: "#1677FF",
                display: "inline",
              }}>
              Financify
            </div>
          </div>
          <button className="menu" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <img
              onContextMenu={(e) => e.preventDefault()}
              src="/src/assets/menu.png"
              style={{
                width: "30px",
                height: "30px",
              }}
              alt=""
            />
          </button>
        </div>
        <div className={`mobile-menu ${isMenuOpen ? "mobile-menu-open" : ""}`}>
          <nav className="flex flex-col  nav2">
            <p
              className="mb-8 mt-8 pl-2 pt-2"
              style={{fontSize: "20px", fontWeight: "500", color: "#1677FF"}}>
              <img
                onContextMenu={(e) => e.preventDefault()}
                src="/src/assets/blockchain.png"
                style={{
                  width: "30px",
                  marginRight: "8px",
                  marginBottom: "2px",
                  height: "30px",
                  display: "inline",
                }}
                alt=""
              />
              Finansify
              <button
                className="cancelBtn"
                style={{
                  float: "right",
                  marginTop: "-2px",
                  marginLeft: "10px",
                  padding: "10px 10px",
                  fontSize: "15px",
                  background: "none",
                }}
                onClick={() => setIsMenuOpen(false)}>
                <img
                  onContextMenu={(e) => e.preventDefault()}
                  src="/src/assets/close.png"
                  style={{
                    width: "15px",
                    height: "15px",
                  }}
                  alt=""
                />
              </button>
            </p>
            <Link
              className={`navLink ${isActive("/") ? "activeNavLink" : ""}`}
              to="/"
              onClick={() => setIsMenuOpen(false)}>
              <img
                onContextMenu={(e) => e.preventDefault()}
                src="/src/assets/dashboard.png"
                style={{
                  width: "20px",
                  marginRight: "10px",
                  marginBottom: "3px",
                  height: "20px",
                  display: "inline",
                }}
                alt=""
              />
              Dashboard
            </Link>

            <Link
              className={`navLink ${isActive("/expenses") ? "activeNavLink" : ""}`}
              to="/expenses"
              onClick={() => setIsMenuOpen(false)}>
              <img
                onContextMenu={(e) => e.preventDefault()}
                src="/src/assets/expenses.png"
                style={{
                  width: "20px",
                  marginRight: "10px",
                  marginBottom: "2px",
                  height: "20px",
                  display: "inline",
                }}
                alt=""
              />
              Expenses
            </Link>

            <Link
              className={`navLink ${isActive("/reports") ? "activeNavLink" : ""}`}
              to="/reports"
              onClick={() => setIsMenuOpen(false)}>
              <img
                onContextMenu={(e) => e.preventDefault()}
                src="/src/assets/report.png"
                style={{
                  width: "20px",
                  marginRight: "10px",
                  marginBottom: "2px",
                  height: "20px",
                  display: "inline",
                }}
                alt=""
              />
              Reports
            </Link>

            <Link
              className={`navLink ${isActive("/settings") ? "activeNavLink" : ""}`}
              to="/settings"
              onClick={() => {
                setIsMenuOpen(false);
              }}>
              <img
                onContextMenu={(e) => e.preventDefault()}
                src="/src/assets/setting.png"
                style={{
                  width: "20px",
                  marginRight: "10px",
                  marginBottom: "2px",
                  height: "20px",
                  display: "inline",
                }}
                alt=""
              />
              Settings
            </Link>

            <Link
              to="/login"
              className="logout2"
              onClick={() => {
                setIsMenuOpen(false);
                signOut(auth);
              }}>
              <img
                onContextMenu={(e) => e.preventDefault()}
                src="/src/assets/power-off.png"
                style={{width: "20px", marginRight: "10px", height: "20px", display: "inline"}}
                alt=""
              />
              Logout
            </Link>
            {/* <button onClick={() => setIsMenuOpen(false)}>Close</button> */}
          </nav>
        </div>
      </div>
    </div>
  );
}
