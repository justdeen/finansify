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
import { ConfigProvider, theme, Form, Input, Button } from 'antd';
import './Settings.css'

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
  const [deleteAccWithPw, setDeleteAccWithPw] = useState("")
  const [deleteAccForm, setDeleteAccForm] = useState(false)
  const [confirmAccDelete, setConfirmAccDelete] = useState(false)

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
    };
    fetchData();
  }, []);

  const saveNewPassword = async () => {
    const credential = EmailAuthProvider.credential(user.email, data.oldPassword);
    await reauthenticateWithCredential(user, credential);
    if (data.newPassword) await updatePassword(auth.currentUser!, data.newPassword);
    setChangePassword(false);
    alert("Password Changed!");
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

  async function handleAccDelete(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    deleteAccount();
  }

  async function deleteAccount() {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const credential = EmailAuthProvider.credential(user.email!, deleteAccWithPw);
      await reauthenticateWithCredential(user, credential);
      await deleteUser(user);
      await deleteDoc(doc(db, "users", user.uid));
      alert("Account deleted successfully.");
      // Optionally: sign out or redirect the user
    } catch (error) {
      console.error("Error deleting account:", error);
      alert("Failed to delete account. Please check your credentials and try again.");
    } finally {
      setDeleteAccForm(false);
      setDeleteAccWithPw("");
    }
  }

  const onFinish = async (values: any) => {
    const currUser = auth.currentUser;
    if(!currUser) return
    if (data.firstName === values.firstName && data.lastName === values.lastName) {
      return;
    } else {
      await updateDoc(doc(db, "users", currUser.uid), {
        firstName: values.firstName,
        lastName: values.lastName,
      });
      setData({...data, firstName: values.firstName, lastName: values.lastName});
      alert("Updated!");
    }
  };

  return (
    <div>
      <h2>Settings</h2>
      <p>{data.email}</p>
      <ConfigProvider
        theme={{
          algorithm: theme.darkAlgorithm, // 👈 Enables dark mode
        }}>
        <Form
          form={form}
          initialValues={{firstName: data.firstName, lastName: data.lastName}}
          name="trigger"
          style={{maxWidth: 600}}
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off">
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
          <Button type="primary" htmlType="submit" block>
            Submit
          </Button>
        </Form>
      </ConfigProvider>
      <br />

      <button onClick={deleteAccountReq}>Delete Account</button>
      {confirmAccDelete && <div className="confirmAccDelete">
        <p>Are you sure you want to delete your account?</p>
        <button onClick={accDeleteFalse}>No</button>
        <button onClick={accDeleteTrue}>Yes</button>
      </div>}
      {deleteAccForm && <div className="deleteAcc">
        <form className="popup2" onSubmit={handleAccDelete}>
          <label htmlFor="pw">Enter Password</label>
          <input id="pw" type="text" value={deleteAccWithPw} onChange={(e) => setDeleteAccWithPw(e.target.value)} placeholder="password" />
          <button type="button" onClick={cancelAccDelete}>Cancel</button>
          <button type="submit">Delete Account</button>
        </form>
      </div>}
      <br />
      <br />
      {canChangePassword && <button onClick={handlePasswordChange}>Change Password</button>}
      {canChangePassword && changePassword && (
        <div>
          <label htmlFor="oldPassword">Old Password</label>
          <input
            id="oldPassword"
            placeholder="Old Password"
            onChange={(e) =>
              setData({
                ...data,
                oldPassword: e.target.value,
              })
            }
          />
          <br />
          <label htmlFor="newPassword">New Password</label>
          <input
            id="newPassword"
            placeholder="New Password"
            onChange={(e) =>
              setData({
                ...data,
                newPassword: e.target.value,
              })
            }
          />
          <br />
          <button onClick={saveNewPassword}>Save Password</button>
          <button onClick={cancelPassword}>Cancel</button>
        </div>
      )}
    </div>
  );
}
