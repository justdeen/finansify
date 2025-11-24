import {useState, useEffect, ChangeEvent} from "react";
import {auth, db, provider} from "../firebase";
import {doc, updateDoc, getDoc, deleteDoc} from "firebase/firestore";
import {
  deleteUser,
  updateEmail,
  updatePassword,
  updateProfile,
  reauthenticateWithPopup,
  EmailAuthProvider,
  GoogleAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import { ConfigProvider, theme, Form, Input, Button, Tag, message, Spin } from 'antd';
import {useNavigate} from "react-router-dom";
import './Settings.css'
import settingIcon from "../assets/setting.png"

interface SettingsProps {
  user: any; // You can make this more strict if you have a User type
}

// ✅ State type
interface UserData {
  firstName: string;
  lastName: string;
  oldPassword: string;
  newPassword: string;
  email: string;
}

export default function Settings({user}: SettingsProps) {
  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    oldPassword: "",
    newPassword: "",
    email: "",
  });
  const [canChangePassword, setCanChangePassword] = useState(false);
  const [changePassword, setChangePassword] = useState(false);
  const [form] = Form.useForm();
  const [delAccForm] = Form.useForm();
  const [deleteAccWithPw, setDeleteAccWithPw] = useState("")
  const [deleteAccForm, setDeleteAccForm] = useState(false)
  const [confirmAccDelete, setConfirmAccDelete] = useState(false)
  const [loadState, setLoadState] = useState(true)

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const docRef = doc(db, "users", user.uid);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const res = snap.data();
        setData({
          ...data,
          firstName: res.firstName,
          lastName: res.lastName,
          email: res.email,
        });
        form.setFieldsValue({ firstName: res.firstName, lastName: res.lastName });
      }
      const checkPasswordChange = user.providerData.some(
        (provider: any) => provider.providerId === "password"
      );
      if (checkPasswordChange) setCanChangePassword(true);
      setLoadState(false)
    };
    if(typeof user !== 'string')fetchData();
  }, []);

  const [messageApi, contextHolder] = message.useMessage();
  message.config({
    top: 100,
    duration: 2,
  });
  
   const profileToast = () => {
    messageApi.open({
      type: 'success',
      content: 'Changes saved!',
      // className: 'custom-class',
      style: {
        marginTop: '6vh',
        
      },
    });
  };
   
  const pwToast = () => {
    messageApi.open({
      type: 'success',
      content: 'Password changed!',
      // className: 'custom-class',
      style: {
        marginTop: '6vh',
        
      },
    });
  };
  
  const deleteAccSucc = () => {
    messageApi.open({
      type: 'success',
      content: 'Goodbye!',
      // className: 'custom-class',
      style: {
        marginTop: '6vh',
        
      },
    });
  };
  
  
  const deleteAccToast = () => {
    messageApi.open({
      type: 'error',
      content: 'Wrong password!',
      // className: 'custom-class',
      style: {
        marginTop: '6vh',
        
      },
    });
  };
  
  const oldPwErr = () => {
    messageApi.open({
      type: 'error',
      content: 'Old password incorrect!',
      // className: 'custom-class',
      style: {
        marginTop: '6vh',
        
      },
    });
  };

  const saveNewPassword = async (values: any) => {
    try {
    setLoadState(true)
    const credential = EmailAuthProvider.credential(user.email, values.oldPassword);
    await reauthenticateWithCredential(user, credential);
    if (data.newPassword) await updatePassword(auth.currentUser!, values.newPassword);
    setChangePassword(false);
    pwToast()
    } catch (e){
      oldPwErr();
    } finally {
      setLoadState(false)
    }
  };

  const handlePasswordChange = async () => {
    setChangePassword(true);
    // if (changePassword) setChangePassword(false);
  };

  const cancelPassword = () => {
    setChangePassword(false)
  }

  // First popup for acc deletion
  function deleteAccountReq() {
    setConfirmAccDelete(true)
  }

  // Closes first popup for acc deletion
  function accDeleteFalse() {
    setConfirmAccDelete(false)
  }

  // Opens second popup for acc deletion
  async function accDeleteTrue() {
    const user = auth.currentUser;
    if (!user) return;
    const isGoogleProvider = user.providerData.some(
      (provider: any) => provider.providerId === "google.com"
    );
    const isPasswordProvider = user.providerData.some(
      (provider: any) => provider.providerId === "password"
    );
    setConfirmAccDelete(false)
    if (isGoogleProvider) {
      const provider = new GoogleAuthProvider();
      await reauthenticateWithPopup(user, provider);
      await deleteUser(user);
      await deleteDoc(doc(db, "users", user.uid));
      alert("Account deleted successfully.");
    } else if (isPasswordProvider) {
      setDeleteAccForm(true)
    }
  }

  // Closes second popup for acc deletion
  function cancelAccDelete() {
    setDeleteAccForm(false)
    setDeleteAccWithPw("")
  }

  async function handleAccDelete(values: any) {
    const user = auth.currentUser;
    if (!user) return;

    try {
      setLoadState(true)
      const credential = EmailAuthProvider.credential(user.email!, values.password);
      await reauthenticateWithCredential(user, credential);
      await deleteUser(user);
      await deleteDoc(doc(db, "users", user.uid));
      // alert("Account deleted successfully.");
      navigate("/login")
    } catch (error) {
      console.error("Error deleting account:", error);
      deleteAccToast();
    } finally {
      setDeleteAccForm(false);
      setDeleteAccWithPw("");
      setLoadState(false)
    }
  }

  async function deleteAccount() {
    
  }

  const onFinish = async (values: any) => {
    const currUser = auth.currentUser;
    if(!currUser) return
    if (data.firstName === values.firstName && data.lastName === values.lastName) {
      return;
    } else {
      setLoadState(true)
      await updateDoc(doc(db, "users", currUser.uid), {
        firstName: values.firstName,
        lastName: values.lastName,
      });
      setData({...data, firstName: values.firstName, lastName: values.lastName});
      setLoadState(false)
      profileToast();
    }
  };

  return (
    <div className="px-2">
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
      <h2 style={{display: "flex", justifyContent: "space-between", alignItems: 'center'}} className="heading">
        <span>Settings</span>
        <img
          onContextMenu={(e) => e.preventDefault()}
          src={settingIcon}
          style={{
            width: "26px",
            height: "26px",
            display: "inline",
            marginLeft: "10px",
          }}
          alt=""
        />
      </h2>

      <ConfigProvider theme={{
          algorithm: theme.darkAlgorithm, // 👈 Enables dark mode
        }}>
        <Tag 
        color="blue"
        style={{fontSize: "14px", marginBottom: "15px", padding: "5px 7px"}}>
          {data.email}
        </Tag>
      </ConfigProvider>

      <ConfigProvider
        theme={{
          algorithm: theme.darkAlgorithm, // 👈 Enables dark mode
        }}>
        <Form
          form={form}
          initialValues={{firstName: data.firstName, lastName: data.lastName}}
          name="trigger"
          style={{maxWidth: 1440}}
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off">
          <Form.Item
            hasFeedback
            label={<span style={{fontSize: "14px"}}>First Name</span>}
            name="firstName"
            validateFirst
            rules={[{required: true, min: 2}]}>
            <Input placeholder="Enter First Name" style={{height: "37px", fontSize: "14px"}} />
          </Form.Item>
          <Form.Item
            hasFeedback
            label={<span style={{fontSize: "14px"}}>Last Name</span>}
            name="lastName"
            validateFirst
            rules={[{required: true, min: 2}]}>
            <Input placeholder="Enter Last Name" style={{height: "37px", fontSize: "14px"}} />
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            style={{outline: "none", height: "37px", fontSize: "14px", border: "none"}}
            block>
            Submit
          </Button>
        </Form>
      </ConfigProvider>
      <br />

      <ConfigProvider
        theme={{
          algorithm: theme.darkAlgorithm, // 👈 Enables dark mode
        }}>
        <Button
          variant="filled"
          color="danger"
          onClick={deleteAccountReq}
          style={{outline: "none", border: "none", height: "37px", fontSize: "14px"}}>
          Delete Account
        </Button>
        {canChangePassword && (
          <Button
            variant="filled"
            color="cyan"
            onClick={handlePasswordChange}
            // type="primary"
            style={{
              outline: "none",
              border: "none",
              height: "37px",
              fontSize: "14px",
              marginLeft: "10px",
            }}>
            Change Password
          </Button>
        )}
        {deleteAccForm && (
          <div className="deleteAcc">
            <Form className="popup2" onFinish={handleAccDelete} layout="vertical">
              <Form.Item
                hasFeedback
                label={<span style={{fontSize: "14px"}}>Password</span>}
                name="password"
                validateFirst
                rules={[{required: true}]}>
                <Input.Password
                  placeholder="Enter password"
                  style={{height: "37px", fontSize: "14px"}}
                />
              </Form.Item>

              <div style={{marginTop: "0px"}}>
                <Button 
                htmlType="button"
                variant="outlined"
                color="danger" 
                onClick={cancelAccDelete} 
                style={{height: "37px", outline: "none",}}>
                  Cancel
                </Button>
                <Button
                variant="solid"
                color="danger" 
                htmlType="submit" 
                style={{height: "37px", outline: "none", border: "none"}}>
                  Delete Account
                </Button>
              </div>
            </Form>
          </div>
        )}
      </ConfigProvider>
      {confirmAccDelete && (
        <div className="confirmAccDelete">
          <div className="popup2">
            <p>Are you sure you want to delete your account?</p>
            <div>
              <ConfigProvider
                theme={{
                  algorithm: theme.darkAlgorithm, // 👈 Enables dark mode
                }}>
                <Button 
                style={{outline: "none", border:"none", height: "37px", fontSize: "15px",}} 
                onClick={accDeleteFalse} 
                variant="solid" 
                color="danger">
                  No
                </Button>
                <Button 
                variant="solid" 
                style={{marginLeft: "10px", height: "37px", fontSize: "15px", outline: "none", border:"none"}} 
                color="cyan" 
                onClick={accDeleteTrue}>
                  Yes
                </Button>
              </ConfigProvider>
            </div>
          </div>
        </div>
      )}

      <br />
      <br />

      {canChangePassword && changePassword && (
        <div style={{marginTop: "20px"}}>
          <ConfigProvider
            theme={{
              algorithm: theme.darkAlgorithm, // 👈 Enables dark mode
            }}>
            <Form 
            onFinish={saveNewPassword} 
            layout="vertical"
            style={{marginBottom: "12px"}}>
              <Form.Item
                hasFeedback
                label={<span style={{fontSize: "14px"}}>Old Password</span>}
                name="oldPassword"
                validateFirst
                rules={[{required: true}]}>
                <Input.Password
                  placeholder="Enter old password"
                  style={{height: "37px", fontSize: "14px"}}
                />
              </Form.Item>

              <Form.Item
                hasFeedback
                label={<span style={{fontSize: "14px"}}>New Password</span>}
                name="newPassword"
                validateFirst
                rules={[{required: true}]}>
                <Input.Password
                  placeholder="Enter new password"
                  style={{height: "37px", fontSize: "14px"}}
                />
              </Form.Item>

              <Button 
              htmlType="submit" 
              variant="solid" 
              color="primary"
              style={{ border: "none", outline: "none", height: "37px"}}>
                Save Password
              </Button>

              <Button
                htmlType="button"
                onClick={cancelPassword}
                variant="solid"
                color="danger"
                // type="primary"
                style={{marginLeft: "15px", border: "none", outline: "none", height: "37px"}}>
                Cancel
              </Button>
            </Form>
          </ConfigProvider>
        </div>
      )}
    </div>
  );
}
