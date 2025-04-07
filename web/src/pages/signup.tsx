// src/pages/SignUp.tsx
import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/firebase";
import "@/styles/account.css"; 

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [instagram, setInstagram] = useState("");
  const [twitter, setTwitter] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await setDoc(doc(db, "users", user.uid), {
        username: username.toLowerCase(),
        socialLinks: { instagram, twitter },
        createdAt: new Date(),
      });
      // Redirect or show success message here
    } catch (error: unknown) {
      const err = error as { code: string; message: string };
      if (err.code === "auth/email-already-in-use") {
        setErrorMessage("This email is already registered. Please log in or use a different email.");
      } else if (err.code === "permission-denied") {
        setErrorMessage("Permission denied. Please ensure you are logged in and try again.");
      } else {
        console.error("Error signing up:", err);
        setErrorMessage("An error occurred during signup. Please try again.");
      }
    }
  };

  return (
    <div className="signup-card">
      <h1 className="signup-title">Create Your Account</h1>
      <form onSubmit={handleSignUp} className="signup-form">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="signup-input"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="signup-input"
          required
        />
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          className="signup-input"
          required
        />
        <input
          type="url"
          value={instagram}
          onChange={(e) => setInstagram(e.target.value)}
          placeholder="Instagram Link"
          className="signup-input"
        />
        <input
          type="url"
          value={twitter}
          onChange={(e) => setTwitter(e.target.value)}
          placeholder="Twitter Link"
          className="signup-input"
        />
        <button type="submit" className="signup-button">
          Sign Up
        </button>
      </form>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
    </div>
  );
}
