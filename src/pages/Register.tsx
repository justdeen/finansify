import {useState} from "react";
import {useNavigate} from "react-router-dom";
import {auth, provider, db} from "../firebase";
import {signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup} from "firebase/auth";
import {doc, setDoc, where, query, collection, getDocs} from "firebase/firestore";
import {ConfigProvider, theme, Form, Input, Button} from "antd";

interface RegisterProps {
  setLogOrReg: (val: boolean) => void;
}

export default function register({setLogOrReg}: RegisterProps) {
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    const userCred = await createUserWithEmailAndPassword(auth, values.email, values.password);
    await setDoc(doc(db, "users", userCred.user.uid), {
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      expenses: [],
    });
    navigate("/");
  };

  async function googleLogin() {
    const res = await signInWithPopup(auth, provider);

    const q = query(collection(db, "users"), where("email", "==", res.user.email));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      const userDoc = doc(db, "users", res.user.uid);
      await setDoc(
        userDoc,
        {
          firstName: res.user.displayName?.split(" ")[0] || "",
          lastName: res.user.displayName?.split(" ")[1] || "",
          email: res.user.email,
          expenses: [],
        },
        {merge: true}
      );
    }
    navigate("/");
  }

  function login() {
    setLogOrReg(true);
  }

  return (
    <div>
      <h2>Register</h2>
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
            label="First Name"
            name="firstName"
            validateFirst
            rules={[{required: true, min: 2}]}>
            <Input placeholder="Enter First Name" />
          </Form.Item>

          <Form.Item
            hasFeedback
            label="Last Name"
            name="lastName"
            validateFirst
            rules={[{required: true, min: 2}]}>
            <Input placeholder="Enter Last Name" />
          </Form.Item>

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
            style={{fontWeight: "500", fontSize: "13px", marginBottom: "10px"}}
            type="primary"
            htmlType="submit"
            block>
            Register
          </Button>

          <Button
            onClick={login}
            type="primary"
            style={{fontWeight: "500", fontSize: "13px", marginBottom: "10px"}}
            block>
            Login
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
