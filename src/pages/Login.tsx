import {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {auth, provider, db} from "../firebase";
import {signInWithEmailAndPassword, signInWithPopup} from "firebase/auth";
import {doc, setDoc, getDocs, where, query, collection} from "firebase/firestore";
import {ConfigProvider, theme, Form, Input, Button} from "antd";

interface LoginProps {
  setLogOrReg: (val: boolean) => void;
}

export default function Login({setLogOrReg}: LoginProps) {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const navigate = useNavigate();

  function register() {
    setLogOrReg(false);
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
    <div>
      <h2>Login</h2>
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

          <Form.Item
            hasFeedback
            label="Password"
            name="password"
            validateFirst
            rules={[{required: true}]}>
            <Input.Password placeholder="Enter password" />
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            style={{fontWeight: "500", fontSize: "13px", marginBottom: '10px'}}
            block>
            Login
          </Button>

          <Button
            onClick={register}
            style={{fontWeight: "500", fontSize: "13px", marginBottom: '10px'}}
            type="primary"
            block>
            Register
          </Button>
          <Button
            icon={
              <img
                src="/src/assets/google-logo.png"
                alt="Google"
                style={{width: 20, height: 20, marginRight: 8, marginTop: 4}}
              />
            }
            style={{fontWeight: "500", fontSize: "13px", width: "100%"}}
            onClick={googleLogin}>
            Continue With Google
          </Button>
        </Form>
      </ConfigProvider>
    </div>
  );
}
