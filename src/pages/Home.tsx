import {useState, useEffect} from "react";
import { Link } from "react-router-dom";
import {useNavigate} from "react-router-dom";
import { Button, ConfigProvider, theme, Tag } from "antd";
import "./Home.css"

export default function Home(){
    const navigate = useNavigate();

    return (
      <div >
        <div className="flex justify-between py-4 px-4">
          <p style={{fontSize: "20px", fontWeight: "500", color: "#1677FF"}}>
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
            <span className="sm:inline hidden">Finansify</span>
          </p>
          <ConfigProvider
            theme={{
              algorithm: theme.darkAlgorithm, // 👈 Enables dark mode
            }}>
            <Button style={{borderRadius: "40px", padding: "2px 17px", outline: "none"}} variant="outlined" color="primary">
              <Link className="signin" to="/login">
                Sign In
              </Link>
            </Button>
          </ConfigProvider>
        </div>

        <div className="flex flex-col justify-center p-4">
          <p 
          style={{
            fontSize: "50px", 
            fontWeight: "700", 
            color: "#1677FF", 
            textAlign: "center",
            marginBottom: "10px"
            }}>
            <img
              onContextMenu={(e) => e.preventDefault()}
              className="rotate"
              src="/src/assets/blockchain.png"
              style={{
                width: "200px",
                height: "200px",
                display: "inline",
              }}
              alt=""
            />
          </p>
          <p className="track text-center font-bold text-4xl">Track Better</p>
          <p className="spend text-center font-bold text-4xl mb-5">Spend Smarter</p>
          <div className="text-center font-light sub">Analyze your monthly spending with charts and categories all in one place.</div>
          
          <ConfigProvider
            theme={{
              algorithm: theme.darkAlgorithm, // 👈 Enables dark mode
            }}>
            <div className="text-center mt-9">
              <Button
                style={{borderRadius: "40px", padding: "20px"}}
                variant="solid"
                color="primary">
                <Link to="/register" style={{fontSize: "14px"}}>
                  <span className="getstarted">Get Started</span>
                </Link>
              </Button>
            </div>
          </ConfigProvider>
        </div>
      </div>
    );
}