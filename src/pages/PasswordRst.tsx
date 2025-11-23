import {useState, useEffect} from "react";
import {Link} from "react-router-dom";
import {useNavigate} from "react-router-dom";
import {sendPasswordResetEmail} from "firebase/auth";
import {auth} from "../firebase";
import {ConfigProvider, theme, Form, Input, Button} from "antd";

export default function PasswordRst() {
  const [email, setEmail] = useState("");

  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    const isLocalhost = window.location.hostname === "localhost";
    const actionCodeSettings = {
      url: isLocalhost ? "http://localhost:3000/login" : "",
      handleCodeInApp: false,
    };

    try {
      await sendPasswordResetEmail(auth, values.email, actionCodeSettings);
    } catch (e: any) {
      console.log(e.message);
    }
    navigate("/login");
  };

  return (
    <div className="p-2.5" style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
      <p className="my-6" style={{fontSize: "25px", fontWeight: "500", color: "#1677FF"}}>
        <img
          src="/src/assets/blockchain.png"
          style={{
            width: "35px",
            marginRight: "8px",
            height: "35px",
            display: "inline",
          }}
          alt=""
        />
        Finansify
      </p>
      <div style={{width: "100%", maxWidth: "800px", padding: "6px"}}>
        <div className="heading" style={{textAlign: "center"}}>
          <h2>Password Reset 🔐</h2>
        </div>

        <p 
        className="mb-4 font-semibold" 
        style={{fontSize: "14px"}}>A link to reset your password will be sent to this Email.</p>

        <ConfigProvider
          theme={{
            algorithm: theme.darkAlgorithm, // 👈 Enables dark mode
          }}>
          <Form
            name="trigger"
            layout="vertical"
            onFinish={onFinish}
            autoComplete="on">
            <Form.Item
              hasFeedback
              label="Email"
              name="email"
              validateFirst
              rules={[{required: true, type: "email"}]}>
              <Input placeholder="Enter email" />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              style={{fontWeight: "500", fontSize: "13px", marginBottom: "10px"}}
              block>
              Submit
            </Button>
          </Form>
        </ConfigProvider>

        <Link to="/login" style={{fontSize: "14px"}}>Back to Login</Link>
      </div>
    </div>
  );
}
