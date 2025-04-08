import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/firebase"; // Firebase configuration
import "@/styles/globals.css" // CSS for styling
import "@/styles/account.css";
import Link from "next/link";
import Navbar from "@/components/navbar"; // Reusable Navbar component

export default function SignUp() {
  // State variables for form inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [instagram, setInstagram] = useState("");
  const [twitter, setTwitter] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Function to handle user signup
  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent default form submission behavior
    try {
      // Create a new user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save additional user data to Firestore
      await setDoc(doc(db, "users", user.uid), {
        username: username.toLowerCase(),
        socialLinks: { instagram, twitter },
        createdAt: new Date(),
      });

      // Redirect or show success message here (e.g., navigate to login or profile page)
      alert("Account created successfully! Please log in.");
    } catch (error: unknown) {
      // Handle errors during signup
      const err = error as { code: string; message: string };
      if (err.code === "auth/email-already-in-use") {
        setErrorMessage("This email is already registered. Please log in or use a different email.");
      } else if (err.code === "auth/weak-password") {
        setErrorMessage("Password is too weak. Please use a stronger password.");
      } else {
        console.error("Error signing up:", err);
        setErrorMessage("An error occurred during signup. Please try again.");
      }
    }
  };

  return (
    <>
      {/* Navbar at the top */}
      <Navbar />

      {/* Signup page container */}
      <div className="signup-background">
        <div className="signup-card">
          <h1 className="signup-title">Create Your Account</h1>

          {/* Signup form */}
          <form onSubmit={handleSignUp} className="signup-form">
            {/* Email input */}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="signup-input"
              required
            />

            {/* Password input */}
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="signup-input"
              required
            />

            {/* Username input */}
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="signup-input"
              required
            />

            {/* Instagram link input */}
            <input
              type="url"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              placeholder="Instagram Link"
              className="signup-input"
            />

            {/* Twitter link input */}
            <input
              type="url"
              value={twitter}
              onChange={(e) => setTwitter(e.target.value)}
              placeholder="Twitter Link"
              className="signup-input"
            />

            {/* Link to login page */}
            <Link href="/login" className="signin-link">
              Already have an account? Sign In
            </Link>

            {/* Submit button */}
            <button type="submit" className="signup-button">
              Sign Up
            </button>
          </form>

          {/* Error message display */}
          {errorMessage && <p className="error-message">{errorMessage}</p>}
        </div>
      </div>
    </>
  );
}