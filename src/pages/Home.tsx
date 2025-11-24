import {useState, useEffect} from "react";
import { Link } from "react-router-dom";
import {useNavigate} from "react-router-dom";
import { Button, ConfigProvider, theme, Tag } from "antd";
import "./Home.css"
import blockchainIcon from "../assets/blockchain.png"

export default function Home(){
    const navigate = useNavigate();

    return (
      <div >
        <div className="flex justify-between py-4 px-4">
          <p style={{fontSize: "20px", fontWeight: "500", color: "#1677FF"}}>
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
            <span className="sm:inline hidden">Finansify</span>
          </p>
          <ConfigProvider
            theme={{
              algorithm: theme.darkAlgorithm, // 👈 Enables dark mode
            }}>
            <Link className="signin" to="/financify/login">
            <Button style={{borderRadius: "40px", padding: "2px 17px", outline: "none"}} variant="outlined" color="primary">
              
                Sign In
              
            </Button>
            </Link>
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
              src={blockchainIcon}
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
              <Link to="/financify/register" style={{}}>
              <Button
                style={{borderRadius: "40px", padding: "20px", fontSize: "14px", outline: "none"}}
                variant="solid"
                color="primary">
                
                  <span className="getstarted">Get Started</span>
                
              </Button>
              </Link>
            </div>
          </ConfigProvider>
        </div>
      </div>
    );
}