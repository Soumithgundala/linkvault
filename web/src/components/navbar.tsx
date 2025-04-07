// src/components/Navbar.tsx
import Link from "next/link";
import "@/styles/globals.css"; 

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <div className="navbar-logo">LinkVault</div>
        <div className="space-x-4">
          <Link
            href="/signup"
            className="navbar-button navbar-button-signup"
          >
            Sign Up
          </Link>
          <Link
            href="/login"
            className="navbar-button navbar-button-login"
          >
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
}
