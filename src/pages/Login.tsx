import {useState, useEffect} from "react";
import { Link } from "react-router-dom";
import {useNavigate} from "react-router-dom";
import {auth, provider, db} from "../firebase";
import {signInWithEmailAndPassword, signInWithPopup} from "firebase/auth";
import {doc, setDoc, getDocs, where, query, collection} from "firebase/firestore";
import {ConfigProvider, theme, Form, Input, Button} from "antd";

// interface LoginProps {
//   setLogOrReg: (val: string) => void;
//   setPasswordReset: (val: boolean) => void; 
// }

export default function Login() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const navigate = useNavigate();

  function register() {
    // setLogOrReg("reg");
  }

  async function googleLogin() {
    try {
      const res = await signInWithPopup(auth, provider);
      const user = res.user;

      // Check if user with this email already exists in Firestore
      const q = query(collection(db, "users"), where("email", "==", user.email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        const userDoc = doc(db, "users", res.user.uid);
        await setDoc(
          userDoc,
          {
            firstName: res.user.displayName?.split(" ")[0] || "",
            lastName: res.user.displayName?.split(" ")[1] || "",
            email: res.user.email,
            income: [],
            expenses: [],
          },
          {merge: true}
        );
        navigate("/");
      }
    } catch (error: any) {
      console.error("Google sign-in error:", error.message);
    }
  }

  const onFinish = async (values: any) => {
    await signInWithEmailAndPassword(auth, values.email, values.password);
    navigate("/");
  };

  return (
    <div className="p-2.5" style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
      <p
          className="my-6"
          style={{fontSize: "25px", fontWeight: "500", color: "#1677FF"}}>
          <img
            src="/src/assets/blockchain.png"
            style={{
              width: "35px",
              marginRight: "8px",
              // marginBottom: "2px",
              height: "35px",
              display: "inline",
            }}
            alt=""
          />
          Finansify
        </p>
      <div style={{ width: "100%", maxWidth: "800px", padding: "6px", }}>
        <div className="heading" style={{textAlign: "center"}}>
          <h2>Welcome back ✨</h2>
        </div>
        <ConfigProvider
          theme={{
            algorithm: theme.darkAlgorithm, // 👈 Enables dark mode
          }}>
          <Form
            // form={form}
            name="trigger"
            // style={{maxWidth: "600px"}}
            layout="vertical"
            onFinish={onFinish}
            autoComplete="on">
            <Form.Item
              hasFeedback
              label={<span style={{fontSize: "14px"}}>Email</span>}
              name="email"
              validateFirst
              rules={[{required: true, type: "email"}]}>
              <Input
              style={{height: "37px", fontSize: "14px"}}
              placeholder="Enter email" />
            </Form.Item>
            <Form.Item
              hasFeedback
              label={<span style={{fontSize: "14px"}}>Password</span>}
              name="password"
              validateFirst
              rules={[{required: true}]}>
              <Input.Password
              style={{height: "37px", fontSize: "14px"}}
              placeholder="Enter password" />
            </Form.Item>
            <Link to="/passwordRst">Forgot password?</Link>
        
            <Button
              type="primary"
              htmlType="submit"
              style={{fontWeight: "500", fontSize: "14px", marginBottom: "10px", marginTop: "10px", outline: "none"}}
              block>
              Login
            </Button>
            <Link to="/register">
              <Button
                // onClick={register}
                style={{fontWeight: "500", fontSize: "14px", marginBottom: "10px", outline: "none"}}
                type="primary"
                block>
                Register
              </Button>
            </Link>
            {/* <Button
              onClick={register}
              style={{fontWeight: "500", fontSize: "13px", marginBottom: '10px'}}
              type="primary"
              block>
              Register
            </Button> */}
            <Button
              icon={
                <img
                  src="/src/assets/google-logo.png"
                  alt="Google"
                  style={{width: 20, height: 20,}}
                />
              }
              style={{fontWeight: "500", fontSize: "14px", height: "37px", width: "100%"}}
              onClick={googleLogin}>
              Continue With Google
            </Button>
          </Form>
        </ConfigProvider>
      </div>
    </div>
  );
}
