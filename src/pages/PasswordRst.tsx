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

  // const handleReset = async (e: React.FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();

  //   const isLocalhost = window.location.hostname === "localhost";
  //   const actionCodeSettings = {
  //     url: isLocalhost ? "http://localhost:3000/login" : "",
  //     handleCodeInApp: false,
  //   };

  //   try {
  //     await sendPasswordResetEmail(auth, email, actionCodeSettings);
  //   } catch (e: any) {
  //     console.log(e.message);
  //   }
  //   navigate("/login");
  // };

  return (
    <div>
      <h2>Password Reset</h2>

      <p>A link to reset your password will be sent to this email.</p>

      {/* <form onSubmit={handleReset}>
        <label htmlFor="email">Email</label>
        <input value={email} type="email" id="email" onChange={(e) => setEmail(e.target.value)} />
        <button type="submit">Submit</button>
      </form> */}

      <ConfigProvider
        theme={{
          algorithm: theme.darkAlgorithm, // 👈 Enables dark mode
        }}>
        <Form
          // form={form}
          name="trigger"
          style={{maxWidth: 600}}
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

      <Link to="/login">Back to Login</Link>
    </div>
  );
}
