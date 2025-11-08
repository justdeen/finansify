import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, provider, db } from "../firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export default function Login({setLogOrReg}) {
  const [date, setDate] = useState({start: getFirstDayOfMonth(), end: getLastDayOfMonth()});
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  function register() {
    setLogOrReg(false)
  }

  async function login() {
    await signInWithEmailAndPassword(auth, email, password);
    navigate("/");
  }

  async function googleLogin() {
    try {
      console.log('first')
      const res = await signInWithPopup(auth, provider);
      console.log('second')
      const user = result.user;

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
    } catch (error) {
      console.error("Google sign-in error:", error.message);
    }
  }

  function getFirstDayOfMonth() {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  }

  function getLastDayOfMonth() {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
  }

  return (
    <div>
      <h2>Login</h2>
      <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} type="email" name="email" autoComplete="email"/>
      <input placeholder="Password" onChange={(e) => setPassword(e.target.value)} type="text" name="password" autoComplete="password" />
      <button onClick={login}>Login</button>

      <button onClick={register}>Register</button>
      <button onClick={googleLogin}>Login with Google</button>
    </div>
  );
}
