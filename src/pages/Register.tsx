import {useState} from "react";
import {useNavigate} from "react-router-dom";
import { Link } from "react-router-dom";
import {auth, provider, db} from "../firebase";
import {signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup} from "firebase/auth";
import {doc, setDoc, where, query, collection, getDocs} from "firebase/firestore";
import {ConfigProvider, theme, Form, Input, Button, message, Spin} from "antd";
import blockchainIcon from "../assets/blockchain.png"
import googleIcon from "../assets/google-logo.png"

interface RegisterProps {
  setLogOrReg: (val: string) => void;
}

export default function register() {
  const [loadState, setLoadState] = useState(false)
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
      style: {
        marginTop: '6vh',
        
      },
    });
  };

  const onFinish = async (values: any) => {
    try {
    setLoadState(true)
    const userCred = await createUserWithEmailAndPassword(auth, values.email, values.password);
    await setDoc(doc(db, "users", userCred.user.uid), {
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      expenses: [],
    });
    navigate("/financify/dashboard");} catch{invalidEmail();} finally {setLoadState(false)}
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
    navigate("/financify/dashboard");
  }

  return (
    <div className="p-2.5" style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
      {loadState && (<div className="flex justify-center spin">
        <div className="spinCont">
          <Spin size="large" />
        </div>
      </div>)}

      <ConfigProvider theme={{
          algorithm: theme.darkAlgorithm, // 👈 Enables dark mode
        }}>
        <div style={{zIndex: "999999"}}>{contextHolder}</div>
      </ConfigProvider>
      <p className="my-6" style={{fontSize: "25px", fontWeight: "500", color: "#1677FF"}}>
        <img
          onContextMenu={(e) => e.preventDefault()}
          src={blockchainIcon}
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
          <h2>Create an account 📝</h2>
        </div>
        <ConfigProvider
          theme={{
            algorithm: theme.darkAlgorithm, // 👈 Enables dark mode
          }}>
          <div className="text-sm mb-4">
            <Link to="/financify/home">Back to home</Link>
          </div>
          <Form
            name="trigger"
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
                  onContextMenu={(e) => e.preventDefault()}
                  src={googleIcon}
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
