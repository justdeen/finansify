import {useState, useEffect} from "react";
import { Link } from "react-router-dom";
import {useNavigate} from "react-router-dom";

export default function Home(){
    const navigate = useNavigate();

    return(
        <div>
            <h2>Home Page</h2>

            <Link to="/login">Sign In</Link>
            <Link to="/register">Get started</Link>
        </div>
    )
}