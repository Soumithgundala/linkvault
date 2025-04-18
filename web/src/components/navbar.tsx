import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";

function Navbar() {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setShowDropdown(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="logo-container" onClick={() => window.location.href = "/"}>
        <Image
          src="/linkvault-logo.svg.png" // Path to your logo image
          alt="Linkvault Logo"
          width={40} 
          height={40}
          className="your-class"
        />
        </div>
        <h1 className="Title-Linkvault">LinkVault</h1>
        <div className="dropdown-button" onClick={handleDropdown}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="dropdown-icon">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </div>
        <Link href="/view" className="view-link">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="view-icon">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm0 18a6 6 0 100-12 6 6 0 000 12z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
           </svg>
          View    
        </Link>


        {showDropdown && (
          <div className="dropdown" ref={dropdownRef}>
            <Link href="/login" className="dropdown-link">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="dropdown-svg">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2z" />
              </svg>
              Login
            </Link>
            <Link href="/signup" className="dropdown-link">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="dropdown-svg">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-9h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Sign Up
            </Link>
            <Link href="/profile" className="dropdown-link">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="dropdown-svg">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c3.066 0 5.856 1.655 7.952 4.496M12 16a13.937 13.937 0 01-3.885-4.508 13.937 13.937 0 01-7.952-4.496" />
              </svg>
              Profile
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
