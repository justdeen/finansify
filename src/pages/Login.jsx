import { useState } from "react";
import { auth, provider, db } from "../firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export default function Login() {
  const [date, setDate] = useState({start: getFirstDayOfMonth(), end: getLastDayOfMonth()});
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function register() {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, "users", userCred.user.uid), {
      firstName: "",
      lastName: "",
      email,
      income: [],
      expenses: [],
    });
  }

  async function login() {
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function googleLogin() {
    const res = await signInWithPopup(auth, provider);
    const userDoc = doc(db, "users", res.user.uid);
    await setDoc(userDoc, {
      firstName: res.user.displayName?.split(" ")[0] || "",
      lastName: res.user.displayName?.split(" ")[1] || "",
      email: res.user.email,
      income: [],
      expenses: [],
    }, { merge: true });
  }

  function getFirstDayOfMonth() {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  }

  function getLastDayOfMonth() {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
  }
  
  let test = new Date().toISOString()
  let test2 = new Date(test).getTime()

  console.log(new Date(getFirstDayOfMonth()).getTime())

  return (
    <div>
      <input type="date" name="" id="" value={date.start} onChange={(e) => setDate({...date, start: e.target.value})}/>
      <input type="date" name="" id="" value={date.end} onChange={(e) => setDate({...date, end: e.target.value})}/>
      <div>{test2}</div>
      <h2>Login / Register</h2>
      <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <input placeholder="Password" onChange={(e) => setPassword(e.target.value)} type="password" />
      <button onClick={login}>Login</button>
      <button onClick={register}>Register</button>
      <button onClick={googleLogin}>Login with Google</button>
    </div>
  );
}
