import { useState } from "react";
import { auth, db } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";
import { updateEmail, updatePassword } from "firebase/auth";

export default function Settings({ user }) {
  const [data, setData] = useState({ firstName: "", lastName: "", email: "", password: "" });

  async function saveChanges() {
    if (data.email) await updateEmail(auth.currentUser, data.email);
    if (data.password) await updatePassword(auth.currentUser, data.password);
    await updateDoc(doc(db, "users", user.uid), {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email || user.email
    });
    alert("Updated!");
  }

  return (
    <div>
      <h2>Settings</h2>
      <input placeholder="First Name" onChange={e => setData({...data, firstName: e.target.value})} />
      <input placeholder="Last Name" onChange={e => setData({...data, lastName: e.target.value})} />
      <input placeholder="Email" onChange={e => setData({...data, email: e.target.value})} />
      <input placeholder="New Password" onChange={e => setData({...data, password: e.target.value})} />
      <button onClick={saveChanges}>Save Changes</button>
    </div>
  );
}
