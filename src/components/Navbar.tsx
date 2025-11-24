import {Link, useLocation} from "react-router-dom";
import {signOut} from "firebase/auth";
import {auth} from "../firebase";
import { useState, useEffect } from "react";
import "./Navbar.css"
import blockchainIcon from "../assets/blockchain.png";
import dashboardIcon from "../assets/dashboard.png";
import expensesIcon from "../assets/expenses.png";
import reportIcon from "../assets/report.png";
import settingIcon from "../assets/setting.png";
import menuIcon from "../assets/menu.png";
import closeIcon from "../assets/close.png";
import powerOffIcon from "../assets/power-off.png";


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
            src={blockchainIcon}
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
            <Link to="/finansify/dashboard" className={`navLink ${isActive("/finansify/dashboard") ? "activeNavLink" : ""}`}>
              <img
                src={dashboardIcon}
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
              to="/finansify/expenses"
              className={`navLink ${isActive("/finansify/expenses") ? "activeNavLink" : ""}`}>
              <img
                src={expensesIcon}
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
              to="/finansify/reports"
              className={`navLink ${isActive("/finansify/reports") ? "activeNavLink" : ""}`}>
              <img
                src={reportIcon}
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
              to="/finansify/settings"
              className={`navLink ${isActive("/finansify/settings") ? "activeNavLink" : ""}`}>
              <img
                src={settingIcon}
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
        <Link to="/finansify/home" className="logout" onClick={() => signOut(auth)}>
          <img
            src={powerOffIcon}
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
              src={blockchainIcon}
              style={{
                width: "26px",
                marginRight: "5px",
                marginTop: '-4px',
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
              Finansify
            </div>
          </div>
          <button className="menu" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <img
              onContextMenu={(e) => e.preventDefault()}
              src={menuIcon}
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
                src={blockchainIcon}
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
                  src={closeIcon}
                  style={{
                    width: "15px",
                    height: "15px",
                  }}
                  alt=""
                />
              </button>
            </p>
            <Link
              className={`navLink ${isActive("/finansify/dashboard") ? "activeNavLink" : ""}`}
              to="/finansify/dashboard"
              onClick={() => setIsMenuOpen(false)}>
              <img
                onContextMenu={(e) => e.preventDefault()}
                src={dashboardIcon}
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
              className={`navLink ${isActive("/finansify/expenses") ? "activeNavLink" : ""}`}
              to="/finansify/expenses"
              onClick={() => setIsMenuOpen(false)}>
              <img
                onContextMenu={(e) => e.preventDefault()}
                src={expensesIcon}
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
              className={`navLink ${isActive("/finansify/reports") ? "activeNavLink" : ""}`}
              to="/finansify/reports"
              onClick={() => setIsMenuOpen(false)}>
              <img
                onContextMenu={(e) => e.preventDefault()}
                src={reportIcon}
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
              className={`navLink ${isActive("/finansify/settings") ? "activeNavLink" : ""}`}
              to="/finansify/settings"
              onClick={() => {
                setIsMenuOpen(false);
              }}>
              <img
                onContextMenu={(e) => e.preventDefault()}
                src={settingIcon}
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
              to="/finansify/home"
              className="logout2"
              onClick={() => {
                setIsMenuOpen(false);
                signOut(auth);
              }}>
              <img
                onContextMenu={(e) => e.preventDefault()}
                src={powerOffIcon}
                style={{width: "20px", marginRight: "10px", height: "20px", display: "inline"}}
                alt=""
              />
              Logout
            </Link>
          </nav>
        </div>
      </div>
    </div>
  );
}
