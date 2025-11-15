import { Link } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

export default function Navbar() {
  return (
    <div className="sticky top-0">
      <nav className="flex flex-col ">
        <Link to="/">Dashboard</Link>
        <Link to="/expenses">Expenses</Link>
        <Link to="/reports">Reports</Link>
        <Link to="/settings">Settings</Link>
        <Link to="/login"><button onClick={() => signOut(auth)}>Logout</button></Link>
      </nav>
    </div>
  );
}
