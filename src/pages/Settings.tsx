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
import { ConfigProvider, theme, Form, Input } from 'antd';

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

  useEffect(() => {
    const fetchData = async () => {
      const docRef = doc(db, "users", user.uid);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const res = snap.data();
        setData({
          ...data,
          firstName: res.firstName,
          email: res.email,
        });
      }
      const checkPasswordChange = user.providerData.some(
        (provider: any) => provider.providerId === "password"
      );
      if (checkPasswordChange) setCanChangePassword(true);
    };
    fetchData();
  }, []);

  async function saveChanges() {
    const currUser = auth.currentUser;
    if(!currUser) return
    await updateDoc(doc(db, "users", currUser.uid), {
      firstName: data.firstName,
      lastName: data.lastName,
    });
    alert("Updated!");
  }

  const saveNewPassword = async () => {
    const credential = EmailAuthProvider.credential(user.email, data.oldPassword);
    await reauthenticateWithCredential(user, credential);
    if (data.newPassword) await updatePassword(auth.currentUser!, data.newPassword);
    setChangePassword(false);
    alert("Password Changed!");
  };

  const handlePasswordChange = async () => {
    setChangePassword(true);
    if (changePassword) setChangePassword(false);
  };

  async function deleteAccount() {
    const user = auth.currentUser;
    const provider = new GoogleAuthProvider();
    if(!user) return
    await reauthenticateWithPopup(user, provider);
    await deleteDoc(doc(db, "users", user.uid));
    await deleteUser(user);
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setData({...data, firstName: value });
    form.setFieldValue("field_a", value); // sync AntD form
  };

  return (
    <div>
      <h2>Settings</h2>
      <p>{data.email}</p>
      <label htmlFor="firstName">First Name</label>
      <input
        id="firstName"
        placeholder="First Name"
        value={data.firstName}
        onChange={(e) =>
          setData({
            ...data,
            firstName: e.target.value,
          })
        }
      />
      <br />
      <label htmlFor="lastName">Last Name</label>
      <input
        id="lastName"
        placeholder="Last Name"
        onChange={(e) =>
          setData({
            ...data,
            lastName: e.target.value,
          })
        }
      />
      <br />
      <button onClick={saveChanges}>Save Changes</button>
      <button onClick={deleteAccount}>Delete Account</button>
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
          <label htmlFor="newPassword">New Password (optional)</label>
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
        </div>
      )}

      <ConfigProvider
        theme={{
          algorithm: theme.darkAlgorithm, // 👈 Enables dark mode
        }}>
        <Form
          form={form}
          initialValues={{field_a: data.firstName}}
          name="trigger"
          style={{maxWidth: 600}}
          layout="vertical"
          autoComplete="off">
          <Form.Item hasFeedback label="Field A" name="field_a" validateFirst rules={[{min: 3}]}>
            <Input
              placeholder="Validate required onBlur"
              // value={data.firstName}
              // onChange={handleInputChange}
            />
          </Form.Item>
        </Form>
      </ConfigProvider>
    </div>
  );
}
