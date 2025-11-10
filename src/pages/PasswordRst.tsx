import {useState, useEffect} from "react";
import { Link } from "react-router-dom";
import {useNavigate} from "react-router-dom";
import {sendPasswordResetEmail} from "firebase/auth"
import {auth} from "../firebase"

export default function PasswordRst() {

  const [email, setEmail] = useState("")

  const navigate = useNavigate();

  const handleReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const isLocalhost = window.location.hostname === "localhost"
    const actionCodeSettings = {
        url: isLocalhost ? "http://localhost:3000/login" : "",
        handleCodeInApp: false,
    }

    try{
        await sendPasswordResetEmail(auth, email, actionCodeSettings);
    } catch (e: any){
        console.log(e.message)
    }
    navigate("/login");
  };

  return (
    <div>
      <h2>Password Reset</h2>

      <p>A link to reset your password will be sent to this email.</p>

      <form onSubmit={handleReset}>
        <label htmlFor="email">Email</label>
        <input value={email} type="email" id="email" onChange={(e) => setEmail(e.target.value)} />
        <button type="submit">Submit</button>
      </form>

      <Link to="/login">Back to Login</Link>
      
    </div>
  );
}
