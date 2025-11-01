import { Link } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

export default function Navbar() {
  return (
    <nav>
      <Link to="/">Dashboard</Link> | 
      <Link to="/income">Income</Link> | 
      <Link to="/expenses">Expenses</Link> | 
      <Link to="/reports">Reports</Link> | 
      <Link to="/settings">Settings</Link> | 
      <button onClick={() => signOut(auth)}>Logout</button>
    </nav>
  );
}
