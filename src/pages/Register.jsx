import {useState} from "react";
import { useNavigate } from "react-router-dom";
import {auth, provider, db} from "../firebase";
import {signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup} from "firebase/auth";
import {doc, setDoc} from "firebase/firestore";

export default function register({setLogOrReg}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const navigate = useNavigate();
  
  async function registerUser() {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, "users", userCred.user.uid), {
      firstName,
      lastName,
      email,
      income: [],
      expenses: [],
    });
    navigate("/");
  }

  async function googleLogin() {
    const res = await signInWithPopup(auth, provider);
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
    // navigate("/");
  }

  function login() {
    setLogOrReg(true);
  }

  return (
    <div>
      <h2>Register</h2>
      <input placeholder="First Name" onChange={(e) => setFirstName(e.target.value)} type="text" name="firstName" autoComplete="firstName" required/>
      <input placeholder="Last Name" onChange={(e) => setLastName(e.target.value)} type="text" />
      <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} type="email" name="email" autoComplete="email" required/>
      <input placeholder="Password" onChange={(e) => setPassword(e.target.value)} type="text" required/>
      <button onClick={registerUser}>Register</button>

      <button onClick={login}>Login</button>
      <button onClick={googleLogin}>Login with Google</button>
    </div>
  );
}
