import { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { doc, updateDoc, getDoc, deleteDoc } from "firebase/firestore";
import { deleteUser, updateEmail, updatePassword, reauthenticateWithPopup, GoogleAuthProvider } from "firebase/auth";

export default function Settings({ user }) {
  const [data, setData] = useState({ firstName: "", lastName: "", email: "", password: "" });

  useEffect(() => {
    const fetchData = async () => {
      const docRef = doc(db, "users", user.uid);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const res = snap.data();
        setData({...data, firstName: res.firstName})
      }
    };
    fetchData();
  }, []);

  async function saveChanges() {
    const user = auth.currentUser
    const provider = new GoogleAuthProvider();
    await reauthenticateWithPopup(user, provider)

    if (data.password) await updatePassword(auth.currentUser, data.password);
    await updateDoc(doc(db, "users", user.uid), {
      firstName: data.firstName,
      lastName: data.lastName,
    });
    alert("Updated!");
  }

  async function deleteAccount(){
    const user = auth.currentUser
    const provider = new GoogleAuthProvider();
    await reauthenticateWithPopup(user, provider)

    await deleteDoc(doc(db, "users", user.uid))
    await deleteUser(user)
  }

  return (
    <div>
      <h2>Settings</h2>
      <input placeholder="First Name" value={data.firstName} onChange={e => setData({...data, firstName: e.target.value})} />
      <input placeholder="Last Name" onChange={e => setData({...data, lastName: e.target.value})} />
      <input placeholder="New Password" onChange={e => setData({...data, password: e.target.value})} />
      <button onClick={saveChanges}>Save Changes</button>
      <button onClick={deleteAccount}>Delete Account</button>
    </div>
  );
}
