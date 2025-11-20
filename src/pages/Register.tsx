import {useState} from "react";
import {useNavigate} from "react-router-dom";
import { Link } from "react-router-dom";
import {auth, provider, db} from "../firebase";
import {signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup} from "firebase/auth";
import {doc, setDoc, where, query, collection, getDocs} from "firebase/firestore";
import {ConfigProvider, theme, Form, Input, Button, message} from "antd";

interface RegisterProps {
  setLogOrReg: (val: string) => void;
}

export default function register() {
  const navigate = useNavigate();

  const [messageApi, contextHolder] = message.useMessage();
  message.config({
    top: 100,
    duration: 2,
  });
  
   const invalidEmail = () => {
    messageApi.open({
      type: 'error',
      content: 'Email already in use!',
      // className: 'custom-class',
      style: {
        marginTop: '6vh',
        
      },
    });
  };

  // const onFinish = async (values: any) => {
  //   const userCred = await createUserWithEmailAndPassword(auth, values.email, values.password);
  //   await setDoc(doc(db, "users", userCred.user.uid), {
  //     firstName: values.firstName,
  //     lastName: values.lastName,
  //     email: values.email,
  //     expenses: [],
  //   });
  //   navigate("/");
  // };

  const onFinish = async (values: any) => {
    try {const userCred = await createUserWithEmailAndPassword(auth, values.email, values.password);
    await setDoc(doc(db, "users", userCred.user.uid), {
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      expenses: [],
    });
    navigate("/");} catch{invalidEmail();}
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
    // setLogOrReg("log");
  }

  return (
    <div className="p-2.5" style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
      <ConfigProvider theme={{
          algorithm: theme.darkAlgorithm, // 👈 Enables dark mode
        }}>
        <div style={{zIndex: "999999"}}>{contextHolder}</div>
      </ConfigProvider>
      <p className="my-6" style={{fontSize: "25px", fontWeight: "500", color: "#1677FF"}}>
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
      <div style={{width: "100%", maxWidth: "800px", padding: "6px"}}>
        <div className="heading" style={{textAlign: "center"}}>
          <h2>Create an account 📝</h2>
        </div>
        <ConfigProvider
          theme={{
            algorithm: theme.darkAlgorithm, // 👈 Enables dark mode
          }}>
          <Form
            // form={form}
            name="trigger"
            // style={{maxWidth: 600}}
            layout="vertical"
            onFinish={onFinish}
            autoComplete="on">
            <Form.Item
              hasFeedback
              label={<span style={{fontSize: "14px"}}>First Name</span>}
              name="firstName"
              validateFirst
              rules={[{required: true, min: 2}]}>
              <Input style={{height: "37px", fontSize: "14px"}} placeholder="Enter First Name" />
            </Form.Item>
            <Form.Item
              hasFeedback
              label={<span style={{fontSize: "14px"}}>Last Name</span>}
              name="lastName"
              validateFirst
              rules={[{required: true, min: 2}]}>
              <Input style={{height: "37px", fontSize: "14px"}} placeholder="Enter Last Name" />
            </Form.Item>
            <Form.Item
              hasFeedback
              label={<span style={{fontSize: "14px"}}>Email</span>}
              name="email"
              validateFirst
              rules={[{required: true, type: "email"}]}>
              <Input style={{height: "37px", fontSize: "14px"}} placeholder="Enter email" />
            </Form.Item>
            <Form.Item
              hasFeedback
              label={<span style={{fontSize: "14px"}}>Password</span>}
              name="password"
              validateFirst
              rules={[{required: true}]}>
              <Input.Password
                style={{height: "37px", fontSize: "14px"}}
                placeholder="Enter password"
              />
            </Form.Item>
            <Button
              style={{
                fontWeight: "500",
                fontSize: "14px",
                height: "37px",
                marginBottom: "10px",
                outline: "none",
              }}
              type="primary"
              htmlType="submit"
              block>
              Register
            </Button>
            <Link to="/login">
              <Button
                // onClick={register}
                style={{
                  fontWeight: "500",
                  fontSize: "14px",
                  height: "37px",
                  marginBottom: "10px",
                  outline: "none",
                }}
                type="primary"
                block>
                Login
              </Button>
            </Link>
            {/* <Button
              onClick={login}
              type="primary"
              style={{fontWeight: "500", fontSize: "13px", marginBottom: "10px"}}
              block>
              Login
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
